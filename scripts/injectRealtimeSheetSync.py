import re

print("Reading index.html...")
with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

# ================= 1. ADD RPC CASE TO executeClientSideRpc =================
rpc_target = "          case 'fetchRealtimeFromGoogleSheet':"
if rpc_target not in text:
    old_rpc_target = "          case 'clearDengueEntries': {"
    new_rpc_case = """          case 'fetchRealtimeFromGoogleSheet':
          case 'fetchDataFromGoogleSheet': {
            if (!clientGoogleSheetConfig.webhookUrl) {
              return { result: { success: false, message: 'गुगल शीट वेबहुक URL सेट केलेले नाही.' } };
            }
            try {
              const resp = await fetch(clientGoogleSheetConfig.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'fetchAllData',
                  spreadsheetId: clientGoogleSheetConfig.spreadsheetId
                })
              });
              if (!resp.ok) throw new Error('HTTP ' + resp.status);
              const data = await resp.json();
              let bCount = 0;
              let vCount = 0;
              let dCount = 0;
              if (Array.isArray(data.bsData) && data.bsData.length > 0) {
                clientBsData.length = 0;
                data.bsData.forEach(r => {
                  clientBsData.push([r.id, r.date, r.upkendra, r.name, r.designation, r.bsCode, r.bundleNumber, r.pasun, r.paraynt, r.total]);
                  bCount++;
                });
                setLocalStore('bsDataEntry', clientBsData);
              }
              if (Array.isArray(data.villageDetails) && data.villageDetails.length > 0) {
                clientVillageDetails.length = 0;
                data.villageDetails.forEach(v => {
                  clientVillageDetails.push([v.id, v.employeeName, v.date, v.villageName, v.sampleCount, v.maleCount, v.femaleCount, v.upkendra]);
                  vCount++;
                });
                setLocalStore('villageDetails', clientVillageDetails);
              }
              if (Array.isArray(data.dengueData) && data.dengueData.length > 0) {
                clientDengueEntries.length = 0;
                data.dengueData.forEach(d => {
                  clientDengueEntries.push(d);
                  dCount++;
                });
                setLocalStore('dengueChikungunyaEntries', clientDengueEntries);
              }
              clientGoogleSheetConfig.lastSyncTime = new Date().toLocaleString('mr-IN');
              clientGoogleSheetConfig.syncStatus = '✅ थेट गुगल शीटमध्ये रिअल-टाईम जतन (Live Synced in Google Sheet)';
              setLocalStore('googleSheetConfig', clientGoogleSheetConfig);
              const parts = [];
              if (bCount > 0) parts.push(`${bCount} रक्त नमुने`);
              if (vCount > 0) parts.push(`${vCount} गाव तपशील`);
              if (dCount > 0) parts.push(`${dCount} डेंगी नोंदी`);
              return {
                result: {
                  success: true,
                  importedBs: bCount,
                  importedVil: vCount,
                  importedDengue: dCount,
                  message: parts.length > 0
                    ? `गुगल शीटमधून ${parts.join(', ')} यशस्वीरित्या थेट लोड झाल्या!`
                    : `गुगल शीटशी यशस्वी संपर्क झाला! (सध्या सर्व डेटा अद्ययावत आहे).`
                }
              };
            } catch (err) {
              return { result: { success: false, message: 'गुगल शीटवरून डेटा फेच करताना त्रुटी: ' + err.message } };
            }
          }

          case 'clearDengueEntries': {"""
    text = text.replace(old_rpc_target, new_rpc_case, 1)
    print("Added fetchRealtimeFromGoogleSheet to executeClientSideRpc!")

# ================= 2. ENHANCE TOP APP HEADER WITH REALTIME SYNC BUTTON =================
header_chip_old = '<span class="header-chip" style="background:#38a169;">🟢 Google Sheet सिंक</span>'
header_chip_new = """<button type="button" class="header-chip" id="btnTopHeaderSyncSheet" onclick="triggerSeamlessGoogleSheetSync(true)" style="background:#1b4332; border:1.5px solid #52b788; color:#d8f3dc; cursor:pointer; font-weight:700; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 6px rgba(0,0,0,0.18); transition:all 0.2s ease;">
          <span id="topHeaderSyncSpinner" style="display:inline-block;">🔄</span>
          <span id="topHeaderSyncLabel">गुगल शीट लोड करा (Live Sync)</span>
        </button>"""

if header_chip_old in text:
    text = text.replace(header_chip_old, header_chip_new, 1)
    print("Updated app-header with interactive real-time sync button!")

# ================= 3. ADD PROMINENT SYNC BANNER IN DASHBOARD TAB =================
dash_target = '<div id="dashboardTab" class="tab-pane active">'
sync_banner_html = """<div id="dashboardTab" class="tab-pane active">
        <!-- REAL-TIME GOOGLE SHEET SYNC BANNER -->
        <div style="background:linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%); color:#ffffff; border-radius:14px; padding:18px 22px; margin-bottom:22px; box-shadow:0 8px 20px -4px rgba(6, 78, 59, 0.35); border:1px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div style="width:52px; height:52px; background:rgba(255,255,255,0.18); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:26px; border:1px solid rgba(255,255,255,0.3); flex-shrink:0;">
                ⚡
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <h3 style="margin:0; font-size:18px; font-weight:800; color:#ffffff; letter-spacing:0.2px;">
                    गुगल शीट रिअल-टाईम सिंक व डेटा लोड केंद्र (Google Sheet Live Sync)
                  </h3>
                  <span id="dashSheetLiveBadge" style="background:#22c55e; color:#052e16; font-size:11px; font-weight:800; padding:2px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
                    🟢 रिअल-टाईम सक्रिय
                  </span>
                </div>
                <div style="font-size:13px; color:#d1fae5; margin-top:4px; font-weight:500;">
                  कोणत्याही कटकटीशिवाय (No Hassle) थेट तुमच्या गुगल शीटमधून संपूर्ण डेटा ॲपमध्ये लोड करा आणि नवीन नोंदी रिअल-टाईम शीटमध्ये जतन ठेवा.
                </div>
                <div style="font-size:11.5px; color:#a7f3d0; margin-top:4px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                  <span>📄 <b>Sheet ID:</b> 1rYpDm...38EKM</span>
                  <span>•</span>
                  <span>🕒 <b>शेवटचे सिंक:</b> <span id="dashSyncLastTime" style="font-weight:700; color:#ffffff;">सक्रिय सज्ज</span></span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
              <button type="button" id="btnDashFetchSheet" class="sheet-btn" style="background:#ffffff; color:#065f46; font-weight:800; font-size:13.5px; padding:10px 20px; box-shadow:0 4px 10px rgba(0,0,0,0.15); border:none; display:flex; align-items:center; gap:8px;" onclick="triggerSeamlessGoogleSheetSync(true)">
                <span id="dashSyncBtnIcon">📥</span>
                <span id="dashSyncBtnText">गुगल शीटवरून थेट डेटा लोड करा</span>
              </button>
              <button type="button" class="sheet-btn" style="background:rgba(255,255,255,0.15); color:#ffffff; border:1px solid rgba(255,255,255,0.3); font-weight:700; font-size:12.5px; padding:9px 14px;" onclick="syncDataToGoogleSheet(this)">
                ⬆️ गुगल शीटमध्ये पाठवा (Push)
              </button>
              <a href="https://docs.google.com/spreadsheets/d/1rYpDm1xjCAnf9LvpCZcK3E6U5zGyEkFEM5A4DQ38EKM/edit" target="_blank" class="sheet-btn" style="background:rgba(255,255,255,0.12); color:#ffffff; border:1px solid rgba(255,255,255,0.25); font-weight:700; font-size:12.5px; padding:9px 14px; text-decoration:none;">
                🌐 शीट उघडा ↗️
              </a>
            </div>
          </div>
        </div>
"""

if 'id="dashboardTab" class="tab-pane active">' in text and 'REAL-TIME GOOGLE SHEET SYNC BANNER' not in text:
    text = text.replace(dash_target, sync_banner_html, 1)
    print("Injected real-time sync banner into dashboardTab!")

# ================= 4. ADD QUICK SYNC BUTTON TO DENGUE REGISTER =================
dengue_reg_target = '📂 जुना डेटा आयात करा (Import CSV)'
if '🔄 गुगल शीटवरून डेंगी डेटा लोड करा' not in text and dengue_reg_target in text:
    text = text.replace(dengue_reg_target, dengue_reg_target + """
                </button>
                <button type="button" class="sheet-btn" style="background:#1b4332; color:#fff; font-weight:700; border:1px solid #52b788;" onclick="triggerSeamlessGoogleSheetSync(true)">
                  🔄 गुगल शीटवरून डेटा लोड करा""", 1)
    print("Added Google Sheet sync button to Dengue register!")

# ================= 5. INJECT triggerSeamlessGoogleSheetSync JS FUNCTION =================
sync_js_code = """
    // ================= SEAMLESS REAL-TIME GOOGLE SHEET SYNC =================
    let mIsSyncingSheet = false;

    function triggerSeamlessGoogleSheetSync(showNotification = true) {
      if (mIsSyncingSheet) {
        showToast('⏳ गुगल शीट सिंक आधीच चालू आहे, कृपया थांबा...');
        return;
      }
      mIsSyncingSheet = true;

      // Update UI spinners and buttons
      const btnHeader = document.getElementById('btnTopHeaderSyncSheet');
      const spinnerHeader = document.getElementById('topHeaderSyncSpinner');
      const labelHeader = document.getElementById('topHeaderSyncLabel');
      if (spinnerHeader) spinnerHeader.style.animation = 'spin 1s linear infinite';
      if (labelHeader) labelHeader.textContent = 'गुगल शीट लोड होत आहे...';

      const btnDash = document.getElementById('btnDashFetchSheet');
      const iconDash = document.getElementById('dashSyncBtnIcon');
      const textDash = document.getElementById('dashSyncBtnText');
      if (btnDash) btnDash.disabled = true;
      if (iconDash) iconDash.textContent = '⏳';
      if (textDash) textDash.textContent = 'गुगल शीटवरून डेटा फेच होत आहे...';

      const btnLive = document.getElementById('btnFetchLiveSheet');
      if (btnLive) {
        btnLive.disabled = true;
        btnLive.textContent = 'फेच होत आहे... ⏳';
      }

      if (showNotification) {
        showToast('⚡ गुगल शीटवरून थेट डेटा लोड होत आहे... कृपया थांबा...');
      }

      google.script.run
        .withSuccessHandler(res => {
          mIsSyncingSheet = false;
          // Restore header
          if (spinnerHeader) spinnerHeader.style.animation = 'none';
          if (labelHeader) labelHeader.textContent = 'गुगल शीट लोड करा (Live Sync)';
          // Restore dash button
          if (btnDash) btnDash.disabled = false;
          if (iconDash) iconDash.textContent = '📥';
          if (textDash) textDash.textContent = 'गुगल शीटवरून थेट डेटा लोड करा';
          // Restore table tab button
          if (btnLive) {
            btnLive.disabled = false;
            btnLive.textContent = '📥 गुगल शीटमधून डेटा आणा (Fetch Live)';
          }

          if (res && res.success) {
            const timeStr = new Date().toLocaleString('mr-IN');
            const lastTimeEl = document.getElementById('dashSyncLastTime');
            if (lastTimeEl) lastTimeEl.textContent = timeStr;
            const lblSync = document.getElementById('lblLastSyncTime');
            if (lblSync) lblSync.textContent = timeStr;

            if (showNotification) {
              showToast('✅ ' + (res.message || 'गुगल शीटवरून सर्व डेटा यशस्वीरित्या लोड झाला!'), 'success');
            }

            // Refresh app state seamlessly
            if (typeof loadDashboard === 'function') loadDashboard();
            if (typeof loadTablesData === 'function') loadTablesData();
            if (typeof loadDengueData === 'function') loadDengueData();
            const curM = document.getElementById('selIndicatorMonth') ? document.getElementById('selIndicatorMonth').value : '';
            if (curM && typeof loadMonthlyIndicators === 'function') loadMonthlyIndicators(curM);
          } else {
            const errMsg = (res && res.message) || 'गुगल शीटशी संपर्क होऊ शकला नाही.';
            if (showNotification) showToast('⚠️ ' + errMsg, 'warning');
          }
        })
        .withFailureHandler(err => {
          mIsSyncingSheet = false;
          if (spinnerHeader) spinnerHeader.style.animation = 'none';
          if (labelHeader) labelHeader.textContent = 'गुगल शीट लोड करा (Live Sync)';
          if (btnDash) btnDash.disabled = false;
          if (iconDash) iconDash.textContent = '📥';
          if (textDash) textDash.textContent = 'गुगल शीटवरून थेट डेटा लोड करा';
          if (btnLive) {
            btnLive.disabled = false;
            btnLive.textContent = '📥 गुगल शीटमधून डेटा आणा (Fetch Live)';
          }
          if (showNotification) {
            showToast('⚠️ त्रुटी: ' + err.message, 'error');
          }
        })
        .fetchRealtimeFromGoogleSheet();
    }
"""

if 'function triggerSeamlessGoogleSheetSync(' not in text:
    target_pos = '    function fetchRealtimeFromGoogleSheet() {'
    if target_pos in text:
        text = text.replace(target_pos, sync_js_code + '\n' + target_pos, 1)
        print("Injected triggerSeamlessGoogleSheetSync function!")

# ================= 6. AUTO-SYNC ON STARTUP (IN WINDOW.ONLOAD) =================
onload_target = 'loadDashboard();'
auto_sync_init = """loadDashboard();
      // Auto-fetch latest data from Google Sheet without user hassle
      setTimeout(() => {
        if (typeof triggerSeamlessGoogleSheetSync === 'function') {
          triggerSeamlessGoogleSheetSync(false);
        }
      }, 1200);"""

if 'triggerSeamlessGoogleSheetSync(false)' not in text and onload_target in text:
    text = text.replace(onload_target, auto_sync_init, 1)
    print("Added auto-sync on app startup in window.onload!")

# Save index.html
with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)
print("Finished injectRealtimeSheetSync.py successfully!")
