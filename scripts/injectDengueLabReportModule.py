import re
import sys

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# ================= 1. ADD KPI SUMMARY STRIP IN DENGUETAB =================
old_banner_end = '<!-- Subtabs Navigation Bar -->'
if 'id="dengueKpiStrip"' not in html:
    kpi_strip_html = """<!-- Dengue & Chikungunya Live KPI Summary Cards -->
        <div id="dengueKpiStrip" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:20px;">
          <div class="stat-card" style="border-top:3px solid #3182ce; padding:14px 16px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="font-size:12px; font-weight:700; color:#718096; text-transform:uppercase;">🧪 एकूण सिरम नमुने</div>
            <div style="font-size:24px; font-weight:800; color:#2b6cb0; margin-top:4px;" id="dgKpiTotalSamples">0</div>
            <div style="font-size:11px; color:#a0aec0; margin-top:2px;">पाठवलेले सर्व संशयित नमुने</div>
          </div>
          <div class="stat-card" style="border-top:3px solid #e53e3e; padding:14px 16px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="font-size:12px; font-weight:700; color:#e53e3e; text-transform:uppercase;">🔴 डेंगी पॉझिटिव्ह</div>
            <div style="font-size:24px; font-weight:800; color:#c53030; margin-top:4px;" id="dgKpiDenguePos">0</div>
            <div style="font-size:11px; color:#e53e3e; margin-top:2px;">NS1 किंवा IgM पॉझिटिव्ह</div>
          </div>
          <div class="stat-card" style="border-top:3px solid #dd6b20; padding:14px 16px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="font-size:12px; font-weight:700; color:#dd6b20; text-transform:uppercase;">🦠 चिकनगुनिया पॉझिटिव्ह</div>
            <div style="font-size:24px; font-weight:800; color:#c05621; margin-top:4px;" id="dgKpiChikPos">0</div>
            <div style="font-size:11px; color:#dd6b20; margin-top:2px;">Chikungunya IgM पॉझिटिव्ह</div>
          </div>
          <div class="stat-card" style="border-top:3px solid #d69e2e; padding:14px 16px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="font-size:12px; font-weight:700; color:#d69e2e; text-transform:uppercase;">⏳ अहवाल प्रलंबित</div>
            <div style="font-size:24px; font-weight:800; color:#b7791f; margin-top:4px;" id="dgKpiPending">0</div>
            <div style="font-size:11px; color:#d69e2e; margin-top:2px;">लॅब अहवाल येणे बाकी</div>
          </div>
          <div class="stat-card" style="border-top:3px solid #38a169; padding:14px 16px; background:#fff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <div style="font-size:12px; font-weight:700; color:#38a169; text-transform:uppercase;">🟢 निगेटिव्ह नमुने</div>
            <div style="font-size:24px; font-weight:800; color:#276749; margin-top:4px;" id="dgKpiNegative">0</div>
            <div style="font-size:11px; color:#38a169; margin-top:2px;">चाचणी दोषमुक्त नमुने</div>
          </div>
        </div>

        <!-- Subtabs Navigation Bar -->"""
    html = html.replace(old_banner_end, kpi_strip_html, 1)
    print("Added KPI strip in dengueTab!")

# ================= 2. UPDATE FILTER BAR IN REGISTER =================
old_filter_bar = """<select id="dgFilterDate" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व नमुना दिनांक (All Dates) --</option>
                </select>"""
new_filter_bar = """<select id="dgFilterDate" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व नमुना दिनांक (All Dates) --</option>
                </select>
                <select id="dgFilterDengueResult" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व डेंगी अहवाल (All Dengue) --</option>
                  <option value="Pending">⏳ डेंगी प्रलंबित (Pending)</option>
                  <option value="Positive">🔴 डेंगी पॉझिटिव्ह (Positive)</option>
                  <option value="Negative">🟢 डेंगी निगेटिव्ह (Negative)</option>
                  <option value="Equivocal">🟠 डेंगी संशयित (Equivocal)</option>
                </select>
                <select id="dgFilterChikResult" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व चिकनगुनिया अहवाल (All Chikungunya) --</option>
                  <option value="Pending">⏳ चिकनगुनिया प्रलंबित (Pending)</option>
                  <option value="Positive">🔴 चिकनगुनिया पॉझिटिव्ह (Positive)</option>
                  <option value="Negative">🟢 चिकनगुनिया निगेटिव्ह (Negative)</option>
                  <option value="Equivocal">🟠 चिकनगुनिया संशयित (Equivocal)</option>
                </select>"""

if 'id="dgFilterDengueResult"' not in html and old_filter_bar in html:
    html = html.replace(old_filter_bar, new_filter_bar, 1)
    print("Added Dengue & Chikungunya Result Filters to Register!")

# ================= 3. UPDATE TABLE HEADER COLUMNS =================
old_table_headers = """                    <th>नमुना दिनांक</th>
                    <th>लक्षणे दिवस</th>
                    <th>रक्तस्राव</th>
                    <th style="text-align:center;">कृती (Actions)</th>"""
new_table_headers = """                    <th>नमुना दिनांक</th>
                    <th style="min-width:140px; text-align:center;">डेंगी अहवाल (Dengue)</th>
                    <th style="min-width:140px; text-align:center;">चिकनगुनिया अहवाल (Chik)</th>
                    <th>लक्षणे / रक्तस्राव</th>
                    <th style="text-align:center; min-width:160px;">कृती (Actions)</th>"""

if 'डेंगी अहवाल (Dengue)' not in html and old_table_headers in html:
    html = html.replace(old_table_headers, new_table_headers, 1)
    print("Updated table headers with separate Dengue & Chikungunya report columns!")

# ================= 4. ADD LAB REPORT MODAL & FILE VIEWER MODAL =================
modal_insert_target = '  <div id="importCsvModal" class="sheet-modal">'
lab_report_modals = """  <!-- ================= DENGUE & CHIKUNGUNYA LAB REPORT UPDATE MODAL ================= -->
  <div id="dengueLabReportModal" class="sheet-modal">
    <div class="sheet-modal-body" style="max-width:820px; width:95%; border-radius:14px; padding:22px 26px;">
      
      <!-- Modal Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #fed7aa; padding-bottom:12px; margin-bottom:18px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; border-radius:10px; background:#dd6b20; color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px;">
            🔬
          </div>
          <div>
            <h3 style="margin:0; font-size:18px; font-weight:800; color:#7b341e;">
              प्रयोगशाळा तपासणी अहवाल नोंदणी व अपडेट
            </h3>
            <p style="margin:2px 0 0 0; font-size:12.5px; color:#9c4221;">
              शासकीय वैद्यकीय महाविद्यालय (GMC) / प्रयोगशाळेकडून प्राप्त अहवाल, संदर्भ क्र., दिनांक व स्कॅन प्रत नोंदवा.
            </p>
          </div>
        </div>
        <button type="button" class="close-btn" onclick="closeLabReportModal()" style="font-size:24px; color:#a0aec0; background:none; border:none; cursor:pointer;">✕</button>
      </div>

      <!-- Patient Information Banner -->
      <div style="background:#fffaf0; border:1px solid #fbd38d; border-radius:10px; padding:12px 16px; margin-bottom:18px; display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; font-size:13px;">
        <div><span style="color:#744210; font-weight:600;">रुग्णाचे नाव:</span> <b id="dgModalPatientName" style="color:#1a202c; text-transform:uppercase;">-</b></div>
        <div><span style="color:#744210; font-weight:600;">नोंदणी क्र.:</span> <b id="dgModalRegNo" style="color:#2b6cb0;">-</b></div>
        <div><span style="color:#744210; font-weight:600;">गाव / उपकेंद्र:</span> <b id="dgModalVillage" style="color:#1a202c;">-</b></div>
        <div><span style="color:#744210; font-weight:600;">वय / लिंग:</span> <b id="dgModalAgeSex" style="color:#1a202c;">-</b></div>
        <div><span style="color:#744210; font-weight:600;">नमुना गोळा दिनांक:</span> <b id="dgModalCollDate" style="color:#1a202c;">-</b></div>
        <div><span style="color:#744210; font-weight:600;">जावक क्र.:</span> <b id="dgModalOutwardNo" style="color:#1a202c;">-</b></div>
      </div>

      <!-- Time Separation Notice & Disease Tab Selectors -->
      <div style="background:#ebf8ff; border:1px solid #bee3f8; border-radius:8px; padding:10px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="font-size:12px; color:#2b6cb0; font-weight:600; display:flex; align-items:center; gap:6px;">
          <span>💡</span> डेंगी व चिकनगुनिया अहवाल वेगवेगळ्या वेळी उपलब्ध झाल्यास फक्त एका आजाराचा अहवाल स्वतंत्रपणे सेव्ह करू शकता.
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="sheet-btn dg-disease-btn" id="btnDiseaseBoth" style="padding:4px 10px; font-size:12px; font-weight:700; background:#3182ce; color:#fff;" onclick="switchReportDiseaseTab('both')">⭐ दोन्ही आजार</button>
          <button type="button" class="sheet-btn dg-disease-btn" id="btnDiseaseDengue" style="padding:4px 10px; font-size:12px; font-weight:700; background:#edf2f7; color:#4a5568;" onclick="switchReportDiseaseTab('dengue')">🦟 फक्त डेंगी</button>
          <button type="button" class="sheet-btn dg-disease-btn" id="btnDiseaseChik" style="padding:4px 10px; font-size:12px; font-weight:700; background:#edf2f7; color:#4a5568;" onclick="switchReportDiseaseTab('chikungunya')">🦠 फक्त चिकनगुनिया</button>
        </div>
      </div>

      <input type="hidden" id="dgModalPatientId" value="">
      <input type="hidden" id="dgModalActiveDisease" value="both">

      <!-- Form Container with Side-by-Side or Single View -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:18px; margin-bottom:18px;">
        
        <!-- SECTION A: DENGUE LAB REPORT -->
        <div id="sectionDengueReport" style="border:1.5px solid #fed7aa; background:#fff; border-radius:10px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1.5px solid #ffedd5; padding-bottom:8px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🦟</span>
              <h4 style="margin:0; font-size:15px; font-weight:800; color:#9a3412;">डेंगी चाचणी अहवाल (Dengue Test)</h4>
            </div>
            <span id="badgeDengueCurrentStatus" style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:#edf2f7; color:#4a5568;">Pending</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label class="form-label" style="font-weight:700; color:#7c2d12;">१. अहवाल निष्कर्ष (Test Result) <span style="color:#e53e3e;">*</span></label>
              <select id="dgModalDengueResult" class="form-control" style="font-weight:700; border-color:#fed7aa;" onchange="updateModalStatusBadges()">
                <option value="Pending">⏳ Pending (प्रलंबित / अद्याप प्राप्त नाही)</option>
                <option value="Positive" style="color:#c53030; font-weight:700;">🔴 Positive (पॉझिटिव्ह / बाधित)</option>
                <option value="Negative" style="color:#276749; font-weight:700;">🟢 Negative (निगेटिव्ह / दोषमुक्त)</option>
                <option value="Equivocal" style="color:#c05621; font-weight:700;">🟠 Equivocal (संशयित / अनिश्चित)</option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label class="form-label" style="font-weight:600;">२. चाचणी प्रकार (Test Type)</label>
                <select id="dgModalDengueTestType" class="form-control">
                  <option value="NS1 Ag ELISA">NS1 Ag ELISA</option>
                  <option value="Dengue IgM ELISA">Dengue IgM ELISA</option>
                  <option value="NS1 Ag & IgM ELISA">NS1 Ag & IgM ELISA</option>
                  <option value="Rapid Card Test">Rapid Card Test</option>
                  <option value="RT-PCR">RT-PCR</option>
                </select>
              </div>
              <div>
                <label class="form-label" style="font-weight:600;">३. अहवाल प्राप्त दिनांक</label>
                <input type="date" id="dgModalDengueReportDate" class="form-control">
              </div>
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">४. प्रयोगशाळा अहवाल संदर्भ क्र. (Report Ref No)</label>
              <input type="text" id="dgModalDengueReportRef" class="form-control" placeholder="उदा. GMC/MICRO/2026/DEN-104">
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">५. प्रयोगशाळा अहवाल फाईल (Upload Report File)</label>
              <input type="file" id="dgModalDengueFile" accept="image/*,.pdf" class="form-control" style="font-size:12px; padding:6px;" onchange="handleModalFileUpload(event, 'dengue')">
              <div id="dgModalDengueFileStatus" style="font-size:11.5px; margin-top:4px; color:#4a5568;"></div>
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">६. शेरा / टीप (Remarks)</label>
              <input type="text" id="dgModalDengueRemarks" class="form-control" placeholder="उदा. NS1 Positive, Platelet normal">
            </div>
          </div>
        </div>

        <!-- SECTION B: CHIKUNGUNYA LAB REPORT -->
        <div id="sectionChikReport" style="border:1.5px solid #fed7aa; background:#fff; border-radius:10px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1.5px solid #ffedd5; padding-bottom:8px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🦠</span>
              <h4 style="margin:0; font-size:15px; font-weight:800; color:#9a3412;">चिकनगुनिया चाचणी अहवाल (Chikungunya Test)</h4>
            </div>
            <span id="badgeChikCurrentStatus" style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:#edf2f7; color:#4a5568;">Pending</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label class="form-label" style="font-weight:700; color:#7c2d12;">१. अहवाल निष्कर्ष (Test Result) <span style="color:#e53e3e;">*</span></label>
              <select id="dgModalChikResult" class="form-control" style="font-weight:700; border-color:#fed7aa;" onchange="updateModalStatusBadges()">
                <option value="Pending">⏳ Pending (प्रलंबित / अद्याप प्राप्त नाही)</option>
                <option value="Positive" style="color:#c53030; font-weight:700;">🔴 Positive (पॉझिटिव्ह / बाधित)</option>
                <option value="Negative" style="color:#276749; font-weight:700;">🟢 Negative (निगेटिव्ह / दोषमुक्त)</option>
                <option value="Equivocal" style="color:#c05621; font-weight:700;">🟠 Equivocal (संशयित / अनिश्चित)</option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label class="form-label" style="font-weight:600;">२. चाचणी प्रकार (Test Type)</label>
                <select id="dgModalChikTestType" class="form-control">
                  <option value="Chikungunya IgM ELISA">Chikungunya IgM ELISA</option>
                  <option value="Rapid Card Test">Rapid Card Test</option>
                  <option value="RT-PCR">RT-PCR</option>
                </select>
              </div>
              <div>
                <label class="form-label" style="font-weight:600;">३. अहवाल प्राप्त दिनांक</label>
                <input type="date" id="dgModalChikReportDate" class="form-control">
              </div>
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">४. प्रयोगशाळा अहवाल संदर्भ क्र. (Report Ref No)</label>
              <input type="text" id="dgModalChikReportRef" class="form-control" placeholder="उदा. GMC/MICRO/2026/CHIK-78">
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">५. प्रयोगशाळा अहवाल फाईल (Upload Report File)</label>
              <input type="file" id="dgModalChikFile" accept="image/*,.pdf" class="form-control" style="font-size:12px; padding:6px;" onchange="handleModalFileUpload(event, 'chikungunya')">
              <div id="dgModalChikFileStatus" style="font-size:11.5px; margin-top:4px; color:#4a5568;"></div>
            </div>

            <div>
              <label class="form-label" style="font-weight:600;">६. शेरा / टीप (Remarks)</label>
              <input type="text" id="dgModalChikRemarks" class="form-control" placeholder="उदा. IgM Positive, Joint pain persisting">
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Footer Actions -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #fed7aa; padding-top:14px; margin-top:10px;">
        <span id="dgModalSaveMsg" style="font-size:13px; font-weight:600; color:#c05621;"></span>
        <div style="display:flex; gap:10px;">
          <button type="button" class="sheet-btn" style="background:#e2e8f0; color:#4a5568;" onclick="closeLabReportModal()">रद्द करा (Cancel)</button>
          <button type="button" class="sheet-btn" id="btnSaveLabReportModal" style="background:#dd6b20; color:#fff; font-weight:700; padding:9px 20px;" onclick="saveLabReportModal()">
            💾 अहवाल सेव्ह करा (Save Report)
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- ================= DENGUE REPORT FILE PREVIEW MODAL ================= -->
  <div id="dengueFileViewModal" class="sheet-modal">
    <div class="sheet-modal-body" style="max-width:850px; width:95%; max-height:92vh; border-radius:12px; padding:18px 22px; display:flex; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">📎</span>
          <div>
            <h4 style="margin:0; font-size:16px; font-weight:700;" id="dgFileViewerTitle">प्रयोगशाळा अहवाल फाईल</h4>
            <div style="font-size:12px; color:#718096;" id="dgFileViewerSubtitle">-</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <a id="dgFileViewerDownloadBtn" href="#" download="report" class="sheet-btn" style="background:#ebf8ff; color:#2b6cb0; text-decoration:none; padding:5px 12px; font-size:12px; font-weight:600;">📥 डाऊनलोड</a>
          <button type="button" class="close-btn" onclick="closeDengueFileViewModal()" style="font-size:22px; color:#a0aec0; background:none; border:none; cursor:pointer;">✕</button>
        </div>
      </div>
      <div id="dgFileViewerContent" style="flex:1; overflow:auto; min-height:450px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
      </div>
    </div>
  </div>
"""

if 'id="dengueLabReportModal"' not in html and modal_insert_target in html:
    html = html.replace(modal_insert_target, lab_report_modals + modal_insert_target, 1)
    print("Added dengueLabReportModal and dengueFileViewModal!")

# Write updated HTML structure
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Updated index.html structure successfully!")
