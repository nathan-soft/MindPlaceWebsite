using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MindPlaceClient.Code
{
    public static class AppHelper
    {
        public static IEnumerable<int> GetYears()
        {
            var currYear = DateTime.Now.Year;
            var yearsToDisplay = new List<int>();

            //NOTE: if this ever changes, update the api's part too.
            for (var i = (currYear - 59); i <= currYear ; i++)
            {
                yearsToDisplay.Add(i);
            }

            return yearsToDisplay.OrderByDescending(u => u);
        }
    }
}
