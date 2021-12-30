using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.MindPlaceApiService;
using Newtonsoft.Json;

namespace MindPlaceClient.Pages
{
    [Authorize]
    public class SettingsModel : BasePageModel
    {
        //INPUTS
        public ChangePassword PasswordDetails { get; set; }
        public WorkExperienceDto WorkExperience { get; set; }
        public QualificationDto Qualification { get; set; }


        public List<SelectListItem> EmploymentTypes
        {
            get
            {
                return Enum.GetNames(typeof(EmploymentType)).Select(x => new SelectListItem(x, x)).ToList();
            }
        }
        public List<NotificationResponseDto> UserNotifications { get; set; }

        public SettingsModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public async Task<PageResult> OnGetAsync()
        {
            try
            {
                UserNotifications = await GetUserNotificationsAsync();
            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                ModelState.AddModelError(string.Empty, exceptionMessage);
            }

            return Page();
        }

        public async Task<ActionResult> OnGetUserNotificationsJsonAsync()
        {
            try
            {
                var response = await GetUserNotificationsAsync();
                return new JsonResult(new { Success = true, Data = response.Take(5) });
            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostChangePasswordAsync(ChangePassword passwordDetails)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.ChangePasswordAsync(User.GetLoggedOnUsername(), passwordDetails);
                    return new JsonResult(new { Success = true});

                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    return new JsonResult(new { Success = false, Message = exceptionMessage });
                }
            }

            //MODEL ERROR
            return new JsonResult(new
            {
                success = false,
                errorType = "Model",
                errorModel = ModelState.Keys.Where(mk => ModelState[mk].Errors.Count > 0).Select(jk => new {
                    key = jk,
                    errors = ModelState[jk].Errors.Select(e => e.ErrorMessage).ToArray()
                })
            });
        }

        public async Task<ActionResult> OnPostChangeProfilePictureAsync(IFormFile profilePicture)
        {
            if(profilePicture == null)
            {
                return new JsonResult(new { Success = false, Message = "Please select a file." });
            }

            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var file = new FileParameter(profilePicture.OpenReadStream(), profilePicture.FileName, profilePicture.ContentType);
                var response = await _mindPlaceClient.ChangeProfilePhotoAsync(User.GetLoggedOnUsername(), file);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }


        public async Task<ActionResult> OnGetUserSubscriptionRequests()
        {
            try
            {
                TryAddBearerTokenToHeader();
                var pendingRequests = await _mindPlaceClient.GetUserSubscriptionRequestsAsync(User.GetLoggedOnUsername());

                return new JsonResult(new { Success = true, Data = pendingRequests.ToList(), CurrentUserRole = User.GetPrimaryRole() });
            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostAcceptSubscriptionRequestAsync([FromForm]int requestId, [FromForm]string patientUsername)
        {
            if (requestId < 1)
            {
                return new JsonResult(new { Success = false, Message = "Invalid subscription request submitted." });
            }

            var detail = new UpdateSubscriptionRequestDto() { PatientUsername = patientUsername };
            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.AcceptSubscriptionRequestAsync(requestId, detail);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostDeleteSubscriptionRequestAsync([FromForm] int requestId)
        {
            if (requestId < 1)
            {
                return new JsonResult(new { Success = false, Message = "Invalid subscription request submitted." });
            }

            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.DeleteSubscriptionRequestAsync(requestId);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnGetFetchWorkExperiencesAsync()
        {
            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.FetchUserWorkExperiencesAsync(User.GetLoggedOnUsername());
                return new JsonResult(new { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostAddWorkExperienceAsync(WorkExperienceDto workExperience)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.AddWorkExperienceAsync(workExperience);
                    return new JsonResult(new { Success = true, Data = response });

                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    return new JsonResult(new { Success = false, Message = exceptionMessage });
                }
            }

            //MODEL ERROR
            return new JsonResult(new
            {
                success = false,
                errorType = "Model",
                errorModel = ModelState.Keys.Where(mk => ModelState[mk].Errors.Count > 0).Select(jk => new {
                    key = jk,
                    errors = ModelState[jk].Errors.Select(e => e.ErrorMessage).ToArray()
                })
            });
        }

        public async Task<ActionResult> OnPostUpdateWorkExperienceAsync(int workExperienceId, WorkExperienceDto workExperience)
        {
            if (ModelState.IsValid) {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.UpdateWorkExperienceAsync(workExperienceId, workExperience);
                    return new JsonResult(new { Success = true, Data = response });
                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    return new JsonResult(new { Success = false, Message = exceptionMessage });
                }
            }

            //MODEL ERROR
            return new JsonResult(new
            {
                success = false,
                errorType = "Model",
                errorModel = ModelState.Keys.Where(mk => ModelState[mk].Errors.Count > 0).Select(jk => new {
                    key = jk,
                    errors = ModelState[jk].Errors.Select(e => e.ErrorMessage).ToArray()
                })
            });
        }

        public async Task<ActionResult> OnPostDeleteWorkExperienceAsync([FromForm] int workExperienceId)
        {
            if (workExperienceId < 1)
            {
                return new JsonResult(new { Success = false, Message = "The work experience id you submitted is not valid." });
            }

            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.DeleteWorkExperienceAsync(workExperienceId);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }




        public async Task<ActionResult> OnGetFetchQualificationsAsync()
        {
            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.FetchUserQualificationsAsync(User.GetLoggedOnUsername());
                return new JsonResult(new { Success = true, Data = response });
            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostAddQualificationAsync(QualificationDto qualification)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.AddQualificationAsync(qualification);
                    return new JsonResult(new { Success = true, Data = response });
                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    return new JsonResult(new { Success = false, Message = exceptionMessage });
                }
            }

            //MODEL ERROR
            return new JsonResult(new
            {
                success = false,
                errorType = "Model",
                errorModel = ModelState.Keys.Where(mk => ModelState[mk].Errors.Count > 0).Select(jk => new
                {
                    key = jk,
                    errors = ModelState[jk].Errors.Select(e => e.ErrorMessage).ToArray()
                })
            });
        }

        public async Task<ActionResult> OnPostUpdateQualificationAsync(int qualificationId, QualificationDto qualification)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.UpdateQualificationAsync(qualificationId, qualification);
                    return new JsonResult(new { Success = true, Data = response });
                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    return new JsonResult(new { Success = false, Message = exceptionMessage });
                }
            }

            //MODEL ERROR
            return new JsonResult(new
            {
                success = false,
                errorType = "Model",
                errorModel = ModelState.Keys.Where(mk => ModelState[mk].Errors.Count > 0).Select(jk => new
                {
                    key = jk,
                    errors = ModelState[jk].Errors.Select(e => e.ErrorMessage).ToArray()
                })
            });
        }

        public async Task<ActionResult> OnPostDeleteQualificationAsync([FromForm] int qualificationId)
        {
            if (qualificationId < 1)
            {
                return new JsonResult(new { Success = false, Message = "The work qualification id you submitted is not valid." });
            }

            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.DeleteQualificationAsync(qualificationId);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }


        private async Task<List<NotificationResponseDto>> GetUserNotificationsAsync()
        {
            TryAddBearerTokenToHeader();
            var userNotifications = await _mindPlaceClient.GetUserNotificationsAsync(User.GetLoggedOnUsername());

            return userNotifications.ToList();
        }




        //private string HandleException(Exception ex)
        //{
        //    if (ex is ApiException<MindPlaceApiService.ProblemDetails>)
        //    {
        //        var apiException = (ApiException<MindPlaceApiService.ProblemDetails>)ex;
        //        return apiException.Result.Detail;
        //    }
        //    else if (ex is ApiException)
        //    {
        //        var apiException = (ApiException)ex;
        //       if(!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("detail"))
        //        {
        //            //make sure a "problemDetails" was returned before deserialization
        //            var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(apiException.Response);
        //            return response.Detail;
        //        }
        //        else if(!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("Message"))
        //        {
        //            return apiException.Response.Substring(25).Replace("\"}", "");
        //        }
        //        else
        //        {
        //            return apiException.Response;
        //        }
        //    }
        //    else
        //    {
        //        return ex.Message;
        //    }

        //}

    }

    public enum EmploymentType
    {
        [Description("Full-time")]
        FullTime,
        [Description("Part-time")]
        PartTime,
        Contract,
        Internship,
        Freelance,
        [Description("Self-Employed")]
        SelfEmployed,
        Apprenticeship,
        Seasonal
    }

    public class ChangePassword : ChangePasswordRequest
    {
        [Compare("NewPassword"), DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
    }
}