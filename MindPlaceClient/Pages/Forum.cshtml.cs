using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using JW;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.MindPlaceApiService;
using Newtonsoft.Json;

namespace MindPlaceClient.Pages
{
    public class ForumModel : BasePageModel
    {
        [BindProperty(SupportsGet = true)]
        public string FilterText { get; set; } = "";
        [BindProperty(SupportsGet = true)]
        public string SearchText { get; set; } = "";
        public int PageSize { get; private set; } = 10;

        [BindProperty]
        public ForumQuestionDto QuestionDetails { get; set; }

        public Pager Pager { get; set; }
        public List<ForumQuestionResponseDto> Questions { get; set; } = new List<ForumQuestionResponseDto>();

        public ForumModel(IConfiguration configuration, IHttpClientFactory clientFactory)
            : base(configuration, clientFactory.CreateClient())
        {
        }

        public async Task<ActionResult> OnGetAsync(int pageNumber = 1)
        {
            try
            {
                var response = await _mindPlaceClient.GetForumQuestionsAsync(FilterText, SearchText, pageNumber, PageSize);
                Questions = response.Data.ToList();
                // get pagination info for the current page
                Pager = new Pager(response.Meta.TotalCount, pageNumber, PageSize, 5);
            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return RedirectToPage("Error", new { Message = exceptionMessage });
            }
            return Page();
        }

        public async Task<ActionResult> OnGetFetchTagsAsync()
        {
            try
            {
                var tags = await _mindPlaceClient.ListTagsAsync();
                return new JsonResult(new { Success = true, Data = tags });
            }
            catch (Exception ex)
            {
                //error
                var exceptionMessage = HandleException(ex);
                return new JsonResult(new { Success = false, Message = exceptionMessage });
            }
        }

        public async Task<ActionResult> OnPostAsync(ForumQuestionDto questionDetails)
        {
            //if (questionDetails.Tags.Count < 1 || questionDetails.Tags.Contains(null))
            //{
            //    ModelState.TryAddModelError("questionDetails.Tags", "Please enter a valid question tag.");
            //}

            if (ModelState.IsValid)
            {
                try
                {
                    TryAddBearerTokenToHeader();
                    var questionResponse = await _mindPlaceClient.AddForumQuestionAsync(questionDetails);

                    return new JsonResult(new { Success = true, Data = questionResponse });
                }
                catch (Exception ex)
                {
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

    }
}
