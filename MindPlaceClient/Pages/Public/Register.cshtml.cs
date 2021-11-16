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

namespace MindPlaceClient.Pages.Public
{
    [AllowAnonymous]
    public class RegisterModel : BasePageModel
    {
        //INPUTS
        [BindProperty]
        public NewUserDto UserDetails { get; set; }

        public string[] Genders = new[] { "Male", "Female"};

        public RegisterModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public PageResult OnGetAsync()
        {
            return Page();
        }

        public async Task<ActionResult> OnPostAsync()
        {
            if ((DateTime.Now.Year - UserDetails.Dob.Year) < 16)
            {
                ModelState.TryAddModelError("UserDetails.Dob", "You have to be at least 16 years old to register on Mindplace.");
            }

            if (ModelState.IsValid)
            {
                try
                {
                    var response = await _mindPlaceClient.CreateUserAsync(UserDetails);
                    return Redirect("/Public/Register?action=confirmEmail");
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
                    //error
                    ModelState.AddModelError(string.Empty, ex.Message);
                }
            }
            return Page();
        }
    }
}