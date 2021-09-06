using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
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
        [BindProperty]
        public ChangePassword PasswordDetails { get; set; }
        public List<NotificationResponseDto> UserNotifications { get; set; }

        public SettingsModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public async Task<PageResult> OnGetNotificationsAsync()
        {
            try
            {
                TryAddBearerTokenToHeader();
                var userNotifications = await _mindPlaceClient.NotificationsAsync(User.GetLoggedOnUsername());
                UserNotifications = userNotifications.ToList();
            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                ModelState.AddModelError(string.Empty, exceptionMessage);
            }

            return Page();
        }

        public async Task<ActionResult> OnPostChangePasswordAsync()
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.ChangePasswordAsync(User.GetLoggedOnUsername(), PasswordDetails);
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

        public async Task<IActionResult> OnGetUserSubscriptionRequests(string username)
        {
            try
            {
                TryAddBearerTokenToHeader();
                var pendingRequests = await _mindPlaceClient.SubscriptionRequestsAsync(User.GetLoggedOnUsername());

                return new JsonResult(new { Success = true, Data = pendingRequests.ToList(), CurrentUserRole = User.GetPrimaryRole() });
            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostAcceptSubscriptionRequestAsync([FromForm]int requestId)
        {
            if (requestId < 1)
            {
                return new JsonResult(new { Success = false, Message = "Invalid subscription request submitted." });
            }

            var detail = new UpdateSubscriptionRequestDto() { PatientUsername = User.GetLoggedOnUsername() };
            try
            {
                TryAddBearerTokenToHeader();
                //send submitted data.
                var response = await _mindPlaceClient.FollowPUTAsync(requestId, detail);
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
                var response = await _mindPlaceClient.FollowDELETEAsync(requestId);
                return new JsonResult(new { Success = true });

            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        private string HandleException(Exception ex)
        {
            if (ex is ApiException)
            {
                var apiException = (ApiException)ex;
               if(!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("detail"))
                {
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(apiException.Response);
                    return response.Detail;
                }
                else if(!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("Message"))
                {
                    return apiException.Response.Substring(25).Replace("\"}", "");
                }
                else
                {
                    return apiException.Response;
                }
            }
            else
            {
                return ex.Message;
            }
            
        }

    }

    public class ChangePassword : ChangePasswordRequest
    {
        [Compare("NewPassword"), DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
    }
}