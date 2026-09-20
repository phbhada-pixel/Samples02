import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  masterData,
  monthMaster,
  bsDataEntry,
  villageDetails,
  importantLinks,
  downloadsData,
  photosData,
  generatedReports,
  googleSheetConfig,
  formatBsEntry,
  formatVillageDetail,
  subcenterMaster,
  villagesMaster,
  employeeMaster,
  transferHistory,
  transferEmployee,
  updateEmployeeVillages,
  saveEmployee,
  deleteEmployee,
  saveSubcenter,
  deleteSubcenter,
  saveVillage,
  deleteVillage,
  importMasterDataFromCsv,
  importBsDataEntryCsv,
  importVillageDetailsCsv,
  importMonthMasterCsv,
  seedInitialMalariaData,
  clearAllTransactionData,
  getOpdBsVillagewiseSummary,
  getEmployeeVillageDistributionSummary,
  saveDbToDisk,
  loadDbFromDisk
} from './data/store.js';

import {
  generateDailyMalariaReportWebApp,
  generateMonthlyReportWebApp,
  generateEmployeeRegisterWebApp,
  getDefaulterListForMonth,
  generateEmployeeNoticesWebApp,
  generateLowPerformanceReportWebApp
} from './services/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Form.html at root and standard entry paths
app.get(['/', '/Form.html', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'Form.html'));
});

// RPC health/info endpoint
app.get('/api/rpc', (req, res) => {
  res.json({ status: 'ok', service: 'PHC Bhada Malaria RPC API' });
});

// View generated reports (HTML / Print View)
app.get('/api/reports/:id', (req, res) => {
  const reportHtml = generatedReports.get(req.params.id);
  if (!reportHtml) {
    return res.status(404).send('<h3>अहवाल सापडला नाही (Report Not Found).</h3>');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(reportHtml);
});

// Export BS Data as CSV (compatible with Google Sheets / Excel with UTF-8 BOM)
app.get('/api/export/bs-data.csv', (req, res) => {
  const headers = ['BS_ID', 'तारीख', 'उपकेंद्र', 'कर्मचारी नाव', 'पदनाम', 'BS Code', 'बंडल क्र.', 'पासून', 'पर्यंत', 'एकूण नमुने'];
  const rows = bsDataEntry.map(r => {
    const item = formatBsEntry(r);
    return [
      `"${item.id}"`,
      `"${item.dateStr}"`,
      `"${item.upkendra}"`,
      `"${item.employeeName}"`,
      `"${item.designation}"`,
      `"${item.bsCode}"`,
      `"${item.bundleNumber}"`,
      item.pasun,
      item.paraynt,
      item.total
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="BsDataEntry_PHC_Bhada.csv"');
  res.send(csvContent);
});

// Export Village Details as CSV
app.get('/api/export/village-details.csv', (req, res) => {
  const headers = ['BS_ID', 'कर्मचारी नाव', 'तारीख', 'गाव', 'एकूण नमुने', 'पुरुष', 'स्त्री', 'उपकेंद्र'];
  const rows = villageDetails.map(r => {
    const item = formatVillageDetail(r);
    return [
      `"${item.id}"`,
      `"${item.employeeName}"`,
      `"${item.dateStr}"`,
      `"${item.villageName}"`,
      item.sampleCount,
      item.maleCount,
      item.femaleCount,
      `"${item.upkendra}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="VillageDetails_PHC_Bhada.csv"');
  res.send(csvContent);
});

// Export Subcenters as CSV
app.get('/api/export/subcenters.csv', (req, res) => {
  const headers = ['उपकेंद्र आयडी', 'उपकेंद्र नाव', 'मुख्यालय', 'लोकसंख्या', 'घरांची संख्या', 'समाविष्ट गावे', 'संपर्क व्यक्ती', 'मोबाईल'];
  const rows = subcenterMaster.map(s => [
    `"${s.id}"`,
    `"${s.name}"`,
    `"${s.headquarter || ''}"`,
    s.population || 0,
    s.houses || 0,
    `"${(s.villages || []).join('; ')}"`,
    `"${s.contactPerson || ''}"`,
    `"${s.contactPhone || ''}"`
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="SubcenterMaster_PHC_Bhada.csv"');
  res.send(csvContent);
});

// Export Villages as CSV
app.get('/api/export/villages.csv', (req, res) => {
  const headers = ['गाव आयडी', 'गावाचे नाव', 'उपकेंद्र', 'लोकसंख्या', 'घरांची संख्या', 'वार्षिक उद्दिष्ट', 'आशा नाव', 'नियुक्त कर्मचारी'];
  const rows = villagesMaster.map(v => [
    `"${v.id}"`,
    `"${v.villageName}"`,
    `"${v.subcenter}"`,
    v.population || 0,
    v.houses || 0,
    v.annualSmearTarget || 0,
    `"${v.ashaName || ''}"`,
    `"${(v.assignedEmployees || []).join('; ')}"`
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="VillagesMaster_PHC_Bhada.csv"');
  res.send(csvContent);
});

// Export Employees as CSV
app.get('/api/export/employees.csv', (req, res) => {
  const headers = ['कर्मचारी आयडी', 'उपकेंद्र', 'कर्मचारी नाव', 'पदनाम', 'प्रवर्ग', 'BS Code', 'मोबाईल', 'लागू असणारी गावे'];
  const rows = employeeMaster.map(e => [
    `"${e.id}"`,
    `"${e.upkendra}"`,
    `"${e.employeeName}"`,
    `"${e.designation}"`,
    `"${e.category || ''}"`,
    `"${e.bsCode || ''}"`,
    `"${e.mobile || ''}"`,
    `"${(e.villageList || []).join('; ')}"`
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="EmployeesMaster_PHC_Bhada.csv"');
  res.send(csvContent);
});

// Export Transfers as CSV
app.get('/api/export/transfers.csv', (req, res) => {
  const headers = ['बदली आयडी', 'दिनांक', 'कर्मचारी नाव', 'पदनाम', 'पूर्वीचे उपकेंद्र', 'नवीन उपकेंद्र', 'पूर्वीची गावे', 'नवीन गावे', 'BS Code', 'कारण', 'आदेश क्र', 'आदेश अधिकारी'];
  const rows = transferHistory.map(t => [
    `"${t.id}"`,
    `"${t.dateFormatted || ''}"`,
    `"${t.employeeName}"`,
    `"${t.designation}"`,
    `"${t.fromUpkendra}"`,
    `"${t.toUpkendra}"`,
    `"${(t.previousVillages || []).join('; ')}"`,
    `"${(t.newVillages || []).join('; ')}"`,
    `"${t.bsCode || ''}"`,
    `"${t.reason || ''}"`,
    `"${t.orderNo || ''}"`,
    `"${t.transferredBy || ''}"`
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="TransferHistory_PHC_Bhada.csv"');
  res.send(csvContent);
});

// CSV Export for Monthly Indicators (नवीन बाह्यरुग्ण, तापाचे रुग्ण, उपचारीत रुग्ण, क्लोरोक्वीन गोळ्या)
app.get('/api/export/monthly-indicators.csv', (req, res) => {
  const headers = [
    'महिना (Month)',
    'नवीन बाह्यरुग्ण मासिक (New OPD Monthly)',
    'नवीन बाह्यरुग्ण प्रगत (New OPD Progressive)',
    'तापाचे रुग्ण मासिक (Fever Cases Monthly)',
    'तापाचे रुग्ण प्रगत (Fever Cases Progressive)',
    'घेतलेले रक्त नमुणे मासिक (Blood Smears Monthly)',
    'घेतलेले रक्त नमुणे प्रगत (Blood Smears Progressive)',
    'उपचारीत रुग्ण मासिक (Treated Cases Monthly)',
    'उपचारीत रुग्ण प्रगत (Treated Cases Progressive)',
    'क्लोरोक्वीन गोळ्या खर्च मासिक (Chloroquine Monthly)',
    'क्लोरोक्वीन गोळ्या खर्च प्रगत (Chloroquine Progressive)'
  ];

  let priorOpd = 0, priorFever = 0, priorSmears = 0, priorTreated = 0, priorCq = 0;
  const rows = monthMaster.map(m => {
    const opdM = parseInt(m.newOpd != null ? m.newOpd : (m.opd || 0)) || 0;
    const opdP = m.progNewOpd != null ? parseInt(m.progNewOpd) : (priorOpd + opdM);
    priorOpd = opdP;

    const feverM = parseInt(m.feverCases) || 0;
    const feverP = m.progFeverCases != null ? parseInt(m.progFeverCases) : (priorFever + feverM);
    priorFever = feverP;

    const smearM = parseInt(m.bloodSmears) || 0;
    const smearP = m.progBloodSmears != null ? parseInt(m.progBloodSmears) : (priorSmears + smearM);
    priorSmears = smearP;

    const treatedM = parseInt(m.treatedCases) || 0;
    const treatedP = m.progTreatedCases != null ? parseInt(m.progTreatedCases) : (priorTreated + treatedM);
    priorTreated = treatedP;

    const cqM = parseInt(m.chloroquineSpent) || 0;
    const cqP = m.progChloroquineSpent != null ? parseInt(m.progChloroquineSpent) : (priorCq + cqM);
    priorCq = cqP;

    return [
      `"${m.name}"`,
      opdM, opdP,
      feverM, feverP,
      smearM, smearP,
      treatedM, treatedP,
      cqM, cqP
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="NVBDCP_Monthly_Indicators_PHC_Bhada.csv"');
  res.send(csvContent);
});

// CSV Export for Month Master (Fortnight, OPD, MPW Visits, ANM Visits, ASHA Visits, Fever, Smears, Treatment, CQ)
app.get('/api/export/month-master.csv', (req, res) => {
  const headers = [
    'महिना (Month)',
    'पंधरवडा १ सुरु (FN1 Start)',
    'पंधरवडा १ शेवट (FN1 End)',
    'पंधरवडा २ सुरु (FN2 Start)',
    'पंधरवडा २ शेवट (FN2 End)',
    'नवीन बाह्यरुग्ण मासिक (New OPD Monthly)',
    'नवीन बाह्यरुग्ण प्रगत (New OPD Progressive)',
    'MPW गृहभेटी मासिक (MPW Home Visits)',
    'MPW गृहभेटी प्रगत (MPW Visits Progressive)',
    'ANM गृहभेटी मासिक (ANM Home Visits)',
    'ANM गृहभेटी प्रगत (ANM Visits Progressive)',
    'आशा गृहभेटी मासिक (ASHA Home Visits)',
    'आशा गृहभेटी प्रगत (ASHA Visits Progressive)',
    'तापाचे रुग्ण मासिक (Fever Cases Monthly)',
    'तापाचे रुग्ण प्रगत (Fever Cases Progressive)',
    'घेतलेले रक्त नमुणे मासिक (Blood Smears Monthly)',
    'घेतलेले रक्त नमुणे प्रगत (Blood Smears Progressive)',
    'उपचारीत रुग्ण मासिक (Treated Cases Monthly)',
    'उपचारीत रुग्ण प्रगत (Treated Cases Progressive)',
    'क्लोरोक्वीन खर्च मासिक (Chloroquine Monthly)',
    'क्लोरोक्वीन खर्च प्रगत (Chloroquine Progressive)'
  ];

  const fmtD = d => d instanceof Date ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : String(d || '');

  const rows = monthMaster.map(m => {
    return [
      `"${m.name}"`,
      `"${fmtD(m.f1Start)}"`,
      `"${fmtD(m.f1End)}"`,
      `"${fmtD(m.f2Start)}"`,
      `"${fmtD(m.f2End)}"`,
      m.newOpd || 0,
      m.progNewOpd || 0,
      m.mpwHomeVisits || 0,
      m.progMpwHomeVisits || 0,
      m.anmHomeVisits || 0,
      m.progAnmHomeVisits || 0,
      m.ashaHomeVisits || 0,
      m.progAshaHomeVisits || 0,
      m.feverCases || 0,
      m.progFeverCases || 0,
      m.bloodSmears || 0,
      m.progBloodSmears || 0,
      m.treatedCases || 0,
      m.progTreatedCases || 0,
      m.chloroquineSpent || 0,
      m.progChloroquineSpent || 0
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="MonthMaster_PHC_Bhada_2026.csv"');
  res.send(csvContent);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'PHC Bhada Malaria Management System',
    records: bsDataEntry.length,
    villageRecords: villageDetails.length
  });
});

// Employee-Village Distribution Analytics Endpoint
app.get('/api/analytics/employee-village-distribution', (req, res) => {
  try {
    const summary = getEmployeeVillageDistributionSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Primary sync helper to send rows directly to Google Sheet Webhook
async function triggerGoogleSheetSync(payload) {
  if (!googleSheetConfig.webhookUrl) {
    return { success: false, message: 'गुगल शीट वेबहुक URL उपलब्ध नाही.' };
  }
  try {
    console.log(`[GoogleSheetSync] Sending real-time sync action: ${payload.action}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(googleSheetConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    let respData = null;
    try {
      respData = await response.json();
    } catch (_) {}

    googleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');
    googleSheetConfig.syncStatus = '✅ थेट गुगल शीटमध्ये रिअल-टाईम जतन (Live Synced in Google Sheet)';
    console.log(`[GoogleSheetSync] Success for action: ${payload.action}`);
    return { success: true, data: respData };
  } catch (err) {
    console.warn(`[GoogleSheetSync] Sync error for action ${payload.action}:`, err.message);
    googleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');
    googleSheetConfig.syncStatus = 'स्थानिक प्रणालीमध्ये सुरक्षित (Pending Webhook Response)';
    return { success: false, error: err.message };
  }
}

// Central RPC endpoint for Google Apps Script client calls
app.post('/api/rpc', async (req, res) => {
  try {
    const { method, args = [] } = req.body || {};
    if (!method) {
      return res.status(400).json({ error: 'मेथडचे नाव आवश्यक आहे (Method name is required).' });
    }

    let result;

    switch (method) {
      case 'getMasterData': {
        result = masterData;
        break;
      }

      case 'getLatestBundleNumber': {
        const [commonDate] = args;
        const inputDate = commonDate ? new Date(commonDate) : new Date();
        const inputDateStr = !isNaN(inputDate.getTime())
          ? `${inputDate.getFullYear()}-${String(inputDate.getMonth() + 1).padStart(2, '0')}-${String(inputDate.getDate()).padStart(2, '0')}`
          : '';
        let latest = 0;
        for (let i = bsDataEntry.length - 1; i >= 0; i--) {
          const rowDate = new Date(bsDataEntry[i][1]);
          const rowDateStr = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, '0')}-${String(rowDate.getDate()).padStart(2, '0')}`;
          if (rowDateStr === inputDateStr) {
            const match = String(bsDataEntry[i][6]).match(/(\d+)$/);
            if (match) latest = Math.max(latest, parseInt(match[1]));
          }
        }
        result = latest;
        break;
      }

      case 'getLastParayntValue': {
        const [upkendra, employeeName, commonDate] = args;
        const inputYear = (commonDate && !isNaN(new Date(commonDate).getTime()))
          ? new Date(commonDate).getFullYear()
          : new Date().getFullYear();
        let maxParaynt = 0;
        for (let i = 0; i < bsDataEntry.length; i++) {
          const row = bsDataEntry[i];
          const rowDate = new Date(row[1]);
          if (isNaN(rowDate.getTime())) continue;
          if (
            rowDate.getFullYear() === inputYear &&
            String(row[2]).trim() === String(upkendra).trim() &&
            String(row[3]).trim() === String(employeeName).trim()
          ) {
            const val = parseInt(row[8]) || 0;
            if (val > maxParaynt) maxParaynt = val;
          }
        }
        result = maxParaynt;
        break;
      }

      case 'saveBsData':
      case 'processForm': {
        const [formData] = args;
        const formDataArray = Array.isArray(formData) ? formData : (formData ? [formData] : []);
        if (!formDataArray.length) {
          result = { success: false, message: 'अवैध किंवा रिकामा फॉर्म डेटा (Invalid or empty form data).' };
          break;
        }

        const newEntriesForSync = [];
        const newVillageDetailsForSync = [];

        formDataArray.forEach(entry => {
          const dateObj = entry.bsSendDate ? new Date(entry.bsSendDate) : new Date();
          const yyyymmdd = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}`;
          const rowId = bsDataEntry.length + 1;
          const uniqueId = `BS_${yyyymmdd}_${entry.bsCode || '0'}_${rowId}`;
          const total = (parseInt(entry.paraynt) || 0) - (parseInt(entry.pasun) || 0) + 1;

          bsDataEntry.push([
            uniqueId,
            dateObj,
            entry.upkendra || '',
            entry.employeeName || '',
            entry.designation || '',
            entry.bsCode || '',
            entry.bundleNumber || '',
            parseInt(entry.pasun) || 0,
            parseInt(entry.paraynt) || 0,
            total
          ]);

          newEntriesForSync.push({
            id: uniqueId,
            date: dateObj.toISOString().split('T')[0],
            upkendra: entry.upkendra || '',
            employeeName: entry.employeeName || '',
            designation: entry.designation || '',
            bsCode: entry.bsCode || '',
            bundleNumber: entry.bundleNumber || '',
            pasun: parseInt(entry.pasun) || 0,
            paraynt: parseInt(entry.paraynt) || 0,
            total: total
          });

          const vDetails = Array.isArray(entry.villageDetails) ? entry.villageDetails : (Array.isArray(entry.villageRows) ? entry.villageRows : []);
          if (vDetails.length > 0) {
            vDetails.forEach(v => {
              villageDetails.push([
                uniqueId,
                entry.employeeName || '',
                dateObj,
                v.villageName || '',
                parseInt(v.sampleCount) || 0,
                parseInt(v.maleCount) || 0,
                parseInt(v.femaleCount) || 0,
                entry.upkendra || ''
              ]);
              newVillageDetailsForSync.push({
                uniqueId: uniqueId,
                employeeName: entry.employeeName || '',
                date: dateObj.toISOString().split('T')[0],
                villageName: v.villageName || '',
                sampleCount: parseInt(v.sampleCount) || 0,
                maleCount: parseInt(v.maleCount) || 0,
                femaleCount: parseInt(v.femaleCount) || 0,
                upkendra: entry.upkendra || ''
              });
            });
          }
        });

        saveDbToDisk();

        // Direct Google Sheet Sync: Await webhook persistence
        let sheetSyncResult = { success: false };
        if (googleSheetConfig.webhookUrl) {
          sheetSyncResult = await triggerGoogleSheetSync({
            action: 'appendEntries',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            entries: newEntriesForSync,
            villageDetails: newVillageDetailsForSync,
            timestamp: new Date().toISOString()
          });
        }

        result = {
          success: true,
          message: sheetSyncResult.success
            ? '✅ डेटा थेट गुगल शीटमध्ये यशस्वीरित्या सुरक्षित सेव्ह झाला!'
            : 'डेटा स्थानिक प्रणालीमध्ये सुरक्षित जतन झाला (गुगल शीट सिंक सज्ज आहे).',
          sheetSynced: sheetSyncResult.success,
          sheetUrl: `https://docs.google.com/spreadsheets/d/${googleSheetConfig.spreadsheetId}/edit`,
          lastSyncTime: googleSheetConfig.lastSyncTime
        };
        break;
      }

      case 'getTablesData':
      case 'getAllTablesData': {
        result = {
          success: true,
          bsData: bsDataEntry.map(formatBsEntry).reverse(),
          villageDetails: villageDetails.map(formatVillageDetail).reverse(),
          masterData: masterData,
          subcenterMaster: subcenterMaster,
          villagesMaster: villagesMaster,
          employeeMaster: employeeMaster,
          transferHistory: transferHistory,
          monthMaster: monthMaster.map((m, idx) => {
            const pad = n => String(n).padStart(2, '0');
            const dStr = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
            const priorMonths = monthMaster.slice(0, idx + 1);
            const calcProgOpd = priorMonths.reduce((s, x) => s + (parseInt(x.newOpd) || 0), 0);
            const calcProgFever = priorMonths.reduce((s, x) => s + (parseInt(x.feverCases != null ? x.feverCases : 0) || 0), 0);
            const calcProgSmears = priorMonths.reduce((s, x) => s + (parseInt(x.bloodSmears != null ? x.bloodSmears : (x.feverCases || 0)) || 0), 0);
            const calcProgTreated = priorMonths.reduce((s, x) => s + (parseInt(x.treatedCases != null ? x.treatedCases : 0) || 0), 0);
            const calcProgCq = priorMonths.reduce((s, x) => s + (parseInt(x.chloroquineSpent) || 0), 0);

            return {
              name: m.name,
              fn1: `${dStr(m.f1Start)} ते ${dStr(m.f1End)}`,
              fn2: `${dStr(m.f2Start)} ते ${dStr(m.f2End)}`,
              opd: m.newOpd,
              progOpd: m.progNewOpd != null ? m.progNewOpd : calcProgOpd,
              feverCases: m.feverCases != null ? m.feverCases : 0,
              progFeverCases: m.progFeverCases != null ? m.progFeverCases : calcProgFever,
              bloodSmears: m.bloodSmears != null ? m.bloodSmears : (m.feverCases || 0),
              progBloodSmears: m.progBloodSmears != null ? m.progBloodSmears : calcProgSmears,
              treatedCases: m.treatedCases != null ? m.treatedCases : 0,
              progTreatedCases: m.progTreatedCases != null ? m.progTreatedCases : calcProgTreated,
              chloroquineSpent: m.chloroquineSpent != null ? m.chloroquineSpent : 0,
              progChloroquineSpent: m.progChloroquineSpent != null ? m.progChloroquineSpent : calcProgCq
            };
          }),
          googleSheetConfig: googleSheetConfig
        };
        break;
      }

      case 'saveGoogleSheetConfig': {
        const [config] = args;
        if (config) {
          if (config.spreadsheetId) googleSheetConfig.spreadsheetId = config.spreadsheetId.trim();
          if (config.webhookUrl) googleSheetConfig.webhookUrl = config.webhookUrl.trim();
          if (config.githubRepoUrl) {
            googleSheetConfig.githubRepoUrl = config.githubRepoUrl.trim();
            const ghLink = importantLinks.find(l => l.isGithub || l.name.includes("GitHub"));
            if (ghLink) ghLink.url = googleSheetConfig.githubRepoUrl;
          }
          if (typeof config.autoSync === 'boolean') googleSheetConfig.autoSync = config.autoSync;
        }
        saveDbToDisk();
        result = {
          success: true,
          message: 'गुगल शीट व GitHub सेटिंग्ज यशस्वीरित्या अपडेट करण्यात आल्या!',
          config: googleSheetConfig
        };
        break;
      }

      case 'testGoogleSheetConnection': {
        const payload = {
          action: 'ping',
          spreadsheetId: googleSheetConfig.spreadsheetId,
          timestamp: new Date().toISOString(),
          message: 'PHC Bhada NVBDCP Real-time Sync Test'
        };
        const syncRes = await triggerGoogleSheetSync(payload);
        result = {
          success: syncRes.success,
          message: syncRes.success
            ? '✅ गुगल शीट वेबहुक कनेक्शन यशस्वी! थेट रिअल-टाईम डेटा स्टोरेज सक्रिय आहे.'
            : `⚠️ गुगल शीट कनेक्शन त्रुटी: ${syncRes.error || 'वेबहुक प्रतिसाद मिळाला नाही.'}`,
          config: googleSheetConfig
        };
        break;
      }

      case 'syncAllToGoogleSheet': {
        const payload = {
          action: 'syncAllData',
          spreadsheetId: googleSheetConfig.spreadsheetId,
          timestamp: new Date().toISOString(),
          bsDataCount: bsDataEntry.length,
          villageDetailsCount: villageDetails.length,
          bsData: bsDataEntry.map(formatBsEntry),
          villageDetails: villageDetails.map(formatVillageDetail)
        };

        const syncRes = await triggerGoogleSheetSync(payload);
        result = {
          success: true,
          message: syncRes.success
            ? `गुगल शीटमध्ये ${bsDataEntry.length} नोंदी यशस्वीरित्या सिंक झाल्या!`
            : `डेटा सिंक प्रक्रिया पूर्ण झाली (स्थिती: ${googleSheetConfig.syncStatus})`,
          lastSyncTime: googleSheetConfig.lastSyncTime,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${googleSheetConfig.spreadsheetId}/edit`
        };
        break;
      }

      case 'fetchRealtimeFromGoogleSheet':
      case 'fetchDataFromGoogleSheet': {
        if (!googleSheetConfig.webhookUrl) {
          result = { success: false, message: 'गुगल शीट वेबहूक URL कॉन्फिगर केलेले नाही.' };
          break;
        }

        try {
          console.log('[Server] Fetching live data from Google Sheet webhook...');
          const fetchRes = await fetch(googleSheetConfig.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'fetchAllData',
              spreadsheetId: googleSheetConfig.spreadsheetId
            })
          });

          if (!fetchRes.ok) {
            throw new Error(`HTTP Error ${fetchRes.status}: ${fetchRes.statusText}`);
          }

          const fetchedData = await fetchRes.json();
          let importedBs = 0;
          let importedVil = 0;

          if (Array.isArray(fetchedData.bsData) && fetchedData.bsData.length > 0) {
            bsDataEntry.length = 0;
            fetchedData.bsData.forEach(r => {
              bsDataEntry.push([
                r.id,
                new Date(r.date || Date.now()),
                r.upkendra || '',
                r.name || '',
                r.designation || '',
                r.bsCode || '',
                r.bundleNumber || '',
                parseInt(r.pasun) || 1,
                parseInt(r.paraynt) || 1,
                parseInt(r.total) || 1
              ]);
              importedBs++;
            });
          }

          if (Array.isArray(fetchedData.villageDetails) && fetchedData.villageDetails.length > 0) {
            villageDetails.length = 0;
            fetchedData.villageDetails.forEach(v => {
              villageDetails.push([
                v.id,
                v.employeeName || '',
                new Date(v.date || Date.now()),
                v.villageName || '',
                parseInt(v.sampleCount) || 1,
                parseInt(v.maleCount) || 0,
                parseInt(v.femaleCount) || 0,
                v.upkendra || ''
              ]);
              importedVil++;
            });
          }

          if (importedBs > 0 || importedVil > 0) {
            saveDbToDisk();
          }

          googleSheetConfig.lastSyncTime = new Date().toISOString();
          googleSheetConfig.syncStatus = 'रिअल-टाईम सिंक सक्रिय (Active)';

          result = {
            success: true,
            importedBs,
            importedVil,
            totalRecords: bsDataEntry.length,
            message: (importedBs > 0 || importedVil > 0)
              ? `गुगल शीटमधून ${importedBs} रक्त नमुना नोंदी व ${importedVil} गाव नोंदी यशस्वीरित्या सिंक झाल्या!`
              : `गुगल शीटशी संपर्क झाला, सध्या शीटमध्ये नवीन नोंदी उपलब्ध नाहीत.`
          };
        } catch (err) {
          console.error('[Server] Error fetching from Google Sheet:', err);
          result = {
            success: false,
            message: `गुगल शीटमधून थेट डेटा फेच करताना त्रुटी: ${err.message}`
          };
        }
        break;
      }

      case 'clearAllDummyData':
      case 'clearAllData': {
        const clearRes = clearAllTransactionData();
        result = {
          success: true,
          message: clearRes.message || 'सर्व तात्पुरता/नमुना डेटा यशस्वीरित्या काढून टाकण्यात आला.'
        };
        break;
      }

      case 'deleteBsEntry': {
        const [entryId] = args;
        const index = bsDataEntry.findIndex(r => r[0] === entryId);
        if (index !== -1) {
          bsDataEntry.splice(index, 1);
          // Also remove corresponding village details
          for (let i = villageDetails.length - 1; i >= 0; i--) {
            if (villageDetails[i][0] === entryId) {
              villageDetails.splice(i, 1);
            }
          }
          saveDbToDisk();
          if (googleSheetConfig.webhookUrl) {
            triggerGoogleSheetSync({
              action: 'deleteEntry',
              spreadsheetId: googleSheetConfig.spreadsheetId,
              entryId: entryId,
              timestamp: new Date().toISOString()
            }).catch(e => console.error('Error syncing delete to sheet:', e));
          }
          result = { success: true, message: `नोंद ${entryId} यशस्वीरित्या हटवली!` };
        } else {
          result = { success: false, message: 'नोंद सापडली नाही.' };
        }
        break;
      }

      case 'getDashboardStats': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        let endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        for (let i = 0; i < monthMaster.length; i++) {
          const m = monthMaster[i];
          if (today >= m.f1Start && today <= m.f2End) {
            startDate = m.f1Start;
            endDate = m.f2End;
            break;
          }
        }

        let total = 0;
        let active = 0;
        let passive = 0;

        for (let i = 0; i < bsDataEntry.length; i++) {
          const row = bsDataEntry[i];
          const rowDate = new Date(row[1]);
          if (rowDate >= startDate && rowDate <= endDate) {
            const count = parseInt(row[9]) || 0;
            const designation = String(row[4] || '').trim();
            total += count;
            if (
              designation.includes('आरोग्य सेवक') ||
              designation.includes('आरोग्य सेविका') ||
              designation.includes('आशा')
            ) {
              active += count;
            } else {
              passive += count;
            }
          }
        }

        const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
        const passivePercent = total > 0 ? Math.round((passive / total) * 100) : 0;

        result = {
          success: true,
          data: {
            total,
            active,
            passive,
            activePercent,
            passivePercent
          }
        };
        break;
      }

      case 'getMonthlyReportDashboardData': {
        const [targetMonth] = args;
        const monthStr = typeof targetMonth === 'string' ? targetMonth : (targetMonth && typeof targetMonth === 'object' ? (targetMonth.monthName || targetMonth.name || '') : '');
        const clean = s => String(s || '').trim();
        let monthObj = null;
        if (monthStr) {
          monthObj = monthMaster.find(m => clean(m.name) === clean(monthStr));
        }
        if (!monthObj) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          monthObj = monthMaster.find(m => m.f1Start && m.f2End && today >= new Date(m.f1Start) && today <= new Date(m.f2End)) || monthMaster[8] || monthMaster[0];
        }
        if (!monthObj) {
          monthObj = { name: "सप्टेंबर २०२६", newOpd: 0, feverCases: 0, bloodSmears: 0, treatedCases: 0, chloroquineSpent: 0, f1Start: new Date(2026, 8, 1), f2End: new Date(2026, 8, 30) };
        }

        const targetIdx = Math.max(0, monthMaster.indexOf(monthObj));
        let priorOpdSum = 0;
        let priorFeverSum = 0;
        let priorSmearsSum = 0;
        let priorTreatedSum = 0;
        let priorCqSum = 0;

        for (let i = 0; i < targetIdx; i++) {
          const p = monthMaster[i];
          priorOpdSum += parseInt(p.newOpd != null ? p.newOpd : (p.opd || 0)) || 0;
          priorFeverSum += parseInt(p.feverCases) || 0;
          priorSmearsSum += parseInt(p.bloodSmears) || 0;
          priorTreatedSum += parseInt(p.treatedCases) || 0;
          priorCqSum += parseInt(p.chloroquineSpent) || 0;
        }

        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);

        const newOpd = parseInt(monthObj.newOpd != null ? monthObj.newOpd : (monthObj.opd || 0)) || 0;
        const progNewOpd = monthObj.progNewOpd != null ? parseInt(monthObj.progNewOpd) : (priorOpdSum + newOpd);

        const feverCases = parseInt(monthObj.feverCases) || 0;
        const progFeverCases = monthObj.progFeverCases != null ? parseInt(monthObj.progFeverCases) : (priorFeverSum + feverCases);

        let bloodSmears = monthObj.bloodSmears != null ? parseInt(monthObj.bloodSmears) : 0;
        if (bloodSmears === 0 && opdSummary.monthlyTotal > 0) {
          bloodSmears = opdSummary.monthlyTotal;
        }
        const progBloodSmears = monthObj.progBloodSmears != null ? parseInt(monthObj.progBloodSmears) : (priorSmearsSum + bloodSmears);

        const treatedCases = parseInt(monthObj.treatedCases) || 0;
        const progTreatedCases = monthObj.progTreatedCases != null ? parseInt(monthObj.progTreatedCases) : (priorTreatedSum + treatedCases);

        const chloroquineSpent = parseInt(monthObj.chloroquineSpent) || 0;
        const progChloroquineSpent = monthObj.progChloroquineSpent != null ? parseInt(monthObj.progChloroquineSpent) : (priorCqSum + chloroquineSpent);

        // Calculate field vs opd smears in this month from entries
        let fieldSmears = 0;
        let opdSmears = 0;
        const mStart = monthObj.f1Start;
        const mEnd = monthObj.f2End;
        for (let i = 0; i < bsDataEntry.length; i++) {
          const row = bsDataEntry[i];
          const rowDate = new Date(row[1]);
          if (rowDate >= mStart && rowDate <= mEnd) {
            const count = parseInt(row[9]) || 0;
            const desig = String(row[4] || '').trim();
            if (desig.includes('आरोग्य सेवक') || desig.includes('आरोग्य सेविका') || desig.includes('आशा')) {
              fieldSmears += count;
            } else {
              opdSmears += count;
            }
          }
        }
        if (opdSummary.monthlyTotal > 0 && opdSmears === 0) {
          opdSmears = opdSummary.monthlyTotal;
        }

        const totalSmears = fieldSmears + opdSmears;
        const smearFeverCoverage = feverCases > 0 ? Math.round((bloodSmears / feverCases) * 100) : (bloodSmears > 0 ? 100 : 0);
        const treatmentCoverage = feverCases > 0 ? Math.round((treatedCases / feverCases) * 100) : (treatedCases > 0 ? 100 : 0);

        result = {
          success: true,
          data: {
            selectedMonth: monthObj.name,
            allMonths: monthMaster.map(m => m.name),
            newOpd: { monthly: newOpd, progressive: progNewOpd, prior: priorOpdSum },
            feverCases: { monthly: feverCases, progressive: progFeverCases, prior: priorFeverSum },
            bloodSmears: { monthly: bloodSmears, progressive: progBloodSmears, prior: priorSmearsSum },
            treatedCases: { monthly: treatedCases, progressive: progTreatedCases, prior: priorTreatedSum },
            chloroquineSpent: { monthly: chloroquineSpent, progressive: progChloroquineSpent, prior: priorCqSum },
            fieldSmears,
            opdSmears,
            totalSmears,
            smearFeverCoverage,
            treatmentCoverage,
            opdVillagewise: opdSummary,
            templateData: {
              phcName: 'भादा',
              month: monthObj.name,
              newOpdM: newOpd,
              newOpdP: progNewOpd,
              feverM: feverCases,
              feverP: progFeverCases,
              smearsM: bloodSmears,
              smearsP: progBloodSmears,
              treatedM: treatedCases,
              treatedP: progTreatedCases,
              cqM: chloroquineSpent,
              cqP: progChloroquineSpent
            }
          }
        };
        break;
      }

      case 'getMonthListForWebApp': {
        result = monthMaster.map(m => m.name);
        break;
      }

      case 'getDriveDownloads': {
        const [targetFolderId] = args;
        const key = targetFolderId || 'root';
        const folderData = downloadsData[key] || { folders: [], files: [] };
        result = {
          success: true,
          folders: folderData.folders,
          files: folderData.files
        };
        break;
      }

      case 'getDrivePhotos': {
        const [targetFolderId] = args;
        const key = targetFolderId || 'root';
        const photoData = photosData[key] || { folders: [], files: [] };
        result = {
          success: true,
          folders: photoData.folders,
          files: photoData.files
        };
        break;
      }

      case 'getImportantLinks': {
        result = { success: true, data: importantLinks };
        break;
      }

      case 'getGithubInfo': {
        const repoUrl = googleSheetConfig.githubRepoUrl || "https://github.com/phcbhada/nvbdcp-malaria-management-system";
        result = {
          success: true,
          repoUrl: repoUrl,
          cloneUrl: repoUrl.endsWith('.git') ? repoUrl : `${repoUrl}.git`,
          issuesUrl: `${repoUrl.replace(/\/$/, '')}/issues`,
          pullsUrl: `${repoUrl.replace(/\/$/, '')}/pulls`,
          releasesUrl: `${repoUrl.replace(/\/$/, '')}/releases`,
          readmeUrl: `${repoUrl.replace(/\/$/, '')}#readme`
        };
        break;
      }

      case 'saveGithubConfig': {
        const [repoUrl] = args;
        if (repoUrl && typeof repoUrl === 'string' && repoUrl.trim().length > 0) {
          googleSheetConfig.githubRepoUrl = repoUrl.trim();
          const ghLink = importantLinks.find(l => l.isGithub || l.name.includes("GitHub"));
          if (ghLink) ghLink.url = googleSheetConfig.githubRepoUrl;
          result = {
            success: true,
            message: 'GitHub रिपॉझिटरी URL यशस्वीरित्या अद्ययावत केले!',
            repoUrl: googleSheetConfig.githubRepoUrl
          };
        } else {
          result = { success: false, message: 'कृपया वैध GitHub रिपॉझिटरी लिंक टाका.' };
        }
        break;
      }

      case 'clearAllTransactionData': {
        result = clearAllTransactionData();
        break;
      }

      case 'generateDailyMalariaReportWebApp': {
        const [dateStr] = args;
        result = generateDailyMalariaReportWebApp(dateStr);
        break;
      }

      case 'generateMonthlyReportWebApp': {
        const [month] = args;
        result = generateMonthlyReportWebApp(month);
        break;
      }

      case 'generateEmployeeRegisterWebApp': {
        const [upkendra, employee] = args;
        result = generateEmployeeRegisterWebApp(upkendra, employee);
        break;
      }

      case 'getDefaulterListForMonth': {
        const [month] = args;
        result = getDefaulterListForMonth(month);
        break;
      }

      case 'generateEmployeeNoticesWebApp': {
        const [month, selectedEmpNames] = args;
        result = generateEmployeeNoticesWebApp(month, selectedEmpNames);
        break;
      }

      case 'generateLowPerformanceReportWebApp': {
        const [month] = args;
        result = generateLowPerformanceReportWebApp(month);
        break;
      }

      case 'getMonthIndicators': {
        const [monthName] = args;
        const clean = s => String(s || '').trim();
        let mIdx = monthMaster.findIndex(m => clean(m.name) === clean(monthName));
        if (mIdx === -1) mIdx = 8; // Default September 2026
        const monthObj = monthMaster[mIdx];
        const priorMonths = monthMaster.slice(0, mIdx);

        // Calculate dynamic OPD Blood Smears directly from villagewise entries
        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);

        const priorOpdSum = priorMonths.reduce((s, m) => s + (parseInt(m.newOpd) || 0), 0);
        const priorFeverSum = priorMonths.reduce((s, m) => s + (parseInt(m.feverCases != null ? m.feverCases : 0) || 0), 0);
        // Prior smears dynamically based on villagewise or prior months sum
        const priorSmearsSum = opdSummary.priorTotal != null ? opdSummary.priorTotal : priorMonths.reduce((s, m) => s + (parseInt(m.bloodSmears != null ? m.bloodSmears : (m.feverCases || 0)) || 0), 0);
        const priorTreatedSum = priorMonths.reduce((s, m) => s + (parseInt(m.treatedCases != null ? m.treatedCases : 0) || 0), 0);
        const priorCqSum = priorMonths.reduce((s, m) => s + (parseInt(m.chloroquineSpent) || 0), 0);

        const newOpd = monthObj.newOpd != null ? parseInt(monthObj.newOpd) : 0;
        const progNewOpd = monthObj.progNewOpd != null ? parseInt(monthObj.progNewOpd) : (priorOpdSum + newOpd);

        // Blood Smears automatically taken from OPD BS in villagewise
        const bloodSmears = (monthObj.bloodSmearsManual && monthObj.bloodSmears != null) ? parseInt(monthObj.bloodSmears) : opdSummary.monthlyTotal;
        const progBloodSmears = (monthObj.bloodSmearsManual && monthObj.progBloodSmears != null) ? parseInt(monthObj.progBloodSmears) : opdSummary.ytdTotal;

        // In NVBDCP, fever cases in OPD routinely match blood smears taken unless explicitly entered
        const feverCases = monthObj.feverCases != null ? parseInt(monthObj.feverCases) : bloodSmears;
        const progFeverCases = monthObj.progFeverCases != null ? parseInt(monthObj.progFeverCases) : (priorFeverSum + feverCases);

        const treatedCases = monthObj.treatedCases != null ? parseInt(monthObj.treatedCases) : feverCases;
        const progTreatedCases = monthObj.progTreatedCases != null ? parseInt(monthObj.progTreatedCases) : (priorTreatedSum + treatedCases);

        const chloroquineSpent = parseInt(monthObj.chloroquineSpent) || 0;
        const progChloroquineSpent = monthObj.progChloroquineSpent != null ? parseInt(monthObj.progChloroquineSpent) : (priorCqSum + chloroquineSpent);

        result = {
          success: true,
          data: {
            name: monthObj.name,
            newOpd,
            progNewOpd,
            feverCases,
            progFeverCases,
            bloodSmears,
            progBloodSmears,
            treatedCases,
            progTreatedCases,
            chloroquineSpent,
            progChloroquineSpent,
            priorOpdSum,
            priorFeverSum,
            priorSmearsSum,
            priorTreatedSum,
            priorCqSum,
            opdVillagewise: {
              monthlyTotal: opdSummary.monthlyTotal,
              ytdTotal: opdSummary.ytdTotal,
              monthlyMale: opdSummary.monthlyMale,
              monthlyFemale: opdSummary.monthlyFemale,
              priorTotal: opdSummary.priorTotal,
              villages: opdSummary.villages
            }
          }
        };
        break;
      }

      case 'saveMonthlyIndicators':
      case 'saveMonthIndicators': {
        const [indicatorData] = args;
        if (!indicatorData || !indicatorData.monthName) {
          return res.status(400).json({ error: 'महिन्याचे नाव आवश्यक आहे (Month name is required).' });
        }
        const clean = s => String(s || '').trim();
        const monthObj = monthMaster.find(m => clean(m.name) === clean(indicatorData.monthName));
        if (!monthObj) {
          return res.status(404).json({ error: `महिना '${indicatorData.monthName}' सापडला नाही.` });
        }

        const opdIn = indicatorData.newOpd !== undefined ? indicatorData.newOpd : indicatorData.opd;
        if (opdIn !== undefined) monthObj.newOpd = parseInt(opdIn) || 0;
        const progOpdIn = indicatorData.progNewOpd !== undefined ? indicatorData.progNewOpd : indicatorData.progOpd;
        if (progOpdIn !== undefined && progOpdIn !== '') {
          monthObj.progNewOpd = parseInt(progOpdIn) || 0;
        }
        if (indicatorData.feverCases !== undefined) monthObj.feverCases = parseInt(indicatorData.feverCases) || 0;
        if (indicatorData.progFeverCases !== undefined && indicatorData.progFeverCases !== '') {
          monthObj.progFeverCases = parseInt(indicatorData.progFeverCases) || 0;
        }
        if (indicatorData.bloodSmears !== undefined) monthObj.bloodSmears = parseInt(indicatorData.bloodSmears) || 0;
        if (indicatorData.progBloodSmears !== undefined && indicatorData.progBloodSmears !== '') {
          monthObj.progBloodSmears = parseInt(indicatorData.progBloodSmears) || 0;
        }
        if (indicatorData.treatedCases !== undefined) monthObj.treatedCases = parseInt(indicatorData.treatedCases) || 0;
        if (indicatorData.progTreatedCases !== undefined && indicatorData.progTreatedCases !== '') {
          monthObj.progTreatedCases = parseInt(indicatorData.progTreatedCases) || 0;
        }
        const cqIn = indicatorData.chloroquineSpent !== undefined ? indicatorData.chloroquineSpent : indicatorData.chloroquine;
        if (cqIn !== undefined) monthObj.chloroquineSpent = parseInt(cqIn) || 0;
        const progCqIn = indicatorData.progChloroquineSpent !== undefined ? indicatorData.progChloroquineSpent : indicatorData.progChloroquine;
        if (progCqIn !== undefined && progCqIn !== '') {
          monthObj.progChloroquineSpent = parseInt(progCqIn) || 0;
        }

        saveDbToDisk();

        // Direct Google Sheet Sync for Monthly Indicators
        let sheetSyncRes = { success: false };
        if (googleSheetConfig.webhookUrl) {
          sheetSyncRes = await triggerGoogleSheetSync({
            action: 'saveMonthIndicators',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            monthName: monthObj.name,
            indicators: {
              name: monthObj.name,
              newOpd: monthObj.newOpd,
              progNewOpd: monthObj.progNewOpd,
              feverCases: monthObj.feverCases,
              progFeverCases: monthObj.progFeverCases,
              bloodSmears: monthObj.bloodSmears,
              progBloodSmears: monthObj.progBloodSmears,
              treatedCases: monthObj.treatedCases,
              progTreatedCases: monthObj.progTreatedCases,
              chloroquineSpent: monthObj.chloroquineSpent,
              progChloroquineSpent: monthObj.progChloroquineSpent
            },
            timestamp: new Date().toISOString()
          });
        }

        result = {
          success: true,
          message: sheetSyncRes.success
            ? `✅ माहे ${monthObj.name} चे मासिक अहवाल निर्देशांक थेट गुगल शीटमध्ये सुरक्षित जतन झाले!`
            : `माहे ${monthObj.name} चे मासिक अहवाल निर्देशांक (नवीन बाह्यरुग्ण, तापाचे रुग्ण, उपचारीत रुग्ण, क्लोरोक्वीन गोळ्या खर्च) यशस्वीरित्या जतन झाले!`,
          sheetSynced: sheetSyncRes.success,
          data: {
            name: monthObj.name,
            newOpd: monthObj.newOpd,
            progNewOpd: monthObj.progNewOpd,
            feverCases: monthObj.feverCases,
            progFeverCases: monthObj.progFeverCases,
            bloodSmears: monthObj.bloodSmears,
            progBloodSmears: monthObj.progBloodSmears,
            treatedCases: monthObj.treatedCases,
            progTreatedCases: monthObj.progTreatedCases,
            chloroquineSpent: monthObj.chloroquineSpent,
            progChloroquineSpent: monthObj.progChloroquineSpent
          }
        };
        break;
      }

      // ================= MASTER DATA & TRANSFER FACILITY RPC =================
      case 'getSubcenterMaster': {
        result = subcenterMaster;
        break;
      }

      case 'saveSubcenter': {
        const [scData] = args;
        result = saveSubcenter(scData);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveSubcenter',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            subcenter: scData,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing saveSubcenter:', e));
        }
        break;
      }

      case 'deleteSubcenter': {
        const [scId] = args;
        result = deleteSubcenter(scId);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'deleteSubcenter',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            subcenterId: scId,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing deleteSubcenter:', e));
        }
        break;
      }

      case 'getVillagesMaster': {
        result = villagesMaster;
        break;
      }

      case 'saveVillage': {
        const [vilData] = args;
        result = saveVillage(vilData);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveVillage',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            village: vilData,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing saveVillage:', e));
        }
        break;
      }

      case 'deleteVillage': {
        const [vilId] = args;
        result = deleteVillage(vilId);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'deleteVillage',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            villageId: vilId,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing deleteVillage:', e));
        }
        break;
      }

      case 'getEmployeeMaster': {
        result = employeeMaster;
        break;
      }

      case 'saveEmployee': {
        const [empData] = args;
        result = saveEmployee(empData);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveEmployee',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            employee: empData,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing saveEmployee:', e));
        }
        break;
      }

      case 'deleteEmployee': {
        const [empId] = args;
        result = deleteEmployee(empId);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'deleteEmployee',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            employeeId: empId,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing deleteEmployee:', e));
        }
        break;
      }

      case 'transferEmployee': {
        const [empId, targetUpkendra, newVillages, newBsCode, reason, orderNo] = args;
        result = transferEmployee(empId, targetUpkendra, newVillages, newBsCode, reason, orderNo);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'transferEmployee',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            transfer: { empId, targetUpkendra, newVillages, newBsCode, reason, orderNo },
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing transferEmployee:', e));
        }
        break;
      }

      case 'updateEmployeeVillages': {
        const [empId, villageList] = args;
        result = updateEmployeeVillages(empId, villageList);
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'updateEmployeeVillages',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            empId,
            villageList,
            timestamp: new Date().toISOString()
          }).catch(e => console.error('Error syncing updateEmployeeVillages:', e));
        }
        break;
      }

      case 'getTransferHistory': {
        result = transferHistory;
        break;
      }

      case 'importMasterDataCsv':
      case 'importMasterDataFromCsv': {
        const [csvText] = args;
        result = importMasterDataFromCsv(csvText);
        saveDbToDisk();
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'syncMasterData',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            timestamp: new Date().toISOString(),
            employeeMaster,
            subcenterMaster,
            villagesMaster
          }).catch(e => console.error('Error syncing master data to sheet:', e));
        }
        break;
      }

      case 'importBsDataEntryCsv':
      case 'uploadBsDataCsv': {
        const [csvText, replace] = args;
        result = importBsDataEntryCsv(csvText, !!replace);
        saveDbToDisk();
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'syncAllData',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            timestamp: new Date().toISOString(),
            bsDataCount: bsDataEntry.length,
            villageDetailsCount: villageDetails.length,
            bsData: bsDataEntry.map(formatBsEntry),
            villageDetails: villageDetails.map(formatVillageDetail)
          }).catch(e => console.error('Error syncing bs data import to sheet:', e));
        }
        break;
      }

      case 'importVillageDetailsCsv':
      case 'uploadVillageDetailsCsv': {
        const [csvText, replace] = args;
        result = importVillageDetailsCsv(csvText, !!replace);
        saveDbToDisk();
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'syncAllData',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            timestamp: new Date().toISOString(),
            bsDataCount: bsDataEntry.length,
            villageDetailsCount: villageDetails.length,
            bsData: bsDataEntry.map(formatBsEntry),
            villageDetails: villageDetails.map(formatVillageDetail)
          }).catch(e => console.error('Error syncing village details import to sheet:', e));
        }
        break;
      }

      case 'importMonthMasterCsv':
      case 'uploadMonthMasterCsv': {
        const [csvText] = args;
        result = importMonthMasterCsv(csvText);
        saveDbToDisk();
        if (googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'syncMonthMaster',
            spreadsheetId: googleSheetConfig.spreadsheetId,
            timestamp: new Date().toISOString(),
            monthMaster: monthMaster.map(m => ({ ...m }))
          }).catch(e => console.error('Error syncing month master to sheet:', e));
        }
        break;
      }

      case 'seedInitialData':
      case 'resetToDefaultData': {
        const clearRes = clearAllTransactionData();
        result = {
          success: true,
          message: "सर्व तात्पुरता/नमुना डेटा यशस्वीरित्या काढून टाकण्यात आला. प्रणाली रिअल-टाईम नोंदींसाठी सज्ज आहे."
        };
        break;
      }

      case 'getEmployeeVillageDistributionSummary': {
        result = getEmployeeVillageDistributionSummary();
        break;
      }

      default:
        return res.status(400).json({ error: `अज्ञात मेथड (Unknown method): ${method}` });
    }

    res.json({ result });
  } catch (err) {
    console.error(`Error in RPC method:`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Express global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PHC Bhada Malaria Management System running on http://0.0.0.0:${PORT}`);
});
