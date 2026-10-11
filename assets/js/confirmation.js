(function () {
  "use strict";
  var from = new URLSearchParams(location.search).get("from");
  var lang = document.documentElement.lang.split("-")[0];
  var copy = {
    en: { title: "Your checklist is ready.", message: "Download your 27-point checklist below. Keep it and choose the three improvements that matter most for your business." },
    es: { title: "Tu lista está lista.", message: "Descarga abajo tu lista de 27 puntos. Guárdala y elige las tres mejoras más importantes para tu negocio." },
    fr: { title: "Votre liste est prête.", message: "Téléchargez votre liste de 27 points ci-dessous. Gardez-la et choisissez les trois améliorations prioritaires pour votre entreprise." }
  }[lang];
  if (from === "checklist") {
    var title = document.querySelector("[data-title]");
    var message = document.querySelector("[data-message]");
    if (title) title.textContent = copy.title;
    if (message) message.textContent = copy.message;
  } else {
    var download = document.querySelector('[data-download]');
    if (download) download.hidden = true;
  }
  if (window.adsvioTrack) {
    window.adsvioTrack("form_submit", { form: from || "unknown", language: lang });
    if (from === "checklist") window.adsvioTrack("checklist_download", { step: "requested", language: lang });
  }
})();
