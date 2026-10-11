/* Manual preference only. Direct /en/, /es/, /fr/ URLs always stay put. */
(function () {
  "use strict";
  var supported = ["en", "es", "fr"];
  var cookie = "adsvio_language";
  function save(lang) {
    if (supported.indexOf(lang) < 0) return;
    var domain = /(^|\.)adsvioagency\.com$/.test(location.hostname)
      ? "; Domain=adsvioagency.com" : "";
    try {
      document.cookie = cookie + "=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax" +
        (location.protocol === "https:" ? "; Secure" : "") + domain;
    } catch (e) { /* Language links still navigate if storage is blocked. */ }
  }
  document.querySelectorAll("[data-language]").forEach(function (a) {
    var target = new URL(a.getAttribute("href"), location.href);
    // Preserve campaigns, page filters and stable section IDs when switching.
    var current = new URLSearchParams(location.search);
    current.forEach(function (value, key) {
      if (key !== "lang") target.searchParams.set(key, value);
    });
    target.hash = location.hash;
    a.href = target.pathname + target.search + target.hash;
    a.addEventListener("click", function () { save(a.getAttribute("data-language")); });
  });
  // Browser-native validation follows the browser UI language, which can
  // differ from the page. Provide localized errors without replacing forms.
  var lang = document.documentElement.lang.split("-")[0];
  var messages = {
    en: { required: "Please complete this field.", email: "Please enter a valid email address." },
    es: { required: "Completa este campo, por favor.", email: "Escribe un correo electrónico válido." },
    fr: { required: "Veuillez remplir ce champ.", email: "Veuillez saisir une adresse courriel valide." }
  }[lang] || { required: "Please complete this field.", email: "Please enter a valid email address." };
  document.addEventListener("invalid", function (event) {
    var field = event.target;
    if (!field.validity || !field.setCustomValidity) return;
    if (field.validity.valueMissing) field.setCustomValidity(messages.required);
    else if (field.type === "email" && field.validity.typeMismatch) field.setCustomValidity(messages.email);
  }, true);
  document.addEventListener("input", function (event) {
    if (event.target.setCustomValidity) event.target.setCustomValidity("");
  });
  document.addEventListener("change", function (event) {
    if (event.target.setCustomValidity) event.target.setCustomValidity("");
  });
})();
