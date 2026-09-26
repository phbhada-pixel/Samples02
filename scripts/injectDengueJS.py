with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update tabLabelMap
if "'dengueTab'" not in html:
    html = html.replace(
        "'homeVisitEntry': '🚶‍♂️ गृहभेटी डेटा एन्ट्री',",
        "'homeVisitEntry': '🚶‍♂️ गृहभेटी डेटा एन्ट्री',\n      'dengueTab': '🦟 डेंगी व चिकनगुनिया',"
    )
    print("Updated tabLabelMap with dengueTab!")

# 2. Update switchTab to load dengue data
if "loadDengueData();" not in html:
    switch_target = "if (tabId === 'homeVisitEntry') {\n        switchDataEntrySubtab('homevisit');\n      }"
    switch_dengue = """if (tabId === 'homeVisitEntry') {
        switchDataEntrySubtab('homevisit');
      }
      if (tabId === 'dengueTab') {
        loadDengueData();
      }"""
    html = html.replace(switch_target, switch_dengue, 1)
    print("Updated switchTab with loadDengueData() trigger!")

# 3. Add full Dengue Client JavaScript Functions before </script>\n</body>
dengue_js = """
    // ================= DENGUE & CHIKUNGUNYA CLIENT MODULE =================
    let mDengueData = [];

    function switchDengueSubtab(subtab) {
      document.querySelectorAll('#dengueTab .subtab-btn').forEach(b => b.classList.remove('active'));
      const panes = ['subpaneDengueEntry', 'subpaneDengueRegister', 'subpaneDengueLetter', 'subpaneDengueSheets'];
      panes.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = 'none';
      });

      if (subtab === 'entry') {
        document.getElementById('dengueSubtabBtnEntry')?.classList.add('active');
        document.getElementById('subpaneDengueEntry').style.display = 'block';
      } else if (subtab === 'register') {
        document.getElementById('dengueSubtabBtnRegister')?.classList.add('active');
        document.getElementById('subpaneDengueRegister').style.display = 'block';
        filterDengueTable();
      } else if (subtab === 'letter') {
        document.getElementById('dengueSubtabBtnLetter')?.classList.add('active');
        document.getElementById('subpaneDengueLetter').style.display = 'block';
        populateDengueLetterDateSelect();
        renderGmcLetterPreview();
      } else if (subtab === 'sheets') {
        document.getElementById('dengueSubtabBtnSheets')?.classList.add('active');
        document.getElementById('subpaneDengueSheets').style.display = 'block';
        populateDengueSheetsSelect();
        renderNivSheetsPreview();
      }
    }

    function toggleDengueHaemFields() {
      const val = document.getElementById('dgHaemorrhagic')?.value;
      const box = document.getElementById('dgHaemDetailsBox');
      if (box) {
        box.style.display = (val === 'Yes') ? 'block' : 'none';
      }
    }

    function populateDengueVillageDatalist() {
      const datalist = document.getElementById('dengueVillageList');
      if (!datalist) return;
      const vFilter = document.getElementById('dgFilterVillage');
      const villagesSet = new Set(['भादा', 'भेटा', 'काळमाथा', 'उटी', 'शिवली', 'कोरंगळा']);
      if (typeof mVillagesData !== 'undefined' && Array.isArray(mVillagesData)) {
        mVillagesData.forEach(v => { if (v.name) villagesSet.add(v.name); });
      }
      if (typeof masterData !== 'undefined' && Array.isArray(masterData)) {
        masterData.forEach(d => { if (d.villageName) villagesSet.add(d.villageName); });
      }

      datalist.innerHTML = '';
      if (vFilter) vFilter.innerHTML = '<option value="All">-- सर्व गावे (All Villages) --</option>';

      Array.from(villagesSet).sort().forEach(vName => {
        const opt = document.createElement('option');
        opt.value = vName;
        datalist.appendChild(opt);
        if (vFilter) {
          const fOpt = document.createElement('option');
          fOpt.value = vName;
          fOpt.textContent = vName;
          vFilter.appendChild(fOpt);
        }
      });
    }

    function loadDengueData() {
      populateDengueVillageDatalist();

      const todayStr = new Date().toISOString().slice(0, 10);
      const dgColl = document.getElementById('dgDateCollection');
      const dgOnset = document.getElementById('dgDateOnset');
      if (dgColl && !dgColl.value) dgColl.value = todayStr;
      if (dgOnset && !dgOnset.value) dgOnset.value = todayStr;

      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && Array.isArray(res.entries)) {
            mDengueData = res.entries;
          } else if (Array.isArray(res)) {
            mDengueData = res;
          } else {
            mDengueData = [];
          }

          // Update KPI card count
          const kpiCount = document.getElementById('dashDengueSamplesCount');
          if (kpiCount) kpiCount.textContent = mDengueData.length;

          populateDengueFilters();
          filterDengueTable();
          populateDengueLetterDateSelect();
          populateDengueSheetsSelect();
        })
        .withFailureHandler(err => {
          console.warn('Dengue data load error:', err);
        })
        .getDengueEntries('All', 'All');
    }

    function populateDengueFilters() {
      const dateFilter = document.getElementById('dgFilterDate');
      if (!dateFilter) return;
      const currentVal = dateFilter.value;
      const dates = Array.from(new Set(mDengueData.map(e => e.dateCollection).filter(Boolean))).sort().reverse();
      
      dateFilter.innerHTML = '<option value="All">-- सर्व नमुना दिनांक (All Dates) --</option>';
      dates.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `📅 ${d.split('-').reverse().join('-')}`;
        dateFilter.appendChild(opt);
      });
      if (currentVal && dates.includes(currentVal)) {
        dateFilter.value = currentVal;
      }
    }

    function populateDengueLetterDateSelect() {
      const select = document.getElementById('dgLetterDateSelect');
      if (!select) return;
      const dates = Array.from(new Set(mDengueData.map(e => e.dateCollection).filter(Boolean))).sort().reverse();
      select.innerHTML = '';
      if (dates.length === 0) {
        select.innerHTML = '<option value="">नोंदी उपलब्ध नाहीत</option>';
        return;
      }
      dates.forEach(d => {
        const count = mDengueData.filter(e => e.dateCollection === d).length;
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `📅 ${d.split('-').reverse().join('-')} (${count} रुग्ण)`;
        select.appendChild(opt);
      });
    }

    function populateDengueSheetsSelect() {
      const select = document.getElementById('dgSheetsDateSelect');
      if (!select) return;
      select.innerHTML = '';
      
      // Option 1: All patients
      const optAll = document.createElement('option');
      optAll.value = 'All';
      optAll.textContent = `🌟 सर्व संशयित रुग्ण (${mDengueData.length} रुग्ण)`;
      select.appendChild(optAll);

      // Dates group
      const dates = Array.from(new Set(mDengueData.map(e => e.dateCollection).filter(Boolean))).sort().reverse();
      if (dates.length > 0) {
        const grp = document.createElement('optgroup');
        grp.label = 'दिनांकनिहाय बॅच (Date Batches)';
        dates.forEach(d => {
          const count = mDengueData.filter(e => e.dateCollection === d).length;
          const opt = document.createElement('option');
          opt.value = d;
          opt.textContent = `📅 दिनांक ${d.split('-').reverse().join('-')} (${count} रुग्ण)`;
          grp.appendChild(opt);
        });
        select.appendChild(grp);
      }

      // Individual patients group
      if (mDengueData.length > 0) {
        const pGrp = document.createElement('optgroup');
        pGrp.label = 'वैयक्तिक रुग्ण (Single Patient)';
        mDengueData.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `👤 ${p.patientName} (${p.village}, वय ${p.age})`;
          pGrp.appendChild(opt);
        });
        select.appendChild(pGrp);
      }
    }

    function filterDengueTable() {
      const sVal = (document.getElementById('dgFilterSearch')?.value || '').toLowerCase().trim();
      const vVal = document.getElementById('dgFilterVillage')?.value || 'All';
      const dVal = document.getElementById('dgFilterDate')?.value || 'All';

      let filtered = [...mDengueData];
      if (vVal !== 'All') {
        filtered = filtered.filter(e => e.village === vVal);
      }
      if (dVal !== 'All') {
        filtered = filtered.filter(e => e.dateCollection === dVal);
      }
      if (sVal) {
        filtered = filtered.filter(e => {
          return (e.patientName && e.patientName.toLowerCase().includes(sVal)) ||
                 (e.patientRegNo && e.patientRegNo.toLowerCase().includes(sVal)) ||
                 (e.village && e.village.toLowerCase().includes(sVal)) ||
                 (e.mobile && e.mobile.includes(sVal));
        });
      }

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

        html += `
          <tr>
            <td style="text-align:center;"><input type="checkbox" class="dg-row-cb" value="${p.id}"></td>
            <td style="text-align:center; font-weight:700;">${idx + 1}</td>
            <td style="font-weight:700; color:#2b6cb0;">${p.patientRegNo || '-'}</td>
            <td class="text-left" style="font-weight:700; text-transform:uppercase;">
              ${p.patientName}
              <div style="font-size:11.5px; color:#718096; font-weight:normal;">📱 ${p.mobile || '-'}</div>
            </td>
            <td><span class="sheet-badge" style="background:#f0fff4; color:#22543d; border-color:#9ae6b4;">${p.village}</span></td>
            <td>${p.age} / <b>${p.sex}</b></td>
            <td><b>${pDate}</b></td>
            <td style="font-size:12px; color:#4a5568;">${symStr}</td>
            <td>
              <span style="font-size:11.5px; font-weight:700; color:${p.haemorrhagic === 'Yes' ? '#e53e3e' : '#38a169'};">
                ${p.haemorrhagic === 'Yes' ? '⚠️ Yes' : 'No'}
              </span>
            </td>
            <td style="text-align:center; white-space:nowrap;">
              <button type="button" class="sheet-btn" style="padding:4px 8px; font-size:11.5px; background:#ebf8ff; color:#2b6cb0; border-color:#bee3f8;" onclick="printSingleNivSheet('${p.id}')" title="NIV केस शीट प्रिंट करा">
                📄 केस शीट
              </button>
              <button type="button" class="sheet-btn" style="padding:4px 8px; font-size:11.5px; background:#fffaf0; color:#c05621; border-color:#fbd38d;" onclick="editDengueRecord('${p.id}')" title="नोंद संपादन">
                ✏️
              </button>
              <button type="button" class="sheet-btn" style="padding:4px 8px; font-size:11.5px; background:#fff5f5; color:#e53e3e; border-color:#feb2b2;" onclick="deleteDengueRecord('${p.id}')" title="हटवा">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
    }

    function toggleAllDengueCb(source) {
      document.querySelectorAll('.dg-row-cb').forEach(cb => cb.checked = source.checked);
    }

    function handleDengueFormSubmit(e) {
      if (e) e.preventDefault();
      saveDengueRecordInternal(false);
    }

    function saveAndPrintNivSheet() {
      const form = document.getElementById('frmDengueEntry');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }
      saveDengueRecordInternal(true);
    }

    function saveDengueRecordInternal(printAfter) {
      const recId = document.getElementById('dengueRecordId').value;
      const patientName = document.getElementById('dgPatientName').value.trim();
      const mobile = document.getElementById('dgMobile').value.trim();
      const village = document.getElementById('dgVillage').value.trim();
      const houseNo = document.getElementById('dgHouseNo').value.trim();
      const taluka = document.getElementById('dgTaluka').value.trim() || 'AUSA';
      const district = document.getElementById('dgDistrict').value.trim() || 'LATUR';
      const hospitalAddress = document.getElementById('dgHospitalAddress').value.trim() || 'प्राथमिक आरोग्य केंद्र भादा';
      const patientRegNo = document.getElementById('dgPatientRegNo').value.trim();
      const wardNo = document.getElementById('dgWardNo').value.trim() || '--';
      const bedNo = document.getElementById('dgBedNo').value.trim() || '--';
      const age = parseInt(document.getElementById('dgAge').value) || 0;
      const sex = document.getElementById('dgSex').value;
      const dateOnset = document.getElementById('dgDateOnset').value;
      const sampleNature = document.getElementById('dgSampleNature').value;
      const dateCollection = document.getElementById('dgDateCollection').value;
      const clinicalFever = parseInt(document.getElementById('dgClinicalFever').value) || 0;
      const clinicalHeadache = parseInt(document.getElementById('dgClinicalHeadache').value) || 0;
      const clinicalBodyache = parseInt(document.getElementById('dgClinicalBodyache').value) || 0;
      const clinicalJointPain = parseInt(document.getElementById('dgClinicalJointPain').value) || 0;
      const clinicalRetroOrbital = parseInt(document.getElementById('dgClinicalRetroOrbital').value) || 0;
      const clinicalRash = parseInt(document.getElementById('dgClinicalRash').value) || 0;
      const haemorrhagic = document.getElementById('dgHaemorrhagic').value;
      const hematemesis = document.getElementById('dgHematemesis').value.trim();
      const epistaxis = document.getElementById('dgEpistaxis').value.trim();
      const melena = document.getElementById('dgMelena').value.trim();
      const haemOther = document.getElementById('dgHaemOther').value.trim();
      const doctorName = document.getElementById('dgDoctorName').value.trim() || 'Dr. Patil S.S.';
      const doctorMobile = document.getElementById('dgDoctorMobile').value.trim() || '9689686901';

      if (!patientName) {
        alert('कृपया रुग्णाचे नाव प्रविष्ट करा.');
        return;
      }
      if (!village) {
        alert('कृपया गाव निवडा.');
        return;
      }
      if (!dateCollection) {
        alert('कृपया नमुना घेतल्याचा दिनांक निवडा.');
        return;
      }

      const payload = {
        id: recId || undefined,
        patientName,
        mobile,
        village,
        houseNo,
        taluka,
        district,
        hospitalAddress,
        patientRegNo,
        wardNo,
        bedNo,
        age,
        sex,
        dateOnset,
        sampleNature,
        dateCollection,
        clinicalFever,
        clinicalHeadache,
        clinicalBodyache,
        clinicalJointPain,
        clinicalRetroOrbitalPain: clinicalRetroOrbital,
        clinicalRash,
        haemorrhagic,
        haemHematemesis: hematemesis,
        haemEpistaxis: epistaxis,
        haemMelena: melena,
        haemOther,
        doctorName,
        doctorMobile
      };

      const btnSave = document.getElementById('btnSaveDengueRecord');
      const btnPrint = document.getElementById('btnSaveAndPrintNiv');
      const msgSpan = document.getElementById('dengueFormMsg');
      
      if (btnSave) btnSave.disabled = true;
      if (btnPrint) btnPrint.disabled = true;
      if (msgSpan) {
        msgSpan.style.color = '#c05621';
        msgSpan.textContent = 'जतन होत आहे... ⏳';
      }

      google.script.run
        .withSuccessHandler(res => {
          if (btnSave) btnSave.disabled = false;
          if (btnPrint) btnPrint.disabled = false;
          if (res && res.success) {
            if (msgSpan) {
              msgSpan.style.color = '#38a169';
              msgSpan.textContent = `✅ ${res.message}`;
            }
            alert(`✅ ${res.message}`);
            const savedId = res.id || payload.id;
            loadDengueData();
            resetDengueForm();

            if (printAfter && savedId) {
              printSingleNivSheet(savedId);
            } else {
              switchDengueSubtab('register');
            }
          } else {
            if (msgSpan) {
              msgSpan.style.color = '#e53e3e';
              msgSpan.textContent = `⚠️ त्रुटी: ${res ? res.message : ''}`;
            }
            alert('⚠️ त्रुटी: ' + (res ? res.message : 'नोंद सेव्ह होऊ शकली नाही'));
          }
        })
        .withFailureHandler(err => {
          if (btnSave) btnSave.disabled = false;
          if (btnPrint) btnPrint.disabled = false;
          if (msgSpan) {
            msgSpan.style.color = '#e53e3e';
            msgSpan.textContent = `⚠️ सर्व्हर एरर: ${err.message}`;
          }
          alert('⚠️ सर्व्हर एरर: ' + err.message);
        })
        .saveDengueEntry(payload);
    }

    function resetDengueForm() {
      document.getElementById('frmDengueEntry').reset();
      document.getElementById('dengueRecordId').value = '';
      document.getElementById('dengueFormModeTitle').textContent = 'डेंगी व चिकनगुनिया संशयित सिरम नमुना नोंद फॉर्म';
      const badge = document.getElementById('dengueFormStatusBadge');
      if (badge) {
        badge.textContent = '✨ नवीन नोंद (New Record)';
        badge.style.background = '#feebc8';
        badge.style.color = '#7b341e';
      }
      const todayStr = new Date().toISOString().slice(0, 10);
      document.getElementById('dgDateCollection').value = todayStr;
      document.getElementById('dgDateOnset').value = todayStr;
      document.getElementById('dgHospitalAddress').value = 'प्राथमिक आरोग्य केंद्र भादा';
      document.getElementById('dgTaluka').value = 'AUSA';
      document.getElementById('dgDistrict').value = 'LATUR';
      document.getElementById('dgDoctorName').value = 'Dr. Patil S.S.';
      document.getElementById('dgDoctorMobile').value = '9689686901';
      document.getElementById('dgHouseNo').value = '-';
      document.getElementById('dgWardNo').value = '--';
      document.getElementById('dgBedNo').value = '--';
      toggleDengueHaemFields();
    }

    function editDengueRecord(id) {
      const rec = mDengueData.find(e => e.id === id);
      if (!rec) return;

      document.getElementById('dengueRecordId').value = rec.id;
      document.getElementById('dgPatientName').value = rec.patientName || '';
      document.getElementById('dgMobile').value = rec.mobile || '';
      document.getElementById('dgVillage').value = rec.village || '';
      document.getElementById('dgHouseNo').value = rec.houseNo || '-';
      document.getElementById('dgTaluka').value = rec.taluka || 'AUSA';
      document.getElementById('dgDistrict').value = rec.district || 'LATUR';
      document.getElementById('dgHospitalAddress').value = rec.hospitalAddress || 'प्राथमिक आरोग्य केंद्र भादा';
      document.getElementById('dgPatientRegNo').value = rec.patientRegNo || '';
      document.getElementById('dgWardNo').value = rec.wardNo || '--';
      document.getElementById('dgBedNo').value = rec.bedNo || '--';
      document.getElementById('dgAge').value = rec.age || '';
      document.getElementById('dgSex').value = rec.sex || 'FEMALE';
      document.getElementById('dgDateOnset').value = rec.dateOnset || '';
      document.getElementById('dgSampleNature').value = rec.sampleNature || 'Serum';
      document.getElementById('dgDateCollection').value = rec.dateCollection || '';
      document.getElementById('dgClinicalFever').value = rec.clinicalFever ?? 1;
      document.getElementById('dgClinicalHeadache').value = rec.clinicalHeadache ?? 0;
      document.getElementById('dgClinicalBodyache').value = rec.clinicalBodyache ?? 0;
      document.getElementById('dgClinicalJointPain').value = rec.clinicalJointPain ?? 0;
      document.getElementById('dgClinicalRetroOrbital').value = rec.clinicalRetroOrbitalPain ?? 0;
      document.getElementById('dgClinicalRash').value = rec.clinicalRash ?? 0;
      document.getElementById('dgHaemorrhagic').value = rec.haemorrhagic || 'No';
      document.getElementById('dgHematemesis').value = rec.haemHematemesis || '';
      document.getElementById('dgEpistaxis').value = rec.haemEpistaxis || '';
      document.getElementById('dgMelena').value = rec.haemMelena || '';
      document.getElementById('dgHaemOther').value = rec.haemOther || '';
      document.getElementById('dgDoctorName').value = rec.doctorName || 'Dr. Patil S.S.';
      document.getElementById('dgDoctorMobile').value = rec.doctorMobile || '9689686901';

      toggleDengueHaemFields();

      document.getElementById('dengueFormModeTitle').textContent = `✏️ रुग्ण ${rec.patientName} ची नोंद संपादन करा`;
      const badge = document.getElementById('dengueFormStatusBadge');
      if (badge) {
        badge.textContent = '✏️ संपादन मोड (Editing)';
        badge.style.background = '#e2e8f0';
        badge.style.color = '#2d3748';
      }

      switchDengueSubtab('entry');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteDengueRecord(id) {
      const rec = mDengueData.find(e => e.id === id);
      const name = rec ? rec.patientName : 'हा रुग्ण';
      if (!confirm(`खात्री आहे का? ${name} ची डेंगी/चिकनगुनिया नोंद हटवायची आहे?`)) {
        return;
      }

      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) {
            alert(`✅ ${res.message}`);
            loadDengueData();
          } else {
            alert('⚠️ अयशस्वी: ' + (res ? res.message : ''));
          }
        })
        .withFailureHandler(err => {
          alert('⚠️ सर्व्हर एरर: ' + err.message);
        })
        .deleteDengueEntry(id);
    }

    function printSingleNivSheet(id) {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.html) {
            openPrintHtml(res.html, 'NIV पुणे केस हिस्ट्री शीट');
          } else {
            alert('⚠️ केस शीट तयार होऊ शकली नाही: ' + (res ? res.message : ''));
          }
        })
        .withFailureHandler(err => alert('एरर: ' + err.message))
        .generateNivCaseHistorySheets(id);
    }

    function printSelectedNivSheets() {
      const checkedBoxes = document.querySelectorAll('.dg-row-cb:checked');
      if (checkedBoxes.length === 0) {
        alert('कृपया किमान एका रुग्णाची निवड करा.');
        return;
      }
      const ids = Array.from(checkedBoxes).map(cb => cb.value);
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.html) {
            openPrintHtml(res.html, `NIV केस शीट्स (${ids.length} रुग्ण)`);
          } else {
            alert('⚠️ केस शीट्स तयार होऊ शकल्या नाहीत: ' + (res ? res.message : ''));
          }
        })
        .withFailureHandler(err => alert('एरर: ' + err.message))
        .generateNivCaseHistorySheets(ids);
    }

    function printGmcLetterDirect() {
      const dateVal = document.getElementById('dgLetterDateSelect')?.value;
      const outwardVal = document.getElementById('dgLetterOutwardNo')?.value || '';
      if (!dateVal) {
        alert('कृपया नमुना दिनांक निवडा.');
        return;
      }

      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.html) {
            openPrintHtml(res.html, `GMC लातूर पत्र (${dateVal})`);
          } else {
            alert('⚠️ पत्र तयार होऊ शकले नाही: ' + (res ? res.message : ''));
          }
        })
        .withFailureHandler(err => alert('एरर: ' + err.message))
        .generateGmcForwardingLetter(dateVal, outwardVal);
    }

    function printNivSheetsDirect() {
      const selVal = document.getElementById('dgSheetsDateSelect')?.value || 'All';
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.html) {
            openPrintHtml(res.html, 'NIV केस हिस्ट्री शीट्स');
          } else {
            alert('⚠️ केस शीट्स तयार होऊ शकल्या नाहीत: ' + (res ? res.message : ''));
          }
        })
        .withFailureHandler(err => alert('एरर: ' + err.message))
        .generateNivCaseHistorySheets(selVal);
    }

    function renderGmcLetterPreview() {
      const container = document.getElementById('gmcLetterPreviewContainer');
      if (!container) return;
      const dateVal = document.getElementById('dgLetterDateSelect')?.value;
      const outwardVal = document.getElementById('dgLetterOutwardNo')?.value || '';

      if (!dateVal) {
        container.innerHTML = '<p style="text-align:center; color:#718096; padding:30px;">कृपया वरून नमुना दिनांक निवडा.</p>';
        return;
      }

      const list = mDengueData.filter(e => e.dateCollection === dateVal);
      if (list.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#e53e3e; padding:30px;">दिनांक ${dateVal} साठी कोणतेही नमुने सापडले नाहीत.</p>`;
        return;
      }

      const displayDate = dateVal.split('-').reverse().join('-');
      let rowsHtml = '';
      list.forEach((p, idx) => {
        rowsHtml += `
          <tr>
            <td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #1a202c; padding:8px 12px; font-weight:700; text-transform:uppercase;">${p.patientName}</td>
            <td style="border:1px solid #1a202c; padding:8px 10px; text-align:center; font-weight:600;">${p.village}</td>
            <td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${p.age}</td>
            <td style="border:1px solid #1a202c; padding:8px 10px; text-align:center; text-transform:uppercase;">${p.sex}</td>
            <td style="border:1px solid #1a202c; padding:8px 10px; text-align:center;">${displayDate}</td>
          </tr>
        `;
      });

      container.innerHTML = `
        <div style="max-width:800px; margin:0 auto; font-family:'Poppins', Arial, sans-serif; color:#1a202c; line-height:1.6; font-size:13.5px;">
          <div style="text-align:center; margin-bottom:20px;">
            <h2 style="font-size:20px; font-weight:800; margin:0 0 4px 0; color:#1a202c;">महाराष्ट्र शासन</h2>
            <h3 style="font-size:16px; font-weight:700; margin:0; text-decoration:underline; color:#2d3748;">प्राथमिक आरोग्य केंद्र, भादा, ता. औसा, जि. लातूर</h3>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; font-size:13.5px; font-weight:600;">
            <div>जा.क्र. प्राआकें/भादा/डेंगी-नमुने/ <b>${outwardVal ? outwardVal + ' ' : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</b> /2026</div>
            <div>दिनांक: <b>${displayDate}</b></div>
          </div>

          <div style="margin-bottom:18px; font-size:14px; line-height:1.6;">
            प्रति,<br>
            <b>प्रयोगशाळा अधिकारी,</b><br>
            शासकीय वैद्यकीय महाविद्यालय (GMC),<br>
            लातूर.
          </div>

          <div style="margin-bottom:18px; font-size:14.5px; font-weight:700; text-align:center;">
            विषय : डेंगी व चिकनगुनिया सिरम नमुने तपासणीसाठी पाठविणेबाबत.
          </div>

          <div style="margin-bottom:20px; font-size:13.5px; line-height:1.8; text-align:justify; text-indent:40px;">
            महोदय,<br>
            उपरोक्त विषयी विनंती की, प्राथमिक आरोग्य केंद्र भादा अंतर्गत खालील रुग्णांचे डेंगी व चिकनगुनिया संशयित सिरम नमुने तपासणीसाठी या पत्रासोबत पाठविण्यात येत आहेत. तरी कृपया सदर नमुने तपासून अहवाल मिळावा, ही विनंती.
          </div>

          <table style="width:100%; border-collapse:collapse; margin-bottom:35px; font-size:13px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:50px;">अ.क्र.</th>
                <th style="border:1px solid #1a202c; padding:8px 12px; text-align:center;">रुग्णाचे नाव</th>
                <th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:110px;">गाव</th>
                <th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:60px;">वय</th>
                <th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:90px;">लिंग</th>
                <th style="border:1px solid #1a202c; padding:8px 10px; text-align:center; width:150px;">नमुना घेतल्याचा दिनांक</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="display:flex; justify-content:flex-end; margin-top:40px; text-align:right;">
            <div style="line-height:1.6; font-size:13.5px;">
              <div style="font-weight:700;">वैद्यकीय अधिकारी</div>
              <div style="font-weight:700; margin-top:3px;">Dr. Patil S.S.</div>
              <div style="color:#2d3748;">प्राथमिक आरोग्य केंद्र, भादा</div>
            </div>
          </div>
        </div>
      `;
    }

    function renderNivSheetsPreview() {
      const container = document.getElementById('nivSheetsPreviewContainer');
      if (!container) return;
      const selVal = document.getElementById('dgSheetsDateSelect')?.value || 'All';

      let list = [...mDengueData];
      if (selVal.startsWith('DENGUE_')) {
        list = list.filter(e => e.id === selVal);
      } else if (selVal !== 'All') {
        list = list.filter(e => e.dateCollection === selVal);
      }

      if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#718096; padding:30px;">केस शीटसाठी कोणताही रुग्ण उपलब्ध नाही.</p>';
        return;
      }

      // Display the first matching patient as live interactive preview
      const p = list[0];
      const dateOnsetFmt = p.dateOnset ? p.dateOnset.split('-').reverse().join('-') : '-';
      const dateCollFmt = p.dateCollection ? p.dateCollection.split('-').reverse().join('-') : '-';

      container.innerHTML = `
        <div style="max-width:800px; margin:0 auto; font-family:'Poppins', Arial, sans-serif; font-size:13.5px; line-height:1.7; color:#1a202c; border:1px solid #e2e8f0; padding:24px; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #dd6b20; padding-bottom:8px; margin-bottom:14px;">
            <span style="font-size:12px; font-weight:700; color:#c05621;">प्रिव्ह्यू: रुग्ण १ / ${list.length} (${p.patientName})</span>
            <button type="button" class="btn-primary" style="padding:6px 14px; font-size:12px; background:#2b6cb0;" onclick="printNivSheetsDirect()">
              🖨️ सर्व ${list.length} शीट्स प्रिंट करा
            </button>
          </div>

          <div style="text-align:center; margin-bottom:18px; line-height:1.4;">
            <h2 style="font-size:18px; font-weight:800; margin:0; color:#1a202c;">National Institute of Virology</h2>
            <div style="font-size:12px; font-weight:600; margin-top:2px; color:#4a5568;">20 A Dr. Ambedkar Road Post Box No 11 Pune 411 001</div>
            <div style="font-size:14px; font-weight:700; margin-top:6px; text-decoration:underline; color:#1a202c;">Case history sheet for Dengue / Chikungunya fever</div>
          </div>

          <div style="font-weight:700; text-decoration:underline; margin-bottom:12px;">Information Required to Accompany Specimen:-</div>

          <div style="margin-bottom:8px; display:flex; align-items:baseline; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <span style="font-weight:700; min-width:240px;">1. Full name of patient :-</span>
            <span style="font-weight:700; text-transform:uppercase; font-size:14px;">${p.patientName}</span>
          </div>

          <div style="margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <div style="font-weight:700;">2. Residential address of patient <span style="font-weight:normal;">(Mobile:- <b>${p.mobile || '-'}</b>)</span></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px; padding-left:20px;">
              <div>A. House No :- <b>${p.houseNo || '-'}</b></div>
              <div>B. Village :- <b>${p.village}</b></div>
              <div>C. Taluka :- <u>${p.taluka || 'AUSA'}</u></div>
              <div>D. District :- <u>${p.district || 'LATUR'}</u></div>
            </div>
          </div>

          <div style="margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <div style="font-weight:700;">3. Hospital address :- <span style="font-weight:600; text-decoration:underline;">${p.hospitalAddress || 'प्राथमिक आरोग्य केंद्र भादा'}</span></div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:6px; margin-top:4px; padding-left:20px;">
              <div>A. Patient Reg No :- <u><b>${p.patientRegNo || '-'}</b></u></div>
              <div>B. Ward No :- <b>${p.wardNo || '--'}</b></div>
              <div>C. Bed No :- <b>${p.bedNo || '--'}</b></div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <div><b>4. Age :-</b> <u>${p.age}</u></div>
            <div><b>5. Sex :-</b> <u>${p.sex}</u></div>
          </div>

          <div style="margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <b>6. Date Of Onset of First Symptom :-</b> <u>${dateOnsetFmt}</u>
          </div>

          <div style="margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <b>7. Nature of sample Serum/Blood/CSF :-</b> <u>${p.sampleNature || 'Serum'}</u>
          </div>

          <div style="margin-bottom:8px; border-bottom:1px solid #edf2f7; padding-bottom:4px;">
            <b>8. Date of sample collection :-</b> <u>${dateCollFmt}</u>
          </div>

          <div style="margin-bottom:10px; border-bottom:1px solid #edf2f7; padding-bottom:6px;">
            <div style="font-weight:700; margin-bottom:3px;">9. Clinical finding</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; padding-left:20px;">
              <div>1. Fever :- <u><b>${p.clinicalFever ?? 1}</b> Days</u></div>
              <div>2. Headache :- <u><b>${p.clinicalHeadache ?? 0}</b> Days</u></div>
              <div>3. Bodyache :- <u><b>${p.clinicalBodyache ?? 0}</b> Days</u></div>
              <div>4. Joint Pain :- <u><b>${p.clinicalJointPain ?? 0}</b> Days</u></div>
              <div>5. Retro Orbital Pain :- <u><b>${p.clinicalRetroOrbitalPain ?? 0}</b> Days</u></div>
              <div>6. Rash :- <u><b>${p.clinicalRash ?? 0}</b> Days</u></div>
            </div>
          </div>

          <div style="margin-bottom:20px;">
            <div style="font-weight:700;">10. Haemorrhagic Manifestation :- <u>${p.haemorrhagic || 'No'}</u></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; padding-left:20px; margin-top:4px;">
              <div>a. Hematemesis :- ${p.haemHematemesis ? `<u>${p.haemHematemesis}</u>` : '_______________'}</div>
              <div>b. Epistaxis :- ${p.haemEpistaxis ? `<u>${p.haemEpistaxis}</u>` : '_______________'}</div>
              <div>c. Melena :- ${p.haemMelena ? `<u>${p.haemMelena}</u>` : '_______________'}</div>
              <div>d. ${p.haemOther ? `<u>${p.haemOther}</u>` : '__________________________'}</div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; margin-top:30px; text-align:right;">
            <div style="line-height:1.5; font-size:13px;">
              <div style="font-weight:700;">Signature of Medical Officer</div>
              <div style="font-weight:700; margin-top:2px;">${p.doctorName || 'Dr. Patil S.S.'}</div>
              <div>Mobile No: <b>${p.doctorMobile || '9689686901'}</b></div>
              <div style="color:#718096; font-size:11.5px;">(Seal / Stamp)</div>
            </div>
          </div>
        </div>
      `;
    }

    function openPrintHtml(htmlContent, title) {
      if (!htmlContent) return;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      try {
        const win = window.open(blobUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          // If popup blocked, create modal link
          alert(`✅ ${title} तयार झाले आहे. कृपया नवीन टॅबमध्ये उघडा.`);
          window.location.href = blobUrl;
        }
      } catch (e) {
        window.open(blobUrl, '_blank');
      }
    }

    function exportDengueCsvClient() {
      if (typeof window !== 'undefined' && window.location && window.location.hostname && !window.location.hostname.endsWith('github.io')) {
        window.location.href = '/api/export/dengue-samples.csv';
        return;
      }

      // Offline / GitHub Pages fallback
      const headers = [
        'ID', 'Patient Name', 'Mobile', 'House No', 'Village', 'Taluka', 'District',
        'Hospital Address', 'Reg No', 'Ward', 'Bed', 'Age', 'Sex', 'Onset Date',
        'Sample Nature', 'Collection Date', 'Fever Days', 'Headache Days', 'Bodyache Days',
        'Joint Pain Days', 'Retro Orbital Pain Days', 'Rash Days', 'Haemorrhagic',
        'Doctor Name', 'Doctor Mobile'
      ];
      const rows = mDengueData.map(e => [
        e.id, `"${(e.patientName || '').replace(/"/g, '""')}"`, e.mobile || '-',
        e.houseNo || '-', `"${(e.village || '').replace(/"/g, '""')}"`,
        e.taluka || 'AUSA', e.district || 'LATUR', `"${(e.hospitalAddress || '').replace(/"/g, '""')}"`,
        e.patientRegNo || '-', e.wardNo || '--', e.bedNo || '--', e.age || 0,
        e.sex || '', e.dateOnset || '', e.sampleNature || 'Serum', e.dateCollection || '',
        e.clinicalFever ?? 1, e.clinicalHeadache ?? 0, e.clinicalBodyache ?? 0,
        e.clinicalJointPain ?? 0, e.clinicalRetroOrbitalPain ?? 0, e.clinicalRash ?? 0,
        e.haemorrhagic || 'No', `"${(e.doctorName || '').replace(/"/g, '""')}"`, e.doctorMobile || ''
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phc_bhada_dengue_samples_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
"""

if "mDengueData" not in html:
    html = html.replace("</script>\n</body>", dengue_js + "\n  </script>\n</body>")
    print("Added Dengue Client JavaScript functions to index.html!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Finished injectDengueJS.py!")
