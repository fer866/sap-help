using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Transactions
{
    public class TransactionEntity
    {
        public int IdTransaction { get; set; }
        public int IdCat { get; set; }
        public string Category { get; set; }
        public string TransactionTxt { get; set; }
        public string Description { get; set; }
        public DateTime Alta { get; set; }
    }
}
