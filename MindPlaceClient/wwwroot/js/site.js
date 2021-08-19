/////////////////////////////GLOBAL ////////////////////////////

/**
 * Displays the error message on the screen
 * @param {string} message
 */
function displayMessage(message) {
    alert(message);
}




//////////////////////////////////////////////////////DASBOARD PAGE ////////////////////////////////////////////////////////
let cancelButton = document.querySelector(".post-project form ul li.cancel");

if (cancelButton) {
    //SUBMIT NEW QUESTION FORM.
    document.getElementById("questionForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        let formElem = this;
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
                    response.errorModel.forEach(function (item, index) {
                        //get the field with a wrong value.
                        let errorSpan = formElem.querySelector('span[data-valmsg-for="' + item.key + '"]');
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
    });


    //HIDES THE ASK QUESTION MODAL
    cancelButton.addEventListener("click", function () {
        //reset the form
        document.getElementById("questionForm").reset();
        //hide the modal
        $(".post-popup.job_post").removeClass("active");
        $(".wrapper").removeClass("overlay");
    });

    //TAKING ACTION ON A QUESTION
    document.querySelectorAll("ul.ed-options li a").forEach(ele => {
        ele.addEventListener("click", async function () {
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
                        location.reload();
                    } else {
                        if (response.errorType) {
                            //model error occurred.;
                            response.errorModel.forEach(function (item, index) {
                                //get the field with a wrong value.
                                let errorSpan = formElem.querySelector('span[data-valmsg-for="' + item.key + '"]');
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
        })
    });

}

//////////////////////////////////////////////////////SETTINGS PAGE ////////////////////////////////////////////////////////
let changePasswordForm = document.getElementById("changePasswordForm");
if (changePasswordForm) {
    //SUBMIT CHANGE PASSWORD FORM
    changePasswordForm.addEventListener("submit", async function (e) {
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
    });
}






async function getUserNotifications() {
    let notificationBox = document.getElementById("notificationBox");
    if (!notificationBox) {
        //do nothing if notification icon is not shown
        //as it most definitely mean user is not logged in.
        return;
    }

    let response = await sendGetRequest("/Profile/Notifications").catch((error) => {
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

    let response = await fetch(url, myInit)
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