import re

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# ================= 1. INJECT CSS STYLES BEFORE </style> =================
css_styles = """
    /* ================= COLOURFUL REPORT CARDS & UPLOAD KPI STYLES ================= */
    .report-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
      gap: 20px;
      margin-top: 18px;
    }

    .report-colour-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 22px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.08);
      border: 1.5px solid rgba(226, 232, 240, 0.9);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }

    .report-colour-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12), 0 3px 8px rgba(15, 23, 42, 0.08);
    }

    .report-colour-card:active {
      transform: translateY(-1px);
    }

    .report-colour-card .card-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .report-colour-card .card-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    .report-colour-card .card-badge {
      font-size: 11.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.2px;
    }

    .report-colour-card .card-title {
      font-size: 16.5px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 6px 0;
      line-height: 1.35;
    }

    .report-colour-card .card-desc {
      font-size: 13px;
      color: #475569;
      line-height: 1.5;
      margin-bottom: 18px;
      flex-grow: 1;
    }

    .report-colour-card .card-btn-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 8px;
      transition: all 0.2s ease;
      margin-top: auto;
      border: 1px solid transparent;
    }

    .report-colour-card:hover .card-btn-action {
      filter: brightness(0.95);
      padding-right: 10px;
    }

    /* THEMES FOR REPORT CARDS */
    .theme-amber {
      border-top: 4px solid #dd6b20 !important;
      background: linear-gradient(145deg, #ffffff 60%, #fffaf0 100%);
    }
    .theme-amber:hover {
      border-color: #dd6b20 !important;
      box-shadow: 0 14px 28px rgba(221, 107, 32, 0.15) !important;
    }
    .theme-amber .card-icon-box { background: #dd6b20; color: #fff; }
    .theme-amber .card-badge { background: #feebc8; color: #9c4221; }
    .theme-amber .card-btn-action { background: #fffaf0; color: #c05621; border-color: #fbd38d; }
    .theme-amber:hover .card-btn-action { background: #dd6b20; color: #fff; }

    .theme-blue {
      border-top: 4px solid #2b6cb0 !important;
      background: linear-gradient(145deg, #ffffff 60%, #ebf8ff 100%);
    }
    .theme-blue:hover {
      border-color: #2b6cb0 !important;
      box-shadow: 0 14px 28px rgba(43, 108, 176, 0.15) !important;
    }
    .theme-blue .card-icon-box { background: #2b6cb0; color: #fff; }
    .theme-blue .card-badge { background: #bee3f8; color: #2a4365; }
    .theme-blue .card-btn-action { background: #ebf8ff; color: #2b6cb0; border-color: #90cdf4; }
    .theme-blue:hover .card-btn-action { background: #2b6cb0; color: #fff; }

    .theme-teal {
      border-top: 4px solid #0d9488 !important;
      background: linear-gradient(145deg, #ffffff 60%, #f0fdfa 100%);
    }
    .theme-teal:hover {
      border-color: #0d9488 !important;
      box-shadow: 0 14px 28px rgba(13, 148, 136, 0.15) !important;
    }
    .theme-teal .card-icon-box { background: #0d9488; color: #fff; }
    .theme-teal .card-badge { background: #ccfbf1; color: #115e59; }
    .theme-teal .card-btn-action { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; }
    .theme-teal:hover .card-btn-action { background: #0d9488; color: #fff; }

    .theme-green {
      border-top: 4px solid #16a34a !important;
      background: linear-gradient(145deg, #ffffff 60%, #f0fdf4 100%);
    }
    .theme-green:hover {
      border-color: #16a34a !important;
      box-shadow: 0 14px 28px rgba(22, 163, 74, 0.15) !important;
    }
    .theme-green .card-icon-box { background: #16a34a; color: #fff; }
    .theme-green .card-badge { background: #dcfce7; color: #166534; }
    .theme-green .card-btn-action { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .theme-green:hover .card-btn-action { background: #16a34a; color: #fff; }

    .theme-purple {
      border-top: 4px solid #7c3aed !important;
      background: linear-gradient(145deg, #ffffff 60%, #faf5ff 100%);
    }
    .theme-purple:hover {
      border-color: #7c3aed !important;
      box-shadow: 0 14px 28px rgba(124, 58, 237, 0.15) !important;
    }
    .theme-purple .card-icon-box { background: #7c3aed; color: #fff; }
    .theme-purple .card-badge { background: #ede9fe; color: #5b21b6; }
    .theme-purple .card-btn-action { background: #faf5ff; color: #6d28d9; border-color: #ddd6fe; }
    .theme-purple:hover .card-btn-action { background: #7c3aed; color: #fff; }

    .theme-red {
      border-top: 4px solid #dc2626 !important;
      background: linear-gradient(145deg, #ffffff 60%, #fef2f2 100%);
    }
    .theme-red:hover {
      border-color: #dc2626 !important;
      box-shadow: 0 14px 28px rgba(220, 38, 38, 0.15) !important;
    }
    .theme-red .card-icon-box { background: #dc2626; color: #fff; }
    .theme-red .card-badge { background: #fee2e2; color: #991b1b; }
    .theme-red .card-btn-action { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .theme-red:hover .card-btn-action { background: #dc2626; color: #fff; }

    .theme-fuchsia {
      border-top: 4px solid #c026d3 !important;
      background: linear-gradient(145deg, #ffffff 60%, #fdf4ff 100%);
    }
    .theme-fuchsia:hover {
      border-color: #c026d3 !important;
      box-shadow: 0 14px 28px rgba(192, 38, 211, 0.15) !important;
    }
    .theme-fuchsia .card-icon-box { background: #c026d3; color: #fff; }
    .theme-fuchsia .card-badge { background: #fae8ff; color: #86198f; }
    .theme-fuchsia .card-btn-action { background: #fdf4ff; color: #a21caf; border-color: #f5d0fe; }
    .theme-fuchsia:hover .card-btn-action { background: #c026d3; color: #fff; }

    .theme-coral {
      border-top: 4px solid #ea580c !important;
      background: linear-gradient(145deg, #ffffff 60%, #fff7ed 100%);
    }
    .theme-coral:hover {
      border-color: #ea580c !important;
      box-shadow: 0 14px 28px rgba(234, 88, 12, 0.15) !important;
    }
    .theme-coral .card-icon-box { background: #ea580c; color: #fff; }
    .theme-coral .card-badge { background: #ffedd5; color: #9a3412; }
    .theme-coral .card-btn-action { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
    .theme-coral:hover .card-btn-action { background: #ea580c; color: #fff; }

    /* ================= UPLOAD KPI GRID AND CARDS ================= */
    .upload-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 16px;
      margin: 18px 0 20px 0;
    }

    .upload-kpi-card {
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #ffffff;
    }

    .upload-kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.09);
    }

    .upload-kpi-card .kpi-num {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 6px;
      font-family: inherit;
    }

    .upload-kpi-card .kpi-label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 6px;
    }
"""

if '.report-cards-grid' not in text:
    style_end = '</style>'
    text = text.replace(style_end, css_styles + '\n  ' + style_end, 1)
    print("Injected CSS styles for report cards and upload KPIs!")

# ================= 2. REPLACE #reportMenu WITH COLOURFUL CARD GRID =================
old_menu_start = text.find('<div id="reportMenu">')
old_menu_end = text.find('</div>\n\n        <div id="reportForms"', old_menu_start)

new_report_menu = """<div id="reportMenu">
          <!-- Header Banner -->
          <div style="background:linear-gradient(135deg, #f0fdf4 0%, #e6fffa 100%); border:1.5px solid #0d9488; border-radius:14px; padding:18px 22px; margin-bottom:20px; box-shadow:0 2px 8px rgba(13,148,136,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:48px; height:48px; background:#0d9488; color:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px; box-shadow:0 3px 8px rgba(13,148,136,0.25);">
                  📑
                </div>
                <div>
                  <h3 style="margin:0; color:#0f766e; font-size:19px; font-weight:800;">
                    उपलब्ध अहवाल व नोटीस केंद्र (Reports & Notices Center)
                  </h3>
                  <div style="font-size:12.5px; color:#115e59; margin-top:3px; font-weight:600;">
                    दैनिक तपासणी पत्रे, मासिक पडताळणी अहवाल, कर्मचारी नोंदवही, कारणे दाखवा नोटीस व कामगिरी विश्लेषण.
                  </div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:12px; font-weight:700; color:#0f766e; background:#ccfbf1; padding:4px 12px; border-radius:20px; border:1px solid #99f6e4;">
                  ✨ एकूण ८ अहवाल पर्याय
                </span>
              </div>
            </div>
          </div>

          <!-- Colourful Cards Grid -->
          <div class="report-cards-grid">
            
            <!-- Card 1: दैनिक पत्र (Daily Smear Letter) -->
            <div class="report-colour-card theme-amber" onclick="openReportForm('cardDaily')">
              <div class="card-top-row">
                <div class="card-icon-box">🖨️</div>
                <span class="card-badge">दैनिक पत्र</span>
              </div>
              <h4 class="card-title">दैनिक पत्र (Daily Smear Letter)</h4>
              <p class="card-desc">विशिष्ट तारखेला संकलित केलेल्या रक्त नमुन्यांची तपासणीसाठीची अधिकृत दैनिक यादी व प्रिंट पत्र तयार करा.</p>
              <div class="card-btn-action">
                <span>दैनिक पत्र उघडा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 2: मासिक अहवाल (Monthly Report PDF) -->
            <div class="report-colour-card theme-blue" onclick="openReportForm('cardMonthly')">
              <div class="card-top-row">
                <div class="card-icon-box">📊</div>
                <span class="card-badge">३-पायऱ्या पडताळणी</span>
              </div>
              <h4 class="card-title">मासिक अहवाल (Monthly PDF)</h4>
              <p class="card-desc">गावनिहाय आणि उपकेंद्रनिहाय महिन्याचा अधिकृत NVBDCP अहवाल, प्रगतीपर आकडेवारी व स्वयंचलित पडताळणी.</p>
              <div class="card-btn-action">
                <span>मासिक अहवाल पाहा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 3: मासिक अहवाल डेटा नोंदणी (Template Data Entry) -->
            <div class="report-colour-card theme-teal" onclick="switchToMonthlyIndicatorsTab()">
              <div class="card-top-row">
                <div class="card-icon-box">📋</div>
                <span class="card-badge">मासिक निर्देशांक</span>
              </div>
              <h4 class="card-title">मासिक अहवाल डेटा नोंदणी (Template Entry)</h4>
              <p class="card-desc">१. ओपीडी माहिती (नवीन व जुने ओपीडी, ताप रुग्ण) आणि २. आरोग्य सेवक (MPW) व आरोग्य सेविका (ANM) गृहभेट डेटा एन्ट्री.</p>
              <div class="card-btn-action">
                <span>डेटा नोंदणी करा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 4: गृहभेटी डेटा एन्ट्री फॉर्म (Home Visit Entry) -->
            <div class="report-colour-card theme-green" onclick="openHomeVisitEntryDirect()">
              <div class="card-top-row">
                <div class="card-icon-box">🚶‍♂️</div>
                <span class="card-badge">पंधरवडा १ व २</span>
              </div>
              <h4 class="card-title">गृहभेटी डेटा एन्ट्री (Home Visits)</h4>
              <p class="card-desc">आरोग्य सेवक (MPW) व आरोग्य सेविका (ANM) यांच्या पंधरवडा १ व २ नुसार थेट गृहभेटी, कंटेनर सर्वेक्षण व ताप तपासणी नोंद.</p>
              <div class="card-btn-action">
                <span>गृहभेटी नोंदवा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 5: कर्मचारी नोंदवही (Employee Register) -->
            <div class="report-colour-card theme-purple" onclick="openReportForm('cardRegister')">
              <div class="card-top-row">
                <div class="card-icon-box">📗</div>
                <span class="card-badge">वार्षिक प्रगती</span>
              </div>
              <h4 class="card-title">कर्मचारी नोंदवही (Staff Register)</h4>
              <p class="card-desc">चालू वर्षातील आशा, आरोग्य सेवक, आरोग्य सेविका व वैद्यकीय अधिकारी यांचा महिनानिहाय वैयक्तिक कामगिरी अहवाल.</p>
              <div class="card-btn-action">
                <span>नोंदवही उघडा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 6: कारणे दाखवा नोटीस (Show Cause Notice) -->
            <div class="report-colour-card theme-red" onclick="openReportForm('cardNotice')">
              <div class="card-top-row">
                <div class="card-icon-box">⚠️</div>
                <span class="card-badge">प्रशासकीय नोटीस</span>
              </div>
              <h4 class="card-title">कारणे दाखवा नोटीस (Notice)</h4>
              <p class="card-desc">मासिक उद्दिष्ट पूर्ण न केलेल्या कर्मचाऱ्यांसाठी अधिकृत कारणे दाखवा नोटीस पत्र जनरेट करा व प्रिंट करा.</p>
              <div class="card-btn-action">
                <span>नोटीस काढा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 7: कमी कामगिरी अहवाल (Low Performance Analysis) -->
            <div class="report-colour-card theme-fuchsia" onclick="openReportForm('cardLowPerf')">
              <div class="card-top-row">
                <div class="card-icon-box">📉</div>
                <span class="card-badge">कामगिरी विश्लेषण</span>
              </div>
              <h4 class="card-title">कमी कामगिरी अहवाल (Low Performance)</h4>
              <p class="card-desc">निरंक आणि ७५% पेक्षा कमी कामगिरी असलेल्या कर्मचाऱ्यांची विश्लेषणात्मक यादी व पर्यवेक्षकीय आढावा अहवाल.</p>
              <div class="card-btn-action">
                <span>यादी तपासा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

            <!-- Card 8: डेंगी व चिकनगुनिया अहवाल (Dengue & Chikungunya) -->
            <div class="report-colour-card theme-coral" onclick="switchTab('dengueTab')">
              <div class="card-top-row">
                <div class="card-icon-box">🦟</div>
                <span class="card-badge">GMC व NIV</span>
              </div>
              <h4 class="card-title">डेंगी व चिकनगुनिया (Dengue & Chik)</h4>
              <p class="card-desc">सिरम नमुने डेटा एन्ट्री, GMC लातूर जावक पत्र, NIV केस हिस्ट्री शीट व प्रयोगशाळा अहवाल नोंदणी केंद्र.</p>
              <div class="card-btn-action">
                <span>डेंगी अहवाल पाहा</span>
                <span style="font-size:16px;">➔</span>
              </div>
            </div>

          </div>
        </div>"""

if old_menu_start != -1 and old_menu_end != -1:
    text = text[:old_menu_start] + new_report_menu + text[old_menu_end+6:]
    print("Replaced #reportMenu with colourful cards grid successfully!")

# ================= 3. ENHANCE UPLOAD-KPI-GRID CARDS =================
old_upload_grid = """        <div class="upload-kpi-grid">
          <div class="upload-kpi-card" style="border-left:4px solid #3182ce;">
            <div class="kpi-num" id="kpiUploadTotalRows" style="color:#2b6cb0;">०</div>
            <div class="kpi-label">📊 एकूण पार्स केलेल्या ओळी (Total Rows)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:4px solid #38a169;">
            <div class="kpi-num" id="kpiUploadValidDates" style="color:#276749;">०</div>
            <div class="kpi-label">🟢 वैध दिनांक (Valid dd-mm-yyyy)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:4px solid #d69e2e;">
            <div class="kpi-num" id="kpiUploadNormalizedDates" style="color:#b7791f;">०</div>
            <div class="kpi-label">⚡ ऑटो-दुरुस्त (Auto-Normalized)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:4px solid #e53e3e;">
            <div class="kpi-num" id="kpiUploadInvalidDates" style="color:#c53030;">०</div>
            <div class="kpi-label">❌ अवैध दिनांक / त्रुटी (Invalid Rows)</div>
          </div>
        </div>"""

new_upload_grid = """        <div class="upload-kpi-grid">
          <div class="upload-kpi-card" style="border-left:5px solid #0284c7; background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-top:1px solid #bae6fd; border-right:1px solid #bae6fd; border-bottom:1px solid #bae6fd;">
            <div class="kpi-num" id="kpiUploadTotalRows" style="color:#0369a1;">०</div>
            <div class="kpi-label" style="color:#075985;">📊 एकूण पार्स केलेल्या ओळी (Total Rows)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:5px solid #16a34a; background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-top:1px solid #bbf7d0; border-right:1px solid #bbf7d0; border-bottom:1px solid #bbf7d0;">
            <div class="kpi-num" id="kpiUploadValidDates" style="color:#15803d;">०</div>
            <div class="kpi-label" style="color:#166534;">🟢 वैध दिनांक (Valid dd-mm-yyyy)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:5px solid #d97706; background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-top:1px solid #fde68a; border-right:1px solid #fde68a; border-bottom:1px solid #fde68a;">
            <div class="kpi-num" id="kpiUploadNormalizedDates" style="color:#b45309;">०</div>
            <div class="kpi-label" style="color:#92400e;">⚡ ऑटो-दुरुस्त (Auto-Normalized)</div>
          </div>
          <div class="upload-kpi-card" style="border-left:5px solid #dc2626; background:linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-top:1px solid #fecaca; border-right:1px solid #fecaca; border-bottom:1px solid #fecaca;">
            <div class="kpi-num" id="kpiUploadInvalidDates" style="color:#b91c1c;">०</div>
            <div class="kpi-label" style="color:#991b1b;">❌ अवैध दिनांक / त्रुटी (Invalid Rows)</div>
          </div>
        </div>"""

if old_upload_grid in text:
    text = text.replace(old_upload_grid, new_upload_grid, 1)
    print("Enhanced upload-kpi-grid with colorful cards!")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectColorfulCards.py successfully!")
