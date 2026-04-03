const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');

const GENERATED_DIR = path.join(__dirname, '..', 'generated', 'firs');

async function ensureDirectory() {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

function renderFirTemplate(fir) {
  const safe = (value) => (value == null ? '' : String(value));
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>FIR ${safe(fir.applicationNumber || fir.id)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
          .row { margin-bottom: 10px; }
          .label { font-weight: bold; }
          h1 { margin: 0 0 12px; }
          h2 { margin: 18px 0 8px; font-size: 18px; }
          .box { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
        </style>
      </head>
      <body>
        <h1>First Information Report</h1>
        <div class="row"><span class="label">Application Number:</span> ${safe(fir.applicationNumber)}</div>
        <div class="row"><span class="label">Status:</span> ${safe(fir.status)}</div>
        <div class="row"><span class="label">Incident Type:</span> ${safe(fir.incidentType)}</div>
        <div class="row"><span class="label">Incident Date:</span> ${safe(fir.incidentDate)}</div>
        <div class="row"><span class="label">Location:</span> ${safe(fir.location)}</div>
        <div class="row"><span class="label">Estimated Loss:</span> INR ${safe(fir.estimatedLoss)}</div>

        <h2>Contact Details</h2>
        <div class="box">${safe(JSON.stringify(fir.contactDetails || {}, null, 2)).replace(/\n/g, '<br/>')}</div>

        <h2>Incident Narrative</h2>
        <div class="box">${safe(fir.incidentNarrative).replace(/\n/g, '<br/>')}</div>

        <h2>Suspect Details</h2>
        <div class="box">${safe(JSON.stringify(fir.suspectDetails || {}, null, 2)).replace(/\n/g, '<br/>')}</div>
      </body>
    </html>
  `;
}

async function generateFirPdf(fir, baseUrl) {
  await ensureDirectory();

  const filename = `fir-${fir.id}.pdf`;
  const filePath = path.join(GENERATED_DIR, filename);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(renderFirTemplate(fir), { waitUntil: 'networkidle0' });
    await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  return `${baseUrl}/generated/firs/${filename}`;
}

module.exports = {
  generateFirPdf
};
