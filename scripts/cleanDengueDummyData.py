print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update clientDengueEntries initialization with auto-purge of dummy test records
old_init = """let clientDengueEntries = getLocalStore('dengueChikungunyaEntries', null);
      if (!clientDengueEntries || !Array.isArray(clientDengueEntries)) {
        clientDengueEntries = (defaultSnap.dengueChikungunyaEntries && Array.isArray(defaultSnap.dengueChikungunyaEntries)) ? defaultSnap.dengueChikungunyaEntries : [];
        if (clientDengueEntries.length > 0) setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
      }"""

new_init = """let clientDengueEntries = getLocalStore('dengueChikungunyaEntries', null);
      // Auto-purge any dummy test entries so preview app starts completely clean
      if (Array.isArray(clientDengueEntries)) {
        clientDengueEntries = clientDengueEntries.filter(e => 
          e && e.patientName && 
          !['रमेश विठ्ठल पाटील', 'सुरेश नामदेव कदम', 'कविता गजानन मोरे'].includes(e.patientName) &&
          !String(e.id || '').startsWith('DENGUE_20260926_3463') &&
          !String(e.id || '').startsWith('DENGUE_20260812_')
        );
        setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
      }
      if (!clientDengueEntries || !Array.isArray(clientDengueEntries)) {
        clientDengueEntries = (defaultSnap.dengueChikungunyaEntries && Array.isArray(defaultSnap.dengueChikungunyaEntries)) ? defaultSnap.dengueChikungunyaEntries : [];
        setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
      }"""

if old_init in text:
    text = text.replace(old_init, new_init, 1)
    print("Updated clientDengueEntries initialization with auto-purge!")

# 2. Add clear button in subpaneDengueRegister header
old_reg_header = """                <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700;" onclick="switchDengueSubtab('upload')">
                  📂 जुना डेटा आयात करा (Import CSV)
                </button>"""

new_reg_header = """                <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700;" onclick="switchDengueSubtab('upload')">
                  📂 जुना डेटा आयात करा (Import CSV)
                </button>
                <button type="button" class="sheet-btn" style="background:#fff; color:#e53e3e; border:1.5px solid #feb2b2; font-weight:700;" onclick="promptClearDengueData()">
                  🗑️ डमी / चाचणी डेटा साफ करा
                </button>"""

if '🗑️ डमी / चाचणी डेटा साफ करा' not in text and old_reg_header in text:
    text = text.replace(old_reg_header, new_reg_header, 1)
    print("Added clear dummy data button in Register header!")

# 3. Add promptClearDengueData function and update empty state in renderDengueTable
old_empty = """      if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:35px; color:#718096; font-size:13.5px;">कोणतीही नोंद सापडली नाही.</td></tr>';
        return;
      }"""

new_empty = """      if (!list || list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align:center; padding:45px 20px; color:#718096;">
              <div style="font-size:36px; margin-bottom:8px;">📋</div>
              <div style="font-size:16px; font-weight:800; color:#2d3748;">
                अद्याप कोणतीही डेंगी किंवा चिकनगुनिया नोंद नाही (No Records Found)
              </div>
              <div style="font-size:13px; color:#718096; margin-top:6px; margin-bottom:18px;">
                सर्व डमी/चाचणी नोंदी साफ केल्या आहेत. नवीन रुग्णाची नोंद करण्यासाठी <b>'नवीन रुग्ण नोंद'</b> करा किंवा जुन्या नोंदींसाठी <b>'जुना डेटा आयात'</b> वापरा.
              </div>
              <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                <button type="button" class="sheet-btn" style="background:#2b6cb0; color:#fff; font-weight:700;" onclick="switchDengueSubtab('entry')">
                  📝 नवीन रुग्ण नोंद करा (New Entry)
                </button>
                <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700;" onclick="switchDengueSubtab('upload')">
                  📂 जुना डेटा आयात करा (Old Data Import)
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }"""

if old_empty in text:
    text = text.replace(old_empty, new_empty, 1)
    print("Updated renderDengueTable empty state!")

# 4. Add promptClearDengueData function
clear_fn = """
    function promptClearDengueData() {
      if (confirm('⚠️ खात्री आहे? तुम्ही डेंगी व चिकनगुनियामधील सर्व डमी किंवा चाचणी नोंदी पूर्णपणे काढून टाकू इच्छिता का? (Clean all dummy records)')) {
        google.script.run
          .withSuccessHandler(res => {
            if (typeof clientDengueEntries !== 'undefined') {
              clientDengueEntries.length = 0;
            }
            if (typeof setLocalStore === 'function') {
              setLocalStore('dengueChikungunyaEntries', []);
            }
            mDengueData = [];
            showToast('✅ ' + ((res && res.message) || 'सर्व डमी/चाचणी नोंदी हटवण्यात आल्या.'));
            loadDengueData();
          })
          .withFailureHandler(err => {
            alert('⚠️ त्रुटी: ' + err.message);
          })
          .clearDengueEntries();
      }
    }
"""

if 'function promptClearDengueData(' not in text:
    target_pos = '    function exportDengueCsvClient() {'
    if target_pos in text:
        text = text.replace(target_pos, clear_fn + '\n' + target_pos, 1)
        print("Injected promptClearDengueData function!")

# 5. Add clearDengueEntries in executeClientSideRpc
old_rpc_case = "          case 'clearDengueEntries': {"
if old_rpc_case not in text:
    old_target_rpc = "          case 'deleteDengueEntry': {"
    new_rpc_case = """          case 'clearDengueEntries': {
            clientDengueEntries.length = 0;
            setLocalStore('dengueChikungunyaEntries', []);
            return { result: { success: true, message: 'सर्व डमी / चाचणी नोंदी सुरक्षित हटवण्यात आल्या.' } };
          }

          case 'deleteDengueEntry': {"""
    text = text.replace(old_target_rpc, new_rpc_case, 1)
    print("Added clearDengueEntries to executeClientSideRpc!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished cleanDengueDummyData.py successfully!")
