/* ==========================================================================
   ADSVIO - site-config.js
   One place for the numbers that keep drifting.

   WHY THIS FILE EXISTS
   The timeline moved from 30 days to 45 and it took three separate passes to
   catch every copy, because the number was hand-typed into ~36 HTML files,
   two OG images and a dozen JSON-LD blocks. The same happened to the price
   floor. This is not a framework and it does not template the site - it is
   the reference every future edit checks against, plus the few values JS can
   genuinely own at runtime.

   WHAT IT CAN AND CANNOT DO
   The site is static by design: no build step, so HTML cannot include a
   partial or interpolate a constant. Anything rendered in markup still has
   to be edited in the markup. What this file gives you is:

     1. One authoritative list, so you know what the value is meant to be.
     2. window.ADSVIO for scripts (qualifier.js, main.js, analytics).
     3. A dev-only consistency check - load any page with ?configcheck=1 and
        it reports rendered text that disagrees with these values.

   The full manual list, including what lives in images and JSON-LD, is in
   PLACEHOLDERS.md. Change a number HERE and THERE in the same commit.
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = {
    /* Delivery timeline, in days. Appears in titles, meta, OG images, body
       copy, JSON-LD and the guarantee. Not the same as the 30-day post-launch
       tweak window, the 30 days of starter content, or the 30-day notice
       period in the terms - those three are unrelated and must stay 30. */
    timelineDays: 45,

    /* Published price anchor. The real number is agreed after the audit; these
       are the only figures allowed to appear in public copy. */
    priceFloor: 850,
    typicalMin: 1500,
    typicalMax: 5000,
    currency: "USD",

    /* Capacity. A statement of fact, defensible on a call. Deliberately a
       range and deliberately not a countdown - "3 spots left" would require
       tracking that does not exist. Do not publish a remaining count. */
    capacityPerMonth: "2–3",

    /* Endpoints. Every booking CTA routes through the qualifier; only the
       qualifier's escape hatch and the booking confirmation link out
       directly. */
    startUrl: { en: "/en/start", fr: "/fr/start" },
    bookingUrl: "https://tidycal.com/adsvioagency/30-minute-meeting",
    whatsappUrl: "https://wa.me/18295927303",
    // US calls/texts and Dominican WhatsApp are separate owner-confirmed channels.
    phone: "+1 786 758 9680",
    whatsappPhone: "+1 829 592 7303",
    city: "Santo Domingo, Dominican Republic"
  };

  window.ADSVIO = CONFIG;

  /* ------------------------------------------------------------------------
     Dev-only drift check. Off unless you ask for it: ?configcheck=1
     Reports rendered copy that contradicts the values above, which is how
     the 30-day strings survived three passes.
     ---------------------------------------------------------------------- */

  try {
    if (new URLSearchParams(window.location.search).get("configcheck") !== "1") return;
  } catch (e) { return; }

  window.addEventListener("load", function () {
    var text = document.body.innerText || "";
    var problems = [];

    /* The three legitimate 30s, so the check does not cry wolf. */
    var ALLOWED = [
      /30 days of starter content/i, /30 jours de contenu/i,
      /first 30 days after launch/i, /30 jours suivant le lancement/i,
      /30 days' notice/i, /30 days genuinely/i, /within 30 days/i,
      /typically 30 days/i, /30-minute/i, /30 minutes/i
    ];

    (text.match(/[^.]*\b30[\s-]?(days?|jours?)\b[^.]*/gi) || []).forEach(function (s) {
      if (!ALLOWED.some(function (re) { return re.test(s); })) {
        problems.push("stale timeline: …" + s.trim().slice(0, 90) + "…");
      }
    });

    ["From $1,200", "From $850", "1 200 $", "no quote required"].forEach(function (s) {
      if (text.indexOf(s) !== -1) problems.push("retired price string: " + s);
    });

    document.querySelectorAll('a[href*="tidycal.com"]').forEach(function (a) {
      var p = window.location.pathname;
      if (!/\/(start|thank-you-booking)\/?$/.test(p)) {
        problems.push("CTA bypasses the qualifier: " + a.getAttribute("href"));
      }
    });

    if (window.console) {
      if (problems.length) {
        console.warn("[site-config] " + problems.length + " drift(s) on " + location.pathname);
        problems.forEach(function (p) { console.warn("  • " + p); });
      } else {
        console.info("[site-config] no drift on " + location.pathname);
      }
    }
  });
})();
