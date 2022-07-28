using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPHelp.Entities.Guides;
using SAPHelp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GuideController : Controller
    {
        private readonly IGuideService _guideService;
        public GuideController(IGuideService guideService) => _guideService = guideService;

        [HttpGet]
        public async Task<IActionResult> GetRecentGuides()
        {
            var guides = await _guideService.GetRecentGuides();
            return Ok(guides);
        }

        [HttpGet("GetGuides/{value}")]
        public async Task<IActionResult> GetGuides(string value)
        {
            var guides = await _guideService.GetGuides(value);
            return Ok(guides);
        }

        [HttpGet("GetGuideById/{id}")]
        public async Task<IActionResult> GetGuideById(int id)
        {
            var guide = await _guideService.GetGuideById(id);
            return Ok(guide);
        }

        [HttpGet("GetGuideSteps/{id}")]
        public async Task<IActionResult> GetGuideSteps(int id)
        {
            var steps = await _guideService.GetGuideSteps(id);
            return Ok(steps);
        }

        [HttpPut]
        public async Task<IActionResult> AddGuide(GuideEntity guide)
        {
            var idGuide = await _guideService.AddGuide(guide);
            return Ok(new { idGuide });
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateGuide(GuideEntity guide)
        {
            await _guideService.UpdateGuide(guide);
            return Ok();
        }

        [HttpDelete("{idGuide}")]
        public async Task<IActionResult> DeleteGuide(int idGuide)
        {
            await _guideService.DeleteGuide(idGuide);
            return Ok();
        }

        [HttpPut("AddGuideStep")]
        public async Task<IActionResult> AddGuideStep([FromForm]StepPost post)
        {
            await _guideService.AddGuideStep(post);
            return Ok();
        }

        [HttpPatch("UpdateGuideStep")]
        public async Task<IActionResult> UpdateGuideStep([FromForm]StepPost post)
        {
            await _guideService.UpdateGuideStep(post);
            return Ok();
        }

        [HttpDelete("DeleteGuideStep/{idStep}")]
        public async Task<IActionResult> DeleteGuideStep(int idStep)
        {
            await _guideService.DeleteGuideStep(idStep);
            return Ok();
        }

        [HttpPatch("ChangeStepsPosition")]
        public async Task<IActionResult> ChangeStepsPosition(IEnumerable<StepEntity> steps)
        {
            await _guideService.ChangeStepsPosition(steps);
            return Ok();
        }

        [HttpGet("DownloadStepFile/{idStep}")]
        public async Task<IActionResult> DownloadStepFile(int idStep)
        {
            var file = await _guideService.DownloadStepFile(idStep);
            return File(file.Item1, file.Item2, file.Item3);
        }

        [HttpGet("GenerateGuidePdf/{idGuide}")]
        public async Task<IActionResult> GenerateGuidePdf(int idGuide)
        {
            var file = await _guideService.GenerateGuidePdf(idGuide);
            return File(file.Item1, file.Item2, file.Item3);
        }
    }
}
