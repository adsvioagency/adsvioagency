/* ==========================================================================
   ADSVIO — offer.js
   The offer flow. Vanilla, no dependencies.

   HOW THIS PAGE IS BUILT, AND WHY
   Both packages and every deliverable ship in the HTML, fully expanded.
   Nothing here injects offer content — this script only *collapses* what is
   already on the page once a visitor tells it what they are. So:

     - Google indexes both packages, always.
     - A visitor with JavaScript off sees the complete offer, not a dead page.
     - The flow is an enhancement on working markup, never a prerequisite.

   If you change one thing in this file, do not make it "render the packages".

   NO REGION, NO PRICES
   This script used to switch every figure on the page between a US and a
   Caribbean price, then between two public floors. Both are gone. The page
   carries no package price at all now — one anchor sentence under the H1
   states the range, and the real number is agreed after the audit using the
   internal pricing calculator. Do not reintroduce a region selector or a
   per-package price: a visitor who discovers the site quotes them double is a
   trust problem no conversion rate repays, and a headline price turns a
   diagnosis back into a menu.
   ========================================================================== */

(function () {
  "use strict";

  /* Package names are NOT translated — they are product names, and a caller
     who saw "Authority Launch" on the page has to be able to say it out loud
     to Pierre and be understood. */
  var LANG = (document.documentElement.lang || "en")
    .toLowerCase().indexOf("fr") === 0 ? "fr" : "en";

  var T = {
    en: { addonOne: " option", addonMany: " options", selected: " selected" },
    fr: { addonOne: " option", addonMany: " options", selected: " sélectionnée" }
  }[LANG];

  var PACKAGE_NAME = {
    authority:  "The Authority Launch",
    storefront: "The Storefront Launch"
  };

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  var root = $("[data-offer]");
  if (!root) return;


  /* ---- State ------------------------------------------------------------ */

  var state = { type: null, addons: [] };


  /* ---- Analytics -------------------------------------------------------- */

  /* Event name unchanged so it stays comparable with everything logged before
     the region came out. It simply no longer carries totals, because the page
     no longer claims to know them. */
  var configuredSent = false;
  var configureTimer = null;
  function reportConfigured() {
    if (!state.type) return;
    window.clearTimeout(configureTimer);
    configureTimer = window.setTimeout(function () {
      if (!window.adsvioTrack) return;
      window.adsvioTrack("offer_configured", {
        package: state.type,
        addons: state.addons.length,
        first_time: !configuredSent
      });
      configuredSent = true;
    }, 600);
  }


  /* ---- Painting --------------------------------------------------------- */

  function paintPackages() {
    $$("[data-pkg]").forEach(function (pkg) {
      // Visibility is the only thing the flow controls.
      if (state.type && pkg.getAttribute("data-pkg") !== state.type) {
        pkg.setAttribute("hidden", "");
      } else {
        pkg.removeAttribute("hidden");
      }
    });
  }

  function paintSummary() {
    var bar = $("[data-summary]");
    if (!bar) return;

    var ready = !!state.type;

    /* The bar ships with the `hidden` attribute so it cannot flash before this
       script runs. Dropping the attribute is what actually lets it render —
       the `is-visible` class only drives the slide-up. Toggling the class
       alone leaves it display:none under the global [hidden] rule. */
    if (ready) bar.removeAttribute("hidden");
    else bar.setAttribute("hidden", "");

    bar.classList.toggle("is-visible", ready);
    document.body.classList.toggle("has-summary", ready);

    if (!ready) return;

    var n = state.addons.length;
    $("[data-summary-pkg]", bar).textContent = PACKAGE_NAME[state.type];
    $("[data-summary-lines]", bar).textContent =
      n ? n + (n === 1 ? T.addonOne : T.addonMany) + T.selected : "";
  }

  function paint() {
    paintPackages();
    paintSummary();
  }


  /* ---- Step reveal ------------------------------------------------------ */

  function revealSteps() {
    $$("[data-needs=type]").forEach(function (el) {
      if (state.type) el.removeAttribute("hidden"); else el.setAttribute("hidden", "");
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function scrollToStep(sel) {
    var el = $(sel);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - 84;
    window.scrollTo({
      top: top,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
  }


  /* ---- Wiring ----------------------------------------------------------- */

  $$("[data-type-input]").forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      var first = !state.type;
      state.type = input.value;
      revealSteps();
      paint();
      reportConfigured();
      if (first) scrollToStep("#step-2");
    });
  });

  $$("[data-addon]").forEach(function (input) {
    input.addEventListener("change", function () {
      state.addons = $$("[data-addon]").filter(function (i) { return i.checked; });
      paintSummary();
      reportConfigured();
    });
  });


  /* ---- Init ------------------------------------------------------------- */

  // Collapse only now, in script. The markup shipped fully expanded.
  root.classList.add("is-live");

  // Respect a browser that restored checked states on a back-navigation.
  var preType = $("[data-type-input]:checked");
  if (preType) state.type = preType.value;
  state.addons = $$("[data-addon]").filter(function (i) { return i.checked; });

  revealSteps();
  paint();

})();
