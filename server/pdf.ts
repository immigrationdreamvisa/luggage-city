import fs from 'fs';
import PDFDocument from 'pdfkit';

export interface OfferLetterPdfParams {
  outputPath: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  department: string;
  location: string;
  offerIssueDate: string;
  joiningDate: string;
  compensation?: string;
  signatoryName: string;
  signatoryTitle?: string;
}

export function generateOfficialOfferLetterPdf(
  params: OfferLetterPdfParams
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 56, bottom: 56, left: 60, right: 60 },
      info: {
        Title: `Luggage City Employment Offer - ${params.applicationId}`,
        Author: 'Luggage City Human Resources',
        Subject: `Official Offer of Employment for ${params.candidateName}`,
      },
    });

    const stream = fs.createWriteStream(params.outputPath, { mode: 0o600 });
    doc.pipe(stream);

    // Brand Header Bar
    doc.rect(0, 0, doc.page.width, 96).fill('#0B172A');
    doc.rect(0, 96, doc.page.width, 3).fill('#B89352');

    doc
      .fillColor('#FAF9F6')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('LUGGAGE CITY', 60, 30, { characterSpacing: 2.5 });

    doc
      .fillColor('#D4B882')
      .font('Helvetica')
      .fontSize(9.5)
      .text('K. JAMSON GROUP  |  CANADA\'S SPECIALTY LUGGAGE RETAILER', 60, 58, {
        characterSpacing: 1.2,
      });

    doc
      .fillColor('#E5DDD0')
      .font('Helvetica')
      .fontSize(8.5)
      .text(
        'Unit 201, 200 Windflower Gate\nWoodbridge, ON L4L 9L3, Canada\nluggagecity.ca',
        370,
        32,
        { width: 180, align: 'right' }
      );

    // Document Title & Reference
    doc.y = 124;
    doc
      .fillColor('#B89352')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('OFFICIAL OFFER OF EMPLOYMENT', { characterSpacing: 1.5 });

    doc.moveDown(0.5);
    doc
      .fillColor('#0B172A')
      .font('Helvetica')
      .fontSize(10)
      .text(`Issue Date: ${params.offerIssueDate}`)
      .text(`Reference Application ID: ${params.applicationId}`);

    doc.moveDown(1.2);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`Dear ${params.candidateName},`);

    doc.moveDown(0.7);
    doc
      .font('Helvetica')
      .fontSize(10.5)
      .fillColor('#1E293B')
      .text(
        `We are pleased to formally extend this offer of employment for the position of ${params.positionTitle} within our ${params.department} team at Luggage City (K. Jamson Group). Following our review of your background and conversations with our leadership team, we are confident that your expertise and dedication to customer excellence will make a valued contribution to our organization.`,
        { lineGap: 4 }
      );

    // Summary Table Box
    doc.moveDown(1.2);
    const boxTop = doc.y;
    doc
      .roundedRect(60, boxTop, doc.page.width - 120, params.compensation ? 148 : 124, 4)
      .fillAndStroke('#FAF9F6', '#E5DDD0');

    const rows: Array<[string, string]> = [
      ['Position Title', params.positionTitle],
      ['Department', params.department],
      ['Primary Work Location', params.location],
      ['Anticipated Joining Date', params.joiningDate],
      ['Candidate Email', params.candidateEmail],
    ];
    if (params.compensation) {
      rows.push(['Compensation Package', params.compensation]);
    }

    let rowY = boxTop + 14;
    for (const [label, value] of rows) {
      doc
        .fillColor('#64748B')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(label.toUpperCase(), 76, rowY, { width: 170 });
      doc
        .fillColor('#0B172A')
        .font('Helvetica')
        .fontSize(10)
        .text(value, 255, rowY, { width: 280 });
      rowY += 20;
    }

    doc.y = boxTop + (params.compensation ? 166 : 142);

    doc
      .fillColor('#0B172A')
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .text('Employment Terms & Next Steps');

    doc.moveDown(0.4);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#1E293B')
      .text(
        'This offer is subject to standard onboarding verification, completion of Canadian payroll and tax documentation, and adherence to Luggage City workplace policies. Employee benefits, product privileges, and training schedules will be reviewed during your first week of orientation.',
        { lineGap: 4 }
      );

    doc.moveDown(0.8);
    doc.text(
      'Please confirm your acceptance of this offer by replying to our Human Resources team at careers@luggagecity.ca or contacting our Woodbridge head office prior to your scheduled joining date.',
      { lineGap: 4 }
    );

    doc.moveDown(1.6);
    doc
      .fillColor('#0B172A')
      .font('Helvetica')
      .fontSize(10.5)
      .text('Warm regards,');

    doc.moveDown(1.4);
    doc
      .moveTo(60, doc.y)
      .lineTo(240, doc.y)
      .strokeColor('#B89352')
      .lineWidth(1)
      .stroke();

    doc.moveDown(0.4);
    doc
      .font('Helvetica-Bold')
      .fontSize(10.5)
      .fillColor('#0B172A')
      .text(params.signatoryName);

    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor('#475569')
      .text(params.signatoryTitle || 'Human Resources & Talent Acquisition, Luggage City');

    // Footer
    doc
      .fontSize(8)
      .fillColor('#64748B')
      .text(
        `Confidential Employment Document  |  Application ID: ${params.applicationId}  |  Issued by Authorized Luggage City HR Portal`,
        60,
        doc.page.height - 46,
        { width: doc.page.width - 120, align: 'center' }
      );

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
}
