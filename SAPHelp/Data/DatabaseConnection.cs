using LiteDB;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SAPHelp.Data
{
    public interface IDatabaseConnection
    {
        Task<IDbConnection> CreateConnectionAsync();
        Task<LiteDatabase> CreateLiteDbConnectionAsync(string username);
    }
    public class DatabaseConnection : IDatabaseConnection
    {
        private readonly string _pivoteCon;
        private readonly string _liteDbPath;
        public DatabaseConnection(IConfiguration configuration, bool development, IWebHostEnvironment env)
        {
            _pivoteCon = development ? configuration.GetConnectionString("PivoteDevConnection") : configuration.GetConnectionString("PivoteConnection");
            _liteDbPath = Path.Combine(env.ContentRootPath, "..\\", configuration.GetConnectionString("LiteDBPath"));
        }

        public async Task<IDbConnection> CreateConnectionAsync()
        {
            var sqlConnection = new SqlConnection(_pivoteCon);
            await sqlConnection.OpenAsync();
            return sqlConnection;
        }

        public async Task<LiteDatabase> CreateLiteDbConnectionAsync(string username) =>
            await Task.FromResult(new LiteDatabase("Filename=" + (_liteDbPath + username + ".db") + ";Connection=shared"));
    }
}
