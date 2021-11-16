using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.MindPlaceApiService;

namespace MindPlaceClient.Pages
{
    public class ForumPostModel : BasePageModel
    {
        [BindProperty(SupportsGet = true)]
        public string FilterText { get; set; } = "";
        [BindProperty(SupportsGet = true)]
        public string SearchText { get; set; } = "";

        public ForumPostResponseDto Post { get; set; }

        public ForumPostModel(IConfiguration configuration, IHttpClientFactory clientFactory)
           : base(configuration, clientFactory.CreateClient())
        {
        }

        public async Task<ActionResult> OnGetAsync(int postId)
        {
            if (postId <= 0)
            {
                return NotFound();
            }

            try
            {
                TryAddBearerTokenToHeader();
                Post = await _mindPlaceClient.GetForumQuestionAsync(postId);
                
                if (Post == null)
                {
                    //the id doesn't exist in db;
                    return NotFound();
                }

            }
            catch (Exception ex)
            {
                var exceptionMessage = HandleException(ex);
                return NotFound();
            }

            return Page();
        }
    }
}
