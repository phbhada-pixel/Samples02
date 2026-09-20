/**
 * PHC BHADA - NVBDCP MALARIA MANAGEMENT SYSTEM
 * Real-time Google Sheet Storage Webhook (Google Apps Script)
 * 
 * Instructions:
 * 1. Open your Google Sheet (https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit)
 * 2. Click Extensions > Apps Script
 * 3. Delete any code in Code.gs and paste this complete file
 * 4. Click 'Deploy' > 'New deployment'
 * 5. Select type: 'Web app'
 *    - Description: 'PHC Bhada NVBDCP Real-time Sync'
 *    - Execute as: 'Me' (your email)
 *    - Who has access: 'Anyone' (no login required for the webhook)
 * 6. Click 'Deploy', authorize permissions, and copy the Web App URL (ends in /exec)
 * 7. In the NVBDCP Web App, open ⚙️ Settings > Paste the Web App URL and Spreadsheet ID > Save!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action || 'appendEntries';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!ss) {
      if (data.spreadsheetId) {
        ss = SpreadsheetApp.openById(data.spreadsheetId);
      } else {
        throw new Error("No active spreadsheet found");
      }
    }

    var result = { success: true, action: action, timestamp: new Date().toISOString() };

    switch (action) {
      case 'ping': {
        result.message = "PHC Bhada Google Sheet Webhook is active & ready for real-time data storage!";
        break;
      }

      case 'appendEntries': {
        var bsEntries = data.entries || [];
        var vilEntries = data.villageDetails || [];

        // 1. Write to BsDataEntry sheet
        if (bsEntries.length > 0) {
          var bsSheet = getOrCreateSheet(ss, "BsDataEntry", [
            "BS ID", "दिनांक", "उपकेंद्र", "कर्मचारी नाव", "पद", "BS Code", "बंडल क्र.", "पासून", "पर्यंत", "एकूण नमुने", "नोंद वेळ (Timestamp)"
          ]);
          var rowsToAppend = bsEntries.map(function(r) {
            return [
              r.id || "",
              r.date || "",
              r.upkendra || "",
              r.name || "",
              r.designation || "",
              r.bsCode || "",
              r.bundleNumber || "",
              r.pasun || 1,
              r.paraynt || 1,
              r.total || 1,
              new Date()
            ];
          });
          appendRowsInBatch(bsSheet, rowsToAppend);
        }

        // 2. Write to VillageDetails sheet
        if (vilEntries.length > 0) {
          var vilSheet = getOrCreateSheet(ss, "VillageDetails", [
            "BS ID", "कर्मचारी नाव", "दिनांक", "गाव", "एकूण नमुने", "पुरुष", "स्त्री", "उपकेंद्र", "नोंद वेळ (Timestamp)"
          ]);
          var vilRows = vilEntries.map(function(v) {
            return [
              v.id || "",
              v.employeeName || "",
              v.date || "",
              v.villageName || "",
              v.sampleCount || 1,
              v.maleCount || 0,
              v.femaleCount || 0,
              v.upkendra || "",
              new Date()
            ];
          });
          appendRowsInBatch(vilSheet, vilRows);
        }

        result.appendedBs = bsEntries.length;
        result.appendedVil = vilEntries.length;
        result.message = "Real-time entries stored successfully in Google Sheet!";
        break;
      }

      case 'saveMonthIndicators': {
        var ind = data.indicators || {};
        var monthName = data.monthName || ind.name;
        var mSheet = getOrCreateSheet(ss, "MonthMaster", [
          "महिना (Month)", "नवीन बाह्यरुग्ण (OPD)", "प्रगतीपर बाह्यरुग्ण (Prog OPD)", "तापाचे रुग्ण (Fever)", "प्रगतीपर तापाचे (Prog Fever)", "रक्त नमुने (Smears)", "प्रगतीपर रक्त नमुने (Prog Smears)", "उपचारीत रुग्ण (Treated)", "प्रगतीपर उपचारीत (Prog Treated)", "क्लोरोक्वीन खर्च (CQ)", "प्रगतीपर क्लोरोक्वीन (Prog CQ)", "अद्ययावत दिनांक (Updated Date)"
        ]);

        var allRows = mSheet.getDataRange().getValues();
        var rowIndex = -1;
        for (var i = 1; i < allRows.length; i++) {
          if (String(allRows[i][0]).trim() === String(monthName).trim()) {
            rowIndex = i + 1;
            break;
          }
        }

        var rowData = [
          monthName,
          ind.newOpd || 0,
          ind.progNewOpd || 0,
          ind.feverCases || 0,
          ind.progFeverCases || 0,
          ind.bloodSmears || 0,
          ind.progBloodSmears || 0,
          ind.treatedCases || 0,
          ind.progTreatedCases || 0,
          ind.chloroquineSpent || 0,
          ind.progChloroquineSpent || 0,
          new Date()
        ];

        if (rowIndex > 0) {
          mSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
          mSheet.appendRow(rowData);
        }
        result.message = "Month indicators updated in Google Sheet!";
        break;
      }

      case 'syncAllData': {
        var allBs = data.bsData || [];
        var allVil = data.villageDetails || [];

        var bsS = getOrCreateSheet(ss, "BsDataEntry", [
          "BS ID", "दिनांक", "उपकेंद्र", "कर्मचारी नाव", "पद", "BS Code", "बंडल क्र.", "पासून", "पर्यंत", "एकूण नमुने", "नोंद वेळ (Timestamp)"
        ]);
        bsS.clearContents();
        bsS.appendRow(["BS ID", "दिनांक", "उपकेंद्र", "कर्मचारी नाव", "पद", "BS Code", "बंडल क्र.", "पासून", "पर्यंत", "एकूण नमुने", "नोंद वेळ (Timestamp)"]);
        if (allBs.length > 0) {
          var bRows = allBs.map(function(r) {
            return [r.id, r.date, r.upkendra, r.name, r.designation, r.bsCode, r.bundleNumber, r.pasun, r.paraynt, r.total, new Date()];
          });
          appendRowsInBatch(bsS, bRows);
        }

        var vS = getOrCreateSheet(ss, "VillageDetails", [
          "BS ID", "कर्मचारी नाव", "दिनांक", "गाव", "एकूण नमुने", "पुरुष", "स्त्री", "उपकेंद्र", "नोंद वेळ (Timestamp)"
        ]);
        vS.clearContents();
        vS.appendRow(["BS ID", "कर्मचारी नाव", "दिनांक", "गाव", "एकूण नमुने", "पुरुष", "स्त्री", "उपकेंद्र", "नोंद वेळ (Timestamp)"]);
        if (allVil.length > 0) {
          var vRows = allVil.map(function(v) {
            return [v.id, v.employeeName, v.date, v.villageName, v.sampleCount, v.maleCount, v.femaleCount, v.upkendra, new Date()];
          });
          appendRowsInBatch(vS, vRows);
        }
        result.message = "All records synchronized to Google Sheet!";
        break;
      }

      case 'saveEmployee':
      case 'syncMasterData': {
        if (data.employeeMaster && Array.isArray(data.employeeMaster)) {
          var empSheet = getOrCreateSheet(ss, "EmployeeMaster", [
            "ID", "उपकेंद्र", "कर्मचारी नाव", "पद", "प्रवर्ग (Category)", "BS Code", "मोबाईल", "गावे (Villages)"
          ]);
          empSheet.clearContents();
          empSheet.appendRow(["ID", "उपकेंद्र", "कर्मचारी नाव", "पद", "प्रवर्ग (Category)", "BS Code", "मोबाईल", "गावे (Villages)"]);
          var eRows = data.employeeMaster.map(function(e) {
            return [
              e.id || "",
              e.upkendra || "",
              e.employeeName || "",
              e.designation || "",
              e.category || "",
              e.bsCode || "",
              e.mobile || "",
              Array.isArray(e.villageList) ? e.villageList.join(", ") : ""
            ];
          });
          if (eRows.length > 0) appendRowsInBatch(empSheet, eRows);
        }
        result.message = "Master data synchronized in Google Sheet!";
        break;
      }

      case 'transferEmployee': {
        var t = data.transfer || {};
        var trSheet = getOrCreateSheet(ss, "TransferHistory", [
          "दिनांक", "कर्मचारी", "मूळ उपकेंद्र", "नवीन उपकेंद्र", "नवीन गावे", "BS Code", "कारण", "आदेश क्र."
        ]);
        trSheet.appendRow([
          new Date(),
          t.empId || "",
          t.sourceUpkendra || "",
          t.targetUpkendra || "",
          Array.isArray(t.newVillages) ? t.newVillages.join(", ") : (t.newVillages || ""),
          t.newBsCode || "",
          t.reason || "",
          t.orderNo || ""
        ]);
        result.message = "Transfer record saved in Google Sheet!";
        break;
      }

      case 'deleteEntry': {
        var delId = data.entryId;
        if (delId) {
          var bSheet = ss.getSheetByName("BsDataEntry");
          if (bSheet) {
            deleteRowByFirstColumnValue(bSheet, delId);
          }
          var vSheet = ss.getSheetByName("VillageDetails");
          if (vSheet) {
            deleteRowByFirstColumnValue(vSheet, delId);
          }
        }
        result.message = "Entry deleted from Google Sheet!";
        break;
      }

      default: {
        result.message = "Action processed: " + action;
      }
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    name: "PHC Bhada NVBDCP Google Sheet Real-time Storage Endpoint",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#22543d").setFontColor("#ffffff").setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function appendRowsInBatch(sheet, rows) {
  if (!rows || rows.length === 0) return;
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function deleteRowByFirstColumnValue(sheet, value) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]).trim() === String(value).trim()) {
      sheet.deleteRow(i + 1);
    }
  }
}
