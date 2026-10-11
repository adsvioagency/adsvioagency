"""Maintain static localized HTML from reviewed, checked-in editorial catalogs.

No API, framework or build dependency. Run manually after updating English and
catalogs; unknown copy fails closed rather than emitting an English fallback.
"""
from pathlib import Path
from html import unescape, escape
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'docs/i18n/source.json'
ORIGIN = 'https://adsvioagency.com'
LANGS = ('en', 'es', 'fr')

def norm(s):
    return re.sub(r'\s+', ' ', unescape(s)).strip()

def pages():
    return [p for p in sorted((ROOT / 'en').rglob('*.html'))
            if not p.name.startswith('_') and p.name != 'image-lab.html']

def route(p, lang):
    rel = p.relative_to(ROOT / 'en').as_posix()
    return '/' + lang + '/' + (rel[:-10] if rel.endswith('index.html') else rel[:-5])

def catalog():
    units = json.loads(SOURCE.read_text(encoding='utf-8'))['strings']
    out = {}
    for p in sorted(SOURCE.parent.glob('*.tsv')):
        for line in p.read_text(encoding='utf-8').splitlines():
            if not line or line.startswith('#'): continue
            num, es, fr = line.split('|', 2)
            key = units[int(num)]
            if key in out: raise ValueError(f'Duplicate editorial unit {num}')
            out[key] = {'es': es, 'fr': fr}
    out.update(json.loads((SOURCE.parent / 'schema.json').read_text(encoding='utf-8')))
    return out

def translate(src, lang, words, missing):
    def text(s):
        key = norm(s)
        if not key or not re.search('[A-Za-zÀ-ÿ]', key): return s
        if key not in words:
            missing.add(key)
            return s
        leading = re.match(r'^\s*', s)[0]
        trailing = re.search(r'\s*$', s)[0]
        return leading + escape(words[key][lang], quote=False) + trailing

    # Never touch code, CSS or comments. Translate text and accessible strings
    # only, maintaining existing markup, IDs, event hooks and form field names.
    parts = re.split(r'(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>)', src, flags=re.S)
    for i in range(0, len(parts), 2):
        part = parts[i]
        part = re.sub(r'>([^<>]+)<', lambda m: '>' + text(m[1]) + '<', part)
        def attr(m):
            return m[1] + '="' + escape(unescape(text(m[2])), quote=True) + '"'
        part = re.sub(r'\b(alt|aria-label|placeholder|title)="([^"]*)"', attr, part)
        def meta(m):
            tag = m[0]
            if re.search(r'(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"', tag):
                tag = re.sub(r'content="([^"]*)"', lambda x: 'content="' + escape(unescape(text(x[1])), quote=True) + '"', tag)
            return tag
        parts[i] = re.sub(r'<meta\b[^>]*>', meta, part)
    result = ''.join(parts)
    result = result.replace('lang="en"', 'lang="' + lang + '"')
    # Same slugs across languages. External destinations remain untouched.
    result = result.replace('/en/', '/' + lang + '/')
    result = result.replace('en_US', {'es': 'es_DO', 'fr': 'fr_CA'}[lang])
    return result

def languages(src, p, lang):
    src = re.sub(r'<script src="/assets/js/language.js" defer></script>\s*', '', src)
    src = re.sub(r'<link\b[^>]*hreflang="[^"]+"[^>]*>\s*', '', src)
    alts = '\n'.join(f'<link rel="alternate" hreflang="{l}" href="{ORIGIN}{route(p,l)}">' for l in LANGS)
    alts += f'\n<link rel="alternate" hreflang="x-default" href="{ORIGIN}{route(p,"en")}">'
    src = re.sub(r'(<link rel="canonical"[^>]*>)', lambda m: m[0] + '\n' + alts, src, count=1)
    src = re.sub(r'<meta property="og:locale:alternate"[^>]*>\s*', '', src)
    locales = {'en': 'en_US', 'es': 'es_DO', 'fr': 'fr_CA'}
    src = re.sub(r'(<meta property="og:locale"[^>]*>)', lambda m: m[0] + '\n' + '\n'.join(
        f'<meta property="og:locale:alternate" content="{locales[l]}">' for l in LANGS if l != lang), src, count=1)
    def switch(m):
        label = {'en': 'Website language', 'es': 'Idioma del sitio', 'fr': 'Langue du site'}[lang]
        links = '\n'.join(f'        <a class="langswitch__item" href="{route(p,l)}"'
            + (' aria-current="true"' if l == lang else '')
            + f' hreflang="{l}" lang="{l}" data-language="{l}">{l.upper()}</a>' for l in LANGS)
        return f'<div class="langswitch" role="group" aria-label="{label}">\n{links}\n      </div>'
    src = re.sub(r'<div class="langswitch"[^>]*>.*?</div>', switch, src, flags=re.S)
    if 'data-language=' not in src:
        # Confirmation pages, checklist and standalone concept builds retain
        # their own chrome but still provide an equivalent-page switch.
        src = src.replace('<body', '<body', 1)
        pos = re.search(r'<body[^>]*>', src).end()
        src = src[:pos] + '\n<div class="locale-bar">' + switch(None) + '</div>\n' + src[pos:]
    src = src.replace('<script src="/assets/js/main.js"', '<script src="/assets/js/language.js" defer></script>\n<script src="/assets/js/main.js"')
    return src

def schemas(src, lang, words, missing):
    def plain(s):
        return norm(re.sub(r'<[^>]*>', ' ', s))
    def walk(data):
        if isinstance(data, list): return [walk(v) for v in data]
        if not isinstance(data, dict): return data
        if data.get('@type') == 'FAQPage':
            faqs = []
            for detail in re.findall(r'<details class="faq__item[^>]*>(.*?)</details>', src, re.S):
                q = re.search(r'<summary[^>]*>(.*?)</summary>', detail, re.S)
                a = re.search(r'<div class="faq__a">(.*?)</div>', detail, re.S)
                if q and a:
                    faqs.append({'@type': 'Question', 'name': plain(q[1]),
                        'acceptedAnswer': {'@type': 'Answer', 'text': plain(a[1])}})
            data['mainEntity'] = faqs
        human = {'name','headline','description','slogan','jobTitle','contactType','serviceType','articleSection','alternativeHeadline'}
        for k,v in list(data.items()):
            if k in human and isinstance(v, str) and lang != 'en':
                key = norm(v)
                if key in words: data[k] = words[key][lang]
                else: missing.add(key)
            elif k in ('knowsLanguage','availableLanguage'):
                data[k] = list(LANGS)
            elif k == 'inLanguage':
                data[k] = list(LANGS) if isinstance(v,list) else {'en':'en-US','es':'es-DO','fr':'fr-CA'}[lang]
            elif k != 'mainEntity' or data.get('@type') != 'FAQPage':
                data[k] = walk(v)
        return data
    def block(m):
        data = walk(json.loads(m[2]))
        return m[1] + '\n' + json.dumps(data,ensure_ascii=False,indent=2) + '\n</script>'
    return re.sub(r'(<script[^>]*type="application/ld\+json"[^>]*>)(.*?)</script>', block, src, flags=re.S)

def refinements(src, p, lang):
    src = src.replace('<p class="hp">','<p class="hp" hidden aria-hidden="true">')
    # Exactly three active site languages. Spoken service languages in factual
    # business descriptions remain distinct from available website versions.
    src = re.sub(r'<button[^>]*data-lp-lang="kr".*?</button>\s*', '', src, flags=re.S)
    src = re.sub(r'<span lang="ht">.*?</span>', '', src, flags=re.S)
    src = src.replace('EN &middot; FR &middot; ES &middot; Kreyòl','EN &middot; ES &middot; FR')
    if p.name == 'haitian-business-marketing.html':
        if lang == 'en':
            src = src.replace('class="related__card reveal" href="/fr/"',
                'class="related__card reveal" href="/fr/haitian-business-marketing" lang="fr" data-language="fr"')
        else:
            src = re.sub(r'<a class="related__card reveal" href="/fr/[^"]*"[^>]*>',
                '<a class="related__card reveal" href="/' + lang + '/offer">',src)
            src = src.replace('href="/fr/" hreflang="fr" lang="fr"',
                'href="/' + lang + '/offer" hreflang="'+lang+'" lang="'+lang+'"')
    # Make the existing footer language hints actual language choices with
    # accurate labels, no silent switch to another language's homepage.
    labels={'en':'English','es':'Español','fr':'Français'}
    choices=' · '.join(f'<a href="/{l}/start" lang="{l}" data-language="{l}">{labels[l]}</a>' for l in LANGS)
    src=re.sub(r'<p class="finalcta__langs[^>]*>.*?</p>',
        '<p class="finalcta__langs reveal">'+choices+'</p>', src, flags=re.S)
    if p.name=='clarite-consulting.html':
        links=''.join(f'<a href="{route(p,l)}" lang="{l}" data-language="{l}"'
            + (' aria-current="true"' if l==lang else '') + f'>{l.upper()}</a>' for l in LANGS)
        src=re.sub(r'<div class="cc__lang">.*?</div>',
            '<div class="cc__lang">'+links+'</div>',src,flags=re.S)
    if p.name in ('atelier-nord.html','clarite-consulting.html'):
        # These samples have their own scoped, inline styles. Add only mobile
        # copy-fit fixes after that sheet so the fictional brand remains intact.
        src=re.sub(r'/\* localized-mobile-fit \*/.*?/\* end-localized-mobile-fit \*/\s*','',src,flags=re.S)
        src=src.replace('</style>', '''/* localized-mobile-fit */
@media (max-width: 600px) {
  .an .an__barin, .cc .cc__barin { gap: 8px; padding-inline: 16px; }
  .an .an__bar .an__logo { font-size: 17px; letter-spacing: .1em; }
  .cc .cc__bar .cc__logo { font-size: 20px; }
  .cc .cc__lang { display: none; }
  .an .an__bar .an__btn, .cc .cc__bar .cc__btn { padding-inline: 12px; flex-shrink: 0; }
  .an h2 { font-size: 28px; overflow-wrap: anywhere; }
  .an .an__section--tint[style] { padding: 20px !important; }
  .an .an__svc { gap: 8px; }
  .an .an__svcname { min-width: 0; overflow-wrap: anywhere; }
  .an .an__svcfill { display: none; }
  .an .an__svcprice { margin-left: auto; }
  .cc .cc__offer { padding: 20px; }
}
/* end-localized-mobile-fit */
</style>''',1)
    if lang != 'en':
        # Keep the localized headline in its own language. The main headline
        # remains HTML; reveal animations and the original English proof remain.
        src = re.sub(r'<div class="langproof-pills".*?</div>', '', src, flags=re.S)
        src = src.replace('data-langproof', 'data-localized-headline')
    if p.name == 'thank-you.html':
        src = re.sub(r'<script>.*?</script>', '<script src="/assets/js/confirmation.js" defer></script>', src, flags=re.S)
        src = src.replace('/assets/downloads/adsvio-client-ready-checklist.pdf',
            {'en':'/assets/downloads/adsvio-client-ready-checklist.pdf',
             'es':'/assets/downloads/adsvio-lista-verificacion.pdf',
             'fr':'/assets/downloads/adsvio-liste-verification.pdf'}[lang])
        src = src.replace('<p data-download hidden>','<p data-download>')
    if lang != 'en':
        src = re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*',
            r'\1https://adsvioagency.com/assets/img/logo-adsvio.png', src)
    title = re.search(r'<title>(.*?)</title>', src, re.S)
    description = re.search(r'<meta name="description" content="([^"]*)"', src)
    for name,value in [('twitter:title',title[1]),('twitter:description',description[1]),
                       ('og:title',title[1]),('og:description',description[1])]:
        if not re.search(r'(?:name|property)="'+name+'"',src):
            attr = 'property' if name.startswith('og:') else 'name'
            src = src.replace('</head>',f'<meta {attr}="{name}" content="{escape(unescape(value),quote=True)}">\n</head>')
    if 'property="og:locale"' not in src:
        src=src.replace('</head>', '<meta property="og:locale" content="'+{'en':'en_US','es':'es_DO','fr':'fr_CA'}[lang]+'">\n</head>')
    if lang != 'en':
        # Localized leads are distinguishable while retaining existing English
        # form names and each existing French form name.
        if p.name == 'contact.html':
            src = src.replace('name="contact"','name="contact-' + lang + '"')
            src = src.replace('value="contact"','value="contact-' + lang + '"')
        src = re.sub(r'(<form\b[^>]*data-netlify[^>]*>)',
            lambda m: m[0] + '\n<input type="hidden" name="language" value="' + lang + '">', src)
    return src

def main():
    words = catalog()
    missing = set()
    outputs = []
    for p in pages():
        original = p.read_text(encoding='utf-8')
        for lang in LANGS:
            src = original if lang == 'en' else translate(original, lang, words, missing)
            src = languages(src, p, lang)
            src = schemas(src, lang, words, missing)
            src = refinements(src, p, lang)
            outputs.append((ROOT / lang / p.relative_to(ROOT / 'en'), src))
    if missing:
        print('Missing editorial translations:', len(missing))
        for s in sorted(missing): print(s)
        return 1
    for p, src in outputs:
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text('\n'.join(line.rstrip() for line in src.splitlines())+'\n', encoding='utf-8', newline='\n')
    write_sitemap()
    print(f'Wrote {len(outputs)} fully localized static pages.')
    return 0

def write_sitemap():
    import xml.etree.ElementTree as ET
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    xhtml = 'http://www.w3.org/1999/xhtml'
    ET.register_namespace('', ns)
    ET.register_namespace('xhtml', xhtml)
    tree = ET.Element('{'+ns+'}urlset')
    for p in pages():
        if re.search(r'<meta name="robots" content="[^"]*noindex',p.read_text(encoding='utf-8')): continue
        for lang in LANGS:
            node = ET.SubElement(tree, '{'+ns+'}url')
            ET.SubElement(node, '{'+ns+'}loc').text = ORIGIN + route(p,lang)
            for alt in (*LANGS, 'x-default'):
                ET.SubElement(node, '{'+xhtml+'}link', {'rel':'alternate','hreflang':alt,
                    'href':ORIGIN + route(p,'en' if alt=='x-default' else alt)})
    ET.indent(tree)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(tree,encoding='unicode')+'\n',encoding='utf-8')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    raise SystemExit(main())
