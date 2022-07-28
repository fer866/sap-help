using LiteDB;
using SAPHelp.Data;
using SAPHelp.Entities.Account;
using SAPHelp.Handlers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SAPHelp.Services
{
    public interface IBinnacleService
    {
        Task AddBinnacle(BinnacleEntity binnacle, string username);
        Task<IEnumerable<BinnacleEntity>> GetUserBinnacle(string username);
    }
    public class BinnacleService : IBinnacleService
    {
        private readonly IDatabaseConnection _context;
        public BinnacleService(IDatabaseConnection context) => _context = context;

        public async Task AddBinnacle(BinnacleEntity binnacle, string username)
        {
            if (string.IsNullOrEmpty(username))
                throw new AppException("Ups algo falló, no fué posible encontrar tu usuario");

            using var db = await _context.CreateLiteDbConnectionAsync(username);
            var col = db.GetCollection<BinnacleEntity>(AccountConstants.BinnacleTable);

            binnacle.ID = ObjectId.NewObjectId();
            binnacle.ActionDate = DateTime.Now;
            col.Insert(binnacle);

            DateTime delDays = DateTime.Now.AddDays(-AccountConstants.BinnacleDeleteDays);
            col.DeleteMany(b => b.ActionDate <= delDays);
        }

        public async Task<IEnumerable<BinnacleEntity>> GetUserBinnacle(string username)
        {
            if (string.IsNullOrEmpty(username))
                throw new AppException("Hey te faltó algo, es necesario especificar un usuario");
            using var db = await _context.CreateLiteDbConnectionAsync(username);
            var list = db.GetCollection<BinnacleEntity>(AccountConstants.BinnacleTable).Query().OrderByDescending(b => b.ActionDate).ToList();
            
            return list;
        }
    }
}
