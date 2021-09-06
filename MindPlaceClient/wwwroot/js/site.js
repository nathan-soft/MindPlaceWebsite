/////////////////////////////GLOBAL ////////////////////////////

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

    questionForm.querySelectorAll("span.field-validation-error").forEach(span => {
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
let cancelButton = document.querySelector(".post-project form ul li.cancel");

if (cancelButton) {

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
        //GetCars/carlist
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


    //HIDES THE ASK QUESTION MODAL
    cancelButton.addEventListener("click", function () {
        //reset the form
        let questionForm = document.getElementById("questionForm");
        questionForm.reset();
        clearFormFieldsValidationErrors(questionForm);
        //hide the modal
        $(".post-popup.job_post").removeClass("active");
        $(".wrapper").removeClass("overlay");
    });

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

    //SUBSCRIBING TO A PROFESSIONAL FROM THE DASHBOARD PAGE
    document.body.addEventListener('click', (async function (event) {
        let ele = event.target;
        if (ele.classList.contains(".followw")) {
            e.preventDefault();
            //get element Top parent
            let topParentContainer = ele.parentElement;
            while (true) {
                if (topParentContainer.classList.contains("user-profy")) {
                    //end loop
                    break;
                }
                topParentContainer = topParentContainer.parentElement;
            }

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

//////////////////////////////////////////////////////SETTINGS PAGE ////////////////////////////////////////////////////////
if (location.pathname.toLowerCase().includes("settings")) {

    /////////////////////////////////SUBMIT CHANGE PASSWORD FORM//////////////////////////////
    document.getElementById("changePasswordForm").addEventListener("submit", (async function (e) {
        e.preventDefault();
        let formElem = this;
        //get validationSummary div
        let validationSummaryBox = changePasswordForm.querySelector("#validationSummary");

        //hide invalid fields error messages
        formElem.querySelectorAll('span.field-validation-error').forEach(span => {
            span.classList.replace("field-validation-error", "field-validation-valid");
            span.textContent = "";
        });
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
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + item.key + '"]');
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
                        requestList += `<div class="request-info">`;
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
            //show empty state if code got here
            rquestsContainer.querySelector(".empty-state").classList.remove("d-none");
        }
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
            let topParentContainer = ele.parentElement;
            while (true) {
                if (topParentContainer.classList.contains("request-details")) {
                    //end loop
                    break;
                }
                topParentContainer = topParentContainer.parentElement;
            }

            //get the id of the pending request
            let subscriptionRequestId = topParentContainer.id.split("_")[1];
            //get the form element
            let formElem = topParentContainer.parentElement;
            //serialize the form
            let formData = new FormData(formElem);
            formData.append("requestId", subscriptionRequestId);
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