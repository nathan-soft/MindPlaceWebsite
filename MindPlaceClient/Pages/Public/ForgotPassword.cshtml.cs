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
    public class ForgotPasswordModel : BasePageModel
    {
        //INPUTS
        [BindProperty, Required, EmailAddress]
        public string Email { get; set; }

        public ForgotPasswordModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }


        public PageResult OnGet()
        {
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
                    var response = await _mindPlaceClient.ForgotPasswordAsync(new ForgotPasswordDto() { Email = Email });
                    return Redirect("/Public/ForgotPassword?action=resetPassword");
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
}
