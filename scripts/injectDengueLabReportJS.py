import re
import sys

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update filterDengueTable and renderDengueTable
old_filter_fn_start = text.find('function filterDengueTable() {')
old_filter_fn_end = text.find('function toggleAllDengueCb(', old_filter_fn_start)

if old_filter_fn_start != -1 and old_filter_fn_end != -1:
    new_filter_and_render_code = """function filterDengueTable() {
      const sVal = (document.getElementById('dgFilterSearch')?.value || '').toLowerCase().trim();
      const vVal = document.getElementById('dgFilterVillage')?.value || 'All';
      const dVal = document.getElementById('dgFilterDate')?.value || 'All';
      const dgResVal = document.getElementById('dgFilterDengueResult')?.value || 'All';
      const chikResVal = document.getElementById('dgFilterChikResult')?.value || 'All';

      let filtered = [...mDengueData];

      if (vVal !== 'All') {
        filtered = filtered.filter(e => e.village === vVal);
      }
      if (dVal !== 'All') {
        filtered = filtered.filter(e => e.dateCollection === dVal);
      }
      if (dgResVal !== 'All') {
        filtered = filtered.filter(e => (e.dengueResult || 'Pending') === dgResVal);
      }
      if (chikResVal !== 'All') {
        filtered = filtered.filter(e => (e.chikungunyaResult || 'Pending') === chikResVal);
      }
      if (sVal) {
        filtered = filtered.filter(e => {
          return (e.patientName && e.patientName.toLowerCase().includes(sVal)) ||
                 (e.patientRegNo && e.patientRegNo.toLowerCase().includes(sVal)) ||
                 (e.village && e.village.toLowerCase().includes(sVal)) ||
                 (e.mobile && e.mobile.includes(sVal)) ||
                 (e.dengueReportRef && e.dengueReportRef.toLowerCase().includes(sVal)) ||
                 (e.chikungunyaReportRef && e.chikungunyaReportRef.toLowerCase().includes(sVal));
        });
      }

      // Update KPI strip counts based on full mDengueData
      const totalCount = mDengueData.length;
      const dPosCount = mDengueData.filter(e => e.dengueResult === 'Positive').length;
      const cPosCount = mDengueData.filter(e => e.chikungunyaResult === 'Positive').length;
      const pendingCount = mDengueData.filter(e => (e.dengueResult === 'Pending' || e.chikungunyaResult === 'Pending' || (!e.dengueResult && !e.chikungunyaResult))).length;
      const negCount = mDengueData.filter(e => (e.dengueResult === 'Negative' && (e.chikungunyaResult === 'Negative' || !e.chikungunyaResult))).length;

      const elTotal = document.getElementById('dgKpiTotalSamples');
      if (elTotal) elTotal.textContent = totalCount;
      const elDPos = document.getElementById('dgKpiDenguePos');
      if (elDPos) elDPos.textContent = dPosCount;
      const elCPos = document.getElementById('dgKpiChikPos');
      if (elCPos) elCPos.textContent = cPosCount;
      const elPend = document.getElementById('dgKpiPending');
      if (elPend) elPend.textContent = pendingCount;
      const elNeg = document.getElementById('dgKpiNegative');
      if (elNeg) elNeg.textContent = negCount;

      const countEl = document.getElementById('dgRegisterCount');
      if (countEl) countEl.textContent = filtered.length;

      renderDengueTable(filtered);
    }

    function renderDengueTable(list) {
      const tbody = document.getElementById('tblDengueRegisterBody');
      if (!tbody) return;

      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:35px; color:#718096; font-size:13.5px;">कोणतीही नोंद सापडली नाही.</td></tr>';
        return;
      }

      let html = '';
      list.forEach((p, idx) => {
        const pDate = p.dateCollection ? p.dateCollection.split('-').reverse().join('-') : '-';
        const symptomsList = [];
        if (p.clinicalFever) symptomsList.push(`ताप: ${p.clinicalFever}d`);
        if (p.clinicalHeadache) symptomsList.push(`डोके: ${p.clinicalHeadache}d`);
        if (p.clinicalBodyache) symptomsList.push(`अंग: ${p.clinicalBodyache}d`);
        if (p.clinicalJointPain) symptomsList.push(`सांधे: ${p.clinicalJointPain}d`);
        const symStr = symptomsList.length > 0 ? symptomsList.join(', ') : 'Fever: 1d';

        // Dengue Result badge & meta
        const dRes = p.dengueResult || 'Pending';
        let dBadge = '';
        if (dRes === 'Positive') {
          dBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#fed7d7; color:#9b2c2c; border:1px solid #feb2b2;">🔴 Positive</span>';
        } else if (dRes === 'Negative') {
          dBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#c6f6d5; color:#22543d; border:1px solid #9ae6b4;">🟢 Negative</span>';
        } else if (dRes === 'Equivocal') {
          dBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#feebc8; color:#7b341e; border:1px solid #fbd38d;">🟠 Equivocal</span>';
        } else {
          dBadge = '<span style="display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:12px; background:#edf2f7; color:#4a5568; border:1px solid #e2e8f0;">⏳ Pending</span>';
        }

        let dMeta = '';
        if (p.dengueReportRef || p.dengueReportDate) {
          const dDateFmt = p.dengueReportDate ? p.dengueReportDate.split('-').reverse().join('-') : '';
          dMeta = `<div style="font-size:11px; color:#4a5568; margin-top:2px;">
            ${p.dengueReportRef ? `<span title="Report Ref">Ref: <b>${p.dengueReportRef}</b></span><br>` : ''}
            ${dDateFmt ? `<span style="color:#718096;">📅 ${dDateFmt}</span>` : ''}
          </div>`;
        }
        let dFileBtn = '';
        if (p.dengueReportFile) {
          dFileBtn = `<button type="button" class="sheet-btn" style="padding:2px 6px; font-size:10.5px; margin-top:3px; background:#ebf8ff; color:#2b6cb0; border-color:#bee3f8;" onclick="viewDengueReportFile('${p.id}', 'dengue')">📎 अहवाल प्रत</button>`;
        }

        // Chikungunya Result badge & meta
        const cRes = p.chikungunyaResult || 'Pending';
        let cBadge = '';
        if (cRes === 'Positive') {
          cBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#fed7d7; color:#9b2c2c; border:1px solid #feb2b2;">🔴 Positive</span>';
        } else if (cRes === 'Negative') {
          cBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#c6f6d5; color:#22543d; border:1px solid #9ae6b4;">🟢 Negative</span>';
        } else if (cRes === 'Equivocal') {
          cBadge = '<span style="display:inline-block; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px; background:#feebc8; color:#7b341e; border:1px solid #fbd38d;">🟠 Equivocal</span>';
        } else {
          cBadge = '<span style="display:inline-block; font-size:11px; font-weight:600; padding:2px 8px; border-radius:12px; background:#edf2f7; color:#4a5568; border:1px solid #e2e8f0;">⏳ Pending</span>';
        }

        let cMeta = '';
        if (p.chikungunyaReportRef || p.chikungunyaReportDate) {
          const cDateFmt = p.chikungunyaReportDate ? p.chikungunyaReportDate.split('-').reverse().join('-') : '';
          cMeta = `<div style="font-size:11px; color:#4a5568; margin-top:2px;">
            ${p.chikungunyaReportRef ? `<span title="Report Ref">Ref: <b>${p.chikungunyaReportRef}</b></span><br>` : ''}
            ${cDateFmt ? `<span style="color:#718096;">📅 ${cDateFmt}</span>` : ''}
          </div>`;
        }
        let cFileBtn = '';
        if (p.chikungunyaReportFile) {
          cFileBtn = `<button type="button" class="sheet-btn" style="padding:2px 6px; font-size:10.5px; margin-top:3px; background:#ebf8ff; color:#2b6cb0; border-color:#bee3f8;" onclick="viewDengueReportFile('${p.id}', 'chikungunya')">📎 अहवाल प्रत</button>`;
        }

        html += `
          <tr>
            <td style="text-align:center;"><input type="checkbox" class="dg-row-cb" value="${p.id}"></td>
            <td style="text-align:center; font-weight:700;">${idx + 1}</td>
            <td style="font-weight:700; color:#2b6cb0;">${p.patientRegNo || '-'}</td>
            <td class="text-left" style="font-weight:700; text-transform:uppercase;">
              ${p.patientName}
              <div style="font-size:11.5px; color:#718096; text-transform:none; font-weight:500;">
                📱 ${p.mobile && p.mobile !== '-' ? p.mobile : 'नाही'} | घर क्र: ${p.houseNo || '-'}
              </div>
            </td>
            <td style="font-weight:600; color:#2d3748;">${p.village || '-'}</td>
            <td style="text-align:center;">${p.age || '-'} / ${p.sex === 'FEMALE' ? 'स्त्री' : 'पुरुष'}</td>
            <td style="text-align:center; font-weight:600;">${pDate}</td>
            <td style="text-align:center;">
              ${dBadge}
              ${dMeta}
              ${dFileBtn}
            </td>
            <td style="text-align:center;">
              ${cBadge}
              ${cMeta}
              ${cFileBtn}
            </td>
            <td>
              <div style="font-size:12px; color:#4a5568;">${symStr}</div>
              <span style="font-size:11px; font-weight:700; color:${p.haemorrhagic === 'Yes' ? '#e53e3e' : '#38a169'};">
                ${p.haemorrhagic === 'Yes' ? '⚠️ रक्तस्राव: होय' : 'रक्तस्राव: नाही'}
              </span>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="sheet-btn" style="padding:4px 8px; font-size:11.5px; background:#ebf8ff; color:#2b6cb0; border-color:#bee3f8; font-weight:700;" onclick="openLabReportModal('${p.id}')" title="प्रयोगशाळा अहवाल नोंदवा / अपडेट करा">
                🔬 अहवाल अपडेट
              </button>
              <button type="button" class="sheet-btn" style="padding:4px 7px; font-size:11.5px; background:#fffaf0; color:#c05621; border-color:#fbd38d;" onclick="printSingleNivSheet('${p.id}')" title="NIV केस शीट प्रिंट करा">
                📄
              </button>
              <button type="button" class="sheet-btn" style="padding:4px 7px; font-size:11.5px; background:#fffaf0; color:#744210; border-color:#ecc94b;" onclick="editDengueRecord('${p.id}')" title="नोंद संपादन">
                ✏️
              </button>
              <button type="button" class="sheet-btn" style="padding:4px 7px; font-size:11.5px; background:#fff5f5; color:#e53e3e; border-color:#feb2b2;" onclick="deleteDengueRecord('${p.id}')" title="हटवा">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    }\n\n    """
    text = text[:old_filter_fn_start] + new_filter_and_render_code + text[old_filter_fn_end:]
    print("Updated filterDengueTable and renderDengueTable with lab report display!")

# 2. Add New Functions: openLabReportModal, closeLabReportModal, etc.
functions_to_add = """
    // ================= DENGUE & CHIKUNGUNYA LAB REPORT MODAL LOGIC =================
    let mModalDengueFileBase64 = null;
    let mModalDengueFileName = null;
    let mModalChikFileBase64 = null;
    let mModalChikFileName = null;

    function openLabReportModal(patientId, targetDisease = 'both') {
      const rec = mDengueData.find(e => e.id === patientId);
      if (!rec) {
        showToast('⚠️ रुग्ण नोंद सापडली नाही.');
        return;
      }

      document.getElementById('dgModalPatientId').value = rec.id;
      document.getElementById('dgModalPatientName').textContent = rec.patientName || '-';
      document.getElementById('dgModalRegNo').textContent = rec.patientRegNo || '-';
      document.getElementById('dgModalVillage').textContent = `${rec.village || '-'} (${rec.subcenter || 'भादा'})`;
      document.getElementById('dgModalAgeSex').textContent = `${rec.age || '-'} / ${rec.sex || '-'}`;
      document.getElementById('dgModalCollDate').textContent = rec.dateCollection ? rec.dateCollection.split('-').reverse().join('-') : '-';
      document.getElementById('dgModalOutwardNo').textContent = rec.outwardNo || '-';

      const todayStr = new Date().toISOString().slice(0, 10);

      // Populate Dengue section
      document.getElementById('dgModalDengueResult').value = rec.dengueResult || 'Pending';
      document.getElementById('dgModalDengueTestType').value = rec.dengueTestType || 'NS1 Ag ELISA';
      document.getElementById('dgModalDengueReportDate').value = rec.dengueReportDate || todayStr;
      document.getElementById('dgModalDengueReportRef').value = rec.dengueReportRef || '';
      document.getElementById('dgModalDengueRemarks').value = rec.dengueRemarks || '';
      mModalDengueFileBase64 = rec.dengueReportFile || null;
      mModalDengueFileName = rec.dengueReportFileName || null;
      updateFileStatusDisplay('dengue');

      // Populate Chikungunya section
      document.getElementById('dgModalChikResult').value = rec.chikungunyaResult || 'Pending';
      document.getElementById('dgModalChikTestType').value = rec.chikungunyaTestType || 'Chikungunya IgM ELISA';
      document.getElementById('dgModalChikReportDate').value = rec.chikungunyaReportDate || todayStr;
      document.getElementById('dgModalChikReportRef').value = rec.chikungunyaReportRef || '';
      document.getElementById('dgModalChikRemarks').value = rec.chikungunyaRemarks || '';
      mModalChikFileBase64 = rec.chikungunyaReportFile || null;
      mModalChikFileName = rec.chikungunyaReportFileName || null;
      updateFileStatusDisplay('chikungunya');

      // Update Badges
      updateModalStatusBadges();

      // Set Disease Tab
      switchReportDiseaseTab(targetDisease);

      const msg = document.getElementById('dgModalSaveMsg');
      if (msg) msg.textContent = '';

      const modal = document.getElementById('dengueLabReportModal');
      if (modal) modal.style.display = 'flex';
    }

    function closeLabReportModal() {
      const modal = document.getElementById('dengueLabReportModal');
      if (modal) modal.style.display = 'none';
      mModalDengueFileBase64 = null;
      mModalDengueFileName = null;
      mModalChikFileBase64 = null;
      mModalChikFileName = null;
      const f1 = document.getElementById('dgModalDengueFile');
      if (f1) f1.value = '';
      const f2 = document.getElementById('dgModalChikFile');
      if (f2) f2.value = '';
    }

    function switchReportDiseaseTab(disease) {
      document.getElementById('dgModalActiveDisease').value = disease;

      const secDengue = document.getElementById('sectionDengueReport');
      const secChik = document.getElementById('sectionChikReport');

      const btnBoth = document.getElementById('btnDiseaseBoth');
      const btnDengue = document.getElementById('btnDiseaseDengue');
      const btnChik = document.getElementById('btnDiseaseChik');

      [btnBoth, btnDengue, btnChik].forEach(b => {
        if (b) {
          b.style.background = '#edf2f7';
          b.style.color = '#4a5568';
        }
      });

      if (disease === 'both') {
        if (btnBoth) { btnBoth.style.background = '#3182ce'; btnBoth.style.color = '#fff'; }
        if (secDengue) secDengue.style.display = 'block';
        if (secChik) secChik.style.display = 'block';
      } else if (disease === 'dengue') {
        if (btnDengue) { btnDengue.style.background = '#dd6b20'; btnDengue.style.color = '#fff'; }
        if (secDengue) secDengue.style.display = 'block';
        if (secChik) secChik.style.display = 'none';
      } else if (disease === 'chikungunya') {
        if (btnChik) { btnChik.style.background = '#dd6b20'; btnChik.style.color = '#fff'; }
        if (secDengue) secDengue.style.display = 'none';
        if (secChik) secChik.style.display = 'block';
      }
    }

    function updateModalStatusBadges() {
      const dVal = document.getElementById('dgModalDengueResult')?.value || 'Pending';
      const cVal = document.getElementById('dgModalChikResult')?.value || 'Pending';

      const dBadge = document.getElementById('badgeDengueCurrentStatus');
      if (dBadge) {
        dBadge.textContent = dVal;
        if (dVal === 'Positive') { dBadge.style.background = '#fed7d7'; dBadge.style.color = '#9b2c2c'; }
        else if (dVal === 'Negative') { dBadge.style.background = '#c6f6d5'; dBadge.style.color = '#22543d'; }
        else if (dVal === 'Equivocal') { dBadge.style.background = '#feebc8'; dBadge.style.color = '#7b341e'; }
        else { dBadge.style.background = '#edf2f7'; dBadge.style.color = '#4a5568'; }
      }

      const cBadge = document.getElementById('badgeChikCurrentStatus');
      if (cBadge) {
        cBadge.textContent = cVal;
        if (cVal === 'Positive') { cBadge.style.background = '#fed7d7'; cBadge.style.color = '#9b2c2c'; }
        else if (cVal === 'Negative') { cBadge.style.background = '#c6f6d5'; cBadge.style.color = '#22543d'; }
        else if (cVal === 'Equivocal') { cBadge.style.background = '#feebc8'; cBadge.style.color = '#7b341e'; }
        else { cBadge.style.background = '#edf2f7'; cBadge.style.color = '#4a5568'; }
      }
    }

    function handleModalFileUpload(event, disease) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (file.size > 15 * 1024 * 1024) {
        alert('⚠️ फाईल साईझ खूप मोठी आहे (जास्तीत जास्त १५ MB अनुज्ञेय आहे).');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        if (disease === 'dengue') {
          mModalDengueFileBase64 = e.target.result;
          mModalDengueFileName = file.name;
          updateFileStatusDisplay('dengue');
        } else {
          mModalChikFileBase64 = e.target.result;
          mModalChikFileName = file.name;
          updateFileStatusDisplay('chikungunya');
        }
      };
      reader.readAsDataURL(file);
    }

    function updateFileStatusDisplay(disease) {
      const el = document.getElementById(disease === 'dengue' ? 'dgModalDengueFileStatus' : 'dgModalChikFileStatus');
      const fileData = disease === 'dengue' ? mModalDengueFileBase64 : mModalChikFileBase64;
      const fileName = disease === 'dengue' ? mModalDengueFileName : mModalChikFileName;

      if (!el) return;
      if (fileData) {
        el.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; background:#f0fff4; border:1px solid #9ae6b4; padding:4px 8px; border-radius:6px; margin-top:3px;">
            <span style="color:#276749; font-weight:600;">📎 फाईल जोडलेली आहे: ${fileName || 'Report File'}</span>
            <button type="button" class="sheet-btn" style="padding:2px 6px; font-size:11px; background:#e2e8f0; color:#4a5568;" onclick="removeModalFile('${disease}')">काढून टाका</button>
          </div>
        `;
      } else {
        el.innerHTML = '<span style="color:#a0aec0; font-size:11px;">कोणतीही फाईल निवडलेली नाही (PDF / JPG / PNG).</span>';
      }
    }

    function removeModalFile(disease) {
      if (disease === 'dengue') {
        mModalDengueFileBase64 = null;
        mModalDengueFileName = null;
        const f1 = document.getElementById('dgModalDengueFile');
        if (f1) f1.value = '';
        updateFileStatusDisplay('dengue');
      } else {
        mModalChikFileBase64 = null;
        mModalChikFileName = null;
        const f2 = document.getElementById('dgModalChikFile');
        if (f2) f2.value = '';
        updateFileStatusDisplay('chikungunya');
      }
    }

    function saveLabReportModal() {
      const patientId = document.getElementById('dgModalPatientId').value;
      if (!patientId) {
        showToast('⚠️ रुग्ण आयडी आढळला नाही.');
        return;
      }

      const activeDisease = document.getElementById('dgModalActiveDisease').value || 'both';

      const payload = {
        id: patientId,
        targetDisease: activeDisease,
        dengueResult: document.getElementById('dgModalDengueResult')?.value || 'Pending',
        dengueReportRef: document.getElementById('dgModalDengueReportRef')?.value || '',
        dengueReportDate: document.getElementById('dgModalDengueReportDate')?.value || '',
        dengueTestType: document.getElementById('dgModalDengueTestType')?.value || 'NS1 Ag ELISA',
        dengueRemarks: document.getElementById('dgModalDengueRemarks')?.value || '',
        dengueReportFile: mModalDengueFileBase64 || '',
        dengueReportFileName: mModalDengueFileName || '',
        chikungunyaResult: document.getElementById('dgModalChikResult')?.value || 'Pending',
        chikungunyaReportRef: document.getElementById('dgModalChikReportRef')?.value || '',
        chikungunyaReportDate: document.getElementById('dgModalChikReportDate')?.value || '',
        chikungunyaTestType: document.getElementById('dgModalChikTestType')?.value || 'Chikungunya IgM ELISA',
        chikungunyaRemarks: document.getElementById('dgModalChikRemarks')?.value || '',
        chikungunyaReportFile: mModalChikFileBase64 || '',
        chikungunyaReportFileName: mModalChikFileName || ''
      };

      const btnSave = document.getElementById('btnSaveLabReportModal');
      const msgEl = document.getElementById('dgModalSaveMsg');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = '⏳ सेव्ह होत आहे...';
      }
      if (msgEl) msgEl.textContent = 'प्रयोगशाळा अहवाल नोंदविला जात आहे...';

      google.script.run
        .withSuccessHandler(res => {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = '💾 अहवाल सेव्ह करा (Save Report)';
          }
          if (res && res.success) {
            showToast('✅ ' + (res.message || 'प्रयोगशाळा अहवाल यशस्वीरित्या अपडेट केला!'));
            closeLabReportModal();
            loadDengueData();
          } else {
            if (msgEl) msgEl.textContent = '⚠️ ' + ((res && res.message) || 'त्रुटी आली.');
          }
        })
        .withFailureHandler(err => {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = '💾 अहवाल सेव्ह करा (Save Report)';
          }
          if (msgEl) msgEl.textContent = '⚠️ ' + err.message;
        })
        .updateDengueLabReport(payload);
    }

    function viewDengueReportFile(patientId, disease) {
      const rec = mDengueData.find(e => e.id === patientId);
      if (!rec) {
        showToast('⚠️ रुग्ण नोंद सापडली नाही.');
        return;
      }

      const fileData = disease === 'dengue' ? rec.dengueReportFile : rec.chikungunyaReportFile;
      const fileName = (disease === 'dengue' ? rec.dengueReportFileName : rec.chikungunyaReportFileName) || `${rec.patientName}_${disease}_report`;

      if (!fileData) {
        showToast('⚠️ या रुग्णासाठी कोणतीही फाईल अपलोड केलेली नाही.');
        return;
      }

      const titleEl = document.getElementById('dgFileViewerTitle');
      const subEl = document.getElementById('dgFileViewerSubtitle');
      const contentEl = document.getElementById('dgFileViewerContent');
      const downloadBtn = document.getElementById('dgFileViewerDownloadBtn');

      if (titleEl) titleEl.textContent = `${disease === 'dengue' ? 'डेंगी' : 'चिकनगुनिया'} तपासणी अहवाल - ${rec.patientName}`;
      if (subEl) subEl.textContent = `गाव: ${rec.village || '-'} | नमुना दिनांक: ${rec.dateCollection || '-'} | Ref: ${(disease === 'dengue' ? rec.dengueReportRef : rec.chikungunyaReportRef) || '-'}`;

      if (downloadBtn) {
        downloadBtn.href = fileData;
        downloadBtn.download = fileName;
      }

      if (contentEl) {
        if (fileData.startsWith('data:application/pdf') || fileData.endsWith('.pdf')) {
          contentEl.innerHTML = `<iframe src="${fileData}" style="width:100%; height:550px; border:none; border-radius:6px;"></iframe>`;
        } else {
          contentEl.innerHTML = `<img src="${fileData}" alt="Report" style="max-width:100%; max-height:550px; object-fit:contain; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
        }
      }

      const modal = document.getElementById('dengueFileViewModal');
      if (modal) modal.style.display = 'flex';
    }

    function closeDengueFileViewModal() {
      const modal = document.getElementById('dengueFileViewModal');
      if (modal) modal.style.display = 'none';
      const contentEl = document.getElementById('dgFileViewerContent');
      if (contentEl) contentEl.innerHTML = '';
    }
"""

if 'function openLabReportModal(' not in text:
    insert_before = '    function exportDengueCsvClient() {'
    if insert_before in text:
        text = text.replace(insert_before, functions_to_add + '\n' + insert_before, 1)
        print("Injected lab report JavaScript functions into index.html!")

# 3. Update exportDengueCsvClient with new columns
old_csv_export = """      const headers = [
        'ID', 'Patient Name', 'Mobile', 'House No', 'Village',
        'Taluka', 'District', 'Hospital Address', 'Reg No', 'Ward No', 'Bed No',
        'Age', 'Sex', 'Onset Date', 'Sample Nature', 'Collection Date',
        'Fever Days', 'Headache Days', 'Bodyache Days', 'Joint Pain Days',
        'Retro Orbital Pain Days', 'Rash Days', 'Haemorrhagic', 'Doctor Name',
        'Doctor Mobile'
      ];
      const rows = mDengueData.map(e => [
        e.id, `"${(e.patientName || '').replace(/"/g, '""')}"`, e.mobile || '',
        e.houseNo || '', `"${(e.village || '').replace(/"/g, '""')}"`, e.taluka || 'AUSA',
        e.district || 'LATUR', `"${(e.hospitalAddress || '').replace(/"/g, '""')}"`,
        e.patientRegNo || '', e.wardNo || '', e.bedNo || '', e.age || 0, e.sex || '',
        e.dateOnset || '', e.sampleNature || 'Serum', e.dateCollection || '',
        e.clinicalFever ?? 1, e.clinicalHeadache ?? 0, e.clinicalBodyache ?? 0,
        e.clinicalJointPain ?? 0, e.clinicalRetroOrbitalPain ?? 0, e.clinicalRash ?? 0,
        e.haemorrhagic || 'No', `"${(e.doctorName || '').replace(/"/g, '""')}"`, e.doctorMobile || ''
      ]);"""

new_csv_export = """      const headers = [
        'ID', 'Patient Name', 'Mobile', 'House No', 'Village',
        'Taluka', 'District', 'Hospital Address', 'Reg No', 'Ward No', 'Bed No',
        'Age', 'Sex', 'Onset Date', 'Sample Nature', 'Collection Date',
        'Fever Days', 'Headache Days', 'Bodyache Days', 'Joint Pain Days',
        'Retro Orbital Pain Days', 'Rash Days', 'Haemorrhagic', 'Doctor Name',
        'Doctor Mobile', 'Dengue Result', 'Dengue Test Type', 'Dengue Report Ref',
        'Dengue Report Date', 'Chikungunya Result', 'Chikungunya Test Type',
        'Chikungunya Report Ref', 'Chikungunya Report Date', 'Overall Status'
      ];
      const rows = mDengueData.map(e => [
        e.id, `"${(e.patientName || '').replace(/"/g, '""')}"`, e.mobile || '',
        e.houseNo || '', `"${(e.village || '').replace(/"/g, '""')}"`, e.taluka || 'AUSA',
        e.district || 'LATUR', `"${(e.hospitalAddress || '').replace(/"/g, '""')}"`,
        e.patientRegNo || '', e.wardNo || '', e.bedNo || '', e.age || 0, e.sex || '',
        e.dateOnset || '', e.sampleNature || 'Serum', e.dateCollection || '',
        e.clinicalFever ?? 1, e.clinicalHeadache ?? 0, e.clinicalBodyache ?? 0,
        e.clinicalJointPain ?? 0, e.clinicalRetroOrbitalPain ?? 0, e.clinicalRash ?? 0,
        e.haemorrhagic || 'No', `"${(e.doctorName || '').replace(/"/g, '""')}"`, e.doctorMobile || '',
        e.dengueResult || 'Pending', `"${(e.dengueTestType || '').replace(/"/g, '""')}"`,
        `"${(e.dengueReportRef || '').replace(/"/g, '""')}"`, e.dengueReportDate || '',
        e.chikungunyaResult || 'Pending', `"${(e.chikungunyaTestType || '').replace(/"/g, '""')}"`,
        `"${(e.chikungunyaReportRef || '').replace(/"/g, '""')}"`, e.chikungunyaReportDate || '',
        `"${(e.testResult || 'Pending').replace(/"/g, '""')}"`
      ]);"""

if old_csv_export in text:
    text = text.replace(old_csv_export, new_csv_export, 1)
    print("Updated client-side CSV export headers and rows!")

# Write updated text back to index.html
with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectDengueLabReportJS.py successfully!")
