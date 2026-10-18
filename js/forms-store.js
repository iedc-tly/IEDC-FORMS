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

  function saveForm(form) {
    const forms = getForms();
    const idx = forms.findIndex(f => f.id === form.id);
    if (idx >= 0) {
      forms[idx] = form;
    } else {
      forms.unshift(form);
    }
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    return form;
  }

  function deleteForm(id) {
    let forms = getForms();
    forms = forms.filter(f => f.id !== id);
    localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
    return forms;
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

    const record = {
      "Timestamp": timestamp,
      "Booking ID": bookingId,
      "Form ID": form.id,
      "Event Title": form.title,
      "Event Date": form.dateStr || "",
      "Registration Fee": "₹0 (Free)",
      ...answers
    };

    // 1. Save locally in localStorage as a guaranteed offline backup
    try {
      const list = getSubmissions();
      list.unshift(record);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error("Local storage error:", e);
    }

    // 2. Dispatch to Google Apps Script Webhook (if provided)
    const webhookUrl = form.sheetWebhookUrl || localStorage.getItem('iedc_global_webhook_url') || DEFAULT_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Standard bypass for Google Apps Script Web App
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(record)
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
    PREBUILT_TEMPLATES
  };
})();

window.FormsStore = FormsStore;
