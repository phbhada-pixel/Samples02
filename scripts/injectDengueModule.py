import sys
import re

print("Reading scripts/rebuildAppUI.js...")
with open("scripts/rebuildAppUI.js", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update clientEngineScript initialization of clientDengueEntries
old_store_init = "let clientVillageDetails = getLocalStore('villageDetails', null);"
new_store_init = """let clientDengueEntries = getLocalStore('dengueChikungunyaEntries', null);
      if (!clientDengueEntries || !Array.isArray(clientDengueEntries) || clientDengueEntries.length === 0) {
        clientDengueEntries = (defaultSnap.dengueChikungunyaEntries && Array.isArray(defaultSnap.dengueChikungunyaEntries)) ? defaultSnap.dengueChikungunyaEntries : [];
        if (clientDengueEntries.length > 0) setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
      }
      let clientVillageDetails = getLocalStore('villageDetails', null);"""

if old_store_init in text and "clientDengueEntries" not in text:
    text = text.replace(old_store_init, new_store_init, 1)
    print("Added clientDengueEntries initialization in clientEngineScript!")

# 2. Add client-side RPC cases in executeClientSideRpc
old_rpc_case = "case 'getMonthListForWebApp':"
new_rpc_cases = """case 'getDengueEntries': {
            const [filterDate, filterVillage] = args;
            let list = [...clientDengueEntries];
            if (filterDate && filterDate !== 'All') list = list.filter(e => e.dateCollection === filterDate);
            if (filterVillage && filterVillage !== 'All') list = list.filter(e => e.village === filterVillage);
            list.sort((a, b) => (b.dateCollection || '').localeCompare(a.dateCollection || '') || (a.patientName || '').localeCompare(b.patientName || ''));
            return { result: { success: true, entries: list } };
          }
          case 'saveDengueEntry': {
            const [entryData] = args;
            if (!entryData || !entryData.patientName) return { result: { success: false, message: 'रुग्णाचे नाव आवश्यक आहे.' } };
            const cleanName = String(entryData.patientName).trim().toUpperCase();
            const cleanRegNo = entryData.patientRegNo ? String(entryData.patientRegNo).trim() : '';
            const cleanDate = entryData.dateCollection ? String(entryData.dateCollection).trim() : new Date().toISOString().slice(0, 10);
            const id = entryData.id || `DENGUE_${cleanDate.replace(/-/g, '')}_${cleanRegNo || Math.floor(1000 + Math.random() * 9000)}`;
            const rec = { ...entryData, id, patientName: cleanName, dateCollection: cleanDate };
            const idx = clientDengueEntries.findIndex(e => e.id === id);
            if (idx !== -1) clientDengueEntries[idx] = rec;
            else clientDengueEntries.push(rec);
            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
            return { result: { success: true, message: `रुग्ण ${rec.patientName} ची नोंद सुरक्षित सेव्ह झाली.`, id: rec.id, record: rec } };
          }
          case 'deleteDengueEntry': {
            const [id] = args;
            const idx = clientDengueEntries.findIndex(e => e.id === id);
            if (idx === -1) return { result: { success: false, message: 'नोंद सापडली नाही.' } };
            const rem = clientDengueEntries.splice(idx, 1)[0];
            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
            return { result: { success: true, message: `रुग्ण ${rem.patientName} ची नोंद हटवली.` } };
          }
          case 'generateGmcForwardingLetter': {
            const [dateStr, outwardNo] = args;
            let list = [...clientDengueEntries];
            if (dateStr && dateStr !== 'All') list = list.filter(e => e.dateCollection === dateStr);
            if (list.length === 0) return { result: { success: false, message: `दिनांक ${dateStr || ''} साठी नमुने सापडले नाहीत.` } };
            const displayDate = dateStr ? dateStr.split('-').reverse().join('-') : new Date().toISOString().slice(0, 10).split('-').reverse().join('-');
            const outNo = outwardNo ? String(outwardNo).trim() : '';
            let rowsHtml = '';
            list.forEach((p, idx) => {
              const pDate = p.dateCollection ? p.dateCollection.split('-').reverse().join('-') : displayDate;
              rowsHtml += `<tr><td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${idx+1}</td><td style="border:1px solid #1a202c; padding:8px 12px; font-weight:700; text-transform:uppercase;">${p.patientName}</td><td style="border:1px solid #1a202c; padding:8px 10px; text-align:center; font-weight:600;">${p.village}</td><td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${p.age}</td><td style="border:1px solid #1a202c; padding:8px 10px; text-align:center; text-transform:uppercase;">${p.sex}</td><td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${pDate}</td></tr>`;
            });
            const letterHtml = `<div style="max-width:850px; margin:0 auto; padding:25px 30px; font-family:'Poppins', Arial, sans-serif; color:#1a202c; line-height:1.6; font-size:13.5px;"><div style="text-align:center; margin-bottom:24px;"><h2 style="font-size:22px; font-weight:800; margin:0 0 4px 0; color:#1a202c;">महाराष्ट्र शासन</h2><h3 style="font-size:17px; font-weight:700; margin:0; text-decoration:underline; color:#2d3748;">प्राथमिक आरोग्य केंद्र, भादा, ता. औसा, जि. लातूर</h3></div><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:22px; font-size:13.5px; font-weight:600;"><div>जा.क्र. प्राआकें/भादा/डेंगी-नमुने/ <b>${outNo ? outNo + ' ' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</b> /2026</div><div>दिनांक: <b>${displayDate}</b></div></div><div style="margin-bottom:20px; font-size:14px; line-height:1.7;">प्रति,<br><b>प्रयोगशाळा अधिकारी,</b><br>शासकीय वैद्यकीय महाविद्यालय (GMC),<br>लातूर.</div><div style="margin-bottom:20px; font-size:14.5px; font-weight:700; text-align:center;">विषय : डेंगी व चिकनगुनिया सिरम नमुने तपासणीसाठी पाठविणेबाबत.</div><div style="margin-bottom:24px; font-size:13.5px; line-height:1.8; text-align:justify; text-indent:40px;">महोदय,<br>उपरोक्त विषयी विनंती की, प्राथमिक आरोग्य केंद्र भादा अंतर्गत खालील रुग्णांचे डेंगी व चिकनगुनिया संशयित सिरम नमुने तपासणीसाठी या पत्रासोबत पाठविण्यात येत आहेत. तरी कृपया सदर नमुने तपासून अहवाल मिळावा, ही विनंती.</div><table style="width:100%; border-collapse:collapse; margin-bottom:45px; font-size:13px;"><thead><tr style="background:#f1f5f9;"><th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:50px;">अ.क्र.</th><th style="border:1px solid #1a202c; padding:8px 12px; text-align:center;">रुग्णाचे नाव</th><th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:110px;">गाव</th><th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:60px;">वय</th><th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:90px;">लिंग</th><th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:150px;">नमुना घेतल्याचा दिनांक</th></tr></thead><tbody>${rowsHtml}</tbody></table><div style="display:flex; justify-content:flex-end; margin-top:50px; text-align:right;"><div style="line-height:1.6; font-size:13.5px;"><div style="font-weight:700;">वैद्यकीय अधिकारी</div><div style="font-weight:700; margin-top:3px;">Dr. Patil S.S.</div><div style="color:#2d3748;">प्राथमिक आरोग्य केंद्र, भादा</div></div></div></div>`;
            return { result: { success: true, message: `GMC लातूर तपासणी पत्र तयार झाले (${list.length} रुग्ण).`, html: wrapReportPageLocal(`GMC लातूर डेंगी सिरम पत्र (${displayDate})`, letterHtml) } };
          }
          case 'generateNivCaseHistorySheets': {
            const [patientIdsOrDate] = args;
            let list = [...clientDengueEntries];
            if (Array.isArray(patientIdsOrDate) && patientIdsOrDate.length > 0) list = list.filter(e => patientIdsOrDate.includes(e.id));
            else if (typeof patientIdsOrDate === 'string' && patientIdsOrDate !== 'All') {
              if (patientIdsOrDate.startsWith('DENGUE_')) list = list.filter(e => e.id === patientIdsOrDate);
              else list = list.filter(e => e.dateCollection === patientIdsOrDate);
            }
            if (list.length === 0) return { result: { success: false, message: 'कोणत्याही रुग्णाची केस हिस्ट्री शीट सापडली नाही.' } };
            let sheetsHtml = '';
            list.forEach((p, idx) => {
              const dateOnsetFmt = p.dateOnset ? p.dateOnset.split('-').reverse().join('-') : '-';
              const dateCollFmt = p.dateCollection ? p.dateCollection.split('-').reverse().join('-') : '-';
              const isLast = idx === list.length - 1;
              sheetsHtml += `<div class="niv-sheet-page" style="page-break-after:${isLast ? 'auto' : 'always'}; max-width:850px; margin:0 auto; padding:25px 30px; font-family:'Poppins', Arial, sans-serif; font-size:13.5px; line-height:1.7; color:#1a202c; min-height:980px; box-sizing:border-box;"><div style="text-align:center; margin-bottom:20px; line-height:1.4;"><h2 style="font-size:18px; font-weight:800; margin:0; color:#1a202c;">National Institute of Virology</h2><div style="font-size:12.5px; font-weight:600; margin-top:2px; color:#4a5568;">20 A Dr. Ambedkar Road Post Box No 11 Pune 411 001</div><div style="font-size:14.5px; font-weight:700; margin-top:6px; text-decoration:underline; color:#1a202c;">Case history sheet for Dengue / Chikungunya fever</div></div><div style="font-weight:700; text-decoration:underline; margin-bottom:14px;">Information Required to Accompany Specimen:-</div><div style="margin-bottom:10px; display:flex; align-items:baseline; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><span style="font-weight:700; min-width:240px;">1. Full name of patient :-</span><span style="font-weight:700; text-transform:uppercase; font-size:14px; letter-spacing:0.02em;">${p.patientName}</span></div><div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><div style="font-weight:700;">2. Residential address of patient <span style="font-weight:normal;">(Mobile:- <b>${p.mobile || '-'}</b>)</span></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:4px; padding-left:20px;"><div>A. House No :- <b>${p.houseNo || '-'}</b></div><div>B. Village :- <b>${p.village}</b></div><div>C. Taluka :- <u>${p.taluka || 'AUSA'}</u></div><div>D. District :- <u>${p.district || 'LATUR'}</u></div></div></div><div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><div style="font-weight:700;">3. Hospital address :- <span style="font-weight:600; text-decoration:underline;">${p.hospitalAddress || 'प्राथमिक आरोग्य केंद्र भादा'}</span></div><div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px; margin-top:4px; padding-left:20px;"><div>A. Patient Reg No :- <u><b>${p.patientRegNo || '-'}</b></u></div><div>B. Ward No :- <b>${p.wardNo || '--'}</b></div><div>C. Bed No :- <b>${p.bedNo || '--'}</b></div></div></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><div><b>4. Age :-</b> <u>${p.age}</u></div><div><b>5. Sex :-</b> <u>${p.sex}</u></div></div><div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><b>6. Date Of Onset of First Symptom :-</b> <u>${dateOnsetFmt}</u></div><div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><b>7. Nature of sample Serum/Blood/CSF :-</b> <u>${p.sampleNature || 'Serum'}</u></div><div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;"><b>8. Date of sample collection :-</b> <u>${dateCollFmt}</u></div><div style="margin-bottom:12px; border-bottom:1px solid #edf2f7; padding-bottom:8px;"><div style="font-weight:700; margin-bottom:4px;">9. Clinical finding</div><div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; padding-left:20px;"><div>1. Fever :- <u><b>${p.clinicalFever ?? 1}</b> Days</u></div><div>2. Headache :- <u><b>${p.clinicalHeadache ?? 0}</b> Days</u></div><div>3. Bodyache :- <u><b>${p.clinicalBodyache ?? 0}</b> Days</u></div><div>4. Joint Pain :- <u><b>${p.clinicalJointPain ?? 0}</b> Days</u></div><div>5. Retro Orbital Pain :- <u><b>${p.clinicalRetroOrbitalPain ?? 0}</b> Days</u></div><div>6. Rash :- <u><b>${p.clinicalRash ?? 0}</b> Days</u></div></div></div><div style="margin-bottom:28px;"><div style="font-weight:700;">10. Haemorrhagic Manifestation :- <u>${p.haemorrhagic || 'No'}</u></div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; padding-left:20px; margin-top:6px;"><div>a. Hematemesis :- ${p.haemHematemesis ? `<u>${p.haemHematemesis}</u>` : '_______________'}</div><div>b. Epistaxis :- ${p.haemEpistaxis ? `<u>${p.haemEpistaxis}</u>` : '_______________'}</div><div>c. Melena :- ${p.haemMelena ? `<u>${p.haemMelena}</u>` : '_______________'}</div><div>d. ${p.haemOther ? `<u>${p.haemOther}</u>` : '__________________________'}</div></div></div><div style="display:flex; justify-content:flex-end; margin-top:40px; text-align:right;"><div style="line-height:1.5; font-size:13px;"><div style="font-weight:700;">Signature of Medical Officer</div><div style="font-weight:700; margin-top:3px;">${p.doctorName || 'Dr. Patil S.S.'}</div><div>Mobile No: <b>${p.doctorMobile || '9689686901'}</b></div><div style="color:#718096; font-size:12px; margin-top:2px;">(Seal / Stamp)</div></div></div></div>`;
            });
            return { result: { success: true, message: `NIV पुणे केस हिस्ट्री शीट्स तयार झाल्या (${list.length} रुग्ण).`, html: wrapReportPageLocal(`NIV Pune केस हिस्ट्री शीट (${list.length} रुग्ण)`, sheetsHtml) } };
          }
          case 'getMonthListForWebApp':"""

if old_rpc_case in text and "getDengueEntries" not in text:
    text = text.replace(old_rpc_case, new_rpc_cases, 1)
    print("Added executeClientSideRpc dengue cases in rebuildAppUI.js!")

with open("scripts/rebuildAppUI.js", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished updating clientEngineScript in scripts/rebuildAppUI.js!")
