with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update switchDengueSubtab
old_switch = """function switchDengueSubtab(subtab) {
      document.querySelectorAll('#dengueTab .subtab-btn').forEach(b => b.classList.remove('active'));
      const panes = ['subpaneDengueEntry', 'subpaneDengueRegister', 'subpaneDengueLetter', 'subpaneDengueSheets'];
      panes.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = 'none';
      });

      if (subtab === 'entry') {
        document.getElementById('dengueSubtabBtnEntry')?.classList.add('active');
        document.getElementById('subpaneDengueEntry').style.display = 'block';
      } else if (subtab === 'register') {"""

new_switch = """function switchDengueSubtab(subtab) {
      document.querySelectorAll('#dengueTab .subtab-btn').forEach(b => b.classList.remove('active'));
      const panes = ['subpaneDengueEntry', 'subpaneDengueBatch', 'subpaneDengueRegister', 'subpaneDengueLetter', 'subpaneDengueSheets'];
      panes.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = 'none';
      });

      if (subtab === 'entry') {
        document.getElementById('dengueSubtabBtnEntry')?.classList.add('active');
        document.getElementById('subpaneDengueEntry').style.display = 'block';
      } else if (subtab === 'batch') {
        document.getElementById('dengueSubtabBtnBatch')?.classList.add('active');
        document.getElementById('subpaneDengueBatch').style.display = 'block';
        populateBatchDateSelector();
        loadBatchDatePatients();
      } else if (subtab === 'register') {"""

if 'subpaneDengueBatch' not in text and old_switch in text:
    text = text.replace(old_switch, new_switch, 1)
    print("Updated switchDengueSubtab function!")

# 2. Add Batch JS Functions
batch_js = """
    // ================= DENGUE & CHIKUNGUNYA DATE-WISE / BATCH LAB REPORT LOGIC =================
    let mBatchReportFileBase64 = null;
    let mBatchReportFileName = null;
    let mActiveBatchDisease = 'dengue'; // 'dengue', 'chikungunya', 'both'

    function switchBatchDiseaseTab(disease) {
      mActiveBatchDisease = disease;
      const bDengue = document.getElementById('btnBatchDiseaseDengue');
      const bChik = document.getElementById('btnBatchDiseaseChik');
      const bBoth = document.getElementById('btnBatchDiseaseBoth');

      [bDengue, bChik, bBoth].forEach(b => {
        if (b) {
          b.style.background = '#edf2f7';
          b.style.color = '#4a5568';
        }
      });

      if (disease === 'dengue') {
        if (bDengue) { bDengue.style.background = '#dd6b20'; bDengue.style.color = '#fff'; }
        document.getElementById('thBatchDengue')?.style.setProperty('display', 'table-cell');
        document.getElementById('thBatchChik')?.style.setProperty('display', 'none');
        document.querySelectorAll('.batch-col-dengue').forEach(c => c.style.display = 'table-cell');
        document.querySelectorAll('.batch-col-chik').forEach(c => c.style.display = 'none');
      } else if (disease === 'chikungunya') {
        if (bChik) { bChik.style.background = '#dd6b20'; bChik.style.color = '#fff'; }
        document.getElementById('thBatchDengue')?.style.setProperty('display', 'none');
        document.getElementById('thBatchChik')?.style.setProperty('display', 'table-cell');
        document.querySelectorAll('.batch-col-dengue').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.batch-col-chik').forEach(c => c.style.display = 'table-cell');
      } else {
        if (bBoth) { bBoth.style.background = '#3182ce'; bBoth.style.color = '#fff'; }
        document.getElementById('thBatchDengue')?.style.setProperty('display', 'table-cell');
        document.getElementById('thBatchChik')?.style.setProperty('display', 'table-cell');
        document.querySelectorAll('.batch-col-dengue').forEach(c => c.style.display = 'table-cell');
        document.querySelectorAll('.batch-col-chik').forEach(c => c.style.display = 'table-cell');
      }
    }

    function populateBatchDateSelector() {
      const select = document.getElementById('dgBatchSelectDate');
      if (!select) return;

      const currentVal = select.value;
      const dates = Array.from(new Set(mDengueData.map(e => e.dateCollection).filter(Boolean))).sort().reverse();

      select.innerHTML = '<option value="">-- नमुना पाठवल्याचा दिनांक निवडा --</option>';
      dates.forEach(d => {
        const count = mDengueData.filter(e => e.dateCollection === d).length;
        const dFmt = d.split('-').reverse().join('-');
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `📅 दिनांक: ${dFmt} (एकूण ${count} सिरम नमुने पाठवले)`;
        select.appendChild(opt);
      });

      if (currentVal && dates.includes(currentVal)) {
        select.value = currentVal;
      } else if (dates.length > 0) {
        select.value = dates[0];
      }

      const recDate = document.getElementById('dgBatchReportDate');
      if (recDate && !recDate.value) {
        recDate.value = new Date().toISOString().slice(0, 10);
      }
    }

    function loadBatchDatePatients() {
      const selDate = document.getElementById('dgBatchSelectDate')?.value;
      const tbody = document.getElementById('tblDengueBatchBody');
      const countText = document.getElementById('dgBatchPatientCountText');
      if (!tbody) return;

      if (!selDate) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:35px; color:#718096; font-size:13.5px;">कृपया वरून नमुना पाठवल्याचा दिनांक निवडा.</td></tr>';
        if (countText) countText.textContent = '० रुग्ण';
        return;
      }

      const patients = mDengueData.filter(e => e.dateCollection === selDate);
      if (countText) countText.textContent = `${patients.length} रुग्ण`;

      if (patients.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:35px; color:#718096; font-size:13.5px;">दिनांक ${selDate.split('-').reverse().join('-')} साठी कोणतेही नमुने सापडले नाहीत.</td></tr>`;
        return;
      }

      // Pre-fill existing reference number and date if any patient in the batch already has it
      const existingRef = patients.find(p => p.dengueReportRef || p.chikungunyaReportRef);
      if (existingRef) {
        const refField = document.getElementById('dgBatchReportRef');
        if (refField && !refField.value) {
          refField.value = existingRef.dengueReportRef || existingRef.chikungunyaReportRef || '';
        }
        const dateField = document.getElementById('dgBatchReportDate');
        if (dateField && (!dateField.value || dateField.value === new Date().toISOString().slice(0, 10))) {
          if (existingRef.dengueReportDate) dateField.value = existingRef.dengueReportDate;
          else if (existingRef.chikungunyaReportDate) dateField.value = existingRef.chikungunyaReportDate;
        }
        if (existingRef.dengueReportFile && !mBatchReportFileBase64) {
          mBatchReportFileBase64 = existingRef.dengueReportFile;
          mBatchReportFileName = existingRef.dengueReportFileName;
          updateBatchFileStatusDisplay();
        }
      }

      let html = '';
      patients.forEach((p, idx) => {
        const dRes = p.dengueResult || 'Pending';
        const cRes = p.chikungunyaResult || 'Pending';

        html += `
          <tr data-patient-id="${p.id}">
            <td style="text-align:center; font-weight:700;">${idx + 1}</td>
            <td class="text-left" style="font-weight:700; text-transform:uppercase;">
              ${p.patientName}
              <div style="font-size:11.5px; color:#718096; font-weight:500; text-transform:none;">
                नोंदणी: <b>${p.patientRegNo || '-'}</b> | 📱 ${p.mobile && p.mobile !== '-' ? p.mobile : 'नाही'}
              </div>
            </td>
            <td style="font-weight:600; color:#2d3748;">${p.village || '-'}</td>
            <td style="text-align:center;">${p.age || '-'} / ${p.sex === 'FEMALE' ? 'स्त्री' : 'पुरुष'}</td>
            <td class="batch-col-dengue" style="text-align:center;">
              <select class="form-control batch-dengue-res" style="font-weight:700; font-size:12px; padding:4px 8px; border-color:#cbd5e0;">
                <option value="Pending" ${dRes === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="Positive" ${dRes === 'Positive' ? 'selected' : ''} style="color:#c53030; font-weight:700;">🔴 Positive</option>
                <option value="Negative" ${dRes === 'Negative' ? 'selected' : ''} style="color:#276749; font-weight:700;">🟢 Negative</option>
                <option value="Equivocal" ${dRes === 'Equivocal' ? 'selected' : ''} style="color:#c05621; font-weight:700;">🟠 Equivocal</option>
              </select>
            </td>
            <td class="batch-col-chik" style="text-align:center;">
              <select class="form-control batch-chik-res" style="font-weight:700; font-size:12px; padding:4px 8px; border-color:#cbd5e0;">
                <option value="Pending" ${cRes === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="Positive" ${cRes === 'Positive' ? 'selected' : ''} style="color:#c53030; font-weight:700;">🔴 Positive</option>
                <option value="Negative" ${cRes === 'Negative' ? 'selected' : ''} style="color:#276749; font-weight:700;">🟢 Negative</option>
                <option value="Equivocal" ${cRes === 'Equivocal' ? 'selected' : ''} style="color:#c05621; font-weight:700;">🟠 Equivocal</option>
              </select>
            </td>
            <td>
              <input type="text" class="form-control batch-remarks" placeholder="शेरा (ऐच्छिक)" value="${p.dengueRemarks || p.chikungunyaRemarks || ''}" style="font-size:12px; padding:4px 8px;">
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
      switchBatchDiseaseTab(mActiveBatchDisease);
    }

    function setBatchBulkResult(resultVal) {
      if (mActiveBatchDisease === 'dengue' || mActiveBatchDisease === 'both') {
        document.querySelectorAll('.batch-dengue-res').forEach(sel => sel.value = resultVal);
      }
      if (mActiveBatchDisease === 'chikungunya' || mActiveBatchDisease === 'both') {
        document.querySelectorAll('.batch-chik-res').forEach(sel => sel.value = resultVal);
      }
      showToast(`सर्व रुग्णांचे निकाल ${resultVal === 'Negative' ? '🟢 Negative' : resultVal === 'Positive' ? '🔴 Positive' : '⏳ Pending'} केले.`);
    }

    function handleBatchFileUpload(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (file.size > 15 * 1024 * 1024) {
        alert('⚠️ फाईल साईझ खूप मोठी आहे (जास्तीत जास्त १५ MB अनुज्ञेय आहे).');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        mBatchReportFileBase64 = e.target.result;
        mBatchReportFileName = file.name;
        updateBatchFileStatusDisplay();
      };
      reader.readAsDataURL(file);
    }

    function updateBatchFileStatusDisplay() {
      const statusEl = document.getElementById('dgBatchFilePreviewStatus');
      const clearBtn = document.getElementById('btnBatchFileClear');

      if (!statusEl) return;
      if (mBatchReportFileBase64) {
        statusEl.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; background:#f0fff4; border:1px solid #9ae6b4; padding:6px 10px; border-radius:6px; margin-top:5px;">
            <span style="color:#276749; font-weight:700;">✅ GMC एकत्रित अहवाल पत्र जोडले: ${mBatchReportFileName || 'Consolidated Report'}</span>
            <button type="button" class="sheet-btn" style="padding:2px 8px; font-size:11px; background:#ebf8ff; color:#2b6cb0; border-color:#bee3f8;" onclick="viewBatchUploadedFile()">👁️ फाईल पाहा</button>
          </div>
        `;
        if (clearBtn) clearBtn.style.display = 'inline-block';
      } else {
        statusEl.innerHTML = '<span style="color:#a0aec0; font-size:11.5px;">GMC चे एकत्रित पत्र किंवा यादी स्कॅन प्रत जोडा (PDF / JPG / PNG).</span>';
        if (clearBtn) clearBtn.style.display = 'none';
      }
    }

    function removeBatchFile() {
      mBatchReportFileBase64 = null;
      mBatchReportFileName = null;
      const f = document.getElementById('dgBatchReportFile');
      if (f) f.value = '';
      updateBatchFileStatusDisplay();
    }

    function viewBatchUploadedFile() {
      if (!mBatchReportFileBase64) return;
      const titleEl = document.getElementById('dgFileViewerTitle');
      const subEl = document.getElementById('dgFileViewerSubtitle');
      const contentEl = document.getElementById('dgFileViewerContent');
      const downloadBtn = document.getElementById('dgFileViewerDownloadBtn');

      if (titleEl) titleEl.textContent = 'GMC लातूर एकत्रित प्रयोगशाळा अहवाल पत्र';
      if (subEl) subEl.textContent = `संदर्भ क्र: ${document.getElementById('dgBatchReportRef')?.value || '-'} | फाईल: ${mBatchReportFileName || '-'}`;

      if (downloadBtn) {
        downloadBtn.href = mBatchReportFileBase64;
        downloadBtn.download = mBatchReportFileName || 'GMC_Consolidated_Report.pdf';
      }

      if (contentEl) {
        if (mBatchReportFileBase64.startsWith('data:application/pdf') || (mBatchReportFileName && mBatchReportFileName.endsWith('.pdf'))) {
          contentEl.innerHTML = `<iframe src="${mBatchReportFileBase64}" style="width:100%; height:550px; border:none; border-radius:6px;"></iframe>`;
        } else {
          contentEl.innerHTML = `<img src="${mBatchReportFileBase64}" alt="Consolidated Report" style="max-width:100%; max-height:550px; object-fit:contain; border-radius:6px;">`;
        }
      }

      const modal = document.getElementById('dengueFileViewModal');
      if (modal) modal.style.display = 'flex';
    }

    function saveBatchLabReport() {
      const selDate = document.getElementById('dgBatchSelectDate')?.value;
      if (!selDate) {
        alert('⚠️ कृपया प्रथम नमुना पाठवल्याचा दिनांक निवडा.');
        return;
      }

      const reportRefNo = (document.getElementById('dgBatchReportRef')?.value || '').trim();
      const reportDate = document.getElementById('dgBatchReportDate')?.value || '';
      const testType = document.getElementById('dgBatchTestType')?.value || 'NS1 Ag & IgM ELISA';
      const commonRemarks = (document.getElementById('dgBatchRemarks')?.value || '').trim();

      if (!reportRefNo) {
        alert('⚠️ कृपया GMC प्रयोगशाळा अहवाल संदर्भ क्रमांक (Report Ref No.) भरा.');
        document.getElementById('dgBatchReportRef')?.focus();
        return;
      }
      if (!reportDate) {
        alert('⚠️ कृपया अहवाल प्राप्त दिनांक निवडा.');
        document.getElementById('dgBatchReportDate')?.focus();
        return;
      }

      // Collect rows
      const rows = document.querySelectorAll('#tblDengueBatchBody tr[data-patient-id]');
      if (rows.length === 0) {
        alert('⚠️ या दिनांकासाठी कोणताही रुग्ण आढळला नाही.');
        return;
      }

      const patientResults = [];
      rows.forEach(r => {
        const id = r.getAttribute('data-patient-id');
        const dengueRes = r.querySelector('.batch-dengue-res')?.value || 'Pending';
        const chikRes = r.querySelector('.batch-chik-res')?.value || 'Pending';
        const rem = (r.querySelector('.batch-remarks')?.value || '').trim();

        patientResults.push({
          id: id,
          dengueResult: dengueRes,
          chikungunyaResult: chikRes,
          remarks: rem
        });
      });

      const payload = {
        dateCollection: selDate,
        targetDisease: mActiveBatchDisease,
        reportRefNo: reportRefNo,
        reportReceivedDate: reportDate,
        testType: testType,
        reportFile: mBatchReportFileBase64 || '',
        reportFileName: mBatchReportFileName || '',
        commonRemarks: commonRemarks,
        patientResults: patientResults
      };

      const btnSave = document.getElementById('btnSaveBatchReport');
      const statusMsg = document.getElementById('dgBatchSaveStatusMsg');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = '⏳ अहवाल सेव्ह होत आहेत...';
      }
      if (statusMsg) statusMsg.textContent = 'सर्व रुग्णांचे अहवाल सेव्ह होत आहेत, कृपया थांबा...';

      google.script.run
        .withSuccessHandler(res => {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = '💾 संपूर्ण बॅचचा एकत्रित अहवाल सेव्ह करा (Save Complete Batch Report)';
          }
          if (res && res.success) {
            showToast('✅ ' + (res.message || 'एकत्रित अहवाल यशस्वीरित्या सेव्ह झाला!'));
            if (statusMsg) statusMsg.textContent = '✅ ' + (res.message || 'यशस्वीरित्या सेव्ह झाले.');
            loadDengueData();
            setTimeout(() => {
              switchDengueSubtab('register');
            }, 1200);
          } else {
            alert('⚠️ ' + ((res && res.message) || 'अहवाल जतन करताना त्रुटी आली.'));
            if (statusMsg) statusMsg.textContent = '⚠️ ' + ((res && res.message) || 'त्रुटी आली.');
          }
        })
        .withFailureHandler(err => {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = '💾 संपूर्ण बॅचचा एकत्रित अहवाल सेव्ह करा (Save Complete Batch Report)';
          }
          alert('⚠️ त्रुटी: ' + err.message);
          if (statusMsg) statusMsg.textContent = '⚠️ ' + err.message;
        })
        .saveDengueBatchLabReport(payload);
    }
"""

if 'function switchBatchDiseaseTab(' not in text:
    target_pos = '    function exportDengueCsvClient() {'
    if target_pos in text:
        text = text.replace(target_pos, batch_js + '\n' + target_pos, 1)
        print("Injected batch lab report JS functions into index.html!")

# 3. Add saveDengueBatchLabReport in executeClientSideRpc for offline fallback
old_client_rpc = "          case 'deleteDengueEntry': {"
batch_client_rpc = """          case 'saveDengueBatchLabReport': {
            const [batchData] = args;
            if (!batchData || !Array.isArray(batchData.patientResults)) {
              return { result: { success: false, message: 'डेटा उपलब्ध नाही.' } };
            }
            batchData.patientResults.forEach(item => {
              const exIdx = clientDengueEntries.findIndex(e => e.id === item.id);
              if (exIdx !== -1) {
                const rec = clientDengueEntries[exIdx];
                if (batchData.targetDisease === 'dengue' || batchData.targetDisease === 'both') {
                  if (item.dengueResult) rec.dengueResult = item.dengueResult;
                  if (batchData.reportRefNo) rec.dengueReportRef = batchData.reportRefNo;
                  if (batchData.reportReceivedDate) rec.dengueReportDate = batchData.reportReceivedDate;
                  if (batchData.testType) rec.dengueTestType = batchData.testType;
                  if (batchData.reportFile) {
                    rec.dengueReportFile = batchData.reportFile;
                    rec.dengueReportFileName = batchData.reportFileName;
                  }
                }
                if (batchData.targetDisease === 'chikungunya' || batchData.targetDisease === 'both') {
                  if (item.chikungunyaResult) rec.chikungunyaResult = item.chikungunyaResult;
                  if (batchData.reportRefNo) rec.chikungunyaReportRef = batchData.reportRefNo;
                  if (batchData.reportReceivedDate) rec.chikungunyaReportDate = batchData.reportReceivedDate;
                  if (batchData.testType) rec.chikungunyaTestType = batchData.testType;
                  if (batchData.reportFile) {
                    rec.chikungunyaReportFile = batchData.reportFile;
                    rec.chikungunyaReportFileName = batchData.reportFileName;
                  }
                }
                const dRes = rec.dengueResult || 'Pending';
                const cRes = rec.chikungunyaResult || 'Pending';
                if (dRes === 'Positive' || cRes === 'Positive') rec.testResult = `Positive (${dRes === 'Positive' ? 'Dengue' : ''}${cRes === 'Positive' ? ' Chik' : ''})`;
                else if (dRes === 'Negative' && cRes === 'Negative') rec.testResult = 'Negative';
                else rec.testResult = 'Pending';
                clientDengueEntries[exIdx] = rec;
              }
            });
            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
            return { result: { success: true, message: `एकूण ${batchData.patientResults.length} रुग्णांचे अहवाल सुरक्षित सेव्ह झाले.` } };
          }

          case 'deleteDengueEntry': {"""

if "case 'saveDengueBatchLabReport':" not in text and old_client_rpc in text:
    text = text.replace(old_client_rpc, batch_client_rpc, 1)
    print("Added saveDengueBatchLabReport to executeClientSideRpc!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectDengueBatchJS.py successfully!")
