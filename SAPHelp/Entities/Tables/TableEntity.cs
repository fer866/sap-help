using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Tables
{
    public class TableEntity
    {
        public int IdTable { get; set; }
        public int IdCat { get; set; }
        public string Category { get; set; }
        public string TableTxt { get; set; }
        public string Description { get; set; }
        public DateTime Registro { get; set; }
    }
}
