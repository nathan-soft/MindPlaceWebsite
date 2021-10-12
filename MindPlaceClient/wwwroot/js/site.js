/////////////////////////////GLOBAL ////////////////////////////

//HIDE THE ACTIVE MODAL WHEN THE CANCEL BUTTON IS CLICKED.
let cancelButtons = document.querySelectorAll(".cancel");
if (cancelButtons.length) {
    cancelButtons.forEach(cancelButton => {
        let form = getParentForm(cancelButton);
        cancelButton.addEventListener("click", function (e) {
            e.preventDefault();
            //reset the form
            let form = getParentForm(cancelButton);
            form.reset();
            clearFormFieldsValidationErrors(form);
            //hide the modal
            closeModal();
        });
    });
}

//////////////////////////////////////////////////////REGISTER PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("public/register")) {
    document.querySelectorAll(".signup-tab a").forEach(ele => {
        ele.addEventListener("click", function (e) {
            e.preventDefault();
            //get the anchor content which represents the type of user to be created e.g Client or Professional.
            let typeOfUser = ele.textContent;
            let parentLi = ele.parentElement;
            if (!parentLi.classList.contains("current")) {
                //get which button was clicked.
                let prevActiveLi;
                if (typeOfUser == "User") {
                    //Patient or User button was clicked
                    prevActiveLi = parentLi.nextElementSibling;
                } else {
                    //professional button was clicked
                    prevActiveLi = parentLi.previousElementSibling;
                }

                //remove current from other li element
                prevActiveLi.classList.remove("current");
                //make the clicked element's parent active
                parentLi.classList.add("current");

                //change value of role input to match the value of clicked button
                document.querySelector('input[id$="Role"]').value = typeOfUser;
            }
        });
    });
}


//////////////////////////////////////////////////////DASBOARD PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("dashboard")) {

    setInterval(refreshQuestionsAndCommentsTimestamp, 60000);

    //SUBMIT NEW QUESTION FORM.
    document.getElementById("questionForm").addEventListener("submit", (async function (e) {
        e.preventDefault();
        let formElem = this;

        //check if there are fields with error messages.
        if (formElem.querySelector("span.field-validation-error") != null) {
            clearFormFieldsValidationErrors(formElem);
        }
        
        //get url
        let url = formElem.getAttribute("action");

        //presence of form action means the form is being updated/deleted.
        if (formElem.querySelector("button").textContent == "Update") {
            url = formElem.querySelector("button").formAction;
        }

        //serialize the form
        let formData = new URLSearchParams(new FormData(formElem)).toString();

        let response = await sendPostRequest(url, formData).catch(function (error) {
            if (error.message.includes("An error occurred")) {
                //custom error thrown inside the function.
                //showAlert(error.message.replace("Error: ", ""));
                alert(error.message.replace("Error: ", ""));
            } else {
                //showAlert("A connection error occurred. please check your network and try again.");
                alert("A connection error occurred. please check your network and try again.");
            }
        });

        if (response) {
            if (response.success) {
                //success.
                //close the modal
                //$("#fieldOfExpertise").modal("hide");
                location.reload();
            } else {
                if (response.errorType) {
                    //model error occurred.
                    console.log(response.errorModel);
                    response.errorModel.forEach(function (item, index) {
                        //get the field with a wrong value.
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + capitalizeFirstLetter(item.key) + '"]');
                        errorSpan.classList.remove("field-validation-valid");
                        errorSpan.classList.add("field-validation-error");
                        //show the first error from list of errors.
                        errorSpan.textContent = item.errors[0];
                    });
                } else {
                    //close the modal
                    //$("#fieldOfExpertise").modal("hide");
                    //show error msg.
                    //showAlert(response.message);
                    alert(response.message);
                }
            }
        }
    }));


    //TAKING ACTION ON A QUESTION
    document.querySelectorAll("ul.ed-options li a").forEach(ele => {
        ele.addEventListener("click", (async function () {
            //get question/Post 
            var questionPost = ele.closest(".post-bar");
            //Get the form in the question modal.
            let form = document.getElementById("questionForm");

            /////EDIT THE QUESTION.
            if (ele.textContent == "Edit") {
                //get question title
                let questionTitle = questionPost.querySelector(".job_descp > h3").textContent.trim();
                //get question description
                let questionDesc = questionPost.querySelector(".job_descp > p").textContent.trim();

                //set the value of the title input
                form.querySelector("input").value = questionTitle;
                //set the value of the description input
                form.querySelector("textarea").value = questionDesc;
                //change the text of the submit button
                let button = form.querySelector("button");
                button.textContent = "Update";
                //override where to submit the form.
                button.formAction = `${window.location.pathname}/EditQuestion?questionId=${questionPost.id.split("_")[1]}`;

                //show the ask question modal
                showQuestionModal();

            } else if (ele.textContent == "Delete") {///////////DELETE THE QUESTION
                let formData = new FormData();
                formData.append("questionId", `${questionPost.id.split("_")[1]}`);
                formData.append("__RequestVerificationToken", form.querySelector("input[name=__RequestVerificationToken]").value);

                //set url...
                let url = `${window.location.pathname}/DeleteQuestion`;
                //send request
                let response = await sendPostRequest(url, new URLSearchParams(formData).toString()).catch(function (error) {
                    if (error.message.includes("An error occurred")) {
                        //custom error thrown inside the function.
                        alert(error.message.replace("Error: ", ""));
                    } else {
                        alert("A connection error occurred. please check your network and try again.");
                    }
                });

                if (response) {
                    if (response.success) {
                        //success.
                        alert("Question Deleted.");
                        location.reload();
                    } else {
                        if (response.errorType) {
                            //model error occurred.;
                            response.errorModel.forEach(function (item, index) {
                                let errorSpan;
                                //get the field with a wrong value.
                                if (ele.textContent == "Edit") {
                                    errorSpan = formElem.querySelector('span[data-valmsg-for="' + capitalizeFirstLetter(item.key) + '"]');
                                }

                                errorSpan = formElem.querySelector('span[data-valmsg-for="' + item.key + '"]');
                                errorSpan.classList.remove("field-validation-valid");
                                errorSpan.classList.add("field-validation-error");
                                //show the first error from list of errors.
                                errorSpan.textContent = item.errors[0];
                            });
                        } else {
                            //close the modal
                            //$("#fieldOfExpertise").modal("hide");
                            //show error msg.
                            alert(response.message);
                        }
                    }
                }
            }

            //closes the option box
            questionPost.querySelector(".ed-options").classList.remove("active");
        }));
    });

    //LOAD COMMENTS
    document.querySelectorAll(".like-com li .com").forEach(ele => {
        ele.addEventListener("click", (async function () {
            //get number of comment(s)
            let commentCount = ele.textContent.trim().split(" ")[1];
            if (!ele.classList.contains("comment-loaded") && commentCount >= 1) {
                //get question id from the top-most parent of this element.
                let questionId = 0;
                let questionBox = ele.parentElement;

                while (true) {
                    if (questionBox.classList.contains("post-bar")) {
                        //get the question Id.
                        questionId = questionBox.id.split("_")[1];
                        //end loop.
                        break;
                    }
                    //get next parent element..
                    questionBox = questionBox.parentElement;
                };

                //show comment container
                questionBox.querySelector(".commentsContainer").classList.remove("d-none");
                //show spinner/loader.
                let commentWrapper = questionBox.querySelector(".comments-wrapper");
                showLoader(commentWrapper);

                let url;
                if (location.pathname.toLowerCase().includes("dashboard")) {
                    url = `${location.pathname}/LoadComments?questionId=${questionId}`;
                }

                let response = await sendGetRequest(url).catch((error) => {
                    if (error.message.includes("An error occurred:")) {
                        //custom error thrown inside the function.
                        alert(error.message.replace("Error: ", ""));
                    } else {
                        alert("A connection error occurred. please check your network and try again.");
                    }
                });

                if (response) {
                    if (response.success) {
                        //GETTING COMMENTS FOR A QUESTION.
                        let comments = response.data;
                        let commentList = "";
                        //check that data returned is not an empty array
                        if (Array.isArray(comments) && comments.length) {
                            comments.forEach(commentDetails => {
                                commentList += `<div id="${commentDetails.questionId}_${commentDetails.id}" class="comments mt-3 text-justify border-0">`;
                                commentList += `<img src="https://i.imgur.com/yTFUilP.jpg" class="rounded-circle" width="40" height="40" />`;
                                commentList += `<h3>${commentDetails.user.fullName}</h3>`;
                                commentList += `<span class="small" data-date-string="${commentDetails.createdOn}">`;
                                commentList += `${moment(`${commentDetails.createdOn}`).calendar()}`;
                                commentList += `</span>`;
                                commentList += `<p>${commentDetails.content}</p>`;
                                commentList += `</div>`;
                            });

                            //Hide loader
                            hideLoader(commentWrapper);
                            //append to div
                            commentWrapper.insertAdjacentHTML("beforeend", commentList);

                            //mark as loaded comment
                            ele.classList.add("comment-loaded");
                            return;
                        }
                    } else {
                        //response contains error(s).
                        //display error
                        alert(response.message);
                    }
                }

                //hide comment container
                questionBox.querySelector(".commentsContainer").classList.add("d-none");
            }
        }));
    });

    //disable all post comment buttons
    document.querySelectorAll("button.btnPostComment").forEach(ele => ele.disabled = true);

    //typing a comment.
    document.querySelectorAll(".commentInput").forEach(ele => {
        ele.addEventListener("keyup", function (e) {
            //Disable the use of enter key on comment input fields.
            if (e.code == "Enter") {
                e.preventDefault();
                return false;
            }
            //get the content of the input after trimming white-spaces
            if (ele.value.trim().length >= 1) {
                //enable submit button if it's still disabled.
                if (ele.nextElementSibling.disabled) {
                    ele.nextElementSibling.disabled = false;
                }
            } else {
                //disable submit button if it's enabled.
                if (!ele.nextElementSibling.disabled) {
                    ele.nextElementSibling.disabled = true;
                }
            }
        });
    });

    //Submitting a comment
    document.querySelectorAll(".comment_box form").forEach(form => {
        form.addEventListener("submit", (async function (e) {
            e.preventDefault();
            //get questionId
            let questionId = form.id.split("_")[1];
            //get comment
            let comment = form.querySelector(".commentInput").value.trim();
            //submit form
            var response = await postNewComment(questionId, form);

            if (response) {
                if (response.success) {
                    //success.
                    //create new comment
                    let now = moment();
                    let newComment = "<div class='comments mt-3 text-justify border-0'>";
                    newComment += "<img src ='https://i.imgur.com/yTFUilP.jpg' alt='Profile Image' class='rounded-circle' width ='40' height ='40'/>";
                    newComment += "<h3>Jhon Doe</h3>";
                    newComment += `<span class='small' data-date-string='${now.format("YYYY-MM-DDTHH:mm:ss")}'>${now.fromNow()}</span>`;
                    newComment += `<p>${comment}</p>`;
                    newComment += "</div>";

                    //Append to DOM
                    let questionBox = document.getElementById(`question_${questionId}`);
                    questionBox.querySelector(".comments-wrapper").insertAdjacentHTML("afterbegin", newComment);
                    //increment the total number of comment being displayed.
                    let commentCountLink = questionBox.querySelector(".like-com li .com");
                    
                    //get number of comment(s)
                    let commentCount = commentCountLink.textContent.trim().split(" ")[1];
                    //increase by 1
                    commentCountLink.innerHTML = `<i class="fas fa-comment-alt"></i> Comments ${++commentCount}`;
                    //reset the form
                    form.reset();
                    form.querySelector("button").disabled = true;
                } else {
                    if (response.errorType) {
                        //model error occurred.
                        let errors;set
                        response.errorModel.forEach(function (item, index) {
                            //get the first error from each field/property list of errors.
                            errors += "\n" + item.errors[0];
                        });
                        alert(errors);
                    } else {
                        //error
                        alert(response.message);
                    }
                }
            }
        }));
    });

    //LOAD TOP PROFESSIONALS
    document.addEventListener("DOMContentLoaded", (async function () {
        //get top professionals
        let response = await GetTopProfessionals();

        //get slider Wrapper
        let sliderWrapper = document.querySelector(".profiles-slider");
        let topProfessionalsSection = document.querySelector(".top-profiles");
        if (response) {
            if (response.success) {
                let professionals = response.data;

                if (Array.isArray(professionals) && professionals.length) {
                    //initialize variable
                    let professional = "";
                    professionals.forEach(profInfo => {
                        professional += `<div id="prof_${profInfo.username}" class="user-profy">`;
                        professional += `<img src="/images/resources/user1.png" alt="">`;
                        professional += `<h3>${profInfo.fullName}</h3>`;
                        professional += `<ul><li><a href="#" title="" class="followw">Subscribe</a></li></ul>`;
                        professional += `<a href="#" class="view-more-pro">`;
                        professional += `View Profile`;
                        professional += `<div class="card custom-tooltip shadow align-items-center">`;
                        professional += `<div class="image-Wrapper">`;
                        professional += `<img class="rounded-circle" src="/assets/img/user1.png" alt="">`;
                        professional += `</div>`;
                        professional += `<div class="user-info flex-column justify-content-center">`;
                        professional += `<h4 class="card-title d-flex flex-wrap mb-2">`;
                        professional += `${profInfo.fullName}`;
                        professional += `</h4>`;
                        professional += `</div>`;
                        professional += `</div>`;
                        professional += `</a>`;
                        professional += `</div>`;
                    });

                    sliderWrapper.insertAdjacentHTML("beforeend", professional);

                    //remove loader/spinner from page;
                    sliderWrapper.previousElementSibling.remove();
                    //show slick slider wrapper
                    sliderWrapper.classList.remove("d-none");
                    initializeSlickSlider();
                    return;
                } 
            } else {
                //error
                alert(response.message);
            }
        }
        //if we got here, an error happened somewhere.
        //check that the variable is not null.
        //could be null if the page is being accessed by a "professional".
        if (topProfessionalsSection) {
            //hide the section
            topProfessionalsSection.classList.add("d-none");
        }
        
    }));

    //SUBSCRIBING TO A PROFESSIONAL FROM THE DASHBOARD PAGE
    document.body.addEventListener('click', (async function (e) {
        let ele = e.target;
        if (ele.classList.contains("followw")) {
            e.preventDefault();
            //get element Top parent
            let topParentContainer = getNearestParent(ele, "user-profy");
            //get username from id property/attribute
            let username = topParentContainer.id.substring(5);

            let formElem = document.querySelector("form");
            //submit form
            let response = await sendSubscriptionRequest("/professionals", formElem, username);

            if (response) {
                if (response.success) {
                    //get top professionals list
                    let sliderContainer = topParentContainer.parentElement;
                    //get professional List Container
                    let sponsoredProfessionalsBox = sliderContainer.parentElement;
                    //remove professional from page
                    topParentContainer.remove();
                    //notify user.
                    alert("Subscription request sent.");
                    //check if no of professionals on page.
                    // less than 2 because there's a form element on the page that counts as child
                    if (sliderContainer.children.length < 2) {
                        let emptyStateText = `<h2 class="align-middle text-black-50 text-center col-12">No Professional Found.</h2>`;
                        professionalListWrapper.insertAdjacentHTML("afterbegin", emptyStateText)
                    }
                } else {
                    //error
                    alert(response.message);
                }
            }
        }
    }));







    
}


//////////////////////////////////////////////////////PROFESSIONALS PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("professionals")) {
    document.querySelectorAll(".follow").forEach(ele => {
        //following a professional(clicking on the button).
        ele.addEventListener("click", (async function (e) {
            e.preventDefault();
            //get element parent
            let parentBox = ele.parentElement;
            while (true) {
                if (parentBox.classList.contains("company_profile_info")) {
                    //end loop
                    break;
                }
                parentBox = parentBox.parentElement;
            }
            //get username from id property/attribute
            let username = parentBox.id.substring(5);

            let formElem = document.querySelector("form");
            //serialize the form
            let formData = new FormData(formElem);
            formData.append("usernameOfProfessional", username);
            let serializedForm = new URLSearchParams(formData).toString();

            //submit form
            let response = await sendPostRequest("/Professionals", serializedForm).catch((error) => {
                if (error.message.includes("An error occurred:")) {
                    //custom error thrown inside the function.
                    alert(error.message.replace("Error: ", ""));
                } else {
                    alert("A connection error occurred. please check your network and try again.");
                }
            });

            if (response) {
                if (response.success) {
                    //get container.
                    let professionalContainer = parentBox.parentElement;
                    //get professional List Container
                    let professionalListWrapper = professionalContainer.parentElement;
                    //remove professional from page
                    professionalContainer.remove();
                    //notify user.
                    alert("Subscription request sent.");
                    //check if no of professionals on page.
                    // less than 2 because there's a form element on the page that counts as child
                    if (professionalListWrapper.children.length < 2) {
                        let emptyStateText = `<h2 class="align-middle text-black-50 text-center col-12">No Professional Found.</h2>`;
                        professionalListWrapper.insertAdjacentHTML("afterbegin", emptyStateText)
                    }
                } else {
                    //error
                    alert(response.message);
                }
            }
        }));
    });
}


//////////////////////////////////////////////////////FORUM PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("forum")) {
    let form = document.getElementById("forumForm");

    //==========================Close Forum Modal================================//
    form.querySelector(".cancel").addEventListener("click", function () {
        $("#question-box").removeClass("open");
        $(".wrapper").removeClass("overlay");
        //hide suggestion box
        form.querySelector(".tags-container__suggestion-box").classList.add("d-none");
        //clear the tag box
        form.querySelectorAll(".tags-container .tag .tag__close-button").forEach(ele => {
            ele.click();
        });
    });

    //==========================Filter Questions================================//
    document.querySelectorAll(".forum-nav .nav-link, .forum-nav .dropdown-item").forEach(item => {
        item.addEventListener("click", function (e) {
            //stop the anchor from directing to another page;
            e.preventDefault();
            //get the text content of the anchor element;
            let filterTxt = e.target.textContent.trim();
            let searchText;
            var queryString = location.search.toLowerCase().trim();

            let urlQueryParams = new URLSearchParams();
            if (queryString.includes("searchtext")) {
                //attempt to get searchText parameter from query string
                // Further parsing
                let params = new URLSearchParams(queryString);
                searchText = params.get("searchtext");
                //append to url query string
                urlQueryParams.append("searchText", searchText);
            }
            //append filterText
            urlQueryParams.append("filterText", filterTxt);

            var url = `${location.protocol}//${location.host}${location.pathname}?${urlQueryParams.toString()}`;
            //reload
            location.assign(url);
            //if (item.parentElement.classList.contains("nav-item")) {
            //    let anchorParent = item.parentElement;
            //    //remove active from anchor parent sibling;
            //    anchorParent.parentElement.querySelector("li.active").classList.remove("active");
            //    //mark anchor parent as active
            //    anchorParent.classList.add("active");
            //}
        });
    });

    //==========================Make The Tag Input Active When The Container Is Clicked On================================//
    form.querySelector(".tags-container").addEventListener("click", function () {
        this.querySelector("input").focus();
    });

    //==========================Toggle the suggestion box/div================================//
    let tags = [];
    form.querySelector(".tags-container input").addEventListener("keyup", (async function (e) {
        let searchPhrase = this.value.trim().toLowerCase();
        let suggestionBox = form.querySelector(".tags-container__suggestion-box");
        if (searchPhrase.length >= 1) {
            let matchingTags = [];
            //fetch tag list from db or local variable.
            if (tags.length >= 1) {
                //fetch from local variable
                //get tags that match the input value.
                matchingTags = getMatchingTagNames(searchPhrase);
            } else {
                //fetch from db/API
                let response = await getTags().catch(error => {
                        displayMessage("Couldn't fetch tags because a server error occurred, please contact your system administrator.");
                    });
                if (Array.isArray(response)) {
                    //add tag names to the tags array.
                    tags = response.map(tag => tag.name);
                    //get tags that match the input value
                    matchingTags = getMatchingTagNames(searchPhrase);
                }
                //else
                //NOTE: the else part is meant to handle empty array, but i'm fairly certain there wouldn't be anytime that scenerio is ever encountered.
            }

            let taglistResult = "";
            if (matchingTags.length) {
                //matching tags found
                matchingTags.forEach(tag => {
                    taglistResult += `<span class="px-3 py-2 tags-container__suggestion-box__tag">${tag}</span>`;
                });
            } else {
                //no matching tag found
                taglistResult = `<p class="text-center py-2" style="font-size:16px;">No tag found.</p>`;
            }
           

            //remove previous appended childs.
            suggestionBox.innerHTML = "";
            //append to suggestion box
            suggestionBox.insertAdjacentHTML("afterbegin", taglistResult);
            //show suggestion box
            suggestionBox.classList.remove("d-none");
        } else {
            //hide suggestion box
            suggestionBox.classList.add("d-none");
        }



        function getMatchingTagNames(searchString) {
            return tags.filter(tag => tag.toLowerCase().includes(searchString));
        }
    }));

    

    //==========================Execute a Function When Someone Writes in the "tag" input field================================//
    form.querySelector(".tags-container input").addEventListener("keydown", function (e) {
        //let container = ele;
        let inputValue = this.value.trim();
        
        if (e.which == 13) {
            e.preventDefault();
            //enter key was pressed.
            //validate the text in the input
        }

        //if backspace was pressed.
        if (e.which == 8) {
            //check that there are no text/value in the input field
            //and that there are tags that have been added to the tags container div/element.
            if (inputValue.length < 1 && this.previousElementSibling) {
                //remove the last tag that was added, if any...
                this.previousElementSibling.remove();
            }
        }

    });

    //==========================Select a tag from the suggestion box===============================//
    form.querySelector(".tags-container__suggestion-box").addEventListener("click", function (e) {
        if (e.target.classList.contains("tags-container__suggestion-box__tag")) {
            let spanEle = e.target;
            let spanText = spanEle.textContent;
            let tagInput = form.querySelector(".tags-container input");

            if (spanText.length >= 1) {
                //make sure there's no duplicate tag
                //get all already selected tags
                let selectedTags = form.querySelectorAll(".tags-container .tag__name");
                //make sure there are selected tags...
                if (selectedTags.length) {
                    //loop through and check for duplicates
                    let duplicateExist = false;
                    for (var selectedTag of selectedTags) {
                        if (selectedTag.textContent.toLowerCase() == spanText.toLowerCase()) {
                            //duplicate
                            //exit loop and stop further code processing.
                            duplicateExist = true;
                            break;
                        }
                    }

                    if (duplicateExist) {
                        //reset the input
                        tagInput.value = "";
                        //close/hide the suggestion box
                        spanEle.parentElement.classList.add("d-none");
                        //exit out of current function
                        return;
                    }
                } 

                //create a tag container and append before the input.
                let div = document.createElement("DIV");
                div.classList.add("tag");
                //create and prepare the span that'll hold the tag name
                let tagNameContainer = document.createElement("SPAN");
                tagNameContainer.classList.add("tag__name", "mr-2");
                tagNameContainer.textContent = spanText;
                //create and prepare the span that'll hold the tag "close button"
                let buttonContainer = document.createElement("SPAN");
                buttonContainer.classList.add("fa", "fa-close", "tag__close-button");
                buttonContainer.style.fontSize = "15px";

                buttonContainer.addEventListener("click", function () {
                    div.remove();
                });

                //append to tag container.
                div.insertAdjacentElement("afterbegin", tagNameContainer);
                div.insertAdjacentElement("beforeend", buttonContainer);

                //append to DOM...
                tagInput.insertAdjacentElement("beforebegin", div);
                //reset the input
                tagInput.value = "";
            }

            //close/hide the suggestion box
            spanEle.parentElement.classList.add("d-none");
        }
    });
}




//////////////////////////////////////////////////////SETTINGS PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("settings")) {

    /////////////////////////////////SUBMIT CHANGE PASSWORD FORM//////////////////////////////
    document.getElementById("changePasswordForm").addEventListener("submit", (async function (e) {
        e.preventDefault();
        let formElem = this;
        //get validationSummary div
        let validationSummaryBox = changePasswordForm.querySelector("#validationSummary");

        //hide invalid fields error messages
        clearFormFieldsValidationErrors(formElem);
        validationSummaryBox.textContent = "";

        //get url
        let url = formElem.getAttribute("action");


        //serialize the form
        let formData = new URLSearchParams(new FormData(formElem)).toString();

        let response = await sendPostRequest(url, formData).catch(function (error) {
            if (error.message.includes("An error occurred")) {
                //custom error thrown inside the function.
                //showAlert(error.message.replace("Error: ", ""));
                alert(error.message.replace("Error: ", ""));
            } else {
                //showAlert("A connection error occurred. please check your network and try again.");
                alert("A connection error occurred. please check your network and try again.");
            }
        });

        if (response) {
            if (response.success) {
                //success.
                formElem.reset();
                displayMessage("Password changed successfully.");

            } else {
                if (response.errorType) {
                    //model error occurred.
                    response.errorModel.forEach(function (item, index) {
                        //get the field with a wrong value.
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + capitalizeFirstLetter(item.key) + '"]');
                        errorSpan.classList.remove("field-validation-valid");
                        errorSpan.classList.add("field-validation-error");
                        //show the first error from list of errors.
                        errorSpan.textContent = item.errors[0];
                    });
                } else {
                    //show error msg.
                    //displayMessage(response.message);
                    validationSummaryBox.textContent = response.message;

                }
            }
        }
    }));


    /////////////////////////////////LOAD PENDING REQUESTS//////////////////////////////
    document.getElementById("nav-privcy-tab").addEventListener("click", (async function (e) {
        e.preventDefault();
        let thisElement = this;

        if (thisElement.classList.contains("request-loaded")){
            //the pending subscription request list have already been loaded.
            //do nothing.
            return;
        }

        //get url
        let url = `${location.pathname}/UserSubscriptionRequests`;
        //get subscriptionRequest Container
        let rquestsContainer = document.getElementById("privcy").querySelector(".requests-list");
        //send request
        let response = await sendGetRequest(url).catch(function (error) {
            //Hide Loader
            hideLoader(rquestsContainer);

            if (error.message.includes("An error occurred")) {
                //custom error thrown inside the function.
                //showAlert(error.message.replace("Error: ", ""));
                alert(error.message.replace("Error: ", ""));
            } else {
                //showAlert("A connection error occurred. please check your network and try again.");
                alert("A connection error occurred. please check your network and try again.");
            }
        });

        if (response) {
            //Hide Loader
            hideLoader(rquestsContainer);

            if (response.success) {
                //success.
                let subscriptionRequests = response.data;
                //initializing here so it doesn't show undefined.
                let requestList = "";

                //check that data returned is not an empty array
                if (Array.isArray(subscriptionRequests) && subscriptionRequests.length) {
                    subscriptionRequests.forEach(request => {
                        requestList += `<div id="request_${request.id}" class="request-details">`;
                        requestList += `<div class="noty-user-img">`;
                        requestList += `<img src="images/resources/r-img1.png" class="rounded-circle" width="40" height="40" />`;
                        requestList += `</div>`;
                        requestList += `<div class="request-info" data-user=${request.user.username}>`;
                        requestList += `<h3>${request.user.fullName}</h3>`;
                        requestList += `</div>`;
                        requestList += `<div class="accept-feat">`;
                        requestList += `<ul>`;
                        if (response.currentUserRole == "Professional") {
                            //logged on user is a professional
                            //only professionals can accept pending request(s)
                            requestList += `<li><button type="button" class="accept-req">Accept</button></li>`;
                            requestList += `<li><button type="button" class="close-req delete-req"><i class="la la-close"></i></button></li>`;
                        } else {
                            requestList += `<li><button type="button" class="btn btn-secondary delete-req">Cancel Request</button></li>`;
                        }
                        requestList += `</ul>`;
                        requestList += `</div>`;
                        requestList += `</div>`;
                    });

                    //append to div
                    rquestsContainer.querySelector("form").insertAdjacentHTML("afterbegin", requestList);

                    //mark as loaded requests
                    thisElement.classList.add("request-loaded");
                    return;
                }
            } else {
                //show error msg.
                alert(response.message);
            }
        }
        //show empty state if code got here
        rquestsContainer.querySelector(".empty-state").classList.remove("d-none");
    }));

    //CODE TO RUN FOR ACCEPTING OR DELETING A REQUEST
    document.body.addEventListener('click', (async function (event) {
        let ele = event.target; 
        if (ele.classList.contains("accept-req") || ele.classList.contains("delete-req") || ele.classList.contains("la-close")) {
            if (ele.classList.contains("la-close")) {
                //get the "button" parent.
                ele = ele.parentElement;
            }
            //get element Top parent
            let topParentContainer = getNearestParent(ele, "request-details");

            //get the id of the pending request
            let subscriptionRequestId = topParentContainer.id.split("_")[1];
            //get the id of the user that sent the request
            let username = topParentContainer.querySelector(".request-info").dataset.user;
            //get the form element
            let formElem = topParentContainer.parentElement;
            //serialize the form
            let formData = new FormData(formElem);
            formData.append("requestId", subscriptionRequestId);
            formData.append("patientUsername", username);
            let serializedForm = new URLSearchParams(formData).toString();

            //set the url the form will be submitted to.
            let url = formElem.getAttribute("action");
            if (ele.classList.contains("delete-req")) {
                //set the url the form will be submitted to when deleting a request.
                url = `${location.pathname}/DeleteSubscriptionRequest`;
            } 
            
            //submit form
            let response = await sendPostRequest(url, serializedForm).catch((error) => {
                if (error.message.includes("An error occurred:")) {
                    //custom error thrown inside the function.
                    alert(error.message.replace("Error: ", ""));
                } else {
                    alert("A connection error occurred. please check your network and try again.");
                }
            });

            if (response) {
                if (response.success) {
                    //get container div that houses all pending request.
                    let pendingRequestsContainer = formElem.parentElement;
                    //remove from list/page
                    topParentContainer.remove();
                    //notify user.
                    let message = "Request accepted!";
                    if (ele.classList.contains("delete-req")) {
                        message = "Request deleted!";
                    }
                    alert(message);

                    //check if no subscription request is left in list/page.
                    //less than 2 because of the hidden input that's generated by asp.net core.
                    if (formElem.children.length < 2) {
                        //show empty state
                        pendingRequestsContainer.querySelector(".empty-state").classList.remove("d-none");
                    }
                } else {
                    //error
                    alert(response.message);
                }
            }
        } 
    }));


    /////////////////////////////////LOAD WORK EXPERIENCES AND QUALIFICATIONS//////////////////////////////
    document.getElementById("nav-workandeducation-tab").addEventListener("click", (async function (e) {
        e.preventDefault();
        let thisElement = this;

        if (thisElement.classList.contains("data-loaded")) {
            //the pending subscription request list have already been loaded.
            //do nothing.
            return;
        }

        //send parallel requests
        const values = await Promise.allSettled([loadWorkExperiences(), loadQualifications()]);

        //set statuses of both fetch operations
        let wrkExperienceResponse = values[0].status;
        let qualificationResponse = values[1].status;
        if (wrkExperienceResponse == "rejected" || qualificationResponse == "rejected") {
            let wrkExperienceErrMessage = values[0].reason?.message;
            let qualificationErrMessage = values[1].reason?.message;

            //get work each section container.
            let weContainer = document.getElementById("workExperiencesContainer");
            let qualificationsContainer = document.getElementById("qualificationsContainer");
           
            if (wrkExperienceResponse == "rejected" && qualificationResponse == "rejected") {
                //if both http operations failed with error messages that contain "An error occurred", there's a high chance they failed 4 d same reason...
                if (wrkExperienceErrMessage.includes("An error occurred") && qualificationErrMessage.includes("An error occurred")) {
                    //show any of the error message since they're pratically the same.
                    alert(wrkExperienceErrMessage);

                    //Hide the loader present in Work Experience Section.
                    hideLoader(weContainer);
                    //show empty state
                    weContainer.querySelector(".empty-state").classList.remove("d-none");
                    //Hide the loader present in Qualification Section.
                    hideLoader(qualificationsContainer);
                    //show empty state
                    qualificationsContainer.querySelector(".empty-state").classList.remove("d-none");
                }
            } else {
                //only one http operation failed.
                if (wrkExperienceResponse == "rejected") {
                    //getting work experiences failed.
                    handleHttpRequestError(wrkExperienceErrMessage, "Could not load work experiences because connection to the server wasn't established. Please check your network connection and try again.");
                    //Hide Loader
                    hideLoader(weContainer);
                    //show empty state
                    weContainer.querySelector(".empty-state").classList.remove("d-none");
                } else {
                    //getting qualifications failed.
                    handleHttpRequestError(qualificationErrMessage, "Could not load qualifications because connection to the server wasn't established. Please check your network connection and try again.");
                    //Hide Loader
                    hideLoader(qualificationsContainer);
                    //show empty state
                    qualificationsContainer.querySelector(".empty-state").classList.remove("d-none");
                }
            }
            
            return;
        }

        //mark as loaded requests??
        thisElement.classList.add("data-loaded");
    }));

    //////////////////////////////// TOGGLE END YEAR DROPDOWN ////////////////////////////
    document.getElementById("chkCurrentlyWorking").addEventListener("change", function () {
        let endYearContainer = document.querySelector(".endYear");
        if (this.checked) {
            //set selected value to "0"
            endYearContainer.querySelector("select").value = "0";
            //hide the select element
            endYearContainer.classList.add("d-none");
        } else {
            //show
            endYearContainer.classList.remove("d-none");
        }
    });

    //////////////////////////// Additional RESET FOR WORK EXPERIENCE FORM//////////////////////
    document.querySelector("#workExperienceForm .cancel").addEventListener("click", function () {
        document.querySelector("#workExperienceForm .endYear").classList.add("d-none");
        let submitBtn = this.previousElementSibling;
        if (submitBtn.textContent == "Update") {
            submitBtn.textContent = "Save";
        }
    });
    

    /////////////////////////////////ADD OR EDIT WORK EXPERIENCE//////////////////////////////
    document.getElementById("workExperienceForm").addEventListener("submit", (async function (e) {
        e.preventDefault();
        let formElem = this;
        //get validationSummary div
        let validationSummaryBox = formElem.querySelector("#validationSummary");

        //hide invalid fields error messages
        clearFormFieldsValidationErrors(formElem);
        validationSummaryBox.classList.add("d-none");
        validationSummaryBox.textContent = "";

        //get url
        let url = formElem.getAttribute("action");

        //serialize the form
        let formData = new URLSearchParams(new FormData(formElem)).toString();

        let response = await sendPostRequest(url, formData).catch(function (error) {
            if (error.message.includes("An error occurred")) {
                //custom error thrown inside the function.
                //showAlert(error.message.replace("Error: ", ""));
                alert(error.message.replace("Error: ", ""));
            } else {
                //showAlert("A connection error occurred. please check your network and try again.");
                alert("A connection error occurred. please check your network and try again.");
            }
        });

        if (response) {
            if (response.success) {
                //success.
                //get work experience container
                let wrkExperienceContainer = document.getElementById("workExperiencesContainer");

                if (url.includes("AddWorkExperience")) {
                    //ADDED SUCCESSFULLY
                    let workExperienceHtmlString = constructWorkExperienceHtml(response.data);

                    //get the empty state container
                    let emptyStateContainer = wrkExperienceContainer.querySelector(".empty-state");

                    if (wrkExperienceContainer.childElementCount <= 3) {
                        //no work experience yet
                        //hide empty state.
                        emptyStateContainer.classList.add("d-none");
                    }
                    //append the work experience details immediately after the empty state container.
                    emptyStateContainer.insertAdjacentHTML("afterend", workExperienceHtmlString);

                    displayMessage("Your Work Experience have been successfully added.");
                } else {
                    //Successfully updated.
                    let updatedWorkExperienceHtml = constructWorkExperienceElement(response.data);
                    //update the work experience with new values.
                    wrkExperienceContainer.querySelector(`#we_${url.split("=")[1]}`).replaceWith(updatedWorkExperienceHtml);

                    displayMessage("Your Work Experience have been successfully updated.");
                }
                

                //reset the form
                formElem.reset();
                clearFormFieldsValidationErrors(formElem);
                validationSummaryBox.textContent = "";
                validationSummaryBox.classList.add("d-none");
                //close the modal.
                closeModal();

            } else {
                if (response.errorType) {
                    //model error occurred.
                    response.errorModel.forEach(function (item) {
                        //get the field with a wrong value.
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + capitalizeFirstLetter(item.key) + '"]');
                        errorSpan.classList.remove("field-validation-valid");
                        errorSpan.classList.add("field-validation-error");
                        //show the first error from list of errors.
                        errorSpan.textContent = item.errors[0];
                    });
                } else {
                    //show error msg.
                    //displayMessage(response.message);
                    validationSummaryBox.classList.remove("d-none");
                    validationSummaryBox.textContent = response.message;

                }
            }
        }
    }));

    /////////////////////////////////DELETE WORK EXPERIENCE OR LOAD WORK EXPERIENCE INTO EDIT FORM/////////////////////////
    document.body.addEventListener('click', (async function (e) {
        let weActionButton = e.target;
        if (weActionButton.classList.contains("we-action-btn")) {
            e.preventDefault();
            //get element Top parent
            let topParentContainer = getNearestParent(weActionButton, "work-detail");
            //get work experience no from id property/attribute
            let workExperienceNo = topParentContainer.id.substring(3);

            //get work experience form
            let formElem = document.getElementById("workExperienceForm");
            let formData = new FormData(formElem);

            if (weActionButton.textContent == "Edit") {
                //LOAD WORK EXPERIENCE FORM.
                //update Work Experience form action
                formElem.action = `/Settings/UpdateWorkExperience?workExperienceId=${workExperienceNo}`;
                //populate the form
                formElem.querySelector("#WorkExperience_JobTitle").value = topParentContainer.dataset.title;
                formElem.querySelector("#WorkExperience_CompanyName").value = topParentContainer.dataset.company;
                formElem.querySelector("#WorkExperience_EmploymentType").value = topParentContainer.dataset.employment;
                formElem.querySelector("#WorkExperience_Location").value = topParentContainer.dataset.location;
                formElem.querySelector("#WorkExperience_StartYear").value = topParentContainer.dataset.start;

                if (topParentContainer.dataset.currentlyWorking == "false") {
                    //trigger the click event
                    formElem.querySelector("#chkCurrentlyWorking").click();
                    formElem.querySelector("#drpdwnEndYear").value = topParentContainer.dataset.end;
                }
                //change button text;
                formElem.querySelector("button.active").textContent = "Update";
                return;
            }
            else {
                //Delete Work Experience
                let url = `${location.href}/DeleteWorkExperience`;
                //add the work experience id to the form data being sent.
                formData.append("workExperienceId", workExperienceNo);

                //serialize the form
                let serializedForm = new URLSearchParams(formData).toString();

                let response = await sendPostRequest(url, serializedForm).catch(function (error) {
                    if (error.message.includes("An error occurred")) {
                        //custom error thrown inside the function.
                        //showAlert(error.message.replace("Error: ", ""));
                        alert(error.message.replace("Error: ", ""));
                    } else {
                        //showAlert("A connection error occurred. please check your network and try again.");
                        alert("A connection error occurred. please check your network and try again.");
                    }
                });

                if (response) {
                    if (response.success) {
                        //success.
                        //work experience was successfully deleted.
                        displayMessage("The work experience have been successfully deleted.");

                        topParentContainer.remove();

                        //get work experience container
                        let wrkExperienceContainer = document.getElementById("workExperiencesContainer");
                        //if no more work experience to show
                        if (wrkExperienceContainer.childElementCount <= 3) {
                            //no work experience
                            //show empty state.
                            wrkExperienceContainer.querySelector(".empty-state").classList.remove("d-none");
                        }

                    } else {
                        //ERORR
                        //show error msg.
                        displayMessage(response.message);
                    }
                }
            }
        }
    }));


    //////////////////////////////////SHOW QUALIFICATION FORM//////////////////////////////
    document.querySelector("#btn-addQualification").addEventListener("click", function () {
        let mindplaceModal = document.getElementById("mindPlaceModal");
        //set modal title
        mindplaceModal.querySelector(".modal-title").textContent = "New Qualification";
        mindplaceModal.querySelector("#qualificationForm").classList.remove("d-none");
        //hide work experience form;
        mindplaceModal.querySelector("#workExperienceForm").classList.add("d-none");
    });

    /////////////////////////////////ADD OR EDIT QUALIFICATION//////////////////////////////
    document.getElementById("qualificationForm").addEventListener("submit", (async function (e) {
        e.preventDefault();
        let formElem = this;
        //get validationSummary div
        let validationSummaryBox = formElem.querySelector("#validationSummary");

        //hide invalid fields error messages
        clearFormFieldsValidationErrors(formElem);
        validationSummaryBox.classList.add("d-none");
        validationSummaryBox.textContent = "";

        //get url
        let url = formElem.getAttribute("action");

        //serialize the form
        let formData = new URLSearchParams(new FormData(formElem)).toString();

        let response = await sendPostRequest(url, formData).catch(function (error) {
            handleHttpRequestError(error.message, "A connection error occurred. please check your network and try again.")
        });

        if (response) {
            if (response.success) {
                //success.
                //get work experience container
                let qualificationContainer = document.getElementById("qualificationsContainer");

                if (url.includes("AddQualification")) {
                    //ADDED SUCCESSFULLY
                    let qualificationHtmlString = constructQualificationHtml(response.data);

                    //get the empty state container
                    let emptyStateContainer = qualificationContainer.querySelector(".empty-state");

                    if (qualificationContainer.childElementCount <= 3) {
                        //no work experience yet
                        //hide empty state.
                        emptyStateContainer.classList.add("d-none");
                    }
                    //append the work experience details immediately after the empty state container.
                    emptyStateContainer.insertAdjacentHTML("afterend", qualificationHtmlString);

                    displayMessage("Your qualification have been successfully added.");
                } else {
                    //Successfully updated.
                    let updatedQualificationHtml = constructQualificationElement(response.data);
                    //update the work experience with new values.
                    qualificationContainer.querySelector(`#qf_${url.split("=")[1]}`).replaceWith(updatedQualificationHtml);

                    displayMessage("The qualification was successfully updated.");
                }
                formElem.querySelector(".cancel").click();
                //reset the form
                //formElem.reset();
                //clearFormFieldsValidationErrors(formElem);
                //validationSummaryBox.textContent = "";
                //validationSummaryBox.classList.add("d-none");
                ////close the modal.
                //closeModal();
            } else {
                if (response.errorType) {
                    //model error occurred.
                    response.errorModel.forEach(function (item) {
                        //get the field with a wrong value.
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + capitalizeFirstLetter(item.key) + '"]');
                        errorSpan.classList.remove("field-validation-valid");
                        errorSpan.classList.add("field-validation-error");
                        //show the first error from list of errors.
                        errorSpan.textContent = item.errors[0];
                    });
                } else {
                    //show error msg.
                    //displayMessage(response.message);
                    validationSummaryBox.classList.remove("d-none");
                    validationSummaryBox.textContent = response.message;
                }
            }
        }
    }));

    /////////////////////////////////DELETE QUALIFICATION OR LOAD QUALIFICATION INTO EDIT FORM/////////////////////////
    document.body.addEventListener('click', (async function (e) {
        let qfActionButton = e.target;
        if (qfActionButton.classList.contains("qf-action-btn")) {
            e.preventDefault();
            //get element Top parent
            let topParentContainer = getNearestParent(qfActionButton, "qualification-detail");
            //get work experience no from id property/attribute
            let qualificationNo = topParentContainer.id.substring(3).trim();

            //get work experience form
            let formElem = document.getElementById("qualificationForm");
            let formData = new FormData(formElem);

            if (qfActionButton.textContent == "Edit") {
                //LOAD WORK EXPERIENCE FORM.
                //update Work Experience form action
                formElem.action = `/Settings/UpdateQualification?qualificationId=${qualificationNo}`;
                //populate the form
                formElem.querySelector("#Qualification_SchoolName").value = topParentContainer.dataset.schoolName;
                formElem.querySelector("#Qualification_QualificationType").value = topParentContainer.dataset.qualificationType;
                formElem.querySelector("#Qualification_Major").value = topParentContainer.dataset.major;
                formElem.querySelector("#Qualification_StartYear").value = topParentContainer.dataset.startYear;
                formElem.querySelector("#Qualification_EndYear").value = topParentContainer.dataset.end;

                //change button text;
                formElem.querySelector("button.active").textContent = "Update";

                //show the qualification form.
                document.querySelector("#btn-addQualification").click();
                //update the modal title
                document.getElementById("mindPlaceModal").querySelector(".modal-title").textContent = "Edit Qualification";
                return;
            }
            else {
                //Delete Work Experience
                let url = `${location.href}/DeleteQualification`;
                //add the work experience id to the form data being sent.
                formData.append("qualificationId", qualificationNo);

                //serialize the form
                let serializedForm = new URLSearchParams(formData).toString();

                let response = await sendPostRequest(url, serializedForm).catch(function (error) {
                    if (error.message.includes("An error occurred")) {
                        //custom error thrown inside the function.
                        //showAlert(error.message.replace("Error: ", ""));
                        alert(error.message.replace("Error: ", ""));
                    } else {
                        //showAlert("A connection error occurred. please check your network and try again.");
                        alert("A connection error occurred while trying to delete the qualification, please check your network and try again.");
                    }
                });

                if (response) {
                    if (response.success) {
                        //success.
                        //qualification was successfully deleted.
                        displayMessage("The qualification have been successfully deleted.");

                        topParentContainer.remove();

                        //get qualifications container
                        let qualificationsContainer = document.getElementById("qualificationsContainer");
                        //if no more work experience to show
                        if (qualificationsContainer.childElementCount <= 3) {
                            //no work experience
                            //show empty state.
                            qualificationsContainer.querySelector(".empty-state").classList.remove("d-none");
                        }

                    } else {
                        //ERORR
                        //show error msg.
                        displayMessage(response.message);
                    }
                }
            }
        }
    }));

    ////////////////////////////HIDE QUALIFICATION FORM//////////////////////
    document.querySelector("#qualificationForm .cancel").addEventListener("click", function () {
        let form = document.getElementById("qualificationForm");
        let mindplaceModal = document.getElementById("mindPlaceModal");
        //set modal title
        mindplaceModal.querySelector(".modal-title").textContent = "New Work Experience";
        mindplaceModal.querySelector("#workExperienceForm").classList.remove("d-none");
        //hide qualification form;
        form.classList.add("d-none");
        //change button text;
        form.querySelector("button.active").textContent = "Save";
    })
}









async function getTags() {
    //get url
    let url = `${location.pathname}/FetchTags`;
    //get subscriptionRequest Container
    let weContainer = document.getElementById("workExperiencesContainer");
    //send request
    let response = await sendGetRequest(url).catch(error => {
        handleHttpRequestError(error.message, "A connection error occurred, Could not fetch tags from server. \nPlease check your network and try again.");
    });

    if (response) {
        if (response.success) {
            //success.
            return response.data;
        } else {
            //show error msg.
            throw new Error(response.message);
        }
    }
}

/**
* 
* @param {string} fetchErroMessage the error message thrown from performing a http request operation when the response isn't within 200-299 range.
* @param {string} customErrorMessage the message to display to users when the http request failed. i.e when connection to the server wasn't established.
*/
function handleHttpRequestError(fetchErroMessage, customErrorMessage) {
    if (fetchErroMessage.includes("An error occurred")) {
        //custom error thrown inside the function.
        alert(fetchErroMessage.replace("Error: ", ""));
    } else {
        //showAlert("A connection error occurred. please check your network and try again.");
        alert(customErrorMessage);
    }
}

async function loadWorkExperiences() {
    //get url
    let url = `${location.pathname}/FetchWorkExperiences`;
    //get subscriptionRequest Container
    let weContainer = document.getElementById("workExperiencesContainer");
    //send request
    let response = await sendGetRequest(url);

    if (response) {
        //Hide Loader
        hideLoader(weContainer);

        if (response.success) {
            //success.
            let workExperiences = response.data;
            //initializing here so it doesn't show undefined.
            let workExpList = "";

            //check that data returned is not an empty array
            if (Array.isArray(workExperiences) && workExperiences.length) {
                workExperiences.forEach(workExperience => {
                    workExpList += constructWorkExperienceHtml(workExperience);
                });

                //append to div
                weContainer.insertAdjacentHTML("beforeend", workExpList);
            } 
        } else {
            //show error msg.
            throw new Error(response.message);
        }
    }
}

async function loadQualifications() {
    //get url
    let url = `${location.pathname}/FetchQualifications`;
    //get qualifications wrapper
    let qualificationsContainer = document.getElementById("qualificationsContainer");
    //send request
    let response = await sendGetRequest(url);

    if (response) {
        //Hide Loader
        hideLoader(qualificationsContainer);

        if (response.success) {
            //success.
            let qualifications = response.data;
            //initializing here so it doesn't show undefined.
            let qualificationList = "";

            //check that data returned is not an empty array
            if (Array.isArray(qualifications) && qualifications.length) {
                qualifications.forEach(qualification => {
                    qualificationList += constructQualificationHtml(qualification);
                });

                //append to div
                qualificationsContainer.insertAdjacentHTML("beforeend", qualificationList);
                return;
            } else {
                //show empty state
                qualificationsContainer.querySelector(".empty-state").classList.remove("d-none");
            }
        } else {
            //show error msg.
            alert(response.message);
        }
        //if we got here...
        //show empty state
        qualificationsContainer.querySelector(".empty-state").classList.remove("d-none");
    }

}

/**
 * Constructs an html using the work experience object parameter
 * @param {object} workExperienceObject the work experience object to construct the html with/from
 * @returns A constructed work experience html-string.
 */
function constructWorkExperienceHtml(workExperienceObject) {
    //construct html element
    let workExperienceElement = constructWorkExperienceElement(workExperienceObject);
    return workExperienceElement.outerHTML;
}


/**
 * Constructs an html element using the work experience object parameter
 * @param {any} workExperienceObject
 * @returns a newly created html element
 */
function constructWorkExperienceElement(workExperienceObject) {
    let workExpElement = document.createElement("div");
    //set properties
    workExpElement.id = `we_${workExperienceObject.id}`;
    workExpElement.classList.add("work-detail", "d-flex", "mt-4");

    //set data attributes
    workExpElement.dataset.title = workExperienceObject.jobTitle;
    workExpElement.dataset.company = workExperienceObject.companyName;
    workExpElement.dataset.employment = workExperienceObject.employmentType;
    workExpElement.dataset.start = workExperienceObject.startYear;
    workExpElement.dataset.end = workExperienceObject.endYear;
    workExpElement.dataset.currentlyWorking = workExperienceObject.currentlyWorking;
    workExpElement.dataset.location = workExperienceObject.location;

    let workExp = `<section class="descriptive-img-container">`;
    workExp += `<img src="/images/company.svg" width="52" height="52"/>`;
    workExp += `</section>`;
    workExp += `<section class="d-flex w-100">`;
    workExp += `<div class="px-3 flex-grow-1">`;
    workExp += `<h3 class="mb-0">${workExperienceObject.jobTitle}</h3>`;
    workExp += `<p class="mb-0">${workExperienceObject.companyName} <b>-</b><span> ${workExperienceObject.employmentType}</span></p>`;
    workExp += `<p class="d-flex text-black-50">`;
    workExp += `<span class="pr-1"> ${workExperienceObject.startYear}</span>`;
    workExp += `<span>– ${workExperienceObject.currentlyWorking ? 'Present' : workExperienceObject.endYear}</span>`;
    workExp += `</p>`;
    workExp += `<p class="text-black-50">${workExperienceObject.location}</p>`;
    workExp += `</div>`;
    workExp += `<div class="dropup dropleft align-self-start">`;
    workExp += `<button class="border-0 action-block" data-toggle="dropdown"><i class="fa fa-ellipsis-h" style="font-size:20px"></i></button>`;
    workExp += `<div class="dropdown-menu shadow">`;
    workExp += `<a class="dropdown-item pl-4 mb-0 we-action-btn" href="#mindPlaceModal" data-toggle="modal" data-backdrop="static">Edit</a>`;
    workExp += `<a class="dropdown-item pl-4 mb-0 we-action-btn" href="#">Delete</a>`;
    workExp += `</div>`;
    workExp += `</div>`;
    workExp += `</section>`;

    //append to work experience element.
    workExpElement.insertAdjacentHTML("afterbegin", workExp);
    //return created element
    return workExpElement;
}




/**
 * Constructs an html using the qualification object parameter
 * @param {object} qualificationObject the qualification object to construct the html with/from
 * @returns A constructed qualification html-string.
 */
function constructQualificationHtml(qualificationObject) {
    //construct html element
    let qualificationElement = constructQualificationElement(qualificationObject);
    return qualificationElement.outerHTML;
}

/**
 * Constructs an html element using the qualification object parameter
 * @param {any} qualificationObject
 * @returns a newly created html element
 */
function constructQualificationElement(qualificationObject) {
    let qualificationElement = document.createElement("div");
    //set properties
    qualificationElement.id = `qf_${qualificationObject.id}`;
    qualificationElement.classList.add("qualification-detail", "d-flex", "mt-4");

    //set data attributes
    qualificationElement.dataset.schoolName = qualificationObject.schoolName;
    qualificationElement.dataset.qualificationType = qualificationObject.qualificationType;
    qualificationElement.dataset.major = qualificationObject.major;
    qualificationElement.dataset.startYear = qualificationObject.startYear;
    qualificationElement.dataset.end = qualificationObject.endYear;

    let q = `<section class="descriptive-img-container">`;
    q += `<img src="/images/museum.svg" width="52" height="52"/>`;
    q += `</section>`;
    q += `<section class="d-flex w-100">`;
    q += `<div class="px-3 flex-grow-1">`;
    q += `<h3 class="mb-0">${qualificationObject.schoolName}</h3>`;
    q += `<p class="mb-0">${qualificationObject.qualificationType} <b>-</b><span> ${qualificationObject.major}</span></p>`;
    q += `<p class="d-flex text-black-50">`;
    q += `<span class="pr-1"> ${qualificationObject.startYear}</span>`;
    q += `<span>– ${qualificationObject.endYear}</span>`;
    q += `</p>`;
    q += `</div>`;
    q += `<div class="dropup dropleft align-self-start">`;
    q += `<button class="border-0 action-block" data-toggle="dropdown"><i class="fa fa-ellipsis-h" style="font-size:20px"></i></button>`;
    q += `<div class="dropdown-menu shadow">`;
    q += `<a class="dropdown-item pl-4 mb-0 qf-action-btn" href="#">Edit</a>`;
    q += `<a class="dropdown-item pl-4 mb-0 qf-action-btn" href="#">Delete</a>`;
    q += `</div>`;
    q += `</div>`;
    q += `</section>`;

    //append to work experience element.
    qualificationElement.insertAdjacentHTML("afterbegin", q);
    //return created element
    return qualificationElement;
}



/**
 * Displays the error message on the screen
 * @param {string} message
 */
function displayMessage(message) {
    alert(message);
}

/**
 * 
 * @param {HTMLElement} element The element whose content the loader will appear on.
 */
function showLoader(element) {
    element.querySelector(".loader").classList.remove("d-none");
}

function hideLoader(element) {
    element.querySelector(".loader").classList.add("d-none");
}

/**
 * capitalizes the first letter of a word.
 * @param {string} word
 */
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


/**
 * Clears all validation error messages of a form field.
 * @param {HTMLFormElement} form The form with the validation messages to clear.
 */
function clearFormFieldsValidationErrors(form) {
    if (form.nodeName != "FORM") {
        throw new Error("Form element expected.");
    }

    form.querySelectorAll("span.field-validation-error").forEach(span => {
        span.textContent = "";
        span.classList.replace("field-validation-error", "field-validation-valid");
    });
}


/**
 * Updates the time difference from now, of all questions and comments on the page.
 */
function refreshQuestionsAndCommentsTimestamp() {
    //data-date-string
    document.querySelectorAll("[data-date-string]").forEach(dateElement => {
        let UpdatedTime = moment(dateElement.dataset.dateString).calendar();
        //set the element content
        dateElement.textContent = UpdatedTime;
    });
}


/**
 * Logs the current user out.
 */
//function logoutUser() {
//    //https://mindplaceclient.azurewebsites.net/Public/Login?ReturnUrl=%2FDashBoard%2Fpatient_1

//    let hostname = location.hostname; //get the host name
//    let currentPathname = location.pathname; //get the path of the current url.
//    //redirect to login page and logout user.
//    location.assign(`${hostname}/public/login?ReturnUrl=${currentPathname}`);
//}

/**
 * Logs the current user out.
 */
//function CheckTheUserSession() {
//    let response = sendGetRequest().catch((error) => {
//        if (error.message.includes("An error occurred:")) {
//            //custom error thrown inside the function.
//            showAlert(error.message.replace("Error: ", ""));
//        } else {
//            showAlert("A connection error occurred. please check your network and try again.");
//        }
//    });
//}

/**
 * 
 * @param {number} questionId
 * @param {HTMLFormElement} form
 */
async function postNewComment(questionId, form) {
    let formData = new FormData(form);
    formData.append("questionId", questionId);
    //serialize the form
    formData = new URLSearchParams(formData).toString();
    //submit form
    let response = await sendPostRequest(form.action, formData).catch(function (error) {
        if (error.message.includes("An error occurred")) {
            //custom error thrown inside the function.
            //showAlert(error.message.replace("Error: ", ""));
            alert(error.message.replace("Error: ", ""));
        } else {
            //showAlert("A connection error occurred. please check your network and try again.");
            alert("A connection error occurred. please check your network and try again.");
        }
    });

    return response;
}

function displayMessage(message) {
    alert(message);
}

/**
 * attempts to send a subscription request to the professional the username parameter belongs to.
 * @param {string} url the url the form is to be submitted to.
 * @param {HTMLFormElement} formElem the form containing asp.net core antiforgery tokens to be submited to the server
 * @param {string} usernameOfProfessional the username of the professional to subscribe to.
 */
async function sendSubscriptionRequest(url, formElem, usernameOfProfessional) {
    //serialize the form
    let formData = new FormData(formElem);
    formData.append("usernameOfProfessional", usernameOfProfessional);
    let serializedForm = new URLSearchParams(formData).toString();

    //submit form
    let response = await sendPostRequest(url, serializedForm).catch((error) => {
        if (error.message.includes("An error occurred:")) {
            //custom error thrown inside the function.
            alert(error.message.replace("Error: ", ""));
        } else {
            alert("A connection error occurred. please check your network and try again.");
        }
    });

    return response;
}


/**gets top 10 professionals from the api/db */
async function GetTopProfessionals(){
    let response = await sendGetRequest("/Professionals/TopProfessionals").catch((error) => {
        if (error.message.includes("An error occurred")) {
            //custom error thrown inside the function.
            //response would only return 404 because the current user is a professional and
            //professionals are not allowed to access the resource.
            //should be "403", but the forbidden page does not exist, so the response returns 404.
            if (!error.message.includes("404")){
                alert(error.message);
            } 
        } else {
            alert("There was an error trying to get top professionals.");
        }
    });

    return response;
}

function initializeSlickSlider() {
    $('.profiles-slider').slick({
        slidesToShow: 3,
        slck: true,
        slidesToScroll: 1,
        prevArrow: '<span class="slick-previous"></span>',
        nextArrow: '<span class="slick-nexti"></span>',
        autoplay: true,
        pauseOnHover: true,
        dots: false,
        autoplaySpeed: 2000,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
}

/**
 * closes the open modal.*/
function closeModal() {
    let mindPlaceModal = document.getElementById("mindPlaceModal");
    if (mindPlaceModal) {
        //hide mind place custom modal
        $(mindPlaceModal).modal("hide");
    } else {
        $("#myModal").modal("hide");
        //hide the other modal
        $(".post-popup.job_post").removeClass("active");
        $(".wrapper").removeClass("overlay");
    }   
}



/**
 * opens the form modal.*/
function openModal() {
    //hide the modal
    $(".post-popup.job_post").addClass("active");
    $(".wrapper").addClass("overlay");
}

/**
 * gets the nearest parent element with the class name.
 * @param {HTMLElement} childElement
 * @param {string} parentClassName
 */
function getNearestParent(childElement, parentClassName) {
    let topParentContainer = childElement.parentElement;
    while (true) {
        if (topParentContainer.classList.contains(parentClassName)) {
            //end loop
            break;
        }
        topParentContainer = topParentContainer.parentElement;
    }

    return topParentContainer;
}

/**
 * gets the parent form that "formChildElement" is a child of.
 * @param {HTMLElement} formChildElement
 */
function getParentForm(formChildElement) {
    let parentFormElement = formChildElement.parentElement;
    while (true) {
        if (parentFormElement.tagName == "FORM") {
            //end loop
            break;
        }
        parentFormElement = parentFormElement.parentElement;
    }

    return parentFormElement;
}


async function getUserNotifications() {
    let notificationBox = document.getElementById("notificationBox");
    if (!notificationBox) {
        //do nothing if notification icon is not shown
        //as it most definitely mean user is not logged in.
        return;
    }

    let response = await sendGetRequest("/Settings/Notifications").catch((error) => {
        if (error.message.includes("An error occurred:")) {
            //custom error thrown inside the function.
            showAlert(error.message.replace("Error: ", ""));
        } else {
            showAlert("A connection error occurred. please check your network and try again.");
        }
    });

    //would be "undefined" if error was caught in catch block above.
    if (response) {
        //success
        if (response.success) {
            //dateCreated: "2020-09-07T13:44:09.7436904"
            //creator: { fullName: "Simeon Simeon", username: "simeon@idevworks.com" }
            //id: 52
            //isSeen: false
            //message: "Simeon Omomowo Requested for <b>Mentorship.</b>"
            //type: "MENTORSHIPREQUEST"
            let userNotifications = response.data;
            let userNotificationContent = `<header class="card-header bg-transparent border-0">
                                        <h4 class="m-0 text-secondary">Notifications</h4>
                                    </header>`;

            //check that array returned is not empty
            if (Array.isArray(userNotifications) && userNotifications.length) {
                userNotifications.forEach((notification, index) => {
                    let notificationurl;
                    let splittedFullname = notification.creator.fullName.split(" ");
                    let nameInitials = `${splittedFullname[0].substr(0, 1)}${splittedFullname[1].substr(0, 1)}`;

                    switch (notification.type) {
                        case "MENTORSHIPREQUEST":
                            //notificationurl = `/Profile/${notification.creator.username}?notifId="${notification.id}"`;
                            notificationurl = `/Profile/${notification.creator.username}#`;
                        //break;
                    }

                    userNotificationContent += `<div class="card-body">
                        <a href="${notificationurl}" class="row no-gutters text-decoration-none text-dark">
                            <div class="col-3 p-1">
                                <span style="width:55px; height:55px; font-size: 1.3rem;"
                                    class="d-inline-flex align-items-center justify-content-center font-weight-light text-primary-blue bg-light rounded-circle profile-text mb-1 user-thumb">
                                    ${nameInitials}
                                    </span>
                            </div>
                            <div class="col-9 d-flex align-items-center">
                                <div class="card-body p-1">
                                    <h6 class="card-title mb-1">${notification.creator.fullName}</h6>
                                    <p class="card-text mb-0" style="font-size: .9rem;">${notification.message}</p>
                                    <p class="card-text"><small class="text-primary">${notification.dateCreated}</small></p>
                                </div>
                            </div>
                        </a>
                    </div>`;

                    //only apply horizontal rule if it's not the last element/item
                    if ((userNotifications.length - index) > 1) {
                        userNotificationContent += `<div class="dropdown-divider my-0"></div>`;
                    }
                });
            } else {
                //user has no notification
                userNotificationContent += `<p class="h5 card-body text-muted my-auto">You have no notification.<p>`;
            }

            //remove old content from div
            notificationBox.textContent = "";
            //append to div
            notificationBox.insertAdjacentHTML("beforeend", userNotificationContent);

        } else {
            //response contains error(s).
            showAlert(response.message);
        }
    }
}


//shows the ask question modal.
//$(".post-jb").on("click", function () {
//    $(".post-popup.job_post").addClass("active");
//    $(".wrapper").addClass("overlay");
//    return false;
//});

//hides the "Ask Question" modal
//$(".post-project > a").on("click", function () {
//    $(".post-popup.job_post").removeClass("active");
//    $(".wrapper").removeClass("overlay");
//    return false;
//});

//show the options menu on a post/question
//$(".ed-opts-open").on("click", function () {
//    $(this).next(".ed-options").toggleClass("active");
//    return false;
//});

//SHOWS THE QUESTION MODAL.
function showQuestionModal() {
    $(".post-popup.job_post").addClass("active");
    $(".wrapper").addClass("overlay");
}









async function sendGetRequest(url) {
    var myInit = {
        method: 'GET',
        mode: 'same-origin',
        cache: 'default'
    };

    let response = await fetch(url, myInit);
    if (!response.ok) {
        if (response.statusText.length > 0) {
            throw new Error(`An error occurred: ${response.statusText}`);
        } else {
            throw new Error(`An error occurred, error code: ${response.status}`);
        }
    } else {
        return await response.json(); // parses response into native JavaScript objects
    }
}

async function sendPostRequest(url, formdata, returnType = "json") {
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            //'Content-Type': 'application/json'
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        redirect: 'follow', // manual, *follow, error
        body: formdata // body data type must match "Content-Type" header
    });

    if (!response.ok) {
        if (response.statusText.length > 0) {
            throw new Error(`An error occurred: ${response.statusText}`);
        } else {
            throw new Error(`An error occurred, error code: ${response.status}`);
        }
    } else {
        //content = await response.text();
        if (returnType != "json") {
            return await response.text(); // parses response into text
        } else {
            return await response.json(); // parses response into native JavaScript objects
        }
    }
}