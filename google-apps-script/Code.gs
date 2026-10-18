/**
 * ==========================================================================
 *  IEDC EVENT REGISTRATION WEBHOOK - GOOGLE APPS SCRIPT
 * ==========================================================================
 *  This script receives registration submissions from your GitHub-hosted
 *  BookMyShow-style web app and appends them to your Google Sheet.
 * 
 *  HOW TO SETUP (takes only 2 minutes):
 *  1. Open Google Sheets (https://sheets.new) & create a new Sheet (e.g. "Event Registrations 2026").
 *  2. In the menu, click: Extensions -> Apps Script.
 *  3. Delete any default code in Code.gs, paste this entire file, and click Save (Ctrl+S / Cmd+S).
 *  4. Click "Deploy" -> "New deployment".
 *  5. Click the gear icon next to "Select type" and choose "Web app".
 *  6. Set:
 *     - Description: "Event Registration API"
 *     - Execute as: "Me"
 *     - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so submissions from your website can reach it)
 *  7. Click "Deploy" -> Authorize access with your Google account.
 *  8. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 *  9. Paste this URL into `js/config.js` or via the in-app "Sheet Setup" modal in your web app!
 * ==========================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "IEDC Event Registration API is active and ready to receive bookings!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent writes
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
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

    // Determine target sheet/tab based on Event Title (auto-creates a tab per event!)
    var rawTitle = payload["_eventTitle"] || payload["Event Title"] || "";
    var tabName = "Registrations";
    if (rawTitle) {
      // Clean invalid characters for sheet tab names (: \ / ? * [ ])
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

    // If sheet is completely empty, initialize headers ONLY with fields present in payload
    if (headers.length === 0) {
      var initialHeaders = [];
      if (payload["Timestamp"] !== undefined) initialHeaders.push("Timestamp");
      if (payload["Booking ID"] !== undefined) initialHeaders.push("Booking ID");

      // Only add titles that were actually submitted in this form
      for (var key in payload) {
        if (payload.hasOwnProperty(key)) {
          // Ignore internal metadata fields starting with _ (e.g. _eventTitle, _formId)
          if (key.indexOf("_") === 0) continue;
          if (key === "Timestamp" || key === "Booking ID") continue;
          if (initialHeaders.indexOf(key) === -1) {
            initialHeaders.push(key);
          }
        }
      }

      headers = initialHeaders;
      if (headers.length > 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        
        // Style header row: bold, dark background, white text, freeze top row
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
        rowData.push(String(value));
      }
    }

    // Append the row to Google Sheets
    sheet.appendRow(rowData);

    // Auto-resize columns periodically (optional, clean layout)
    if (sheet.getLastRow() % 10 === 0) {
      sheet.autoResizeColumns(1, headers.length);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration recorded successfully",
      bookingId: payload["Booking ID"] || "",
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
