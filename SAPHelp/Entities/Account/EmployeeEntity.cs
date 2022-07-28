using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Account
{
    public class EmployeeEntity
    {
        public int Exp { get; set; }
        private string oName;

        public string Name
        {
            get { return oName; }
            set { oName = value.ToTileCase(); }
        }

        public string CveAdscripcion { get; set; }
        public string Adscripcion { get; set; }
    }
}
