import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Add Sidebar Button after sideBtnHomeVisit
if 'id="sideBtnDengue"' not in html:
    sidebar_target = 'onclick="openHomeVisitEntryDirect(this)">🚶‍♂️ गृहभेटी डेटा एन्ट्री (Home Visits)</button>'
    sidebar_dengue_btn = sidebar_target + '\n      <button class="tab-btn" id="sideBtnDengue" data-tab="dengueTab" style="border-left:3px solid #dd6b20; background:rgba(221, 107, 32, 0.05); font-weight:700; color:#c05621;" onclick="switchTab(\'dengueTab\', this)">🦟 डेंगी व चिकनगुनिया (Dengue)</button>'
    html = html.replace(sidebar_target, sidebar_dengue_btn, 1)
    print("Added sideBtnDengue in sidebar!")

# 2. Add Mobile Drawer Button after homeVisitEntry
if 'data-tab="dengueTab"' not in html:
    drawer_target = 'onclick="handleDrawerNav(\'homeVisitEntry\')">🚶‍♂️ गृहभेटी डेटा एन्ट्री (Home Visits)</button>'
    drawer_dengue_btn = drawer_target + '\n      <button type="button" class="mobile-drawer-btn" data-tab="dengueTab" style="color:#c05621; font-weight:700; background:#fffaf0;" onclick="handleDrawerNav(\'dengueTab\')">🦟 डेंगी व चिकनगुनिया सिरम नमुने</button>'
    html = html.replace(drawer_target, drawer_dengue_btn, 1)
    print("Added dengueTab in mobile drawer!")

# 3. Add Dengue KPI Card in stats-container
if 'dashDengueSamplesCount' not in html:
    kpi_target = '<div class="stat-card" style="border-top: 3px solid #e53e3e;">'
    kpi_dengue_card = """<div class="stat-card" style="border-top:3px solid #dd6b20; cursor:pointer;" onclick="switchTab('dengueTab')" title="डेंगी व चिकनगुनिया नमुने व्यवस्थापन उघडा">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="margin:0; color:#c05621;">डेंगी सिरम नमुने</h4>
              <span style="font-size:18px;">🦟</span>
            </div>
            <div class="value" id="dashDengueSamplesCount" style="color:#c05621; margin:6px 0;">5</div>
            <div class="sub-text" style="color:#718096; font-size:11.5px;">GMC लातूर तपासणीसाठी नमुने ↗️</div>
          </div>
          """ + kpi_target
    html = html.replace(kpi_target, kpi_dengue_card, 1)
    print("Added Dengue KPI card in dashboard stats-container!")

# 4. Add the full #dengueTab Markup right before uploadTab
if 'id="dengueTab"' not in html:
    upload_target = '<!-- ================= DATA UPLOAD & VALIDATION TAB ================= -->'
    dengue_tab_html = """<!-- ================= DENGUE & CHIKUNGUNYA MANAGEMENT TAB ================= -->
      <div id="dengueTab" class="tab-pane">
        
        <!-- Header Banner & Navigation -->
        <div style="background:linear-gradient(135deg, #fffaf0 0%, #feebc8 100%); border:1.5px solid #dd6b20; border-radius:12px; padding:18px 20px; margin-bottom:20px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:48px; height:48px; background:#dd6b20; color:#fff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 2px 6px rgba(221,107,32,0.3);">
                🦟
              </div>
              <div>
                <h3 style="margin:0; color:#7b341e; font-size:18px; font-weight:800;">
                  डेंगी व चिकनगुनिया सिरम नमुना व केस हिस्ट्री व्यवस्थापन
                </h3>
                <div style="font-size:12.5px; color:#9c4221; margin-top:3px; font-weight:600;">
                  National Institute of Virology (NIV), Pune विहित नमुना व GMC लातूर प्रयोगशाळा जावक पत्र
                </div>
              </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <button type="button" class="sheet-btn" style="background:#c05621; color:#fff; font-weight:700;" onclick="switchDengueSubtab('letter')">
                📄 GMC लातूर पत्र
              </button>
              <button type="button" class="sheet-btn" style="background:#2b6cb0; color:#fff; font-weight:700;" onclick="switchDengueSubtab('sheets')">
                📑 NIV केस शीट्स
              </button>
              <button type="button" class="sheet-btn" style="background:#24292e; color:#fff; font-weight:700;" onclick="exportDengueCsvClient()">
                📥 Excel / CSV डाऊनलोड
              </button>
            </div>
          </div>
        </div>

        <!-- Dengue Subtabs Navigation -->
        <div class="table-subtabs" style="margin-bottom:18px;">
          <button id="dengueSubtabBtnEntry" class="subtab-btn active" onclick="switchDengueSubtab('entry')">
            📝 नवीन रुग्ण नोंद (New Entry)
          </button>
          <button id="dengueSubtabBtnRegister" class="subtab-btn" onclick="switchDengueSubtab('register')">
            📋 नमुने नोंदवही व यादी (Register & Samples)
          </button>
          <button id="dengueSubtabBtnLetter" class="subtab-btn" onclick="switchDengueSubtab('letter')">
            📄 GMC लातूर जावक पत्र (GMC Letter)
          </button>
          <button id="dengueSubtabBtnSheets" class="subtab-btn" onclick="switchDengueSubtab('sheets')">
            📑 NIV केस हिस्ट्री शीट्स (NIV Case Sheets)
          </button>
        </div>

        <!-- ================= SUBPANE 1: DATA ENTRY FORM ================= -->
        <div id="subpaneDengueEntry">
          <div class="sheet-card" style="border-top:4px solid #dd6b20;">
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:22px;">📝</span>
                <div>
                  <div id="dengueFormModeTitle">डेंगी व चिकनगुनिया संशयित सिरम नमुना नोंद फॉर्म</div>
                  <div style="font-size:12px; color:var(--text-muted); font-weight:500;">
                    NIV Pune Case History Sheet आणि GMC लातूर प्रयोगशाळेसाठी आवश्यक सर्व तपशील भरा.
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <span class="sheet-badge" id="dengueFormStatusBadge" style="background:#feebc8; color:#7b341e; border-color:#fbd38d;">
                  ✨ नवीन नोंद (New Record)
                </span>
              </div>
            </div>

            <form id="frmDengueEntry" onsubmit="handleDengueFormSubmit(event)">
              <input type="hidden" id="dengueRecordId" value="">

              <!-- SECTION 1: रुग्णाची प्राथमिक व पत्ता माहिती -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px; margin-bottom:18px;">
                <div style="font-weight:700; color:#2d3748; font-size:14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                  <span>👤 १. रुग्णाची माहिती व पत्ता (Patient Details & Address)</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:14px;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label>रुग्णाचे संपूर्ण नाव (Full Name of Patient) <span style="color:#e53e3e;">*</span></label>
                    <input type="text" id="dgPatientName" required placeholder="उदा. CHAYA DAYANAND HAJARE" style="text-transform:uppercase; font-weight:700;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>मोबाईल क्रमांक (Mobile Number)</label>
                    <input type="text" id="dgMobile" maxlength="10" placeholder="उदा. 9356371517">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>गाव (Village) <span style="color:#e53e3e;">*</span></label>
                    <input type="text" id="dgVillage" required list="dengueVillageList" placeholder="उदा. भादा, भेटा, काळमाथा..." style="font-weight:600;">
                    <datalist id="dengueVillageList"></datalist>
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>घर क्रमांक (House No)</label>
                    <input type="text" id="dgHouseNo" placeholder="डीफॉल्ट: -" value="-">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>तालुका (Taluka)</label>
                    <input type="text" id="dgTaluka" value="AUSA" style="font-weight:600;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>जिल्हा (District)</label>
                    <input type="text" id="dgDistrict" value="LATUR" style="font-weight:600;">
                  </div>
                </div>
              </div>

              <!-- SECTION 2: रुग्णालय व डेमोग्राफिक्स -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px; margin-bottom:18px;">
                <div style="font-weight:700; color:#2d3748; font-size:14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                  <span>🏥 २. रुग्णालय व नोंदणी माहिती (Hospital & Demographics)</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label>रुग्णालय पत्ता (Hospital Address)</label>
                    <input type="text" id="dgHospitalAddress" value="प्राथमिक आरोग्य केंद्र भादा" style="font-weight:600;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>रुग्ण नोंदणी क्र. (Patient Reg No)</label>
                    <input type="text" id="dgPatientRegNo" placeholder="उदा. 27-34760918" style="font-weight:700; color:#2b6cb0;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>वार्ड क्र. (Ward No) & बेड क्र. (Bed No)</label>
                    <div style="display:flex; gap:8px;">
                      <input type="text" id="dgWardNo" placeholder="Ward: --" value="--">
                      <input type="text" id="dgBedNo" placeholder="Bed: --" value="--">
                    </div>
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>वय (Age in Years) <span style="color:#e53e3e;">*</span></label>
                    <input type="number" id="dgAge" min="1" max="120" required placeholder="उदा. 39" style="font-weight:700;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>लिंग (Sex) <span style="color:#e53e3e;">*</span></label>
                    <select id="dgSex" required style="font-weight:700;">
                      <option value="FEMALE">स्त्री (FEMALE)</option>
                      <option value="MALE">पुरुष (MALE)</option>
                      <option value="OTHER">इतर (OTHER)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- SECTION 3: नमुना व क्लिनिकल लक्षणे -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px; margin-bottom:18px;">
                <div style="font-weight:700; color:#2d3748; font-size:14px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                  <span>🧪 ३. नमुना व क्लिनिकल लक्षणे (Sample & Clinical Findings)</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label>पहिले लक्षण सुरू दिनांक (Onset Date) <span style="color:#e53e3e;">*</span></label>
                    <input type="date" id="dgDateOnset" required>
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>नमुन्याचा प्रकार (Nature of Sample) <span style="color:#e53e3e;">*</span></label>
                    <select id="dgSampleNature" required style="font-weight:600;">
                      <option value="Serum" selected>Serum (सिरम)</option>
                      <option value="Blood">Blood (रक्त)</option>
                      <option value="CSF">CSF</option>
                    </select>
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>नमुना घेतल्याचा दिनांक (Collection Date) <span style="color:#e53e3e;">*</span></label>
                    <input type="date" id="dgDateCollection" required>
                  </div>
                </div>

                <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:12px 14px;">
                  <div style="font-size:13px; font-weight:700; color:#4a5568; margin-bottom:10px;">
                    क्लिनिकल लक्षणे (दिवस संख्या - Clinical Findings in Days):
                  </div>
                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">१. ताप (Fever Days)</label>
                      <input type="number" id="dgClinicalFever" min="0" max="60" value="1" style="font-weight:700;">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">२. डोकेदुखी (Headache)</label>
                      <input type="number" id="dgClinicalHeadache" min="0" max="60" value="0">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">३. अंगदुखी (Bodyache)</label>
                      <input type="number" id="dgClinicalBodyache" min="0" max="60" value="0">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">४. सांधेदुखी (Joint Pain)</label>
                      <input type="number" id="dgClinicalJointPain" min="0" max="60" value="0">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">५. डोळ्यांमागे दुखणे</label>
                      <input type="number" id="dgClinicalRetroOrbital" min="0" max="60" value="0">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                      <label style="font-size:12px;">६. अंगावर पुरळ (Rash)</label>
                      <input type="number" id="dgClinicalRash" min="0" max="60" value="0">
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 4: रक्तस्राव लक्षणे व वैद्यकीय अधिकारी -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:14px; margin-bottom:20px;">
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                  <div style="font-weight:700; color:#2d3748; font-size:14px; margin-bottom:10px;">
                    🩸 ४. रक्तस्राव लक्षणे (Haemorrhagic Manifestation)
                  </div>
                  <div class="form-group" style="margin-bottom:10px;">
                    <label>रक्तस्राव लक्षणे आहेत का? (Yes / No)</label>
                    <select id="dgHaemorrhagic" onchange="toggleDengueHaemFields()" style="font-weight:700;">
                      <option value="No" selected>No (नाही)</option>
                      <option value="Yes">Yes (होय)</option>
                    </select>
                  </div>
                  <div id="dgHaemDetailsBox" style="display:none; padding-top:6px; border-top:1px dashed #cbd5e0;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                      <input type="text" id="dgHematemesis" placeholder="a. Hematemesis (उलटी)">
                      <input type="text" id="dgEpistaxis" placeholder="b. Epistaxis (नाक)">
                      <input type="text" id="dgMelena" placeholder="c. Melena (शौच)">
                      <input type="text" id="dgHaemOther" placeholder="d. इतर तपशील">
                    </div>
                  </div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 18px;">
                  <div style="font-weight:700; color:#2d3748; font-size:14px; margin-bottom:10px;">
                    🩺 ५. वैद्यकीय अधिकारी माहिती (Medical Officer)
                  </div>
                  <div class="form-group" style="margin-bottom:8px;">
                    <label>वैद्यकीय अधिकाऱ्याचे नाव</label>
                    <input type="text" id="dgDoctorName" value="Dr. Patil S.S." style="font-weight:700;">
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label>मोबाईल क्रमांक</label>
                    <input type="text" id="dgDoctorMobile" value="9689686901" style="font-weight:600;">
                  </div>
                </div>
              </div>

              <!-- Form Buttons -->
              <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                <button type="submit" class="btn-primary" id="btnSaveDengueRecord" style="background:#c05621;">
                  💾 नोंद जतन करा (Save Entry)
                </button>
                <button type="button" class="btn-primary" id="btnSaveAndPrintNiv" onclick="saveAndPrintNivSheet()" style="background:#2b6cb0;">
                  🖨️ जतन करा व NIV केस शीट प्रिंट करा
                </button>
                <button type="button" class="btn-secondary" onclick="resetDengueForm()">
                  🔄 फॉर्म साफ करा (Reset)
                </button>
                <span id="dengueFormMsg" style="font-weight:700; font-size:13.5px; margin-left:8px;"></span>
              </div>
            </form>
          </div>
        </div>

        <!-- ================= SUBPANE 2: PATIENT REGISTER ================= -->
        <div id="subpaneDengueRegister" style="display:none;">
          <div class="sheet-card">
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:22px;">📋</span>
                <div>
                  <div>डेंगी व चिकनगुनिया संशयित रुग्ण नोंदवही (Sample Register)</div>
                  <div style="font-size:12px; color:var(--text-muted); font-weight:500;">
                    सर्व संकलित सिरम नमुन्यांची तपशीलवार यादी, शोध आणि प्रिंट पर्याय.
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <button type="button" class="sheet-btn" style="background:#c05621; color:#fff;" onclick="printSelectedNivSheets()">
                  🖨️ निवडलेल्यांचे NIV केस शीट प्रिंट करा
                </button>
                <button type="button" class="sheet-btn" onclick="exportDengueCsvClient()">
                  📥 CSV एक्सपोर्ट
                </button>
              </div>
            </div>

            <!-- Filter Controls -->
            <div class="filter-bar" style="margin-bottom:14px;">
              <div class="filter-inputs">
                <input type="text" id="dgFilterSearch" class="filter-search" placeholder="🔍 रुग्ण नाव, नोंदणी क्र., मोबाईल, गावाने शोधा..." oninput="filterDengueTable()">
                <select id="dgFilterVillage" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व गावे (All Villages) --</option>
                </select>
                <select id="dgFilterDate" class="filter-select" onchange="filterDengueTable()">
                  <option value="All">-- सर्व नमुना दिनांक (All Dates) --</option>
                </select>
              </div>
              <div style="font-size:12.5px; font-weight:700; color:#4a5568;">
                एकूण नोंदी: <span id="dgRegisterCount" style="color:#c05621; font-size:15px;">0</span>
              </div>
            </div>

            <div class="table-scroll-hint">➡️ तक्ता संपूर्ण पाहण्यासाठी उजवीकडे स्क्रोल करा.</div>
            <div class="table-container">
              <table class="app-table" id="tblDengueRegister">
                <thead>
                  <tr>
                    <th style="width:36px; text-align:center;"><input type="checkbox" id="dgSelectAllCb" onchange="toggleAllDengueCb(this)"></th>
                    <th style="width:45px; text-align:center;">अ.क्र.</th>
                    <th>नोंदणी क्र. (Reg No)</th>
                    <th class="text-left">रुग्णाचे नाव (Patient Name)</th>
                    <th>गाव (Village)</th>
                    <th>वय / लिंग</th>
                    <th>नमुना दिनांक</th>
                    <th>लक्षणे दिवस</th>
                    <th>रक्तस्राव</th>
                    <th style="text-align:center;">कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody id="tblDengueRegisterBody">
                  <tr><td colspan="10" style="text-align:center; padding:30px; color:#718096;">डेटा लोड होत आहे... ⏳</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ================= SUBPANE 3: GMC LATUR FORWARDING LETTER ================= -->
        <div id="subpaneDengueLetter" style="display:none;">
          <div class="sheet-card">
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:22px;">📄</span>
                <div>
                  <div>शासकीय वैद्यकीय महाविद्यालय (GMC), लातूर - नमुने पाठविण्याचे अधिकृत पत्र</div>
                  <div style="font-size:12px; color:var(--text-muted); font-weight:500;">
                    प्रयोगशाळेस सिरम नमुने तपासणीसाठी पाठविण्याचे स्वाक्षरीयुक्त पत्र.
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <button type="button" class="btn-primary" style="background:#c05621;" onclick="printGmcLetterDirect()">
                  🖨️ पत्र प्रिंट करा (Print / PDF)
                </button>
              </div>
            </div>

            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:18px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-weight:700; font-size:13px; color:#2d3748;">नमुना दिनांक निवडा:</label>
                <select id="dgLetterDateSelect" class="filter-select" onchange="renderGmcLetterPreview()" style="font-weight:700; min-width:160px;"></select>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-weight:700; font-size:13px; color:#2d3748;">जावक क्रमांक (Outward No):</label>
                <input type="text" id="dgLetterOutwardNo" placeholder="उदा. /2026" oninput="renderGmcLetterPreview()" style="max-width:140px; font-weight:700;">
              </div>
              <button type="button" class="sheet-btn" style="background:#4a5568; color:#fff;" onclick="renderGmcLetterPreview()">
                🔄 प्रिव्ह्यू रीफ्रेश करा
              </button>
            </div>

            <!-- Letter Preview Container -->
            <div id="gmcLetterPreviewContainer" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; padding:25px; box-shadow:var(--shadow-sm); min-height:500px;">
              <p style="text-align:center; color:#718096; padding:40px;">पत्र लोड होत आहे... ⏳</p>
            </div>
          </div>
        </div>

        <!-- ================= SUBPANE 4: NIV CASE HISTORY SHEETS ================= -->
        <div id="subpaneDengueSheets" style="display:none;">
          <div class="sheet-card">
            <div class="sheet-card-header">
              <div class="sheet-title">
                <span style="font-size:22px;">📑</span>
                <div>
                  <div>National Institute of Virology (NIV), Pune - केस हिस्ट्री शीट्स</div>
                  <div style="font-size:12px; color:var(--text-muted); font-weight:500;">
                    रुग्णनिहाय अधिकृत केस हिस्ट्री शीट (Case History Sheet for Dengue / Chikungunya).
                  </div>
                </div>
              </div>
              <div class="sheet-actions">
                <button type="button" class="btn-primary" style="background:#2b6cb0;" onclick="printNivSheetsDirect()">
                  🖨️ सर्व शीट्स प्रिंट करा (Batch Print All)
                </button>
              </div>
            </div>

            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:18px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <label style="font-weight:700; font-size:13px; color:#2d3748;">नमुना दिनांक किंवा रुग्ण निवडा:</label>
                <select id="dgSheetsDateSelect" class="filter-select" onchange="renderNivSheetsPreview()" style="font-weight:700; min-width:220px;"></select>
              </div>
              <button type="button" class="sheet-btn" style="background:#4a5568; color:#fff;" onclick="renderNivSheetsPreview()">
                🔄 प्रिव्ह्यू रीफ्रेश करा
              </button>
            </div>

            <!-- Sheets Preview Container -->
            <div id="nivSheetsPreviewContainer" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:8px; padding:20px; box-shadow:var(--shadow-sm); min-height:600px;">
              <p style="text-align:center; color:#718096; padding:40px;">केस शीट्स लोड होत आहेत... ⏳</p>
            </div>
          </div>
        </div>

      </div>

      """ + upload_target
    html = html.replace(upload_target, dengue_tab_html, 1)
    print("Added #dengueTab in main-content!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Finished writing dengue tab structure to index.html!")
