using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Guides
{
    public class GroupGuideEntity
    {
        public string Category { get; set; }
        public IEnumerable<GuideEntity> Guides { get; set; }
    }
}
