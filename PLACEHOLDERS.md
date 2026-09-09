# PLACEHOLDERS — what Adsvio still needs before launch

Every slot on the site that is waiting for real content. Each one is also
marked `<!-- TODO: -->` or `PENDING REAL CONTENT` in the file it lives in, so
you can find it by searching the code for `TODO`.

**Nothing on this list has been invented or approximated.** Where a real
value was not available, the slot was left visibly empty rather than filled
with something plausible. That is deliberate: a placeholder you can see is
safe, and a fabricated one is not.

Status legend — 🔴 blocks launch · 🟡 should land before ads · ⚪ nice to have

---

## 🔴 Blocks launch

### 1. Testimonials — DONE, one thing left to sanity-check
**Where:** `en/index.html` and `fr/index.html`, the "Before Adsvio" section

All three quote cards carry **real, verbatim feedback**, fully attributed:

| Card | Source | Attribution |
|---|---|---|
| "…exceptionally well organized… I would highly recommend Pierre Runald Fevrier to any individual or organization, anytime, without hesitation." | LinkedIn, 26 Jan 2026 | Sylvain Exavier, PMP® · Project Management Professional |
| "Pierre is one of the best workers on here… the GO TO PERSON FOR SURE!" | Upwork, 5.0, 1,420-hour contract | Chris · Entrepreneur, Haiti |
| "…helping us organize our work and keep communications fluid." | Upwork, 5.0, bilingual FR-EN contract | Jason D. · Entrepreneur, Canada |

Quotes are copied exactly as written — capitals, punctuation and all. The
LinkedIn one is excerpted with an ellipsis marking the omission; nothing is
reworded. The role line is the country descriptor you gave, not the contract
title, so it cannot be misread as the client's own job.

**Deliberately not used:** the fourth screenshot, "Great team. Thank you!"
That line sits under *"Freelancer's review to the client"* — it is Pierre's
review of the client, not the reverse. The client's review on that contract is
a 5.0 rating with no text. Publishing it as a testimonial would reverse who
said it. Hang's contract is the one with no written review, which is why only
two of the three names appear.

**Two things to confirm yourself:**

1. **The "five years" claim.** The sub-line used to say Pierre ran projects
   "for five years." That could not be verified against anything supplied, and
   the reviews on hand run June 2024 – October 2025, so it now reads "spent
   years running operations, communication and coordination." If five years is
   accurate, put the number back — it is stronger.
2. **Check the two first names against Upwork** before you deploy. The mapping
   came from memory, not from the screenshots, which do not show client names.
   Getting a testimonial attributed to the wrong person is the kind of error
   that is very hard to walk back.

> **Worth knowing:** all three reviews describe virtual-assistant, customer
> service and executive-support work. None mention websites, branding or
> marketing results. That is fine — the section is headed "The agency is new.
> The work isn't," and a note under the cards says these are pre-agency
> contract reviews. But it is character and reliability proof, not results
> proof. The first real Adsvio client testimonial should replace one of these
> rather than sit alongside them.

### 2. Logo file — DONE (2026-09-07)
**Where:** `assets/img/logo-adsvio.png` and `logo-adsvio-light.png`

The real mark is in, on all 32 Adsvio pages — header, mobile menu and footer,
92 placements. The typographic `ADSVI<span>O</span>` wordmark and its mango
underline are gone from both the markup and the CSS.

Source was `Sales & Marketing/Adsvio. Official Logo.png`, a 2000×2000 PNG that
was 95.5% empty canvas. Trimmed to the mark's own bounds (1269×292) and
resized to 420×97, which is well over 3× the largest display size.

**The artwork already used the palette exactly** — `#16130F` is `--ink` and
`#E8590C` is `--mango`, straight from `tokens.css`. So the navy-and-gold
conflict flagged here since the rebuild is closed: there is no conflict.

Two files because the footer is `--teal-deep`:
- `logo-adsvio.png` — ink wordmark, mango dot. Header and mobile menu.
- `logo-adsvio-light.png` — `--paper` wordmark, `--sun` dot. Footer only.
  Mango sits at 2.27:1 on the teal and the dot would disappear; `--sun` is
  5.15:1. This matches the call the old typographic rule already made.

**To replace it:** overwrite both PNGs keeping 420×97, or regenerate from a new
source with the same trim-and-recolour step. No markup change needed — the
`<img>` carries `width="420" height="97"` on every page and CSS sets the
display height (24px header and menu, 26px footer), so the aspect box is
reserved and CLS stays at 0. Verified.

**Not on four pages, deliberately:** the three sample builds carry their
fictional clients' own branding, and `index.html` is the noindex redirect stub.

### 3. A native read of the French pages
**Where:** `fr/index.html`, `fr/offer.html`, `fr/contact.html`

`/fr/` is a three-page conversion path — homepage, offer, contact — written in
Canadian French with the more formal register of Haitian French. It is a
**working draft, not a finished translation.** Read every line, but read these
two properly:

- **The guarantee** (`fr/index.html`): "Si nous manquons cette échéance pour
  une raison qui nous revient, nous remboursons un mois complet de travail."
  This is a refund promise. A small wording slip changes what you are
  committing to.
- **The pricing block** (`fr/offer.html`). Same reason, and the plan-fee line
  quotes 50 $ US / 25 $ US.

Register choices worth confirming, since they signal where you are from:
- *courriel*, not *email*; *pourriel*, not *spam*; *médias sociaux*, not
  *réseaux sociaux*. These are the Canadian forms and a Montreal reader
  notices when a site uses the French-from-France ones.
- Prices are written `2 500 $ US` — number, space, symbol, currency — which is
  the Canadian convention, not `$2,500`.
- **Authority Launch** and **Storefront Launch** are left in English on
  purpose. They are product names; a caller who read the French page has to be
  able to say the name out loud to you and be understood.

### 3b. The Kreyòl page was removed
`/kr/` no longer exists. It was deleted at your request, and the language
switcher slot it occupied now points at `/fr/`. Nothing links to it, the
`/ht` redirects are gone, and it is out of the sitemap.

Kreyòl is still claimed everywhere it was true before — the four-language
eyebrow, the Language Proof pills, the `knowsLanguage` schema, the
"écrivez-nous dans la langue où vous pensez" line. Those describe languages
you work in, not pages that exist, so they stayed.

**If you want it back:** the page was a complete Kreyòl landing page — hero,
three-step problem, both offer cards, the eight-item included list, the ADSVIO
Method, the guarantee, five FAQs and WhatsApp-first CTAs. It is recoverable
from the project history rather than needing to be rewritten. The one page
that leans hardest on it is `en/haitian-business-marketing.html`, whose
related card and CTA now point at the French offer instead.

### 4. Legal review of the privacy policy and terms
**Where:** `en/privacy.html` and `en/terms.html` — both are live and linked

Both pages are written and thorough. **They are not legal advice and I am not
a lawyer.** You are a sole proprietor taking money from clients in the US,
Canada, the EU and the Dominican Republic, and the terms make a refund
commitment that appears on eleven pages. Have someone qualified read them.

The two clauses to point them at:

- **The 30-day guarantee** (terms, section 3). It defines what "a reason on
  our side" means and lists the three things that pause the clock. That is the
  clause a dissatisfied client will read closely.
- **Liability** (terms, section 10). Capped at fees paid for the project.
  Standard, and worth confirming it holds under Dominican law.

---

## 🟡 Before ads run

### 5. GA4 measurement ID and Meta Pixel ID
**Where:** `assets/js/consent.js`, the `CONFIG` block at the very top. One
place for the whole site — not one per page.

```
GA4_ID: "",        // e.g. "G-XXXXXXXXXX"
META_PIXEL_ID: ""  // 15 digits
```

Everything around them is already built and tested. The consent banner works,
records the choice for a year, and is reopenable from the "Cookie settings"
link in every footer. **Nothing that tracks a visitor loads until they press
Accept** — declining and ignoring the banner produce the same result.

Verified both ways: with the fields empty, accepting loads nothing (the safe
failure mode). With test IDs patched in and consent on record, `gtag` and
`fbq` both initialise and both tag scripts load. So the moment you paste the
real IDs, it starts working — no other change needed.

The events already fire: `book_call_click`, `whatsapp_click`, `form_submit`,
`checklist_download` and `offer_configured`, each tagged with where on the
page the click came from.

### 6. The Client-Ready Checklist PDF
The exit-intent modal and the (Phase 3) `/en/checklist` page both collect
emails for a document that does not exist yet. **Do not run traffic to the
modal until the PDF is real** — collecting emails for a deliverable you
cannot send is the fastest way to lose the list.

27 items. Working structure: first impression, findability, proof, clarity
of offer, contact friction, mobile, follow-up.

### 7. Social share images — REGENERATED (2026-09-09)
**Where:** `og:image` and `twitter:image` in each page

This was the cause of the WhatsApp preview still saying "30 days" after three
passes of fixing the tags. The number was **rendered into the picture**, so no
meta-tag change could touch it:

| File | Said | Now says |
|---|---|---|
| `og-home.jpg` | "Your business, online in **30 days**." | "…online in **45 days**." |
| `og-offer.jpg` | "THE **30-DAY** FOUNDATION" / "Everything, **priced up front**." | "THE 45-DAY FOUNDATION" / "Everything, listed in full." |

The offer card was doubly wrong — "priced up front" contradicted the whole
point of removing the published prices.

Both were rebuilt at 1200×630 from the site's own fonts and tokens, and
**written to new filenames** — `og-home-v2.jpg`, `og-offer-v2.jpg`. That is not
cosmetic: Facebook and WhatsApp cache previews **by URL**, so reusing the old
filename would have kept serving the 30-day card for weeks. Every reference in
the HTML now points at the `-v2` names. The old filenames were also overwritten
with the corrected artwork, so anything that re-scrapes the old URL gets the
right picture rather than a 404 or a stale one.

Regenerate with `scratchpad/gen_og.py` if the wording changes again.

### 7a. The offer page shows one public price floor (2026-09-07)
**Where:** `en/offer.html`, `fr/offer.html`, `assets/js/offer.js`

The region selector is **removed**. The page used to publish four prices — a
US and a Caribbean figure per package — behind a toggle, which meant a US
visitor could discover the site quotes them roughly double. It now shows one
floor per package, matching the homepage anchors exactly:

- The Storefront Launch — **From $850 USD**
- The Authority Launch — **From $1,200 USD**

with "Your fixed price is agreed after the audit." underneath. Add-on prices
and the value stack are gone; the deliverables and add-ons are still listed in
full, they just carry no numbers. Real quoting happens after the audit using
the internal calculator, on region, scope, business type and what the client
already has.

**Do not reintroduce a region or currency selector.** `qa-check.py` check 12
now fails the build if `data-region-input`, `data-regionpill`,
`data-needs="region"`, `data-us=` or `data-dr=` reappear on either offer page.

**Every other price on the site was aligned the same day.** The two-tier
figures were not only on the offer page — 13 price strips carried them (two
`/for/` pages, `haitian-business-marketing`, and two per service page), plus
prose in `social-media-management`, `branding-logo-design`, `website-design`,
`terms` and the `small-business-website-cost` guide. All now read "From $X"
with the fixed price agreed after the audit. **Zero dual-region pricing
remains anywhere on the site.**

The market-rate figures in the guides ("$1,800 to $3,500 in the US and
Canada") are untouched on purpose — those describe what the industry charges,
not what Adsvio charges, and they are cited to sources.

### 7b. Founder photo — SUPPLIED (2026-09-07)
**Where:** `assets/img/pierre-founder.webp` + `.jpg`, used by the founder note
band on `en/index.html` and `fr/index.html`.

Cropped from `Pictures/photo for founder note.png` (1086×1448) at box
(168, 200, 988, 1020) — a head-and-shoulders square with headroom, because the
band renders it as a circle and a tighter crop clipped the top of the hair.
Output 320×320, displayed at 72px desktop / 64px mobile, so roughly 4.4×. WebP
is 11.6 KB with a 16.9 KB JPEG fallback wired through `onerror`.

**To replace it:** re-crop to a square from the same or a new source, keep
320×320, and overwrite both files. No markup change is needed. Do not swap in a
non-square image — the circle mask will centre-crop it unpredictably.

Note there is a second, different portrait already in the repo —
`pierre-portrait-560/1120.webp|jpg`, used by the About page. That is a
different photograph (blurred office background, round glasses) and was left
alone.

### 8. Certification badges — REMOVED from the site (2026-09-07)
**Where:** nowhere. The block is gone from all 29 pages.

The strip rendered the literal strings "Badge slot 1/2/3" on every page of a
production site, which undermined every credibility signal above it. Removed
entirely — heading, slots, wrapper and CSS — per spec P0.1. It is not
commented out; it is deleted.

`.footer__bottom` picked up the `--s-6` top margin the strip used to carry, so
the footer rhythm is unchanged.

**To reinstate when a real certification exists:** add a block above
`.footer__bottom` with, for each earned badge, an `<a>` to its **verification
URL** wrapping a 116×46 badge image. Linking each badge to its verifier is
what makes it worth anything. Never ship a badge for an exam not yet passed.

### 9. LinkedIn — company page
**Where:** `en/index.html`, footer social row

The old site had `href="#"` here. It now points at Pierre's personal profile
and is labelled "Pierre Runald Février on LinkedIn", which is accurate. When
an Adsvio company page exists, point it there and relabel it.

---

## ⚪ Improves the page, not blocking

### 10. More photos of Pierre
The portrait already on the About page is real — it is the shot you named
`picture of me.png`, resized to 560px and 1120px as WebP with a JPG fallback.
It is doing shot 1 of the shot list, and doing it well.

Still missing: the working shots, the standing shot, and the Santo Domingo
environmental frame. Those unlock the guides, the service pages and the
`/en/haitian-business-marketing` page later. Full brief in **SHOT-LIST.md** —
all of it shootable on a phone in window light.

### 11. Photography inside the three sample builds
**Where:** the three pages under `en/work/`, plus the card art on `/en/work`
and the homepage. Search `TODO: replace` in each file.

The builds are finished and working, but every image slot is a CSS
composition rather than a photograph — a hero for Verdure Kitchen, a portrait
for Clarité, a hero, three stylist portraits and a six-tile gallery for
Atelier Nord. They are art-directed stand-ins, not fake photos: none of them
is pretending to be a picture of something.

They read fine as they are. Real photography would make the restaurant and
the salon noticeably stronger, since both are selling on appetite and feel.
Stock is acceptable here — these are fictional businesses, so there is no
client to misrepresent. Use a source that permits commercial use and keep the
licence note with the file.

### 12. Screenshots of the finished builds
**Where:** homepage hero device mockup, and the three cards on `/en/work`

The laptop-and-phone mockup in the hero is drawn in CSS — it renders a
miniature of the Verdure Kitchen build, stays sharp at any density and costs
zero image bytes. Now that the three builds exist, real WebP screenshots of
them would be more convincing than the gradient card art. Worth doing once
the photography above lands, not before.

### 13. A fourth and fifth market statistic
**Where:** `en/index.html`, market section, the `SLOT LEFT EMPTY ON PURPOSE`
comment

Three figures are live and each was checked against its primary source:

| Figure | Says | Source |
|---|---|---|
| 194,585 | Black-owned employer businesses in the US, 2022 | US Census Bureau Annual Business Survey, via Pew Research Center, Feb 2025 |
| 57% | Growth in that count, 2017→2022 (revenue +66% to $211.8bn) | same |
| 178,995 | People in Canada reporting Haitian origin, 2021 Census | Statistics Canada, 2021 Census of Population |

Two slots were left empty because no current figure could be verified:

- **Haitian population in the US.** The only Census-grade number that could
  be confirmed is from the 2009 American Community Survey (830,000 with
  Haitian ancestry) — too old to present as current. Later figures circulate
  widely but trace back to secondary sources. The Census changed how it
  collects detailed race data in 2020, so a newer official figure may now
  exist; it needs finding and checking before it goes on the page.
- **Dominican Republic small-business count.** No comparable primary source
  was located.

Do not fill these from a blog post or a statistics-aggregator site. Either a
primary source, or the slot stays empty.

### 14. The USD → Dominican peso rate — GONE (2026-09-07)
No exchange rate is maintained anywhere any more. The region selector was
removed from the offer page along with the "approx. RD$…" line it fed, so
`CONFIG.DOP_PER_USD` and the whole conversion went with it. Nothing to keep
current. If regional pricing ever returns it belongs in the internal
calculator, not on the public site.

---

## Deliberate choices you may want to overrule

Three places where the build brief and the accessibility floor pulled in
opposite directions. Each is documented in the code at the point of decision.

1. **The mango ramp.** `#E8590C` on the paper background is 3.43:1 — it clears
   WCAG AA for large text but fails for buttons and body-size text, and no
   lighter label colour can rescue it because the background is already
   near-white. So `#E8590C` carries display type, rules and icons; a darker
   step of the same hue carries button fills and small text. Same heat, same
   family, and the page passes AA everywhere. See the note in `tokens.css`.

2. **WhatsApp buttons use dark text.** White on `#25D366` is 1.9:1. Dark ink
   on the green is 10.2:1, and is how WhatsApp sets its own brand.

3. **The final CTA band is paper, not teal.** The brief lists teal-deep for it
   in §3.1 and paper-deep in §5.11. The footer directly below is teal-deep,
   and two dark bands back to back breaks the section rhythm the brief sets
   out — so it follows §5.11. One line in `en/index.html` reverses this.

4. **Step 5 of the offer flow is not gated.** Steps 2, 3 and 4 stay closed
   until you answer the question before them, as the brief specifies. The
   closing CTA does not — a visitor who answers nothing would otherwise reach
   the end of the page with no way to contact anyone. One attribute reverses
   it if you disagree.

Also: the flag emoji in the closing language line (§5.11) were dropped, since
the brief bans emoji elsewhere on the site. The three language links are
still there, each with the right `lang` and `hreflang`.

---

## Two judgement calls on the offer page worth a second look

**The value stack is gone (2026-09-07).** It used to read as 76–78% off in
the Caribbean versus 53% in the US, because the deliverable values were the
same in both regions while the price was not — a discount claim a competitor
could have complained about. Removed entirely along with the region selector,
so the concern is closed rather than mitigated. The deliverables are still
listed in full; they simply no longer carry standalone prices.

**The exit-intent popup now fires on the offer page.** When Phase 2 shipped it
did not — the markup had simply been left off that page, which I reported
wrongly at the time. It is there now, because the brief excludes the popup
only from `/thank-you`, `/privacy` and `/terms`.

The concern still stands: this is the page where someone is actively working
out a price, and interrupting that with a checklist download is the one place
a popup can cost a sale rather than save one. Adding `data-no-modal` to the
`<body>` of `en/offer.html` turns it off on this page alone. There is a
comment right above the modal saying so.


---

## Notes from Phase 3

**The three sample builds carry no business schema.** No `Restaurant`,
`HairSalon`, `Person` or `Service` markup, deliberately. They describe
businesses that do not exist, and marking them up as real would push a
fictional restaurant with opening hours and an address into Google's local
results. They keep `BreadcrumbList` only, and each page says in its own footer
that the business is fictional.

**The reviews on the Verdure Kitchen build are written, not collected.** They
are labelled as coming from Google inside a page that states it is a concept
build, which is the honest way to show the pattern. If that framing ever gets
lost — if the page is reused as a template for a real client — the quotes have
to go and be replaced with that client's verified reviews before any `Review`
schema is added.

**Two dev scripts live at the project root, outside the deploy folder.**
`serve-adsvio.py` runs a local preview that resolves clean URLs the way
Netlify does, so `/en/offer` works locally instead of 404ing.
`build-preview.py` inlines everything into one file for the review links.
Neither is part of the build and neither ships.


---

## Notes from Phase 4

**The service pages claim things you have to be able to do.** Each one
describes a specific standard — copy written before design, a page per
service, sub-two-second loads, a review system handed over so it runs without
you. That is all true of how the site you are reading was built, so it is
defensible. But it is now published, and the first client will hold you to it.
Read the five pages as commitments rather than as marketing, and tell me if
any of them promises something you would rather not be measured against.

**Two claims worth a second look:**

- *&ldquo;It loads in about a second on mobile data.&rdquo;* True of this
  site. It will be true of client sites built the same way, and untrue the
  moment anyone adds a heavy image library or a booking widget you do not
  control. Consider whether to soften it before it appears on a client's
  contract.
- *&ldquo;We refund a full month's work.&rdquo;* This now appears on eleven
  pages rather than one. Make sure the wording is identical everywhere and
  that you are comfortable with it — a guarantee stated eleven ways is a
  guarantee an unhappy client will read carefully.

**The Haitian-market page names real places.** Little Haiti, Flatbush,
Montréal-Nord, Mattapan, Delmas, Pétion-Ville — and uses *bouch-a-zòrèy* for
word of mouth. That specificity is the entire point of the page, and it is
also the part most likely to sound wrong if I have misjudged the register.
Worth a read alongside the Kreyòl page.

**Internal linking is wired as the brief specifies.** Every service page links
to the offer, two relevant sample builds, its matching guide and an audience
page. The guide links point at `/en/guides/…`, which arrives in Phase 5 — they
are dead until then. That is the only category of broken link on the site and
it closes next phase.


---

## Notes from Phase 5

**The blog index promises two posts a month.** That sentence is now published
on `/en/blog/`. Three posts exist. If the cadence is not going to happen,
change the line before launch rather than after — a blog whose last post is
four months old and whose index promises fortnightly is worse than one that
promises nothing.

Adding a post is deliberately simple: copy `en/blog/_post-template.html`,
which carries `noindex` and fourteen `REPLACE-ME` markers plus written
instructions at the top. The one rule that matters is in there — **a visible
FAQ if you use FAQPage schema.** Marking up questions that appear nowhere on
the page is a Google guidelines violation, not just a wasted opportunity.

**The guides publish specific numbers.** Price bands ($800–$1,500 Caribbean,
$1,800–$3,500 US), timelines ("category changes take two to six weeks"),
and claims about what competitors typically do. They are all defensible and
they are all now quotable back at you. Two worth a second look:

- The cost guide states Adsvio's own prices in the body, which is deliberate —
  a guide about pricing that hides its author's pricing reads badly. But it
  means the guide has to be edited whenever the offer changes.
- "Most of your competitors have not filled theirs in" appears in the Google
  Business Profile guide. True in our audits, and it is an assertion about
  other businesses. Comfortable, but worth knowing it is there.

**Dates.** Every guide and post carries `datePublished` and `dateModified` of
2026-08-30, because that is when they were written. When you edit one
substantively, update `dateModified` in three places: the JSON-LD, the
`article:modified_time` meta tag, and the visible "Updated" line. They are
adjacent in the file.

**hreflang points at French guide and blog URLs that do not exist yet.** Every
new page declares `/fr/guides/…` and `/fr/blog/…` alternates. Those 404 until
Phase 6 builds the French mirror. Either the mirror lands or those specific
hreflang lines come out — a reciprocal hreflang pointing at a 404 is worse
than no hreflang.

**Sitemap.** Thirteen new URLs need adding in Phase 6. The blog post template
must stay out of it.


---

## Notes from Phase 6

**The QA checklist is now a script.** `qa-check.py` at the project root runs
the brief's pre-handoff checklist — 32 automated checks covering concept-build
labelling, email exposure, address exposure, canonicals, hreflang, structured
data, title and description lengths, headings, forms, modal exclusions, the
no-JS offer page, consent wiring, the sitemap and the banned vocabulary.
**All 32 pass.** Run it before every deploy:

```
py -3 qa-check.py
```

It deliberately does not claim to have checked the things it cannot see. Those
are printed at the end as a manual list: Lighthouse, keyboard focus, reduced
motion, Google's Rich Results Test, the `?lang=` redirects (which only exist
once deployed) and Netlify form delivery.

**The sitemap is generated, not hand-written.** `build-sitemap.py` scans the
site, reads each page's own canonical and hreflang block, and skips anything
`noindex` or prefixed with an underscore. Run it after adding or removing a
page. 29 URLs currently.

**French is not built, and every reference to it has been removed.** That
includes the `hreflang="fr"` alternates, the FR pill in the language switcher,
and the French links in the closing language lines. A reciprocal hreflang or a
visible switcher button pointing at a 404 is worse than not having one.

The French line in the homepage's closing language row is now plain text
rather than a link — the same treatment Spanish already had — so the
four-language signal survives without a broken link behind it.

When `/fr/` is built, three things go back: the `hreflang="fr"` line in each
`<head>`, the FR pill in the switcher, and the six `lang = "fr"` redirect
targets in `netlify.toml`, which currently all point at the English page.

**No Content-Security-Policy.** Deliberate, and noted in `netlify.toml`. A CSP
tight enough to be worth having has to allow the TidyCal iframe, Google
Analytics and the Meta pixel — and getting it wrong silently breaks the
booking embed rather than showing an error. The right sequence is report-only
first, read the reports for a fortnight, then enforce.

**The street address now appears in exactly one place: the homepage JSON-LD.**
Privacy and terms both show the trading name and "Santo Domingo, Dominican
Republic" only — city level, on Pierre's instruction, tighter than the brief
asked for.

Two consequences worth knowing:

- **The JSON-LD is still public.** It sits in the homepage source and anyone
  viewing source can read it. It is there because `PostalAddress` is what
  tells Google where the business is, and removing it would weaken local
  search. If you want it gone too, say so — it costs some local SEO and it is
  a one-line deletion in `en/index.html`.
- **The privacy page now offers the address on request** rather than printing
  it, and the sentence that used to say "the postal address above" was
  rewritten to match. Clients still get the full registered address on their
  proposal and invoices, which is where a contracting party needs it.

---

## Notes from v2.4 (2026-09-09)

### The numbers that keep drifting — one place to check

`assets/js/site-config.js` is now the reference. It does **not** template the
site: there is no build step by design, so HTML cannot interpolate a constant.
What it gives you is an authoritative list, `window.ADSVIO` for scripts, and a
drift checker you can run on any page by adding `?configcheck=1` to the URL and
opening the browser console.

| Value | Current | Where it also lives, and must be changed by hand |
|---|---|---|
| Delivery timeline | **45 days** | ~36 HTML files, both OG images, every JSON-LD `description`, the guarantee, the nav and footer labels |
| Price floor | **$850** | the anchor sentence on `/en/offer`, `/fr/offer` and both homepages; `priceRange` in the homepage JSON-LD; two guides |
| Typical range | **$1,500–$5,000** | the same anchor sentences; `priceSpecification` in 12 JSON-LD blocks |
| Capacity | **2–3 a month** | the capacity block on both homepages |
| Booking URL | TidyCal | `qualifier.js` only — every page CTA goes to `/start` |
| WhatsApp | `wa.me/18295927303` | every header, footer, sticky bar and contact route |

**Three "30 day" strings are correct and must stay 30:** the post-launch tweak
window, the 30 days of starter content in the Storefront deliverables, and the
30-day notice / dispute periods in the terms. The drift checker knows about all
three and will not flag them.

### `tools/check-partials.py` — run this before every deploy

```
py -3 tools/check-partials.py
```

The header and footer are duplicated markup in 40 files and will stay that way,
because a real include needs either a build step (ruled out by the brief) or JS
injection (which would hand search engines a page with no navigation). What was
missing was not an include — it was any way to *notice* when the copies drift.
That is what this is. It normalises the parts that are supposed to differ and
fails on anything left over.

It found two real bugs the first time it ran: the privacy page was missing the
Cookie settings button that all 39 other pages had, and the French confirmation
page carried the full 20-link footer while the English one had a minimal bar.

### Exit modal — markup no longer ships

`EXIT_MODAL_ENABLED` is still `false` in `modal.js` and the code is untouched,
but the dialog markup is no longer inline in 25 pages. It is injected from
`modal.js` only when the flag is on. Previously only the JS was gated, so
"No spam. Unsubscribe anytime." and "No thanks, I'm good" still shipped in the
HTML of every page.

`en/index.html` keeps a **hidden, field-only stub form** at the bottom so
Netlify still registers `checklist`. Netlify detects forms by scanning deployed
HTML and would never find one inside a script string. The stub has no visible
copy. **Do not delete it** — without it, the first real submission after the
flag flips will 404.

### Pierre's manual to-do — cannot be done from the codebase

1. **Deploy.** Nothing in `adsvio-web/` has ever been deployed. The live site is
   still the old build in `adsvio-site OLD/`. This is the item everything else
   waits on.
2. **Force the preview re-scrape.** Even with new tags and new image URLs,
   WhatsApp serves Facebook's cached card until the source is re-scraped:
   - `developers.facebook.com/tools/debug/` → paste each URL → **Scrape Again**
   - `linkedin.com/post-inspector/` → same URLs
   - URLs: `/en/`, `/fr/`, `/en/offer`, `/fr/offer`, `/en/about`, `/en/work`,
     `/en/contact`
   - Then send yourself the link in WhatsApp and confirm it says 45.
3. **TidyCal booking fields.** `/start` now collects business type, current
   assets and location, so delete any TidyCal question that duplicates those —
   asking twice at the final step is where people quit. Leave only:
   - *What would success look like in 90 days?* — short text
   - *What budget range are you working with?* — Under $1,000 · $1,000–$2,500 ·
     $2,500–$5,000 · $5,000+ · Not sure yet — **optional, never required**
4. **Confirm Netlify Forms registered `qualifier` and `contact`** after the first
   deploy. Both are declared correctly; registration only happens on deploy.
5. **Run Lighthouse** on the deploy preview. It cannot run here — no headless
   Chrome in this environment.
