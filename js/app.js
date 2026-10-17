/**
 * ==========================================================================
 *  IEDC TICKETBOX - APPLICATION CONTROLLER
 * ==========================================================================
 */

(function () {
  'use strict';

  // State Management
  const state = {
    events: APP_CONFIG.events || [],
    currentEventId: null,
    selectedTier: null,
    countdownInterval: null,
    searchQuery: '',
    selectedCategory: 'all',
    webhookUrl: localStorage.getItem('iedc_sheet_webhook_url') || APP_CONFIG.googleSheetWebhookUrl || ''
  };

  // DOM Elements Cache
  const el = {
    // Navigation & Filters
    eventCategoryList: document.getElementById('eventCategoryList'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    openAdminModalBtn: document.getElementById('openAdminModalBtn'),
    eventSwitchContainer: document.getElementById('eventSwitchContainer'),
    
    // Hero Showcase
    heroBgImg: document.getElementById('heroBgImg'),
    heroBadgeCategory: document.getElementById('heroBadgeCategory'),
    heroBadgeFeatured: document.getElementById('heroBadgeFeatured'),
    heroTitle: document.getElementById('heroTitle'),
    heroTagline: document.getElementById('heroTagline'),
    heroDatePill: document.getElementById('heroDatePill'),
    heroTimePill: document.getElementById('heroTimePill'),
    heroVenuePill: document.getElementById('heroVenuePill'),
    heroCountdownValD: document.getElementById('countdownDays'),
    heroCountdownValH: document.getElementById('countdownHours'),
    heroCountdownValM: document.getElementById('countdownMinutes'),
    heroCountdownValS: document.getElementById('countdownSeconds'),
    heroBookBtn: document.getElementById('heroBookBtn'),

    // Event Details
    eventOverviewText: document.getElementById('eventOverviewText'),
    highlightsGrid: document.getElementById('highlightsGrid'),
    agendaTimeline: document.getElementById('agendaTimeline'),
    faqList: document.getElementById('faqList'),
    
    // Sidebar Widget
    sidebarTiers: document.getElementById('sidebarTiers'),
    sidebarProceedBtn: document.getElementById('sidebarProceedBtn'),
    mobileProceedBtn: document.getElementById('mobileProceedBtn'),

    // Registration Modal
    registrationModal: document.getElementById('registrationModal'),
    closeRegistrationModalBtn: document.getElementById('closeRegistrationModalBtn'),
    regModalEventTitle: document.getElementById('regModalEventTitle'),
    regModalTierName: document.getElementById('regModalTierName'),
    dynamicFormContainer: document.getElementById('dynamicFormContainer'),
    registrationForm: document.getElementById('registrationForm'),
    btnSubmitRegistration: document.getElementById('btnSubmitRegistration'),
    submitBtnText: document.getElementById('submitBtnText'),
    submitSpinner: document.getElementById('submitSpinner'),

    // Ticket Confirmation Modal
    ticketModal: document.getElementById('ticketModal'),
    closeTicketModalBtn: document.getElementById('closeTicketModalBtn'),
    ticketQrCode: document.getElementById('ticketQrCode'),
    ticketEventTitle: document.getElementById('ticketEventTitle'),
    ticketBookingId: document.getElementById('ticketBookingId'),
    ticketAttendeeName: document.getElementById('ticketAttendeeName'),
    ticketDate: document.getElementById('ticketDate'),
    ticketTime: document.getElementById('ticketTime'),
    ticketVenue: document.getElementById('ticketVenue'),
    ticketTierName: document.getElementById('ticketTierName'),
    btnDownloadTicket: document.getElementById('btnDownloadTicket'),
    btnAddToCalendar: document.getElementById('btnAddToCalendar'),
    btnShareWhatsapp: document.getElementById('btnShareWhatsapp'),
    btnBookAnother: document.getElementById('btnBookAnother'),

    // Admin / Setup Modal
    adminModal: document.getElementById('adminModal'),
    closeAdminModalBtn: document.getElementById('closeAdminModalBtn'),
    inputWebhookUrl: document.getElementById('inputWebhookUrl'),
    btnSaveWebhook: document.getElementById('btnSaveWebhook'),
    btnTestWebhook: document.getElementById('btnTestWebhook'),
    webhookStatusNotice: document.getElementById('webhookStatusNotice'),
    registrationsCountBadge: document.getElementById('registrationsCountBadge'),
    registrationsTableBody: document.getElementById('registrationsTableBody'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    btnClearLocalData: document.getElementById('btnClearLocalData'),
    btnCopyScriptCode: document.getElementById('btnCopyScriptCode'),

    // Toast
    toastNotice: document.getElementById('toastNotice'),
    toastText: document.getElementById('toastText')
  };

  /**
   * Initialize Application
   */
  function init() {
    // 1. Determine active event from URL query or default to first
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    const matched = state.events.find(e => e.id === eventParam);
    state.currentEventId = matched ? matched.id : state.events[0]?.id;

    // 2. Render UI Components
    renderCategoryFilters();
    renderEventSwitcher();
    loadEventDetails(state.currentEventId);
    setupEventListeners();

    // 3. Populate webhook in admin field if saved
    if (el.inputWebhookUrl && state.webhookUrl) {
      el.inputWebhookUrl.value = state.webhookUrl;
    }
  }

  /**
   * Render Category Filters
   */
  function renderCategoryFilters() {
    const categories = ['all', 'Hackathon', 'Conclave', 'Workshop', 'Conference'];
    el.eventCategoryList.innerHTML = categories.map(cat => `
      <button class="filter-chip ${state.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat === 'all' ? 'All Upcoming Events' : cat}
      </button>
    `).join('');

    el.eventCategoryList.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        el.eventCategoryList.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedCategory = chip.dataset.cat;
        filterEvents();
      });
    });
  }

  /**
   * Render Event Quick Switcher Bar
   */
  function renderEventSwitcher() {
    el.eventSwitchContainer.innerHTML = state.events.map(ev => `
      <button class="event-switch-btn ${ev.id === state.currentEventId ? 'active' : ''}" data-id="${ev.id}">
        <span class="badge-tag badge-category" style="font-size:0.65rem;">${ev.category}</span>
        <span>${ev.title.split(':')[0]}</span>
      </button>
    `).join('');

    el.eventSwitchContainer.querySelectorAll('.event-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        loadEventDetails(btn.dataset.id);
      });
    });
  }

  /**
   * Filter Events by Category or Search
   */
  function filterEvents() {
    const filtered = state.events.filter(e => {
      const matchCat = state.selectedCategory === 'all' || e.category.toLowerCase() === state.selectedCategory.toLowerCase();
      const matchSearch = !state.searchQuery || 
        e.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
        e.overview.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        e.venue.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length > 0 && !filtered.some(e => e.id === state.currentEventId)) {
      loadEventDetails(filtered[0].id);
    }
  }

  /**
   * Load and Render an Event's Details
   */
  function loadEventDetails(eventId) {
    const ev = state.events.find(e => e.id === eventId);
    if (!ev) return;
    state.currentEventId = eventId;
    state.selectedTier = ev.ticketTiers[0] || null;

    // Update Browser URL state without reload
    const url = new URL(window.location);
    url.searchParams.set('event', eventId);
    window.history.replaceState({}, '', url);

    // Update switcher active states
    el.eventSwitchContainer.querySelectorAll('.event-switch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === eventId);
    });

    // Populate Hero Banner
    el.heroBgImg.src = ev.bannerImage;
    el.heroBgImg.alt = ev.title;
    el.heroBadgeCategory.textContent = ev.category;
    el.heroBadgeFeatured.textContent = ev.badge || 'UPCOMING';
    el.heroTitle.textContent = ev.title;
    el.heroTagline.textContent = ev.tagline;
    el.heroDatePill.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${ev.dateStr}`;
    el.heroTimePill.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${ev.timeStr}`;
    el.heroVenuePill.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${ev.venue}`;

    // Start Live Countdown
    startCountdown(ev.isoDate);

    // Populate Overview & Highlights
    el.eventOverviewText.textContent = ev.overview;
    el.highlightsGrid.innerHTML = ev.highlights.map(h => `
      <div class="highlight-card">
        <div class="highlight-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="highlight-text">${h}</div>
      </div>
    `).join('');

    // Populate Agenda Timeline
    el.agendaTimeline.innerHTML = ev.agenda.map(a => `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-time">${a.time}</div>
        <div class="timeline-title">${a.title}</div>
      </div>
    `).join('');

    // Populate FAQs
    el.faqList.innerHTML = ev.faqs.map((faq, idx) => `
      <div class="faq-item ${idx === 0 ? 'open' : ''}">
        <button class="faq-question">
          <span>${faq.q}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="faq-answer">${faq.a}</div>
      </div>
    `).join('');

    el.faqList.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        item.classList.toggle('open');
      });
    });

    // Populate Ticket Tiers in Sidebar
    renderTicketTiers(ev);
  }

  /**
   * Render Sidebar Ticket Tiers
   */
  function renderTicketTiers(ev) {
    el.sidebarTiers.innerHTML = ev.ticketTiers.map((tier, idx) => `
      <div class="tier-card ${idx === 0 ? 'selected' : ''}" data-tier-id="${tier.id}">
        <div class="tier-header">
          <div class="tier-name">${tier.name}</div>
          <div class="tier-price">₹0 (FREE)</div>
        </div>
        <div class="tier-desc">${tier.desc}</div>
      </div>
    `).join('');

    el.sidebarTiers.querySelectorAll('.tier-card').forEach(card => {
      card.addEventListener('click', () => {
        el.sidebarTiers.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedTier = ev.ticketTiers.find(t => t.id === card.dataset.tierId);
      });
    });
  }

  /**
   * Live Countdown Timer
   */
  function startCountdown(isoDateStr) {
    if (state.countdownInterval) clearInterval(state.countdownInterval);
    const target = new Date(isoDateStr).getTime();

    function update() {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        el.heroCountdownValD.textContent = '00';
        el.heroCountdownValH.textContent = '00';
        el.heroCountdownValM.textContent = '00';
        el.heroCountdownValS.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      el.heroCountdownValD.textContent = String(days).padStart(2, '0');
      el.heroCountdownValH.textContent = String(hours).padStart(2, '0');
      el.heroCountdownValM.textContent = String(minutes).padStart(2, '0');
      el.heroCountdownValS.textContent = String(seconds).padStart(2, '0');
    }

    update();
    state.countdownInterval = setInterval(update, 1000);
  }

  /**
   * Open Registration Form Modal (Dynamic Google Forms / Zoho Forms style)
   */
  function openRegistrationModal() {
    const ev = state.events.find(e => e.id === state.currentEventId);
    if (!ev) return;

    const tier = state.selectedTier || ev.ticketTiers[0];
    el.regModalEventTitle.textContent = ev.title;
    el.regModalTierName.textContent = `${tier.name} (Complimentary Pass)`;

    // Build Form dynamically from questions list
    buildDynamicForm(ev);

    el.registrationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Build Dynamic Form from Prebuilt Questions
   */
  function buildDynamicForm(ev) {
    const questionCatalog = APP_CONFIG.prebuiltQuestions;
    const eventQuestionIds = ev.questions || [];

    // Group questions by category
    const grouped = {};
    eventQuestionIds.forEach(qId => {
      const qDef = questionCatalog.find(q => q.id === qId) || {
        id: qId,
        label: qId,
        type: 'text',
        required: false,
        category: 'Custom Questions'
      };
      const cat = qDef.category || 'General Information';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(qDef);
    });

    let html = '';
    for (const [catName, questions] of Object.entries(grouped)) {
      html += `
        <div class="form-section-divider">
          <span class="form-section-title">${catName}</span>
        </div>
      `;

      questions.forEach(q => {
        html += renderFormField(q);
      });
    }

    // Add BookMyShow Order Summary Box (Fee = 0)
    html += `
      <div class="order-summary-box">
        <div class="summary-row">
          <span>Pass Type:</span>
          <strong>${state.selectedTier?.name || 'Delegate Pass'}</strong>
        </div>
        <div class="summary-row">
          <span>Ticket Fee:</span>
          <span><s style="color:var(--text-muted); margin-right:4px;">₹${ev.pricing.originalPrice}</s> <span class="val-free">₹0 (100% OFF)</span></span>
        </div>
        <div class="summary-row">
          <span>Convenience / Platform Fee:</span>
          <span class="val-free">₹0.00</span>
        </div>
        <div class="summary-row total">
          <span>Total Payable:</span>
          <span style="color:#10b981;">₹0 (FREE ENTRY)</span>
        </div>
      </div>
    `;

    el.dynamicFormContainer.innerHTML = html;
  }

  /**
   * Render Individual Form Field
   */
  function renderFormField(q) {
    const requiredAttr = q.required ? 'required' : '';
    const reqMark = q.required ? '<span class="req">*</span>' : '';
    const helpMarkup = q.helpText ? `<div class="form-help">${q.helpText}</div>` : '';

    if (q.type === 'radio') {
      const optionsHtml = (q.options || []).map((opt, i) => `
        <label class="pill-option">
          <input type="radio" name="${q.id}" value="${opt}" ${i === 0 && q.required ? 'checked' : ''} ${requiredAttr}>
          <span class="pill-label">${opt}</span>
        </label>
      `).join('');

      return `
        <div class="form-group">
          <label class="form-label">${q.label} ${reqMark}</label>
          <div class="radio-pill-group">${optionsHtml}</div>
          ${helpMarkup}
        </div>
      `;
    }

    if (q.type === 'checkbox') {
      const optionsHtml = (q.options || []).map(opt => `
        <label class="pill-option">
          <input type="checkbox" name="${q.id}" value="${opt}">
          <span class="pill-label">${opt}</span>
        </label>
      `).join('');

      return `
        <div class="form-group">
          <label class="form-label">${q.label} ${reqMark}</label>
          <div class="checkbox-pill-group">${optionsHtml}</div>
          ${helpMarkup}
        </div>
      `;
    }

    if (q.type === 'select') {
      const optionsHtml = (q.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('');
      return `
        <div class="form-group">
          <label class="form-label" for="field_${sanitizeId(q.id)}">${q.label} ${reqMark}</label>
          <select class="form-select" id="field_${sanitizeId(q.id)}" name="${q.id}" ${requiredAttr}>
            <option value="" disabled selected>Select an option...</option>
            ${optionsHtml}
          </select>
          ${helpMarkup}
        </div>
      `;
    }

    if (q.type === 'textarea') {
      return `
        <div class="form-group">
          <label class="form-label" for="field_${sanitizeId(q.id)}">${q.label} ${reqMark}</label>
          <textarea class="form-textarea" id="field_${sanitizeId(q.id)}" name="${q.id}" placeholder="${q.placeholder || ''}" ${requiredAttr}></textarea>
          ${helpMarkup}
        </div>
      `;
    }

    // Default: text, email, tel, url, number
    return `
      <div class="form-group">
        <label class="form-label" for="field_${sanitizeId(q.id)}">${q.label} ${reqMark}</label>
        <input class="form-input" type="${q.type}" id="field_${sanitizeId(q.id)}" name="${q.id}" placeholder="${q.placeholder || ''}" ${requiredAttr}>
        ${helpMarkup}
      </div>
    `;
  }

  function sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Handle Registration Submission
   */
  async function handleRegistrationSubmit(e) {
    e.preventDefault();
    const ev = state.events.find(ev => ev.id === state.currentEventId);
    if (!ev) return;

    // Set UI loading state
    el.btnSubmitRegistration.disabled = true;
    el.submitBtnText.textContent = 'Securing Your Free Pass...';
    el.submitSpinner.style.display = 'inline-block';

    // Collect Form Data
    const formData = new FormData(el.registrationForm);
    const payload = {};
    const bookingId = `IEDC-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    payload['Booking ID'] = bookingId;
    payload['Event Title'] = ev.title;
    payload['Event Date'] = ev.dateStr;
    payload['Ticket Category'] = state.selectedTier?.name || 'Complimentary Delegate Pass';
    payload['Registration Fee'] = '₹0 (Free)';
    payload['Timestamp'] = new Date().toLocaleString();

    for (const [key, value] of formData.entries()) {
      if (payload[key]) {
        // multiple checkbox values
        if (Array.isArray(payload[key])) {
          payload[key].push(value);
        } else {
          payload[key] = [payload[key], value];
        }
      } else {
        payload[key] = value;
      }
    }

    // 1. Save to Local Storage Cache
    saveRegistrationLocally(payload);

    // 2. Transmit to Google Apps Script Webhook (if provided)
    const webhookUrl = state.webhookUrl;
    if (webhookUrl && webhookUrl.startsWith('http')) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors', // Essential for Google Apps Script Web App without CORS errors
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('Google Sheet submission sync error (saved locally):', err);
      }
    }

    // Reset Submit Button
    el.btnSubmitRegistration.disabled = false;
    el.submitBtnText.textContent = 'Confirm Registration (₹0 Free)';
    el.submitSpinner.style.display = 'none';

    // Close form modal & open Ticket Pass
    closeModal(el.registrationModal);
    openTicketModal(payload, ev);
  }

  /**
   * Save Registration Locally in Browser
   */
  function saveRegistrationLocally(regData) {
    try {
      const existing = JSON.parse(localStorage.getItem('iedc_registrations') || '[]');
      existing.unshift(regData);
      localStorage.setItem('iedc_registrations', JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save registration in localStorage:', e);
    }
  }

  /**
   * Open BookMyShow E-Ticket Modal
   */
  function openTicketModal(regData, ev) {
    el.ticketEventTitle.textContent = ev.title;
    el.ticketBookingId.textContent = regData['Booking ID'];
    el.ticketAttendeeName.textContent = regData['Full Name'] || 'Delegate';
    el.ticketDate.textContent = ev.dateStr;
    el.ticketTime.textContent = ev.timeStr;
    el.ticketVenue.textContent = ev.venue;
    el.ticketTierName.textContent = regData['Ticket Category'] || 'Free Pass';

    // Generate Scannable QR Code
    el.ticketQrCode.innerHTML = '';
    const qrData = `IEDC PASS | ID: ${regData['Booking ID']} | Name: ${regData['Full Name']} | Event: ${ev.title} | Status: VERIFIED FREE PASS`;
    try {
      new QRCode(el.ticketQrCode, {
        text: qrData,
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (err) {
      console.warn('QR Code generation notice:', err);
    }

    // Configure Calendar Link
    setupCalendarLink(ev);

    // Configure WhatsApp Share Link
    const waText = encodeURIComponent(`🎉 Hey! I just registered for "${ev.title}" via IEDC TicketBox. Registration is completely FREE! Check it out here: ${window.location.href}`);
    el.btnShareWhatsapp.href = `https://api.whatsapp.com/send?text=${waText}`;

    // Open Modal
    el.ticketModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Confetti celebration
    triggerConfetti();
  }

  /**
   * Setup Add to Google Calendar link
   */
  function setupCalendarLink(ev) {
    const startDate = new Date(ev.isoDate);
    const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // +4 hours approx

    const formatCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${formatCalDate(startDate)}/${formatCalDate(endDate)}&details=${encodeURIComponent(ev.overview)}&location=${encodeURIComponent(ev.venue)}`;
    el.btnAddToCalendar.href = gCalUrl;
  }

  /**
   * Lightweight celebratory confetti animation
   */
  function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f84464', '#00f2fe', '#fbbf24', '#10b981', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vr;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(p.opacity, 0);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 140) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }
    render();
  }

  /**
   * Print / Download E-Ticket
   */
  function downloadTicketPass() {
    window.print();
  }

  /**
   * Organizer / Google Sheets Admin Modal
   */
  function openAdminModal() {
    renderRegistrationsTable();
    el.adminModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Save Webhook URL
   */
  function saveWebhookUrl() {
    const url = el.inputWebhookUrl.value.trim();
    state.webhookUrl = url;
    localStorage.setItem('iedc_sheet_webhook_url', url);
    showToast('Google Apps Script URL saved successfully!');
    testWebhookConnection(true);
  }

  /**
   * Test Webhook Connection
   */
  async function testWebhookConnection(silent = false) {
    const url = state.webhookUrl;
    if (!url) {
      el.webhookStatusNotice.innerHTML = `
        <span style="color:#ef4444;">⚠️ No Google Apps Script URL entered. Follow the 2-minute setup below to connect your sheet.</span>
      `;
      return;
    }

    el.webhookStatusNotice.innerHTML = `<span style="color:#fbbf24;">Testing connection...</span>`;

    try {
      // Send a ping
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.status === 'online') {
        el.webhookStatusNotice.innerHTML = `
          <span style="color:#10b981; font-weight:700;">✅ Connected! Google Apps Script is online & ready to append registrations to Google Sheets.</span>
        `;
        if (!silent) showToast('Webhook connection verified!');
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      // Due to Apps Script redirects or no-cors, check if format is standard
      if (url.includes('script.google.com/macros/s/')) {
        el.webhookStatusNotice.innerHTML = `
          <span style="color:#34d399; font-weight:600;">✔️ Webhook endpoint configured. Submissions will post directly to your spreadsheet!</span>
        `;
      } else {
        el.webhookStatusNotice.innerHTML = `
          <span style="color:#ef4444;">❌ URL does not match a standard Google Apps Script deployment. It should start with https://script.google.com/macros/s/</span>
        `;
      }
    }
  }

  /**
   * Render Registrations in Local Table
   */
  function renderRegistrationsTable() {
    const list = JSON.parse(localStorage.getItem('iedc_registrations') || '[]');
    el.registrationsCountBadge.textContent = `${list.length} Registrations`;

    if (list.length === 0) {
      el.registrationsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
            No registrations received yet. Test by registering for an event!
          </td>
        </tr>
      `;
      return;
    }

    el.registrationsTableBody.innerHTML = list.map(reg => `
      <tr>
        <td style="font-family:monospace; color:var(--accent-cyan); font-weight:700;">${reg['Booking ID'] || '-'}</td>
        <td style="font-weight:600;">${reg['Full Name'] || '-'}</td>
        <td>${reg['Email Address'] || '-'}</td>
        <td>${reg['Phone / WhatsApp'] || '-'}</td>
        <td>${(reg['Event Title'] || '').split(':')[0]}</td>
        <td style="color:var(--text-muted); font-size:0.75rem;">${reg['Timestamp'] || '-'}</td>
      </tr>
    `).join('');
  }

  /**
   * Export Registrations to CSV
   */
  function exportRegistrationsToCsv() {
    const list = JSON.parse(localStorage.getItem('iedc_registrations') || '[]');
    if (list.length === 0) {
      alert('No registrations available to export.');
      return;
    }

    // Determine all unique column headers
    const headersSet = new Set();
    list.forEach(item => {
      Object.keys(item).forEach(k => headersSet.add(k));
    });
    const headers = Array.from(headersSet);

    // Build CSV content
    const csvRows = [];
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

    list.forEach(item => {
      const row = headers.map(h => {
        let val = item[h] !== undefined ? item[h] : '';
        if (Array.isArray(val)) val = val.join('; ');
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });

    const csvBlob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `IEDC_Event_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
    showToast('Downloaded registrations CSV!');
  }

  /**
   * Clear Local Cache
   */
  function clearLocalRegistrations() {
    if (confirm('Are you sure you want to clear locally cached registrations? Google Sheets data will not be affected.')) {
      localStorage.removeItem('iedc_registrations');
      renderRegistrationsTable();
      showToast('Local cache cleared');
    }
  }

  /**
   * Show Toast Notification
   */
  function showToast(msg) {
    el.toastText.textContent = msg;
    el.toastNotice.classList.add('show');
    setTimeout(() => {
      el.toastNotice.classList.remove('show');
    }, 3200);
  }

  /**
   * Modal Close Helper
   */
  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Setup All Event Listeners
   */
  function setupEventListeners() {
    // Search Input
    if (el.globalSearchInput) {
      el.globalSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        filterEvents();
      });
    }

    // Book Now triggers
    el.heroBookBtn.addEventListener('click', openRegistrationModal);
    el.sidebarProceedBtn.addEventListener('click', openRegistrationModal);
    el.mobileProceedBtn.addEventListener('click', openRegistrationModal);

    // Modal close triggers
    el.closeRegistrationModalBtn.addEventListener('click', () => closeModal(el.registrationModal));
    el.closeTicketModalBtn.addEventListener('click', () => closeModal(el.ticketModal));
    el.btnBookAnother.addEventListener('click', () => closeModal(el.ticketModal));

    // Admin Modal triggers
    el.openAdminModalBtn.addEventListener('click', openAdminModal);
    el.closeAdminModalBtn.addEventListener('click', () => closeModal(el.adminModal));
    el.btnSaveWebhook.addEventListener('click', saveWebhookUrl);
    el.btnTestWebhook.addEventListener('click', () => testWebhookConnection(false));
    el.btnExportCsv.addEventListener('click', exportRegistrationsToCsv);
    el.btnClearLocalData.addEventListener('click', clearLocalRegistrations);

    // Copy Apps Script code
    if (el.btnCopyScriptCode) {
      el.btnCopyScriptCode.addEventListener('click', () => {
        const code = document.getElementById('scriptCodeBlock').innerText;
        navigator.clipboard.writeText(code).then(() => {
          showToast('Google Apps Script code copied to clipboard!');
        });
      });
    }

    // Form Submit
    el.registrationForm.addEventListener('submit', handleRegistrationSubmit);

    // Download Ticket
    el.btnDownloadTicket.addEventListener('click', downloadTicketPass);

    // Close on outside backdrop click
    [el.registrationModal, el.ticketModal, el.adminModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(el.registrationModal);
        closeModal(el.ticketModal);
        closeModal(el.adminModal);
      }
    });
  }

  // Self execute
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
