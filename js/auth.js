/**
 * ==========================================================================
 *  IEDC EVENT PORTAL - SECURE AUTHENTICATION MODULE
 * ==========================================================================
 *  Zero plaintext credentials in repository code!
 *  Credentials are read from environment variables (.env / js/env.js).
 *  When deployed on GitHub, verification falls back to irreversible SHA-256 hashing.
 * ==========================================================================
 */

const AuthService = (function () {
  'use strict';

  // Irreversible SHA-256 hash of authorized credential (zero plaintext in git)
  const SECURE_HASH = "87e638c37dc217613c790818042536157af5ac428ee6007e8d0c56e3dde9b54c";
  const SESSION_KEY = "iedc_admin_auth_session";

  /**
   * Helper to compute SHA-256 hash in browser
   */
  async function computeSha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Validate credentials
   */
  async function login(username, password) {
    if (!username || !password) return false;

    // 1. Check from environment configuration if available (from .env / js/env.js)
    if (window.ENV && window.ENV.ADMIN_USERNAME && window.ENV.ADMIN_PASSWORD) {
      if (username === window.ENV.ADMIN_USERNAME && password === window.ENV.ADMIN_PASSWORD) {
        setSession();
        return true;
      }
    }

    // 2. Fallback: Cryptographic SHA-256 Hash verification
    // (Ensures zero credentials leaked in public GitHub repositories)
    const userHash = await computeSha256(username.trim());
    const passHash = await computeSha256(password.trim());

    if (userHash === SECURE_HASH && passHash === SECURE_HASH) {
      setSession();
      return true;
    }

    return false;
  }

  function setSession() {
    const token = 'token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, token);
  }

  function isAuthenticated() {
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  return {
    login,
    isAuthenticated,
    logout
  };
})();

window.AuthService = AuthService;
