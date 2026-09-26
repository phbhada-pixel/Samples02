import re

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add Subtab Button
old_subtab_btn = '<button id="dengueSubtabBtnRegister" class="subtab-btn"'
new_subtab_btn = """<button id="dengueSubtabBtnBatch" class="subtab-btn" onclick="switchDengueSubtab('batch')" style="border-left:3px solid #2b6cb0; font-weight:700;">
            🔬 GMC एकत्रित अहवाल नोंदणी (Batch Report)
          </button>
          <button id="dengueSubtabBtnRegister" class="subtab-btn" """

if 'id="dengueSubtabBtnBatch"' not in text and old_subtab_btn in text:
    text = text.replace(old_subtab_btn, new_subtab_btn, 1)
    print("Added dengueSubtabBtnBatch button!")

# 2. Add Button in Register Sheet Actions
old_sheet_actions = """<div class="sheet-actions">
                <button type="button" class="sheet-btn" style="background:#c05621; color:#fff;" onclick="printSelectedNivSheets()">"""
new_sheet_actions = """<div class="sheet-actions">
                <button type="button" class="sheet-btn" style="background:#2b6cb0; color:#fff; font-weight:700;" onclick="switchDengueSubtab('batch')">
                  🔬 GMC एकत्रित अहवाल नोंदवा (Batch Report)
                </button>
                <button type="button" class="sheet-btn" style="background:#c05621; color:#fff;" onclick="printSelectedNivSheets()">"""

if 'GMC एकत्रित अहवाल नोंदवा (Batch Report)' not in text and old_sheet_actions in text:
    text = text.replace(old_sheet_actions, new_sheet_actions, 1)
    print("Added batch report button to Register header!")

# 3. Add Subpane Markup before subpaneDengueRegister
target_subpane = '        <!-- ================= SUBPANE 2: PATIENT REGISTER ================= -->'
batch_subpane_html = """        <!-- ================= SUBPANE: DATE-WISE / BATCH LAB REPORT ENTRY ================= -->
        <div id="subpaneDengueBatch" style="display:none;">
          <div class="sheet-card" style="border-top:4px solid #2b6cb0;">
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:24px;">🔬</span>
                <div>
                  <div style="font-size:17px; font-weight:800; color:#1a365d;">
                    दिनांकनिहाय (Batch) GMC प्रयोगशाळा एकत्रित अहवाल नोंदणी
                  </div>
                  <div style="font-size:12.5px; color:var(--text-muted); font-weight:500;">
                    GMC लातूर प्रयोगशाळेकडून पाठवलेल्या नमुन्यांच्या संपूर्ण तारखेचा एकत्रित अहवाल (Positive/Negative/Equivocal) एकाच वेळी नोंदवा व एकच एकत्रित पत्र स्कॅन प्रत जोडा.
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <button type="button" class="sheet-btn" onclick="switchDengueSubtab('register')">
                  📋 नोंदवही पाहा (View Register)
                </button>
              </div>
            </div>

            <!-- Notice & Disease Tabs -->
            <div style="background:#ebf8ff; border:1px solid #bee3f8; border-radius:10px; padding:12px 16px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="font-size:13px; color:#2b6cb0; font-weight:600;">
                ℹ️ <b>GMC लातूर पद्धत:</b> नमुने दिनांकनिहाय बॅचमध्ये तपासले जातात. डेंगी व चिकनगुनिया अहवाल वेगवेगळ्या वेळी उपलब्ध झाल्यास फक्त त्या आजाराचा अहवाल निवडून एका क्लिकवर सर्व रुग्णांचे निकाल सेव्ह करा.
              </div>
              <div style="display:flex; gap:6px;">
                <button type="button" class="sheet-btn dg-batch-disease-btn" id="btnBatchDiseaseDengue" style="padding:5px 12px; font-size:12px; font-weight:700; background:#dd6b20; color:#fff;" onclick="switchBatchDiseaseTab('dengue')">
                  🦟 डेंगी अहवाल (Dengue)
                </button>
                <button type="button" class="sheet-btn dg-batch-disease-btn" id="btnBatchDiseaseChik" style="padding:5px 12px; font-size:12px; font-weight:700; background:#edf2f7; color:#4a5568;" onclick="switchBatchDiseaseTab('chikungunya')">
                  🦠 चिकनगुनिया अहवाल (Chik)
                </button>
                <button type="button" class="sheet-btn dg-batch-disease-btn" id="btnBatchDiseaseBoth" style="padding:5px 12px; font-size:12px; font-weight:700; background:#edf2f7; color:#4a5568;" onclick="switchBatchDiseaseTab('both')">
                  ⭐ दोन्ही एकत्र (Both)
                </button>
              </div>
            </div>

            <!-- Common Batch Header Form -->
            <div style="background:#f8fafc; border:1.5px solid #cbd5e0; border-radius:10px; padding:18px 20px; margin-bottom:22px;">
              <div style="font-size:14px; font-weight:800; color:#2d3748; margin-bottom:12px; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
                १. एकत्रित प्रयोगशाळा अहवाल तपशील (Common Batch Details):
              </div>
              
              <div class="form-grid" style="grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:14px;">
                
                <!-- Date Selector -->
                <div>
                  <label class="form-label" style="font-weight:700; color:#1a365d;">
                    📅 नमुना पाठवल्याचा दिनांक निवडा (Dispatch Date) <span style="color:#e53e3e;">*</span>
                  </label>
                  <select id="dgBatchSelectDate" class="form-control" style="font-weight:700; border-color:#3182ce;" onchange="loadBatchDatePatients()">
                    <option value="">-- दिनांक निवडा --</option>
                  </select>
                </div>

                <!-- Report Ref No -->
                <div>
                  <label class="form-label" style="font-weight:700; color:#1a365d;">
                    📑 GMC अहवाल संदर्भ क्र. (Report Ref No.) <span style="color:#e53e3e;">*</span>
                  </label>
                  <input type="text" id="dgBatchReportRef" class="form-control" placeholder="उदा. GMC/MICRO/2026/DEN-145" style="font-weight:600;">
                </div>

                <!-- Report Received Date -->
                <div>
                  <label class="form-label" style="font-weight:700; color:#1a365d;">
                    📅 अहवाल प्राप्त दिनांक (Received Date) <span style="color:#e53e3e;">*</span>
                  </label>
                  <input type="date" id="dgBatchReportDate" class="form-control" style="font-weight:600;">
                </div>

                <!-- Test Type -->
                <div>
                  <label class="form-label" style="font-weight:700; color:#1a365d;">
                    🧪 चाचणी प्रकार (Test Method)
                  </label>
                  <select id="dgBatchTestType" class="form-control">
                    <option value="NS1 Ag & IgM ELISA">NS1 Ag & IgM ELISA</option>
                    <option value="NS1 Ag ELISA">NS1 Ag ELISA</option>
                    <option value="Dengue IgM ELISA">Dengue IgM ELISA</option>
                    <option value="Chikungunya IgM ELISA">Chikungunya IgM ELISA</option>
                    <option value="Rapid Card Test">Rapid Card Test</option>
                    <option value="RT-PCR">RT-PCR</option>
                  </select>
                </div>

                <!-- Common Upload File -->
                <div style="grid-column:span 2;">
                  <label class="form-label" style="font-weight:700; color:#1a365d;">
                    📎 GMC एकत्रित अहवाल पत्र स्कॅन प्रत (Upload Consolidated Batch PDF / Image)
                  </label>
                  <div style="display:flex; gap:10px; align-items:center;">
                    <input type="file" id="dgBatchReportFile" accept="image/*,.pdf" class="form-control" style="font-size:12px; padding:6px;" onchange="handleBatchFileUpload(event)">
                    <button type="button" class="sheet-btn" id="btnBatchFileClear" style="display:none; padding:6px 12px; font-size:12px; background:#e2e8f0; color:#4a5568;" onclick="removeBatchFile()">काढून टाका</button>
                  </div>
                  <div id="dgBatchFilePreviewStatus" style="font-size:11.5px; margin-top:4px; color:#4a5568;"></div>
                </div>

                <!-- Common Remarks -->
                <div style="grid-column:span 2;">
                  <label class="form-label" style="font-weight:600;">
                    📝 एकत्रित शेरा / टीप (Common Remarks)
                  </label>
                  <input type="text" id="dgBatchRemarks" class="form-control" placeholder="उदा. शासकीय वैद्यकीय महाविद्यालय लातूर सूक्ष्मजीवशास्त्र विभाग अहवाल">
                </div>

              </div>
            </div>

            <!-- Patient Result List Table -->
            <div style="margin-bottom:18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
                <div style="font-size:14px; font-weight:800; color:#2d3748;">
                  २. निवडलेल्या दिनांकाचे रुग्ण व निकाल (Patient Results List) - <span id="dgBatchPatientCountText" style="color:#2b6cb0;">० रुग्ण</span>:
                </div>
                
                <!-- Quick Set Bulk Actions -->
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <span style="font-size:12px; font-weight:700; color:#718096; margin-right:4px;">त्वरित निकाल लावा:</span>
                  <button type="button" class="sheet-btn" style="padding:4px 10px; font-size:11.5px; background:#c6f6d5; color:#22543d; border-color:#9ae6b4; font-weight:700;" onclick="setBatchBulkResult('Negative')">
                    🟢 सर्वांना Negative करा
                  </button>
                  <button type="button" class="sheet-btn" style="padding:4px 10px; font-size:11.5px; background:#fed7d7; color:#9b2c2c; border-color:#feb2b2; font-weight:700;" onclick="setBatchBulkResult('Positive')">
                    🔴 सर्वांना Positive करा
                  </button>
                  <button type="button" class="sheet-btn" style="padding:4px 10px; font-size:11.5px; background:#edf2f7; color:#4a5568; border-color:#e2e8f0;" onclick="setBatchBulkResult('Pending')">
                    ⏳ प्रलंबित ठेवा (Pending)
                  </button>
                </div>
              </div>

              <!-- Table -->
              <div class="table-container" style="border:1px solid #cbd5e0; border-radius:8px;">
                <table class="app-table" id="tblDengueBatchResults">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="width:40px; text-align:center;">अ.क्र.</th>
                      <th style="min-width:180px;" class="text-left">रुग्णाचे नाव (Patient Name)</th>
                      <th>गाव (Village)</th>
                      <th style="width:90px; text-align:center;">वय / लिंग</th>
                      <th style="min-width:160px; text-align:center;" id="thBatchDengue">डेंगी निकाल (Dengue Result)</th>
                      <th style="min-width:160px; text-align:center;" id="thBatchChik">चिकनगुनिया निकाल (Chik Result)</th>
                      <th style="min-width:150px;">वैयक्तिक शेरा (Patient Remarks)</th>
                    </tr>
                  </thead>
                  <tbody id="tblDengueBatchBody">
                    <tr>
                      <td colspan="7" style="text-align:center; padding:35px; color:#718096; font-size:13.5px;">
                        कृपया वरून नमुना पाठवल्याचा दिनांक निवडा.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Save Complete Batch Button -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #e2e8f0; padding-top:16px;">
              <span id="dgBatchSaveStatusMsg" style="font-size:13.5px; font-weight:700; color:#2b6cb0;"></span>
              <button type="button" class="sheet-btn" id="btnSaveBatchReport" style="background:#2b6cb0; color:#fff; font-size:14px; font-weight:800; padding:12px 28px; border-radius:8px; box-shadow:0 2px 6px rgba(43,108,176,0.3);" onclick="saveBatchLabReport()">
                💾 संपूर्ण बॅचचा एकत्रित अहवाल सेव्ह करा (Save Complete Batch Report)
              </button>
            </div>

          </div>
        </div>

"""

if 'id="subpaneDengueBatch"' not in text and target_subpane in text:
    text = text.replace(target_subpane, batch_subpane_html + target_subpane, 1)
    print("Added subpaneDengueBatch markup!")

# Write updated text
with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Updated index.html structure with batch subpane!")
