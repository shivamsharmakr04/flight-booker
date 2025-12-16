const PDFDocument = require('pdfkit');
const fs = require('fs');

async function generateTicketPDF(
  { passenger_name, airline, flight_id, route, final_price, booking_time, pnr },
  outputPath
) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    /* =====================
       HEADER BAR
       ===================== */
    doc.rect(0, 0, doc.page.width, 90).fill('#1e40af');

    // Airline icon (vector)
    doc
      .fillColor('white')
      .polygon([40, 45], [55, 30], [70, 45])
      .fill();

    doc
      .fontSize(22)
      .fillColor('white')
      .text('Flight Booker', 90, 30);

    doc.fontSize(10).text('E-TICKET / BOARDING PASS', 90, 60);

    // Status badge
    doc
      .roundedRect(doc.page.width - 170, 35, 120, 30, 6)
      .fill('#16a34a');

    doc
      .fillColor('white')
      .fontSize(10)
      .text('CONFIRMED', doc.page.width - 140, 45);

    /* =====================
       CONTENT
       ===================== */
    doc.fillColor('#000');

    const left = 40;
    const right = 350;

    // Passenger
    section(doc, left, 120, 'Passenger Name', passenger_name);
    section(doc, right, 120, 'PNR', pnr);

    // Airline
    section(doc, left, 180, 'Airline', `${airline} (${flight_id})`);

    // Route (safe separator)
    section(doc, right, 180, 'Route', route.replace(/→|–|—/g, '-'));

    // Booking Time
    section(
      doc,
      left,
      240,
      'Booking Date & Time',
      new Date(booking_time).toLocaleString()
    );

    /* =====================
       FARE BOX
       ===================== */
    doc
      .roundedRect(40, 310, doc.page.width - 80, 80, 8)
      .stroke('#1e40af');

    doc
      .fontSize(14)
      .fillColor('#1e40af')
      .text('Fare Summary', 50, 325);

    doc
      .fontSize(12)
      .fillColor('#000')
      .text(`Total Amount Paid: INR ${final_price}`, 50, 355);

    /* =====================
       FOOTER
       ===================== */
    const footerY = 430;

    bullet(doc, left, footerY, 'Carry a valid photo ID proof');
    bullet(doc, left, footerY + 18, 'Report at airport at least 2 hours before departure');
    bullet(doc, left, footerY + 36, 'This is a system-generated ticket');

    doc
      .fontSize(9)
      .fillColor('gray')
      .text(
        'Thank you for booking with Flight Booker',
        40,
        490,
        { align: 'center' }
      );

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

/* =====================
   HELPERS
   ===================== */

function section(doc, x, y, label, value) {
  doc
    .fillColor('#6b7280')
    .fontSize(10)
    .text(label, x, y);

  doc
    .fillColor('#000')
    .fontSize(12)
    .text(value, x, y + 15);
}

function bullet(doc, x, y, text) {
  doc.circle(x, y + 5, 2).fill('#1e40af');
  doc.fillColor('#000').fontSize(9).text(text, x + 10, y);
}

module.exports = { generateTicketPDF };
