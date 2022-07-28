using SAPHelp.Data;
using SAPHelp.Entities.Guides;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using SAPHelp.Handlers;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using MimeKit;
using iTextSharp;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using SAPHelp.Entities.Account;

namespace SAPHelp.Services
{
    public interface IGuideService
    {
        Task<IEnumerable<GroupGuideEntity>> GetRecentGuides();
        Task<IEnumerable<GroupGuideEntity>> GetGuides(string value);
        Task<GuideEntity> GetGuideById(int id);
        Task<IEnumerable<StepEntity>> GetGuideSteps(int idGuide);
        Task<int> AddGuide(GuideEntity guide);
        Task UpdateGuide(GuideEntity guide);
        Task DeleteGuide(int idGuide);
        Task AddGuideStep(StepPost post);
        Task UpdateGuideStep(StepPost post);
        Task DeleteGuideStep(int idStep);
        Task ChangeStepsPosition(IEnumerable<StepEntity> steps);
        Task<(byte[], string, string)> DownloadStepFile(int idStep);
        Task<(byte[], string, string)> GenerateGuidePdf(int idGuide);
    }
    public class GuideService : IGuideService
    {
        private readonly IDatabaseConnection _context;
        private readonly IWebHostEnvironment _env;
        private readonly string _fileUrl = "repository/";
        private readonly string _repository = "saphelp_repository";
        private readonly IBinnacleService _binnacle;
        private readonly string _username;
        private readonly long _maxFileLength = (long)Math.Pow(2, 20) * 20;  //20 Mb
        private readonly string[] _mimeTypes = new string[] { "image/","application/pdf","application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation","application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/plain","application/xml","text/xml" };
        public GuideService(IDatabaseConnection context, IWebHostEnvironment env, IBinnacleService binnacle, IHttpContextAccessor http)
        {
            _context = context;
            _env = env;
            _binnacle = binnacle;
            _username = http.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier).Value;
        }

        public async Task<IEnumerable<GroupGuideEntity>> GetRecentGuides()
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 20 a.fiIdGuide idGuide, a.fiIdCat idCat, c.fcCategory category, a.fcTitle title, a.fiViews views, a.fcTags tags, a.fdFchAlta alta";
            string from = "from SHGuide a inner join SHCategory c on a.fiIdCat = c.fiIdCat";
            
            var guides = await conn.QueryAsync<GuideEntity>($"{select} {from} order by a.fdFchAlta desc, c.fcCategory asc, a.fcTitle asc");
            var group = guides.GroupBy(g => g.Category, (cat, list) => new GroupGuideEntity
            {
                Category = cat,
                Guides = list.OrderBy(l => l.Title)
            });

            return group;
        }

        public async Task<IEnumerable<GroupGuideEntity>> GetGuides(string value)
        {
            if (string.IsNullOrEmpty(value))
                throw new AppException("Debes especificar un valor en la búsqueda");
            
            string binValue = value;
            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity { Action = "Búsqueda de guías", Object = binValue }, _username));
            
            using var conn = await _context.CreateConnectionAsync();

            value = value.Replace(' ', '%');

            string select = "select top 50 a.fiIdGuide idGuide, a.fiIdCat idCat, c.fcCategory category, a.fcTitle title, a.fiViews views, a.fcTags tags, a.fdFchAlta alta";
            string from = "from SHGuide a inner join SHCategory c on a.fiIdCat = c.fiIdCat";
            string where = $"where c.fcCategory like '%{value}%' or a.fcTitle like '%{value}%' or a.fcTags like '%{value}%'";

            var guides = await conn.QueryAsync<GuideEntity>($"{select} {from} {where} order by c.fcCategory asc, a.fcTitle asc");
            var group = guides.GroupBy(g => g.Category, (cat, list) => new GroupGuideEntity
            {
                Category = cat,
                Guides = list.OrderBy(l => l.Title)
            });

            return group;
        }

        public async Task<GuideEntity> GetGuideById(int id)
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 1 a.fiIdGuide idGuide, a.fiIdCat idCat, c.fcCategory category, a.fcTitle title, a.fiViews views, " +
                "a.fdFchLastView lastView, a.fcTags tags, a.fdFchAlta alta";
            string from = "from SHGuide a inner join SHCategory c on a.fiIdCat = c.fiIdCat";

            var guide = await conn.QuerySingleOrDefaultAsync<GuideEntity>($"{select} {from} where a.fiIdGuide = @id", new { id });

            if (guide == null)
                throw new AppException("Lo siento no pude encontrar la guía que solicitaste");

            await conn.ExecuteAsync("update SHGuide set " +
                "fdFchLastView = @today, " +
                "fiViews = @views " +
                "where fiIdGuide = @id", new { today = DateTime.Now, views = ++guide.Views, id });

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Guía",
                Object = $"Visualizó: {guide.Title}, ID: {id}"
            }, _username));

            return guide;
        }

        public async Task<IEnumerable<StepEntity>> GetGuideSteps(int idGuide)
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select fiIdStep IdStep, fiIdGuide IdGuide, fcTransaction TransactionTxt, fcText StepTxt, fcUrl FileUrl, fiPosition position, fbImage isImage";
            var steps = await conn.QueryAsync<StepEntity>($"{select} from SHGuideStep where fiIdGuide = @idGuide order by fiPosition asc", new { idGuide });
            foreach (var step in steps)
            {
                if (step.FileUrl != null)
                    step.FileUrl = Path.Combine(_fileUrl, step.FileUrl.TrimStart('/', '\\'));
            }
            return steps;
        }

        public async Task<int> AddGuide(GuideEntity guide)
        {
            using var conn = await _context.CreateConnectionAsync();

            guide.Alta = DateTime.Now;
            guide.LastView = null;
            var idGuide = await conn.QuerySingleOrDefaultAsync<int?>("insert into SHGuide output inserted.fiIdGuide values (" +
                "@idCat, @title, null, @alta, @views, @lastView, @tags)", guide);

            if (idGuide == null)
                throw new AppException("Algo salió mal, no pude guardar la guía, intenta más tarde");

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Guía",
                Object = $"Agregó: {guide.Title}, ID: {idGuide}"
            }, _username));

            return idGuide.Value;
        }

        public async Task UpdateGuide(GuideEntity guide)
        {
            using var conn = await _context.CreateConnectionAsync();

            await conn.ExecuteAsync("update SHGuide set " +
                "fiIdCat = @idCat, " +
                "fcTitle = @title, " +
                "fcTags = @tags " +
                "where fiIdGuide = @idGuide", guide);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Guía",
                Object = $"Actualizó: {guide.Title}, ID: {guide.IdGuide}"
            }, _username));
        }

        public async Task DeleteGuide(int idGuide)
        {
            using var conn = await _context.CreateConnectionAsync();

            var url = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcUrl from SHGuideStep where fcUrl is not null and fiIdGuide = @idGuide", new { idGuide });

            if (url != null)
            {
                url = url.TrimStart('/', '\\');
                string directory = Path.GetDirectoryName(url);
                string folder = Path.Combine(_env.ContentRootPath, @"..\", _repository, directory);
                folder = Path.GetFullPath(folder);
                if (Directory.Exists(folder))
                    Directory.Delete(folder, true);
            }
            var guide = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcTitle from SHGuide where fiIdGuide = @idGuide", new { idGuide });

            await conn.ExecuteAsync("delete SHGuideStep where fiIdGuide = @idGuide", new { idGuide });
            await conn.ExecuteAsync("delete SHGuide where fiIdGuide = @idGuide", new { idGuide });

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Guía",
                Object = $"Eliminó: {guide}, ID: {idGuide}"
            }, _username));
        }

        public async Task AddGuideStep(StepPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            if (post.File != null)
            {
                //File type compatibility
                if (!post.File.ContentType.Contains("image/") && !_mimeTypes.Any(m => m == post.File.ContentType))
                    throw new AppException("Lo siento, el archivo no es compatible");
                //File max length
                if (post.File.Length > _maxFileLength)
                    throw new AppException($"Alto ahí, excediste el tamaño máximo de {_maxFileLength / Math.Pow(2, 20)} Mb");
                //Determine if file is image
                post.Step.IsImage = post.File.ContentType.Contains("image/");
                //File Name
                post.Step.FileUrl = Path.Combine(post.Step.IdGuide.ToString(), DateTime.Now.ToString("yyMMddhmmss") + Path.GetExtension(post.File.FileName));
                //Server Path
                string serverPath = Path.Combine(_env.ContentRootPath, @"..\", _repository);
                serverPath = Path.GetFullPath(serverPath);
                //File Path
                string filePath = Path.Combine(serverPath, post.Step.FileUrl);

                //Create Directory
                if (!Directory.Exists(Path.Combine(serverPath, post.Step.IdGuide.ToString())))
                    Directory.CreateDirectory(Path.Combine(serverPath, post.Step.IdGuide.ToString()));
                //Save file
                using Stream fs = new FileStream(filePath, FileMode.Create);
                await post.File.CopyToAsync(fs);
            }

            var position = await conn.QuerySingleOrDefaultAsync<int?>("select top 1 fiPosition from SHGuideStep " +
                "where fiIdGuide = @idGuide order by fiPosition desc", new { post.Step.IdGuide });
            if (position != null)
                post.Step.Position = position + 1;
            else
                post.Step.Position = 0;

            await conn.ExecuteAsync("insert into SHGuideStep values (" +
                "@idGuide, @transactionTxt, @stepTxt, @fileUrl, @position, @isImage)", post.Step);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Paso de Guía",
                Object = $"Agregó: {post.Step.TransactionTxt}, posición: {post.Step.Position}, guía ID: {post.Step.IdGuide}"
            }, _username));
        }

        public async Task UpdateGuideStep(StepPost post)
        {
            using var conn = await _context.CreateConnectionAsync();

            string select = "select top 1 fiIdStep IdStep, fiIdGuide IdGuide, fcTransaction TransactionTxt, fcText StepTxt, fcUrl FileUrl, " +
                    "fiPosition position, fbImage isImage";
            var step = await conn.QuerySingleOrDefaultAsync<StepEntity>($"{select} from SHGuideStep where fiIdStep = @idStep", new { post.Step.IdStep });
            if (step == null)
                throw new AppException("Lo siento no pude encontrar el paso y por lo tanto no pude actualizarlo");

            //Delete previous file if exists
            if (step.FileUrl != null && post.Step.FileUrl == null)
            {
                string fileUrlPath = Path.Combine(_env.ContentRootPath, @"..\", _repository, step.FileUrl.TrimStart('/', '\\'));
                fileUrlPath = Path.GetFullPath(fileUrlPath);
                if (File.Exists(fileUrlPath))
                    File.Delete(fileUrlPath);
                step.FileUrl = null;
                step.IsImage = false;
            }

            if (post.File != null && step.FileUrl == null)
            {
                //File type compatibility
                if (!post.File.ContentType.Contains("image/") && !_mimeTypes.Any(m => m == post.File.ContentType))
                    throw new AppException("Lo siento, el archivo no es compatible");
                //File max length
                if (post.File.Length > _maxFileLength)
                    throw new AppException($"Alto ahí, excediste el tamaño máximo de {_maxFileLength / Math.Pow(2, 20)} Mb");
                //Determine if file is image
                post.Step.IsImage = post.File.ContentType.Contains("image/");
                //File Name
                post.Step.FileUrl = Path.Combine(post.Step.IdGuide.ToString(), DateTime.Now.ToString("yyMMddhmmss") + Path.GetExtension(post.File.FileName));
                //Server Path
                string serverPath = Path.Combine(_env.ContentRootPath, @"..\", _repository);
                serverPath = Path.GetFullPath(serverPath);
                //File Path
                string filePath = Path.Combine(serverPath, post.Step.FileUrl);

                //Create Directory
                if (!Directory.Exists(Path.Combine(serverPath, post.Step.IdGuide.ToString())))
                    Directory.CreateDirectory(Path.Combine(serverPath, post.Step.IdGuide.ToString()));
                //Save file
                using Stream fs = new FileStream(filePath, FileMode.Create);
                await post.File.CopyToAsync(fs);
            }
            else
            {
                post.Step.FileUrl = step.FileUrl;
                post.Step.IsImage = step.IsImage;
            }

            await conn.ExecuteAsync("update SHGuideStep set " +
                "fcTransaction = @transactionTxt, " +
                "fcText = @stepTxt, " +
                "fcUrl = @fileUrl, " +
                "fbImage = @isImage " +
                "where fiIdStep = @idStep", post.Step);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Paso de Guía",
                Object = $"Actualizó posición: {step.Position}, guía ID: {step.IdGuide}"
            }, _username));
        }

        public async Task DeleteGuideStep(int idStep)
        {
            using var conn = await _context.CreateConnectionAsync();

            string columns = "fiIdStep IdStep, fiIdGuide IdGuide, fcTransaction TransactionTxt, fcText StepTxt, fcUrl FileUrl, fiPosition position, fbImage isImage";
            var step = await conn.QuerySingleOrDefaultAsync<StepEntity>($"select top 1 {columns} from SHGuideStep where fiIdStep = @idStep", new { idStep });
            if (step == null)
                throw new AppException("Lo siento no puede encontrar el paso y por lo tanto no pude eliminarlo");

            if (step.FileUrl != null)
            {
                string filePath = Path.Combine(_env.ContentRootPath, @"..\", _repository, step.FileUrl.TrimStart('/', '\\'));
                filePath = Path.GetFullPath(filePath);
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }

            await conn.ExecuteAsync("delete SHGuideStep where fiIdStep = @idStep", new { idStep });

            var steps = await conn.QueryAsync<StepEntity>($"select {columns} from SHGuideStep where fiIdGuide = @idGuide order by fiPosition asc", new { step.IdGuide });
            int count = 0;
            foreach (var item in steps)
            {
                await conn.ExecuteAsync("update SHGuideStep set fiPosition = @count where fiIdStep = @idStep", new { count, item.IdStep });
                count++;
            }

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Paso de Guía",
                Object = $"Eliminó posición: {step.Position}, guía ID: {step.IdGuide}"
            }, _username));
        }

        public async Task ChangeStepsPosition(IEnumerable<StepEntity> steps)
        {
            using var conn = await _context.CreateConnectionAsync();

            steps = steps.OrderBy(o => o.Position);
            int count = 0;
            foreach (var item in steps)
            {
                await conn.ExecuteAsync("update SHGuideStep set fiPosition = @count where fiIdStep = @idStep", new { count, item.IdStep });
                count++;
            }
        }

        public async Task<(byte[], string, string)> DownloadStepFile(int idStep)
        {
            using var conn = await _context.CreateConnectionAsync();

            var url = await conn.QuerySingleOrDefaultAsync<string>("select top 1 fcUrl from SHGuideStep " +
                "where fiIdStep = @idStep and fbImage = @isImage", new { idStep, isImage = false });
            if (url == null)
                throw new AppException("No existe ningún archivo para descargar");

            url = url.TrimStart('/', '\\');
            string fileName = Path.GetFileName(url);
            string contentType = MimeTypes.GetMimeType(fileName);

            string filePath = Path.Combine(_env.ContentRootPath, @"..\", _repository, url);
            filePath = Path.GetFullPath(filePath);

            using var stream = File.Open(filePath, FileMode.Open);
            var fileBytes = new byte[stream.Length];
            await stream.ReadAsync(fileBytes);

            return (fileBytes, contentType, fileName);
        }

        public async Task<(byte[], string, string)> GenerateGuidePdf(int idGuide)
        {
            using var conn = await _context.CreateConnectionAsync();

            var guide = await GetGuideById(idGuide);
            if (guide == null)
                throw new AppException("Ups algo salió mal no pude encontrar la guía, intenta más tarde");
            var steps = await GetGuideSteps(idGuide);
            if (!steps.Any())
                throw new AppException("No puedo generar la guía hasta que contenga pasos. Genera un nuevo paso primero");

            byte[] pdf = GeneratePdf(guide, steps);

            _ = Task.Run(async () => await _binnacle.AddBinnacle(new BinnacleEntity
            {
                Action = "Generación de PDF",
                Object = $"Guía: {guide.Title}, ID: {guide.IdGuide}"
            }, _username));

            return (pdf, "application/pdf", guide.Title + ".pdf");
        }

        private byte[] GeneratePdf(GuideEntity guide, IEnumerable<StepEntity> steps)
        {
            MemoryStream ms = new();

            Document doc = new(PageSize.LETTER, 72, 72, 72, 72);
            doc.AddTitle(guide.Title);
            doc.AddCreator("SAP Help 2021");
            doc.AddAuthor("Erik F. Pérez");

            PdfWriter writer = PdfWriter.GetInstance(doc, ms);
            HeaderFooterEvent hf = new(_env);
            writer.PageEvent = hf;
            doc.Open();

            Font headerFont = new(Font.FontFamily.HELVETICA, 16f, Font.BOLD, BaseColor.BLACK);
            Font normalFont = new(Font.FontFamily.HELVETICA, 12f, Font.NORMAL, BaseColor.BLACK);
            Font boldFont = new(Font.FontFamily.HELVETICA, 12f, Font.BOLD, BaseColor.BLACK);

            doc.Add(new Paragraph(guide.Title, headerFont));

            PdfPTable table = new(2);
            table.WidthPercentage = 100f;
            PdfPCell cellHead = new(new Phrase("Categoría: " + guide.Category, normalFont))
            {
                BorderWidth = 0,
                HorizontalAlignment = Element.ALIGN_LEFT
            };
            table.AddCell(cellHead);
            cellHead = new PdfPCell(new Phrase("Fecha de creación: " + guide.Alta.ToShortDateString(), normalFont))
            {
                BorderWidth = 0,
                HorizontalAlignment = Element.ALIGN_RIGHT
            };
            table.AddCell(cellHead);
            table.SpacingBefore = table.SpacingAfter = 15f;
            doc.Add(table);

            string transaction = string.Empty;
            Font txFont = new(Font.FontFamily.HELVETICA, 13f, Font.BOLD, BaseColor.BLACK);
            foreach (StepEntity step in steps)
            {
                PdfPTable content = new(1);
                content.SpacingAfter = content.SpacingBefore = 10f;
                content.WidthPercentage = 100f;

                if (transaction != step.TransactionTxt)
                {
                    Paragraph txPr = new("Transacción " + step.TransactionTxt, txFont);
                    txPr.Alignment = Element.ALIGN_JUSTIFIED;
                    PdfPCell txCell = new();
                    txCell.AddElement(txPr);
                    txCell.PaddingTop = txCell.PaddingBottom = 5f;
                    txCell.BorderWidth = 0;
                    txCell.HorizontalAlignment = Element.ALIGN_CENTER;
                    content.AddCell(txCell);
                    transaction = step.TransactionTxt;
                }

                if (step.IsImage)
                {
                    step.FileUrl = step.FileUrl.Replace(_fileUrl, string.Empty);
                    Image img = Image.GetInstance(Path.GetFullPath(Path.Combine(_env.ContentRootPath, @"..\", _repository, step.FileUrl)));
                    if (img.Width > (doc.Right - doc.LeftMargin - 20))
                    {
                        float ratio = (doc.Right - doc.LeftMargin - 20) / img.Width;
                        img.ScaleAbsolute((ratio * img.Width), (ratio * img.Height));
                    }
                    PdfPCell cell = new(img, false);
                    cell.PaddingTop = cell.PaddingBottom = 5f;
                    cell.BorderWidth = 0;
                    cell.HorizontalAlignment = Element.ALIGN_CENTER;
                    content.AddCell(cell);
                }
                Paragraph pr = new(step.StepTxt, normalFont)
                {
                    Alignment = Element.ALIGN_JUSTIFIED
                };
                PdfPCell cellp = new();
                cellp.AddElement(pr);
                cellp.PaddingTop = cellp.PaddingBottom = 5f;
                cellp.BorderWidth = 0;
                cellp.HorizontalAlignment = Element.ALIGN_JUSTIFIED;
                content.AddCell(cellp);
                doc.Add(content);
            }

            doc.Close();

            return ms.ToArray();
        }
    }
}
