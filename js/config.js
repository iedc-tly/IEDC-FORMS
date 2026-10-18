/**
 * ==========================================================================
 *  EVENT REGISTRATION CONFIGURATION & PREBUILT QUESTIONS LIBRARY
 * ==========================================================================
 *  Edit this file to add new events, modify questions, or change the
 *  Google Sheets Webhook URL.
 * ==========================================================================
 */

const APP_CONFIG = {
  // Brand identity (BookMyShow vibe)
  brandName: "IEDC TICKETBOX",
  brandTagline: "Premier Campus & Tech Events Portal",
  brandLogoText: "IEDC",
  supportEmail: "iedc.events@college.edu",
  currencySymbol: "₹",

  // Google Apps Script Web App URL
  // Deployed from Code.gs
  googleSheetWebhookUrl: "https://script.google.com/macros/s/AKfycbwDVU0lxAQ2hcyPsojeX82wMTmb7ammt-8rxAJHkfwTevBftzI4-mKkZz-5DIZQICLaFw/exec",

  // Pre-built questions catalog (like Google Forms / Zoho Forms)
  prebuiltQuestions: [
    {
      id: "Full Name",
      label: "Full Name",
      type: "text",
      placeholder: "e.g., Rahul Sharma",
      required: true,
      category: "Personal Info"
    },
    {
      id: "Email Address",
      label: "Email Address",
      type: "email",
      placeholder: "e.g., rahul.sharma@example.com",
      required: true,
      helpText: "We will send your digital confirmation pass to this email",
      category: "Personal Info"
    },
    {
      id: "Phone / WhatsApp",
      label: "Phone / WhatsApp Number",
      type: "tel",
      placeholder: "e.g., 9876543210",
      required: true,
      helpText: "Used for urgent event announcements and team coordination",
      category: "Personal Info"
    },
    {
      id: "Gender",
      label: "Gender",
      type: "radio",
      options: ["Male", "Female", "Prefer not to say", "Other"],
      required: false,
      category: "Personal Info"
    },
    {
      id: "College / Organization",
      label: "College / Institution / Organization",
      type: "text",
      placeholder: "e.g., National Institute of Technology",
      required: true,
      category: "Academic / Professional"
    },
    {
      id: "Department / Stream",
      label: "Department / Branch",
      type: "select",
      options: [
        "Computer Science & Engineering",
        "Information Technology",
        "Artificial Intelligence & Data Science",
        "Electronics & Communication (ECE)",
        "Electrical & Electronics (EEE)",
        "Mechanical Engineering",
        "Civil Engineering",
        "Business Administration (MBA/BBA)",
        "Basic Sciences / Others"
      ],
      required: true,
      category: "Academic / Professional"
    },
    {
      id: "Year of Study",
      label: "Year of Study",
      type: "radio",
      options: ["1st Year", "2nd Year", "3rd Year", "Final Year", "Postgraduate / Alumni", "Working Professional"],
      required: true,
      category: "Academic / Professional"
    },
    {
      id: "Roll / Registration No",
      label: "College Roll No / Student ID",
      type: "text",
      placeholder: "e.g., 22CS089",
      required: false,
      category: "Academic / Professional"
    },
    {
      id: "GitHub Profile",
      label: "GitHub Profile / Portfolio Link",
      type: "url",
      placeholder: "https://github.com/username",
      required: false,
      category: "Tech Profiles"
    },
    {
      id: "LinkedIn Profile",
      label: "LinkedIn Profile URL",
      type: "url",
      placeholder: "https://linkedin.com/in/username",
      required: false,
      category: "Tech Profiles"
    },
    {
      id: "T-Shirt Size",
      label: "T-Shirt Size (for free swag kit)",
      type: "select",
      options: ["S (Small)", "M (Medium)", "L (Large)", "XL (Extra Large)", "XXL (Double XL)"],
      required: true,
      category: "Event Logistics"
    },
    {
      id: "Food Preference",
      label: "Food & Refreshment Preference",
      type: "radio",
      options: ["Vegetarian", "Non-Vegetarian", "Jain Food"],
      required: true,
      category: "Event Logistics"
    },
    {
      id: "Team or Individual",
      label: "Participation Format",
      type: "radio",
      options: ["Individual (Need team matching)", "Team Leader (Forming a team)", "Team Member"],
      required: true,
      category: "Event Logistics"
    },
    {
      id: "Team Name",
      label: "Team Name (if participating as team)",
      type: "text",
      placeholder: "e.g., Code Crusaders",
      required: false,
      category: "Event Logistics"
    },
    {
      id: "How did you hear about us",
      label: "How did you hear about this event?",
      type: "select",
      options: [
        "College Notice Board / Posters",
        "WhatsApp / Telegram Groups",
        "Instagram / Social Media",
        "Faculty / Mentor Recommendation",
        "Friends / Classmates"
      ],
      required: false,
      category: "Survey"
    },
    {
      id: "Expectations / Goals",
      label: "What do you hope to learn or build?",
      type: "textarea",
      placeholder: "Share your areas of interest, ideas, or topics you want to explore...",
      required: false,
      category: "Survey"
    }
  ],

  // Events List
  events: [
    {
      id: "hacknova-2026",
      title: "HACKNOVA 2026: 36-Hour National Hackathon",
      tagline: "Build, Innovate, Disrupt — Where Code Meets Future Entrepreneurship",
      badge: "FEATURED • LIMITED PASSES",
      category: "Hackathon",
      status: "Registration Open",
      rating: "4.9/5 (1.2k+ past attendees)",
      duration: "36 Hours",
      language: "English / Regional",
      dateStr: "Fri, Nov 14 – Sun, Nov 16, 2026",
      isoDate: "2026-11-14T09:00:00",
      timeStr: "09:00 AM IST onwards",
      venue: "Innovation Hub & Convention Center, Campus North Block",
      venueMapLink: "https://maps.google.com",
      mode: "In-Person (On Campus)",
      bannerImage: "assets/images/hackathon.jpg",
      organizer: {
        name: "IEDC & Student Innovation Council",
        contact: "iedc.leads@college.edu",
        verified: true
      },
      pricing: {
        isFree: true,
        originalPrice: 499,
        displayPrice: "FREE (₹0)",
        convenienceFee: 0,
        total: 0
      },
      ticketTiers: [
        {
          id: "general-free",
          name: "Free Innovator Pass",
          price: 0,
          desc: "Full 36-hr hackathon access, food, hackathon swag pack, cloud credits & participation certificate.",
          available: 150,
          fastFilling: true
        },
        {
          id: "student-team",
          name: "Team Leader Pass",
          price: 0,
          desc: "Reserve a dedicated mentor table + team hacking workstation for your group.",
          available: 40,
          fastFilling: false
        }
      ],
      highlights: [
        "₹50,000+ Prize Pool with Direct Incubation Support",
        "24x7 High-Speed Wi-Fi & Workstations",
        "Complimentary Meals, Midnight Energy Drinks & Snacks",
        "Mentorship from Senior Industry Engineers & Founders",
        "Official Certificate of Participation by IEDC & Govt. Body"
      ],
      overview: `Join the most anticipated student tech sprint of the year! HACKNOVA 2026 brings together the sharpest developers, designers, and student founders to ideate, prototype, and build solutions in FinTech, Healthcare AI, CleanTech, and Autonomous Systems over 36 electrifying hours. Whether you are an experienced hacker or building your first web app, you will find mentors, teammates, and industry sponsors waiting to back your vision.`,
      agenda: [
        { time: "Day 1 - 09:00 AM", title: "Check-in, ID Verification & Swag Distribution" },
        { time: "Day 1 - 10:30 AM", title: "Opening Keynote & Problem Statements Released" },
        { time: "Day 1 - 12:00 PM", title: "Hacking Commences + Team Ideation" },
        { time: "Day 1 - 08:00 PM", title: "Round 1 Mentorship & Architecture Check" },
        { time: "Day 2 - 02:00 AM", title: "Midnight Gaming & Rapid Pitch Challenge" },
        { time: "Day 2 - 02:00 PM", title: "Round 2 Code Review & Prototype Freeze" },
        { time: "Day 3 - 10:00 AM", title: "Grand Finale Demos & Awards Ceremony" }
      ],
      speakers: [
        { name: "Vikram Malhotra", role: "VP of Engineering", org: "NextGen AI Labs" },
        { name: "Pooja Hegde", role: "Founding Partner", org: "EarlyStage Ventures" },
        { name: "Arjun Nambiar", role: "Principal Cloud Architect", org: "Global Tech" }
      ],
      faqs: [
        { q: "Is registration really ₹0 (Free)?", a: "Yes! Thanks to our IEDC institutional grants and industry sponsors, participation, meals, and swag are completely free of charge." },
        { q: "Can I register as an individual?", a: "Absolutely! We hold a team formation mixer right after the opening ceremony so you can team up with fellow participants." },
        { q: "What do I need to bring?", a: "Bring your laptop, charger, student ID, and your drive to innovate! Rest is taken care of." }
      ],
      // Dynamic questions to ask for this event
      questions: [
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "Gender",
        "College / Organization",
        "Department / Stream",
        "Year of Study",
        "Roll / Registration No",
        "GitHub Profile",
        "LinkedIn Profile",
        "T-Shirt Size",
        "Food Preference",
        "Team or Individual",
        "Team Name",
        "How did you hear about us",
        "Expectations / Goals"
      ]
    },
    {
      id: "startup-conclave-2026",
      title: "Futuristic Startup Summit & AI Conclave",
      tagline: "Navigating the Frontiers of Tomorrow: Founders, Investors & AI Architects",
      badge: "EXCLUSIVE KEYNOTE",
      category: "Conclave",
      status: "Registration Open",
      rating: "4.8/5 (900+ registered)",
      duration: "Full Day (8 Hours)",
      language: "English",
      dateStr: "Saturday, Dec 05, 2026",
      isoDate: "2026-12-05T09:30:00",
      timeStr: "09:30 AM - 05:30 PM IST",
      venue: "Auditorium Grand Hall, Senate Complex",
      venueMapLink: "https://maps.google.com",
      mode: "In-Person + Live Streamed",
      bannerImage: "assets/images/startup_conclave.jpg",
      organizer: {
        name: "IEDC Entrepreneurship Cell",
        contact: "startupconclave@college.edu",
        verified: true
      },
      pricing: {
        isFree: true,
        originalPrice: 999,
        displayPrice: "FREE (₹0)",
        convenienceFee: 0,
        total: 0
      },
      ticketTiers: [
        {
          id: "delegate-free",
          name: "Free Delegate Access Pass",
          price: 0,
          desc: "Access to all panel sessions, startup exhibition hall, lunch & high tea buffet.",
          available: 200,
          fastFilling: true
        },
        {
          id: "pitch-free",
          name: "Founder Pitch Slot (Apply Free)",
          price: 0,
          desc: "Apply to pitch your student startup live on stage in front of angel investors.",
          available: 15,
          fastFilling: true
        }
      ],
      highlights: [
        "Live Startup Pitches with Instant Angel Feedback",
        "Keynote by Unicorn Founders & Tech Leaders",
        "Networking High-Tea & One-on-One Founder Roundtables",
        "IEDC Seed Grant Announcement ($10,000 Pool)",
        "Complimentary Delegate Kit & Certificate"
      ],
      overview: `The Startup & AI Innovation Conclave 2026 is the annual flagship gathering bridging aspiring student innovators with seasoned venture capitalists, tech pioneers, and domain specialists. Discover where artificial intelligence is steering commerce, education, and deep tech, and how you can transform your campus idea into an investable venture.`,
      agenda: [
        { time: "09:30 AM", title: "Registrations & Welcome Breakfast" },
        { time: "10:15 AM", title: "Opening Address: The State of Campus Innovation" },
        { time: "11:00 AM", title: "Keynote: Building Scalable AI Agents & Products" },
        { time: "01:00 PM", title: "Networking Lunch & Startup Expo Walkthrough" },
        { time: "02:30 PM", title: "Live Seed Pitching Round (Top 10 Student Startups)" },
        { time: "04:30 PM", title: "Fireside Chat with Venture Capitalists & High Tea" }
      ],
      speakers: [
        { name: "Kavita Rao", role: "Managing Partner", org: "BlueSky Capital" },
        { name: "Devendra Seth", role: "Co-Founder & CEO", org: "Synthetix AI" },
        { name: "Nikhil George", role: "Head of Product", org: "FinTech Orbit" }
      ],
      faqs: [
        { q: "Who can attend the Conclave?", a: "Open to all students, faculty members, researchers, and early-stage startup enthusiasts from any college or university." },
        { q: "Is there any ticket cost?", a: "Zero cost. All passes are 100% complimentary sponsored by the institution's innovation fund." }
      ],
      questions: [
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "College / Organization",
        "Department / Stream",
        "Year of Study",
        "LinkedIn Profile",
        "Food Preference",
        "How did you hear about us",
        "Expectations / Goals"
      ]
    }
  ]
};

// Export to window for browser usage without bundlers
window.APP_CONFIG = APP_CONFIG;
