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

namespace MindPlaceClient.Pages
{
    [Authorize(Roles = "Patient")]
    public class ProfessionalsModel : BasePageModel
    {
        public List<UserResponseDto> Professionals { get; set; } = new List<UserResponseDto>();

        public ProfessionalsModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {

        }


        public async Task<ActionResult> OnGetAsync()
        {
            if (User.IsInRole("Professional"))
            {
                //professional should not see this page.
                return Forbid();
            }

            try
            {
                TryAddBearerTokenToHeader();
                var response = await _mindPlaceClient.ProfessionalsAsync();

                Professionals = response.ToList();
            }
            catch (ApiException ex)
            {
                return RedirectToPage("Error", new { message = ex.Message });
            }

            return Page();
        }
    }
}