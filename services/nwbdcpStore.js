// NWBDCP — Water Quality Management Module Data Store (Isolated from NVBDCP)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { subcenterMaster, villagesMaster } from '../data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NWBDCP_DB_FILE = path.join(__dirname, '../data/nwbdcp_db.json');

// Standard Predefined Lists for NWBDCP
export const PREDEFINED_SOURCE_TYPES = [
  "हातपंप",
  "विद्युत पंप",
  "विहीर",
  "आड",
  "सार्वजनिक पाणीपुरवठा योजना (नळ योजना)",
  "स्टॅन्ड पोस्ट",
  "RO Plant",
  "इतर"
];

export const PREDEFINED_OWNERSHIPS = [
  "शासकीय",
  "खाजगी"
];

export const SAMPLE_STATUSES = {
  DISPATCHED: "पाठविलेले",
  AWAITED: "अहवाल अप्राप्त",
  SUITABLE: "पिण्यास योग्य",
  UNSUITABLE: "पिण्यास अयोग्य",
  RETEST_REQUIRED: "पुनर्तपासणी आवश्यक",
  RETEST_RECEIVED: "पुनर्तपासणी अहवाल प्राप्त"
};

// In-Memory Data Collections for NWBDCP
export let nwbdcpWaterSources = [];
export let nwbdcpSampleDispatches = [];
export let nwbdcpSampleResults = [];
export let nwbdcpRetests = [];
export let nwbdcpAuditLogs = [];

// Helper: Generate Category Prefix Code
export function getSourceTypeCode(sourceType) {
  switch (sourceType) {
    case "हातपंप": return "HP";
    case "विद्युतंप":
    case "विद्युत पंप": return "EP";
    case "विहीर": return "WLL";
    case "आड": return "AAD";
    case "सार्वजनिक पाणीपुरवठा योजना (नळ योजना)": return "TAP";
    case "स्टॅन्ड पोस्ट": return "SP";
    case "RO Plant": return "RO";
    default: return "OTH";
  }
}

// Helper: Auto-generate unique Source ID (e.g., WS-BHD-TAP-001)
export function generateWaterSourceCode(village = "", sourceType = "") {
  const typeCode = getSourceTypeCode(sourceType);
  const cleanVil = (village || "BHD").replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || "BHD";
  
  // Count existing sources of same type in same village
  const matching = nwbdcpWaterSources.filter(s => s.village === village && s.sourceType === sourceType).length + 1;
  const seq = String(matching).padStart(3, '0');
  
  return `WS-${cleanVil}-${typeCode}-${seq}`;
}

// Seed Initial Water Sources for PHC Bhada Villages if DB is empty
function getInitialSeedWaterSources() {
  const seedSources = [];
  let idCounter = 1001;

  villagesMaster.forEach(v => {
    const sc = v.subcenter || "भादा";
    const vName = v.villageName || "भादा";
    const vilCode = (vName || "BHD").replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || "BHD";

    // Standard water sources per village with distinct Source IDs
    seedSources.push({
      id: `SRC_${idCounter}`,
      sourceCode: `WS-${vilCode}-TAP-001`,
      sourceId: `WS-${vilCode}-TAP-001`,
      subcenter: sc,
      village: vName,
      sourceName: `${vName} सार्वजनिक पाणीपुरवठा योजना (नळ योजना)`,
      sourceType: "सार्वजनिक पाणीपुरवठा योजना (नळ योजना)",
      ownership: "शासकीय",
      status: "Active",
      location: `${vName} ग्रामपंचायत परिसर`,
      createdDate: "2026-01-01"
    });
    idCounter++;

    seedSources.push({
      id: `SRC_${idCounter}`,
      sourceCode: `WS-${vilCode}-HP-001`,
      sourceId: `WS-${vilCode}-HP-001`,
      subcenter: sc,
      village: vName,
      sourceName: `${vName} जिल्हा परिषद शाळा परिसर हातपंप`,
      sourceType: "हातपंप",
      ownership: "शासकीय",
      status: "Active",
      location: `जि.प. शाळा परिसर, ${vName}`,
      createdDate: "2026-01-01"
    });
    idCounter++;

    seedSources.push({
      id: `SRC_${idCounter}`,
      sourceCode: `WS-${vilCode}-WLL-001`,
      sourceId: `WS-${vilCode}-WLL-001`,
      subcenter: sc,
      village: vName,
      sourceName: `${vName} सार्वजनिक मुख्य विहीर`,
      sourceType: "विहीर",
      ownership: "शासकीय",
      status: "Active",
      location: `मुख्य रस्ता, ${vName}`,
      createdDate: "2026-01-01"
    });
    idCounter++;
  });

  return seedSources;
}

// Save NWBDCP Database to Disk
export function saveNwbdcpDbToDisk() {
  try {
    const payload = {
      waterSources: nwbdcpWaterSources,
      sampleDispatches: nwbdcpSampleDispatches,
      sampleResults: nwbdcpSampleResults,
      retests: nwbdcpRetests,
      auditLogs: nwbdcpAuditLogs,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(NWBDCP_DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving NWBDCP DB to disk:', err);
  }
}

// Load NWBDCP Database from Disk
export function loadNwbdcpDbFromDisk() {
  try {
    if (fs.existsSync(NWBDCP_DB_FILE)) {
      const raw = fs.readFileSync(NWBDCP_DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.waterSources)) {
        nwbdcpWaterSources.length = 0;
        parsed.waterSources.forEach(s => {
          if (!s.sourceCode && !s.sourceId) {
            const code = generateWaterSourceCode(s.village, s.sourceType);
            s.sourceCode = code;
            s.sourceId = code;
          } else if (!s.sourceCode) {
            s.sourceCode = s.sourceId;
          } else if (!s.sourceId) {
            s.sourceId = s.sourceCode;
          }
          nwbdcpWaterSources.push(s);
        });
      }
      if (Array.isArray(parsed.sampleDispatches)) {
        nwbdcpSampleDispatches.length = 0;
        parsed.sampleDispatches.forEach(d => nwbdcpSampleDispatches.push(d));
      }
      if (Array.isArray(parsed.sampleResults)) {
        nwbdcpSampleResults.length = 0;
        parsed.sampleResults.forEach(r => nwbdcpSampleResults.push(r));
      }
      if (Array.isArray(parsed.retests)) {
        nwbdcpRetests.length = 0;
        parsed.retests.forEach(rt => nwbdcpRetests.push(rt));
      }
      if (Array.isArray(parsed.auditLogs)) {
        nwbdcpAuditLogs.length = 0;
        parsed.auditLogs.forEach(a => nwbdcpAuditLogs.push(a));
      }
    } else {
      // Populate initial seed sources if empty
      const initialSources = getInitialSeedWaterSources();
      initialSources.forEach(s => nwbdcpWaterSources.push(s));
      saveNwbdcpDbToDisk();
    }
  } catch (err) {
    console.error('Error loading NWBDCP DB from disk:', err);
    if (nwbdcpWaterSources.length === 0) {
      const initialSources = getInitialSeedWaterSources();
      initialSources.forEach(s => nwbdcpWaterSources.push(s));
    }
  }
}

// Initialize on module load
loadNwbdcpDbFromDisk();

// Audit Logger
export function addNwbdcpAuditLog(action, details, user = "System") {
  const logEntry = {
    id: `LOG_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    action,
    details,
    user,
    timestamp: new Date().toISOString()
  };
  nwbdcpAuditLogs.push(logEntry);
  if (nwbdcpAuditLogs.length > 500) {
    nwbdcpAuditLogs.shift();
  }
  saveNwbdcpDbToDisk();
  return logEntry;
}

// =========================================================================
// 1. READ-ONLY NVBDCP MASTER DATA REFERENCE FOR NWBDCP
// =========================================================================
export function getNwbdcpReferenceMasterData() {
  // Read-only export of Subcenter and Village Master Data from NVBDCP
  return {
    subcenters: subcenterMaster.map(s => ({
      name: s.name,
      headquarter: s.headquarter || s.name,
      population: s.population || 0,
      houses: s.houses || 0,
      villages: Array.isArray(s.villages) ? [...s.villages] : []
    })),
    villages: villagesMaster.map(v => ({
      id: v.id,
      villageName: v.villageName,
      subcenter: v.subcenter,
      population: v.population || 0,
      houses: v.houses || 0
    }))
  };
}

// =========================================================================
// 2. WATER SOURCE REGISTER CONTROLLER
// =========================================================================
export function getWaterSources(filters = {}) {
  let list = [...nwbdcpWaterSources];

  if (filters.subcenter && filters.subcenter !== 'ALL') {
    list = list.filter(s => s.subcenter === filters.subcenter);
  }
  if (filters.village && filters.village !== 'ALL') {
    list = list.filter(s => s.village === filters.village);
  }
  if (filters.sourceType && filters.sourceType !== 'ALL') {
    list = list.filter(s => s.sourceType === filters.sourceType);
  }
  if (filters.ownership && filters.ownership !== 'ALL') {
    list = list.filter(s => s.ownership === filters.ownership);
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(s => s.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(s => 
      (s.sourceName && s.sourceName.toLowerCase().includes(q)) ||
      (s.sourceCode && s.sourceCode.toLowerCase().includes(q)) ||
      (s.sourceId && s.sourceId.toLowerCase().includes(q)) ||
      (s.village && s.village.toLowerCase().includes(q)) ||
      (s.subcenter && s.subcenter.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q))
    );
  }

  return list;
}

export function saveWaterSource(data, user = "System") {
  if (!data || !data.subcenter || !data.village || !data.sourceName || !data.sourceType) {
    return { success: false, message: "उपकेंद्र, गाव, स्त्रोताचे नाव आणि स्त्रोत प्रकार आवश्यक आहेत." };
  }

  // Validate predefined source type
  if (!PREDEFINED_SOURCE_TYPES.includes(data.sourceType)) {
    data.sourceType = "इतर";
  }

  // Validate predefined ownership
  if (!PREDEFINED_OWNERSHIPS.includes(data.ownership)) {
    data.ownership = "शासकीय";
  }

  let existing = nwbdcpWaterSources.find(s => s.id === data.id);

  if (existing) {
    existing.subcenter = data.subcenter.trim();
    existing.village = data.village.trim();
    existing.sourceName = data.sourceName.trim();
    existing.sourceType = data.sourceType;
    existing.ownership = data.ownership;
    existing.status = data.status || "Active";
    existing.location = data.location ? data.location.trim() : "";
    if (data.sourceCode && data.sourceCode.trim()) {
      existing.sourceCode = data.sourceCode.trim();
      existing.sourceId = data.sourceCode.trim();
    } else if (!existing.sourceCode) {
      const code = generateWaterSourceCode(existing.village, existing.sourceType);
      existing.sourceCode = code;
      existing.sourceId = code;
    }
    existing.updatedDate = new Date().toISOString().slice(0, 10);
    existing.updatedBy = user;

    addNwbdcpAuditLog('UPDATE_WATER_SOURCE', `जलस्त्रोत संपादित केला: ${existing.sourceName} (${existing.village}) [ID: ${existing.sourceCode}]`, user);
    saveNwbdcpDbToDisk();
    return { success: true, message: `जलस्त्रोत '${existing.sourceName}' [ID: ${existing.sourceCode}] अपडेट झाला!`, source: existing };
  } else {
    const code = (data.sourceCode && data.sourceCode.trim()) 
      ? data.sourceCode.trim() 
      : generateWaterSourceCode(data.village.trim(), data.sourceType);

    const newSource = {
      id: `SRC_${Date.now()}_${Math.floor(Math.random()*100)}`,
      sourceCode: code,
      sourceId: code,
      subcenter: data.subcenter.trim(),
      village: data.village.trim(),
      sourceName: data.sourceName.trim(),
      sourceType: data.sourceType,
      ownership: data.ownership,
      status: data.status || "Active",
      location: data.location ? data.location.trim() : "",
      createdDate: new Date().toISOString().slice(0, 10),
      createdBy: user
    };

    nwbdcpWaterSources.push(newSource);
    addNwbdcpAuditLog('ADD_WATER_SOURCE', `नवीन जलस्त्रोत जोडला: ${newSource.sourceName} (${newSource.village}) [ID: ${newSource.sourceCode}]`, user);
    saveNwbdcpDbToDisk();
    return { success: true, message: `नवीन जलस्त्रोत '${newSource.sourceName}' [ID: ${newSource.sourceCode}] जोडला गेला!`, source: newSource };
  }
}

export function toggleWaterSourceStatus(sourceId, user = "System") {
  const source = nwbdcpWaterSources.find(s => s.id === sourceId);
  if (!source) {
    return { success: false, message: "जलस्त्रोत सापडला नाही." };
  }

  source.status = (source.status === "Active") ? "Inactive" : "Active";
  source.updatedDate = new Date().toISOString().slice(0, 10);

  addNwbdcpAuditLog('TOGGLE_SOURCE_STATUS', `जलस्त्रोत स्थिती बदलली: ${source.sourceName} -> ${source.status}`, user);
  saveNwbdcpDbToDisk();

  return { 
    success: true, 
    message: `जलस्त्रोत '${source.sourceName}' स्थिती ${source.status === 'Active' ? 'सक्रिय (Active)' : 'अकार्यक्षम (Inactive)'} करण्यात आली.`,
    source 
  };
}

export function deleteWaterSource(sourceId, user = "System") {
  const source = nwbdcpWaterSources.find(s => s.id === sourceId);
  if (!source) {
    return { success: false, message: "जलस्त्रोत सापडला नाही." };
  }

  // Check if historical sample dispatch records exist for this source
  const hasHistory = nwbdcpSampleDispatches.some(d => d.sourceId === sourceId || d.sourceName === source.sourceName);
  if (hasHistory) {
    return { 
      success: false, 
      hasHistory: true,
      message: "⚠️ या जलस्त्रोताची नोंदणीकृत नमुना हिस्ट्री आहे. त्यामुळे हा स्त्रोत कायमचा हटवता येत नाही. त्याऐवजी स्थिती 'Inactive' (अकार्यक्षम) करा." 
    };
  }

  const index = nwbdcpWaterSources.findIndex(s => s.id === sourceId);
  if (index !== -1) {
    nwbdcpWaterSources.splice(index, 1);
    addNwbdcpAuditLog('DELETE_WATER_SOURCE', `जलस्त्रोत हटवला: ${source.sourceName}`, user);
    saveNwbdcpDbToDisk();
    return { success: true, message: `जलस्त्रोत '${source.sourceName}' हटवण्यात आला.` };
  }

  return { success: false, message: "हटवताना त्रुटी आली." };
}

// Generate Unique Collision-Safe Sample ID
export function generateUniqueSampleId(dispatchDateStr) {
  const cleanDate = (dispatchDateStr || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const prefix = `NWBDCP-${cleanDate}-`;
  
  // Find highest existing sequence for this date
  const existingForDate = nwbdcpSampleDispatches.filter(d => d.sampleId && d.sampleId.startsWith(prefix));
  let maxSeq = 0;

  existingForDate.forEach(d => {
    const parts = d.sampleId.split('-');
    if (parts.length >= 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeqStr = String(maxSeq + 1).padStart(4, '0');
  return `${prefix}${nextSeqStr}`;
}

// =========================================================================
// 3. WATER SAMPLE DISPATCH CONTROLLER (MULTI-SELECTION & BATCH DISPATCH)
// =========================================================================
export function dispatchWaterSamples(payload, user = "System") {
  const {
    dispatchDate = new Date().toISOString().slice(0, 10),
    collectionDate = new Date().toISOString().slice(0, 10),
    selectedSources = [],
    labName = "जिल्हा सार्वजनिक आरोग्य प्रयोगशाळा, धाराशीव",
    dispatchedBy = "वैद्यकीय अधिकारी, प्रा.आ.केंद्र भादा",
    remarks = ""
  } = payload || {};

  if (!Array.isArray(selectedSources) || selectedSources.length === 0) {
    return { success: false, message: "कृपया नमुने पाठवण्यासाठी किमान एक जलस्त्रोत निवडा." };
  }

  const createdRecords = [];
  const cleanDispatchDate = dispatchDate.slice(0, 10);
  const cleanCollectionDate = collectionDate.slice(0, 10);

  selectedSources.forEach(src => {
    // Prevent duplicate record if the same source is selected twice for the exact same dispatch date & collection date
    const existingDuplicate = nwbdcpSampleDispatches.find(d => 
      (d.sourceId === src.id || (d.sourceName === src.sourceName && d.village === src.village)) &&
      d.dispatchDate === cleanDispatchDate
    );

    if (!existingDuplicate) {
      const sampleId = generateUniqueSampleId(cleanDispatchDate);

      const record = {
        sampleId,
        sourceId: src.id || `SRC_TEMP_${Date.now()}`,
        sourceCode: src.sourceCode || src.sourceId || generateWaterSourceCode(src.village, src.sourceType),
        subcenter: src.subcenter || "भादा",
        village: src.village || "भादा",
        sourceName: src.sourceName,
        sourceType: src.sourceType || "विहीर",
        ownership: src.ownership || "शासकीय",
        location: src.location || "",
        collectionDate: cleanCollectionDate,
        dispatchDate: cleanDispatchDate,
        labName,
        dispatchedBy,
        remarks,
        status: SAMPLE_STATUSES.DISPATCHED, // Initial status: पाठविलेले
        result: SAMPLE_STATUSES.AWAITED,      // Initial result: अहवाल अप्राप्त
        reportReceivedDate: "",
        labRefNo: "",
        labRemarks: "",
        createdDate: new Date().toISOString(),
        createdBy: user,
        history: [{
          action: "DISPATCHED",
          status: SAMPLE_STATUSES.DISPATCHED,
          date: cleanDispatchDate,
          by: user,
          notes: "पाणी नमुना प्रयोगशाळेत तपासणीसाठी पाठवण्यात आला."
        }]
      };

      nwbdcpSampleDispatches.push(record);
      createdRecords.push(record);
    }
  });

  if (createdRecords.length === 0) {
    return { 
      success: false, 
      message: "⚠️ निवडलेल्या जलस्त्रोतांसाठी या तारखेला आधीच नमुने नोंदवले गेले आहेत (Duplicate Dispatch Prevented)." 
    };
  }

  addNwbdcpAuditLog('BATCH_DISPATCH_SAMPLES', `${createdRecords.length} पाणी नमुने प्रयोगशाळेत पाठवले (दिनांक: ${cleanDispatchDate})`, user);
  saveNwbdcpDbToDisk();

  return {
    success: true,
    message: `✅ ${createdRecords.length} पाणी नमुने यशस्वीरित्या नोंदवून प्रयोगशाळेकडे रवाना करण्यात आले!`,
    dispatchedCount: createdRecords.length,
    samples: createdRecords
  };
}

export function getDispatchedSamples(filters = {}) {
  let list = [...nwbdcpSampleDispatches];

  if (filters.subcenter && filters.subcenter !== 'ALL') {
    list = list.filter(d => d.subcenter === filters.subcenter);
  }
  if (filters.village && filters.village !== 'ALL') {
    list = list.filter(d => d.village === filters.village);
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(d => d.status === filters.status || d.result === filters.status);
  }
  if (filters.fromDate) {
    list = list.filter(d => d.dispatchDate >= filters.fromDate);
  }
  if (filters.toDate) {
    list = list.filter(d => d.dispatchDate <= filters.toDate);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(d => 
      (d.sampleId && d.sampleId.toLowerCase().includes(q)) ||
      (d.sourceName && d.sourceName.toLowerCase().includes(q)) ||
      (d.village && d.village.toLowerCase().includes(q)) ||
      (d.subcenter && d.subcenter.toLowerCase().includes(q))
    );
  }

  // Sort descending by dispatch date and sample ID
  list.sort((a, b) => b.dispatchDate.localeCompare(a.dispatchDate) || b.sampleId.localeCompare(a.sampleId));

  return list;
}

// =========================================================================
// 4. LABORATORY RESULT UPDATE CONTROLLER (WITH MANDATORY REPORT COPY UPLOAD)
// =========================================================================
export function updateLabResults(payload, user = "System") {
  const {
    sampleIds = [],
    reportReceivedDate = "",
    labResult = "",
    labRefNo = "",
    labRemarks = "",
    reportCopy = null // { reportFileName, reportFileUrl, reportFileType, reportFileSize, reportUploadedAt }
  } = payload || {};

  if (!Array.isArray(sampleIds) || sampleIds.length === 0) {
    return { success: false, message: "⚠️ कृपया निकाल अपडेट करण्यासाठी तक्त्यामध्ये नमुने निवडा." };
  }

  if (!labResult || labResult === 'अहवाल अप्राप्त') {
    return { success: false, message: "⚠️ कृपया प्रयोगशाळा नमुना तपासणी निकाल (पिण्यास योग्य / अयोग्य) निवडा." };
  }

  if (!reportReceivedDate) {
    return { success: false, message: "⚠️ कृपया अहवाल प्राप्ती दिनांक प्रविष्ट करा." };
  }

  // Validate that every sample has a report copy file (either newly attached or existing)
  const missingCopySamples = [];
  sampleIds.forEach(sId => {
    const sample = nwbdcpSampleDispatches.find(d => d.sampleId === sId);
    if (sample) {
      const hasNewCopy = reportCopy && reportCopy.reportFileUrl;
      const hasExistingCopy = sample.reportFileUrl || (sample.reportCopy && sample.reportCopy.reportFileUrl);
      if (!hasNewCopy && !hasExistingCopy) {
        missingCopySamples.push(sId);
      }
    }
  });

  if (missingCopySamples.length > 0) {
    return {
      success: false,
      message: "⚠️ प्रयोगशाळा अहवालाची प्रत अपलोड करणे अनिवार्य आहे."
    };
  }

  let updatedCount = 0;

  sampleIds.forEach(sId => {
    const sample = nwbdcpSampleDispatches.find(d => d.sampleId === sId);
    if (sample) {
      const cleanDate = reportReceivedDate.slice(0, 10);
      sample.reportReceivedDate = cleanDate;
      sample.result = labResult;
      sample.labRefNo = labRefNo ? labRefNo.trim() : sample.labRefNo;
      sample.labRemarks = labRemarks ? labRemarks.trim() : sample.labRemarks;

      // Update report copy file metadata
      if (reportCopy && reportCopy.reportFileUrl) {
        const prevFile = sample.reportFileName || (sample.reportCopy ? sample.reportCopy.reportFileName : '');
        sample.reportFileName = reportCopy.reportFileName;
        sample.reportFileUrl = reportCopy.reportFileUrl;
        sample.reportFileType = reportCopy.reportFileType;
        sample.reportFileSize = reportCopy.reportFileSize;
        sample.reportUploadedAt = reportCopy.reportUploadedAt || new Date().toISOString();
        sample.reportUploadedBy = user;
        sample.reportCopy = { ...reportCopy };

        if (prevFile && prevFile !== reportCopy.reportFileName) {
          if (!Array.isArray(sample.reportHistory)) sample.reportHistory = [];
          sample.reportHistory.push({
            previousFile: prevFile,
            newFile: reportCopy.reportFileName,
            changedBy: user,
            changedDateTime: new Date().toISOString()
          });
        }
      }

      // Strict status calculation: Result + Date + Report Copy File
      if (sample.result && sample.result !== 'अहवाल अप्राप्त' && sample.reportReceivedDate && (sample.reportFileUrl || sample.reportFileName)) {
        sample.status = "अहवाल अपडेट पूर्ण";
      } else {
        sample.status = "अहवाल अपडेट अपूर्ण";
      }

      sample.updatedDate = new Date().toISOString();
      sample.updatedBy = user;

      if (!Array.isArray(sample.history)) sample.history = [];
      sample.history.push({
        action: "RESULT_UPDATED",
        status: sample.status,
        result: labResult,
        date: cleanDate,
        by: user,
        reportFileName: sample.reportFileName,
        reportFileUrl: sample.reportFileUrl,
        notes: `प्रयोगशाळा अहवाल नोंदवला: ${labResult} (जा.क्र. ${labRefNo || '-'}), प्रत फाईल: ${sample.reportFileName}`
      });

      updatedCount++;
    }
  });

  addNwbdcpAuditLog('UPDATE_LAB_RESULTS', `${updatedCount} नमुन्यांचे प्रयोगशाळा निकाल व प्रत अपलोड सेव्ह झाले (${labResult})`, user);
  saveNwbdcpDbToDisk();

  return {
    success: true,
    message: `✅ ${updatedCount} नमुन्यांचे प्रयोगशाळा निकाल व अहवाल प्रत यशस्वीरित्या जतन झाले! (अहवाल अपडेट पूर्ण)`,
    updatedCount
  };
}

export function replaceNwbdcpReportCopy(payload, user = "System") {
  const { sampleId, reportCopy } = payload || {};
  const sample = nwbdcpSampleDispatches.find(d => d.sampleId === sampleId);

  if (!sample) {
    return { success: false, message: "⚠️ नमुना नोंद सापडली नाही." };
  }

  if (!reportCopy || !reportCopy.reportFileUrl) {
    return { success: false, message: "⚠️ नवीन फाईल अपलोड माहिती उपलब्ध नाही." };
  }

  const previousFile = sample.reportFileName || "";
  sample.reportFileName = reportCopy.reportFileName;
  sample.reportFileUrl = reportCopy.reportFileUrl;
  sample.reportFileType = reportCopy.reportFileType;
  sample.reportFileSize = reportCopy.reportFileSize;
  sample.reportUploadedAt = new Date().toISOString();
  sample.reportUploadedBy = user;
  sample.reportCopy = { ...reportCopy };

  if (!Array.isArray(sample.reportHistory)) sample.reportHistory = [];
  sample.reportHistory.push({
    previousFile,
    newFile: reportCopy.reportFileName,
    changedBy: user,
    changedDateTime: new Date().toISOString()
  });

  if (sample.result && sample.result !== 'अहवाल अप्राप्त' && sample.reportReceivedDate && sample.reportFileUrl) {
    sample.status = "अहवाल अपडेट पूर्ण";
  } else {
    sample.status = "अहवाल अपडेट अपूर्ण";
  }

  addNwbdcpAuditLog('REPLACE_REPORT_COPY', `नमुना ${sampleId} ची अहवाल प्रत बदलेली: ${previousFile} -> ${reportCopy.reportFileName}`, user);
  saveNwbdcpDbToDisk();

  return {
    success: true,
    message: `✅ नमुना ${sampleId} ची प्रयोगशाळा अहवाल प्रत यशस्वीरित्या बदलण्यात आली!`,
    sample
  };
}

// =========================================================================
// 5. CONTAMINATED SAMPLE RE-TEST CONTROLLER
// =========================================================================
export function createRetestForSample(payload, user = "System") {
  const {
    originalSampleId,
    retestDispatchDate = new Date().toISOString().slice(0, 10),
    retestCollectionDate = new Date().toISOString().slice(0, 10),
    actionTaken = "टीसीएल ब्लिचिंग पावडरद्वारे सुपर क्लोरीनेशन करण्यात आले व गावाला उकळून पाणी पिण्याचा सल्ला दिला.",
    labName = "जिल्हा सार्वजनिक आरोग्य प्रयोगशाळा, धाराशीव",
    remarks = ""
  } = payload || {};

  const originalSample = nwbdcpSampleDispatches.find(d => d.sampleId === originalSampleId);
  if (!originalSample) {
    return { success: false, message: "मूळ नमुना नोंद सापडली नाही." };
  }

  const cleanDate = retestDispatchDate.slice(0, 10).replace(/-/g, '');
  const retestId = `NWBDCP-RETEST-${cleanDate}-${originalSampleId.replace('NWBDCP-', '')}`;

  const retestRecord = {
    retestId,
    originalSampleId: originalSample.sampleId,
    subcenter: originalSample.subcenter,
    village: originalSample.village,
    sourceId: originalSample.sourceId,
    sourceName: originalSample.sourceName,
    sourceType: originalSample.sourceType,
    ownership: originalSample.ownership,
    originalResult: originalSample.result || SAMPLE_STATUSES.UNSUITABLE,
    retestCollectionDate: retestCollectionDate.slice(0, 10),
    retestDispatchDate: retestDispatchDate.slice(0, 10),
    actionTaken,
    labName,
    remarks,
    retestResult: SAMPLE_STATUSES.AWAITED, // Initial re-test status
    retestReportReceivedDate: "",
    retestLabRefNo: "",
    createdDate: new Date().toISOString(),
    createdBy: user
  };

  // Mark original sample status to indicate re-test in progress
  originalSample.status = SAMPLE_STATUSES.RETEST_REQUIRED;
  if (!Array.isArray(originalSample.history)) originalSample.history = [];
  originalSample.history.push({
    action: "RETEST_INITIATED",
    status: SAMPLE_STATUSES.RETEST_REQUIRED,
    date: retestDispatchDate.slice(0, 10),
    by: user,
    notes: `पुनर्तपासणी नमुना तयार करण्यात आला (Re-test ID: ${retestId})`
  });

  nwbdcpRetests.push(retestRecord);

  addNwbdcpAuditLog('CREATE_RETEST', `पुनर्तपासणी नमुना तयार केला: ${retestId} (मूळ: ${originalSample.sampleId})`, user);
  saveNwbdcpDbToDisk();

  return {
    success: true,
    message: `✅ दूषित नमुन्यासाठी पुनर्तपासणी नमुना (Re-test ID: ${retestId}) यशस्वीरित्या नोंदवला गेला!`,
    retestRecord
  };
}

export function updateRetestResult(payload, user = "System") {
  const {
    retestId,
    retestReportReceivedDate = new Date().toISOString().slice(0, 10),
    retestResult = SAMPLE_STATUSES.SUITABLE,
    retestLabRefNo = "",
    labRemarks = ""
  } = payload || {};

  const retest = nwbdcpRetests.find(rt => rt.retestId === retestId);
  if (!retest) {
    return { success: false, message: "पुनर्तपासणी नोंद सापडली नाही." };
  }

  retest.retestReportReceivedDate = retestReportReceivedDate.slice(0, 10);
  retest.retestResult = retestResult;
  retest.retestLabRefNo = retestLabRefNo ? retestLabRefNo.trim() : retest.retestLabRefNo;
  retest.labRemarks = labRemarks ? labRemarks.trim() : retest.labRemarks;
  retest.updatedDate = new Date().toISOString();

  // Also update original sample status to RETEST_RECEIVED
  const original = nwbdcpSampleDispatches.find(d => d.sampleId === retest.originalSampleId);
  if (original) {
    original.status = SAMPLE_STATUSES.RETEST_RECEIVED;
    if (!Array.isArray(original.history)) original.history = [];
    original.history.push({
      action: "RETEST_RESULT_UPDATED",
      status: SAMPLE_STATUSES.RETEST_RECEIVED,
      date: retestReportReceivedDate.slice(0, 10),
      by: user,
      notes: `पुनर्तपासणी निकाल प्राप्त: ${retestResult}`
    });
  }

  addNwbdcpAuditLog('UPDATE_RETEST_RESULT', `पुनर्तपासणी निकाल नोंदवला: ${retestId} -> ${retestResult}`, user);
  saveNwbdcpDbToDisk();

  return {
    success: true,
    message: `✅ पुनर्तपासणी निकाल '${retestResult}' सेव्ह झाला!`,
    retest
  };
}

export function getRetestsList(filters = {}) {
  let list = [...nwbdcpRetests];

  if (filters.subcenter && filters.subcenter !== 'ALL') {
    list = list.filter(rt => rt.subcenter === filters.subcenter);
  }
  if (filters.village && filters.village !== 'ALL') {
    list = list.filter(rt => rt.village === filters.village);
  }
  if (filters.retestResult && filters.retestResult !== 'ALL') {
    list = list.filter(rt => rt.retestResult === filters.retestResult);
  }

  list.sort((a, b) => b.retestDispatchDate.localeCompare(a.retestDispatchDate));
  return list;
}

// =========================================================================
// 6. COMPREHENSIVE DYNAMIC REPORTS ENGINE
// =========================================================================
export function generateNwbdcpReports(reportType, options = {}) {
  const {
    subcenter = "ALL",
    village = "ALL",
    sourceType = "ALL",
    ownership = "ALL",
    resultStatus = "ALL",
    search = "",
    month = "ALL",
    year = "2026",
    fromDate = "",
    toDate = ""
  } = options;

  let samples = [...nwbdcpSampleDispatches];

  // Apply Date / Period Filters
  if (fromDate && toDate) {
    samples = samples.filter(s => s.dispatchDate >= fromDate && s.dispatchDate <= toDate);
  } else if (month && month !== 'ALL' && year) {
    const monthNumStr = String(month).padStart(2, '0');
    samples = samples.filter(s => s.dispatchDate.startsWith(`${year}-${monthNumStr}`));
  }

  if (subcenter && subcenter !== 'ALL') samples = samples.filter(s => s.subcenter === subcenter);
  if (village && village !== 'ALL') samples = samples.filter(s => s.village === village);
  if (sourceType && sourceType !== 'ALL') samples = samples.filter(s => s.sourceType === sourceType);
  if (ownership && ownership !== 'ALL') samples = samples.filter(s => s.ownership === ownership);
  if (resultStatus && resultStatus !== 'ALL') samples = samples.filter(s => s.result === resultStatus || s.status === resultStatus);
  if (search) {
    const q = search.toLowerCase().trim();
    samples = samples.filter(s =>
      (s.sampleId && s.sampleId.toLowerCase().includes(q)) ||
      (s.sourceCode && s.sourceCode.toLowerCase().includes(q)) ||
      (s.sourceId && s.sourceId.toLowerCase().includes(q)) ||
      (s.sourceName && s.sourceName.toLowerCase().includes(q)) ||
      (s.village && s.village.toLowerCase().includes(q))
    );
  }

  // Universal Helper to parse dates into timestamp numbers for true DESCENDING date sorting
  function parseDateTimestamp(dStr) {
    if (!dStr) return 0;
    const clean = String(dStr).trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY
        return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`).getTime() || 0;
      }
    }
    return new Date(clean).getTime() || 0;
  }

  // Sort samples: Primary Dispatch Date DESC (Newest First), Secondary Sample ID ASC
  samples.sort((a, b) => {
    const timeA = parseDateTimestamp(a.dispatchDate);
    const timeB = parseDateTimestamp(b.dispatchDate);
    if (timeB !== timeA) {
      return timeB - timeA; // DESCENDING order (Newest date at top)
    }
    return (a.sampleId || '').localeCompare(b.sampleId || '');
  });

  // Build Date-Grouped Data Structure
  const dateGroupsMap = {};
  samples.forEach(s => {
    const dKey = s.dispatchDate || 'अज्ञात दिनांक';
    if (!dateGroupsMap[dKey]) {
      dateGroupsMap[dKey] = [];
    }
    dateGroupsMap[dKey].push(s);
  });

  const dateGroups = Object.keys(dateGroupsMap).map(dKey => ({
    dispatchDate: dKey,
    timestamp: parseDateTimestamp(dKey),
    count: dateGroupsMap[dKey].length,
    samples: dateGroupsMap[dKey]
  })).sort((a, b) => b.timestamp - a.timestamp); // Date Groups sorted DESCENDING

  // Aggregate Metrics
  const totalSent = samples.length;
  const totalReceived = samples.filter(s => s.result === SAMPLE_STATUSES.SUITABLE || s.result === SAMPLE_STATUSES.UNSUITABLE).length;
  const suitable = samples.filter(s => s.result === SAMPLE_STATUSES.SUITABLE).length;
  const unsuitable = samples.filter(s => s.result === SAMPLE_STATUSES.UNSUITABLE).length;
  const awaited = totalSent - totalReceived;

  // Subcenter Breakdown
  const subcenterBreakdown = {};
  subcenterMaster.forEach(sc => {
    subcenterBreakdown[sc.name] = {
      subcenter: sc.name,
      totalSent: 0,
      totalReceived: 0,
      suitable: 0,
      unsuitable: 0,
      awaited: 0
    };
  });

  // Village Breakdown
  const villageBreakdown = {};
  villagesMaster.forEach(v => {
    villageBreakdown[v.villageName] = {
      village: v.villageName,
      subcenter: v.subcenter,
      totalSent: 0,
      totalReceived: 0,
      suitable: 0,
      unsuitable: 0,
      awaited: 0
    };
  });

  samples.forEach(s => {
    // Subcenter calc
    if (subcenterBreakdown[s.subcenter]) {
      const b = subcenterBreakdown[s.subcenter];
      b.totalSent++;
      if (s.result === SAMPLE_STATUSES.SUITABLE) {
        b.totalReceived++;
        b.suitable++;
      } else if (s.result === SAMPLE_STATUSES.UNSUITABLE) {
        b.totalReceived++;
        b.unsuitable++;
      } else {
        b.awaited++;
      }
    }

    // Village calc
    if (villageBreakdown[s.village]) {
      const vb = villageBreakdown[s.village];
      vb.totalSent++;
      if (s.result === SAMPLE_STATUSES.SUITABLE) {
        vb.totalReceived++;
        vb.suitable++;
      } else if (s.result === SAMPLE_STATUSES.UNSUITABLE) {
        vb.totalReceived++;
        vb.unsuitable++;
      } else {
        vb.awaited++;
      }
    }
  });

  // Source Type Breakdown
  const sourceTypeBreakdown = {};
  PREDEFINED_SOURCE_TYPES.forEach(st => {
    sourceTypeBreakdown[st] = { sourceType: st, totalSent: 0, suitable: 0, unsuitable: 0, awaited: 0 };
  });
  samples.forEach(s => {
    const stKey = PREDEFINED_SOURCE_TYPES.includes(s.sourceType) ? s.sourceType : "इतर";
    if (!sourceTypeBreakdown[stKey]) {
      sourceTypeBreakdown[stKey] = { sourceType: stKey, totalSent: 0, suitable: 0, unsuitable: 0, awaited: 0 };
    }
    sourceTypeBreakdown[stKey].totalSent++;
    if (s.result === SAMPLE_STATUSES.SUITABLE) sourceTypeBreakdown[stKey].suitable++;
    else if (s.result === SAMPLE_STATUSES.UNSUITABLE) sourceTypeBreakdown[stKey].unsuitable++;
    else sourceTypeBreakdown[stKey].awaited++;
  });

  return {
    reportType,
    options,
    summary: {
      totalSent,
      totalReceived,
      suitable,
      unsuitable,
      awaited,
      fitnessPercentage: totalReceived > 0 ? ((suitable / totalReceived) * 100).toFixed(1) : 0
    },
    samplesList: samples,
    dateGroups: dateGroups,
    subcenterSummary: Object.values(subcenterBreakdown),
    villageSummary: Object.values(villageBreakdown).filter(v => v.totalSent > 0),
    sourceTypeSummary: Object.values(sourceTypeBreakdown)
  };
}

// =========================================================================
// 7. HISTORICAL DATA CONTROLLED IMPORT
// =========================================================================
export function importHistoricalWaterSamples(samplesArray = [], user = "System") {
  if (!Array.isArray(samplesArray) || samplesArray.length === 0) {
    return { success: false, message: "इम्पोर्ट करण्यासाठी कोणताही नमुना डेटा सापडला नाही." };
  }

  const validRecords = [];
  const duplicateRecords = [];
  const invalidRecords = [];

  samplesArray.forEach((item, index) => {
    const rowNum = index + 1;
    const subcenter = item.subcenter || item['उपकेंद्र'] || item['उपकेंद्र (Subcenter)'] || "भादा";
    const village = item.village || item['गाव'] || item['गाव (Village)'] || "भादा";
    const sourceName = item.sourceName || item['जलस्त्रोत'] || item['स्त्रोताचे नाव'] || item['जलस्त्रोताचे नाव (Source Name)'] || "";
    const sourceType = item.sourceType || item['स्त्रोत प्रकार'] || item['स्त्रोत प्रकार (Source Type)'] || "विहीर";
    const ownership = item.ownership || item['मालकी'] || item['मालकी (Ownership)'] || "शासकीय";
    const sourceCode = item.sourceCode || item.sourceId || item['स्त्रोत आयडी'] || item['स्त्रोत आयडी (Source ID)'] || generateWaterSourceCode(String(village).trim(), sourceType);
    const dispatchDate = item.dispatchDate || item['दिनांक'] || item['पाठवणी दिनांक'] || item['पाठवणी दिनांक (Dispatch Date)'] || new Date().toISOString().slice(0, 10);
    const collectionDate = item.collectionDate || item['संकलन दिनांक'] || dispatchDate;
    const result = item.result || item['निकाल'] || item['तपासणी निकाल'] || item['तपासणी निकाल (Result)'] || SAMPLE_STATUSES.AWAITED;
    const labName = item.labName || item['प्रयोगशाळा नाव'] || item['प्रयोगशाळा नाव (Lab Name)'] || "जिल्हा सार्वजनिक आरोग्य प्रयोगशाळा, धाराशीव";
    const reportReceivedDate = item.reportReceivedDate || item['अहवाल दिनांक'] || item['अहवाल दिनांक (Report Date)'] || (result !== SAMPLE_STATUSES.AWAITED ? dispatchDate : "");
    const remarks = item.remarks || item['शेरा'] || item['शेरा (Remarks)'] || "जुने ऐतिहासिक पाणी नमुने इम्पोर्ट नोंदी";

    if (!sourceName) {
      invalidRecords.push({ rowNum, item, reason: "जलस्त्रोताचे नाव अनुपस्थित आहे." });
      return;
    }

    // Check duplicate sample ID
    const sampleId = item.sampleId || item['नमुना आयडी'] || item['नमुना आयडी (Sample ID)'] || generateUniqueSampleId(dispatchDate);
    const isDuplicate = nwbdcpSampleDispatches.some(d => d.sampleId === sampleId);

    if (isDuplicate) {
      duplicateRecords.push({ rowNum, sampleId, sourceName, village, reason: "हा नमुना आयडी (Sample ID) सिस्टीममध्ये आधीच अस्तित्वात आहे." });
      return;
    }

    validRecords.push({
      sampleId,
      sourceId: `SRC_HIST_${Date.now()}_${index}`,
      sourceCode: String(sourceCode).trim(),
      subcenter: String(subcenter).trim(),
      village: String(village).trim(),
      sourceName: String(sourceName).trim(),
      sourceType: String(sourceType).trim(),
      ownership: String(ownership).trim(),
      location: item.location || "",
      collectionDate: String(collectionDate).trim(),
      dispatchDate: String(dispatchDate).trim(),
      labName: String(labName).trim(),
      dispatchedBy: item.dispatchedBy || "वैद्यकीय अधिकारी, प्रा.आ.केंद्र भादा",
      remarks: String(remarks).trim(),
      status: result,
      result: result,
      reportReceivedDate: String(reportReceivedDate).trim(),
      labRefNo: item.labRefNo || "",
      labRemarks: item.labRemarks || "",
      createdDate: new Date().toISOString(),
      createdBy: `${user} (CSV/Excel Import)`
    });
  });

  // Commit valid records
  validRecords.forEach(rec => {
    nwbdcpSampleDispatches.push(rec);
  });

  if (validRecords.length > 0) {
    addNwbdcpAuditLog('IMPORT_HISTORICAL_SAMPLES', `${validRecords.length} जुने पाणी नमुने सिस्टीममध्ये यशस्वीरित्या इम्पोर्ट केले.`, user);
    saveNwbdcpDbToDisk();
  }

  return {
    success: validRecords.length > 0,
    importedCount: validRecords.length,
    duplicateCount: duplicateRecords.length,
    invalidCount: invalidRecords.length,
    validRecords,
    duplicateRecords,
    invalidRecords,
    message: `✅ ${validRecords.length} जुने पाणी नमुने यशस्वीरित्या सिस्टीममध्ये सेव्ह झाले! (${duplicateRecords.length} दुबार व ${invalidRecords.length} अवैध नोंदी वगळल्या)`
  };
}
