using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities
{
    public class LoginSuccess
    {
        public string Username { get; set; }
        public string RefreshToken { get; set; }
        public string JwtToken { get; set; }
    }
}
