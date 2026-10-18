# 📋 IEDC Event Forms & Registration Studio

A minimal, light-themed event registration platform designed for campus clubs, hackathons, and tech summits. Built to function like **Google Forms / Zoho Forms** for attendees (no login required, direct link access) with a secure **Admin Form Builder & Studio** that posts responses directly into **Google Sheets**.

---

## 🚀 Key Features

### 1. 👥 Attendee Experience (Google Forms Style)
- **Zero Login Required**: Anyone with the specific form link can register immediately.
- **Direct Form Links**: Sharing `https://your-domain/index.html?form=hacknova-2026` opens **only that respective form**.
- **Minimal, Light UI**: Clean, light aesthetics (slate grays, pure whites, modern indigo accents) inspired by Google Forms and Notion.
- **Rich Question Types**:
  - Short Answer (Text)
  - Paragraph (Long Text)
  - **Numbers Only** (e.g., Team Size, Age, Roll No with numeric constraints)
  - **Single Select** (Multiple choice radio pills)
  - **Multiple Select** (Checkboxes)
  - Dropdown Menus
  - Email & WhatsApp Phone
  - Required validation indicators (`*`)
- **Instant Digital E-Pass**: Upon submission, attendees receive a BookMyShow-style light perforated E-Ticket with:
  - Scannable QR Code
  - Unique Booking ID (`IEDC-XXXX-XXXX`)
  - Date, Time & Venue
  - "Print / Save Pass (PDF)" & "Add to Google Calendar" buttons

### 2. 🛡️ Secure Admin Studio (`admin.html`)
- **Protected by Login**:
  - **Username**: `IEDC@2026`
  - **Password**: `IEDC@2026`
- **Zero Credentials in Git / GitHub**:
  - Saved in `.env` and `js/env.js`.
  - Strictly listed in `.gitignore` so secrets are never pushed to GitHub.
  - Verification uses one-way **SHA-256 cryptographic hashing** so plaintext passwords never exist anywhere in the public repository.
- **Dynamic Form Builder**:
  - Configure Event Title, Description, Date, Time, Venue, and Banner.
  - Link individual Google Sheets for each event.
  - **1-Click Prebuilt Questions**: Full Name, Email, WhatsApp, College, Department, Year of Study, T-shirt Size, Food Preference, Track Preferences.
  - **Custom Questions**: Add text, number-only, single select, multiple select, or dropdown questions with full option editing.
  - **1-Click Copy Link**: Share direct form links with attendees.
- **Registrations Manager**:
  - Real-time offline cache backup (never lose a registrant even if network drops).
  - Search and filter attendees by event.
  - **1-Click Export to CSV / Excel**.

---

## ⚡ 2-Minute Google Sheets Setup (Zero Server / Free)

To receive registration submissions directly in a Google Sheet:

1. Open **[Google Sheets (sheets.new)](https://sheets.new)** to create a new spreadsheet (e.g. *"HackNova 2026 Registrations"*).
2. In the top menu, click **Extensions** → **Apps Script**.
3. Delete any boilerplate code, and paste the code from [`google-apps-script/Code.gs`](file:///d:/IEDC/Register_forms/google-apps-script/Code.gs).
4. Click **Save** (Ctrl+S / Cmd+S).
5. Click **Deploy** (top right) → **New deployment**.
6. Click the gear icon next to *Select type* and choose **Web app**.
7. Set:
   - **Description**: `Event Registration API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(Crucial: must be Anyone so your site can submit)*
8. Click **Deploy**, authorize your Google account, and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).
9. In `admin.html`, paste this URL into the **Google Sheets Webhook URL** field and click **Test Connection** & **Save**!

### Active Deployment Details
- **Deployment ID**: `AKfycbwDVU0lxAQ2hcyPsojeX82wMTmb7ammt-8rxAJHkfwTevBftzI4-mKkZz-5DIZQICLaFw`
- **Web App URL**: `https://script.google.com/macros/s/AKfycbwDVU0lxAQ2hcyPsojeX82wMTmb7ammt-8rxAJHkfwTevBftzI4-mKkZz-5DIZQICLaFw/exec`
- **Library URL**: `https://script.google.com/macros/library/d/1j_gpT2ydBMvNHFccKtuWIujKJO4JrJdZx5DfytR24QLsEeNnpFEJxbxr/1`
- **Status**: Verified & Active (Tested row recording confirmed)

> **Auto-Column Creation**: When you add new questions to your form, the Google Apps Script automatically creates new header columns in row 1 of your Google Sheet!

---

## 🌐 Hosting on GitHub Pages (Free)

This project contains pure HTML5, CSS3, and modern JavaScript—requiring **zero build steps** and zero backend servers:

1. Initialize and push the repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy IEDC Registration Forms"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under *Build and deployment*, set Source to **Deploy from a branch**.
   - Select Branch: `main` and folder: `/ (root)`.
   - Click **Save**.
3. Your web app will be live at:
   - Attendee Form: `https://<your-username>.github.io/<your-repo-name>/index.html?form=hacknova-2026`
   - Admin Portal: `https://<your-username>.github.io/<your-repo-name>/admin.html`

---

## 🔒 Security & Environment Variables

- `.env` stores:
  ```env
  ADMIN_USERNAME=IEDC@2026
  ADMIN_PASSWORD=IEDC@2026
  ```
- `.gitignore` ensures neither `.env` nor `js/env.js` will ever be pushed to your GitHub repository.
- GitHub Pages code uses SHA-256 verification (`crypto.subtle.digest`) to match credentials without disclosing them.

---

## 📁 Project Structure

```text
├── .env                     # Private admin credentials (gitignored)
├── .env.example             # Safe template for repository
├── .gitignore               # Excludes secrets & temporary files
├── index.html               # Public Attendee Registration Form (Light & minimal)
├── admin.html               # Secure Admin Studio & Form Builder
├── serve.js                 # Optional lightweight local preview server
├── css/
│   ├── light-theme.css      # Clean, minimal light design system (Google Forms style)
│   └── style.css            # Cinematic theme stylesheet
├── js/
│   ├── auth.js              # Secure credential verification (Zero plaintext in git)
│   ├── env.js               # Local env config (gitignored)
│   ├── forms-store.js       # Dynamic questions catalog, forms database & submissions
│   └── qrcode.min.js        # Offline QR code generator for digital passes
└── google-apps-script/
    └── Code.gs              # Ready-to-deploy Google Apps Script webhook
```

---

## 💻 Local Development

Run the lightweight preview server:
```bash
node serve.js
```
Open [http://127.0.0.1:8080/index.html](http://127.0.0.1:8080/index.html) for attendee registration or [http://127.0.0.1:8080/admin.html](http://127.0.0.1:8080/admin.html) for the admin portal.
