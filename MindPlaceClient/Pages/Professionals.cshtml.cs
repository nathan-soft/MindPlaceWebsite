using System;
using System.Collections.Generic;
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
    [Authorize(Roles = "Patient")]
    public class ProfessionalsModel : BasePageModel
    {
        public List<AbbrvUser> Professionals { get; set; } = new List<AbbrvUser>();

        public ProfessionalsModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {

        }

        public async Task<ActionResult> OnGetAsync()
        {
            try
            {
                TryAddBearerTokenToHeader();
                var response = await GetProfessonalsAsync();

                Professionals = response.ToList();
            }
            catch (ApiException ex)
            {
                return RedirectToPage("Error", new { message = ex.Message });
            }

            return Page();
        }

        public async Task<ActionResult> OnGetTopProfessionalsAsync()
        {
            try
            {
                var response = await GetProfessonalsAsync();
                //var currentUser = User.GetPrimaryRole() == "Patie"
                return new JsonResult(new { Success = true, Data = response});

            }
            catch (ApiException ex)
            {
                return new JsonResult(new { Success = false, Message = ex.Message });
            }
        }

        public async Task<ActionResult> OnPostAsync([FromForm]string usernameOfProfessional)
        {
            if (string.IsNullOrWhiteSpace(usernameOfProfessional)) {
                return new JsonResult(new { Success = false, Message = "Please select a professional." });
            }

            try
            {
                var detail = new SubscriptionRequestDto() { UsernameOfProfessional = usernameOfProfessional };
                TryAddBearerTokenToHeader();
                var response = await _mindPlaceClient.FollowPOSTAsync(detail);
                return new JsonResult(new { Success = true });
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

        private async Task<ICollection<AbbrvUser>> GetProfessonalsAsync()
        {
            TryAddBearerTokenToHeader();
            var response = await _mindPlaceClient.SuggestedProfessionalsAsync();
            return response;
        }
    }
}