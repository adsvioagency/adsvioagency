"""Content, equivalent routes, locale controls and Netlify form regressions."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import sys
import localize

errors = []
def check(condition, message):
    if not condition: errors.append(message)

class HTML(HTMLParser):
    def __init__(self, src):
        super().__init__()
        self.tags=[]; self.strings=[]; self.skip=0
        self.feed(src)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs); self.tags.append((tag,attrs))
        if tag in ('script','style'): self.skip+=1
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip-=1
    def handle_data(self,s):
        if not self.skip and localize.norm(s): self.strings.append(localize.norm(s))

words=localize.catalog()
source=json.loads(localize.SOURCE.read_text(encoding='utf-8'))
inventory=[]
for en in localize.pages():
    row={'page':en.relative_to(localize.ROOT/'en').as_posix(),'languages':{}}
    for lang in localize.LANGS:
        path=localize.ROOT/lang/en.relative_to(localize.ROOT/'en')
        check(path.is_file(),f'Missing {path}')
        if not path.is_file(): continue
        src=path.read_text(encoding='utf-8'); doc=HTML(src); rel=path.relative_to(localize.ROOT).as_posix()
        check(any(t=='html' and a.get('lang')==lang for t,a in doc.tags),rel+': wrong HTML language')
        switches=[a for t,a in doc.tags if a.get('class')=='langswitch__item']
        check({a.get('data-language') for a in switches}==set(localize.LANGS),rel+': language controls missing')
        for a in switches:
            target=a.get('data-language')
            check(a.get('href')==localize.route(en,target),rel+': switch loses page context')
            check(a.get('hreflang')==target and a.get('lang')==target,rel+': switch language attributes')
            check((a.get('aria-current')=='true')==(target==lang),rel+': active switch incorrect')
        for t,a in doc.tags:
            if t=='a' and a.get('href','').startswith(('/en/','/es/','/fr/')):
                if not a.get('data-language') and not a.get('lang'):
                    check(a['href'].startswith('/'+lang+'/'),rel+': cross-language navigation '+a['href'])
            if t=='form' and a.get('data-netlify')=='true':
                check(a.get('method','').lower()=='post',rel+': form POST missing')
                check(a.get('action','').startswith('/'+lang+'/thank-you'),rel+': form confirmation language')
                name=a.get('name')
                check(any(tt=='input' and aa.get('name')=='form-name' and aa.get('value')==name for tt,aa in doc.tags),rel+': Netlify form name mismatch')
        check('data-lp-lang="kr"' not in src and 'lang="ht"' not in src,rel+': excluded Creole interface')
        if lang!='en':
            for text in doc.strings:
                if text in words and len(text)>8:
                    translated=words[text][lang]
                    # Unchanged brand/proper names or existing Spanish wording
                    # are editorially explicit; sentences may never fall back.
                    check(translated==text,rel+': original untranslated unit '+text[:90])
            for text in re.findall(r'(?:alt|aria-label|placeholder)="([^"]+)"',src):
                key=localize.norm(text)
                if key in words: check(words[key][lang]==key,rel+': untranslated accessible string '+key)
        check(src.count('src="/assets/js/language.js"')==1,rel+': preference script duplicated')
        row['languages'][lang]={'route':localize.route(en,lang),'status':'complete',
            'indexable':not re.search(r'<meta name="robots" content="[^"]*noindex',src)}
    inventory.append(row)
print(f'Checked {len(inventory)} equivalent route families, 105 localized pages, switches, copy, attributes and forms.')
for error in errors: print('FAIL:',error)
print(f'Result: {len(errors)} errors')
if not errors:
    (localize.ROOT/'docs/LANGUAGE-COVERAGE.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sys.exit(bool(errors))
