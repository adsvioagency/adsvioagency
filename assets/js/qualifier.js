/* ==========================================================================
   ADSVIO - qualifier.js
   The four-screen step between a CTA and the calendar.

   WHY IT EXISTS
   Every CTA used to hand straight to TidyCal. With the exit modal switched
   off there is no email capture anywhere, so anyone who clicks and does not
   finish a booking is lost completely. The email is taken BEFORE the handoff,
   so an abandoned booking still leaves a lead.

   THE RULE THIS FILE OBEYS
   Any step between a CTA and a calendar costs bookings. Everything here
   exists to keep that cost small:
     - tap to answer, no typing until the last screen
     - the escape hatch is on every screen and goes straight to TidyCal
     - a failed POST never blocks the redirect
     - name and email are passed to TidyCal so nobody retypes them

   NO-JS
   The markup ships as one plain form with all four fieldsets visible and a
   single submit. This script is what turns it into a wizard. Never make the
   form depend on it.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.querySelector("[data-qualifier]");
  if (!root) return;

  var TIDYCAL = "https://tidycal.com/adsvioagency/30-minute-meeting";
  var STORE_KEY = "adsvio_qualifier";

  /* Read the ad parameters NOW. The init block below calls replaceState with
     location.pathname to keep the back button on this page, and that drops the
     query string - so by submit time there is nothing left to read. */
  var CARRIED = (function () {
    var out = "";
    try {
      var here = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
       "gclid", "fbclid"].forEach(function (k) {
        if (here.get(k)) out += "&" + k + "=" + encodeURIComponent(here.get(k));
      });
    } catch (e) { /* a malformed query string must never cost a booking */ }
    return out;
  })();

  var steps = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
  if (!steps.length) return;

  var bar = document.querySelector("[data-progress]");
  var segs = bar ? Array.prototype.slice.call(bar.querySelectorAll("span")) : [];
  var current = 0;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function track(name, params) {
    if (window.adsvioTrack) window.adsvioTrack(name, params || {});
  }

  /* ---- Persistence ------------------------------------------------------- */

  function save() {
    try {
      var data = {};
      $$("input", root).forEach(function (i) {
        if (i.type === "hidden" || i.name === "company-website") return;
        if ((i.type === "radio" || i.type === "checkbox") && !i.checked) return;
        if (i.type === "checkbox") {
          data[i.name] = (data[i.name] || []).concat(i.value);
        } else {
          data[i.name] = i.value;
        }
      });
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* private mode - the flow still works, it just forgets */ }
  }

  /* ---- Screens ----------------------------------------------------------- */

  function show(index, push) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach(function (s, i) {
      if (i === current) s.removeAttribute("hidden");
      else s.setAttribute("hidden", "");
    });
    segs.forEach(function (s, i) { s.classList.toggle("is-done", i <= current); });
    if (bar) {
      bar.setAttribute("aria-valuenow", String(current + 1));
      bar.setAttribute("aria-valuetext", "Step " + (current + 1) + " of " + steps.length);
    }

    // Move focus to the new question so the screen change is announced.
    var legend = $("legend", steps[current]);
    if (legend) {
      legend.setAttribute("tabindex", "-1");
      legend.focus({ preventScroll: true });
    }

    /* Back must walk the screens, not leave the page. */
    if (push) {
      try { history.pushState({ step: current }, "", "#q" + (current + 1)); } catch (e) {}
    }
    if (current > 0) track("qualifier_step_" + (current + 1));
  }

  function next() { if (current < steps.length - 1) show(current + 1, true); }

  window.addEventListener("popstate", function (e) {
    var s = e.state && typeof e.state.step === "number" ? e.state.step : 0;
    show(s, false);
  });

  /* ---- Wiring ------------------------------------------------------------ */

  steps.forEach(function (step) {
    var advances = step.getAttribute("data-advance") !== "manual";

    $$("input[type=radio]", step).forEach(function (input) {
      input.addEventListener("change", function () {
        save();
        // A short beat so the selected state is visible before moving on.
        if (advances) window.setTimeout(next, 180);
      });
    });

    $$("input[type=checkbox]", step).forEach(function (input) {
      input.addEventListener("change", function () {
        /* "None of these yet" is exclusive in both directions. */
        if (input.hasAttribute("data-exclusive") && input.checked) {
          $$("input[type=checkbox]", step).forEach(function (o) {
            if (o !== input) o.checked = false;
          });
        } else if (input.checked) {
          $$("input[type=checkbox][data-exclusive]", step).forEach(function (o) {
            o.checked = false;
          });
        }
        save();
      });
    });

    var cont = $("[data-continue]", step);
    if (cont) cont.addEventListener("click", function (e) { e.preventDefault(); save(); next(); });
  });

  /* Number keys pick an option, Enter advances. Escape deliberately does
     nothing - there is no modal to close and no accidental exit. */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" && e.target.type === "text") return;
    if (tag === "input" && e.target.type === "email") return;

    if (/^[1-9]$/.test(e.key)) {
      var opts = $$("input[type=radio], input[type=checkbox]", steps[current]);
      var pick = opts[parseInt(e.key, 10) - 1];
      if (pick) {
        e.preventDefault();
        pick.checked = pick.type === "checkbox" ? !pick.checked : true;
        pick.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (e.key === "Enter") {
      var cont = $("[data-continue]", steps[current]);
      if (cont) { e.preventDefault(); cont.click(); }
    }
  });

  /* ---- Submit ------------------------------------------------------------ */

  root.addEventListener("submit", function (e) {
    e.preventDefault();
    save();

    var fd = new FormData(root);
    var first = (fd.get("firstname") || "").toString().trim();
    var email = (fd.get("email") || "").toString().trim();

    /* Prefill, plus whatever ad parameters main.js stamped onto the link that
       brought them here. Without this second hop the attribution dies at
       /start and every paid booking reports as direct traffic. */
    var dest = TIDYCAL +
      "?name=" + encodeURIComponent(first) +
      "&email=" + encodeURIComponent(email) +
      CARRIED;

    var btn = $("[data-submit]", root);
    if (btn) { btn.disabled = true; btn.setAttribute("aria-busy", "true"); }

    track("qualifier_complete", { has_email: !!email });

    function go() { window.location.href = dest; }

    /* The POST happens first so an abandoned booking still leaves a lead,
       but a form endpoint hiccup must never cost a booking, so any failure
       redirects anyway. */
    var body = new URLSearchParams();
    fd.forEach(function (v, k) { body.append(k, v); });

    window.fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    }).then(go).catch(function (err) {
      if (window.console) console.warn("[qualifier] lead POST failed, continuing to booking", err);
      go();
    });
  });

  /* ---- The escape hatch --------------------------------------------------- */

  $$("[data-skip]").forEach(function (a) {
    a.addEventListener("click", function () { track("qualifier_skip", { step: current + 1 }); });
  });

  /* ---- Init --------------------------------------------------------------- */

  root.classList.add("is-live");
  show(0, false);
  try { history.replaceState({ step: 0 }, "", location.pathname); } catch (e) {}
  track("qualifier_start");

})();
