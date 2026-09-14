/* ==========================================================================
   ADSVIO - consent.js
   Cookie consent, and the analytics loader that depends on it.

   THE RULE THIS FILE ENFORCES
   Nothing that tracks a visitor loads until they have actively said yes.
   Not on page load, not on scroll, not "legitimate interest". Declining and
   ignoring the banner produce exactly the same outcome: no analytics, no
   pixel, no cookies beyond the one recording the choice itself.

   That is what GDPR requires for EU visitors and what Quebec's Law 25
   requires in Canada, and both matter here - the audience is US, Canadian,
   Dominican and European diaspora.

   WHAT PIERRE HAS TO DO
   Put the two IDs in CONFIG below. Until then this file runs, records
   consent correctly, and loads nothing - which is the safe failure mode.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = {
    /* Fill these in and analytics starts working for visitors who accept.
       Leave them empty and the banner still behaves correctly - it simply has
       nothing to load. See PLACEHOLDERS.md. */
    GA4_ID: "",        // e.g. "G-XXXXXXXXXX"
    META_PIXEL_ID: ""  // e.g. "123456789012345"
  };

  var KEY = "adsvio_consent";
  var VERSION = 1;          // bump to re-ask everyone after a policy change
  var MAX_AGE_DAYS = 365;

  function store() {
    try {
      var t = "__t__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return window.localStorage;
    } catch (e) { return null; }
  }
  var ls = store();

  function read() {
    if (!ls) return null;
    try {
      var raw = JSON.parse(ls.getItem(KEY) || "null");
      if (!raw || raw.v !== VERSION) return null;
      if (Date.now() - raw.t > MAX_AGE_DAYS * 864e5) return null;
      return raw.a === true ? "accepted" : "declined";
    } catch (e) { return null; }
  }

  function write(accepted) {
    if (!ls) return;
    try {
      ls.setItem(KEY, JSON.stringify({ v: VERSION, a: !!accepted, t: Date.now() }));
    } catch (e) { /* private mode - the choice holds for this page only */ }
  }


  /* ------------------------------------------------------------------------
     Loading the tags. Only ever called after an explicit accept.
     ---------------------------------------------------------------------- */

  var loaded = false;

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;

    if (CONFIG.GA4_ID) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      /* No automatic page_view here - main.js sends the conversion events, and
         GA4's own enhanced measurement covers the rest. */
      window.gtag("config", CONFIG.GA4_ID, { anonymize_ip: true });

      var g = document.createElement("script");
      g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.GA4_ID);
      document.head.appendChild(g);
    }

    if (CONFIG.META_PIXEL_ID) {
      /* Meta's standard snippet, rewritten so it is readable and so it only
         ever runs from inside this function. */
      var n = window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      var f = document.createElement("script");
      f.async = true;
      f.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(f);

      window.fbq("init", CONFIG.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }

    // Let anything queued before consent fire now.
    document.dispatchEvent(new CustomEvent("adsvio:consent-granted"));
  }


  /* ------------------------------------------------------------------------
     The banner
     ---------------------------------------------------------------------- */

  var banner = null;

  /* Quebec's Law 25 and the GDPR both require that consent be requested in
     terms the person actually understands. An English-only banner on a page
     written for Montreal is a compliance problem, not a rough edge, so the
     copy follows the language of the document it appears on. */
  var STRINGS = {
    en: {
      label:   "Cookie choices",
      title:   "We would like to measure what is working.",
      body:    "Analytics only. Which pages get read and which buttons get used. " +
               "No advertising cookies unless you accept, nothing sold to anyone, ever. " +
               "Read the ",
      privacy: "privacy policy",
      href:    "/en/privacy",
      decline: "Decline",
      accept:  "Accept"
    },
    fr: {
      label:   "Choix de témoins",
      title:   "Nous aimerions mesurer ce qui fonctionne.",
      body:    "Mesure d’audience seulement : quelles pages sont lues et quels boutons " +
               "sont utilisés. Aucun témoin publicitaire sans votre accord, et rien n’est " +
               "jamais vendu à qui que ce soit. Consultez la ",
      privacy: "politique de confidentialité",
      href:    "/en/privacy",
      decline: "Refuser",
      accept:  "Accepter"
    }
  };

  function strings() {
    var lang = (document.documentElement.lang || "en").toLowerCase();
    return lang.indexOf("fr") === 0 ? STRINGS.fr : STRINGS.en;
  }

  function build() {
    if (banner) return banner;

    var t = strings();

    banner = document.createElement("div");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", t.label);
    banner.innerHTML =
      '<div class="container consent__inner">' +
        '<div class="consent__text">' +
          '<strong>' + t.title + '</strong>' +
          '<p>' + t.body +
          '<a href="' + t.href + '">' + t.privacy + '</a>.</p>' +
        '</div>' +
        '<div class="consent__actions">' +
          '<button class="btn btn--secondary btn--sm" type="button" data-consent="no">' +
            t.decline + '</button>' +
          '<button class="btn btn--primary btn--sm" type="button" data-consent="yes">' +
            t.accept + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-consent]");
      if (!b) return;
      var yes = b.getAttribute("data-consent") === "yes";
      write(yes);
      hide();
      if (yes) loadAnalytics();
    });

    return banner;
  }

  function show() {
    build();
    // one frame so the slide-up has a state to animate from
    void banner.offsetHeight;
    banner.classList.add("is-open");
    document.body.classList.add("has-consent-bar");
  }

  function hide() {
    if (!banner) return;
    banner.classList.remove("is-open");
    document.body.classList.remove("has-consent-bar");
    window.setTimeout(function () {
      if (banner && !banner.classList.contains("is-open")) banner.remove();
      banner = null;
    }, 300);
  }


  /* ------------------------------------------------------------------------
     Reopening the choice. The footer link calls this, which is the thing
     regulators actually check for - consent has to be as easy to withdraw
     as it was to give.
     ---------------------------------------------------------------------- */

  window.adsvioConsent = {
    open: function () { show(); },
    state: read,
    revoke: function () {
      write(false);
      loaded = false;
      show();
    }
  };

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-cookie-settings]");
    if (!t) return;
    e.preventDefault();
    show();
  });


  /* ---- Boot ------------------------------------------------------------- */

  var state = read();
  if (state === "accepted") {
    loadAnalytics();
  } else if (state === null) {
    // No decision on record. Ask, and load nothing in the meantime.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", show);
    } else {
      show();
    }
  }
  // state === "declined": do nothing at all, and do not nag.

})();
