# Adsvio organic and AI search implementation

## Current owner-review report: search and copy implementation

Date: 2026-09-29. Current pass baseline: `037e66e`. Status: local changes ready for owner review; nothing pushed or deployed. The earlier technical pass was already present at this baseline. Its historical report follows below and is superseded where this section records a later change.

### What changed and why

The business already had a functional static site, but several acquisition pages repeated older package assumptions, overstated Google ranking control, or offered little detail for professional firms and home service businesses. The current pass improves those explanations and their connections to the free Visibility Score. It does not add a redesign, CMS or new service claims.

- Prepared [the search architecture and research record](docs/SEARCH-ARCHITECTURE.md) before editing copy. It includes evidence, source links, target audiences, intent/keyword mapping, metadata strategy, conversion opportunities, cannibalization controls and new-page decisions. Public result sampling is qualitative, not volume or rank data.
- Updated 19 existing English pages: home, services overview, five service pages, two audience pages, the Haitian-business page, five guides, three articles and the blog index. Some guides are shorter because unsupported claims and repetition were removed; their useful sections, existing anchor IDs and article structure remain, with clearer answers and practical examples.
- Added three substantive pages: `/en/for/professional-services`, `/en/for/home-services`, `/en/south-florida`. They use the existing page components and cover distinct customer decisions. No duplicate city or single-industry landing-page set was added.
- Strengthened social media as a core commercial service: channel selection, client-supplied materials, approvals, production responsibilities, scope, relevant industry examples and meaningful inquiry measurement. The existing $250/month starting price remains. No on-site filming, guaranteed leads or included ad spend was invented.
- Improved website repair-versus-redesign guidance, profile eligibility and owner-verification responsibilities, realistic local search expectations, review requests, website cost comparisons, monthly content planning and website/social channel choices.
- Corrected the Haitian page's company-origin wording to distinguish Pierre's origin from Adsvio's Santo Domingo base. The new South Florida page explicitly says delivery is remote and there is no Florida office. Existing US calls/texts and Dominican WhatsApp remain separate.
- Updated titles, descriptions and social preview text to match each page's intent. Visible FAQs and JSON-LD answers agree. Service descriptions match the page; generic quote-based offers replace the old machine-readable two-package price ranges. New pages use WebPage, BreadcrumbList and visible FAQ data, referencing the established organization and website identities.
- Expanded contextual internal links between services, audiences and resources. The blog now links to all five guides. All 34 indexable URLs have an incoming link from another indexable page.
- Expanded the sitemap from 31 to 34 canonical URLs. Only the 19 changed existing pages and three new pages receive the September 29 lastmod. Article dateModified and visible updated dates reflect actual edits; datePublished stays unchanged. The XML no longer instructs maintainers to invoke an external legacy generator blindly.
- Strengthened the repository validators: visible FAQ/schema equivalence, same-site fragment destinations, incoming links, breadcrumbs inside JSON-LD graphs and protected documentation paths. The header/footer check now preserves ordinary link targets, catching a copied footer link that the previous normalization would have hidden.

### What stayed intact

The Mango & Ink styles, type, header/footer layout, navigation structure, homepage animated H1, 45-day offer page, guarantee text, testimonials and their attribution, concept projects and labels, About biography, French pages, forms, booking destinations, WhatsApp behavior, analytics/consent code and serverless functions are unchanged. No dependency, client script, font or image was added. Business facts in the existing organization identity were preserved. No awards, ratings, locations, clients or results were fabricated.

The authority/storefront buying contexts remain; revised pages explain that the scope follows diagnosis. New industry examples describe possible work, not Adsvio client history. Legal, medical and accounting content approval remains with the responsible professional; no compliance certification is claimed.

### Search and AI readiness

Public content is rendered in HTML, with canonical metadata, reciprocal alternates where translations actually exist, descriptive headings, working links and accurate structured data. Existing robots access remains open; no new crawler restriction was needed. Google and AI visibility are not guaranteed. FAQ schema is retained for consistency with visible content, not as a promised rich-result benefit.

No special AI text file, paid SEO tool, AI generation API, IndexNow integration or automatic submission was added. OAI-SearchBot/GPTBot policy remains as previously configured. Actual crawler-network access, WAF rules and indexing decisions require production evidence after release.

### Validation completed

- Existing parent-directory QA: **33/33 checks pass**. The metadata lengths meet the repository's conventions; those lengths are not presented as ranking factors.
- Enhanced SEO validator: **42 HTML pages, 34 sitemap URLs, zero errors**, including JSON-LD, FAQ alignment, canonical/alternate consistency, internal paths/fragments, incoming links and routing configuration. Two pre-existing hidden checklist PDF destinations remain explicit exclusions because the actual assets were not supplied.
- Enhanced header/footer checker: passes across English and French pages, including ordinary navigation destinations.
- Headless Chrome: **44 page/viewport checks** covering all 22 changed/new pages at 390px and 1440px. No detected horizontal overflow, broken loaded images or console/page errors. Main Score links and WhatsApp destinations were checked, FAQ panels opened, and mobile menus opened/closed. Screenshots for home, social service and the three new pages were saved outside the deployable repository in `../organic-review-2026-09-29/`.
- English/French qualifier: **four front-end flow checks** across mobile/desktop, including required-email validation, completed fields, intercepted form POST and booking redirect. The POST and destination were mocked locally. No actual lead, email or booking was created; production delivery is not certified by these tests.
- Shared design assets, forms, offer pages, French pages, testimonials and concept disclosures checked against the baseline. Git whitespace checks passed. No site build step exists for this static site; no dependency install or production deploy was performed.

The first browser attempt stopped because the test needed to dismiss the French consent banner. After using its normal Decline control, the completed run passed. This was a test interaction issue, not a site change. Field Core Web Vitals, Lighthouse scores, full assistive-technology testing and live structured-result eligibility remain unmeasured. Source and viewport checks do not establish those results.

### Owner actions after review

1. Review the new audience/regional copy and revised commercial pages, then approve any GitHub push/deployment separately. No permission for publishing is assumed.
2. After release, verify the 34 canonical URLs, three new URLs, real redirects and protected-file 404s. Check HTTPS/non-www handling and sitemap/robots. Existing `.html` aliases and language-query canonicalization remain; broad redirect changes were deferred to avoid loops or attribution loss.
3. In Google Search Console, inspect the new pages and priority service pages, compare the selected canonical, and obtain example URLs for the reported indexing exclusions. The supplied aggregate coverage export cannot identify each affected page. The sitemap is already submitted; confirm its next successful read.
4. Create/verify Bing Webmaster Tools and submit the sitemap. Bing Webmaster Tools is Microsoft's search visibility and indexing console; it does not require changing the website design.
5. Create a GA4 property if measurement is wanted, then supply the real measurement ID. Before activation, resolve consent withdrawal/event definitions and attribution across intermediate pages. Treat button clicks and qualifier completion as steps, not confirmed bookings. Keep Meta inactive unless intentionally configured.
6. Confirm the checklist PDFs and email fulfillment before exposing their download links. Test real Netlify form delivery and booking completion only as a deliberate release check.
7. For Google Business Profile/Bing Places, confirm actual in-person eligibility and current operating details. A remote service market does not justify a new office listing. Review actual crawler access/logs and obtain real performance measurements after deployment.

### Monitoring and next content decisions

Use [the prioritized keyword tracking list](docs/KEYWORD-TRACKING.md), grouped by all 16 requested service, industry, geography and AI-search categories. Monitor relevant nonbranded impressions/clicks, destination-page intent, qualified Score requests, conversations and clients. AI referral data is incomplete and manual answer checks are observations, not durable ranking measurements.

Next priorities: permissioned real Scorecard examples; actual customer questions and case studies with evidence; improve pages receiving relevant impressions but weak inquiries. Consider a dedicated industry page only after unique expertise, inquiries or proof justify it. A future multilingual planning guide can support language capabilities without adding invented translations. Continue to keep founder, technical implementation and tools in proportion to the customer's buying decision.

---

## Historical technical-pass report (before the current copy work)

Date: 2026-09-29. Earlier baseline commit: `8f08459`. The following records the earlier technical pass only. Its 31-URL counts and statements about unchanged visible copy do not describe the current pass above.

## Baseline before changes

Static HTML, shared CSS and vanilla JavaScript, deployed by Netlify with no site build step. An existing image-generation function is unrelated to this work and will not be invoked or changed. The working tree was clean.

The previous live audit verified all 31 sitemap pages returned 200, had matching canonicals, and were indexable. Local HTML has English/French reciprocal alternates where translations actually exist. Existing JSON-LD parses. The existing 33 checks and header/footer check passed. Sitemap and robots are already present. Content includes five service pages, a services overview, two audience pages, five guides, three articles, and three clearly disclosed concept projects. Text and navigation are available without JavaScript.

The Search Console coverage export ends September 20: 25 indexed and 20 excluded URLs. The latter include 9 discovered/not indexed, 2 crawled/not indexed, 4 redirects, 2 noindex, 2 canonical alternates and 1 not found. URL-level examples were not supplied. The September 25 screenshot shows a successful sitemap read and 31 discovered pages. These are different populations and dates.

Performance export: June 24 to September 23, 8 clicks and 98 impressions. Most clicks are attributed to historical home-page variants. Query data is sparse and does not establish demand or rankings for the proposed regional topics. Breadcrumb export ends September 23 with 17 valid items and 0 invalid. Correcting breadcrumb destinations is a semantic improvement, not a claim that Google reports invalid markup.

## Confirmed gaps and implementation scope

- Public working documents and checking scripts need forced 404 rules, including this report.
- Legacy services routes should point to the existing overview, and service JSON-LD breadcrumbs should agree with visible breadcrumbs.
- Add a stable WebSite identity and verified logo/contact channels to the existing organization. Preserve US calls/texts and Dominican WhatsApp as separate channels. Align the founder reference with the existing About-page identity; do not change the biography.
- Existing sitemap generation and primary QA depend on files outside the repository. Add a portable repository-contained SEO validator, without a new framework or build dependency.
- Keep correct robots, sitemap membership, canonicals, titles, descriptions, language structure and visible content intact.

## Unverified or deliberately deferred

Google-selected canonical and exclusion reasons for individual URLs require URL Inspection or example exports. Actual crawler-network access is unverified; successful user-agent probes are not crawler logs. Field Core Web Vitals and Lighthouse remain unmeasured (the earlier PageSpeed request returned 429). No form submissions, bookings, email sends or image-generation requests will be made in this task.

Both phone numbers are owner-confirmed. The previous phone inconsistency finding is resolved by that clarification, not by deleting a number. Existing street address, opening hours and social links are retained, not newly independently verified. No location, client, review, rating, office or performance claim will be added.

The checklist PDF is missing locally and the expected public asset returned 404; its hidden download link and intentional noindex remain. Email fulfillment must be verified separately. GA4 and Meta IDs are empty; measurement is prepared but inactive.

## Changes implemented

1. `netlify.toml`: forced 404 responses for working documents, this report, repository instructions, tools, reference/document directories and the unpublished blog template. Existing source/dependency protections remain. Root Markdown receives an additional noindex header. This protects known paths after deployment; it is not a guarantee that arbitrary future files in the publish root will be safe. Review every new deployable file.
2. `netlify.toml`: all six legacy `/services` and `/services.html` rules, including English/French query variants, now target `/en/services/`. There is no French services page to invent.
3. Five individual `en/services/*.html` pages: structured breadcrumbs now use the actual services overview, matching visible navigation. No visible links or copy changed.
4. `en/index.html`: verified existing logo and two owner-confirmed contact channels added to the organization. Founder reference uses the existing About-page ID. No biography or contact button changed.
5. `en/index.html`, `fr/index.html`, `en/services/index.html`: stable `#website` identity with organization publisher; French and services WebPage nodes reference it. Website content languages are en/fr, distinct from the business's four supported languages.
6. `assets/js/site-config.js`: explicitly distinguishes the US phone from the Dominican WhatsApp phone. Existing booking and WhatsApp destinations are untouched.
7. Three `en/work/*.html` demos: existing build wrapper becomes a native main landmark with the exact same class, ID and language attributes. Disclosures and styling remain intact.
8. `tools/check-seo.py` and `package.json`: repository-contained, read-only QA checks for sitemap membership, reciprocal alternates, canonical identity, JSON-LD syntax, breadcrumb destinations, internal links, image alt attributes, landmarks and protected-file rules. Python 3.11+; no installed package required. Run `npm run seo` on Windows or `python3 tools/check-seo.py` elsewhere. `npm run partials` remains available. The older parent-directory QA script is unchanged and was also run.

## Crawlability, sitemap and canonical strategy

`robots.txt` continues to allow public crawling and point to the 31-URL production sitemap. No crawler whitelist or training-policy change was necessary. `OAI-SearchBot` is a search crawler; GPTBot is a separate training control. Actual bot-origin access requires production logs, not merely a spoofed user agent.

Sitemap membership and alternate links are already correct and remain unchanged. No confirmation pages, qualifier pages, missing-PDF landing page, image lab, templates or working documents belong in it. The current XML comment references an older generator located outside this repository. The new validator verifies the checked-in XML; update the XML deliberately when publishing content, rather than invoking that external generator blindly or refreshing every lastmod without a meaningful update.

Existing HTTPS non-www canonicals and self-canonical French pages remain. Directory hubs use trailing slashes; leaf pages use extensionless paths. The `.html` alias and retained `lang` query parameter already canonicalize to the clean page. Further edge normalization is deferred: Netlify normalizes paths and carries query parameters, and broad forced rules can cause loops or discard campaign attribution. Do not strip all queries, especially `utm_*`, click IDs, or `from=checklist`. Confirm HTTP/www handling on the eventual deployed configuration.

## Content, local relevance and internal links

Existing guides, service pages, audience pages and the Haitian-business page already form a useful connected structure. No new CMS, resource directory or articles are necessary for the technical pass. Existing visible internal links are preserved; service breadcrumbs and legacy entry points now agree with the hub.

Prioritized editorial roadmap, for later owner review:

| Priority | Action | Existing destination / purpose |
|---|---|---|
| 1 | Improve the existing Google Maps troubleshooting article with a verified diagnostic sequence and original examples | `/en/blog/business-not-showing-on-google-maps`; support the Google Business Profile service. Avoid a duplicate article. |
| 2 | Add a real, permissioned anonymized or named Visibility Score example with the five scoring areas and practical fixes | Existing Visibility Score explanations and relevant guides. Clearly distinguish illustrative examples from measured client results. |
| 3 | Refresh website cost and website-versus-Instagram guides with owner experience and scope examples | Existing guides and website-design service; retain diagnosis-first pricing. |
| 4 | Draft one useful South Florida service-business resource covering bilingual customer journeys and legitimate service-area visibility | Link to local SEO, the Haitian/Caribbean resource and the free score. Describe remote service coverage, never a local office. No separate near-identical city pages. |
| 5 | Draft a multilingual website planning resource | Support actual language capabilities without claiming every Adsvio page has four translations. |

Haitian/Caribbean relevance remains part of the agency's broad small-business positioning, not an exclusive eligibility requirement. South Florida, Palm Beach, Broward and Miami-Dade are potential service markets, not verified office locations. No new local address, coordinates, rating, testimonial or case study was introduced.

## Performance, images and accessibility

Existing local fonts use font-display swap; portrait assets include responsive WebP variants; scripts are deferred and primary content is server-delivered HTML. No new client dependency, CSS, font, generated image, API or request was added. JSON-LD adds a small amount of HTML only. Main landmarks improve demo-page semantics without altering styling. No speculative unused-CSS pruning or image regeneration was performed. Field LCP/CLS/INP cannot be inferred from source inspection. Lighthouse and field performance are not claimed as passing.

## AI search, IndexNow and llms.txt

Normal crawlable HTML, clear entities and useful existing answers remain the foundation. No AI recommendation or indexing guarantee is made. No API was invoked to perform optimization, and the existing Gemini function was untouched and not called.

IndexNow is deferred to a manual post-release workflow: create/own a key, host the corresponding verification text file, then submit only genuinely changed canonical URLs through a supporting tool. That submission uses an external protocol, so no automatic requests, key, service or deployment hook were introduced under the no-API constraint. Sitemap submission in Bing Webmaster Tools is sufficient to begin.

No llms.txt was added. It is optional and experimental, not required by ChatGPT Search, and is not a substitute for the site's existing sitemap, HTML and structured data. Maintaining an extra manual summary offers limited immediate benefit here. Existing FAQ content and markup remain, but no Google FAQ rich-result benefit is promised.

## Measurement readiness

GA4 and Meta remain inactive until genuine IDs are supplied. No tracking behavior or consent behavior was changed. The existing event names describe button clicks, qualifier progress and form-related actions; a calendar click or qualifier completion must not be reported as a confirmed booking. The checklist thank-you code also emits a requested-download event, which must not be confused with successful PDF delivery. Form error handling, consent withdrawal behavior and attribution across intermediate pages deserve a focused follow-up before analytics activation; they were not rewritten in this low-risk SEO pass.

After GA4 setup, use Traffic acquisition and session source/medium to examine referrals from actual observed ChatGPT, Bing, Perplexity, Gemini and Copilot domains. Missing referrers cannot reliably be recovered; direct traffic is not proof of an AI referral. Record an initial Search Console baseline and compare priority pages/queries over subsequent weeks, separating branded from service searches. Do not interpret the small initial sample as established regional ranking performance.

## Remaining owner actions

- Approve the reviewed local changes before any GitHub push or deployment.
- Supply Search Console example URL exports for discovered/not indexed, crawled/not indexed and not found. The aggregate report cannot identify affected pages.
- Create/verify Bing Webmaster Tools and submit `https://adsvioagency.com/sitemap.xml`. Google already has a successfully submitted sitemap; do not repeat verification unnecessarily.
- If measurement is wanted, create a GA4 property and provide its actual measurement ID. Validate consent and event definitions before activation.
- Confirm the checklist email fulfillment and provide the final files before exposing download links or indexing its landing page.
- If pursuing Google Business Profile/Bing Places, confirm actual in-person eligibility and real operating details first. Serving a region remotely is not evidence of a qualifying office there.

## Post-approval release verification

Verify forced 404s for each protected working path, service redirects (including query variants), all 31 canonical URLs, sitemap/robots access, real form delivery and booking completion after an approved release. Run Google's Rich Results Test on the home/service/guide examples. Inspect priority pages in Search Console and request indexing only where needed. Recheck mobile behavior and obtain real performance measurements. Netlify production routing cannot be certified by the Python rule checks alone.

The standalone noindex image lab remains publicly reachable as before. Noindex is not authentication. Protecting that existing application and its paid function needs a separate access-control decision; it was not silently disabled or rebuilt as part of this SEO task.

## References

- [Netlify redirect options](https://docs.netlify.com/manage/routing/redirects/redirect-options/)
- [Google AI search guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [OpenAI crawler controls](https://developers.openai.com/api/docs/bots)
- [Bing IndexNow setup](https://www.bing.com/indexnow/getstarted)
- [Google search documentation updates, including FAQ retirement](https://developers.google.com/search/updates)

## Validation and diff review

- Repository SEO validator: 39 HTML pages, 31 sitemap URLs, zero errors. Two pre-existing hidden PDF targets are explicitly reported as known exclusions, not silently represented as delivered files. The noindex image lab is not required to declare a canonical.
- Existing parent-directory QA: 33/33 checks passed.
- Existing header/footer consistency checker: passed for both languages.
- JavaScript syntax check on the changed configuration: passed.
- Git whitespace/diff check: passed. Reviewed all changed source files and the two new files.
- Source comparison against HEAD: modified HTML differs only in JSON-LD and the three demo main landmarks. Visible copy, styles, forms, link destinations, testimonials, guarantees and disclosures are unchanged.
- Headless Chrome comparison against HEAD: English/French home and qualifier pages plus all three concept demos at 390px and 1440px (14 comparisons). Visible text, links and measured heading/button geometry matched; no horizontal overflow. Requests stayed local and no forms were submitted. The initial wider Edge run was stopped without a completed result; only the completed Chrome comparisons support this statement.
- Organization contact channels, founder identity reference and identical English/French WebSite identity verified independently. Every root Markdown document has an explicit forced 404 rule.
- No site build command exists or is needed for this static site. No dependencies were installed. Production routing, real submissions and booking/email completion remain release checks, not claimed local test results.
