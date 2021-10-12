using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.MindPlaceApiService;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MindPlaceClient.Code
{
    public class BasePageModel : PageModel
    {
        public readonly Client _mindPlaceClient;
        public readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public BasePageModel(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
            _mindPlaceClient = new Client(_configuration.GetSection("ApiBaseUrl").Value, httpClient);
        }

        /// <summary>
        /// Adds the bearer token to the header if it doesn't already exists.
        /// </summary>
        /// <param name="jwtToken"></param>
        public void TryAddBearerTokenToHeader()
        {
            if (!_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {GetJwtToken()}");
            }
        }

        /// <summary>
        /// Gets the jwt token from the current logged in user claims.
        /// </summary>
        /// <returns>A jwt token that was issued to the user.</returns>
        public string GetJwtToken()
        {
            return User.FindFirstValue("Token");
        }

        protected string HandleException(Exception ex)
        {
            if (ex is ApiException<MindPlaceApiService.ProblemDetails>)
            {
                var apiException = (ApiException<MindPlaceApiService.ProblemDetails>)ex;
                return apiException.Result.Detail;
            }
            else if (ex is ApiException)
            {
                var apiException = (ApiException)ex;
                if (!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("detail"))
                {
                    //make sure a "problemDetails" was returned before deserialization
                    var response = JsonConvert.DeserializeObject<MindPlaceApiService.ProblemDetails>(apiException.Response);
                    return response.Detail;
                }
                else if (!string.IsNullOrWhiteSpace(apiException.Response) && apiException.Response.Contains("Message"))
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
}
