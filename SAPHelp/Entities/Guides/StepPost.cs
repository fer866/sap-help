using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Entities.Guides
{
    public class StepPost
    {
        public IFormFile File { get; set; }
        public StepEntity Step { get; set; }
    }
}
