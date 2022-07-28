using SAPHelp.Data;
using SAPHelp.Entities.Transactions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using SAPHelp.Handlers;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using SAPHelp.Entities.Account;

namespace SAPHelp.Services
{
    public interface ITransactionService
    {
        Task<IEnumerable<GroupTransactionEntity>> GetRecentTransactions();
        Task<IEnumerable<GroupTransactionEntity>> GetTransactions(string searchValue);
        Task AddTransaction(TransactionEntity transaction);
        Task UpdateTransaction(TransactionEntity transaction);
        Task DeleteTransaction(int idTransaction);
    }
    public class TransactionService : ITransactionService
    {
        private readonly IDatabaseConnection _context;
        private readonly IBinnacleService _binnacle;
        private readonly string _username;
        public TransactionService(IDatabaseConnection context, IBinnacleService binnacle, IHttpContextAccessor http)
        {
            _context = context;
            _binnacle = binnacle;
            _username = http.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        public async Task<IEnumerable<GroupTransactionEntity>> GetRecentTransactions()
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 20 t.fiIdTransaction idTransaction, t.fiIdCat idCat, c.fcCategory category, t.fcTransaction transactionTxt, " +
                "t.fcDescription description, t.fdFchAlta alta";
            string from = "from SHTransaction t inner join SHCategory c on t.fiIdCat = c.fiIdCat";

            var trans = await conn.QueryAsync<TransactionEntity>($"{select} {from} order by t.fdFchAlta desc, c.fcCategory asc");

            var group = trans.GroupBy(g => g.Category, (cat, list) => new GroupTransactionEntity
            {
                Category = cat,
                Transactions = list.OrderBy(t => t.TransactionTxt)
            });

            return group;
        }

        public async Task<IEnumerable<GroupTransactionEntity>> GetTransactions(string searchValue)
        {
            if (string.IsNullOrEmpty(searchValue))
                throw new AppException("Debes especificar un valor en la búsqueda");

            string binSearch = searchValue;
            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity { Action = "Búsqueda de transacciones", Object = binSearch }, _username));

            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 30 t.fiIdTransaction idTransaction, t.fiIdCat idCat, c.fcCategory category, t.fcTransaction transactionTxt, " +
                "t.fcDescription description, t.fdFchAlta alta";
            string from = "from SHTransaction t inner join SHCategory c on t.fiIdCat = c.fiIdCat";
            searchValue = searchValue.Replace(' ', '%');
            string where = $"where c.fcCategory like '%{searchValue}%' or t.fcTransaction like '%{searchValue}%' or t.fcDescription like '%{searchValue}%'";

            var trans = await conn.QueryAsync<TransactionEntity>($"{select} {from} {where} order by c.fcCategory asc, t.fcTransaction asc");

            var group = trans.GroupBy(g => g.Category, (cat, list) => new GroupTransactionEntity
            {
                Category = cat,
                Transactions = list.OrderBy(t => t.TransactionTxt)
            });

            return group;
        }

        public async Task AddTransaction(TransactionEntity transaction)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyTran = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTransaction from SHTransaction " +
                "where fcTransaction = @transactionTxt", new { transaction.TransactionTxt });
            if (anyTran != null)
                throw new AppException("No tan rápido, la transacción ya existe");

            transaction.Alta = DateTime.Now;
            await conn.ExecuteAsync("insert into SHTransaction values (" +
                "@idCat, @transactionTxt, @description, @alta)", transaction);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Transacción",
                Object = $"Agregó: {transaction.TransactionTxt}"
            }, _username));
        }

        public async Task UpdateTransaction(TransactionEntity transaction)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyTran = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTransaction from SHTransaction " +
                "where fcTransaction = @transactionTxt and fiIdTransaction <> @idTransaction", transaction);
            if (anyTran != null)
                throw new AppException("No tan rápido, la transacción ya existe");

            await conn.ExecuteAsync("update SHTransaction set " +
                "fiIdCat = @idCat, " +
                "fcTransaction = @transactionTxt, " +
                "fcDescription = @description " +
                "where fiIdTransaction = @idTransaction", transaction);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Transacción",
                Object = $"Actualizó: {transaction.TransactionTxt}"
            }, _username));
        }

        public async Task DeleteTransaction(int idTransaction)
        {
            using var conn = await _context.CreateConnectionAsync();
            var transaction = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcDescription from SHTransaction " +
                "where fiIdTransaction = @idTransaction", new { idTransaction });
            await conn.ExecuteAsync("delete SHTransaction where fiIdTransaction = @idTransaction", new { idTransaction });

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Transacción",
                Object = $"Eliminó: {transaction}"
            }, _username));
        }
    }
}
