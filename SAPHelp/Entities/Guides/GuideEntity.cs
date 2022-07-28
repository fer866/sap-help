using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Guides
{
    public class GuideEntity
    {
        public int IdGuide { get; set; }
        public int IdCat { get; set; }
        public string Category { get; set; }
        public string Title { get; set; }
        public DateTime Alta { get; set; }
        public int Views { get; set; }
        public Nullable<DateTime> LastView { get; set; }
        public string Tags { get; set; }
    }
}
