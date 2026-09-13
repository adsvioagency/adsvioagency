#!/usr/bin/env python3
"""Adsvio — header/footer drift check.

WHY THIS EXISTS INSTEAD OF A REAL INCLUDE
The site is static by explicit design: no framework, no build step, no server
templating. HTML has no native include, so there is no way to make 40 pages
literally share one header without either adding a build step (which the brief
rules out) or injecting the chrome from JavaScript (which would break the
no-JS contract and hand search engines a page with no navigation).

So the header and footer are, and will stay, duplicated markup. What was
actually missing was not an include — it was any way to NOTICE when the copies
drift, which is how the offer page kept its own booking link through two
updates while every other page was rewired.

This script is that. It normalises the per-page bits that are *supposed* to
differ (the current path, aria-current, hreflang, the active nav item) and
then compares what is left against a reference page. Anything that still
differs is real drift.

    py -3 tools/check-partials.py            # report
    py -3 tools/check-partials.py --verbose  # show the differing lines

Run it before every deploy. It is the guard rail, not the include.
"""
import pathlib, re, sys, difflib

BASE = pathlib.Path(__file__).resolve().parent.parent
VERBOSE = "--verbose" in sys.argv

# Pages with deliberately different chrome. The qualifier has no nav by design
# (§6.6 — nothing offering an exit but the intended one), the redirect stub has
# no chrome at all, and the three sample builds are standalone presentations of
# a fictional client's site, so they carry that client's bar and footer rather
# than ours. Excluding them is the point, not an oversight.
EXCLUDE = {"index.html", "404.html", "en/start.html", "fr/start.html",
           "en/thank-you-booking.html", "fr/thank-you-booking.html",
           "en/checklist.html", "en/blog/_post-template.html",
           "en/work/atelier-nord.html", "en/work/clarite-consulting.html",
           "en/work/verdure-kitchen.html",
           # Internal noindex tool. Carries the stripped qhead like the
           # qualifier does, and no footer — there is nothing to navigate to
           # from a tool that is not part of the public site.
           "en/image-lab.html"}

# The confirmation pages drop the header and carry a one-line legal bar rather
# than the full footer. Someone who has just converted does not need twenty
# links back into the site. Both languages must match each other, which is
# checked below rather than skipped.
MINIMAL_CHROME = {"en/thank-you.html", "fr/thank-you.html"}

REGIONS = {
    "header": (r"<header class=\"header\"[^>]*>", r"</header>"),
    "footer": (r"<footer class=\"footer\"[^>]*>", r"</footer>"),
}


def region(src, name):
    open_re, close_re = REGIONS[name]
    m = re.search(open_re, src)
    if not m:
        return None
    e = re.search(close_re, src[m.start():])
    if not e:
        return None
    return src[m.start(): m.start() + e.end()]


def normalise(block):
    """Blank out everything a page is entitled to differ on."""
    b = block
    b = re.sub(r"<!--.*?-->", "", b, flags=re.S)            # comments do not render
    b = re.sub(r'\s*aria-current="[^"]*"', "", b)           # active nav item
    b = re.sub(r'\s*(hreflang|lang)="[^"]*"', "", b)        # cross-language links
    b = re.sub(r'href="/(en|fr)/[^"]*"', 'href="~"', b)     # own-language paths
    b = re.sub(r'\s+', " ", b).strip()
    return b


def main():
    # node_modules arrived with the Netlify function's dependencies and is full
    # of vendored library docs. They are not our pages and must not be audited
    # as though a missing footer were drift.
    NOT_THE_SITE = {"node_modules", "netlify", ".netlify", ".git", "tools"}

    pages = []
    for f in sorted(BASE.rglob("*.html")):
        rel = f.relative_to(BASE).as_posix()
        if rel in EXCLUDE or NOT_THE_SITE & set(f.relative_to(BASE).parts):
            continue
        pages.append((rel, f.read_text(encoding="utf-8")))

    problems = 0
    for name in ("header", "footer"):
        # Compare each language family against its own reference page.
        for lang, ref_rel in (("en/", "en/index.html"), ("fr/", "fr/index.html")):
            ref_src = dict(pages).get(ref_rel)
            if ref_src is None:
                continue
            ref = region(ref_src, name)
            if ref is None:
                print("  ! %s has no %s" % (ref_rel, name)); problems += 1; continue
            ref_n = normalise(ref)

            for rel, src in pages:
                if not rel.startswith(lang) or rel == ref_rel:
                    continue
                if rel in MINIMAL_CHROME:
                    continue
                blk = region(src, name)
                if blk is None:
                    print("  ! %-46s missing %s" % (rel, name)); problems += 1; continue
                if normalise(blk) != ref_n:
                    print("  ! %-46s %s differs from %s" % (rel, name, ref_rel))
                    problems += 1
                    if VERBOSE:
                        a = normalise(blk).split(" ")
                        b = ref_n.split(" ")
                        for line in list(difflib.unified_diff(b, a, lineterm="", n=2))[2:20]:
                            print("        " + line)

    # The two minimal-chrome pages are exempt from the sitewide footer, but not
    # from each other — that mismatch is exactly how the languages drift apart.
    mins = [(r, s) for r, s in pages if r in MINIMAL_CHROME]
    if len(mins) == 2:
        a, b = [normalise(region(s, "footer") or "") for _, s in mins]
        # Compare structure, not words: the copy is translated, the shape is not.
        shape = lambda t: re.sub(r">[^<]+<", "><", t)
        if shape(a) != shape(b):
            print("  ! %s and %s have differently shaped minimal footers"
                  % (mins[0][0], mins[1][0]))
            problems += 1

    print()
    if problems:
        print("%d drift(s). The header and footer are duplicated markup by design —" % problems)
        print("fix the odd page out, or update every page if the reference changed.")
        return 1
    print("Header and footer are identical across every page, in both languages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
