using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SAPHelp.Entities;
using SAPHelp.Entities.Account;
using SAPHelp.Models.Account;
using SAPHelp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SAPHelp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {
        private readonly IAccountService _accountService;
        private readonly IBinnacleService _binnacle;
        public AccountController(IAccountService accountService, IBinnacleService binnacle)
        {
            _accountService = accountService;
            _binnacle = binnacle;
        }

        [Authorize(Roles = AccountRole.Admin)]
        [HttpPut]
        public async Task<IActionResult> AddAccount(AccountModel account)
        {
            await _accountService.AddAccount(account);
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Authenticate(LoginRequest login)
        {
            IActionResult response = Unauthorized();
            var success = await _accountService.Authenticate(login);
            if (success != null)
            {
                SetTokenCookie(success.RefreshToken);
                response = Ok(new { token = success.JwtToken });
            }
            return response;
        }

        [Authorize(Roles = AccountRole.Admin)]
        [HttpGet("GetAccount/{username}")]
        public async Task<IActionResult> GetAccount(string username) => Ok(await _accountService.GetAccount(username));

        [Authorize(Roles = AccountRole.Admin)]
        [HttpPatch]
        public async Task<IActionResult> UpdateAccount(AccountEntity account)
        {
            await _accountService.UpdateAccount(account);
            return Ok();
        }

        [Authorize(Roles = AccountRole.Admin)]
        [HttpDelete("{username}")]
        public async Task<IActionResult> DeleteAccount(string username)
        {
            await _accountService.DeleteAccount(username);
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken()
        {
            IActionResult response = BadRequest();
            var refreshToken = Request.Cookies["_rtsp"];
            if (refreshToken != null)
            {
                var user = await _accountService.RefreshToken(refreshToken);
                SetTokenCookie(user.RefreshToken);
                response = Ok(new { token = user.JwtToken });
            }
            return response;
        }

        [Authorize]
        [HttpPost("LogOff")]
        public async Task<IActionResult> LogOff()
        {
            IActionResult response = BadRequest();
            var token = Request.Cookies["_rtsp"];
            if (token != null)
            {
                await _accountService.RevokeToken(token);
                SetTokenCookie(token, true);
                response = Ok(new { message = "La sesión se cerró pero sé que pronto volverás" });
            }
            return response;
        }

        [AllowAnonymous]
        [HttpPost("CreateNewPassword")]
        public async Task<IActionResult> CreateNewPassword(LoginRequest login)
        {
            IActionResult response = Unauthorized();
            var success = await _accountService.CreateNewPassword(login);
            if (success != null)
            {
                SetTokenCookie(success.RefreshToken);
                response = Ok(new { token = success.JwtToken });
            }
            return response;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAccountInfo()
        {
            IActionResult response = BadRequest();
            var username = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;
            if (username != null)
            {
                response = Ok(await _accountService.GetAccountInfo(username));
            }
            return response;
        }

        [Authorize(Roles = AccountRole.Admin)]
        [HttpGet("GetUsers")]
        public async Task<IActionResult> GetUsers() => Ok(await _accountService.GetUsers());

        [Authorize(Roles = AccountRole.Admin)]
        [HttpGet("GetUserBinnacle/{username}")]
        public async Task<IActionResult> GetUserBinnacle(string username) => Ok(await _binnacle.GetUserBinnacle(username));

        [Authorize(Roles = AccountRole.Admin)]
        [HttpPost("SearchEmployees")]
        public async Task<IActionResult> SearchEmployees([FromBody] string value) => Ok(await _accountService.SearchEmployees(value));

        private void SetTokenCookie(string token, Nullable<bool> delete = null)
        {
            var cookieOptions = new CookieOptions();
            cookieOptions.HttpOnly = true;
            if (delete != null)
            {
                cookieOptions.Expires = DateTime.UtcNow.AddMonths(-1);
            }
            else
            {
                cookieOptions.Expires = DateTime.UtcNow.AddDays(AccountConstants.RefreshTokenDays);
            }
            Response.Cookies.Append("_rtsp", token, cookieOptions);
        }
    }
}
