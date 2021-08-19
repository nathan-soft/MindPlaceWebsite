using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
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

        public async Task<PageResult> OnGetAsync()
        {
            try
            {
                TryAddBearerTokenToHeader();
                var userNotifications = await _mindPlaceClient.NotificationsAsync(User.GetLoggedOnUsername());
                UserNotifications = userNotifications.ToList();
            }
            catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
            {
                //error from unchase libary.
                //make sure a "problemDetails" was returned before deserialization
                var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                ModelState.AddModelError(string.Empty, response.Detail);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, ex.Message);
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
                catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
                {
                    //error from unchase libary.
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                    return new JsonResult(new { Success = false, Message = response.Detail });
                }
                catch (Exception ex)
                {
                    //error
                    return new JsonResult(new { Success = false, ex.Message });
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

        //public async Task<IActionResult> GetUserNotifications(string username)
        //{
        //    try
        //    {
        //        TryAddBearerTokenToHeader();
        //        var userNotifications = await _mindPlaceClient.NotificationsAsync(User.GetLoggedOnUsername());
        //        UserNotifications = UserNotifications.ToList();
        //        return new JsonResult(new { Success = true, Data = UserNotifications });
               
        //    }
        //    catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
        //    {
        //        //error from unchase libary.
        //        //make sure a "problemDetails" was returned before deserialization
        //        var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
        //        return new JsonResult(new { Success = false, Message = response.Detail });
        //    }
        //    catch (Exception ex)
        //    {
        //        return new JsonResult(new { Success = false, ex.Message });
        //    }
        //}

    }

    public class ChangePassword : ChangePasswordRequest
    {
        [Compare("NewPassword"), DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }
    }
}