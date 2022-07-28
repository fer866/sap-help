using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Tables
{
    public class GroupTableEntity
    {
        public string Category { get; set; }
        public IEnumerable<TableEntity> Tables { get; set; }
    }
}
