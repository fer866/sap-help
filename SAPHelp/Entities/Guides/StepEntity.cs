using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Guides
{
    public class StepEntity
    {
        public int IdStep { get; set; }
        public int IdGuide { get; set; }
        public string TransactionTxt { get; set; }
        public string StepTxt { get; set; }
        public string FileUrl { get; set; }
        public Nullable<int> Position { get; set; }
        public bool IsImage { get; set; }
    }
}
