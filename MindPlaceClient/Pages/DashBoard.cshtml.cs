using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.Dtos;
using MindPlaceClient.MindPlaceApiService;
using Newtonsoft.Json;

namespace MindPlaceClient.Pages
{
    [Authorize]
    public class DashBoardModel : BasePageModel
    {
        [BindProperty(SupportsGet = true)]
        public string Username { get; set; }
        public UserResponseDto UserDetails { get; set; }

        //[BindProperty]
        public QuestionDto QuestionDetails { get; set; }

        public DashBoardModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public async Task<ActionResult> OnGetAsync()
        {
            //get user
            if (string.IsNullOrWhiteSpace(Username))
            {
                return NotFound();
            }

            try
            {
                TryAddBearerTokenToHeader();
                UserDetails = await _mindPlaceClient.GetUserAsync(Username);
                if (UserDetails.Questions == null)
                {
                    return NotFound();
                }
            }
            catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
            {
                //error from unchase libary.
                //make sure a "problemDetails" was returned before deserialization
                var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                //ModelState.AddModelError(string.Empty, response.Detail);
                return RedirectToPage("Error", new { Message = response.Detail });
            }
            catch (Exception ex)
            {
                return RedirectToPage("Error", new { Message = ex.Message });
            }

            return Page();
        }

        public async Task<ActionResult> OnPostAskQuestionAsync(QuestionDto questionDetails)
        {
            //get user
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    var questionResponse = await _mindPlaceClient.AddQuestionAsync(questionDetails);

                    return new JsonResult(new { Success = true });
                }
                catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
                {
                    //error from unchase libary.
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                    //ModelState.AddModelError(string.Empty, response.Detail);
                    return new JsonResult(new { Success = false, Message = response.Detail });
                }
                catch (Exception ex)
                {
                    return new JsonResult(new { Success = false, Message = ex.Message });
                    //ModelState.AddModelError(string.Empty, ex.Message);
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

        public async Task<ActionResult> OnPostEditQuestionAsync(int questionId, QuestionDto questionDetails)
        {
            //get user
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    var questionResponse = await _mindPlaceClient.EditQuestionAsync(questionId, questionDetails);

                    return new JsonResult(new { Success = true });
                }
                catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
                {
                    //error from unchase libary.
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                    //ModelState.AddModelError(string.Empty, response.Detail);
                    return new JsonResult(new { Success = false, Message = response.Detail });
                }
                catch (Exception ex)
                {
                    return new JsonResult(new { Success = false, Message = ex.Message });
                    //ModelState.AddModelError(string.Empty, ex.Message);
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

        public async Task<ActionResult> OnPostDeleteQuestionAsync([FromForm]int questionId)
        {
            //get user
            if (questionId > 0)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    var questionResponse = await _mindPlaceClient.DeleteQuestionAsync(questionId);

                    return new JsonResult(new { Success = true });
                }
                catch (ApiException ex) when (!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
                {
                    //error from unchase libary.
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(ex.Response);
                    //ModelState.AddModelError(string.Empty, response.Detail);
                    return new JsonResult(new { Success = false, Message = response.Detail });
                }
                catch (Exception ex)
                {
                    return new JsonResult(new { Success = false, Message = ex.Message });
                    //ModelState.AddModelError(string.Empty, ex.Message);
                }
            }

            //MODEL ERROR
            return new JsonResult(new { Success = false, Message = "invalid parameter 'questionid" });
        }

        public async Task<ActionResult> OnGetLoadCommentsAsync(int questionId)
        {
            //get comments
            try
            {
                TryAddBearerTokenToHeader();
                var commentResponse = await _mindPlaceClient.GetCommentsAsync(questionId);

                return new JsonResult(new { Success = true, Data = commentResponse });
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
                return new JsonResult(new { Success = false, Message = ex.Message });
            }

           
        }

        public async Task<ActionResult> OnPostMakeCommentAsync(NewComment comment)
        {
            //get user
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    var commentResponse = await _mindPlaceClient.AddCommentAsync(comment.questionId, comment);

                    return new JsonResult(new { Success = true, CurrentUser = User.GetFullName() });
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
                    return new JsonResult(new { Success = false, Message = ex.Message });
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
            });;
        }
    }

    
}