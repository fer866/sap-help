using Microsoft.Extensions.Options;
using SAPHelp.Data;
using SAPHelp.Entities;
using SAPHelp.Entities.Account;
using SAPHelp.Handlers;
using SAPHelp.Models.Account;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using BC = BCrypt.Net.BCrypt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

namespace SAPHelp.Services
{
    public interface IAccountService
    {
        Task AddAccount(AccountModel account);
        Task<LoginSuccess> Authenticate(LoginRequest login);
        Task UpdateAccount(AccountEntity account);
        Task DeleteAccount(string username);
        Task<LoginSuccess> RefreshToken(string token);
        Task RevokeToken(string token);
        Task<LoginSuccess> CreateNewPassword(LoginRequest login);
        Task<AccountInfo> GetAccountInfo(string username);
        Task<IEnumerable<AccountEntity>> GetUsers();
        Task<IEnumerable<EmployeeEntity>> SearchEmployees(string value);
        Task<AccountEntity> GetAccount(string username);
    }
    public class AccountService : IAccountService
    {
        private readonly IDatabaseConnection _context;
        private readonly AppSettings _config;
        private readonly int _remainingTries = 6;
        public AccountService(IDatabaseConnection context, IOptions<AppSettings> config)
        {
            _context = context;
            _config = config.Value;
        }

        public async Task AddAccount(AccountModel account)
        {
            using var conn = await _context.CreateConnectionAsync();

            account.Username = account.Username.ToUpper();
            var exists = await conn.QuerySingleOrDefaultAsync<string>("select top 1 username from UsersSapHelp where username = @username", new { username = account.Username });
            if (exists != null)
                throw new AppException("No tan rápido vaquero, el usuario ya existe.");

            account.Password = BC.HashPassword("Pruebas1");
            account.Created = DateTime.Now;
            account.ResetRequest = true;
            account.Active = true;
            account.RemainingTries = _remainingTries;

            await conn.ExecuteAsync("insert into UsersSapHelp values (" +
                "@username,@name,@password,@refreshToken,@refreshTokenExpires,@created,@lastAccess,@resetRequest,@active,@userRole,@remainingTries)", account);
        }

        public async Task<LoginSuccess> Authenticate(LoginRequest login)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<AccountModel>("select top 1 * from UsersSapHelp where username = @username", new { username = login.Username.ToUpper() });
            if (account == null)
                throw new AppException("Ups tu usuario es incorrecto o no tienes permiso para ingresar");
            else if (!account.Active)
                throw new AppException("Lo siento no tienes permiso para ingresar");
            else if (account.ResetRequest)
                throw new AppException("Debes elegir una nueva contraseña para continuar", false, true);
            else if (account.RemainingTries <= 0)
                throw new AppException("Has agotado el número de intentos permitidos, tu cuenta está bloqueada");
            else if (!BC.Verify(login.Password, account.Password))
            {
                account.RemainingTries--;
                await conn.ExecuteAsync("update UsersSapHelp set remainingTries = @RemainingTries where username = @username", new { account.RemainingTries, account.Username });
                throw new AppException($"La contraseña es incorrecta, verifica e intenta nuevamente. Tienes {account.RemainingTries} intentos");
            }

            if (account.RefreshToken != null && account.RefreshTokenExpires >= DateTime.UtcNow)
                account.RefreshTokenExpires = DateTime.UtcNow.AddDays(AccountConstants.RefreshTokenDays);
            else
            {
                var refreshToken = GenerateRefreshToken();
                account.RefreshToken = refreshToken.Token;
                account.RefreshTokenExpires = refreshToken.Expires;
            }

            var jwtToken = GenerateJwtToken(account);
            account.LastAccess = DateTime.Now;
            account.RemainingTries = _remainingTries;

            await conn.ExecuteAsync("update UsersSapHelp set " +
                "refreshToken = @refreshToken, " +
                "refreshTokenExpires = @refreshTokenExpires, " +
                "lastAccess = @lastAccess, " +
                "remainingTries = @remainingTries " +
                "where username = @username", account);

            LoginSuccess success = new()
            {
                Username = account.Username,
                JwtToken = jwtToken,
                RefreshToken = account.RefreshToken
            };

            return success;
        }

        public async Task<AccountEntity> GetAccount(string username)
        {
            using var conn = await _context.CreateConnectionAsync();
            if (username == null)
                throw new AppException("No tan rápido, no has especificado el usuario");

            var user = await conn.QuerySingleOrDefaultAsync<AccountEntity>("select top 1 * from UsersSapHelp where username = @username", new { username });

            return user;
        }

        public async Task UpdateAccount(AccountEntity account)
        {
            using var conn = await _context.CreateConnectionAsync();
            var userRole = await conn.QuerySingleOrDefaultAsync<int>("select top 1 userRole from UsersSapHelp where username = @username", new { account.Username });
            if (userRole.ToString() == AccountRole.Admin && userRole != account.UserRole)
            {
                if (await conn.QuerySingleOrDefaultAsync<int>("select count(*) from UsersSapHelp where userRole = @userRole", new { userRole }) <= 1)
                    throw new AppException("No tan rápido, el sistema no puede quedarse sin administrador");
            }
            await conn.ExecuteAsync("update UsersSapHelp set " +
                "resetRequest = @resetRequest, " +
                "active = @active, " +
                "userRole = @userRole " +
                "where username = @username", account);
        }

        public async Task DeleteAccount(string username)
        {
            using var conn = await _context.CreateConnectionAsync();
            var userRole = await conn.QuerySingleOrDefaultAsync<int>("select top 1 userRole from UsersSapHelp where username = @username", new { username });
            if (userRole.ToString() == AccountRole.Admin)
            {
                if (await conn.QuerySingleOrDefaultAsync<int>("select count(*) from UsersSapHelp where userRole = @userRole", new { userRole }) >= 1)
                    throw new AppException("Imposible eliminar al úico administrador");
            }
            await conn.ExecuteAsync("delete UsersSapHelp where username = @username", new { username });
        }

        public async Task<LoginSuccess> RefreshToken(string token)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await GetRefreshToken(token);

            if (account.ResetRequest)
                throw new AppException("Debes elegir una nueva contraseña para continuar");
            else if (!account.Active)
                throw new AppException("Lo siento, tu cuenta ha sido desactivada");

            var refreshToken = GenerateRefreshToken();
            account.RefreshTokenExpires = refreshToken.Expires;
            account.LastAccess = DateTime.Now;

            await conn.ExecuteAsync("update UsersSapHelp set " +
                "refreshToken = @refreshToken, " +
                "refreshTokenExpires = @refreshTokenExpires, " +
                "lastAccess = @lastAccess " +
                "where username = @username", account);

            var jwtToken = GenerateJwtToken(account);

            return new LoginSuccess { Username = account.Username, JwtToken = jwtToken, RefreshToken = account.RefreshToken };
        }

        public async Task RevokeToken(string token)
        {
            var account = await GetRefreshToken(token);
            account.RefreshToken = null;
            account.RefreshTokenExpires = null;

            using var conn = await _context.CreateConnectionAsync();
            await conn.ExecuteAsync("update UsersSapHelp set " +
                "RefreshToken = @RefreshToken, " +
                "RefreshTokenExpires = @RefreshTokenExpires " +
                "where username = @username", account);
        }

        public async Task<LoginSuccess> CreateNewPassword(LoginRequest login)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<AccountModel>("select top 1 * from UsersSapHelp where username = @username", new { login.Username });
            if (account == null)
                throw new AppException("Ops, al parecer ya no tienes permiso para ingresar");
            else if (!account.Active)
                throw new AppException("Ops, al parecer ya no tienes permiso para ingresar");
            else if (!account.ResetRequest)
                throw new AppException("Te quitaron el permiso para restablecer tu contraseña");

            var jwtToken = GenerateJwtToken(account);
            var refreshToken = GenerateRefreshToken();
            account.RefreshToken = refreshToken.Token;
            account.RefreshTokenExpires = refreshToken.Expires;
            account.Password = BC.HashPassword(login.Password);
            account.LastAccess = DateTime.Now;
            account.ResetRequest = false;
            account.RemainingTries = _remainingTries;

            await conn.ExecuteAsync("update UsersSapHelp set " +
                "password = @password, " +
                "refreshToken = @refreshToken, " +
                "refreshTokenExpires = @refreshTokenExpires, " +
                "lastAccess = @lastAccess, " +
                "resetRequest = @resetRequest, " +
                "remainingTries = @remainingTries " +
                "where username = @username", account);

            return new LoginSuccess { JwtToken = jwtToken, RefreshToken = account.RefreshToken, Username = account.Username };
        }

        public async Task<AccountInfo> GetAccountInfo(string username)
        {
            using var conn = await _context.CreateConnectionAsync();

            var account = await conn.QuerySingleOrDefaultAsync<AccountInfo>("select top 1 username, name, userRole from UsersSapHelp where username = @username", new { username });
            if (account == null)
                throw new AppException("Ocurrió un error al obtener los datos de tu cuenta");

            return account;
        }

        public async Task<IEnumerable<AccountEntity>> GetUsers()
        {
            using var conn = await _context.CreateConnectionAsync();

            var users = await conn.QueryAsync<AccountEntity>("select * from UsersSapHelp order by name asc");
            return users;
        }

        public async Task<IEnumerable<EmployeeEntity>> SearchEmployees(string value)
        {
            if (string.IsNullOrEmpty(value))
                throw new AppException("¡Cuidado! la búsqueda debe tener por lo menos un valor");
            else if (value.Trim().Length < 3)
                throw new AppException("La búsqueda debe contener al menos 3 caracteres");

            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 30 exp, ltrim(rtrim(nombre)) + ' ' + ltrim(rtrim(paterno)) + ' ' + ltrim(rtrim(materno)) name, " +
                "cve_adscripcion cveAdscripcion, ltrim(rtrim(nom_adscripcion)) adscripcion";
            string from = "from cjfbdrhdf.SIRH_DF.dbo.vwEmpleadoKardex";
            string where = "where ";

            string adsc = null;
            value = value.Trim();
            if (value.Contains("?"))
            {
                adsc = value[(value.IndexOf("?") + 1)..];
                value = value[..value.IndexOf("?")].Trim();
                if (string.IsNullOrEmpty(value))
                    throw new AppException("La búsqueda debe contener caracteres además de la adscripción");

                if (!string.IsNullOrEmpty(adsc.Trim()))
                {
                    adsc = "%" + adsc.Trim().Replace(" ", "%") + "%";
                    where += "nom_adscripcion like @adsc and ";
                }
            }

            if (int.TryParse(value, out int exp))
                where += "exp = @exp";
            else
            {
                value = "%" + value.Replace(' ', '%') + "%";
                where += "(ltrim(rtrim(nombre)) + ' ' + ltrim(rtrim(paterno)) + ' ' + ltrim(rtrim(materno))) like @value";
            }

            var employees = await conn.QueryAsync<EmployeeEntity>($"{select} {from} {where}", new { exp, value, adsc });

            return employees;
        }

        private string GenerateJwtToken(AccountModel account)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.Username.ToUpper()),
                new Claim(ClaimTypes.Name, account.Name),
                new Claim(ClaimTypes.Role, account.UserRole.ToString())
            };
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(AccountConstants.JWTMinutes),
                SigningCredentials = creds
            };
            var handler = new JwtSecurityTokenHandler();
            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        private static RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken
            {
                Token = RandomTokenString(),
                Expires = DateTime.UtcNow.AddDays(AccountConstants.RefreshTokenDays),
                Created = DateTime.UtcNow
            };
        }

        private static string RandomTokenString()
        {
            using var rngCrypto = new RNGCryptoServiceProvider();
            var randomBytes = new byte[40];
            rngCrypto.GetBytes(randomBytes);
            //Convert random bytes to hex string
            return BitConverter.ToString(randomBytes).Replace("-", "");
        }

        private async Task<AccountModel> GetRefreshToken(string token)
        {
            using var conn = await _context.CreateConnectionAsync();
            var account = await conn.QueryFirstOrDefaultAsync<AccountModel>("select top 1 * from UsersSapHelp " +
                "where RefreshToken = @token and RefreshTokenExpires >= @today", new { token, today = DateTime.UtcNow });

            if (account == null)
                throw new AppException("Ups! la sesión no es válida, debes iniciar sesión nuevamente");

            return account;
        }
    }
}
