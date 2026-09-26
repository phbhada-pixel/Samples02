with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update switchDengueSubtab
old_switch = """function switchDengueSubtab(subtab) {
      document.querySelectorAll('#dengueTab .subtab-btn').forEach(b => b.classList.remove('active'));
      const panes = ['subpaneDengueEntry', 'subpaneDengueBatch', 'subpaneDengueRegister', 'subpaneDengueLetter', 'subpaneDengueSheets'];
      panes.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = 'none';
      });

      if (subtab === 'entry') {
        document.getElementById('dengueSubtabBtnEntry')?.classList.add('active');
        const p = document.getElementById('subpaneDengueEntry');
        if (p) p.style.display = 'block';
      } else if (subtab === 'batch') {
        document.getElementById('dengueSubtabBtnBatch')?.classList.add('active');
        const p = document.getElementById('subpaneDengueBatch');
        if (p) p.style.display = 'block';
        populateBatchDateSelector();
        loadBatchDatePatients();
      } else if (subtab === 'register') {"""

new_switch = """function switchDengueSubtab(subtab) {
      document.querySelectorAll('#dengueTab .subtab-btn').forEach(b => b.classList.remove('active'));
      const panes = ['subpaneDengueEntry', 'subpaneDengueBatch', 'subpaneDengueUpload', 'subpaneDengueRegister', 'subpaneDengueLetter', 'subpaneDengueSheets'];
      panes.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = 'none';
      });

      if (subtab === 'entry') {
        document.getElementById('dengueSubtabBtnEntry')?.classList.add('active');
        const p = document.getElementById('subpaneDengueEntry');
        if (p) p.style.display = 'block';
      } else if (subtab === 'batch') {
        document.getElementById('dengueSubtabBtnBatch')?.classList.add('active');
        const p = document.getElementById('subpaneDengueBatch');
        if (p) p.style.display = 'block';
        populateBatchDateSelector();
        loadBatchDatePatients();
      } else if (subtab === 'upload') {
        document.getElementById('dengueSubtabBtnUpload')?.classList.add('active');
        const p = document.getElementById('subpaneDengueUpload');
        if (p) p.style.display = 'block';
      } else if (subtab === 'register') {"""

if 'subpaneDengueUpload' not in text and old_switch in text:
    text = text.replace(old_switch, new_switch, 1)
    print("Updated switchDengueSubtab to support upload subtab!")

# 2. Add Old Data Import JavaScript Functions
old_data_js = """
    // ================= DENGUE & CHIKUNGUNYA OLD DATA IMPORT LOGIC =================
    let mDengueRawCsvContent = '';

    function downloadDengueCsvTemplate() {
      const templateHeaders = [
        'नोंदणी क्र. (Reg No)',
        'रुग्णाचे नाव (Patient Name)',
        'गाव (Village)',
        'वय (Age)',
        'लिंग (Sex)',
        'मोबाईल (Mobile)',
        'घर क्र. (House No)',
        'नमुना दिनांक (Collection Date DD-MM-YYYY)',
        'लक्षणे सुरू दिनांक (Onset Date DD-MM-YYYY)',
        'ताप दिवस (Fever Days)',
        'डोकेदुखी (Headache Days)',
        'अंगदुखी (Bodyache Days)',
        'सांधेदुखी (Joint Pain Days)',
        'रक्तस्राव (Haemorrhagic Yes/No)',
        'डेंगी निष्कर्ष (Dengue Result: Positive/Negative/Equivocal/Pending)',
        'डेंगी चाचणी प्रकार (Dengue Test Type)',
        'डेंगी लॅब संदर्भ क्र. (Dengue Report Ref)',
        'डेंगी अहवाल दिनांक (Dengue Report Date DD-MM-YYYY)',
        'चिकनगुनिया निष्कर्ष (Chik Result: Positive/Negative/Equivocal/Pending)',
        'चिकनगुनिया चाचणी प्रकार (Chik Test Type)',
        'चिकनगुनिया लॅब संदर्भ क्र. (Chik Report Ref)',
        'चिकनगुनिया अहवाल दिनांक (Chik Report Date DD-MM-YYYY)'
      ];

      const sampleRows = [
        ['101', 'रमेश विठ्ठल पाटील', 'भादा', '34', 'पुरुष', '9876543210', '12', '01-09-2026', '28-08-2026', '4', '1', '1', '1', 'No', 'Positive', 'NS1 Ag ELISA', 'GMC/MICRO/2026/DEN-145', '15-09-2026', 'Negative', 'Chikungunya IgM ELISA', 'GMC/MICRO/2026/CHIK-89', '20-09-2026'],
        ['102', 'अनिता प्रकाश गायकवाड', 'भादा', '28', 'स्त्री', '9855512345', '45', '01-09-2026', '29-08-2026', '3', '1', '1', '1', 'No', 'Negative', 'NS1 Ag ELISA', 'GMC/MICRO/2026/DEN-145', '15-09-2026', 'Negative', 'Chikungunya IgM ELISA', 'GMC/MICRO/2026/CHIK-89', '20-09-2026'],
        ['103', 'सुधाकर मारुती शिंदे', 'तपसेचिंचोली', '45', 'पुरुष', '9766623456', '88', '01-09-2026', '27-08-2026', '5', '1', '1', '1', 'No', 'Negative', 'NS1 Ag ELISA', 'GMC/MICRO/2026/DEN-145', '15-09-2026', 'Positive', 'Chikungunya IgM ELISA', 'GMC/MICRO/2026/CHIK-89', '20-09-2026']
      ];

      const csvContent = '\\uFEFF' + [templateHeaders.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `dengue_chikungunya_sample_template.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 नमुना CSV टेम्पलेट डाऊनलोड झाले!');
    }

    function handleDengueOldDataFileSelect(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const nameEl = document.getElementById('dgOldDataSelectedFileName');
      if (nameEl) nameEl.textContent = `✅ निवडलेली फाईल: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

      const reader = new FileReader();
      reader.onload = function(e) {
        mDengueRawCsvContent = e.target.result;
        const pasteArea = document.getElementById('dgOldDataPasteArea');
        if (pasteArea) pasteArea.value = mDengueRawCsvContent;
        showToast('✅ CSV फाईल यशस्वीरित्या लोड झाली. आता "डेटा पार्स व तपासा" वर क्लिक करा.');
      };
      reader.readAsText(file, 'UTF-8');
    }

    function toggleDenguePasteArea() {
      const container = document.getElementById('dgOldDataPasteContainer');
      if (!container) return;
      container.style.display = container.style.display === 'none' ? 'block' : 'none';
    }

    function parseAndPreviewDengueOldData() {
      let content = mDengueRawCsvContent;
      const pasteVal = document.getElementById('dgOldDataPasteArea')?.value;
      if (pasteVal && pasteVal.trim()) {
        content = pasteVal.trim();
      }

      if (!content || !content.trim()) {
        alert('⚠️ कृपया प्रथम CSV फाईल निवडा किंवा मजकूर पेस्ट करा.');
        return;
      }

      const lines = content.trim().split(/\\r?\\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert('⚠️ CSV मध्ये किमान एक हेडर ओळ व एक डेटा ओळ असणे आवश्यक आहे.');
        return;
      }

      function parseLine(line) {
        let inQuotes = false;
        let token = "";
        const cols = [];
        for (let j = 0; j < line.length; j++) {
          const c = line[j];
          if (c === '"') inQuotes = !inQuotes;
          else if (c === ',' && !inQuotes) {
            cols.push(token.trim());
            token = "";
          } else {
            token += c;
          }
        }
        cols.push(token.trim());
        return cols;
      }

      const header = parseLine(lines[0]).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
      const nameIdx = header.findIndex(c => c.includes('नाव') || c.includes('patient') || c.includes('name'));
      const regIdx = header.findIndex(c => c.includes('नोंदणी') || c.includes('reg') || c.includes('opd'));
      const villageIdx = header.findIndex(c => c.includes('गाव') || c.includes('village'));
      const ageIdx = header.findIndex(c => c.includes('वय') || c.includes('age'));
      const sexIdx = header.findIndex(c => c.includes('लिंग') || c.includes('sex') || c.includes('gender'));
      const dateIdx = header.findIndex(c => c.includes('नमुना दिनांक') || c.includes('collection') || c.includes('date'));
      const dResIdx = header.findIndex(c => c.includes('डेंगी') || c.includes('dengue'));
      const cResIdx = header.findIndex(c => c.includes('चिकनगुनिया') || c.includes('chik'));

      if (nameIdx === -1) {
        alert('⚠️ CSV फाईलमध्ये "रुग्णाचे नाव" (Patient Name) कॉलम आढळला नाही.');
        return;
      }

      let validCount = 0;
      let normalizedCount = 0;
      let errorCount = 0;
      let previewRowsHtml = '';

      for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        const pName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].replace(/^"|"$/g, '').trim() : '';
        if (!pName) {
          errorCount++;
          continue;
        }

        validCount++;
        const pReg = regIdx !== -1 && cols[regIdx] ? cols[regIdx].replace(/^"|"$/g, '').trim() : '-';
        const pVillage = villageIdx !== -1 && cols[villageIdx] ? cols[villageIdx].replace(/^"|"$/g, '').trim() : 'भादा';
        const pAge = ageIdx !== -1 && cols[ageIdx] ? cols[ageIdx].replace(/^"|"$/g, '').trim() : '-';
        const pSex = sexIdx !== -1 && cols[sexIdx] ? cols[sexIdx].replace(/^"|"$/g, '').trim() : '-';
        const rawDate = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx].replace(/^"|"$/g, '').trim() : '';
        if (rawDate.includes('/') || rawDate.match(/^\\d{1,2}-\\d{1,2}-\\d{4}$/)) {
          normalizedCount++;
        }
        const dRes = dResIdx !== -1 && cols[dResIdx] ? cols[dResIdx].replace(/^"|"$/g, '').trim() : 'Pending';
        const cRes = cResIdx !== -1 && cols[cResIdx] ? cols[cResIdx].replace(/^"|"$/g, '').trim() : 'Pending';

        if (validCount <= 25) {
          const dBadge = dRes === 'Positive' ? '<span style="color:#c53030; font-weight:700;">🔴 Positive</span>' : dRes === 'Negative' ? '<span style="color:#276749; font-weight:700;">🟢 Negative</span>' : dRes === 'Equivocal' ? '<span style="color:#c05621; font-weight:700;">🟠 Equivocal</span>' : '<span style="color:#718096;">⏳ Pending</span>';
          const cBadge = cRes === 'Positive' ? '<span style="color:#c53030; font-weight:700;">🔴 Positive</span>' : cRes === 'Negative' ? '<span style="color:#276749; font-weight:700;">🟢 Negative</span>' : cRes === 'Equivocal' ? '<span style="color:#c05621; font-weight:700;">🟠 Equivocal</span>' : '<span style="color:#718096;">⏳ Pending</span>';

          previewRowsHtml += `
            <tr>
              <td style="text-align:center; font-weight:700;">${validCount}</td>
              <td style="font-weight:700; color:#2b6cb0;">${pReg}</td>
              <td class="text-left" style="font-weight:700; text-transform:uppercase;">${pName}</td>
              <td>${pVillage}</td>
              <td style="text-align:center;">${pAge} / ${pSex}</td>
              <td style="text-align:center; font-weight:600;">${rawDate || '-'}</td>
              <td style="text-align:center;">${dBadge}</td>
              <td style="text-align:center;">${cBadge}</td>
            </tr>
          `;
        }
      }

      // Update KPI Cards
      document.getElementById('kpiDgOldTotalRows').textContent = lines.length - 1;
      document.getElementById('kpiDgOldValidRecords').textContent = validCount;
      document.getElementById('kpiDgOldNormalized').textContent = normalizedCount;
      document.getElementById('kpiDgOldErrors').textContent = errorCount;

      const tbody = document.getElementById('tblDgOldPreviewBody');
      if (tbody) tbody.innerHTML = previewRowsHtml || '<tr><td colspan="8" style="text-align:center; padding:20px; color:#718096;">कोणतीही नोंद नाही.</td></tr>';

      const badge = document.getElementById('dgOldPreviewCountBadge');
      if (badge) badge.textContent = `एकूण ${validCount} वैध नोंदी`;

      const commitBtn = document.getElementById('btnCommitDgOldData');
      if (commitBtn) commitBtn.textContent = `💾 सर्व ${validCount} जुन्या नोंदी डेटाबेसमध्ये आयात व जतन करा`;

      const previewCont = document.getElementById('dgOldDataPreviewContainer');
      if (previewCont) previewCont.style.display = 'block';

      showToast(`✅ ${validCount} नोंदींचे प्रमाणीकरण यशस्वी झाले!`);
    }

    function commitDengueOldDataImport() {
      let content = mDengueRawCsvContent;
      const pasteVal = document.getElementById('dgOldDataPasteArea')?.value;
      if (pasteVal && pasteVal.trim()) content = pasteVal.trim();

      if (!content || !content.trim()) {
        alert('⚠️ आयात करण्यासाठी डेटा आढळला नाही.');
        return;
      }

      const isReplace = document.getElementById('dgModeReplace')?.checked || false;
      if (isReplace) {
        if (!confirm('⚠️ सावधगिरी: तुम्ही "सर्व डेटा बदला (Replace)" निवडले आहे. यामुळे विद्यमान डेंगी व चिकनगुनिया डेटा हटवून केवळ या CSV मधील डेटा राहील. खात्री आहे?')) {
          return;
        }
      }

      const btn = document.getElementById('btnCommitDgOldData');
      const msgEl = document.getElementById('dgOldCommitStatusMsg');
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ डेटा आयात होत आहे... कृपया थांबा...';
      }
      if (msgEl) msgEl.textContent = 'डेटाबेसमध्ये नोंदी सुरक्षित सेव्ह होत आहेत...';

      google.script.run
        .withSuccessHandler(res => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 सर्व नोंदी डेटाबेसमध्ये आयात व जतन करा';
          }
          if (res && res.success) {
            alert('✅ ' + (res.message || 'जुना डेटा यशस्वीरित्या आयात झाला!'));
            loadDengueData();
            clearDengueOldDataUploadForm();
            setTimeout(() => {
              switchDengueSubtab('register');
            }, 800);
          } else {
            alert('⚠️ आयात अयशस्वी: ' + ((res && res.message) || 'त्रुटी आली.'));
            if (msgEl) msgEl.textContent = '⚠️ ' + ((res && res.message) || 'त्रुटी.');
          }
        })
        .withFailureHandler(err => {
          if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 सर्व नोंदी डेटाबेसमध्ये आयात व जतन करा';
          }
          alert('⚠️ त्रुटी: ' + err.message);
          if (msgEl) msgEl.textContent = '⚠️ ' + err.message;
        })
        .importDengueOldDataCsv(content, isReplace);
    }

    function clearDengueOldDataUploadForm() {
      mDengueRawCsvContent = '';
      const fInput = document.getElementById('dgOldDataFileInput');
      if (fInput) fInput.value = '';
      const nameEl = document.getElementById('dgOldDataSelectedFileName');
      if (nameEl) nameEl.textContent = '';
      const pasteArea = document.getElementById('dgOldDataPasteArea');
      if (pasteArea) pasteArea.value = '';
      const previewCont = document.getElementById('dgOldDataPreviewContainer');
      if (previewCont) previewCont.style.display = 'none';
      const msgEl = document.getElementById('dgOldCommitStatusMsg');
      if (msgEl) msgEl.textContent = '';
    }
"""

if 'function downloadDengueCsvTemplate(' not in text:
    target_pos = '    function exportDengueCsvClient() {'
    if target_pos in text:
        text = text.replace(target_pos, old_data_js + '\n' + target_pos, 1)
        print("Injected old data import JavaScript functions into index.html!")

# 3. Add importDengueOldDataCsv in executeClientSideRpc for offline fallback
old_rpc_target = "          case 'deleteDengueEntry': {"
import_rpc_case = """          case 'importDengueOldDataCsv': {
            const [csvText, replace] = args;
            if (!csvText) return { result: { success: false, message: 'CSV मजकूर रिकामा आहे.' } };
            const lines = csvText.trim().split(/\\r?\\n/).filter(l => l.trim().length > 0);
            if (replace) clientDengueEntries.length = 0;
            let count = 0;
            for (let i = 1; i < lines.length; i++) {
              const parts = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
              if (!parts[1] && !parts[0]) continue;
              const pName = (parts[1] || parts[0]).toUpperCase();
              const dColl = parts[7] ? parts[7].split(/[-/]/).reverse().join('-') : new Date().toISOString().slice(0, 10);
              const rec = {
                id: `DENGUE_${dColl.replace(/-/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`,
                patientName: pName,
                patientRegNo: parts[0] || '-',
                village: parts[2] || 'भादा',
                age: parseInt(parts[3]) || 0,
                sex: (parts[4] || '').toUpperCase().includes('M') ? 'MALE' : 'FEMALE',
                mobile: parts[5] || '-',
                dateCollection: dColl,
                dengueResult: parts[14] || 'Pending',
                dengueReportRef: parts[16] || '',
                dengueReportDate: parts[17] || '',
                chikungunyaResult: parts[18] || 'Pending',
                chikungunyaReportRef: parts[20] || '',
                chikungunyaReportDate: parts[21] || '',
                testResult: parts[14] || 'Pending',
                createdAt: new Date().toISOString()
              };
              clientDengueEntries.push(rec);
              count++;
            }
            setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
            return { result: { success: true, count: count, message: `एकूण ${count} नोंदी यशस्वीरित्या आयात झाल्या.` } };
          }

          case 'deleteDengueEntry': {"""

if "case 'importDengueOldDataCsv':" not in text and old_rpc_target in text:
    text = text.replace(old_rpc_target, import_rpc_case, 1)
    print("Added importDengueOldDataCsv to executeClientSideRpc!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectDengueOldDataJS.py successfully!")
