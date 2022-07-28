using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPHelp.Entities.Catalogs;
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
    public class CategoryController : Controller
    {
        private readonly ICategoryService _categoryService;
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var cats = await _categoryService.GetCategories();
            return Ok(cats);
        }

        [HttpPut]
        public async Task<IActionResult> AddCategory(CategoryEntity category)
        {
            await _categoryService.AddCategory(category);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateCategory(CategoryEntity category)
        {
            await _categoryService.UpdateCategory(category);
            return Ok();
        }

        [HttpDelete("{idCat}")]
        public async Task<IActionResult> DeleteCategory(int idCat)
        {
            await _categoryService.DeleteCategory(idCat);
            return Ok();
        }
    }
}
