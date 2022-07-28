using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp
{
    public static class Utilities
    {
        public static string ToTileCase(this string text)
        {
            string myText = text;

            if (string.IsNullOrEmpty(myText) == false && string.IsNullOrWhiteSpace(myText) == false)
            {
                char[] space = new char[] { ' ' };

                List<string> artsAndPreps = new()
                {
                    "a",
                    "ante",
                    "cabe",
                    "con",
                    "contra",
                    "de",
                    "del",
                    "desde",
                    "en",
                    "entre",
                    "hacia",
                    "hasta",
                    "para",
                    "por",
                    "según",
                    "sin",
                    "sobre",
                    "tras",
                    "el",
                    "la",
                    "los",
                    "las",
                    "un",
                    "una",
                    "unos",
                    "unas"
                };

                myText = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(text.ToLower());

                List<string> tokens = myText.Split(space, StringSplitOptions.RemoveEmptyEntries).ToList();

                myText = tokens[0];
                tokens.RemoveAt(0);

                myText += tokens.Aggregate<string, string>(string.Empty, (string prev, string input)
                    => prev +
                        (artsAndPreps.Contains(input.ToLower())
                            ? " " + input.ToLower()
                            : " " + input));
            }

            return myText;
        }
    }
}
