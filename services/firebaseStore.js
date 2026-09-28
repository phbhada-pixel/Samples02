import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

console.log('[FirebaseStore] Initialized Cloud Firestore database:', firebaseConfig.firestoreDatabaseId);

function toSafeDocId(str, prefix = 'DOC') {
  if (!str) return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const clean = String(str).replace(/[^a-zA-Z0-9_\-.]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return clean ? clean.slice(0, 120) : `${prefix}_${Date.now()}`;
}

// -------------------------------------------------------------
// DENGUE & CHIKUNGUNYA ENTRIES
// -------------------------------------------------------------
export async function syncDengueEntryToFirestore(entry) {
  if (!entry || !entry.id) return { success: false, error: 'Invalid entry' };
  try {
    const docId = toSafeDocId(entry.id, 'DENGUE');
    const ref = doc(firestoreDb, 'dengueEntries', docId);
    const payload = {
      ...entry,
      id: String(entry.id),
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error writing Dengue entry to Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getDengueEntriesFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'dengueEntries'));
    const entries = [];
    snap.forEach(docSnap => {
      entries.push(docSnap.data());
    });
    return { success: true, data: entries };
  } catch (err) {
    console.error('[FirebaseStore] Error reading Dengue entries from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

export async function deleteDengueEntryFromFirestore(id) {
  if (!id) return { success: false, error: 'Invalid ID' };
  try {
    const docId = toSafeDocId(id, 'DENGUE');
    const ref = doc(firestoreDb, 'dengueEntries', docId);
    await deleteDoc(ref);
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error deleting Dengue entry from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// BS DATA ENTRIES (BLOOD SLIDES)
// -------------------------------------------------------------
export async function syncBsDataEntryToFirestore(bsEntry) {
  if (!bsEntry) return { success: false, error: 'Invalid BS entry' };
  try {
    const idVal = bsEntry[0] || `BS_${Date.now()}`;
    const docId = toSafeDocId(idVal, 'BS');
    const ref = doc(firestoreDb, 'bsDataEntry', docId);
    const data = {
      id: String(bsEntry[0]),
      date: bsEntry[1] ? new Date(bsEntry[1]).toISOString() : new Date().toISOString(),
      upkendra: bsEntry[2] || '',
      employeeName: bsEntry[3] || '',
      designation: bsEntry[4] || '',
      bsCode: bsEntry[5] || '',
      bundleNumber: bsEntry[6] || '',
      pasun: parseInt(bsEntry[7]) || 0,
      paraynt: parseInt(bsEntry[8]) || 0,
      total: parseInt(bsEntry[9]) || 0,
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, data, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error writing BS entry to Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

export async function syncBatchBsDataToFirestore(entriesArray) {
  if (!Array.isArray(entriesArray) || entriesArray.length === 0) return { success: true };
  try {
    for (const bs of entriesArray) {
      const res = await syncBsDataEntryToFirestore(bs);
      if (!res.success) return res;
    }
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Batch BS sync error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getBsDataEntriesFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'bsDataEntry'));
    const entries = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      entries.push([
        d.id,
        d.date,
        d.upkendra,
        d.employeeName,
        d.designation,
        d.bsCode,
        d.bundleNumber,
        d.pasun,
        d.paraynt,
        d.total
      ]);
    });
    return { success: true, data: entries };
  } catch (err) {
    console.error('[FirebaseStore] Error reading BS entries from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

export async function deleteBsDataEntryFromFirestore(id) {
  if (!id) return { success: false, error: 'Invalid ID' };
  try {
    const docId = toSafeDocId(id, 'BS');
    const ref = doc(firestoreDb, 'bsDataEntry', docId);
    await deleteDoc(ref);
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error deleting BS entry from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// VILLAGE DETAILS
// -------------------------------------------------------------
export async function syncVillageDetailToFirestore(v) {
  if (!v || !v[0]) return { success: false };
  try {
    const rawId = `VIL_${v[0]}_${v[3] || 'VIL'}`;
    const docId = toSafeDocId(rawId, 'VILD');
    const ref = doc(firestoreDb, 'villageDetails', docId);
    const data = {
      id: String(v[0]),
      employeeName: v[1] || '',
      date: v[2] ? new Date(v[2]).toISOString() : new Date().toISOString(),
      villageName: v[3] || '',
      sampleCount: parseInt(v[4]) || 0,
      maleCount: parseInt(v[5]) || 0,
      femaleCount: parseInt(v[6]) || 0,
      upkendra: v[7] || '',
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, data, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error syncing village detail:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getVillageDetailsFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'villageDetails'));
    const details = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      details.push([
        d.id,
        d.employeeName,
        d.date,
        d.villageName,
        d.sampleCount,
        d.maleCount,
        d.femaleCount,
        d.upkendra
      ]);
    });
    return { success: true, data: details };
  } catch (err) {
    console.error('[FirebaseStore] Error reading village details from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

export async function deleteVillageDetailFromFirestore(id) {
  if (!id) return { success: false };
  try {
    const docId = toSafeDocId(id, 'VILD');
    const ref = doc(firestoreDb, 'villageDetails', docId);
    await deleteDoc(ref);
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error deleting village detail from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// SUBCENTER MASTER DATA
// -------------------------------------------------------------
export async function syncSubcenterMasterToFirestore(sc) {
  if (!sc) return { success: false, error: 'Invalid subcenter' };
  try {
    const idVal = sc.id || `SC_${sc.name || Date.now()}`;
    const docId = toSafeDocId(idVal, 'SC');
    const ref = doc(firestoreDb, 'subcenterMaster', docId);
    const payload = {
      id: String(sc.id || docId),
      name: sc.name || '',
      headquarter: sc.headquarter || '',
      contactPerson: sc.contactPerson || '',
      population: parseInt(sc.population) || 0,
      houses: parseInt(sc.houses) || 0,
      contactPhone: sc.contactPhone || '',
      villages: Array.isArray(sc.villages) ? sc.villages : [],
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error syncing subcenter master:', err.message);
    return { success: false, error: err.message };
  }
}

export async function syncBatchSubcentersToFirestore(subcentersArray) {
  if (!Array.isArray(subcentersArray) || subcentersArray.length === 0) return { success: true, count: 0 };
  let count = 0;
  for (const sc of subcentersArray) {
    const res = await syncSubcenterMasterToFirestore(sc);
    if (res.success) count++;
  }
  return { success: true, count };
}

export async function getSubcentersFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'subcenterMaster'));
    const list = [];
    snap.forEach(docSnap => list.push(docSnap.data()));
    return { success: true, data: list };
  } catch (err) {
    console.error('[FirebaseStore] Error fetching subcenters from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

// -------------------------------------------------------------
// EMPLOYEE MASTER DATA
// -------------------------------------------------------------
export async function syncEmployeeMasterToFirestore(emp) {
  if (!emp) return { success: false, error: 'Invalid employee' };
  try {
    const idVal = emp.id || `EMP_${emp.bsCode || emp.employeeName || Date.now()}`;
    const docId = toSafeDocId(idVal, 'EMP');
    const ref = doc(firestoreDb, 'employeeMaster', docId);
    const payload = {
      id: String(emp.id || docId),
      upkendra: emp.upkendra || '',
      employeeName: emp.employeeName || '',
      designation: emp.designation || '',
      bsCode: emp.bsCode || '',
      mobile: emp.mobile || '',
      villageList: Array.isArray(emp.villageList) ? emp.villageList : [],
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error syncing employee master:', err.message);
    return { success: false, error: err.message };
  }
}

export async function syncBatchEmployeesToFirestore(employeesArray) {
  if (!Array.isArray(employeesArray) || employeesArray.length === 0) return { success: true, count: 0 };
  let count = 0;
  for (const emp of employeesArray) {
    const res = await syncEmployeeMasterToFirestore(emp);
    if (res.success) count++;
  }
  return { success: true, count };
}

export async function getEmployeesFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'employeeMaster'));
    const list = [];
    snap.forEach(docSnap => list.push(docSnap.data()));
    return { success: true, data: list };
  } catch (err) {
    console.error('[FirebaseStore] Error fetching employees from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

// -------------------------------------------------------------
// VILLAGES MASTER DATA
// -------------------------------------------------------------
export async function syncVillagesMasterToFirestore(vil) {
  if (!vil) return { success: false, error: 'Invalid village' };
  try {
    const idVal = vil.id || `VIL_${vil.villageName || Date.now()}`;
    const docId = toSafeDocId(idVal, 'VIL');
    const ref = doc(firestoreDb, 'villagesMaster', docId);
    const payload = {
      id: String(vil.id || docId),
      subcenter: vil.subcenter || '',
      villageName: vil.villageName || '',
      population: parseInt(vil.population) || 0,
      households: parseInt(vil.households) || 0,
      assignedEmployees: Array.isArray(vil.assignedEmployees) ? vil.assignedEmployees : [],
      updatedAt: new Date().toISOString()
    };
    await setDoc(ref, payload, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error syncing village master:', err.message);
    return { success: false, error: err.message };
  }
}

export async function syncBatchVillagesToFirestore(villagesArray) {
  if (!Array.isArray(villagesArray) || villagesArray.length === 0) return { success: true, count: 0 };
  let count = 0;
  for (const vil of villagesArray) {
    const res = await syncVillagesMasterToFirestore(vil);
    if (res.success) count++;
  }
  return { success: true, count };
}

export async function getVillagesFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'villagesMaster'));
    const list = [];
    snap.forEach(docSnap => list.push(docSnap.data()));
    return { success: true, data: list };
  } catch (err) {
    console.error('[FirebaseStore] Error fetching villages from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

// -------------------------------------------------------------
// MONTH MASTER (NVBDCP PROGRESSIVES)
// -------------------------------------------------------------
export async function syncMonthMasterToFirestore(monthObj) {
  if (!monthObj || !monthObj.id) return { success: false };
  try {
    const docId = toSafeDocId(monthObj.id, 'MONTH');
    const ref = doc(firestoreDb, 'monthMaster', docId);
    await setDoc(ref, { ...monthObj, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error syncing monthMaster:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getMonthMasterFromFirestore() {
  try {
    const snap = await getDocs(collection(firestoreDb, 'monthMaster'));
    const list = [];
    snap.forEach(docSnap => list.push(docSnap.data()));
    return { success: true, data: list };
  } catch (err) {
    console.error('[FirebaseStore] Error reading monthMaster from Firestore:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

// -------------------------------------------------------------
// APP CONFIG & METADATA
// -------------------------------------------------------------
export async function saveAppConfigToFirestore(configId, configData) {
  try {
    const docId = toSafeDocId(configId, 'CFG');
    const ref = doc(firestoreDb, 'appConfig', docId);
    await setDoc(ref, { ...configData, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error saving appConfig:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getAppConfigFromFirestore(configId) {
  try {
    const docId = toSafeDocId(configId, 'CFG');
    const ref = doc(firestoreDb, 'appConfig', docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { success: true, data: snap.data() };
    }
    return { success: false, error: 'Not found' };
  } catch (err) {
    console.error('[FirebaseStore] Error reading appConfig:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// TRANSFER ALL DATASETS TO FIRESTORE
// -------------------------------------------------------------
export async function transferAllDataToFirestore(storeData) {
  try {
    const results = {
      bsDataCount: 0,
      subcenterCount: 0,
      employeeCount: 0,
      villageMasterCount: 0,
      villageDetailCount: 0,
      dengueCount: 0,
      errors: []
    };

    // 1. BS Data Entries
    if (Array.isArray(storeData.bsDataEntry) && storeData.bsDataEntry.length > 0) {
      for (const bs of storeData.bsDataEntry) {
        const res = await syncBsDataEntryToFirestore(bs);
        if (res.success) results.bsDataCount++;
        else results.errors.push(`BS entry ${bs[0]}: ${res.error}`);
      }
    }

    // 2. Subcenter Master
    if (Array.isArray(storeData.subcenterMaster) && storeData.subcenterMaster.length > 0) {
      const scRes = await syncBatchSubcentersToFirestore(storeData.subcenterMaster);
      results.subcenterCount = scRes.count || 0;
    }

    // 3. Employee Master
    if (Array.isArray(storeData.employeeMaster) && storeData.employeeMaster.length > 0) {
      const empRes = await syncBatchEmployeesToFirestore(storeData.employeeMaster);
      results.employeeCount = empRes.count || 0;
    }

    // 4. Villages Master
    if (Array.isArray(storeData.villagesMaster) && storeData.villagesMaster.length > 0) {
      const vilRes = await syncBatchVillagesToFirestore(storeData.villagesMaster);
      results.villageMasterCount = vilRes.count || 0;
    }

    // 5. Village Details
    if (Array.isArray(storeData.villageDetails) && storeData.villageDetails.length > 0) {
      for (const vd of storeData.villageDetails) {
        const res = await syncVillageDetailToFirestore(vd);
        if (res.success) results.villageDetailCount++;
        else if (results.errors.length < 5) results.errors.push(`Village detail ${vd[0]}: ${res.error}`);
      }
    }

    // 6. Dengue Entries
    if (Array.isArray(storeData.dengueChikungunyaEntries) && storeData.dengueChikungunyaEntries.length > 0) {
      for (const d of storeData.dengueChikungunyaEntries) {
        const res = await syncDengueEntryToFirestore(d);
        if (res.success) results.dengueCount++;
      }
    }

    return { success: true, results };
  } catch (err) {
    console.error('[FirebaseStore] Error transferring all data to Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// FETCH ALL FOR STARTUP
// -------------------------------------------------------------
export async function fetchAllDataFromFirestore() {
  try {
    const dengueRes = await getDengueEntriesFromFirestore();
    const bsRes = await getBsDataEntriesFromFirestore();
    const vilRes = await getVillageDetailsFromFirestore();
    const monthRes = await getMonthMasterFromFirestore();
    const subRes = await getSubcentersFromFirestore();
    const empRes = await getEmployeesFromFirestore();
    const vilMasterRes = await getVillagesFromFirestore();

    return {
      success: true,
      dengueList: dengueRes.data || [],
      bsList: bsRes.data || [],
      villageList: vilRes.data || [],
      monthList: monthRes.data || [],
      subcenterList: subRes.data || [],
      employeeList: empRes.data || [],
      villageMasterList: vilMasterRes.data || []
    };
  } catch (err) {
    console.error('[FirebaseStore] Error fetching all from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}
