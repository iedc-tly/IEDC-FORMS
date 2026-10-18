# 📋 IEDC Event Forms

A lightweight, modern web application for managing event registrations for IEDC events. Works just like Google Forms with instant digital entry passes and automatic Google Sheets sync.

---

## ✨ Features

- **No Login for Attendees**: Direct form links allow participants to register instantly.
- **Dedicated Event Forms**: Each event gets its own clean URL (e.g. `?form=hacknova-2026`).
- **Instant Digital Passes**: Generates a BookMyShow-style entry ticket with a scannable QR code and Google Calendar sync upon submission.
- **Google Sheets Integration**: Submissions are automatically recorded into Google Sheets with a dedicated tab created for each event.
- **Admin Form Builder**: Easily create and customize events, form fields (Single Select, Multiple Select, Numbers Only, Dropdowns, Text), and copy shareable links.
- **Offline Backup**: Form responses are also cached locally in the browser so no registration is lost.
- **Export Options**: 1-click export of attendee lists to CSV / Excel directly from the admin dashboard.

---

## 🔗 Quick Links

- **Event 1 (2026) Clean Short Link**: `https://iedc-tly.github.io/register/e126`
- **Attendee Registration Portal**: `https://iedc-tly.github.io/register/`
- **Admin Studio**: `https://iedc-tly.github.io/register/admin.html`

---

## 📊 Google Sheets Sync

All registrations automatically post to the connected Google Apps Script Web App:
- **Auto-Tabs**: Submissions for different events are automatically organized into separate tabs named after each event.
- **Dynamic Columns**: Any custom question added in the Form Builder automatically creates a new column in the spreadsheet.

---

## 🌐 GitHub Pages Deployment

To host this repository on GitHub Pages:
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment**, select:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
3. Click **Save**.

---

## 📁 Project Structure

```text
├── index.html               # Public Attendee Registration Form
├── admin.html               # Admin Studio & Form Builder
├── css/
│   └── light-theme.css      # Clean, minimal light UI stylesheet
├── js/
│   ├── auth.js              # Admin authentication handler
│   ├── forms-store.js       # Forms database & submission logic
│   └── qrcode.min.js        # Offline QR code generator for passes
└── google-apps-script/
    └── Code.gs              # Google Apps Script webhook for Google Sheets
```
