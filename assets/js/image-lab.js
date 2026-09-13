/* ==========================================================================
   ADSVIO — image-lab.js
   Front end for the Gemini image generator.

   THERE IS NO API KEY IN THIS FILE, AND THERE MUST NEVER BE ONE.
   This script only ever talks to our own function at ENDPOINT below. The key
   lives in Netlify's environment and is read server-side in
   netlify/functions/generate-image.mjs. If you ever find yourself wanting a
   key here to "just test something quickly", that is the moment the key gets
   published — do the test in the function instead.

   Written in the same plain-ES5-in-an-IIFE style as the rest of assets/js so
   it needs no build step and no transpiler, matching the site.
   ========================================================================== */

(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/generate-image";
  var MAX_CHARS = 1000;

  var form = document.getElementById("lab-form");
  if (!form) return;

  var input    = document.getElementById("lab-prompt");
  var button   = document.getElementById("lab-submit");
  var counter  = document.getElementById("lab-count");
  var status   = document.getElementById("lab-status");
  var errorBox = document.getElementById("lab-error");
  var result   = document.getElementById("lab-result");
  var image    = document.getElementById("lab-image");
  var meta     = document.getElementById("lab-meta");
  var download = document.getElementById("lab-download");

  var busy = false;
  var timer = null;
  var started = 0;

  /* ---- Small helpers ----------------------------------------------------- */

  function show(el) { el.hidden = false; }
  function hide(el) { el.hidden = true; }

  function fail(message) {
    errorBox.textContent = message;
    show(errorBox);
  }

  function clearError() {
    errorBox.textContent = "";
    hide(errorBox);
  }

  /* ---- Character counter ------------------------------------------------- */

  function count() {
    var n = input.value.trim().length;
    counter.textContent = n + " / " + MAX_CHARS;
    counter.classList.toggle("is-over", n > MAX_CHARS);
    /* Disabled on empty as well as over-length, so the primary control tells
       the truth about whether it will do anything. */
    button.disabled = busy || n === 0 || n > MAX_CHARS;
  }

  input.addEventListener("input", count);

  /* ---- Busy state -------------------------------------------------------- */

  function setBusy(state) {
    busy = state;
    button.setAttribute("aria-busy", state ? "true" : "false");
    input.readOnly = state;
    form.classList.toggle("is-busy", state);
    count();

    if (state) {
      started = Date.now();
      show(status);
      /* A live elapsed count, because image generation regularly takes 10-20
         seconds and a spinner with no number reads as "frozen". */
      timer = window.setInterval(function () {
        var s = Math.round((Date.now() - started) / 1000);
        status.querySelector("[data-elapsed]").textContent = s + "s";
      }, 1000);
    } else {
      hide(status);
      window.clearInterval(timer);
      timer = null;
    }
  }

  /* ---- Submit ------------------------------------------------------------ */

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    /* Guard one: the flag. Guard two: the disabled button. Guard three: the
       server's own validation. A double-submit here costs real money, so it
       is worth checking in more than one place. */
    if (busy) return;

    var prompt = input.value.trim();
    clearError();

    if (!prompt) {
      fail("Write a prompt first.");
      input.focus();
      return;
    }
    if (prompt.length > MAX_CHARS) {
      fail("Keep the prompt under " + MAX_CHARS + " characters. Yours is " + prompt.length + ".");
      input.focus();
      return;
    }

    setBusy(true);
    hide(result);

    /* Abort well inside Netlify's 60s function ceiling, so a hung request
       surfaces as a real message rather than the browser spinning forever. */
    var controller = window.AbortController ? new AbortController() : null;
    var abortTimer = controller
      ? window.setTimeout(function () { controller.abort(); }, 55000)
      : null;

    window.fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        /* Read as text first. A function that crashes before it can set a
           content type returns an HTML error page, and res.json() on that
           throws a parser error that tells you nothing useful. */
        return res.text().then(function (body) {
          var payload = null;
          try { payload = JSON.parse(body); } catch (err) { /* handled below */ }

          if (!payload) {
            throw new Error(
              res.ok
                ? "The server sent a response we could not read."
                : "Server error (" + res.status + "). Check the function log in Netlify."
            );
          }
          if (!res.ok) throw new Error(payload.error || "Request failed (" + res.status + ").");
          if (!payload.data) throw new Error("No image came back.");
          return payload;
        });
      })
      .then(function (payload) {
        var src = "data:" + (payload.mimeType || "image/png") + ";base64," + payload.data;
        image.src = src;
        image.alt = "Generated image for the prompt: " + prompt;
        download.href = src;
        download.download = "adsvio-" + Date.now() + ".png";
        meta.textContent = payload.model + " · " +
          Math.round((Date.now() - started) / 1000) + "s · " +
          Math.round((payload.data.length * 0.75) / 1024) + " KB";
        show(result);
        result.scrollIntoView({ block: "nearest", behavior: "smooth" });
      })
      .catch(function (err) {
        if (err && err.name === "AbortError") {
          fail("That took too long and was cancelled. Try a simpler prompt.");
        } else if (err instanceof TypeError) {
          /* fetch() rejects with TypeError when the request never completed —
             offline, DNS failure, or the dev server not running. */
          fail("Could not reach the server. Check your connection and try again.");
        } else {
          fail(err.message || "Something went wrong.");
        }
      })
      .then(function () {
        if (abortTimer) window.clearTimeout(abortTimer);
        setBusy(false);
      });
  });

  /* Cmd/Ctrl+Enter submits, which is what anyone who types into a textarea
     for a living will try first. */
  input.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!button.disabled) form.requestSubmit ? form.requestSubmit() : button.click();
    }
  });

  count();
})();
