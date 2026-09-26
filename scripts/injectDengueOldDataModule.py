import re

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add Subtab Button
old_subtab_btns = '<button id="dengueSubtabBtnRegister" class="subtab-btn"'
new_subtab_btns = """<button id="dengueSubtabBtnUpload" class="subtab-btn" onclick="switchDengueSubtab('upload')" style="border-left:3px solid #6b46c1; font-weight:700;">
            📂 जुना डेटा आयात (Old Data Import)
          </button>
          <button id="dengueSubtabBtnRegister" class="subtab-btn" """

if 'id="dengueSubtabBtnUpload"' not in text and old_subtab_btns in text:
    text = text.replace(old_subtab_btns, new_subtab_btns, 1)
    print("Added dengueSubtabBtnUpload button!")

# 2. Add Button in Register header
old_reg_btn = '🔬 GMC एकत्रित अहवाल नोंदवा (Batch Report)'
if '📂 जुना डेटा आयात करा' not in text and old_reg_btn in text:
    text = text.replace(old_reg_btn, old_reg_btn + '\n                </button>\n                <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700;" onclick="switchDengueSubtab(\'upload\')">\n                  📂 जुना डेटा आयात करा (Import CSV)', 1)
    print("Added quick import button in Register header!")

# 3. Add Subpane Markup before subpaneDengueRegister
target_marker = '        <!-- ================= SUBPANE 2: PATIENT REGISTER ================= -->'
upload_subpane_html = """        <!-- ================= SUBPANE: DENGUE & CHIKUNGUNYA OLD DATA IMPORT ================= -->
        <div id="subpaneDengueUpload" style="display:none;">
          <div class="sheet-card" style="border-top:4px solid #6b46c1;">
            
            <!-- Header -->
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:24px;">📂</span>
                <div>
                  <div style="font-size:17px; font-weight:800; color:#44337a;">
                    डेंगी व चिकनगुनिया जुना डेटा आयात केंद्र (Old Data CSV / Excel Import)
                  </div>
                  <div style="font-size:12.5px; color:var(--text-muted); font-weight:500;">
                    मागील महिन्यांमधील किंवा वर्षांमधील Excel / CSV फाईलमधील जुना डेंगी व चिकनगुनिया डेटा थेट आयात करा व नोंदवहीत समाविष्ट करा.
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <button type="button" class="sheet-btn" style="background:#276749; color:#fff; font-weight:700;" onclick="downloadDengueCsvTemplate()">
                  📥 नमुना CSV टेम्पलेट डाऊनलोड करा
                </button>
                <button type="button" class="sheet-btn" onclick="switchDengueSubtab('register')">
                  📋 नोंदवही पाहा (Register)
                </button>
              </div>
            </div>

            <!-- Upload Controls Container -->
            <div style="background:#faf5ff; border:1.5px solid #d6bcfa; border-radius:12px; padding:20px; margin-bottom:22px;">
              
              <!-- Mode Selection -->
              <div style="margin-bottom:16px;">
                <label style="font-size:13.5px; font-weight:700; color:#322659; display:block; margin-bottom:8px;">
                  १. डेटा आयात पद्धत निवडा (Import Mode):
                </label>
                <div style="display:flex; gap:20px; flex-wrap:wrap;">
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:13px; color:#2d3748; background:#fff; padding:8px 14px; border-radius:8px; border:1px solid #cbd5e0;">
                    <input type="radio" name="dgOldDataMode" id="dgModeAppend" value="append" checked>
                    <span>🟢 <b>नवीन नोंदी जोडा (Append)</b> - विद्यमान डेटा कायम ठेवून जुन्या नोंदी जोडा</span>
                  </label>
                  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; font-size:13px; color:#9b2c2c; background:#fff; padding:8px 14px; border-radius:8px; border:1px solid #feb2b2;">
                    <input type="radio" name="dgOldDataMode" id="dgModeReplace" value="replace">
                    <span>🔴 <b>सर्व डेटा बदला (Replace)</b> - आधीचा संपूर्ण डेटा हटवून नवीन डेटा टाका</span>
                  </label>
                </div>
              </div>

              <!-- File Input & Drop Area -->
              <div style="margin-bottom:16px;">
                <label style="font-size:13.5px; font-weight:700; color:#322659; display:block; margin-bottom:8px;">
                  २. CSV फाईल निवडा (Select CSV File):
                </label>
                <div style="border:2px dashed #9f7aea; background:#fff; border-radius:10px; padding:22px; text-align:center; transition:all 0.2s ease;">
                  <div style="font-size:32px; margin-bottom:8px;">📄</div>
                  <div style="font-size:13.5px; font-weight:700; color:#4a5568; margin-bottom:6px;">
                    डेंगी / चिकनगुनिया जुन्या नोंदींची .CSV फाईल येथे निवडा
                  </div>
                  <div style="font-size:12px; color:#718096; margin-bottom:14px;">
                    Excel मधील फाईल 'Save As CSV (Comma delimited)' करून निवडा.
                  </div>
                  <input type="file" id="dgOldDataFileInput" accept=".csv,text/csv,text/plain" style="display:none;" onchange="handleDengueOldDataFileSelect(event)">
                  <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700; padding:8px 20px; font-size:13px;" onclick="document.getElementById('dgOldDataFileInput').click()">
                    📁 फाईल निवडा (Choose CSV File)
                  </button>
                  <span id="dgOldDataSelectedFileName" style="margin-left:12px; font-size:13px; font-weight:700; color:#276749;"></span>
                </div>
              </div>

              <!-- Direct Paste Option Toggle -->
              <div style="margin-bottom:16px;">
                <button type="button" class="sheet-btn" style="background:#edf2f7; color:#4a5568; font-size:12px; padding:4px 10px;" onclick="toggleDenguePasteArea()">
                  📝 किंवा थेट CSV डेटा पेस्ट करा (Paste CSV Text) ▾
                </button>
                <div id="dgOldDataPasteContainer" style="display:none; margin-top:10px;">
                  <textarea id="dgOldDataPasteArea" rows="6" class="form-control" style="font-family:monospace; font-size:12px;" placeholder="येथे CSV डेटा पेस्ट करा (Header ओळीसह)..."></textarea>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                <button type="button" class="sheet-btn" style="background:#6b46c1; color:#fff; font-weight:700; font-size:13.5px; padding:10px 22px;" onclick="parseAndPreviewDengueOldData()">
                  ⚡ डेटा पार्स व तपासा (Parse & Validate Preview)
                </button>
                <button type="button" class="sheet-btn" style="background:#e2e8f0; color:#4a5568;" onclick="clearDengueOldDataUploadForm()">
                  🔄 साफ करा (Clear)
                </button>
              </div>

            </div>

            <!-- Preview & Validation Results Container -->
            <div id="dgOldDataPreviewContainer" style="display:none; margin-top:20px;">
              
              <!-- 4 Colourful Validation KPI Cards -->
              <div class="upload-kpi-grid">
                <div class="upload-kpi-card" style="border-left:5px solid #0284c7; background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-top:1px solid #bae6fd; border-right:1px solid #bae6fd; border-bottom:1px solid #bae6fd;">
                  <div class="kpi-num" id="kpiDgOldTotalRows" style="color:#0369a1;">०</div>
                  <div class="kpi-label" style="color:#075985;">📊 एकूण पार्स केलेल्या ओळी (Total Rows)</div>
                </div>
                <div class="upload-kpi-card" style="border-left:5px solid #16a34a; background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-top:1px solid #bbf7d0; border-right:1px solid #bbf7d0; border-bottom:1px solid #bbf7d0;">
                  <div class="kpi-num" id="kpiDgOldValidRecords" style="color:#15803d;">०</div>
                  <div class="kpi-label" style="color:#166534;">🟢 वैध रुग्ण नोंदी (Valid Records)</div>
                </div>
                <div class="upload-kpi-card" style="border-left:5px solid #d97706; background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-top:1px solid #fde68a; border-right:1px solid #fde68a; border-bottom:1px solid #fde68a;">
                  <div class="kpi-num" id="kpiDgOldNormalized" style="color:#b45309;">०</div>
                  <div class="kpi-label" style="color:#92400e;">⚡ ऑटो-दुरुस्त दिनांक (Normalized Dates)</div>
                </div>
                <div class="upload-kpi-card" style="border-left:5px solid #dc2626; background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-top:1px solid #fecaca; border-right:1px solid #fecaca; border-bottom:1px solid #fecaca;">
                  <div class="kpi-num" id="kpiDgOldErrors" style="color:#b91c1c;">०</div>
                  <div class="kpi-label" style="color:#991b1b;">❌ त्रुटी / वगळलेल्या ओळी (Empty Rows)</div>
                </div>
              </div>

              <!-- Preview Table -->
              <div style="background:#fff; border:1px solid #cbd5e0; border-radius:10px; padding:16px; margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <div style="font-size:14px; font-weight:800; color:#2d3748;">
                    🔍 डेटा पडताळणी पूर्वावलोकन (Data Verification Preview - पहिली २० नोंदी):
                  </div>
                  <span id="dgOldPreviewCountBadge" style="font-size:12px; font-weight:700; color:#6b46c1; background:#ede9fe; padding:3px 10px; border-radius:14px;"></span>
                </div>

                <div class="table-container" style="max-height:380px; overflow-y:auto;">
                  <table class="app-table" id="tblDgOldPreview">
                    <thead>
                      <tr style="background:#f1f5f9;">
                        <th style="width:40px; text-align:center;">अ.क्र.</th>
                        <th>नोंदणी क्र.</th>
                        <th class="text-left">रुग्णाचे नाव (Patient Name)</th>
                        <th>गाव (Village)</th>
                        <th style="text-align:center;">वय / लिंग</th>
                        <th style="text-align:center;">नमुना दिनांक</th>
                        <th style="text-align:center;">डेंगी अहवाल</th>
                        <th style="text-align:center;">चिकनगुनिया अहवाल</th>
                      </tr>
                    </thead>
                    <tbody id="tblDgOldPreviewBody"></tbody>
                  </table>
                </div>
              </div>

              <!-- Commit Button -->
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #e2e8f0; padding-top:16px;">
                <span id="dgOldCommitStatusMsg" style="font-size:13.5px; font-weight:700; color:#6b46c1;"></span>
                <button type="button" class="sheet-btn" id="btnCommitDgOldData" style="background:#6b46c1; color:#fff; font-size:14px; font-weight:800; padding:12px 28px; border-radius:8px; box-shadow:0 2px 8px rgba(107,70,193,0.3);" onclick="commitDengueOldDataImport()">
                  💾 सर्व नोंदी डेटाबेसमध्ये आयात व जतन करा (Commit & Import to Database)
                </button>
              </div>

            </div>

          </div>
        </div>

"""

if 'id="subpaneDengueUpload"' not in text and target_marker in text:
    text = text.replace(target_marker, upload_subpane_html + target_marker, 1)
    print("Added subpaneDengueUpload markup successfully!")

# Write updated HTML
with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated index.html structure with upload subpane!")
