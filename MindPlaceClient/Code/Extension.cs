using MindPlaceClient.MindPlaceApiService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MindPlaceClient.Code
{
    public static class Extension
    {
        public static string GetFullName(this ClaimsPrincipal principal)
        {
            return principal.FindFirstValue("FullName").Trim();
        }

        /// <summary>
        /// Gets the username of the currently logged in user.
        /// </summary>
        /// <returns>The username of the currently logged in user.</returns>
        public static string GetLoggedOnUsername(this ClaimsPrincipal principal)
        {
            return principal.Claims.First(c => c.Type == ClaimTypes.Name).Value;
        }

        /// <summary>
        /// Gets the jwt token from the current logged in user claims.
        /// </summary>
        /// <returns>A jwt token that was issued to the user.</returns>
        public static string GetJwtToken(this ClaimsPrincipal principal)
        {
            return principal.FindFirstValue("Token");
        }

        public static string GetInitials(this string fullname)
        {
            var fullnameArr = fullname.Split(' ');
            var initials = $"{fullnameArr[0].First()}{fullnameArr[1].First()}";
            return initials.ToUpper();
        }

        /// <summary>
        /// Checks if the user is a "Mentor", "Mentee" or an "Admin" and returns the role.
        /// </summary>
        /// <param name="userRoles">represents all the roles the user belongs to.</param>
        public static string GetUserPrimaryRole(this UserResponseDto user, List<string> userRoles)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            var userRole = "Admin";
            if (userRoles.Exists(k => k == "Professional"))
            {
                //user is a professional
                userRole = "Professional";
            }
            else if (userRoles.Exists(k => k == "Patient"))
            {
                //user is a patient
                userRole = "Patient";
            }
            else if (userRoles.Exists(k => k == "Moderator"))
            {
                //user is a moderator
                userRole = "Moderator";
            }

            return userRole;
        }
    }
}
