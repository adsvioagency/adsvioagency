# Adsvio Agency multilingual handoff

Implementation date: 11 October 2026. Branch: `feature/adsvio-multilingual-geo`.
Owner authorized production publication on 11 October 2026 after final checks.
PR: https://github.com/adsvioagency/adsvioagency/pull/1
Verified preview: https://deploy-preview-1--adsvioagency.netlify.app/es/
Production is published and verified: https://adsvioagency.com
Commit: 080203951ef048c0528d68d923f3f32dd10c42df
Netlify deploy: 6acba9f142301d00088136e9, ready, 11 October 2026 11:23 a.m. Eastern.
Publication evidence is recorded in MULTILINGUAL-PROGRESS.md and docs/qa/.

## What changed

The static HTML/CSS/vanilla JavaScript architecture and existing artwork,
fonts, palette, services, USD prices, 45-day delivery terms, contact numbers,
booking URL and portfolio disclosures are retained. There is no new framework,
translation API, geolocation API, tracker or paid service.

All 35 public page families have English, Dominican Republic Spanish and
Canadian French versions: 105 public localized HTML pages. The sitemap has
96 indexable URLs (32 per language); booking and confirmation pages remain
noindex. The root and shared 404 provide three-language entry/recovery options.

English body positioning stays intact. Necessary English changes include
language controls, accessible honeypots, multilingual SEO, removal of the
Creole phrase interface, and the previously broken checklist delivery path.
The language proof animation remains on English with three phrases. Spanish
and French keep a stable localized headline rather than cycling into English.

## Coverage

`LANGUAGE-COVERAGE.json` lists every route, language status and indexability.
The companion `LANGUAGE-COVERAGE.md` is the readable route-by-route inventory.
No required Spanish or French page is a generic English fallback.

Excluded from translation/indexing: `en/image-lab.html` (existing internal
image-generation tool) and `en/blog/_post-template.html` (protected authoring
template). Internal pricing and scorecard software have not been published.
Creole website pages and language controls are excluded. Existing factual
statements about the agency's spoken service languages are preserved; these
are distinct from the three available website versions.

## Spanish editorial decisions

The Spanish visitor sees the service first, rather than a vague agency slogan.
The copy addresses owners of local businesses and entrepreneurs in practical
terms: a página web, Google, redes sociales, confianza and contacto. It uses
consistent friendly `tú`, without forced slang, invented results or promises
of sales or rankings. Service and audience pages explain the actual work,
responsibilities and next step. Portfolio concepts remain clearly fictional.
Testimonial translations are labelled and remain faithful to their authors.

Final homepage headline:

> Páginas web que muestran lo bueno de tu negocio.

Supporting paragraph:

> Creamos páginas web y mejoramos cómo se presenta tu negocio en Google y redes
> sociales, para que tus clientes entiendan lo que ofreces, confíen en tu trabajo
> y sepan cómo contactarte. Un proyecto de 45 días, según lo que necesitas.

Primary CTA:

> Quiero mi evaluación gratuita

It is the same real Visibility Score offer: 30-minute session, a score out of
100 in five dimensions and a one-page report within 48 hours after the session.
The published 45-day guarantee is a delivery guarantee, not a sales/ranking
guarantee. No replacement 30-day delivery promise has been introduced.

## French editorial decisions

French now covers the full public route set, including articles, guides,
audience pages, policies and concept builds. It uses professional Canadian
terminology with broad French readability: `courriel`, `médias sociaux`,
`témoins`, `référencement local`, `profil d’entreprise Google`,
`fiche de visibilité`, `jour ouvrable` and `mise en ligne`.

CTAs consistently offer a free visibility score or WhatsApp conversation.
Navigation, legal links, validation, booking progress, consent and option counts
remain in French. Awkward literal phrasing and prior English-only links are
replaced. Policy translations are editorial translations requiring owner
review, not legally certified texts.

## Routing and preference

`netlify/edge-functions/language.js` runs only at `/` and `/index.html` for
GET/HEAD requests. It uses Netlify's `context.geo.country.code` and the request's
Accept-Language header. It makes no network call and does not store country.

1. Explicit root `?lang=en|es|fr` chooses and stores that language.
2. A valid manually saved `adsvio_language` cookie wins over automatic guesses.
3. Dominican Republic → Spanish; United States → English; Haiti → French.
4. Canada → first preferred English/French browser language.
5. Other/unknown countries → supported browser language, otherwise English.

The function does not run on `/en/`, `/es/` or `/fr/` pages. Thus direct links
remain accessible even if the visitor's country or cookie suggests another
language. Form POSTs pass through. Automatic guesses are not saved as manual
preferences. Redirects are temporary 302 responses with no shared caching and
preserve campaign parameters. Recognized crawlers/social previews get a stable
HTML chooser at the root; localized pages can be crawled directly. On edge
failure, Netlify bypasses the function and serves the chooser.

`assets/js/language.js` writes only an explicit manual choice. The cookie lasts
one year, uses SameSite=Lax and Secure on HTTPS, and is shared between www and
the primary custom domain. Preview cookies are host-only. Blocked storage does
not stop language links from working. The static links preserve page context;
JavaScript also preserves query parameters and stable URL fragments.

With JavaScript disabled, translated content, language links, FAQs, the expanded
offer and plain booking/contact forms remain in HTML. Mobile navigation has a
CSS fallback. A root `?lang=` choice can persist server-side without JavaScript;
ordinary direct language links without JavaScript do not write the preference
cookie. Browser-native validation without JavaScript follows browser settings.

## Header and mobile

The main header always shows EN/ES/FR. Each target is 44 by 44 CSS pixels.
The logo is 26px tall instead of 30px on ordinary headers (13.3% reduction),
24px on smaller phones, and 20px at 360px and below to keep all controls visible.
Footer logo artwork and proportions are unchanged. The existing mobile menu
opens/closes and localized links stay in the selected language. Longer French
and Spanish desktop navigation uses the existing hamburger breakpoint sooner.
The localized mobile hero uses modest typography/spacing adjustments so the
headline, description and action fit the initial viewport.

## SEO

- Existing English and French slugs and preferred non-www hostname preserved.
- Equivalent Spanish slugs keep route mapping simple and deterministic.
- Self-referencing canonicals for each version; reciprocal `en`, `es`, `fr`
  and `x-default` alternates. Generic language codes support diaspora readers;
  page JSON-LD/OG locales specify en-US, es-DO and fr-CA as applicable.
- Localized titles, descriptions, H1s, social text, image descriptions,
  service/article/breadcrumb strings and visible FAQ schema.
- Neutral existing brand artwork on translated sharing cards avoids advertising
  English text inside an OG image; original site artwork is retained.
- The XML sitemap mirrors HTML alternates, with 96 indexable URLs.
- Netlify Pretty URLs remains enabled; deployed QA showed it did not redirect
  every `.html` alias, so 105 explicit permanent canonical redirects were added. Existing
  unprefixed legacy redirects remain; French about/services legacy queries now
  point to their real French pages. The former permanent English root redirect
  is removed because visitor-specific routing requires temporary redirects.
- Robots continues to allow public language directories. Internal sources,
  maintenance catalogs and tools remain behind forced 404 rules.

## Forms and checklist defect fixed

Contact forms retain Netlify detection, POST, form-name and honeypot settings.
Names are `contact`, `contact-es` and the existing `contact-fr`. The baseline
contact form omitted a reply address; a labelled required email field now
allows the promised response in each language. The booking
qualifier retains its existing form name. Checklists use `checklist`, the
existing `checklist-fr`, and new `checklist-es`, with a language field on
translated pages. Confirmation actions stay in the form's language.
Booking still goes to the existing TidyCal meeting; WhatsApp and US calls use
their separate existing numbers. Their external interfaces are not controlled
by this localization.

The baseline advertised a checklist but supplied no downloadable PDF. Three
real, two-page, 27-point resources now exist in `assets/downloads/`. Their
confirmation-page links work, including a static no-JavaScript fallback. The
resource page is now indexable. The copy describes download after requesting;
this repository does not implement automatic email attachment delivery.
Existing external Netlify notifications/account integrations were not changed.
Exit-intent remains disabled, even though its optional strings are localized.

## Reproduction and verification

From the project directory:

```powershell
npm run qa
npm run localize
npm run preview
```

`qa` runs 34 routing tests plus SEO, shared header/footer and content/form/route
checks. Regeneration is idempotent. The maintenance tool refuses unknown copy
rather than publishing an untranslated fallback. All localized content is
checked into HTML; Netlify's site build command stays empty.

The local preview is `http://localhost:8787/es/`. It serves extensionless HTML
paths and imports the actual root function. `/?country=DO|US|HT|CA` supplies an
explicit local test country. This is a local simulation, not a production query
override. Browsers with a saved preference should continue honoring it.

For Netlify-native local simulation, if the CLI is available:

```powershell
npx netlify dev --geo=mock --country=DO
```

Repeat with US, HT and CA and adjust browser language for Canadian cases.
The CLI was not preinstalled; this run used function tests and the lightweight
local server rather than adding a CLI dependency to the site.

Verified: substantive HTML and SEO for all languages, reciprocal equivalents,
internal links/assets, form markup/actions, static content availability,
localized browser validation, questionnaire progress/exclusive selections,
Spanish option singular/plural, mobile menu, page-context/UTM/fragment switching,
saved preference versus simulated DO, direct Spanish access despite saved FR,
and no console errors on representative browser sessions. External TidyCal and
agency WhatsApp destinations returned HTTP 200. Both existing production domain
entry points resolved to the existing canonical English site before changes.

Visual QA: 320/375/390/768/1280px homepage checks and full translated-page mobile
audit are recorded under `docs/qa/`. All six checklist PDF pages were rendered
and checked for readable accents, alignment, page numbers and clipping.

Hosted preview validation confirms the edge function deployed, saved EN/ES/FR
routing, 302 no-store root responses, explicit preference cookies, query
retention, .html → clean 301 redirects, translated pages/downloads, and forced
404s for internal files. All three hosted contact forms reached their localized
confirmation pages using labelled test data and qa@example.invalid. Verified
submission counts did not increase. These deliberately undeliverable test
addresses may be spam filtered; actual stored/verified capture and notifications
are not claimed. The Netlify browser dashboard required login, and the connector
does not expose the Spam list. Check Spam submissions or test with an owner
email; no spam protections were weakened. No real recipient email was used.

Real Netlify GeoIP from multiple countries, custom-domain preference sharing
and owner notification delivery still require appropriate network/account
verification. A full browser session with JavaScript
disabled was not run; the HTML and CSS fallback contracts were inspected.

## Exact Netlify and GitHub workflow

Connected project: `adsvioagency`, ID `bd4822e7-baea-461e-82d2-8389f8ebaab8`.
Team: Adsvio Agency, slug `runaldpierre`, Free. Forms were already enabled.
The audited baseline was `main` / `29c6fd4`. The multilingual production release
is `main` / `0802039`; the primary site is
`https://adsvioagency.com`. Project configuration remains `publish = "."`, an
empty site build command, existing functions directory and Pretty URLs on.

No new environment variable, DNS edit, domain setting, paid feature or manual
language-function toggle is required. Netlify discovers the edge function and
its inline root config from the branch deploy. Review the actual preview build
which has confirmed the edge function in both the preview and production.

1. Review the feature branch and draft pull request. Open its Netlify Deploy
   Preview at `/es/` and `/fr/` and review major copy and policies.
2. If Netlify does not create the preview, open Project configuration →
   Developer settings → Continuous deployment → Branches and deploy contexts.
   Confirm Deploy Previews for pull requests targeting `main`. Do not switch
   the production branch or enable paid settings. The repository is public.
3. Confirm the preview lists the `language` edge function and the Netlify Forms
   names. Submit an owner-controlled test in each contact language and inspect
   the form record/notification and localized confirmation. Delete test records
   through the normal dashboard workflow if desired.
4. For a real country test, use a fresh browser session with no
   `adsvio_language` cookie and a network egress in DO, US, HT or CA. Browser
   location permission and a made-up request header do not change Netlify's IP
   country. Test the preview root, both custom domains after approval, Canadian
   French/English preferences, saved choice and direct opposite-language URLs.
5. Only after owner approval, merge the reviewed feature PR to `main`. The
   existing GitHub-to-Netlify production flow should deploy it. Confirm the
   successful production deploy and the edge function, then repeat the domain,
   form and country checks. The owner subsequently authorized this task to merge and publish once checks
   pass; that authorization supersedes the earlier review-only limit.

## Keeping the budget at $0

The connected team reports Free and was created in March 2026. Netlify's current
credit-plan documentation lists Free at 300 monthly credits. Root-only routing
adds at most one language-entry redirect per root visit; assets and translated
pages do not invoke this function. It uses no separately billed external API.
Free allocation is finite; other existing site functions/traffic share usage.
The connector does not expose the remaining credit balance, so it is not claimed
as verified. No credit pack, recharge or upgrade has been enabled.

Open the existing team at `https://app.netlify.com/teams/runaldpierre`, then
Billing → Current services / Usage to check the remaining allocation, request
and bandwidth meters. Do not enable auto recharge or buy credits for this work.
On a credit-based Free plan, reaching the limit can pause projects; usage must
still be monitored. A preview does not prove the account has unlimited capacity.

Official references checked during implementation:

- https://docs.netlify.com/build/edge-functions/overview/
- https://docs.netlify.com/build/edge-functions/usage-and-billing/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- https://www.netlify.com/pricing/

## Files and maintenance

Primary files: all public HTML in `en/`, `es/`, `fr/`; `index.html`, `404.html`,
`sitemap.xml`, `netlify.toml`; shared CSS and language/consent/offer/qualifier/
confirmation/modal scripts; three PDF downloads; `tools/localize.py`, route,
SEO, partial and routing tests. Editorial sources live in `docs/i18n/`.

After editing English, add corresponding reviewed translations to the editorial
catalog, regenerate and run QA. Unknown strings stop regeneration before writes.
The script shares technical markup but never translates at visitor request time.
The PDF authoring tool uses the bundled ReportLab runtime only; no PDF or
translation dependency is installed in the website package.

## Owner review and remaining approvals

Review Dominican Spanish, Canadian French, the new checklists and the translated
policies. Legal meaning, published prices and contact information were not
intentionally changed; the privacy policy now discloses the actual language
cookie and browser consent storage, and removes the retired region-price entry.
The owner authorized production publication on 11 October 2026. Language and
legal-policy review remain recommended human checks, not a claim of legal
certification. Real-country routing and verified form/notification delivery
remain explicit verification limits.

## Published-change commits

- `84a914e`: complete three-language HTML, routing, SEO, UI and resources.
- `3d6a711`: deployed HTML alias redirects and preserved localized form names.
- `be13dbe`: required reply email in contact forms and source line endings.
- Final checkpoint: handoff and deployed QA evidence before merge.

Additional official form-testing reference:
https://docs.netlify.com/manage/forms/troubleshooting-tips/

## Final publication evidence

The owner-authorized PR is merged. Netlify reports production ready for commit
0802039 with the language function deployed. All 108 public pages/PDF paths
returned HTTP 200 on the live domain. Six saved-language/domain combinations,
root preference/campaign handling, HTML aliases, private-source denials and the
96-URL sitemap were verified. Production mobile screenshot is under docs/qa/.
No further Netlify setup or production merge is required for this release.

The final documentation-only publication record does not change deployed
website files and uses [skip netlify] to avoid an unnecessary extra deployment.
