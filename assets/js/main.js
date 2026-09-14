/* ==========================================================================
   ADSVIO - main.js
   Vanilla. No dependencies. Every behaviour degrades to a working page
   without it, and every animation checks prefers-reduced-motion first.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduced() { return reduceMotion.matches; }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }


  /* ------------------------------------------------------------------------
     Analytics. GA4 may or may not be present; never let its absence throw.
     Events: book_call_click, whatsapp_click, form_submit,
             checklist_download, offer_configured
     ---------------------------------------------------------------------- */

  function track(name, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
      if (typeof window.fbq === "function") {
        if (name === "book_call_click") window.fbq("track", "Contact");
        if (name === "form_submit" || name === "checklist_download") {
          window.fbq("track", "Lead");
        }
      }
    } catch (e) { /* analytics must never break the page */ }
  }
  window.adsvioTrack = track;

  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-event]") : null;
    if (el) track(el.getAttribute("data-event"), { location: el.getAttribute("data-event-where") || "" });
  });


  /* ------------------------------------------------------------------------
     Carry UTM parameters through to the booking flow so ad attribution
     survives the handoff. Rewrites booking links in place, once, on load.

     Booking now goes through /start rather than straight to TidyCal, so this
     has to stamp the qualifier links too - otherwise the parameters die at
     the extra hop and every paid booking reports as direct. qualifier.js
     reads them back off its own URL and forwards them to TidyCal.
     ---------------------------------------------------------------------- */

  (function preserveUtm() {
    var current = new URLSearchParams(window.location.search);
    var keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
    var carried = new URLSearchParams();
    keys.forEach(function (k) { if (current.get(k)) carried.set(k, current.get(k)); });
    if (!carried.toString()) return;

    $$('a[href*="tidycal.com"], a[href$="/start"], a[href*="/start?"]').forEach(function (a) {
      try {
        var url = new URL(a.href);
        carried.forEach(function (v, k) { url.searchParams.set(k, v); });
        a.href = url.toString();
      } catch (e) { /* leave the link alone if it will not parse */ }
    });
  })();


  /* ------------------------------------------------------------------------
     Header - the hairline appears only after 40px of scroll
     ---------------------------------------------------------------------- */

  var header = $(".header");
  var stickybar = $(".stickybar");
  var footerCta = $("#final-cta");
  var ctaInView = false;
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;

    if (header) header.classList.toggle("is-scrolled", y > 40);

    if (stickybar) {
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      var depth = scrollable > 0 ? y / scrollable : 0;
      // After 25% depth - but never on top of the footer CTA.
      stickybar.classList.toggle("is-visible", depth > 0.25 && !ctaInView);
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (footerCta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      ctaInView = entries[0].isIntersecting;
      onScroll();
    }, { rootMargin: "0px 0px -20% 0px" }).observe(footerCta);
  }


  /* ------------------------------------------------------------------------
     Focus trap - shared by the mobile menu and the exit-intent modal
     ---------------------------------------------------------------------- */

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, e) {
    var items = $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  window.adsvioTrapFocus = trapFocus;


  /* ------------------------------------------------------------------------
     Mobile menu - full-screen overlay, actions pinned to the bottom
     ---------------------------------------------------------------------- */

  (function mobileMenu() {
    var toggle = $(".menu-toggle");
    var menu = $("#site-menu");
    if (!toggle || !menu) return;

    var closeBtn = $(".menu__close", menu);
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      menu.removeAttribute("hidden");
      document.body.classList.add("is-locked");
      toggle.setAttribute("aria-expanded", "true");

      /* Two forced reflows rather than requestAnimationFrame. The first
         commits the closed state so the fade actually has somewhere to
         animate from; the second commits visibility:visible so .focus() can
         land - a visibility:hidden element cannot take focus. rAF would do
         the same job but never fires in a backgrounded tab, which would
         leave focus stranded on <body>. */
      void menu.offsetHeight;
      menu.classList.add("is-open");
      void menu.offsetHeight;
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      menu.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      toggle.setAttribute("aria-expanded", "false");
      window.setTimeout(function () {
        if (!menu.classList.contains("is-open")) menu.setAttribute("hidden", "");
      }, 240);

      // Focus goes back where it came from. If that is gone or was never a
      // real control, fall back to the toggle rather than dropping to <body>.
      var back = (lastFocus && document.contains(lastFocus) &&
                  lastFocus !== document.body) ? lastFocus : toggle;
      back.focus();
    }

    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    $$(".menu__link", menu).forEach(function (a) { a.addEventListener("click", close); });

    document.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") trapFocus(menu, e);
    });
  })();


  /* ------------------------------------------------------------------------
     THE LANGUAGE PROOF - the signature element.

     The English string is already in the DOM and inside the <h1>, so crawlers
     and no-JS visitors read a complete headline. This only takes over the
     cycling. Clicking a pill holds that language and stops the rotation for
     good - a deliberate choice made by the visitor outranks the loop.
     ---------------------------------------------------------------------- */

  (function languageProof() {
    var wrap = $("[data-langproof]");
    if (!wrap) return;

    var textEl = $("[data-lp-text]", wrap);
    var pills = $$("[data-lp-lang]");
    if (!textEl || !pills.length) return;

    var PHRASES = [
      { code: "en", lang: "en",    text: "Let the world see it." },
      { code: "fr", lang: "fr",    text: "Que le monde le voie." },
      { code: "es", lang: "es",    text: "Que el mundo lo vea." },
      { code: "kr", lang: "ht",    text: "Kite mond lan we l." }
    ];
    // Kreyol carries a grave accent that must survive minification untouched.
    PHRASES[3].text = "Kite mond lan wè l.";

    var HOLD = 2600;   // brief: auto-cycle every 2.6s
    var WIPE = 460;    // matches --dur-lang

    // The cycle starts in the language of the page it is on, so the French
    // homepage does not open on an English sentence. `data-langproof="fr"`
    // sets it; an empty attribute keeps the English default.
    var index = 0;
    var startCode = (wrap.getAttribute("data-langproof") || "").toLowerCase();
    for (var s = 0; s < PHRASES.length; s++) {
      if (PHRASES[s].code === startCode) { index = s; break; }
    }
    var timer = null;
    var held = false;

    function paintPills() {
      pills.forEach(function (p, i) {
        p.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
    }

    function show(next, animate) {
      index = next;
      paintPills();

      if (!animate || prefersReduced()) {
        textEl.textContent = PHRASES[index].text;
        textEl.setAttribute("lang", PHRASES[index].lang);
        return;
      }

      textEl.classList.add("is-out");
      window.setTimeout(function () {
        textEl.textContent = PHRASES[index].text;
        textEl.setAttribute("lang", PHRASES[index].lang);
        textEl.classList.remove("is-out");
        textEl.classList.add("is-in");
        void textEl.offsetHeight;              // commit the below-frame position
        textEl.classList.remove("is-in");      // then let it rise into place
      }, WIPE);
    }

    function start() {
      if (held || prefersReduced() || timer) return;
      timer = window.setInterval(function () {
        show((index + 1) % PHRASES.length, true);
      }, HOLD);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    pills.forEach(function (pill, i) {
      pill.addEventListener("click", function () {
        held = true;
        stop();
        if (i !== index) show(i, true);
        else paintPills();
      });
    });

    // Do not animate a tab nobody is looking at.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    reduceMotion.addEventListener
      ? reduceMotion.addEventListener("change", function () { prefersReduced() ? stop() : start(); })
      : null;

    paintPills();
    start();
  })();


  /* ------------------------------------------------------------------------
     Visibility Scorecard - grow the five bars on first scroll into view.

     The target widths live in the markup as inline styles, so a visitor with
     JavaScript off, or with reduced motion on, sees the finished chart rather
     than five empty tracks. This only ever animates FROM zero back TO what the
     HTML already said. The total number reuses the existing counter above via
     data-count-to, which is already reduced-motion aware.
     ---------------------------------------------------------------------- */

  (function scorecard() {
    var card = $("[data-scorecard]");
    if (!card || prefersReduced() || !("IntersectionObserver" in window)) return;

    var fills = $$(".scard__fill", card);
    if (!fills.length) return;

    var targets = fills.map(function (f) { return f.style.width; });
    fills.forEach(function (f) { f.style.width = "0%"; });

    var done = false;
    function grow() {
      if (done) return;
      done = true;
      if (io) io.disconnect();
      fills.forEach(function (f, i) {
        window.setTimeout(function () {
          f.style.transition = "width 700ms cubic-bezier(.22,.61,.36,1)";
          f.style.width = targets[i];
        }, i * 80);                        // brief: 80ms stagger
      });
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) grow();
    }, { threshold: 0.4 });

    io.observe(card);

    /* Zeroing the bars up front means a browser that supports
       IntersectionObserver but never reports an intersection - an offscreen or
       backgrounded render, some embedded webviews, printing - would be left
       looking at five empty tracks forever. The chart must never end up less
       complete than the markup already was, so it grows regardless after a
       few seconds. */
    window.setTimeout(grow, 3000);
  })();


  /* ------------------------------------------------------------------------
     Ticker - clone the list once so the loop closes seamlessly at -50%
     ---------------------------------------------------------------------- */

  (function ticker() {
    var track = $(".ticker__track");
    if (!track) return;
    var group = $(".ticker__group", track);
    if (!group) return;
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  })();


  /* ------------------------------------------------------------------------
     Scroll reveal - 16px rise + fade, 60ms stagger within a group, once.
     Never applied to the hero.
     ---------------------------------------------------------------------- */

  (function reveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window) || prefersReduced()) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    // Stagger is per group, so a row of three cards ripples rather than pops.
    $$("[data-reveal-group]").forEach(function (group) {
      $$(".reveal", group).forEach(function (el, i) {
        el.style.setProperty("--reveal-delay", (i * 60) + "ms");
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);          // fires once
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });

    items.forEach(function (el) { io.observe(el); });
  })();


  /* ------------------------------------------------------------------------
     Stat counters - count up once on entry. The rendered figure is already
     correct in the HTML, so this only replaces a value that is already there.
     ---------------------------------------------------------------------- */

  (function counters() {
    var stats = $$("[data-count-to]");
    if (!stats.length || !("IntersectionObserver" in window) || prefersReduced()) return;

    // French groups thousands with a space, English with a comma. Reading the
    // document language keeps 194 585 from rendering as 194,585 on /fr/.
    var LOCALE = (document.documentElement.lang || "en").indexOf("fr") === 0
      ? "fr-CA" : "en-US";

    function format(n, el) {
      var out = Math.round(n).toLocaleString(LOCALE);
      return (el.getAttribute("data-count-prefix") || "") + out +
             (el.getAttribute("data-count-suffix") || "");
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);

        var target = parseFloat(el.getAttribute("data-count-to"));
        if (isNaN(target)) return;
        var duration = 1100;
        var startedAt = null;

        function step(now) {
          if (startedAt === null) startedAt = now;
          var t = Math.min((now - startedAt) / duration, 1);
          var eased = 1 - Math.pow(1 - t, 3);        // ease-out cubic
          el.textContent = format(target * eased, el);
          if (t < 1) window.requestAnimationFrame(step);
          else el.textContent = format(target, el);
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    stats.forEach(function (el) { io.observe(el); });
  })();


  /* ------------------------------------------------------------------------
     Copyright year - generated so it never goes stale
     ---------------------------------------------------------------------- */

  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
