using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Models.Account
{
    public class AccountModel
    {
        public string Username { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public string RefreshToken { get; set; }
        public Nullable<DateTime> RefreshTokenExpires { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> LastAccess { get; set; }
        public bool ResetRequest { get; set; }
        public bool Active { get; set; }
        public int UserRole { get; set; }
        public int RemainingTries { get; set; }
    }
}
