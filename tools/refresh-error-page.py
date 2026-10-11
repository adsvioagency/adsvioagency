"""Create the shared, noindex multilingual 404 using existing brand assets."""
from pathlib import Path
root=Path(__file__).resolve().parent.parent
(root/'404.html').write_text('''<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 | Adsvio Agency</title>
<meta name="description" content="Page not found. Página no encontrada. Page introuvable. Adsvio Agency.">
<meta name="robots" content="noindex, follow">
<link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/components.css">
</head>
<body data-no-modal>
<header class="qhead">
<a class="wordmark" href="/" aria-label="Adsvio Agency"><img src="/assets/img/logo-adsvio.png" width="420" height="97" alt="Adsvio Agency"></a>
<div class="langswitch" role="group" aria-label="Website language">
<a class="langswitch__item" href="/en/" lang="en" data-language="en">EN</a>
<a class="langswitch__item" href="/es/" lang="es" data-language="es">ES</a>
<a class="langswitch__item" href="/fr/" lang="fr" data-language="fr">FR</a>
</div>
</header>
<main id="main" class="container container--narrow section">
<p class="eyebrow">Adsvio Agency</p>
<h1>404</h1>
<section lang="en" style="margin-top:32px"><h2>Page not found.</h2><p style="margin-block:16px">That page does not exist. Choose a language to return to the website.</p><a class="btn btn--primary" href="/en/" data-language="en">Return to the website</a></section>
<section lang="es" style="margin-top:32px"><h2>Página no encontrada.</h2><p style="margin-block:16px">Esta página no existe. Elige un idioma para volver al sitio.</p><a class="btn btn--primary" href="/es/" data-language="es">Volver al sitio</a></section>
<section lang="fr" style="margin-top:32px"><h2>Page introuvable.</h2><p style="margin-block:16px">Cette page n’existe pas. Choisissez une langue pour revenir au site.</p><a class="btn btn--primary" href="/fr/" data-language="fr">Retour au site</a></section>
</main>
<script src="/assets/js/language.js" defer></script>
</body>
</html>
''',encoding='utf-8')
print('Updated shared multilingual error page.')
