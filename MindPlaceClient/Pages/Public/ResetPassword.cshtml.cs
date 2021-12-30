using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.MindPlaceApiService;

namespace MindPlaceClient.Pages.Public
{
    public class ResetPasswordModel : BasePageModel
    {
        [BindProperty]
        public ResetPasswordDetails ResetPasswordDetails { get; set; }

        public ResetPasswordModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public ActionResult OnGet(string token, string userId)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(userId))
            {
                return NotFound();
            }

            ResetPasswordDetails = new ResetPasswordDetails { Token = token, Username = userId };

            return Page();
        }

        public async Task<ActionResult> OnPostAsync()
        {
            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    //send submitted data.
                    var response = await _mindPlaceClient.ResetPasswordAsync(ResetPasswordDetails);
                    ViewData["ResetPasswordSuccess"] = "Your password has been reset.";
                }
                catch (Exception ex)
                {
                    //error
                    var exceptionMessage = HandleException(ex);
                    ModelState.TryAddModelError(string.Empty, exceptionMessage);
                }
            }

            //MODEL ERROR
            return Page();
        }
    }

    public class ResetPasswordDetails : ResetPasswordDto
    {
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }
}
