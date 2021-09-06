using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using MindPlaceClient.Code;
using MindPlaceClient.MindPlaceApiService;
using Newtonsoft.Json;

namespace MindPlaceClient.Pages.Public
{
    public class LoginModel : BasePageModel
    {
        //INPUTS
        [BindProperty]
        public LoginDto Login { get; set; }

        public LoginModel(IConfiguration configuration, IHttpClientFactory clientFactory) 
            : base(configuration, clientFactory.CreateClient())
        {
        }

        
        public async Task<ActionResult> OnGetAsync(string userId, string token)
        {
            if (User.Identity.IsAuthenticated)
            {
                //logout user.
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }

            if (!string.IsNullOrWhiteSpace(userId) && !string.IsNullOrWhiteSpace(token))
            {
                try
                {
                    //confirm the user's email.
                    await _mindPlaceClient.ConfirmEmailAsync(new EmailConfirmationDto() { Token = token, Username = userId });
                    return Redirect($"/Public/Login?username={userId}&action=mailConfirmed");
                }
                catch (ApiException ex) when(!string.IsNullOrWhiteSpace(ex.Response) && ex.Response.Contains("detail"))
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

        public async Task<ActionResult> OnPostAsync(string returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                //var c = new HttpClient();
                //var client = new Client(_configuration.GetSection("ApiBaseUrl").Value, c);

                try
                {
                    var response = await _mindPlaceClient.LoginAsync(Login);
                    var jwtToken = new JwtSecurityToken(response.Access_token);

                    //get user data
                    _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {response.Access_token}");
                
                    

                    var userResponse = await _mindPlaceClient.UsersAsync(jwtToken.Subject);
                    if (userResponse == null)
                    {
                       ModelState.AddModelError("", "A network error occurred while trying to log you in, please try again.");
                    }

                    //save important user data to claims.
                    var claims = new List<Claim>
                        {
                            new Claim("Token", response.Access_token),
                            new Claim(ClaimTypes.Name, jwtToken.Subject),
                            new Claim("ApiTokenExpiration", jwtToken.ValidTo.ToString()),
                            new Claim(ClaimTypes.Role, userResponse.GetUserPrimaryRole(userResponse.Roles.ToList())),
                            new Claim("FullName", $"{userResponse.FirstName} {userResponse.LastName}"),
                        };

                    var claimsIdentity = new ClaimsIdentity(
                        claims, CookieAuthenticationDefaults.AuthenticationScheme);

                    var authProperties = new AuthenticationProperties
                    {
                        AllowRefresh = true,
                        // Refreshing the authentication session should be allowed.

                        //IsPersistent = rememberMe,
                        // Whether the authentication session is persisted across 
                        // multiple requests. When used with cookies, controls
                        // whether the cookie's lifetime is absolute (matching the
                        // lifetime of the authentication ticket) or session-based.
                    };

                    //log user into app.
                    await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
                                        new ClaimsPrincipal(claimsIdentity), authProperties);

                    if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        //redirect the user back to the page they were trying to access.
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        //redirect user to the dashboard page.
                        return RedirectToPage("/DashBoard", new { username = jwtToken.Subject });
                    }
                    
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
                    if(ex.Message.Contains("No such host is known"))
                    {
                        ModelState.AddModelError(string.Empty, "An error occurred, please check your internet connection.");
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, ex.Message);
                    }
                    
                }
            }
            return Page();
            
        }
    }
}