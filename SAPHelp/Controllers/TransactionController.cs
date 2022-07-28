using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SAPHelp.Entities.Transactions;
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
    public class TransactionController : Controller
    {
        private readonly ITransactionService _transactionService;
        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecentTransactions()
        {
            var trans = await _transactionService.GetRecentTransactions();
            return Ok(trans);
        }

        [HttpGet("GetTransactions/{value}")]
        public async Task<IActionResult> GetTransactions(string value)
        {
            var trans = await _transactionService.GetTransactions(value);
            return Ok(trans);
        }

        [HttpPut]
        public async Task<IActionResult> AddTransaction(TransactionEntity transaction)
        {
            await _transactionService.AddTransaction(transaction);
            return Ok();
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateTransaction(TransactionEntity transaction)
        {
            await _transactionService.UpdateTransaction(transaction);
            return Ok();
        }

        [HttpDelete("{idTransaction}")]
        public async Task<IActionResult> DeleteTransaction(int idTransaction)
        {
            await _transactionService.DeleteTransaction(idTransaction);
            return Ok();
        }
    }
}
