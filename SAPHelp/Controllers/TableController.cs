using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPHelp.Entities.Tables;
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
    public class TableController : Controller
    {
        private readonly ITableService _tableService;
        public TableController(ITableService tableService)
        {
            _tableService = tableService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecentTables()
        {
            var tables = await _tableService.GetRecentTables();
            return Ok(tables);
        }

        [HttpGet("GetTables/{value}")]
        public async Task<IActionResult> GetTables(string value)
        {
            var tables = await _tableService.GetTables(value);
            return Ok(tables);
        }

        [HttpPut]
        public async Task<IActionResult> AddTable(TableEntity table)
        {
            await _tableService.AddTable(table);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateTable(TableEntity table)
        {
            await _tableService.UpdateTable(table);
            return Ok();
        }

        [HttpDelete("{idTable}")]
        public async Task<IActionResult> DeleteTable(int idTable)
        {
            await _tableService.DeleteTable(idTable);
            return Ok();
        }
    }
}
