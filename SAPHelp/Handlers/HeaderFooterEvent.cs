using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using iTextSharp;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Hosting;

namespace SAPHelp.Handlers
{
    public class HeaderFooterEvent : PdfPageEventHelper
    {
        private readonly IWebHostEnvironment _env;
        public HeaderFooterEvent(IWebHostEnvironment env)
        {
            _env = env;
        }
        public override void OnEndPage(PdfWriter writer, Document doc)
        {
            float xPos = (doc.Right - doc.Left) / 2 + doc.LeftMargin;

            PdfContentByte cb = writer.DirectContent;

            //Header
            float docWidth = doc.PageSize.Width - 114f;
            string logoPath = Path.Combine(_env.WebRootPath, "saplogo.png");

            Image logo = Image.GetInstance(logoPath);
            logo.ScaleAbsolute(64, 31.7f);

            PdfPTable table = new PdfPTable(2);
            table.TotalWidth = doc.PageSize.Width - doc.LeftMargin;

            PdfPCell cell = new();
            cell.HorizontalAlignment = Element.ALIGN_LEFT;
            cell.BorderWidth = 0;
            cell.AddElement(logo);
            table.AddCell(cell);

            cell = new();
            cell.BorderWidth = 0;
            Paragraph title = new("Guía de SAP Help", new Font(Font.FontFamily.HELVETICA, 11f, Font.NORMAL, BaseColor.DARK_GRAY));
            title.Alignment = Element.ALIGN_RIGHT;
            cell.AddElement(title);
            cell.HorizontalAlignment = Element.ALIGN_RIGHT;
            table.AddCell(cell);

            table.WriteSelectedRows(0, -1, (doc.LeftMargin / 2), (doc.Top + (doc.TopMargin / 1.7f)), cb);

            //Footer
            Phrase footer = new("Página " + doc.PageNumber, new Font(Font.FontFamily.HELVETICA, 12f, Font.NORMAL, BaseColor.DARK_GRAY));
            ColumnText.ShowTextAligned(cb, Element.ALIGN_RIGHT, footer, doc.Right, (doc.Bottom - (doc.BottomMargin / 2.2f)), 0);
        }
    }
}
