import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

console.log('[FirebaseStore] Initialized Cloud Firestore database:', firebaseConfig.firestoreDatabaseId);

// -------------------------------------------------------------
// DENGUE & CHIKUNGUNYA ENTRIES
// -------------------------------------------------------------
export async function syncDengueEntryToFirestore(entry) {
  if (!entry || !entry.id) return { success: false, error: 'Invalid entry' };
  try {
    const ref = doc(firestoreDb, 'dengueEntries', String(entry.id));
    const payload = {
      ...entry,
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
    const ref = doc(firestoreDb, 'dengueEntries', String(id));
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
    const id = bsEntry[0] || `BS_${Date.now()}`;
    const ref = doc(firestoreDb, 'bsDataEntry', String(id));
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
    const ref = doc(firestoreDb, 'bsDataEntry', String(id));
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
    const detailId = `VIL_${v[0]}_${v[3] || 'VIL'}`;
    const ref = doc(firestoreDb, 'villageDetails', String(detailId));
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
    const ref = doc(firestoreDb, 'villageDetails', String(id));
    await deleteDoc(ref);
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error deleting village detail from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}

// -------------------------------------------------------------
// MONTH MASTER (NVBDCP PROGRESSIVES)
// -------------------------------------------------------------
export async function syncMonthMasterToFirestore(monthObj) {
  if (!monthObj || !monthObj.id) return { success: false };
  try {
    const ref = doc(firestoreDb, 'monthMaster', String(monthObj.id));
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
    const ref = doc(firestoreDb, 'appConfig', String(configId));
    await setDoc(ref, { ...configData, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[FirebaseStore] Error saving appConfig:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getAppConfigFromFirestore(configId) {
  try {
    const ref = doc(firestoreDb, 'appConfig', String(configId));
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
// FETCH ALL FOR STARTUP
// -------------------------------------------------------------
export async function fetchAllDataFromFirestore() {
  try {
    const dengueRes = await getDengueEntriesFromFirestore();
    const bsRes = await getBsDataEntriesFromFirestore();
    const vilRes = await getVillageDetailsFromFirestore();
    const monthRes = await getMonthMasterFromFirestore();

    return {
      success: true,
      dengueList: dengueRes.data || [],
      bsList: bsRes.data || [],
      villageList: vilRes.data || [],
      monthList: monthRes.data || []
    };
  } catch (err) {
    console.error('[FirebaseStore] Error fetching all from Firestore:', err.message);
    return { success: false, error: err.message };
  }
}
