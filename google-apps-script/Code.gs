/**
 * ==========================================================================
 *  IEDC EVENT REGISTRATION WEBHOOK - GOOGLE APPS SCRIPT
 * ==========================================================================
 *  This script receives registration submissions and form setups from your
 *  BookMyShow-style web app and automatically creates dedicated event tabs
 *  in your Google Sheet, stores attendee responses, and saves payment proof images!
 * 
 *  HOW TO SETUP / UPDATE (takes only 1 minute):
 *  1. Open your Google Sheet (e.g. "Event Registrations").
 *  2. In the top menu, click: Extensions -> Apps Script.
 *  3. Delete any existing code in Code.gs, paste this entire file, and click Save (Ctrl+S).
 *  4. Click "Deploy" -> "Manage deployments".
 *  5. Click the pencil icon (Edit) on your Active deployment.
 *  6. In the "Version" dropdown, select "New version" (CRITICAL: Every time code updates, choose New Version).
 *  7. Click "Deploy". Done!
 * ==========================================================================
 */

// ==========================================================================
// CONFIGURATION (OPTIONAL)
// If this script was opened from your Google Sheet (Extensions -> Apps Script),
// it automatically connects to that sheet.
// If your script is standalone or you ever see "Document is missing",
// paste your Google Sheet URL or ID between the quotes below:
// ==========================================================================
var SPREADSHEET_ID_OR_URL = "";

function getSpreadsheet() {
  if (SPREADSHEET_ID_OR_URL && SPREADSHEET_ID_OR_URL.trim()) {
    var val = SPREADSHEET_ID_OR_URL.trim();
    if (val.indexOf("http") === 0) {
      return SpreadsheetApp.openByUrl(val);
    } else {
      return SpreadsheetApp.openById(val);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  var id = (e && e.parameter && (e.parameter.id || e.parameter.form)) || "";

  // 1. Direct form lookup for short URLs (?form=new-event)
  if (action === "get_form" && id) {
    try {
      var ss = getSpreadsheet();
      var configSheet = ss.getSheetByName("_Forms_Config");
      if (configSheet && configSheet.getLastRow() > 1) {
        var rows = configSheet.getDataRange().getValues();
        var targetId = String(id).toLowerCase().trim();
        for (var i = 1; i < rows.length; i++) {
          if (String(rows[i][1]).toLowerCase().trim() === targetId) {
            // Locate column holding the JSON payload (col 3 in 4-column schema, col 2 in 3-column schema)
            var jsonStr = "";
            if (rows[i][3] && String(rows[i][3]).indexOf('{') !== -1) {
              jsonStr = String(rows[i][3]);
            } else if (rows[i][2] && String(rows[i][2]).indexOf('{') !== -1) {
              jsonStr = String(rows[i][2]);
            }
            if (jsonStr) {
              return ContentService.createTextOutput(jsonStr)
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ error: "Form not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "IEDC Event Registration API is active and ready to receive bookings!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Fast lock timeout (10 seconds max wait)
  lock.tryLock(10000);

  try {
    var ss = getSpreadsheet();
    
    // Parse incoming JSON payload
    var payload;
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    // =========================================================================
    // ACTION 1: Form Configuration Sync & Auto Event Tab Pre-Creation
    // Triggered when an admin saves/publishes a form in the Admin Dashboard
    // =========================================================================
    if (payload.action === "save_form_config" || (payload.form && !payload["Booking ID"])) {
      var formObj = payload.form;
      if (typeof formObj === "string") {
        try {
          formObj = JSON.parse(formObj);
        } catch (fErr) {}
      }
      formObj = formObj || {};

      var formId = formObj.id || payload.formId || "event-" + Date.now();
      var eventTitle = formObj.title || payload.title || "";

      // A. Fast sync form JSON into _Forms_Config tab (for short URL lookups)
      var configSheet = ss.getSheetByName("_Forms_Config");
      if (!configSheet) {
        configSheet = ss.insertSheet("_Forms_Config");
        configSheet.appendRow(["Updated", "Form ID", "Event Title", "Form JSON"]);
        configSheet.getRange(1, 1, 1, 4)
          .setFontWeight("bold")
          .setBackground("#111827")
          .setFontColor("#FFFFFF");
        configSheet.setFrozenRows(1);
      }
      
      var lastRow = configSheet.getLastRow();
      var foundRow = -1;
      if (lastRow > 1) {
        var idValues = configSheet.getRange(2, 2, lastRow - 1, 1).getValues();
        for (var r = 0; r < idValues.length; r++) {
          if (String(idValues[r][0]) === String(formId)) {
            foundRow = r + 2;
            break;
          }
        }
      }
      
      var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "yyyy-MM-dd HH:mm:ss");
      var jsonPayload = JSON.stringify(formObj);
      if (foundRow > 0) {
        configSheet.getRange(foundRow, 1, 1, 4).setValues([[nowStr, formId, eventTitle, jsonPayload]]);
      } else {
        configSheet.appendRow([nowStr, formId, eventTitle, jsonPayload]);
      }

      // B. Instantly Pre-create the dedicated Sheet tab for this event in the workspace!
      var createdTabName = "";
      if (eventTitle) {
        // Clean invalid characters for sheet tab names (: \ / ? * [ ])
        var cleanTab = eventTitle.split(':')[0].replace(/[:\\/?*\[\]]/g, '').trim().substring(0, 30);
        if (cleanTab) {
          createdTabName = cleanTab;
          var eventSheet = ss.getSheetByName(cleanTab);
          if (!eventSheet) {
            var activeSheet = ss.getActiveSheet();
            if (activeSheet && activeSheet.getLastRow() === 0 && (activeSheet.getName() === "Sheet1" || activeSheet.getName() === "Sheet 1")) {
              eventSheet = activeSheet;
              eventSheet.setName(cleanTab);
            } else {
              eventSheet = ss.insertSheet(cleanTab);
            }
          }

          // Initialize headers in ONE batched operation if sheet is empty
          if (eventSheet.getLastRow() === 0) {
            var colHeaders = ["Timestamp", "Booking ID"];
            if (Array.isArray(formObj.questions)) {
              for (var q = 0; q < formObj.questions.length; q++) {
                var qItem = formObj.questions[q];
                if (qItem && qItem.title && colHeaders.indexOf(qItem.title) === -1) {
                  colHeaders.push(qItem.title);
                }
              }
            }
            eventSheet.getRange(1, 1, 1, colHeaders.length)
              .setValues([colHeaders])
              .setFontWeight("bold")
              .setBackground("#111827")
              .setFontColor("#FFFFFF");
            eventSheet.setFrozenRows(1);
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Form configuration synced and dedicated event sheet ready in workspace",
        formId: formId,
        tabName: createdTabName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // ACTION 2: Attendee Registration Submission
    // =========================================================================

    // Determine target sheet/tab based on Event Title (auto-creates a tab per event!)
    var rawTitle = payload["_eventTitle"] || payload["Event Title"] || "";
    var tabName = "Registrations";
    if (rawTitle) {
      tabName = rawTitle.split(':')[0].replace(/[:\\/?*\[\]]/g, '').trim().substring(0, 30);
    }
    
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      // If the default sheet is blank and named 'Sheet1', rename it; otherwise insert a new tab
      var activeSheet = ss.getActiveSheet();
      if (activeSheet && activeSheet.getLastRow() === 0 && (activeSheet.getName() === "Sheet1" || activeSheet.getName() === "Sheet 1")) {
        sheet = activeSheet;
        sheet.setName(tabName);
      } else {
        sheet = ss.insertSheet(tabName);
      }
    }

    // Add standard server timestamp if not present
    if (!payload["Timestamp"]) {
      payload["Timestamp"] = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "yyyy-MM-dd HH:mm:ss");
    }

    // Fetch existing headers or initialize them
    var lastColumn = sheet.getLastColumn();
    var lastRow = sheet.getLastRow();
    var headers = [];
    if (lastRow > 0 && lastColumn > 0) {
      var rawHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
      for (var h = 0; h < rawHeaders.length; h++) {
        var hVal = rawHeaders[h];
        if (hVal !== "" && hVal !== null && hVal !== undefined) {
          headers.push(String(hVal));
        }
      }
    }

    // If sheet is completely empty, initialize headers ONLY with valid question fields
    if (headers.length === 0) {
      var initialHeaders = [];
      if (payload["Timestamp"] !== undefined) initialHeaders.push("Timestamp");
      if (payload["Booking ID"] !== undefined) initialHeaders.push("Booking ID");

      // Only add titles that were actually submitted in this form (skip internal keys)
      for (var key in payload) {
        if (payload.hasOwnProperty(key)) {
          if (key.indexOf("_") === 0) continue;
          if (key === "action" || key === "form" || key === "Timestamp" || key === "Booking ID") continue;
          if (initialHeaders.indexOf(key) === -1) {
            initialHeaders.push(key);
          }
        }
      }

      headers = initialHeaders;
      if (headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        var headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#111827");
        headerRange.setFontColor("#FFFFFF");
        sheet.setFrozenRows(1);
      }
    } else {
      // Sheet already has headers: dynamically append any newly introduced form questions
      var updatedHeaders = headers.slice();
      for (var key in payload) {
        if (payload.hasOwnProperty(key)) {
          if (key.indexOf("_") === 0) continue;
          if (key === "action" || key === "form") continue;
          if (updatedHeaders.indexOf(key) === -1) {
            updatedHeaders.push(key);
          }
        }
      }

      // If new columns were discovered, update row 1 headers in the sheet
      if (updatedHeaders.length > headers.length) {
        sheet.getRange(1, 1, 1, updatedHeaders.length).setValues([updatedHeaders]);
        var newHeaderRange = sheet.getRange(1, 1, 1, updatedHeaders.length);
        newHeaderRange.setFontWeight("bold");
        newHeaderRange.setBackground("#111827");
        newHeaderRange.setFontColor("#FFFFFF");
        headers = updatedHeaders;
      }
    }

    // Build row values in the exact order of the headers
    var rowData = [];
    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      var value = payload[headerName];

      if (value === undefined || value === null) {
        rowData.push("");
      } else if (Array.isArray(value)) {
        rowData.push(value.join(", "));
      } else {
        var strVal = String(value);

        // =====================================================================
        // Automatic Payment Proof / Image Upload to Google Drive
        // If an attendee uploaded a screenshot/image (data:image/...;base64,...),
        // save it directly to Google Drive and store the shareable link in the cell!
        // =====================================================================
        if (strVal.indexOf("data:image/") === 0 && strVal.indexOf(";base64,") !== -1) {
          try {
            var parts = strVal.split(";base64,");
            var mime = "image/jpeg";
            var mimeMatch = parts[0].match(/data:([^;]+)/);
            if (mimeMatch) mime = mimeMatch[1];
            var ext = mime.indexOf("png") !== -1 ? ".png" : (mime.indexOf("webp") !== -1 ? ".webp" : ".jpg");
            var decoded = Utilities.base64Decode(parts[1]);
            var fileName = "PaymentProof_" + (payload["Booking ID"] || ("reg_" + Date.now())) + ext;
            var blob = Utilities.newBlob(decoded, mime, fileName);
            var driveFile = DriveApp.createFile(blob);
            driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            strVal = driveFile.getUrl();
          } catch (driveErr) {
            // Graceful fallback if Google Drive authorization is pending:
            // Insert formula or shortened preview note so Google Sheets cell limits aren't exceeded
            if (strVal.length > 500) {
              strVal = "[Image Proof Uploaded: " + (payload["Booking ID"] || "receipt") + "]";
            }
          }
        }

        rowData.push(strVal);
      }
    }

    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration recorded successfully",
      bookingId: payload["Booking ID"] || "",
      sheetName: tabName,
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
