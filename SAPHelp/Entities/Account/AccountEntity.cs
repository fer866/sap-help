using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Account
{
    public class AccountEntity
    {
        public string Username { get; set; }
        public string Name { get; set; }
        public DateTime Created { get; set; }
        public Nullable<DateTime> LastAccess { get; set; }
        public bool ResetRequest { get; set; }
        public bool Active { get; set; }
        public int UserRole { get; set; }
    }
}
