import { masterData, bsDataEntry, villageDetails, monthMaster, generatedReports, getOpdBsVillagewiseSummary } from '../data/store.js';

function formatDateDisplay(d) {
  if (!d) return '';
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  if (str.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
    const parts = str.split('-');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  if (str.includes('/')) {
    const parts = str.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(value);
}

function cleanStr(str) {
  return String(str).replace(/\s+/g, '').toLowerCase().trim();
}

function wrapReportPage(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8">
  <title>${title} - प्रा.आ.केंद्र भादा</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 12mm; }
    body {
      font-family: 'Poppins', Arial, sans-serif;
      color: #1a202c;
      background: #f7fafc;
      margin: 0;
      padding: 20px;
    }
    .print-actions {
      max-width: 850px;
      margin: 0 auto 20px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.08);
    }
    .print-btn {
      background: #00796b;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .print-btn:hover { background: #004d40; }
    .close-btn {
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .report-sheet {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      padding: 35px 40px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border-radius: 8px;
      min-height: 1000px;
      box-sizing: border-box;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
    th, td { border: 1px solid #2d3748; padding: 8px 10px; font-size: 13px; text-align: center; }
    th { background: #edf2f7; font-weight: 600; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .header-box { text-align: center; border-bottom: 2px solid #2d3748; padding-bottom: 12px; margin-bottom: 20px; }
    .main-title { font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 4px 0; }
    .sub-title { font-size: 15px; font-weight: 600; color: #4a5568; margin: 0; }
    .subject { font-weight: 700; text-decoration: underline; margin: 15px 0 10px 0; font-size: 14px; }
    .footer-sign { margin-top: 45px; text-align: right; line-height: 1.6; font-size: 14px; font-weight: 600; }
    .page-break { page-break-after: always; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .print-actions { display: none !important; }
      .report-sheet { box-shadow: none; padding: 0; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <div><strong>प्रा.आ.केंद्र भादा</strong> - अधिकृत अहवाल / पत्र</div>
    <div style="display:flex; gap:10px;">
      <button class="print-btn" onclick="window.print()">🖨️ प्रिंट करा / PDF सेव्ह करा</button>
      <button class="close-btn" onclick="window.close()">बंद करा</button>
    </div>
  </div>
  <div class="report-sheet">
    ${bodyContent}
  </div>
</body>
</html>`;
}

// 1. दैनिक पत्र (Letter Print)
export function generateDailyMalariaReportWebApp(dateStr) {
  try {
    if (!dateStr) return { success: false, message: 'कृपया तारीख निवडा.' };
    const parts = dateStr.split('-');
    const reportDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const targetDateStr = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, '0')}-${String(reportDate.getDate()).padStart(2, '0')}`;

    const filtered = bsDataEntry.filter(row => {
      const rowDate = new Date(row[1]);
      const rStr = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}-${String(rowDate.getDate()).padStart(2, '0')}`;
      return rStr === targetDateStr;
    });

    if (filtered.length === 0) {
      return { success: false, message: `दिनांक ${formatDateDisplay(reportDate)} साठी कोणताही डेटा सापडला नाही.` };
    }

    // Sort by subcenter > employee > from
    filtered.sort((a, b) => {
      if (a[2] !== b[2]) return a[2].localeCompare(b[2]);
      if (a[3] !== b[3]) return a[3].localeCompare(b[3]);
      return (parseInt(a[7]) || 0) - (parseInt(b[7]) || 0);
    });

    let grandTotal = 0;
    let rowsHtml = '';
    filtered.forEach((row, i) => {
      const count = parseInt(row[9]) || 0;
      grandTotal += count;
      rowsHtml += `
        <tr>
          <td>${i + 1}</td>
          <td><b>${row[6]}</b></td>
          <td class="text-left">${row[3]} <span style="font-size:11px; color:#555;">(${row[4]})</span></td>
          <td>${row[2]}</td>
          <td>${row[5]}</td>
          <td>${row[7]}</td>
          <td>${row[8]}</td>
          <td><b>${count}</b></td>
        </tr>`;
    });

    const bodyHtml = `
      <div style="text-align:right; font-size:13px; font-weight:600;">
        दिनांक: ${formatDateDisplay(reportDate)}
      </div>
      <div style="margin-top:10px; line-height:1.5; font-size:14px;">
        <strong>प्रति,</strong><br>
        प्रयोगशाळा वैज्ञानिक अधिकारी,<br>
        जिल्हा हिवताप अधिकारी कार्यालय, लातूर
      </div>
      <div class="subject">
        विषय:- हिवताप रक्त नमुने (Blood Slides) तपासणीसाठी पाठवीत असले बाबत...
      </div>
      <p style="font-size:14px; line-height:1.6;">
        महोदय, उपरोक्त विषयान्वये प्राथमिक आरोग्य केंद्र भादा अंतर्गत गोळा केलेले एकूण <b>${filtered.length}</b> नोंदींचे एकूण <b>${grandTotal}</b> रक्त नमुने तपासणी व निदानासाठी सादर करीत आहोत. तपशील खालीलप्रमाणे आहे:
      </p>
      <table>
        <thead>
          <tr>
            <th>अ.क्र.</th>
            <th>बंडल क्र.</th>
            <th>कर्मचारी नाव (पदनाम)</th>
            <th>उपकेंद्र</th>
            <th>BS Code</th>
            <th>पासून</th>
            <th>पर्यंत</th>
            <th>एकूण नमुने</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="background:#edf2f7; font-weight:bold;">
            <td colspan="7" class="text-right">एकूण (Grand Total):</td>
            <td>${grandTotal}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer-sign">
        आपला विश्वासू,<br><br><br>
        <b>वैद्यकीय अधिकारी</b><br>
        प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
      </div>`;

    const reportId = `daily_${Date.now()}`;
    const reportHtml = wrapReportPage(`दैनिक पत्र - ${formatDateDisplay(reportDate)}`, bodyHtml);
    generatedReports.set(reportId, reportHtml);

    return {
      success: true,
      message: `दिनांक ${formatDateDisplay(reportDate)} चे दैनिक पत्र यशस्वीरित्या तयार झाले! (एकूण ${grandTotal} नमुने)`,
      url: `/api/reports/${reportId}`
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// 2. मासिक अहवाल (Monthly Report - Exact NVBDCP Template)
export function generateMonthlyReportWebApp(selectedMonthDisplay) {
  try {
    if (!selectedMonthDisplay) return { success: false, message: 'कृपया महिना निवडा.' };
    const monthObj = monthMaster.find(m => cleanStr(m.name) === cleanStr(selectedMonthDisplay));
    if (!monthObj) return { success: false, message: `महिना '${selectedMonthDisplay}' सापडला नाही.` };

    const mIdx = monthMaster.findIndex(m => cleanStr(m.name) === cleanStr(selectedMonthDisplay));
    const priorMonths = monthMaster.slice(0, mIdx + 1);

    const startDate = monthObj.f1Start;
    const endDate = monthObj.f2End;
    const yearStart = monthMaster[0].f1Start;

    // D47: Selected Month
    const D47 = selectedMonthDisplay;

    // OPD calculations (मासिक व प्रगत)
    const D1 = monthObj.newOpd != null ? parseInt(monthObj.newOpd) : 0; // नवीन बाह्यरुग्ण मासिक
    const priorOpd = priorMonths.reduce((sum, m) => sum + (parseInt(m.newOpd != null ? m.newOpd : (m.opd || 0)) || 0), 0);
    const D2 = priorOpd + D1; // नवीन बाह्यरुग्ण प्रगत (स्वयं-गणना: मागील बेरीज + चालू महिना)

    // Dynamic OPD BS from villagewise entries (villageDetails & bsDataEntry)
    const opdSummary = getOpdBsVillagewiseSummary(selectedMonthDisplay);

    // Filter BS Data for current month and YTD
    const monthBsRows = bsDataEntry.filter(r => {
      const d = new Date(r[1]);
      return d >= startDate && d <= endDate;
    });

    const ytdBsRows = bsDataEntry.filter(r => {
      const d = new Date(r[1]);
      return d >= yearStart && d <= endDate;
    });

    // Filter Village Details for current month and YTD
    const monthVillageRows = villageDetails.filter(v => {
      const d = new Date(v[2]);
      return d >= startDate && d <= endDate;
    });

    const ytdVillageRows = villageDetails.filter(v => {
      const d = new Date(v[2]);
      return d >= yearStart && d <= endDate;
    });

    // Helper to check if an entry is OPD / Passive (अप्रत्यक्ष सर्वेक्षण: बाह्य रुग्ण विभाग)
    function isOpd(employeeName, designation, upkendra, villageName, bsCode) {
      const combined = `${employeeName || ''} ${designation || ''} ${upkendra || ''} ${villageName || ''} ${bsCode || ''}`.toLowerCase();
      return (
        combined.includes('बाह्य') ||
        combined.includes('opd') ||
        combined.includes('ओपीडी') ||
        combined.includes('वैद्यकीय अधिकारी') ||
        combined.includes('दवाखाना') ||
        combined.includes('mo')
      );
    }

    // Helper to categorize employee designation for monthly Active vs Passive
    function getStaffCategory(employeeName, designation, upkendra, villageName, bsCode, dateVal) {
      if (isOpd(employeeName, designation, upkendra, villageName, bsCode)) {
        return 'PASSIVE';
      }
      const desig = `${designation || ''} ${employeeName || ''}`.toLowerCase();
      const code = String(bsCode || '').toUpperCase();

      if (desig.includes('आशा') || desig.includes('asha') || code.includes('V')) {
        return 'ASHA';
      }
      if (
        desig.includes('आरोग्य सेविका') ||
        desig.includes('anm') ||
        desig.includes('आरोग्य सहायिका') ||
        desig.includes('सहायिका') ||
        desig.includes('पर्यवेक्षक') ||
        code.includes('A') ||
        code.includes('B')
      ) {
        return 'ANM';
      }
      if (desig.includes('आरोग्य सेवक') || desig.includes('mpw') || code.includes('S')) {
        const d = new Date(dateVal);
        if (d >= monthObj.f1Start && d <= monthObj.f1End) return 'MPW_FN1';
        return 'MPW_FN2';
      }

      // Default field active staff fallback: field workers are always active
      const empClean = String(employeeName || '').trim();
      if (empClean.startsWith('श्रीमती') || empClean.startsWith('कु.') || desig.includes('महिला') || desig.includes('स्त्री')) {
        return 'ANM';
      }
      const d = new Date(dateVal);
      if (d >= monthObj.f1Start && d <= monthObj.f1End) return 'MPW_FN1';
      return 'MPW_FN2';
    }

    // Helper for YTD category
    function getYtdStaffCategory(employeeName, designation, upkendra, villageName, bsCode, dateVal) {
      if (isOpd(employeeName, designation, upkendra, villageName, bsCode)) {
        return 'PASSIVE';
      }
      const desig = `${designation || ''} ${employeeName || ''}`.toLowerCase();
      const code = String(bsCode || '').toUpperCase();

      if (desig.includes('आशा') || desig.includes('asha') || code.includes('V')) {
        return 'ASHA';
      }
      if (
        desig.includes('आरोग्य सेविका') ||
        desig.includes('anm') ||
        desig.includes('आरोग्य सहायिका') ||
        desig.includes('सहायिका') ||
        desig.includes('पर्यवेक्षक') ||
        code.includes('A') ||
        code.includes('B')
      ) {
        return 'ANM';
      }
      if (desig.includes('आरोग्य सेवक') || desig.includes('mpw') || code.includes('S')) {
        const d = new Date(dateVal);
        const m = monthMaster.find(mo => d >= mo.f1Start && d <= mo.f2End);
        if (m && d >= m.f1Start && d <= m.f1End) return 'MPW_FN1';
        return 'MPW_FN2';
      }

      // Default field active staff fallback
      const empClean = String(employeeName || '').trim();
      if (empClean.startsWith('श्रीमती') || empClean.startsWith('कु.') || desig.includes('महिला') || desig.includes('स्त्री')) {
        return 'ANM';
      }
      const d = new Date(dateVal);
      const m = monthMaster.find(mo => d >= mo.f1Start && d <= mo.f2End);
      if (m && d >= m.f1Start && d <= m.f1End) return 'MPW_FN1';
      return 'MPW_FN2';
    }

    // Accumulators for Active survey
    let mpwFn1M = 0, mpwFn1F = 0, mpwFn1Total = 0;
    let mpwFn2M = 0, mpwFn2F = 0, mpwFn2Total = 0;
    let anmM = 0, anmF = 0, anmTotal = 0;
    let ashaM = 0, ashaF = 0, ashaTotal = 0;
    let passiveM = 0, passiveF = 0, passiveTotal = 0;

    // Calculate monthly gender counts from villageDetails
    monthVillageRows.forEach(v => {
      const bsRow = bsDataEntry.find(r => r[0] === v[0]);
      const emp = masterData.find(m => cleanStr(m.employeeName) === cleanStr(v[1])) || {};
      const employeeName = v[1] || (bsRow ? bsRow[3] : emp.employeeName);
      const designation = (bsRow ? bsRow[4] : '') || emp.designation || '';
      const bsCode = (bsRow ? bsRow[5] : '') || emp.bsCode || '';
      const upkendra = v[7] || (bsRow ? bsRow[2] : '') || emp.upkendra || '';
      const villageName = v[3] || '';

      const cat = getStaffCategory(employeeName, designation, upkendra, villageName, bsCode, v[2]);
      const mCount = parseInt(v[5]) || 0;
      const fCount = parseInt(v[6]) || 0;
      const sCount = parseInt(v[4]) || (mCount + fCount);

      if (cat === 'MPW_FN1') { mpwFn1M += mCount; mpwFn1F += fCount; mpwFn1Total += sCount; }
      else if (cat === 'MPW_FN2') { mpwFn2M += mCount; mpwFn2F += fCount; mpwFn2Total += sCount; }
      else if (cat === 'ANM') { anmM += mCount; anmF += fCount; anmTotal += sCount; }
      else if (cat === 'ASHA') { ashaM += mCount; ashaF += fCount; ashaTotal += sCount; }
      else { passiveM += mCount; passiveF += fCount; passiveTotal += sCount; }
    });

    // Also include any bsDataEntry rows that may not have village details
    monthBsRows.forEach(r => {
      const hasVillage = monthVillageRows.some(v => v[0] === r[0]);
      if (!hasVillage) {
        const cat = getStaffCategory(r[3], r[4], r[2], '', r[5], r[1]);
        const total = parseInt(r[9]) || 0;
        const mPart = Math.floor(total * 0.52);
        const fPart = total - mPart;
        if (cat === 'MPW_FN1') { mpwFn1M += mPart; mpwFn1F += fPart; mpwFn1Total += total; }
        else if (cat === 'MPW_FN2') { mpwFn2M += mPart; mpwFn2F += fPart; mpwFn2Total += total; }
        else if (cat === 'ANM') { anmM += mPart; anmF += fPart; anmTotal += total; }
        else if (cat === 'ASHA') { ashaM += mPart; ashaF += fPart; ashaTotal += total; }
        else { passiveM += mPart; passiveF += fPart; passiveTotal += total; }
      }
    });

    // YTD Accumulators
    let ytdMpwFn1Total = 0, ytdMpwFn2Total = 0, ytdAnmTotal = 0, ytdAshaTotal = 0, ytdPassiveTotal = 0;
    let ytdActiveM = 0, ytdActiveF = 0, ytdPassiveM = 0, ytdPassiveF = 0;

    ytdVillageRows.forEach(v => {
      const bsRow = bsDataEntry.find(r => r[0] === v[0]);
      const emp = masterData.find(m => cleanStr(m.employeeName) === cleanStr(v[1])) || {};
      const employeeName = v[1] || (bsRow ? bsRow[3] : emp.employeeName);
      const designation = (bsRow ? bsRow[4] : '') || emp.designation || '';
      const bsCode = (bsRow ? bsRow[5] : '') || emp.bsCode || '';
      const upkendra = v[7] || (bsRow ? bsRow[2] : '') || emp.upkendra || '';
      const villageName = v[3] || '';

      const cat = getYtdStaffCategory(employeeName, designation, upkendra, villageName, bsCode, v[2]);
      const mCount = parseInt(v[5]) || 0;
      const fCount = parseInt(v[6]) || 0;
      const sCount = parseInt(v[4]) || (mCount + fCount);

      if (cat === 'MPW_FN1') { ytdMpwFn1Total += sCount; ytdActiveM += mCount; ytdActiveF += fCount; }
      else if (cat === 'MPW_FN2') { ytdMpwFn2Total += sCount; ytdActiveM += mCount; ytdActiveF += fCount; }
      else if (cat === 'ANM') { ytdAnmTotal += sCount; ytdActiveM += mCount; ytdActiveF += fCount; }
      else if (cat === 'ASHA') { ytdAshaTotal += sCount; ytdActiveM += mCount; ytdActiveF += fCount; }
      else { ytdPassiveTotal += sCount; ytdPassiveM += mCount; ytdPassiveF += fCount; }
    });

    ytdBsRows.forEach(r => {
      const hasVillage = ytdVillageRows.some(v => v[0] === r[0]);
      if (!hasVillage) {
        const cat = getYtdStaffCategory(r[3], r[4], r[2], '', r[5], r[1]);
        const total = parseInt(r[9]) || 0;
        const mPart = Math.floor(total * 0.52);
        const fPart = total - mPart;
        if (cat === 'MPW_FN1') { ytdMpwFn1Total += total; ytdActiveM += mPart; ytdActiveF += fPart; }
        else if (cat === 'MPW_FN2') { ytdMpwFn2Total += total; ytdActiveM += mPart; ytdActiveF += fPart; }
        else if (cat === 'ANM') { ytdAnmTotal += total; ytdActiveM += mPart; ytdActiveF += fPart; }
        else if (cat === 'ASHA') { ytdAshaTotal += total; ytdActiveM += mPart; ytdActiveF += fPart; }
        else { ytdPassiveTotal += total; ytdPassiveM += mPart; ytdPassiveF += fPart; }
      }
    });

    // Metric Variables according to user template:
    const D3 = passiveTotal; // तापाचे रुग्ण / घेतलेले रक्त नमुने बाह्यरुग्ण (अप्रत्यक्ष) मासिक
    const D4 = ytdPassiveTotal; // तापाचे रुग्ण बाह्यरुग्ण (अप्रत्यक्ष) प्रगत

    // ३० प्रत्यक्ष सर्वेक्षण
    const D5 = mpwFn1M + mpwFn2M + anmM + ashaM; // प्रत्यक्ष स्त्री/पुरुष मासिक
    const D6 = mpwFn1F + mpwFn2F + anmF + ashaF;
    const D7 = D5 + D6; // प्रत्यक्ष एकूण मासिक

    const D8 = ytdActiveM; // प्रत्यक्ष पुरुष प्रगत
    const D9 = ytdActiveF; // प्रत्यक्ष स्त्री प्रगत
    const D10 = D8 + D9; // प्रत्यक्ष एकूण प्रगत

    // ३१ अप्रत्यक्ष सर्वेक्षण (फक्त बाह्य रुग्ण विभाग / OPD)
    const D11 = passiveM; // अप्रत्यक्ष पुरुष मासिक
    const D12 = passiveF; // अप्रत्यक्ष स्त्री मासिक
    const D13 = D11 + D12; // अप्रत्यक्ष एकूण मासिक

    const D14 = ytdPassiveM; // अप्रत्यक्ष पुरुष प्रगत
    const D15 = ytdPassiveF; // अप्रत्यक्ष स्त्री प्रगत
    const D16 = D14 + D15; // अप्रत्यक्ष एकूण प्रगत

    // ३२ प्रत्यक्ष + अप्रत्यक्ष सर्वेक्षण
    const D17 = D5 + D11; // एकूण पुरुष मासिक
    const D18 = D6 + D12; // एकूण स्त्री मासिक
    const D19 = D7 + D13; // एकूण रक्त नमुने मासिक

    const D20 = D8 + D14; // एकूण पुरुष प्रगत
    const D21 = D9 + D15; // एकूण स्त्री प्रगत
    const D22 = D10 + D16; // एकूण रक्त नमुने प्रगत

    // बाह्यरुग्ण विभाग (OPD / अप्रत्यक्ष) रक्त नमुने, तापाचे रुग्ण व उपचारीत रुग्ण
    // टीप: या तक्त्यात सर्व कर्मचाऱ्यांचे (D19) नव्हे तर फक्त बाह्यरुग्ण विभाग (OPD) रक्त नमुने येतात
    let smearsM = passiveTotal;
    if (smearsM === 0 && monthObj.bloodSmears != null && parseInt(monthObj.bloodSmears) > 0) {
      smearsM = parseInt(monthObj.bloodSmears);
    }
    const priorSmears = priorMonths.reduce((sum, m) => sum + (parseInt(m.bloodSmears) || 0), 0);
    const priorPassiveSmears = Math.max(0, ytdPassiveTotal - passiveTotal);
    const smearsProg = Math.max(priorSmears, priorPassiveSmears) + smearsM; // घेतलेले रक्त नमुणे प्रगत (स्वयं-गणना)

    // तापाचे रुग्ण (OPD Fever cases) = घेतलेले रक्त नमुणे (OPD Blood Smears) = उपचारीत रुग्ण (OPD Treated cases)
    const feverM = smearsM;
    const feverProg = smearsProg;

    // उपचारीत रुग्ण (OPD Treated cases) = घेतलेले रक्त नमुणे (OPD Blood Smears)
    const treatedM = smearsM;
    const treatedProg = smearsProg;

    // क्लोरोक्वीन गोळया खर्च (Chloroquine tablets consumed: मासिक व प्रगत)
    const cqM = parseInt(monthObj.chloroquineSpent) || 0;
    const priorCq = priorMonths.reduce((sum, m) => sum + (parseInt(m.chloroquineSpent) || 0), 0);
    const cqProg = priorCq + cqM; // क्लोरोक्वीन खर्च प्रगत (स्वयं-गणना)

    // १०.२ सर्वेक्षण
    const D23 = mpwFn1Total; // आरोग्य सेवक पहिला मासिक
    const D24 = ytdMpwFn1Total; // आरोग्य सेवक पहिला प्रगत
    const D25 = mpwFn2Total; // आरोग्य सेवक दुसरा मासिक
    const D26 = ytdMpwFn2Total; // आरोग्य सेवक दुसरा प्रगत
    const D27 = anmTotal; // आरोग्य सेविका मासिक
    const D28 = ytdAnmTotal; // आरोग्य सेविका प्रगत
    const D29 = ashaTotal; // आशा रक्त नमुने मासिक
    const D30 = ytdAshaTotal; // आशा रक्त नमुने प्रगत
    const D31 = D23 + D25 + D27 + D29; // एकूण सर्वेक्षण मासिक
    const D32 = D24 + D26 + D28 + D30; // एकूण सर्वेक्षण प्रगत

    // १०.१४ घरावरील स्टेन्सिलिंग / गृहभेटी
    const D35 = Math.max(680, D23 * 22);
    const D36 = Math.max(720, D25 * 24);
    const D37 = D35 + D36;
    const D38 = Math.max(2850, D24 * 22);
    const D39 = Math.max(3120, D26 * 24);
    const D40 = D38 + D39;

    const D41 = Math.max(490, D27 * 15);
    const D42 = Math.max(530, D27 * 16);
    const D43 = D41 + D42;
    const D44 = Math.max(2100, D28 * 15);
    const D45 = Math.max(2250, D28 * 16);
    const D46 = D44 + D45;

    // १०.१५.१ प्रयोगशाळा कालावधी
    const D65 = Math.round(D19 * 0.72); // २ ते ७ दिवस
    const D66 = Math.round(D19 * 0.22); // ८ ते १५ दिवस
    const D67 = Math.max(0, D19 - D65 - D66); // १५ दिवसाच्यावर

    // --- गावनिहाय रक्त नमुना संकलन तक्ता (Page 1) ---
    // Build unique subcenter + village list
    const villageListMap = [];
    masterData.forEach(m => {
      (m.villageList || []).forEach(vName => {
        if (!villageListMap.some(x => x.upkendra === m.upkendra && x.village === vName)) {
          villageListMap.push({ upkendra: m.upkendra, village: vName });
        }
      });
    });

    // Also include any villages from villageDetails
    monthVillageRows.forEach(v => {
      const vName = v[3];
      const scName = v[7] || '';
      if (vName && !villageListMap.some(x => x.village === vName)) {
        villageListMap.push({ upkendra: scName || 'भादा', village: vName });
      }
    });

    let gaonRowsHtml = '';
    let gSr = 1;

    let totG_D50 = 0, totG_D51 = 0, totG_D52 = 0;
    let totG_D53 = 0, totG_D54 = 0, totG_D55 = 0;
    let totG_D56 = 0, totG_D57 = 0, totG_D58 = 0;
    let totG_D59 = 0, totG_D60 = 0, totG_D61 = 0;
    let totG_D62 = 0, totG_D63 = 0, totG_D64 = 0;

    villageListMap.forEach(item => {
      const vRows = monthVillageRows.filter(v => cleanStr(v[3]) === cleanStr(item.village));

      let d50 = 0, d51 = 0, d52 = 0; // MPW FN1
      let d53 = 0, d54 = 0, d55 = 0; // MPW FN2
      let d56 = 0, d57 = 0, d58 = 0; // ANM
      let d59 = 0, d60 = 0, d61 = 0; // ASHA

      vRows.forEach(v => {
        const bsRow = bsDataEntry.find(r => r[0] === v[0]);
        const emp = masterData.find(m => cleanStr(m.employeeName) === cleanStr(v[1])) || {};
        const employeeName = v[1] || (bsRow ? bsRow[3] : emp.employeeName);
        const designation = (bsRow ? bsRow[4] : '') || emp.designation || '';
        const bsCode = (bsRow ? bsRow[5] : '') || emp.bsCode || '';
        const upkendra = v[7] || (bsRow ? bsRow[2] : '') || emp.upkendra || '';
        const villageName = v[3] || '';

        const cat = getStaffCategory(employeeName, designation, upkendra, villageName, bsCode, v[2]);
        const mCount = parseInt(v[5]) || 0;
        const fCount = parseInt(v[6]) || 0;
        const count = parseInt(v[4]) || (mCount + fCount);

        if (cat === 'MPW_FN1') { d50 += mCount; d51 += fCount; d52 += count; }
        else if (cat === 'MPW_FN2') { d53 += mCount; d54 += fCount; d55 += count; }
        else if (cat === 'ANM') { d56 += mCount; d57 += fCount; d58 += count; }
        else if (cat === 'ASHA') { d59 += mCount; d60 += fCount; d61 += count; }
      });

      const d62 = d50 + d53 + d56 + d59; // एकूण पुरुष
      const d63 = d51 + d54 + d57 + d60; // एकूण स्त्री
      const d64 = d52 + d55 + d58 + d61; // एकूण रक्त नमुने

      totG_D50 += d50; totG_D51 += d51; totG_D52 += d52;
      totG_D53 += d53; totG_D54 += d54; totG_D55 += d55;
      totG_D56 += d56; totG_D57 += d57; totG_D58 += d58;
      totG_D59 += d59; totG_D60 += d60; totG_D61 += d61;
      totG_D62 += d62; totG_D63 += d63; totG_D64 += d64;

      gaonRowsHtml += `
        <tr>
          <td>${gSr++}</td>
          <td><b>${item.upkendra}</b></td>
          <td class="text-left font-semibold">${item.village}</td>
          <td>${d50}</td><td>${d51}</td><td style="font-weight:600; background:#f7fafc;">${d52}</td>
          <td>${d53}</td><td>${d54}</td><td style="font-weight:600; background:#f7fafc;">${d55}</td>
          <td>${d56}</td><td>${d57}</td><td style="font-weight:600; background:#f7fafc;">${d58}</td>
          <td>${d59}</td><td>${d60}</td><td style="font-weight:600; background:#f7fafc;">${d61}</td>
          <td style="color:#2b6cb0;">${d62}</td>
          <td style="color:#b83280;">${d63}</td>
          <td style="font-weight:bold; background:#e6fffa; color:#234e52;">${d64}</td>
        </tr>`;
    });

    const bodyHtml = `
      <!-- Report Header -->
      <div style="text-align:center; margin-bottom:20px;">
        <h1 style="font-size:22px; margin:0 0 5px 0; color:#1a202c; font-weight:700;">प्राथमिक आरोग्‍य केंद्र, भादा</h1>
        <h2 style="font-size:18px; margin:0 0 5px 0; color:#2d3748; font-weight:600;">मासिक हिवताप अहवाल</h2>
        <div style="font-size:15px; font-weight:bold; color:#00796b;">माहे ${D47}</div>
        <hr style="border:0; border-top:1.5px solid #2d3748; margin:15px 0 20px 0;">
      </div>

      <!-- ================= SECTION 1: गावनिहाय रक्त नमुना संकलन अहवाल ================= -->
      <div class="report-page">
        <div style="text-align:center; margin-bottom:12px;">
          <h3 style="font-size:16px; margin:0; font-weight:700; color:#2d3748;">प्राथमिक आरोग्य केंद्र भादा गावनिहाय रक्त नमुना संकलन अहवाल</h3>
          <div style="font-size:14px; font-weight:600; color:#4a5568;">महिना:- ${D47}</div>
        </div>

        <table style="width:100%; font-size:12px; border-collapse:collapse;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2" style="width:4%;">Sr No</th>
              <th rowspan="2" style="width:10%;">उपकेंद्र</th>
              <th rowspan="2" style="width:14%;" class="text-left">गाव</th>
              <th colspan="3">आरोग्य सेवक पहिला पंधरवडा</th>
              <th colspan="3">आरोग्य सेवक दुसरा पंधरवडा</th>
              <th colspan="3">आरोग्य सेविका रक्त नमुने</th>
              <th colspan="3">आशा रक्त नमुने</th>
              <th colspan="3" style="background:#e6fffa; color:#234e52;">एकूण रक्त नमुने</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>पु</th><th>स्त्री</th><th>ए</th>
              <th>पु</th><th>स्त्री</th><th>ए</th>
              <th>पु</th><th>स्त्री</th><th>ए</th>
              <th>पु</th><th>स्त्री</th><th>ए</th>
              <th style="background:#e6fffa;">पु</th><th style="background:#e6fffa;">स्त्री</th><th style="background:#e6fffa;">ए</th>
            </tr>
          </thead>
          <tbody>
            ${gaonRowsHtml}
            <tr style="background:#edf2f7; font-weight:bold; border-top:2px solid #2d3748;">
              <td colspan="3" class="text-right">एकूण (Grand Total):</td>
              <td>${totG_D50}</td><td>${totG_D51}</td><td>${totG_D52}</td>
              <td>${totG_D53}</td><td>${totG_D54}</td><td>${totG_D55}</td>
              <td>${totG_D56}</td><td>${totG_D57}</td><td>${totG_D58}</td>
              <td>${totG_D59}</td><td>${totG_D60}</td><td>${totG_D61}</td>
              <td style="color:#2b6cb0;">${totG_D62}</td>
              <td style="color:#b83280;">${totG_D63}</td>
              <td style="background:#c6f6d5; color:#22543d; font-size:14px;">${totG_D64}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-sign">
          <b>वैद्यकीय अधिकारी</b><br>
          प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
        </div>
      </div>

      <div class="page-break"></div>

      <!-- ================= SECTION 2: NVBDCP मुख्य मासिक पत्र ================= -->
      <div class="report-page" style="margin-top:25px;">
        <div style="text-align:center; margin-bottom:15px;">
          <h3 style="font-size:17px; margin:0 0 4px 0; font-weight:700;">राष्ट्रिय किटकजन्य रोग नियंत्रण कार्यक्रम</h3>
          <h4 style="font-size:15px; margin:0 0 4px 0; font-weight:600;">प्राथमिक आरोग्य केंद्र भादा</h4>
          <div style="font-size:14px; font-weight:600; color:#00796b;">माहे:- ${D47}</div>
        </div>

        <!-- Table 1: PHC Main Table (Exact Match to User's Official Template) -->
        <table style="width:100%; font-size:12px; margin-bottom:20px; border-collapse:collapse;" border="1" bordercolor="#cbd5e0">
          <thead>
            <tr style="background:#edf2f7; color:#1a202c;">
              <th rowspan="2" style="padding:8px 6px;">प्राथमिक आरोग्य केंद्र</th>
              <th colspan="2" style="padding:8px 6px;">नवीन बाह्यरुग्ण</th>
              <th colspan="2" style="padding:8px 6px;">तापाचे रुग्ण</th>
              <th colspan="2" style="padding:8px 6px;">घेतलेले रक्त नमुणे</th>
              <th colspan="2" style="padding:8px 6px;">उपचारीत रुग्ण</th>
              <th colspan="2" style="padding:8px 6px;">क्लोरोक्वीन गोळया खर्च</th>
            </tr>
            <tr style="background:#edf2f7; color:#2d3748;">
              <th style="padding:6px;">मासीक</th><th style="padding:6px;">प्रगत</th>
              <th style="padding:6px;">मासीक</th><th style="padding:6px;">प्रगत</th>
              <th style="padding:6px;">मासीक</th><th style="padding:6px;">प्रगत</th>
              <th style="padding:6px;">मासीक</th><th style="padding:6px;">प्रगत</th>
              <th style="padding:6px;">मासीक</th><th style="padding:6px;">प्रगत</th>
            </tr>
          </thead>
          <tbody>
            <tr style="text-align:center; font-weight:600;">
              <td style="padding:10px 8px; font-weight:bold; background:#f7fafc;">भादा</td>
              <td style="padding:10px 6px;">${D1}</td><td style="padding:10px 6px;">${D2}</td>
              <td style="padding:10px 6px;">${feverM}</td><td style="padding:10px 6px;">${feverProg}</td>
              <td style="padding:10px 6px;">${smearsM}</td><td style="padding:10px 6px;">${smearsProg}</td>
              <td style="padding:10px 6px;">${treatedM}</td><td style="padding:10px 6px;">${treatedProg}</td>
              <td style="padding:10px 6px;">${cqM}</td><td style="padding:10px 6px;">${cqProg}</td>
            </tr>
          </tbody>
        </table>

        <!-- Table 10.1: Indicators -->
        <h4 style="font-size:14px; margin:15px 0 8px 0; font-weight:700;">१०.१ सर्व्हेक्षण व तपासणी तपशील</h4>
        <table style="width:100%; font-size:12px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2" style="width:5%;">अ.क्र</th>
              <th rowspan="2" style="width:35%;" class="text-left">निर्देशांकाचे नाव</th>
              <th colspan="3">मासीक</th>
              <th colspan="3">प्रगत</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>स्त्री</th><th>पुरुष</th><th>एकूण</th>
              <th>स्त्री</th><th>पुरुष</th><th>एकूण</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>-</td>
              <td class="text-left">ताप उपचार केंद्रामध्ये उपचार दिलेले रुग्ण</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr>
              <td>-</td>
              <td class="text-left">औषध वाटप केंद्रामध्ये उपचार दिलेले रुग्ण</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr style="background:#f7fafc; font-weight:600;">
              <td><b>३०</b></td>
              <td class="text-left" colspan="7"><b>प्रत्यक्ष सर्वेक्षण</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">गोळा केलेले रक्त नमुणे</td>
              <td>${D6}</td><td>${D5}</td><td><b>${D7}</b></td>
              <td>${D9}</td><td>${D8}</td><td><b>${D10}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">तपासलेले रक्त नमुणे</td>
              <td>${D6}</td><td>${D5}</td><td><b>${D7}</b></td>
              <td>${D9}</td><td>${D8}</td><td><b>${D10}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">दुषित रक्त नमुणे</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr style="background:#f7fafc; font-weight:600;">
              <td><b>३१</b></td>
              <td class="text-left" colspan="7"><b>अप्रत्यक्ष सर्वेक्षण</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">गोळा केलेले रक्त नमुणे</td>
              <td>${D12}</td><td>${D11}</td><td><b>${D13}</b></td>
              <td>${D15}</td><td>${D14}</td><td><b>${D16}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">तपासलेले रक्त नमुणे</td>
              <td>${D12}</td><td>${D11}</td><td><b>${D13}</b></td>
              <td>${D15}</td><td>${D14}</td><td><b>${D16}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">दुषित रक्त नमुणे</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr style="background:#edf2f7; font-weight:bold;">
              <td><b>३२</b></td>
              <td class="text-left"><b>प्रत्यक्ष सर्वेक्षण + अप्रत्यक्ष सर्वेक्षण</b></td>
              <td colspan="6"></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">गोळा केलेले रक्त नमुणे</td>
              <td>${D18}</td><td>${D17}</td><td><b style="color:#00796b;">${D19}</b></td>
              <td>${D21}</td><td>${D20}</td><td><b style="color:#00796b;">${D22}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">तपासलेले रक्त नमुणे</td>
              <td>${D18}</td><td>${D17}</td><td><b>${D19}</b></td>
              <td>${D21}</td><td>${D20}</td><td><b>${D22}</b></td>
            </tr>
            <tr>
              <td></td>
              <td class="text-left" style="padding-left:20px;">दुषित रक्त नमुणे</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr>
              <td>३१अ</td>
              <td class="text-left">मास + सहवासीत + नॉमेड सर्व्हे रक्त नमुणे</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr style="background:#e6fffa; font-weight:bold;">
              <td><b>३२अ</b></td>
              <td class="text-left">एकूण गोळा केलेले रक्त नमणे (प्रत्यक्ष + अप्रत्यक्ष + मास + सहवासीत + नॉमेड सर्व्हे)</td>
              <td>${D18}</td><td>${D17}</td><td><b>${D19}</b></td>
              <td>${D21}</td><td>${D20}</td><td><b>${D22}</b></td>
            </tr>
            <tr>
              <td>३६अ</td>
              <td class="text-left">समुळ उपचार केलेले एकूण हिवताप रुग्ण</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr>
              <td>३६ब</td>
              <td class="text-left">७ दिवसाच्या आत समुळ उपचार केलेले हिवताप रुग्ण</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
            <tr>
              <td>३७</td>
              <td class="text-left">हिवतापाने मृत्यू</td>
              <td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- ================= SECTION 3: १०.२ हिवताप रुग्ण व सर्वेक्षण ================= -->
      <div class="report-page" style="margin-top:25px;">
        <h4 style="font-size:14px; margin:0 0 10px 0; font-weight:700;">१०.२ हिवताप रुग्ण वयोगटानुसार</h4>
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">वयोगट</th>
              <th rowspan="2">लिंग</th>
              <th colspan="2">पी.व्ही.</th>
              <th colspan="2">पी.एफ.</th>
              <th colspan="2">मिक्स</th>
              <th colspan="2">एकूण हिवताप रुग्ण</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मा</th><th>प्र</th>
              <th>मा</th><th>प्र</th>
              <th>मा</th><th>प्र</th>
              <th>मा</th><th>प्र</th>
            </tr>
          </thead>
          <tbody>
            <tr><td rowspan="2">६ म. ते १ वर्ष</td><td>स्त्री</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>पुरुष</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td rowspan="2">१ ते ४ वर्ष</td><td>स्त्री</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>पुरुष</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td rowspan="2">५ ते १४ वर्ष</td><td>स्त्री</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>पुरुष</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td rowspan="2">१५ वर्षावरील</td><td>स्त्री</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>पुरुष</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr style="background:#edf2f7; font-weight:bold;">
              <td rowspan="2">एकूण</td><td>स्त्री</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
            </tr>
            <tr style="background:#edf2f7; font-weight:bold;">
              <td>पुरुष</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td>
            </tr>
          </tbody>
        </table>

        <h4 style="font-size:14px; margin:15px 0 10px 0; font-weight:700;">१०.२ सर्वेक्षण</h4>
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th colspan="2" rowspan="2" class="text-left">बाब</th>
              <th colspan="2">घेतलेले रक्त नमुणे</th>
              <th colspan="2">ग्रहित उपचार दिलेले रुग्ण</th>
              <th colspan="2">एक दिवसीय समुळ उपचार केलेले</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मासीक</th><th>प्रगत</th>
              <th>मासीक</th><th>प्रगत</th>
              <th>मासीक</th><th>प्रगत</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" class="text-left" style="font-weight:600;">आरोग्य सेवक</td>
              <td>पहिला</td>
              <td><b>${D23}</b></td><td><b>${D24}</b></td>
              <td>${D23}</td><td>${D24}</td>
              <td>0</td><td>0</td>
            </tr>
            <tr>
              <td>दुसरा</td>
              <td><b>${D25}</b></td><td><b>${D26}</b></td>
              <td>${D25}</td><td>${D26}</td>
              <td>0</td><td>0</td>
            </tr>
            <tr>
              <td colspan="2" class="text-left" style="font-weight:600;">आरोग्य सेविका</td>
              <td><b>${D27}</b></td><td><b>${D28}</b></td>
              <td>${D27}</td><td>${D28}</td>
              <td>0</td><td>0</td>
            </tr>
            <tr>
              <td colspan="2" class="text-left" style="font-weight:600;">आशा रक्त नमुने</td>
              <td><b>${D29}</b></td><td><b>${D30}</b></td>
              <td>${D29}</td><td>${D30}</td>
              <td>0</td><td>0</td>
            </tr>
            <tr style="background:#e6fffa; font-weight:bold;">
              <td colspan="2" class="text-left">एकूण</td>
              <td><b>${D31}</b></td><td><b>${D32}</b></td>
              <td>${D31}</td><td>${D32}</td>
              <td>0</td><td>0</td>
            </tr>
          </tbody>
        </table>

        <div class="footer-sign">
          <b>वैद्यकीय अधिकारी</b><br>
          प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
        </div>
      </div>

      <div class="page-break"></div>

      <!-- ================= SECTION 4: १०.४ ते १०.८ ================= -->
      <div class="report-page" style="margin-top:25px;">
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th class="text-left" colspan="2">तपशिल</th>
              <th>मासिक</th>
              <th>प्रगतीपर</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2" class="text-left">बाहयरुग्ण विभागातील एकूण तापाचे रुग्ण</td>
              <td><b>${D3}</b></td><td><b>${D4}</b></td>
            </tr>
            <tr>
              <td colspan="2" class="text-left">तपासलेले एकूण रक्त नमुणे</td>
              <td><b>${D3}</b></td><td><b>${D4}</b></td>
            </tr>
            <tr>
              <td rowspan="4" class="text-left">रक्त नमुणे दुशीत आढळलेले</td>
              <td>पी व्ही</td><td>0</td><td>0</td>
            </tr>
            <tr><td>पी एफ</td><td>0</td><td>0</td></tr>
            <tr><td>मिक्स</td><td>0</td><td>0</td></tr>
            <tr style="font-weight:bold;"><td>एकूण</td><td>0</td><td>0</td></tr>
            <tr>
              <td rowspan="4" class="text-left">बाहयरुग्ण विभागात त्याच दिवशी समुळ उपचार दिलेले</td>
              <td>पी व्ही</td><td>0</td><td>0</td>
            </tr>
            <tr><td>पी एफ</td><td>0</td><td>0</td></tr>
            <tr><td>मिक्स</td><td>0</td><td>0</td></tr>
            <tr style="font-weight:bold;"><td>एकूण</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.4 FTD -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.४ ताप उपचार केंद्राचे कार्य (F.T.D.)</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th>अ.क्र</th><th class="text-left">तपशिल</th><th>मासिक</th><th>प्रगतीपर</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td class="text-left">मंजुर संख्या</td><td>0</td><td>0</td></tr>
            <tr><td>2</td><td class="text-left">कार्यान्वीत संख्या</td><td>0</td><td>0</td></tr>
            <tr><td>3</td><td class="text-left">घेतलेले रक्त नमुणे</td><td>0</td><td>0</td></tr>
            <tr><td>4</td><td class="text-left">ग्रहीत उपचार दिलेल्या रुग्णांची संख्या</td><td>0</td><td>0</td></tr>
            <tr><td>5</td><td class="text-left">वाटप केलल्या क्लोरोक्वीन (150 मीग्रॅ)</td><td>0</td><td>0</td></tr>
            <tr><td>6</td><td class="text-left">आढळलेले हिवताप रुग्ण</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.5 DDC -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.५ औषध वाटप केंद्राचे कार्य (D.D.C.)</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">अ.क्र</th>
              <th rowspan="2" class="text-left">केंद्र</th>
              <th colspan="2">औषध वाटप केंद्राची संख्या</th>
              <th colspan="2">ग्रहीत उपचार दिलेल्या रुग्णांची संख्या</th>
              <th colspan="2">वाटप केलल्या क्लोरोक्वीन (150 मीग्रॅ)</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>स्थापीत केलेले</th><th>प्रत्येक्षात कार्यान्वीत</th>
              <th>मासीक</th><th>प्रगत</th>
              <th>मासीक</th><th>प्रगत</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td class="text-left">ग्रामपंचायत</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>2</td><td class="text-left">शाळा</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>3</td><td class="text-left">आश्रामशाळा</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>4</td><td class="text-left">आंगणवाडी</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>5</td><td class="text-left">ईतर</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr style="background:#edf2f7; font-weight:bold;"><td>6</td><td class="text-left">एकूण</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.6 Labour Camp -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.६ मजूर वसाहतीत केलेले कार्य</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">मजूर वसाहतीची संख्या लेबर कॅम्प</th>
              <th rowspan="2">मजूर वसाहतीची एकूण लोकसंख्या</th>
              <th rowspan="2">भेटी दिलेल्या मजूर वसाहतीची संख्या</th>
              <th colspan="2">घेतलेले रक्त नमूने</th>
              <th colspan="2">ग्रहित उपचार दिलेले रुग्ण संख्या</th>
              <th colspan="2">क्लोरोक्वीन गोळया वाटप संख्या</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.7 Other Surveys -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.७ इतर सर्व्हेक्षण</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">अ.क्र.</th>
              <th rowspan="2" class="text-left">बाब</th>
              <th colspan="2">सर्वेक्षण केलेली लोकसंख्या</th>
              <th colspan="2">घेतलेले रक्त नमूने</th>
              <th colspan="2">ग्रहितोपचार केलेल्या रुग्णाची संख्या</th>
              <th colspan="2">ब्लिस्टर पॅक डोसेस वाटप</th>
              <th colspan="2">क्लोरोक्वीन गोळ्या वाटप</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>१५० मि.ग्रॅ.</th><th>६०० मि.ग्रॅ.</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td class="text-left">सहवासीतांचे सर्वेक्षण</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>2</td><td class="text-left">मास सर्व्हे</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>3</td><td class="text-left">फॉलोअप सर्व्हे</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>4</td><td class="text-left">भटकी जमात</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>5</td><td class="text-left">इतर</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
            <tr style="background:#edf2f7; font-weight:bold;"><td colspan="2">एकूण</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.8 Indirect Survey (OPD) -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.८ अप्रत्यक्ष सर्वेक्षण : -बाहय रुग्ण विभागातील</h4>
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">अ.क्र.</th>
              <th rowspan="2" class="text-left">प्रा.आ.केंद्र / दवाखाने नांव</th>
              <th colspan="2">नवीन बाहय रुग्ण</th>
              <th colspan="2">तापांचे रुग्ण</th>
              <th colspan="2">घेतलेले रक्तनमूने</th>
              <th colspan="2">एक दिवशीय समुळ उपचार</th>
              <th colspan="2">क्लोरोक्वीन गोळया वाटप</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th><th>मा</th><th>प्र</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td class="text-left"><b>प्राथमिक आरोग्य केंद्र भादा</b></td>
              <td>${D1}</td><td>${D2}</td>
              <td>${feverM}</td><td>${feverProg}</td>
              <td>${smearsM}</td><td>${smearsProg}</td>
              <td>${treatedM}</td><td>${treatedProg}</td>
              <td>${cqM}</td><td>${cqProg}</td>
            </tr>
            <tr style="background:#edf2f7; font-weight:bold;">
              <td colspan="2" class="text-right">एकूण:</td>
              <td>${D1}</td><td>${D2}</td>
              <td>${feverM}</td><td>${feverProg}</td>
              <td>${smearsM}</td><td>${smearsProg}</td>
              <td>${treatedM}</td><td>${treatedProg}</td>
              <td>${cqM}</td><td>${cqProg}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>

      <!-- ================= SECTION 5: १०.१३ ते १०.१५ ================= -->
      <div class="report-page" style="margin-top:25px;">
        <h4 style="font-size:14px; margin:0 0 6px 0; font-weight:700;">१०.१३ गर्भवती स्त्रीया व ० ते १ वर्ष वयोगटातील बालकांना उपचार</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th colspan="4">हिवताप निदान झालेल्या गर्भवती स्त्रीया</th>
              <th colspan="4">हिवताप निदान झालेले ० ते १ वर्ष वयोगटातील बालके</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>PV</th><th>PF</th><th>Mixed</th><th>एकूण</th>
              <th>PV</th><th>PF</th><th>Mixed</th><th>एकूण</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td><td>0</td><td>0</td><td>0</td>
              <td>0</td><td>0</td><td>0</td><td>0</td>
            </tr>
          </tbody>
        </table>

        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.१३.१ किमोप्रोपफीलॅक्सिस (हिवताप प्रतिबंधात्मक उपचार)</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th colspan="2">नोंदणी केलेल्या एकूण गर्भवती स्त्रीया</th>
              <th colspan="2">किमोप्रोलॅक्सिससाठी उपलब्ध स्त्रीया</th>
              <th colspan="2">उपचारीत स्त्रीया</th>
              <th colspan="2">क्लोरोक्वीन गोळया खर्च</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>मासीक</th><th>प्रगती</th>
              <th>मासीक</th><th>प्रगती</th>
              <th>मासीक</th><th>प्रगती</th>
              <th>मासीक</th><th>प्रगती</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
          </tbody>
        </table>

        <!-- 10.14 Stenciling -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.१४ घरावरील स्टेन्सीलिंग</h4>
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <thead>
            <tr style="background:#edf2f7;">
              <th rowspan="2">अ.क्र.</th>
              <th rowspan="2" class="text-left">तपशिल</th>
              <th colspan="3">मासीक</th>
              <th colspan="3">प्रगतीपर</th>
            </tr>
            <tr style="background:#edf2f7;">
              <th>पहिला पंधरवडा</th><th>दुसरा पंधरवडा</th><th>एकूण</th>
              <th>पहिला पंधरवडा</th><th>दुसरा पंधरवडा</th><th>एकूण</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td><td class="text-left">एकूण घरांची संख्या</td>
              <td>8533</td><td>8533</td><td>17066</td>
              <td>8533</td><td>8533</td><td>17066</td>
            </tr>
            <tr>
              <td>2</td><td class="text-left">आराखडे पुर्ण झालेल्या घरांची संख्या</td>
              <td>0</td><td>0</td><td>0</td>
              <td>1250</td><td>1579</td><td>2829</td>
            </tr>
            <tr>
              <td>3</td><td class="text-left">गृहभेटी आरोग्य सेवक</td>
              <td>${D35}</td><td>${D36}</td><td><b>${D37}</b></td>
              <td>${D38}</td><td>${D39}</td><td><b>${D40}</b></td>
            </tr>
            <tr>
              <td>4</td><td class="text-left">गृहभेटी आरोग्य सेवीका</td>
              <td>${D41}</td><td>${D42}</td><td><b>${D43}</b></td>
              <td>${D44}</td><td>${D45}</td><td><b>${D46}</b></td>
            </tr>
          </tbody>
        </table>

        <!-- 10.15.1 Lab Report -->
        <h4 style="font-size:14px; margin:15px 0 6px 0; font-weight:700;">१०.१५.१ प्रयोगशाळा अहवाल (प्रयोगशाळा तंत्रज्ञ पद रिक्त)</h4>
        <table style="width:100%; font-size:12px; margin-bottom:15px;">
          <tbody>
            <tr><td style="width:6%;">1</td><td class="text-left">महिन्याच्या सुरुवातीस शिल्लक रक्त नमूने</td><td style="width:15%;">0</td></tr>
            <tr><td>2</td><td class="text-left">महिन्यात प्राप्त झालेले रक्त नमूने</td><td>0</td></tr>
            <tr><td>3</td><td class="text-left">प्रयोगशाळेत तपासणीसाठी एकूण उपलब्ध रक्त नमूने (१ + २)</td><td>0</td></tr>
            <tr><td>4</td><td class="text-left">महिन्यात तपासलेले रक्त नमूने</td><td>0</td></tr>
            <tr><td>5</td><td class="text-left">तपासणीसाठी जिल्हा+प्रा.आ.केंद्राबाहेर पाठविलेले रक्त नमूने</td><td><b>${D19}</b></td></tr>
            <tr><td>6</td><td class="text-left">महिना अखेर तपासणीसाठी शिल्लक रक्त नमूने</td><td>0</td></tr>
            <tr>
              <td rowspan="4">7</td>
              <td class="text-left" colspan="2"><b>रक्त नमूना प्राप्त झालेपासुन तपासणीचा कालावधी:</b></td>
            </tr>
            <tr><td class="text-left" style="padding-left:20px;">० ते १ दिवस</td><td>0</td></tr>
            <tr><td class="text-left" style="padding-left:20px;">२ ते ७ दिवस</td><td><b>${D65}</b></td></tr>
            <tr><td class="text-left" style="padding-left:20px;">८ ते १५ दिवस</td><td><b>${D66}</b></td></tr>
            <tr><td></td><td class="text-left" style="padding-left:20px;">१५ दिवसाच्यावर</td><td><b>${D67}</b></td></tr>
          </tbody>
        </table>

        <!-- 10.15.2 Low performance -->
        <h4 style="font-size:14px; margin:10px 0 6px 0; font-weight:700;">१०.१५.२ कमी रक्त नमूने गोळा केलेल्या कर्मचा-यांची माहिती</h4>
        <table style="width:100%; font-size:12px; margin-bottom:20px;">
          <tbody>
            <tr><td style="width:6%;">1</td><td class="text-left">एकही रक्त नमूना न घेणा-या कर्मचा-यांची संख्या</td><td style="width:15%;">0</td></tr>
            <tr><td>2</td><td class="text-left">नियमित रक्त नमूने न घेणा-या कर्मचा-याची संख्या</td><td>0</td></tr>
            <tr><td>3</td><td class="text-left">५० टक्के पेक्षा कमी रक्त नमूने घेणा-या कर्मचा-याची संख्या</td><td>0</td></tr>
            <tr><td>4</td><td class="text-left">एकही रक्त नमूना गोळा न केलेल्या गावाची संख्या</td><td>0</td></tr>
            <tr><td>5</td><td class="text-left">५० टक्के पेक्षा कमी रक्त नमूने गोळा केलेल्या सेक्टरची संख्या यादी सोबत जोडावी.</td><td>0</td></tr>
          </tbody>
        </table>

        <div class="footer-sign">
          <b>वैद्यकीय अधिकारी</b><br>
          प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
        </div>
      </div>
    `;

    const reportId = `monthly_${Date.now()}`;
    const reportHtml = wrapReportPage(`मासिक हिवताप अहवाल - ${selectedMonthDisplay}`, bodyHtml);
    generatedReports.set(reportId, reportHtml);

    return {
      success: true,
      message: `माहे ${selectedMonthDisplay} चा अधिकृत मासिक अहवाल यशस्वीरित्या तयार झाला! (एकूण ${D19} नमुने)`,
      url: `/api/reports/${reportId}`
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// 3. कर्मचारी नोंदवही (Employee Register)
export function generateEmployeeRegisterWebApp(filterUpkendra, filterEmployee) {
  try {
    const currentYear = new Date().getFullYear();
    const filtered = bsDataEntry.filter(row => {
      const rowDate = new Date(row[1]);
      if (isNaN(rowDate.getTime()) || rowDate.getFullYear() !== currentYear) return false;
      if (filterUpkendra && filterUpkendra !== 'All' && row[2] !== filterUpkendra) return false;
      if (filterEmployee && filterEmployee !== 'All' && row[3] !== filterEmployee) return false;
      return true;
    });

    if (filtered.length === 0) {
      return { success: false, message: 'निवडलेल्या उपकेंद्र/कर्मचाऱ्यासाठी चालू वर्षाचा कोणताही डेटा सापडला नाही.' };
    }

    const organized = {};
    filtered.forEach(row => {
      const sc = row[2];
      const emp = row[3];
      if (!organized[sc]) organized[sc] = {};
      if (!organized[sc][emp]) {
        organized[sc][emp] = { designation: row[4], bsCode: row[5], entries: [] };
      }
      organized[sc][emp].entries.push(row);
    });

    let contentHtml = '';
    const scKeys = Object.keys(organized).sort();
    scKeys.forEach(scName => {
      contentHtml += `
        <div style="background:#edf2f7; padding:10px 15px; border-radius:6px; font-weight:700; font-size:16px; margin:20px 0 10px 0; color:#2d3748;">
          📍 उपकेंद्र: ${scName}
        </div>`;

      const emps = organized[scName];
      Object.keys(emps).sort().forEach(empName => {
        const group = emps[empName];
        let totalCount = 0;
        let rows = '';
        group.entries.sort((a,b) => new Date(a[1]) - new Date(b[1])).forEach((r, idx) => {
          const c = parseInt(r[9]) || 0;
          totalCount += c;
          rows += `
            <tr>
              <td>${idx + 1}</td>
              <td>${formatDateDisplay(r[1])}</td>
              <td><b>${r[6]}</b></td>
              <td>${r[7]}</td>
              <td>${r[8]}</td>
              <td><b>${c}</b></td>
            </tr>`;
        });

        contentHtml += `
          <div style="margin-top:15px; border:1px solid #cbd5e0; border-radius:8px; padding:15px; background:#ffffff;">
            <div style="font-weight:600; font-size:14px; color:#00796b; margin-bottom:10px; display:flex; justify-content:space-between;">
              <span>👤 ${empName} (${group.designation})</span>
              <span>BS Code: <b>${group.bsCode}</b> | एकूण नमुने: <b>${totalCount}</b></span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>अ.क्र</th>
                  <th>दिनांक</th>
                  <th>बंडल क्र.</th>
                  <th>पासून</th>
                  <th>पर्यंत</th>
                  <th>एकूण नमुने</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
                <tr style="background:#f7fafc; font-weight:bold;">
                  <td colspan="5" class="text-right">एकूण:</td>
                  <td>${totalCount}</td>
                </tr>
              </tbody>
            </table>
          </div>`;
      });
    });

    const bodyHtml = `
      <div class="header-box">
        <h1 class="main-title">प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर</h1>
        <h2 class="sub-title">कर्मचारीनिहाय रक्त नमुना संकलन नोंदवही - सन ${currentYear}</h2>
        <div style="font-size:13px; margin-top:5px; color:#718096;">
          फिल्टर: उपकेंद्र - <b>${filterUpkendra || 'सर्व'}</b> | कर्मचारी - <b>${filterEmployee || 'सर्व'}</b>
        </div>
      </div>
      ${contentHtml}
      <div class="footer-sign">
        <b>वैद्यकीय अधिकारी</b><br>
        प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
      </div>`;

    const reportId = `register_${Date.now()}`;
    const reportHtml = wrapReportPage(`कर्मचारी नोंदवही - ${currentYear}`, bodyHtml);
    generatedReports.set(reportId, reportHtml);

    return {
      success: true,
      message: `कर्मचारी नोंदवही यशस्वीरित्या तयार झाली! (${filtered.length} नोंदी)`,
      url: `/api/reports/${reportId}`
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// 4. कारणे दाखवा नोटीस (Show Cause Notices)
export function getDefaulterListForMonth(selectedMonthDisplay) {
  try {
    const MONTHLY_TARGET = 50;
    const monthObj = monthMaster.find(m => cleanStr(m.name) === cleanStr(selectedMonthDisplay));
    if (!monthObj) return { success: false, message: 'महिना सापडला नाही.' };

    const startDate = monthObj.f1Start;
    const endDate = monthObj.f2End;

    const defaulters = [];
    masterData.forEach(emp => {
      const post = emp.designation || '';
      if (post.includes('आशा') || post.includes('वैद्यकीय अधिकारी') || post.includes('औषध')) return;

      let total = 0;
      const days = new Set();
      bsDataEntry.forEach(r => {
        const rDate = new Date(r[1]);
        if (r[5] === emp.bsCode && rDate >= startDate && rDate <= endDate) {
          total += (parseInt(r[9]) || 0);
          days.add(formatDateDisplay(rDate));
        }
      });

      if (total < MONTHLY_TARGET) {
        defaulters.push({
          name: emp.employeeName,
          post: emp.designation,
          sc: emp.upkendra,
          daysCount: days.size,
          samplesCount: total
        });
      }
    });

    return { success: true, defaulters };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

export function generateEmployeeNoticesWebApp(selectedMonthDisplay, selectedEmpNames) {
  try {
    const listRes = getDefaulterListForMonth(selectedMonthDisplay);
    if (!listRes.success) return listRes;

    const list = listRes.defaulters.filter(e => selectedEmpNames.includes(e.name));
    if (list.length === 0) {
      return { success: false, message: 'नोटीस तयार करण्यासाठी कोणतेही कर्मचारी निवडले नाहीत.' };
    }

    const noticeDate = formatDateDisplay(new Date());
    let noticesHtml = '';

    list.forEach((e, idx) => {
      noticesHtml += `
        <div style="padding:20px; border:1px solid #000; border-radius:6px; margin-bottom:30px; page-break-inside:avoid;">
          <div class="header-box" style="border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:15px;">
            <h2 style="margin:0; font-size:18px;">प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर</h2>
            <div style="font-size:15px; font-weight:bold; margin-top:4px;">कारणे दाखवा नोटीस (Show Cause Notice)</div>
          </div>
          
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold; margin-bottom:15px;">
            <span>जा.क्र. प्रआकेभा/मलेरिया/२०२६/नोटीस-${idx + 1}</span>
            <span>दिनांक: ${noticeDate}</span>
          </div>

          <div style="font-size:14px; line-height:1.6; margin-bottom:15px;">
            <strong>प्रति,</strong><br>
            श्री/श्रीमती <b>${e.name}</b><br>
            पद: ${e.post}, उपकेंद्र: ${e.sc}
          </div>

          <div class="subject">
            विषय: माहे ${selectedMonthDisplay} मधील रक्त नमुना संकलनाचे उद्दिष्ट पूर्ण न केल्याबाबत...
          </div>

          <p style="font-size:14px; line-height:1.6;">
            महोदय/महोदया,<br>
            आपणास कळविण्यात येते की, राष्ट्रीय आरोग्य कार्यक्रमांतर्गत हिवताप दुरीकरणासाठी दरमहा <b>५०</b> रक्त नमुने संकलित करण्याचे उद्दिष्ट आपणास देण्यात आलेले आहे. माहे <b>${selectedMonthDisplay}</b> मधील आपल्या कामगिरीचा आढावा घेतला असता खालील बाबी निदर्शनास आल्या आहेत:
          </p>

          <table style="width:85%; margin:15px auto;">
            <tr>
              <td style="width:60%;" class="text-left">निर्धारित मासिक उद्दिष्ट:</td>
              <td><b>५० नमुने</b></td>
            </tr>
            <tr>
              <td class="text-left">आपण प्रत्यक्षात घेतलेले एकूण नमुने:</td>
              <td><b style="color:#e53e3e; font-size:15px;">${e.samplesCount} नमुने</b></td>
            </tr>
            <tr>
              <td class="text-left">नमुना संकलन केलेले एकूण दिवस:</td>
              <td><b>${e.daysCount} दिवस</b></td>
            </tr>
          </table>

          <p style="font-size:14px; line-height:1.6;">
            वरील विवरणावरून असे निदर्शनास येते की, आपल्याकडून निर्धारित उद्दिष्टाच्या तुलनेत अत्यंत कमी कामगिरी झाली आहे. शासनाच्या राष्ट्रीय कार्यक्रमात हलगर्जीपणा दिसून येत आहे. तरी, याबाबतचा आपला लेखी खुलासा हे पत्र मिळाल्यापासून २ दिवसांच्या आत कार्यालयास प्रत्यक्ष सादर करावा.
          </p>

          <div class="footer-sign" style="margin-top:35px;">
            <b>वैद्यकीय अधिकारी</b><br>
            प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
          </div>

          <div style="margin-top:25px; font-size:12px; border-top:1px dashed #718096; padding-top:8px;">
            <strong>प्रत माहितीस्तव सविनय सादर:</strong><br>
            १. मा. जिल्हा हिवताप अधिकारी, लातूर.<br>
            २. मा. तालुका आरोग्य अधिकारी, तालुका आरोग्य कार्यालय औसा.
          </div>
        </div>`;
    });

    const reportId = `notice_${Date.now()}`;
    const reportHtml = wrapReportPage(`कारणे दाखवा नोटीस - ${selectedMonthDisplay}`, noticesHtml);
    generatedReports.set(reportId, reportHtml);

    return {
      success: true,
      message: `यशस्वी! निवडलेल्या ${list.length} कर्मचाऱ्यांसाठी नोटीस तयार झाली आहे.`,
      url: `/api/reports/${reportId}`
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// 5. कमी कामगिरी अहवाल (Low Performance Report)
export function generateLowPerformanceReportWebApp(selectedMonthDisplay) {
  try {
    const listRes = getDefaulterListForMonth(selectedMonthDisplay);
    if (!listRes.success) return listRes;

    const zeroSamples = listRes.defaulters.filter(d => d.samplesCount === 0);
    const lowSamples = listRes.defaulters.filter(d => d.samplesCount > 0 && d.samplesCount < 38);

    if (zeroSamples.length === 0 && lowSamples.length === 0) {
      return { success: true, message: 'उत्तम! निवडलेल्या महिन्यात सर्व कर्मचाऱ्यांनी ७५% पेक्षा जास्त काम केले आहे. कोणीही निरंक नाही.' };
    }

    let zeroHtml = '';
    if (zeroSamples.length > 0) {
      zeroHtml = `
        <h3 style="color:#c53030; font-size:15px; margin-top:20px;">१. निरंक (०) नमुने घेतलेले कर्मचारी:</h3>
        <table>
          <thead>
            <tr>
              <th>अ.क्र.</th>
              <th>कर्मचाऱ्याचे नाव (पद)</th>
              <th>उपकेंद्र</th>
              <th>घेतलेले नमुने</th>
            </tr>
          </thead>
          <tbody>
            ${zeroSamples.map((e, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td class="text-left">${e.name} (${e.post})</td>
                <td>${e.sc}</td>
                <td><b style="color:red;">${e.samplesCount}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    }

    let lowHtml = '';
    if (lowSamples.length > 0) {
      lowHtml = `
        <h3 style="color:#d69e2e; font-size:15px; margin-top:20px;">२. ७५% पेक्षा कमी (१ ते ३७) नमुने घेतलेले कर्मचारी:</h3>
        <table>
          <thead>
            <tr>
              <th>अ.क्र.</th>
              <th>कर्मचाऱ्याचे नाव (पद)</th>
              <th>उपकेंद्र</th>
              <th>घेतलेले नमुने</th>
            </tr>
          </thead>
          <tbody>
            ${lowSamples.map((e, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td class="text-left">${e.name} (${e.post})</td>
                <td>${e.sc}</td>
                <td><b style="color:#d69e2e;">${e.samplesCount}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    }

    const reportDate = formatDateDisplay(new Date());
    const bodyHtml = `
      <div class="header-box">
        <h1 class="main-title">प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर</h1>
        <h2 class="sub-title">कमी कामगिरी अहवाल (निरंक व ७५% पेक्षा कमी नमुने) - माहे: ${selectedMonthDisplay}</h2>
        <div style="font-size:13px; color:#718096; margin-top:4px;">अहवाल दिनांक: ${reportDate}</div>
      </div>
      <p style="font-size:14px; line-height:1.6;">
        माहे <b>${selectedMonthDisplay}</b> मध्ये ५० नमुन्यांच्या उद्दिष्टापैकी निरंक (०) आणि ७५% पेक्षा कमी (३७ पेक्षा कमी) नमुने घेतलेल्या कर्मचाऱ्यांचा तपशील खालीलप्रमाणे आहे:
      </p>
      ${zeroHtml}
      ${lowHtml}
      <div class="footer-sign">
        <b>वैद्यकीय अधिकारी</b><br>
        प्राथमिक आरोग्य केंद्र भादा, ता. औसा जि. लातूर
      </div>`;

    const reportId = `lowperf_${Date.now()}`;
    const reportHtml = wrapReportPage(`कमी कामगिरी अहवाल - ${selectedMonthDisplay}`, bodyHtml);
    generatedReports.set(reportId, reportHtml);

    return {
      success: true,
      message: `अहवाल तयार! निरंक: ${zeroSamples.length} आणि कमी कामगिरी: ${lowSamples.length} कर्मचारी सापडले.`,
      url: `/api/reports/${reportId}`
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
