using SAPHelp.Data;
using SAPHelp.Entities.Tables;
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
    public interface ITableService
    {
        Task<IEnumerable<GroupTableEntity>> GetRecentTables();
        Task<IEnumerable<GroupTableEntity>> GetTables(string searchValue);
        Task AddTable(TableEntity table);
        Task UpdateTable(TableEntity table);
        Task DeleteTable(int idTable);
    }
    public class TableService : ITableService
    {
        private readonly IDatabaseConnection _context;
        private readonly IBinnacleService _binnacle;
        private readonly string _username;
        public TableService(IDatabaseConnection context, IBinnacleService binnacle, IHttpContextAccessor http)
        {
            _context = context;
            _binnacle = binnacle;
            _username = http.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        public async Task<IEnumerable<GroupTableEntity>> GetRecentTables()
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 20 t.fiIdTable idTable, t.fiIdCat idCat, c.fcCategory category, t.fcTable tableTxt, " +
                "t.fcDescription description, t.fdRegistro registro";
            string from = "from SHTables t inner join SHCategory c on t.fiIdCat = c.fiIdCat";

            var trans = await conn.QueryAsync<TableEntity>($"{select} {from} order by t.fdRegistro desc, c.fcCategory asc");

            var group = trans.GroupBy(g => g.Category, (cat, list) => new GroupTableEntity
            {
                Category = cat,
                Tables = list.OrderBy(t => t.TableTxt)
            });

            return group;
        }

        public async Task<IEnumerable<GroupTableEntity>> GetTables(string searchValue)
        {
            if (string.IsNullOrEmpty(searchValue))
                throw new AppException("Debes especificar un valor en la búsqueda");

            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 20 t.fiIdTable idTable, t.fiIdCat idCat, c.fcCategory category, t.fcTable tableTxt, " +
                "t.fcDescription description, t.fdRegistro registro";
            string from = "from SHTables t inner join SHCategory c on t.fiIdCat = c.fiIdCat";
            searchValue = searchValue.Replace(' ', '%');
            string where = $"where c.fcCategory like '%{searchValue}%' or t.fcTable like '%{searchValue}%' or t.fcDescription like '%{searchValue}%'";

            var trans = await conn.QueryAsync<TableEntity>($"{select} {from} {where} order by c.fcCategory asc, t.fcTable asc");

            var group = trans.GroupBy(g => g.Category, (cat, list) => new GroupTableEntity
            {
                Category = cat,
                Tables = list.OrderBy(t => t.TableTxt)
            });

            return group;
        }

        public async Task AddTable(TableEntity table)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyTable = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTable from SHTables where fcTable = @tableTxt", new { table.TableTxt });
            if (anyTable != null)
                throw new AppException($"No tan rápido, la tabla {table.TableTxt} ya existe");

            table.Registro = DateTime.Now;
            await conn.ExecuteAsync("insert into SHTables values (" +
                "@idCat, @tableTxt, @description, @registro)", table);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Tabla",
                Object = $"Agregó: {table.TableTxt}"
            }, _username));
        }

        public async Task UpdateTable(TableEntity table)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyTable = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTable from SHTables " +
                "where fiIdTable <> @idTable and fcTable = @tableTxt", table);
            if (anyTable != null)
                throw new AppException("Alto ahí, el nombre de tabla ya existe");

            await conn.ExecuteAsync("update SHTables set " +
                "fiIdCat = @idCat, " +
                "fcTable = @tableTxt, " +
                "fcDescription = @description " +
                "where fiIdTable = @idTable", table);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Tabla",
                Object = $"Actualizó: {table.TableTxt}"
            }, _username));
        }

        public async Task DeleteTable(int idTable)
        {
            using var conn = await _context.CreateConnectionAsync();
            var table = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTable from SHTables where fiIdTable = @idTable", new { idTable });
            await conn.ExecuteAsync("delete SHTables where fiIdTable = @idTable", new { idTable });

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Tabla",
                Object = $"Eliminó: {table}"
            }, _username));
        }
    }
}
