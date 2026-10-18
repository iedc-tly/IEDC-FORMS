/**
 * ==========================================================================
 *  IEDC FORMS - CENTRAL DATA STORE & GOOGLE SHEETS DISPATCHER
 * ==========================================================================
 */

const FormsStore = (function () {
  'use strict';

  const FORMS_KEY = 'iedc_forms_db';
  const SUBMISSIONS_KEY = 'iedc_submissions_db';
  const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxPCFnYDvDrivGyDOqRx8clG0_JQeyoc7Glr41iayQ9iWZUbeKd1woO2S6F5Shh1JF1yw/exec';

  // Prebuilt Question Templates Catalog (Google Forms / Zoho Forms style)
  const PREBUILT_TEMPLATES = [
    {
      id: "full_name",
      title: "Full Name",
      type: "text",
      placeholder: "e.g., Rahul Sharma",
      required: true,
      category: "Contact"
    },
    {
      id: "email",
      title: "Email Address",
      type: "email",
      placeholder: "e.g., rahul@example.com",
      required: true,
      helpText: "Your registration pass will be delivered to this email",
      category: "Contact"
    },
    {
      id: "phone",
      title: "Phone / WhatsApp Number",
      type: "tel",
      placeholder: "e.g., 9876543210",
      required: true,
      category: "Contact"
    },
    {
      id: "college",
      title: "College / University Name",
      type: "text",
      placeholder: "e.g., National Institute of Technology",
      required: true,
      category: "Academic"
    },
    {
      id: "department",
      title: "Department / Branch",
      type: "dropdown",
      options: [
        "Computer Science & Engineering",
        "Information Technology",
        "AI & Data Science",
        "Electronics & Communication (ECE)",
        "Electrical & Electronics (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Management / MBA",
        "Other"
      ],
      required: true,
      category: "Academic"
    },
    {
      id: "year_of_study",
      title: "Year of Study",
      type: "single_select", // Radio
      options: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Postgraduate"],
      required: true,
      category: "Academic"
    },
    {
      id: "student_id",
      title: "Roll Number / Student ID",
      type: "text",
      placeholder: "e.g., 22CS091",
      required: false,
      category: "Academic"
    },
    {
      id: "team_size",
      title: "Team Size",
      type: "number", // Numbers only
      placeholder: "Enter a number (1 - 5)",
      required: false,
      category: "Logistics"
    },
    {
      id: "tshirt_size",
      title: "T-Shirt Size (for free swag)",
      type: "single_select",
      options: ["S", "M", "L", "XL", "XXL"],
      required: true,
      category: "Logistics"
    },
    {
      id: "food_pref",
      title: "Food & Refreshment Preference",
      type: "single_select",
      options: ["Vegetarian", "Non-Vegetarian", "Jain Food"],
      required: true,
      category: "Logistics"
    },
    {
      id: "skills_tracks",
      title: "Areas of Interest / Track Preferences",
      type: "multiple_select", // Checkboxes
      options: ["Web & Mobile Dev", "AI & Machine Learning", "Blockchain / Web3", "UI/UX Design", "Startup & Pitching"],
      required: false,
      category: "Logistics"
    },
    {
      id: "github_linkedin",
      title: "LinkedIn or GitHub Profile",
      type: "text",
      placeholder: "https://linkedin.com/in/... or github.com/...",
      required: false,
      category: "Profiles"
    }
  ];

  // Default initial forms (Light aesthetic)
  const INITIAL_FORMS = [
    {
      id: "hacknova-2026",
      title: "HACKNOVA 2026: 36-Hour National Hackathon",
      description: "Join the most anticipated student tech sprint of the year! 36 hours of coding, building, and mentorship. Free entry, complimentary meals, certificates, and $50k prize pool.",
      bannerUrl: "assets/images/hackathon.jpg",
      dateStr: "Fri, Nov 14 – Sun, Nov 16, 2026",
      timeStr: "09:00 AM IST onwards",
      venue: "Innovation Hub & Convention Center, Campus North Block",
      sheetWebhookUrl: DEFAULT_WEBHOOK_URL,
      fee: "₹0 (Free)",
      questions: [
        {
          id: "q_name",
          title: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true
        },
        {
          id: "q_email",
          title: "Email Address",
          type: "email",
          placeholder: "Enter your college or personal email",
          required: true,
          helpText: "We will email your entry pass here"
        },
        {
          id: "q_phone",
          title: "Phone / WhatsApp Number",
          type: "tel",
          placeholder: "10-digit mobile number",
          required: true
        },
        {
          id: "q_college",
          title: "College / University Name",
          type: "text",
          placeholder: "Your institution name",
          required: true
        },
        {
          id: "q_dept",
          title: "Department / Branch",
          type: "dropdown",
          options: ["Computer Science & Engineering", "Information Technology", "AI & Data Science", "ECE", "EEE", "Mechanical", "Other"],
          required: true
        },
        {
          id: "q_year",
          title: "Year of Study",
          type: "single_select",
          options: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Postgraduate"],
          required: true
        },
        {
          id: "q_team_size",
          title: "Number of Team Members",
          type: "number",
          placeholder: "e.g., 4 (Numbers only)",
          required: false
        },
        {
          id: "q_tracks",
          title: "Preferred Hackathon Tracks",
          type: "multiple_select",
          options: ["FinTech & Open Banking", "Healthcare AI", "CleanTech & Green Energy", "Open Innovation"],
          required: true
        },
        {
          id: "q_tshirt",
          title: "T-Shirt Size (for free swag)",
          type: "single_select",
          options: ["S", "M", "L", "XL", "XXL"],
          required: true
        },
        {
          id: "q_food",
          title: "Dietary Preference",
          type: "single_select",
          options: ["Vegetarian", "Non-Vegetarian", "Jain Food"],
          required: true
        }
      ]
    },
    {
      id: "startup-summit-2026",
      title: "Futuristic Startup Summit & AI Conclave",
      description: "Meet student founders, angel investors, and AI leaders. Pitch your startup, attend keynote fireside chats, and explore future technologies. 100% Free Delegate Pass.",
      bannerUrl: "assets/images/startup_conclave.jpg",
      dateStr: "Saturday, Dec 05, 2026",
      timeStr: "09:30 AM - 05:30 PM IST",
      venue: "Auditorium Grand Hall, Senate Complex",
      sheetWebhookUrl: DEFAULT_WEBHOOK_URL,
      fee: "₹0 (Free)",
      questions: [
        {
          id: "q_name",
          title: "Full Name",
          type: "text",
          placeholder: "Enter your full name",
          required: true
        },
        {
          id: "q_email",
          title: "Email Address",
          type: "email",
          placeholder: "Enter email address",
          required: true
        },
        {
          id: "q_phone",
          title: "Phone / WhatsApp Number",
          type: "tel",
          placeholder: "10-digit mobile number",
          required: true
        },
        {
          id: "q_org",
          title: "College / Company / Startup Name",
          type: "text",
          placeholder: "Organization name",
          required: true
        },
        {
          id: "q_category",
          title: "I am attending as",
          type: "single_select",
          options: ["Student Innovator", "Aspiring Founder", "Developer / Engineer", "Faculty / Researcher", "Investor"],
          required: true
        },
        {
          id: "q_years_exp",
          title: "Years of Experience (or College Year)",
          type: "number",
          placeholder: "Numbers only (e.g. 2)",
          required: false
        },
        {
          id: "q_linkedin",
          title: "LinkedIn Profile URL",
          type: "text",
          placeholder: "https://linkedin.com/in/...",
          required: false
        }
      ]
    }
  ];

  /**
   * Initialize or retrieve forms database
   */
  function getForms() {
    try {
      const stored = localStorage.getItem(FORMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        let updated = false;
        parsed.forEach(f => {
          if (!f.sheetWebhookUrl) {
            f.sheetWebhookUrl = DEFAULT_WEBHOOK_URL;
            updated = true;
          }
        });
        if (updated) localStorage.setItem(FORMS_KEY, JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) {
      console.warn("Error reading forms from localStorage:", e);
    }
    // Seed default forms
    localStorage.setItem(FORMS_KEY, JSON.stringify(INITIAL_FORMS));
    return INITIAL_FORMS;
  }

  function getFormById(id) {
    const forms = getForms();
    return forms.find(f => f.id === id) || null;
  }

  const DEFAULT_BANNER_URL = 'assets/images/hackathon.jpg';

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || (`event-${Date.now().toString(36)}`);
  }

  function saveForm(form, skipCloudSync = false) {
    const forms = getForms();
    const idx = forms.findIndex(f => f.id === form.id);
    if (idx >= 0) {
      forms[idx] = form;
    } else {
      forms.unshift(form);
    }
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));

    // Automatically sync form to connected Google Sheet in background
    if (!skipCloudSync) {
      syncFormToCloud(form);
    }
    return form;
  }

  function deleteForm(id) {
    let forms = getForms();
    forms = forms.filter(f => f.id !== id);
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    return forms;
  }

  /**
   * Ultra-Compact Cross-Device URL Encoding & Decoding
   * Drastically cuts down link length (60%+ smaller) by stripping redundant defaults
   * and mapping questions into lightweight tuples.
   */
  function encodeFormToUrl(form) {
    if (!form) return '';
    try {
      const compact = {
        t: form.title || ''
      };
      if (form.description) compact.ds = form.description;
      if (form.venue && form.venue !== 'Campus Venue') compact.v = form.venue;
      if (form.dateStr && form.dateStr !== 'Date TBD') compact.d = form.dateStr;
      if (form.timeStr && form.timeStr !== '09:00 AM') compact.tm = form.timeStr;
      if (form.bannerUrl && form.bannerUrl !== DEFAULT_BANNER_URL) compact.b = form.bannerUrl;
      if (form.sheetWebhookUrl && form.sheetWebhookUrl !== DEFAULT_WEBHOOK_URL) compact.w = form.sheetWebhookUrl;
      if (form.fee && form.fee !== '₹0 (Free)') compact.f = form.fee;

      if (Array.isArray(form.questions) && form.questions.length > 0) {
        compact.q = form.questions.map(q => {
          const type = q.type || 'text';
          const isChoice = ['single_select', 'multiple_select', 'dropdown'].includes(type);
          const item = [q.title || 'Question'];
          if (type !== 'text' || q.required || (isChoice && q.options && q.options.length)) {
            item.push(type === 'text' ? '' : type);
          }
          if (q.required || (isChoice && q.options && q.options.length)) {
            item.push(q.required ? 1 : 0);
          }
          if (isChoice && Array.isArray(q.options) && q.options.length > 0) {
            item.push(q.options);
          }
          return item;
        });
      }

      const jsonStr = JSON.stringify(compact);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const b64 = btoa(binary);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      console.error("Error encoding form to URL:", e);
      return '';
    }
  }

  function decodeFormFromUrl(encodedStr, fallbackId) {
    if (!encodedStr) return null;
    try {
      let clean = decodeURIComponent(encodedStr.trim()).replace(/-/g, '+').replace(/_/g, '/');
      while (clean.length % 4) {
        clean += '=';
      }
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      const data = JSON.parse(jsonStr);

      // Support new compact schema
      if (data.t && !data.title) {
        return {
          id: fallbackId || data.i || (`form-${Date.now()}`),
          title: data.t,
          description: data.ds || '',
          venue: data.v || 'Campus Venue',
          dateStr: data.d || 'Date TBD',
          timeStr: data.tm || '09:00 AM',
          bannerUrl: data.b || DEFAULT_BANNER_URL,
          sheetWebhookUrl: data.w || DEFAULT_WEBHOOK_URL,
          fee: data.f || '₹0 (Free)',
          questions: (data.q || []).map((item, idx) => {
            if (Array.isArray(item)) {
              return {
                id: `q_${idx}`,
                title: item[0],
                type: item[1] || 'text',
                required: Boolean(item[2]),
                options: Array.isArray(item[3]) ? item[3] : []
              };
            }
            return item;
          })
        };
      }

      // Support legacy schema
      if (data && data.title) {
        if (!data.sheetWebhookUrl) data.sheetWebhookUrl = DEFAULT_WEBHOOK_URL;
        if (!data.bannerUrl) data.bannerUrl = DEFAULT_BANNER_URL;
        return data;
      }
    } catch (e) {
      console.warn("Error decoding form from URL data:", e);
    }
    return null;
  }

  function getBaseUrl() {
    try {
      let href = window.location.href.split('?')[0].split('#')[0];
      if (href.endsWith('.html')) {
        return href.replace(/[^/]+\.html$/, 'index.html');
      } else if (href.endsWith('/')) {
        return href + 'index.html';
      } else {
        return href + '/index.html';
      }
    } catch (e) {
      return 'index.html';
    }
  }

  /**
   * Short Link: Clean URL (?form=new-event)
   * Resolves instantly across devices when synced with Google Sheets or cached locally.
   */
  function getShortUrl(formOrId) {
    const id = typeof formOrId === 'string' ? formOrId : (formOrId && formOrId.id);
    if (!id) return '';
    const base = getBaseUrl();
    return `${base}?form=${encodeURIComponent(id)}`;
  }

  /**
   * Universal Link: Self-contained URL (?form=new-event&d=...)
   * Guarantees 100% offline & cross-device compatibility.
   */
  function getShareableUrl(formOrId) {
    const form = typeof formOrId === 'string' ? getFormById(formOrId) : formOrId;
    if (!form) {
      if (typeof formOrId === 'string' && formOrId) {
        return `${getBaseUrl()}?form=${encodeURIComponent(formOrId)}`;
      }
      return '';
    }

    const base = getBaseUrl();
    const encoded = encodeFormToUrl(form);
    if (encoded) {
      return `${base}?form=${encodeURIComponent(form.id)}&d=${encoded}`;
    }
    return `${base}?form=${encodeURIComponent(form.id)}`;
  }

  /**
   * Google Apps Script Cloud Sync
   */
  async function syncFormToCloud(form, webhookUrl) {
    const url = webhookUrl || form.sheetWebhookUrl || localStorage.getItem('iedc_global_webhook_url') || DEFAULT_WEBHOOK_URL;
    if (!url || !url.startsWith('http')) return false;
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save_form_config',
          form: form
        })
      });
      return true;
    } catch (e) {
      console.warn("Cloud form sync notice:", e);
      return false;
    }
  }

  async function fetchFormFromCloud(formId, webhookUrl) {
    const url = webhookUrl || localStorage.getItem('iedc_global_webhook_url') || DEFAULT_WEBHOOK_URL;
    if (!url || !url.startsWith('http')) return null;
    try {
      const fetchUrl = `${url}?action=get_form&id=${encodeURIComponent(formId)}`;
      const res = await fetch(fetchUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title && !data.error) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Cloud form fetch notice:", e);
    }
    return null;
  }


  /**
   * Submissions Management
   */
  function getSubmissions(formId = null) {
    try {
      const list = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
      if (formId) {
        return list.filter(item => item['Form ID'] === formId);
      }
      return list;
    } catch (e) {
      return [];
    }
  }

  async function recordSubmission(form, answers) {
    const bookingId = `IEDC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toLocaleString();

    // 1. Complete local record for offline backup & admin dashboard
    const record = {
      "Timestamp": timestamp,
      "Booking ID": bookingId,
      "Form ID": form.id,
      "Event Title": form.title,
      ...answers
    };

    try {
      const list = getSubmissions();
      list.unshift(record);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // 2. Prepare payload for Google Sheets:
    // ONLY contains Timestamp, Booking ID, and the exact question titles created in this form!
    const sheetPayload = {
      "_eventTitle": form.title, // Internal routing parameter for tab naming (not added as a column)
      "Timestamp": timestamp,
      "Booking ID": bookingId
    };

    // Add questions in the exact order created in the form
    if (Array.isArray(form.questions)) {
      form.questions.forEach(q => {
        if (q && q.title) {
          sheetPayload[q.title] = answers[q.title] !== undefined ? answers[q.title] : "";
        }
      });
    }

    // Add any additional form fields if not already captured
    for (const key of Object.keys(answers)) {
      if (sheetPayload[key] === undefined) {
        sheetPayload[key] = answers[key];
      }
    }

    // 3. Dispatch to Google Apps Script Webhook (if provided)
    const webhookUrl = form.sheetWebhookUrl || localStorage.getItem('iedc_global_webhook_url') || DEFAULT_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Standard bypass for Google Apps Script Web App
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(sheetPayload)
        });
      } catch (err) {
        console.warn("Google Sheet webhook POST notice:", err);
      }
    }

    return record;
  }

  function clearSubmissions() {
    localStorage.removeItem(SUBMISSIONS_KEY);
  }

  return {
    getForms,
    getFormById,
    saveForm,
    deleteForm,
    getSubmissions,
    recordSubmission,
    clearSubmissions,
    encodeFormToUrl,
    decodeFormFromUrl,
    getShareableUrl,
    getShortUrl,
    syncFormToCloud,
    fetchFormFromCloud,
    slugify,
    DEFAULT_WEBHOOK_URL,
    PREBUILT_TEMPLATES
  };
})();

if (typeof window !== 'undefined') {
  window.FormsStore = FormsStore;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormsStore;
}
