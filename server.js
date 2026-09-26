import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
  recalculateAllMonthProgressives,
  saveDbToDisk,
  loadDbFromDisk,
  dengueChikungunyaEntries,
  saveDengueEntry,
  deleteDengueEntry,
  getDengueEntries,
  updateDengueLabReport,
  saveDengueBatchLabReport,
  importDengueOldDataCsv,
  clearDengueEntries
} from './data/store.js';

import {
  generateDailyMalariaReportWebApp,
  generateMonthlyReportWebApp,
  generateEmployeeRegisterWebApp,
  getDefaulterListForMonth,
  generateEmployeeNoticesWebApp,
  generateLowPerformanceReportWebApp,
  generateEmployeeVillageMonthlyReportWebApp,
  getEmployeeVillageMonthlyData,
  generateGmcForwardingLetter,
  generateNivCaseHistorySheets
} from './services/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve index.html at root and standard entry paths
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/Form.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/defaultData.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'defaultData.js'));
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
app.get('/api/export/dengue-samples.csv', (req, res) => {
  const headers = [
    'आयडी (ID)',
    'रुग्णाचे नाव (Patient Name)',
    'मोबाईल (Mobile)',
    'घर क्र. (House No)',
    'गाव (Village)',
    'तालुका (Taluka)',
    'जिल्हा (District)',
    'रुग्णालय पत्ता (Hospital Address)',
    'नोंदणी क्र. (Reg No)',
    'वार्ड (Ward)',
    'बेड (Bed)',
    'वय (Age)',
    'लिंग (Sex)',
    'लक्षणे सुरू दिनांक (Onset Date)',
    'नमुना प्रकार (Sample Nature)',
    'नमुना घेतल्याचा दिनांक (Collection Date)',
    'ताप दिवस (Fever Days)',
    'डोकेदुखी दिवस (Headache Days)',
    'अंगदुखी दिवस (Bodyache Days)',
    'सांधेदुखी दिवस (Joint Pain Days)',
    'डोळ्यांमागे दुखणे (Retro Orbital Pain Days)',
    'पुरळ दिवस (Rash Days)',
    'रक्तस्राव (Haemorrhagic)',
    'डॉक्टर नाव (Doctor Name)',
    'डॉक्टर मोबाईल (Doctor Mobile)',
    'डेंगी निष्कर्ष (Dengue Result)',
    'डेंगी चाचणी प्रकार (Dengue Test Type)',
    'डेंगी लॅब संदर्भ क्र. (Dengue Report Ref)',
    'डेंगी अहवाल दिनांक (Dengue Report Date)',
    'चिकनगुनिया निष्कर्ष (Chikungunya Result)',
    'चिकनगुनिया चाचणी प्रकार (Chikungunya Test Type)',
    'चिकनगुनिया लॅब संदर्भ क्र. (Chikungunya Report Ref)',
    'चिकनगुनिया अहवाल दिनांक (Chikungunya Report Date)',
    'एकूण स्थिती (Overall Status)'
  ];

  const rows = dengueChikungunyaEntries.map(e => [
    e.id,
    `"${(e.patientName || '').replace(/"/g, '""')}"`,
    e.mobile || '-',
    e.houseNo || '-',
    `"${(e.village || '').replace(/"/g, '""')}"`,
    e.taluka || 'AUSA',
    e.district || 'LATUR',
    `"${(e.hospitalAddress || '').replace(/"/g, '""')}"`,
    e.patientRegNo || '-',
    e.wardNo || '--',
    e.bedNo || '--',
    e.age || 0,
    e.sex || '',
    e.dateOnset || '',
    e.sampleNature || 'Serum',
    e.dateCollection || '',
    e.clinicalFever ?? 1,
    e.clinicalHeadache ?? 0,
    e.clinicalBodyache ?? 0,
    e.clinicalJointPain ?? 0,
    e.clinicalRetroOrbitalPain ?? 0,
    e.clinicalRash ?? 0,
    e.haemorrhagic || 'No',
    `"${(e.doctorName || '').replace(/"/g, '""')}"`,
    e.doctorMobile || '',
    e.dengueResult || 'Pending',
    `"${(e.dengueTestType || '').replace(/"/g, '""')}"`,
    `"${(e.dengueReportRef || '').replace(/"/g, '""')}"`,
    e.dengueReportDate || '',
    e.chikungunyaResult || 'Pending',
    `"${(e.chikungunyaTestType || '').replace(/"/g, '""')}"`,
    `"${(e.chikungunyaReportRef || '').replace(/"/g, '""')}"`,
    e.chikungunyaReportDate || '',
    `"${(e.testResult || 'Pending').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="phc_bhada_dengue_chikungunya_samples.csv"');
  res.status(200).send(csvContent);
});

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
    'क्लोरोक्वीन गोळ्या खर्च प्रगत (Chloroquine Progressive)',
    'आरोग्य सेवक गृहभेटी १ ला पंधरवडा (MPW Fn 1)',
    'आरोग्य सेवक गृहभेटी २ रा पंधरवडा (MPW Fn 2)',
    'आरोग्य सेवक गृहभेटी एकूण मासिक (MPW Total)',
    'आरोग्य सेवक गृहभेटी प्रगत (MPW Progressive)',
    'आरोग्य सेविका गृहभेटी १ ला पंधरवडा (ANM Fn 1)',
    'आरोग्य सेविका गृहभेटी २ रा पंधरवडा (ANM Fn 2)',
    'आरोग्य सेविका गृहभेटी एकूण मासिक (ANM Total)',
    'आरोग्य सेविका गृहभेटी प्रगत (ANM Progressive)'
  ];

  let priorOpd = 0, priorFever = 0, priorSmears = 0, priorTreated = 0, priorCq = 0;
  let priorMpw = 0, priorAnm = 0;
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

    const mpwFn1 = parseInt(m.mpwFn1) || 0;
    const mpwFn2 = parseInt(m.mpwFn2) || 0;
    const mpwTot = parseInt(m.mpwHomeVisits) || (mpwFn1 + mpwFn2);
    const mpwProg = m.progMpwHomeVisits != null ? parseInt(m.progMpwHomeVisits) : (priorMpw + mpwTot);
    priorMpw = mpwProg;

    const anmFn1 = parseInt(m.anmFn1) || 0;
    const anmFn2 = parseInt(m.anmFn2) || 0;
    const anmTot = parseInt(m.anmHomeVisits) || (anmFn1 + anmFn2);
    const anmProg = m.progAnmHomeVisits != null ? parseInt(m.progAnmHomeVisits) : (priorAnm + anmTot);
    priorAnm = anmProg;

    return [
      `"${m.name}"`,
      opdM, opdP,
      feverM, feverP,
      smearM, smearP,
      treatedM, treatedP,
      cqM, cqP,
      mpwFn1, mpwFn2, mpwTot, mpwProg,
      anmFn1, anmFn2, anmTot, anmProg
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
    'MPW पहिला पंधरवडा (MPW FN1)',
    'MPW दुसरा पंधरवडा (MPW FN2)',
    'MPW एकूण गृहभेटी (MPW Total Visits)',
    'MPW गृहभेटी प्रगत (MPW Visits Progressive)',
    'ANM पहिला पंधरवडा (ANM FN1)',
    'ANM दुसरा पंधरवडा (ANM FN2)',
    'ANM एकूण गृहभेटी (ANM Total Visits)',
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
      m.mpwFn1 || 0,
      m.mpwFn2 || 0,
      m.mpwHomeVisits || 0,
      m.progMpwHomeVisits || 0,
      m.anmFn1 || 0,
      m.anmFn2 || 0,
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

// Endpoint to view or copy Google Apps Script Code
app.get('/api/google-apps-script-code', (req, res) => {
  const scriptPath = path.join(__dirname, 'google-apps-script', 'Code.js');
  if (fs.existsSync(scriptPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(scriptPath);
  } else {
    res.status(404).send('Google Apps Script code not found');
  }
});

// Primary sync helper to send rows directly to Google Sheet Webhook
async function triggerGoogleSheetSync(payload) {
  if (!googleSheetConfig.webhookUrl) {
    googleSheetConfig.syncStatus = 'स्थानिक प्रणालीमध्ये सुरक्षित (गुगल वेबहुक URL सेट नाही)';
    return { success: false, message: 'गुगल शीट वेबहुक URL उपलब्ध नाही.' };
  }
  try {
    console.log(`[GoogleSheetSync] Sending real-time sync action: ${payload.action}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    const response = await fetch(googleSheetConfig.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    const rawText = await response.text();
    let respData = null;
    try {
      respData = JSON.parse(rawText);
    } catch (_) {}

    googleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');

    if (response.ok && respData && respData.success) {
      googleSheetConfig.syncStatus = '✅ थेट गुगल शीटमध्ये रिअल-टाईम जतन (Live Synced in Google Sheet)';
      console.log(`[GoogleSheetSync] Success for action: ${payload.action}`);
      return { success: true, data: respData };
    } else {
      let errMsg = 'गुगल वेबहुक प्रतिसाद अवैध आहे';
      if (rawText.includes('Page not found') || response.status === 404) {
        errMsg = 'गुगल वेबहुक URL अमान्य किंवा बंद आहे (Google Apps Script कडून 404 Page not found एरर). कृपया नवीन Web app डिप्लॉय करा.';
      } else if (respData && respData.message) {
        errMsg = respData.message;
      } else if (respData && respData.error) {
        errMsg = respData.error;
      }
      googleSheetConfig.syncStatus = `स्थानिक डेटाबेसमध्ये सुरक्षित (गुगल शीट एरर: ${errMsg})`;
      console.warn(`[GoogleSheetSync] Sync failed for action ${payload.action}:`, errMsg);
      return { success: false, error: errMsg };
    }
  } catch (err) {
    console.warn(`[GoogleSheetSync] Sync error for action ${payload.action}:`, err.message);
    googleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');
    googleSheetConfig.syncStatus = `स्थानिक डेटाबेसमध्ये सुरक्षित (कनेक्शन त्रुटी: ${err.message})`;
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

        recalculateAllMonthProgressives();
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
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 35000);
          const fetchRes = await fetch(googleSheetConfig.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'fetchAllData',
              spreadsheetId: googleSheetConfig.spreadsheetId
            }),
            signal: controller.signal
          });
          clearTimeout(timeout);

          if (!fetchRes.ok) {
            throw new Error(`HTTP Error ${fetchRes.status}: ${fetchRes.statusText}`);
          }

          const fetchedData = await fetchRes.json();
          let importedBs = 0;
          let importedVil = 0;
          let importedDengue = 0;

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

          if (Array.isArray(fetchedData.dengueData) && fetchedData.dengueData.length > 0) {
            dengueChikungunyaEntries.length = 0;
            fetchedData.dengueData.forEach(d => {
              dengueChikungunyaEntries.push(d);
              importedDengue++;
            });
          }

          if (importedBs > 0 || importedVil > 0 || importedDengue > 0) {
            saveDbToDisk();
          }

          googleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');
          googleSheetConfig.syncStatus = '✅ थेट गुगल शीटमध्ये रिअल-टाईम जतन (Live Synced in Google Sheet)';

          const parts = [];
          if (importedBs > 0) parts.push(`${importedBs} रक्त नमुने`);
          if (importedVil > 0) parts.push(`${importedVil} गाव तपशील`);
          if (importedDengue > 0) parts.push(`${importedDengue} डेंगी/चिकनगुनिया नोंदी`);

          result = {
            success: true,
            importedBs,
            importedVil,
            importedDengue,
            totalRecords: bsDataEntry.length,
            message: parts.length > 0
              ? `गुगल शीटमधून ${parts.join(', ')} यशस्वीरित्या प्राप्त झाले!`
              : `गुगल शीटशी यशस्वी संपर्क झाला! (सध्या सर्व डेटा अद्ययावत आहे).`
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
            total += count;

            const upkendra = String(row[2] || '').toLowerCase();
            const employeeName = String(row[3] || '').toLowerCase();
            const desig = String(row[4] || '').toLowerCase();
            const bsCode = String(row[5] || '').toLowerCase();

            const isOpd = (
              upkendra.includes('opd') || upkendra.includes('दवाखाना') || upkendra.includes('बाह्य') || upkendra.includes('प्रा.आ.केंद्र') ||
              employeeName.includes('opd') || employeeName.includes('ओपीडी') || employeeName.includes('बाह्य') || employeeName.includes('वैद्यकीय') ||
              desig.includes('opd') || desig.includes('ओपीडी') || desig.includes('बाह्य') || desig.includes('वैद्यकीय') ||
              bsCode.includes('opd') || bsCode.includes('54p')
            );

            if (isOpd) {
              passive += count;
            } else {
              active += count;
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
        let priorMpwFn1Sum = 0;
        let priorMpwFn2Sum = 0;
        let priorMpwSum = 0;
        let priorAnmFn1Sum = 0;
        let priorAnmFn2Sum = 0;
        let priorAnmSum = 0;

        for (let i = 0; i < targetIdx; i++) {
          const p = monthMaster[i];
          priorOpdSum += parseInt(p.newOpd != null ? p.newOpd : (p.opd || 0)) || 0;
          priorFeverSum += parseInt(p.feverCases) || 0;
          priorSmearsSum += parseInt(p.bloodSmears) || 0;
          priorTreatedSum += parseInt(p.treatedCases) || 0;
          priorCqSum += parseInt(p.chloroquineSpent) || 0;
          priorMpwFn1Sum += parseInt(p.mpwFn1) || 0;
          priorMpwFn2Sum += parseInt(p.mpwFn2) || 0;
          priorMpwSum += parseInt(p.mpwHomeVisits) || ((parseInt(p.mpwFn1) || 0) + (parseInt(p.mpwFn2) || 0));
          priorAnmFn1Sum += parseInt(p.anmFn1) || 0;
          priorAnmFn2Sum += parseInt(p.anmFn2) || 0;
          priorAnmSum += parseInt(p.anmHomeVisits) || ((parseInt(p.anmFn1) || 0) + (parseInt(p.anmFn2) || 0));
        }

        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);

        // Auto-populate & auto-save Blood Smears from OPD section (बाह्यरुग्ण विभाग रक्त नमुने)
        if (opdSummary.monthlyTotal > 0 && (!monthObj.bloodSmears || monthObj.bloodSmears === 0 || !monthObj.bloodSmearsManual)) {
          monthObj.bloodSmears = opdSummary.monthlyTotal;
        }

        const newOpd = parseInt(monthObj.newOpd != null ? monthObj.newOpd : (monthObj.opd || 0)) || 0;
        const progNewOpd = priorOpdSum + newOpd;

        // 🩸 घेतलेले रक्त नमुणे (Blood Smears) = 🌡️ तापाचे रुग्ण (Fever Cases) = 💊 उपचारीत रुग्ण (Treated Cases)
        let bloodSmears = monthObj.bloodSmears != null ? parseInt(monthObj.bloodSmears) : 0;
        if (bloodSmears === 0 && opdSummary.monthlyTotal > 0) {
          bloodSmears = opdSummary.monthlyTotal;
        }
        monthObj.bloodSmears = bloodSmears;
        monthObj.feverCases = bloodSmears;
        monthObj.treatedCases = bloodSmears;

        const progBloodSmears = priorSmearsSum + bloodSmears;
        const feverCases = bloodSmears;
        const progFeverCases = progBloodSmears;
        const treatedCases = bloodSmears;
        const progTreatedCases = progBloodSmears;

        const chloroquineSpent = parseInt(monthObj.chloroquineSpent) || 0;
        const progChloroquineSpent = priorCqSum + chloroquineSpent;

        // MPW & ANM Home Visits (पहिला व दुसरा पंधरवडा)
        const mpwFn1 = parseInt(monthObj.mpwFn1) || 0;
        const mpwFn2 = parseInt(monthObj.mpwFn2) || 0;
        const mpwHomeVisits = parseInt(monthObj.mpwHomeVisits) || (mpwFn1 + mpwFn2);
        const progMpwFn1 = monthObj.progMpwFn1 != null ? parseInt(monthObj.progMpwFn1) : (priorMpwFn1Sum + mpwFn1);
        const progMpwFn2 = monthObj.progMpwFn2 != null ? parseInt(monthObj.progMpwFn2) : (priorMpwFn2Sum + mpwFn2);
        const progMpwHomeVisits = monthObj.progMpwHomeVisits != null ? parseInt(monthObj.progMpwHomeVisits) : (priorMpwSum + mpwHomeVisits);

        const anmFn1 = parseInt(monthObj.anmFn1) || 0;
        const anmFn2 = parseInt(monthObj.anmFn2) || 0;
        const anmHomeVisits = parseInt(monthObj.anmHomeVisits) || (anmFn1 + anmFn2);
        const progAnmFn1 = monthObj.progAnmFn1 != null ? parseInt(monthObj.progAnmFn1) : (priorAnmFn1Sum + anmFn1);
        const progAnmFn2 = monthObj.progAnmFn2 != null ? parseInt(monthObj.progAnmFn2) : (priorAnmFn2Sum + anmFn2);
        const progAnmHomeVisits = monthObj.progAnmHomeVisits != null ? parseInt(monthObj.progAnmHomeVisits) : (priorAnmSum + anmHomeVisits);

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
            mpw: {
              fn1: mpwFn1,
              fn2: mpwFn2,
              monthly: mpwHomeVisits,
              progFn1: progMpwFn1,
              progFn2: progMpwFn2,
              progressive: progMpwHomeVisits,
              priorFn1: priorMpwFn1Sum,
              priorFn2: priorMpwFn2Sum,
              prior: priorMpwSum
            },
            anm: {
              fn1: anmFn1,
              fn2: anmFn2,
              monthly: anmHomeVisits,
              progFn1: progAnmFn1,
              progFn2: progAnmFn2,
              progressive: progAnmHomeVisits,
              priorFn1: priorAnmFn1Sum,
              priorFn2: priorAnmFn2Sum,
              prior: priorAnmSum
            },
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
              cqP: progChloroquineSpent,
              mpwFn1,
              mpwFn2,
              mpwTot: mpwHomeVisits,
              progMpwFn1,
              progMpwFn2,
              progMpwTot: progMpwHomeVisits,
              anmFn1,
              anmFn2,
              anmTot: anmHomeVisits,
              progAnmFn1,
              progAnmFn2,
              progAnmTot: progAnmHomeVisits
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

      case 'getDengueEntries': {
        const [filterDate, filterVillage] = args;
        result = { success: true, entries: getDengueEntries(filterDate, filterVillage) };
        break;
      }

      case 'saveDengueEntry': {
        const [entryData] = args;
        result = saveDengueEntry(entryData);
        if (result.success && googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveDengueEntry',
            entry: result.record || entryData
          });
        }
        break;
      }

      case 'updateDengueLabReport': {
        const [reportData] = args;
        result = updateDengueLabReport(reportData);
        if (result.success && googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveDengueEntry',
            entry: result.record
          });
        }
        break;
      }

      case 'saveDengueBatchLabReport': {
        const [batchData] = args;
        result = saveDengueBatchLabReport(batchData);
        if (result.success && googleSheetConfig.webhookUrl) {
          triggerGoogleSheetSync({
            action: 'saveDengueBatch',
            batchData
          });
        }
        break;
      }

      case 'importDengueOldDataCsv': {
        const [csvText, replace] = args;
        result = importDengueOldDataCsv(csvText, replace);
        break;
      }

      case 'clearDengueEntries': {
        result = clearDengueEntries();
        break;
      }

      case 'deleteDengueEntry': {
        const [id] = args;
        result = deleteDengueEntry(id);
        break;
      }

      case 'generateGmcForwardingLetter': {
        const [dateStr, outwardNo] = args;
        result = generateGmcForwardingLetter(dateStr, outwardNo);
        break;
      }

      case 'generateNivCaseHistorySheets': {
        const [patientIdsOrDate] = args;
        result = generateNivCaseHistorySheets(patientIdsOrDate);
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

      case 'generateEmployeeVillageMonthlyReportWebApp': {
        const [month, upkendra, employee, staffType] = args;
        result = generateEmployeeVillageMonthlyReportWebApp(month, upkendra, employee, staffType);
        break;
      }

      case 'getEmployeeVillageMonthlyData': {
        const [month, upkendra, employee, staffType] = args;
        result = getEmployeeVillageMonthlyData(month, upkendra, employee, staffType);
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

        // Auto-populate & auto-save Blood Smears from OPD section (त्या महिन्यात बाह्यरुग्ण विभाग रक्त नमुने auto save व्हावे)
        if (opdSummary.monthlyTotal > 0 && (!monthObj.bloodSmears || monthObj.bloodSmears === 0 || !monthObj.bloodSmearsManual)) {
          monthObj.bloodSmears = opdSummary.monthlyTotal;
        }

        // 🩸 घेतलेले रक्त नमुणे (Blood Smears) = 🌡️ तापाचे रुग्ण (Fever Cases) = 💊 उपचारीत रुग्ण (Treated Cases)
        const bloodSmears = parseInt(monthObj.bloodSmears) || (opdSummary.monthlyTotal > 0 ? opdSummary.monthlyTotal : 0);
        monthObj.bloodSmears = bloodSmears;
        monthObj.feverCases = bloodSmears;
        monthObj.treatedCases = bloodSmears;

        recalculateAllMonthProgressives();
        saveDbToDisk();

        const priorOpdSum = monthObj.priorOpdSum != null ? monthObj.priorOpdSum : priorMonths.reduce((s, m) => s + (parseInt(m.newOpd) || 0), 0);
        const priorSmearsSum = monthObj.priorSmearsSum != null ? monthObj.priorSmearsSum : priorMonths.reduce((s, m) => s + (parseInt(m.bloodSmears) || 0), 0);
        const priorFeverSum = priorSmearsSum;
        const priorTreatedSum = priorSmearsSum;
        const priorCqSum = monthObj.priorCqSum != null ? monthObj.priorCqSum : priorMonths.reduce((s, m) => s + (parseInt(m.chloroquineSpent) || 0), 0);

        const newOpd = monthObj.newOpd != null ? parseInt(monthObj.newOpd) : 0;
        const progNewOpd = monthObj.progNewOpd != null ? parseInt(monthObj.progNewOpd) : (priorOpdSum + newOpd);

        const progBloodSmears = monthObj.progBloodSmears != null ? parseInt(monthObj.progBloodSmears) : (priorSmearsSum + bloodSmears);
        const feverCases = bloodSmears;
        const progFeverCases = progBloodSmears;
        const treatedCases = bloodSmears;
        const progTreatedCases = progBloodSmears;

        const chloroquineSpent = parseInt(monthObj.chloroquineSpent) || 0;
        const progChloroquineSpent = monthObj.progChloroquineSpent != null ? parseInt(monthObj.progChloroquineSpent) : (priorCqSum + chloroquineSpent);

        const mpwFn1 = parseInt(monthObj.mpwFn1) || 0;
        const mpwFn2 = parseInt(monthObj.mpwFn2) || 0;
        const mpwHomeVisits = parseInt(monthObj.mpwHomeVisits) || (mpwFn1 + mpwFn2);
        const progMpwFn1 = monthObj.progMpwFn1 != null ? parseInt(monthObj.progMpwFn1) : ((monthObj.priorMpwFn1Sum || 0) + mpwFn1);
        const progMpwFn2 = monthObj.progMpwFn2 != null ? parseInt(monthObj.progMpwFn2) : ((monthObj.priorMpwFn2Sum || 0) + mpwFn2);
        const progMpwHomeVisits = monthObj.progMpwHomeVisits != null ? parseInt(monthObj.progMpwHomeVisits) : ((monthObj.priorMpwSum || 0) + mpwHomeVisits);

        const anmFn1 = parseInt(monthObj.anmFn1) || 0;
        const anmFn2 = parseInt(monthObj.anmFn2) || 0;
        const anmHomeVisits = parseInt(monthObj.anmHomeVisits) || (anmFn1 + anmFn2);
        const progAnmFn1 = monthObj.progAnmFn1 != null ? parseInt(monthObj.progAnmFn1) : ((monthObj.priorAnmFn1Sum || 0) + anmFn1);
        const progAnmFn2 = monthObj.progAnmFn2 != null ? parseInt(monthObj.progAnmFn2) : ((monthObj.priorAnmFn2Sum || 0) + anmFn2);
        const progAnmHomeVisits = monthObj.progAnmHomeVisits != null ? parseInt(monthObj.progAnmHomeVisits) : ((monthObj.priorAnmSum || 0) + anmHomeVisits);

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
            mpwFn1,
            mpwFn2,
            mpwHomeVisits,
            progMpwFn1,
            progMpwFn2,
            progMpwHomeVisits,
            anmFn1,
            anmFn2,
            anmHomeVisits,
            progAnmFn1,
            progAnmFn2,
            progAnmHomeVisits,
            priorOpdSum,
            priorFeverSum,
            priorSmearsSum,
            priorTreatedSum,
            priorCqSum,
            priorMpwFn1Sum: monthObj.priorMpwFn1Sum || 0,
            priorMpwFn2Sum: monthObj.priorMpwFn2Sum || 0,
            priorMpwSum: monthObj.priorMpwSum || 0,
            priorAnmFn1Sum: monthObj.priorAnmFn1Sum || 0,
            priorAnmFn2Sum: monthObj.priorAnmFn2Sum || 0,
            priorAnmSum: monthObj.priorAnmSum || 0,
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

        // Auto-resolve Blood Smears: from input or from OPD villagewise summary
        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);
        let bsVal = indicatorData.bloodSmears !== undefined ? parseInt(indicatorData.bloodSmears) : null;
        if (bsVal === null || (bsVal === 0 && opdSummary.monthlyTotal > 0)) {
          bsVal = opdSummary.monthlyTotal;
        }
        monthObj.bloodSmears = bsVal != null ? bsVal : 0;
        monthObj.bloodSmearsManual = (indicatorData.bloodSmears !== undefined);

        // 🩸 घेतलेले रक्त नमुणे (Blood Smears) = 🌡️ तापाचे रुग्ण (Fever Cases) = 💊 उपचारीत रुग्ण (Treated Cases)
        monthObj.feverCases = monthObj.bloodSmears;
        monthObj.treatedCases = monthObj.bloodSmears;

        const cqIn = indicatorData.chloroquineSpent !== undefined ? indicatorData.chloroquineSpent : indicatorData.chloroquine;
        if (cqIn !== undefined) monthObj.chloroquineSpent = parseInt(cqIn) || 0;

        // MPW & ANM गृहभेटी पहिला व दुसरा पंधरवडा
        if (indicatorData.mpwFn1 !== undefined) monthObj.mpwFn1 = parseInt(indicatorData.mpwFn1) || 0;
        if (indicatorData.mpwFn2 !== undefined) monthObj.mpwFn2 = parseInt(indicatorData.mpwFn2) || 0;
        if (indicatorData.mpwHomeVisits !== undefined) {
          monthObj.mpwHomeVisits = parseInt(indicatorData.mpwHomeVisits) || ((monthObj.mpwFn1 || 0) + (monthObj.mpwFn2 || 0));
        } else {
          monthObj.mpwHomeVisits = (monthObj.mpwFn1 || 0) + (monthObj.mpwFn2 || 0);
        }

        if (indicatorData.anmFn1 !== undefined) monthObj.anmFn1 = parseInt(indicatorData.anmFn1) || 0;
        if (indicatorData.anmFn2 !== undefined) monthObj.anmFn2 = parseInt(indicatorData.anmFn2) || 0;
        if (indicatorData.anmHomeVisits !== undefined) {
          monthObj.anmHomeVisits = parseInt(indicatorData.anmHomeVisits) || ((monthObj.anmFn1 || 0) + (monthObj.anmFn2 || 0));
        } else {
          monthObj.anmHomeVisits = (monthObj.anmFn1 || 0) + (monthObj.anmFn2 || 0);
        }

        // Automatically recalculate and lock progressive values for all months
        recalculateAllMonthProgressives();
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
              progChloroquineSpent: monthObj.progChloroquineSpent,
              mpwFn1: monthObj.mpwFn1,
              mpwFn2: monthObj.mpwFn2,
              mpwHomeVisits: monthObj.mpwHomeVisits,
              progMpwHomeVisits: monthObj.progMpwHomeVisits,
              anmFn1: monthObj.anmFn1,
              anmFn2: monthObj.anmFn2,
              anmHomeVisits: monthObj.anmHomeVisits,
              progAnmHomeVisits: monthObj.progAnmHomeVisits
            },
            timestamp: new Date().toISOString()
          });
        }

        result = {
          success: true,
          message: sheetSyncRes.success
            ? `✅ माहे ${monthObj.name} चे मासिक अहवाल निर्देशांक थेट गुगल शीटमध्ये सुरक्षित जतन झाले!`
            : `माहे ${monthObj.name} चे मासिक अहवाल निर्देशांक (नवीन बाह्यरुग्ण, तापाचे रुग्ण, उपचारीत रुग्ण, क्लोरोक्वीन गोळ्या खर्च, MPW/ANM गृहभेटी पंधरवडा १ व २) यशस्वीरित्या जतन झाले!`,
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
            progChloroquineSpent: monthObj.progChloroquineSpent,
            mpwFn1: monthObj.mpwFn1,
            mpwFn2: monthObj.mpwFn2,
            mpwHomeVisits: monthObj.mpwHomeVisits,
            progMpwFn1: monthObj.progMpwFn1,
            progMpwFn2: monthObj.progMpwFn2,
            progMpwHomeVisits: monthObj.progMpwHomeVisits,
            anmFn1: monthObj.anmFn1,
            anmFn2: monthObj.anmFn2,
            anmHomeVisits: monthObj.anmHomeVisits,
            progAnmFn1: monthObj.progAnmFn1,
            progAnmFn2: monthObj.progAnmFn2,
            progAnmHomeVisits: monthObj.progAnmHomeVisits
          }
        };
        break;
      }

      // ================= REPORT DATA VALIDATION & AUTO-ALIGN RPC =================
      case 'validateMonthlyReport': {
        const [monthName] = args;
        if (!monthName) {
          return res.status(400).json({ error: 'महिना निवडा.' });
        }
        const clean = s => String(s || '').trim();
        const monthObj = monthMaster.find(m => clean(m.name) === clean(monthName));
        if (!monthObj) {
          return res.status(404).json({ error: `महिना '${monthName}' सापडला नाही.` });
        }

        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);
        const priorMonths = monthMaster.slice(0, monthMaster.indexOf(monthObj));

        const bloodSmears = parseInt(monthObj.bloodSmears) || 0;
        const feverCases = parseInt(monthObj.feverCases) || 0;
        const treatedCases = parseInt(monthObj.treatedCases) || 0;
        const newOpd = parseInt(monthObj.newOpd) || 0;
        const cq = parseInt(monthObj.chloroquineSpent) || 0;

        const priorSmears = priorMonths.reduce((s, m) => s + (parseInt(m.bloodSmears) || 0), 0);
        const progBloodSmears = parseInt(monthObj.progBloodSmears) || (priorSmears + bloodSmears);

        const priorOpd = priorMonths.reduce((s, m) => s + (parseInt(m.newOpd) || 0), 0);
        const progNewOpd = parseInt(monthObj.progNewOpd) || (priorOpd + newOpd);

        const rule1Equal = (bloodSmears === feverCases && bloodSmears === treatedCases);
        const rule2OpdMatch = (bloodSmears === opdSummary.monthlyTotal);
        const rule3ProgMatch = (progBloodSmears === (priorSmears + bloodSmears));

        const isValid = rule1Equal && rule2OpdMatch && rule3ProgMatch;

        result = {
          success: true,
          monthName: monthObj.name,
          isValid,
          rule1: {
            name: 'तपशील ३ समानता (रक्त नमुने = तापाचे रुग्ण = उपचारीत रुग्ण)',
            passed: rule1Equal,
            bloodSmears,
            feverCases,
            treatedCases
          },
          rule2: {
            name: 'गावनिहाय OPD रक्त नमुने जुळणी (Village-wise OPD = Monthly Smears)',
            passed: rule2OpdMatch,
            monthlySmears: bloodSmears,
            opdTotal: opdSummary.monthlyTotal,
            opdVillages: opdSummary.villages
          },
          rule3: {
            name: 'प्रगत संख्या स्वयं-गणना (Progressive YTD = Prior + Current)',
            passed: rule3ProgMatch,
            priorSmears,
            currentSmears: bloodSmears,
            expectedProg: priorSmears + bloodSmears,
            actualProg: progBloodSmears
          },
          indicators: {
            newOpd,
            progNewOpd,
            bloodSmears,
            feverCases,
            treatedCases,
            chloroquineSpent: cq
          }
        };
        break;
      }

      case 'autoAlignMonthlyReport': {
        const [monthName] = args;
        if (!monthName) {
          return res.status(400).json({ error: 'महिना निवडा.' });
        }
        const clean = s => String(s || '').trim();
        const monthObj = monthMaster.find(m => clean(m.name) === clean(monthName));
        if (!monthObj) {
          return res.status(404).json({ error: `महिना '${monthName}' सापडला नाही.` });
        }

        const opdSummary = getOpdBsVillagewiseSummary(monthObj.name);
        const correctSmears = opdSummary.monthlyTotal;

        monthObj.bloodSmears = correctSmears;
        monthObj.feverCases = correctSmears;
        monthObj.treatedCases = correctSmears;

        recalculateAllMonthProgressives();
        saveDbToDisk();

        result = {
          success: true,
          message: `✅ माहे ${monthObj.name} साठी रक्त नमुने, तापाचे रुग्ण व उपचारीत रुग्ण (${correctSmears}) तंतोतंत सिंक झाले व प्रगत आकडे दुरुस्त झाले!`,
          alignedValue: correctSmears
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
