/* ==========================================================================
   ADSVIO — modal.js
   The exit-intent offer for The Client-Ready Checklist.

   Shows at most once per visitor per 14 days. Never on the thank-you page or
   either legal page — those carry data-no-modal on <body>.

   Triggers, any one of:
     1. desktop pointer leaving through the top of the viewport
     2. 60% scroll depth reached with at least 45 seconds on the page
     3. mobile back-button intent
   ========================================================================== */

(function () {
  "use strict";

  /* OFF until The Client-Ready Checklist actually exists. The modal collects
     emails for a download we cannot deliver, which is the fastest way to lose
     a list before you have one. Flip to true the day the PDF ships — the rest
     of this file is untouched and still works. */
  var EXIT_MODAL_ENABLED = false;
  if (!EXIT_MODAL_ENABLED) return;
  if (document.body.hasAttribute("data-no-modal")) return;

  /* ------------------------------------------------------------------------
     The dialog now lives here rather than in 25 copies of the HTML.

     It used to ship inline on every page. Only this file was gated, so the
     markup still rendered — "No spam. Unsubscribe anytime." and "No thanks,
     I'm good" showed up at the bottom of the homepage and the offer page any
     time the stylesheet was not applied. Markup for a disabled feature should
     not exist in the document at all.

     The one thing the inline copy was genuinely buying us was Netlify form
     detection, which scans deployed HTML and would never see a string in a
     script. en/index.html keeps a hidden, field-only stub for that — no
     visible copy, so there is nothing left to leak.
     ---------------------------------------------------------------------- */

  var MARKUP =
    '<div class="modal" id="checklist-modal" role="dialog" aria-modal="true"' +
    '     aria-labelledby="checklist-title" hidden>' +
    '  <div class="modal__panel">' +
    '    <button class="modal__close" type="button">' +
    '      <span class="visually-hidden">Close</span>' +
    '      <svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>' +
    '    </button>' +
    '    <p class="eyebrow eyebrow--mango">Free download</p>' +
    '    <h2 id="checklist-title">The Client-Ready Checklist</h2>' +
    '    <p class="modal__sub">27 things that decide whether a stranger trusts' +
    '       your business — or clicks away.</p>' +
    '    <p class="modal__provenance">The same checklist we run on every client' +
    '       before we build anything.</p>' +
    '    <form name="checklist" method="POST" data-netlify="true"' +
    '          netlify-honeypot="company-website" action="/en/thank-you?from=checklist">' +
    '      <input type="hidden" name="form-name" value="checklist">' +
    '      <p class="hp"><label>Leave this empty if you are human' +
    '        <input name="company-website" tabindex="-1" autocomplete="off"></label></p>' +
    '      <div class="modal__form">' +
    '        <label class="visually-hidden" for="checklist-email">Your email address</label>' +
    '        <input class="input" id="checklist-email" type="email" name="email"' +
    '               placeholder="you@yourbusiness.com" autocomplete="email" required>' +
    '        <button class="btn btn--primary" type="submit">Send it to me</button>' +
    '      </div>' +
    '      <p class="modal__fine">No spam. Unsubscribe anytime.</p>' +
    '    </form>' +
    '    <button class="modal__decline" type="button">No thanks, I’m good</button>' +
    '  </div>' +
    '</div>';

  var modal = document.getElementById("checklist-modal");
  if (!modal) {
    var host = document.createElement("div");
    host.innerHTML = MARKUP;
    modal = host.firstChild;
    document.body.appendChild(modal);
  }
  if (!modal) return;

  var STORE_KEY = "adsvio_checklist_seen";
  var COOLDOWN_DAYS = 14;
  var DWELL_MS = 45000;
  var DEPTH = 0.6;

  /* Private browsing and blocked storage must not break the page, and must
     not turn into a modal on every single scroll either — if we cannot
     remember having shown it, we do not show it. */
  function storage() {
    try {
      var t = "__adsvio_t__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return window.localStorage;
    } catch (e) { return null; }
  }
  var store = storage();
  if (!store) return;

  function recentlyShown() {
    var raw = store.getItem(STORE_KEY);
    if (!raw) return false;
    var then = parseInt(raw, 10);
    if (isNaN(then)) return false;
    return (Date.now() - then) < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  }
  if (recentlyShown()) return;

  var panel = modal.querySelector(".modal__panel");
  var closeBtn = modal.querySelector(".modal__close");
  var declineBtn = modal.querySelector(".modal__decline");
  var emailInput = modal.querySelector("input[type=email]");
  var lastFocus = null;
  var isOpen = false;
  var armed = true;
  var loadedAt = Date.now();
  var historyPushed = false;

  function open() {
    if (!armed || isOpen) return;
    armed = false;
    isOpen = true;

    lastFocus = document.activeElement;
    store.setItem(STORE_KEY, String(Date.now()));

    modal.removeAttribute("hidden");
    document.body.classList.add("is-locked");

    /* Forced reflows, not requestAnimationFrame: the first commits the closed
       state so the fade has somewhere to animate from, the second commits
       visibility:visible so focus can land. rAF does not fire in a
       backgrounded tab and would strand focus outside the dialog. */
    void modal.offsetHeight;
    modal.classList.add("is-open");
    void modal.offsetHeight;
    if (emailInput) emailInput.focus();
    else if (closeBtn) closeBtn.focus();

    if (window.adsvioTrack) window.adsvioTrack("checklist_modal_view", {});
    teardown();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(function () {
      if (!isOpen) modal.setAttribute("hidden", "");
    }, 240);
    // Focus returns to whatever the visitor was on before the interruption.
    // The modal opens on exit intent rather than on a click, so there is often
    // nothing meaningful to go back to — land on the body in that case, not on
    // a stale node.
    if (lastFocus && document.contains(lastFocus) &&
        typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (declineBtn) declineBtn.addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab" && window.adsvioTrapFocus) window.adsvioTrapFocus(panel, e);
  });

  var form = modal.querySelector("form");
  if (form) {
    form.addEventListener("submit", function () {
      if (window.adsvioTrack) window.adsvioTrack("form_submit", { form: "checklist" });
    });
  }


  /* ---- Trigger 1: pointer leaves through the top ------------------------ */

  function onMouseOut(e) {
    if (e.clientY > 0) return;              // only the top edge counts
    if (e.relatedTarget || e.toElement) return;
    open();
  }

  /* ---- Trigger 2: 60% depth with 45s+ on the page ----------------------- */

  var scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      scrollTicking = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var depth = window.pageYOffset / scrollable;
      if (depth >= DEPTH && (Date.now() - loadedAt) >= DWELL_MS) open();
    });
  }

  /* ---- Trigger 3: mobile back-button intent ----------------------------- */

  function armBackButton() {
    if (historyPushed) return;
    try {
      window.history.pushState({ adsvio: 1 }, "", window.location.href);
      historyPushed = true;
    } catch (e) { /* no history access, skip this trigger */ }
  }
  function onPopState() {
    if (armed) open();
  }

  function teardown() {
    document.removeEventListener("mouseout", onMouseOut);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("popstate", onPopState);
  }

  var coarse = window.matchMedia("(pointer: coarse)").matches;
  if (!coarse) document.addEventListener("mouseout", onMouseOut);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (coarse) {
    window.addEventListener("popstate", onPopState);
    // arm only after the visitor has actually engaged, so the very first
    // back press out of a bounced visit is left alone
    window.setTimeout(armBackButton, 8000);
  }

})();
