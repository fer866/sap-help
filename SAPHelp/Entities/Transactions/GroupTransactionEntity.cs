using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Transactions
{
    public class GroupTransactionEntity
    {
        public string Category { get; set; }
        public IEnumerable<TransactionEntity> Transactions { get; set; }
    }
}
