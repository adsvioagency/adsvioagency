#!/usr/bin/env python3
"""Read-only SEO regression checks. Run with Python 3.11+ from any directory."""
import json
import re
import sys
import tomllib
import xml.etree.ElementTree as ET
from collections import Counter
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://adsvioagency.com"
errors = []


def check(ok, message):
    if not ok:
        errors.append(message)


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.tags = []
        self.feed(path.read_text(encoding="utf-8"))
        self.meta = {a.get("name", a.get("property")): a.get("content", "")
                     for t, a in self.tags if t == "meta"}
        self.canon = [a.get("href") for t, a in self.tags
                      if t == "link" and a.get("rel") == "canonical"]
        self.alternates = {a["hreflang"]: a.get("href") for t, a in self.tags
                           if t == "link" and "hreflang" in a}
        self.indexable = "noindex" not in self.meta.get("robots", "")

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def local_file(path):
    p = ROOT / path.lstrip("/")
    return next((q for q in (p, p.with_suffix(".html"), p / "index.html")
                 if q.is_file()), None)


def plain(value):
    """Compare rendered wording, allowing markup and insignificant whitespace."""
    rendered = unescape(re.sub(r"<[^>]+>", " ", value))
    rendered = rendered.translate(str.maketrans({"’": "'", "‘": "'", "“": '"', "”": '"'}))
    return re.sub(r"\s+", "", rendered)


def schema_nodes(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from schema_nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from schema_nodes(child)


pages = [Page(p) for lang in ("en", "fr") for p in sorted((ROOT / lang).rglob("*.html"))
         if not p.name.startswith("_")]
indexable = {p.canon[0]: p for p in pages if p.indexable and p.canon}
sitemap = ET.parse(ROOT / "sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locations = [e.text for e in sitemap.findall(".//s:loc", ns)]
check(len(locations) == len(set(locations)), "Duplicate sitemap URLs")
check(set(locations) == set(indexable), "Sitemap membership differs from indexable pages")
descriptions = Counter(p.meta.get("description") for p in indexable.values())
check(all(n == 1 for n in descriptions.values()), "Duplicate indexable descriptions")
incoming = Counter()

for page in pages:
    rel = page.path.relative_to(ROOT).as_posix()
    source = re.sub(r"<!--.*?-->", "", page.path.read_text(encoding="utf-8"), flags=re.S)
    expected = ORIGIN + "/" + (rel[:-10] if rel.endswith("index.html") else rel[:-5])
    if page.indexable or page.canon:
        check(page.canon == [expected], f"{rel}: canonical mismatch")
    check(sum(t == "h1" for t, a in page.tags) == 1, f"{rel}: H1 count")
    check(sum(t == "main" for t, a in page.tags) == 1, f"{rel}: main landmark count")
    check(bool(page.meta.get("description")), f"{rel}: missing description")
    for lang, url in page.alternates.items():
        if page.indexable:
            check(url in indexable, f"{rel}: alternate is not indexable: {url}")
            if lang != "x-default" and url in indexable:
                check(expected in indexable[url].alternates.values(), f"{rel}: nonreciprocal alternate")
    for tag, attrs in page.tags:
        if tag == "img":
            check("alt" in attrs, f"{rel}: image without alt")
        url = attrs.get("src", "") if tag in ("img", "script") else attrs.get("href", "") if tag in ("a", "link") else ""
        if url.startswith("/") and not url.startswith("//"):
            path = urlsplit(url).path
            # Known pre-existing hidden download links, pending owner-supplied files.
            if path in ("/assets/downloads/adsvio-client-ready-checklist.pdf",
                        "/assets/downloads/adsvio-liste-verification.pdf"):
                continue
            check(local_file(path) is not None, f"{rel}: missing internal target {path}")
            if tag == "a" and page.indexable and ORIGIN + path in indexable and ORIGIN + path != expected:
                incoming[ORIGIN + path] += 1
        if tag == "a" and (url.startswith("#") or (url.startswith("/") and not url.startswith("//"))):
            parts = urlsplit(url)
            target = local_file(parts.path) if parts.path else page.path
            if parts.fragment and target and target.suffix == ".html":
                ids = {a.get("id") for t, a in Page(target).tags if "id" in a}
                check(parts.fragment in ids, f"{rel}: missing fragment target {url}")
    for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', source, re.S):
        try:
            data = json.loads(block)
        except ValueError:
            errors.append(f"{rel}: invalid JSON-LD")
            continue
        check(not re.search(r'"@type"\s*:\s*"(?:Review|AggregateRating)"', block), f"{rel}: unapproved review schema")
        for node in schema_nodes(data):
            if node.get("@type") == "BreadcrumbList":
                for item in node["itemListElement"]:
                    check(item["item"] in indexable, f"{rel}: breadcrumb target not indexable")
                    if item.get("name") == "Services":
                        check(item["item"] == ORIGIN + "/en/services/", f"{rel}: stale services breadcrumb")
            if node.get("@type") == "FAQPage":
                visible = []
                for detail in re.findall(r'<details class="faq__item[^>]*>(.*?)</details>', source, re.S):
                    question = re.search(r"<summary[^>]*>(.*?)</summary>", detail, re.S)
                    answer = re.search(r'<div class="faq__a">(.*?)</div>', detail, re.S)
                    if question and answer:
                        visible.append((plain(question[1]), plain(answer[1])))
                marked = [(plain(q["name"]), plain(q["acceptedAnswer"]["text"]))
                          for q in node.get("mainEntity", [])]
                check(marked == visible, f"{rel}: FAQ schema differs from visible answers")

for url in indexable:
    check(incoming[url] > 0, f"{url}: no incoming link from another indexable page")

config = tomllib.loads((ROOT / "netlify.toml").read_text(encoding="utf-8"))
rules = config["redirects"]
for path in ("/PLACEHOLDERS.md", "/SHOT-LIST.md", "/SEO-AI-DISCOVERABILITY.md",
             "/tools/check-seo.py", "/docs/SEARCH-ARCHITECTURE.md", "/docs/KEYWORD-TRACKING.md",
             "/en/blog/_post-template", "/en/blog/_post-template.html"):
    rule = next((r for r in rules if r["from"] == path or
                 (r["from"].endswith("*") and path.startswith(r["from"][:-1]))), {})
    check(rule.get("status") == 404 and rule.get("force") is True,
          f"Internal file not protected by first matching rule: {path}")
for rule in rules:
    if rule["from"] in ("/services", "/services.html"):
        check(rule["to"] == "/en/services/" and rule.get("status") == 301,
              "Legacy services redirect does not target overview")
for node in sitemap.findall("s:url", ns):
    url = node.find("s:loc", ns).text
    alts = {x.attrib["hreflang"]: x.attrib["href"] for x in node
            if x.tag == "{http://www.w3.org/1999/xhtml}link"}
    check(alts == indexable[url].alternates, f"{url}: sitemap/HTML alternate mismatch")
robots = (ROOT / "robots.txt").read_text()
check("Sitemap: " + ORIGIN + "/sitemap.xml" in robots, "Sitemap missing from robots")
check("Disallow: /" not in robots, "Review crawler access restriction")
print(f"Checked {len(pages)} pages, {len(locations)} sitemap URLs, JSON-LD, links, alternates and routing configuration.")
print("Known exclusions: two hidden PDF links awaiting actual checklist assets.")
for error in errors:
    print("FAIL:", error)
print(f"Result: {len(errors)} errors")
sys.exit(bool(errors))
