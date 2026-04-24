const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');
(async () => {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < 5; i++) {
    const page = pdfDoc.addPage();
    page.drawText(`This is a test PDF page ${i+1}!`, { x: 50, y: 700, size: 30, color: rgb(0, 0, 0) });
  }
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('test_book_valid.pdf', pdfBytes);
  console.log('PDF generated successfully');
})();
