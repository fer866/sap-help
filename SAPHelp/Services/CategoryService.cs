using SAPHelp.Data;
using SAPHelp.Entities.Catalogs;
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
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryEntity>> GetCategories();
        Task AddCategory(CategoryEntity category);
        Task UpdateCategory(CategoryEntity category);
        Task DeleteCategory(int idCat);
    }
    public class CategoryService : ICategoryService
    {
        private readonly IDatabaseConnection _context;
        private readonly IBinnacleService _binnacle;
        private readonly string _username;
        public CategoryService(IDatabaseConnection context, IHttpContextAccessor http, IBinnacleService binnacle)
        {
            _context = context;
            _binnacle = binnacle;
            _username = http.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        public async Task<IEnumerable<CategoryEntity>> GetCategories()
        {
            using var conn = await _context.CreateConnectionAsync();

            var categories = await conn.QueryAsync<CategoryEntity>("select fiIdCat idCat, fcCategory category, fdFchRegistro registro " +
                "from SHCategory order by fcCategory asc");
            return categories;
        }

        public async Task AddCategory(CategoryEntity category)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyCat = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcCategory from SHCategory " +
                "where fcCategory = @category", new { category.Category });
            if (anyCat != null)
                throw new AppException($"No tan rápido, ya existe la categoría {category.Category}");

            category.Registro = DateTime.Now;
            await conn.ExecuteAsync("insert into SHCategory values (@category, @registro)", category);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Categorías",
                Object = $"Agregó: {category.Category}"
            }, _username));
        }

        public async Task UpdateCategory(CategoryEntity category)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyCat = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcCategory from SHCategory " +
                "where fiIdCat <> @idCat and fcCategory = @category", category);
            if (anyCat != null)
                throw new AppException("Alto ahí, la categoría ya existe, no quieras pasarte de listo");

            await conn.ExecuteAsync("update SHCategory set fcCategory = @category where fiIdCat = @idCat", category);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Categorías",
                Object = $"Actualizó: {category.Category}, ID: {category.IdCat}"
            }, _username));
        }

        public async Task DeleteCategory(int idCat)
        {
            using var conn = await _context.CreateConnectionAsync();

            var anyGuide = await conn.QuerySingleOrDefaultAsync<int?>("select top 1 fiIdGuide from SHGuide where fiIdCat = @idCat", new { idCat });
            if (anyGuide != null)
                throw new AppException("No puedes eliminar la categoría ya que está en uso por una guía");
            var anyTable = await conn.QuerySingleOrDefaultAsync<int?>("select top 1 fiIdTable from SHTables where fiIdCat = @idCat", new { idCat });
            if (anyTable != null)
                throw new AppException("No puedes eliminar la categoría ya que está en uso por una tabla SAP");
            var anyTran = await conn.QuerySingleOrDefaultAsync<int?>("select top 1 fiIdTransaction from SHTransaction " +
                "where fiIdCat = @idCat", new { idCat });
            if (anyTran != null)
                throw new AppException("No puedes eliminar la categoría ya que está en uso por una transacción");

            var cat = await conn.QuerySingleOrDefaultAsync<string>("select fcCategory from SHCategory where fiIdCat = @idCat", new { idCat });

            await conn.ExecuteAsync("delete SHCategory where fiIdCat = @idCat", new { idCat });

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Categorías",
                Object = $"Eliminó: {cat}"
            }, _username));
        }
    }
}
