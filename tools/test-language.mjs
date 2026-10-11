import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { chooseLanguage, preferredBrowser, config } from '../netlify/edge-functions/language.js';

const ctx = (country, saved) => ({ geo: { country: { code: country } }, cookies: { get: () => saved } });
const scenarios = [
  ['Dominican first visit','DO','en-US','', 'es'],
  ['US first visit','US','es-DO','', 'en'],
  ['Haiti first visit','HT','ht,es','', 'fr'],
  ['Canada French','CA','fr-CA, en;q=0.8','', 'fr'],
  ['Canada English','CA','en-CA, fr;q=0.8','', 'en'],
  ['Canada unsupported then French','CA','es,fr;q=0.8,en;q=0.7','', 'fr'],
  ['Other supported browser','MX','es-MX, en;q=0.8','', 'es'],
  ['Other French browser','GB','fr,en;q=0.4','', 'fr'],
  ['Unknown country French browser','','fr-CA','', 'fr'],
  ['Unknown country unsupported','','de,ht','', 'en'],
  ['No hints','','','', 'en'],
  ['Saved English beats DO','DO','es','en', 'en'],
  ['Saved Spanish beats US','US','en','es', 'es'],
  ['Saved French beats US','US','en','fr', 'fr'],
  ['Invalid cookie ignored','DO','en','ht', 'es']
];
for (const [name,country,browser,saved,expected] of scenarios) {
  test(name, () => {
    assert.equal(chooseLanguage(country,browser,saved), expected);
    const response = handler(new Request('https://adsvioagency.com/?utm_source=qr',
      {headers:{'accept-language':browser}}), ctx(country,saved));
    assert.equal(response.status,302);
    assert.equal(response.headers.get('location'),`https://adsvioagency.com/${expected}/?utm_source=qr`);
    assert.match(response.headers.get('cache-control'),/no-store/);
    assert.equal(response.headers.get('set-cookie'),null, 'automatic guesses must not become manual preferences');
  });
}
test('Quality ordering and exclusions', () => {
  assert.equal(preferredBrowser('fr;q=0,es;q=0.9,en;q=0.5'), 'es');
  assert.equal(preferredBrowser('fr;q=invalid,en;q=0.5'), 'en');
  assert.equal(preferredBrowser('fr;q=2,es;q=0.5'), 'es');
});
for (const path of ['/es/','/es/services/website-design','/fr/about','/en/','/en/offer','/assets/css/base.css']) {
  test('Direct URL remains accessible: '+path, () => {
    assert.equal(handler(new Request('https://adsvioagency.com'+path),ctx('DO','fr')),undefined);
  });
}
for (const method of ['POST','PUT','OPTIONS']) {
  test(method+' bypasses geo routing',()=>assert.equal(handler(new Request('https://adsvioagency.com/',{method}),ctx('DO','')),undefined));
}
test('GET and HEAD root and index redirects preserve campaign parameters', () => {
  const response = handler(new Request('https://www.adsvioagency.com/index.html?utm_campaign=card&gclid=123',{method:'HEAD'}),ctx('DO',''));
  assert.equal(response.headers.get('location'),'https://www.adsvioagency.com/es/?utm_campaign=card&gclid=123');
});
test('Explicit root choice overrides saved choice and sets parent-domain cookie', () => {
  const response = handler(new Request('https://www.adsvioagency.com/?lang=fr&utm_source=qr'),ctx('DO','en'));
  assert.equal(response.headers.get('location'),'https://www.adsvioagency.com/fr/?utm_source=qr');
  assert.match(response.headers.get('set-cookie'),/adsvio_language=fr/);
  assert.match(response.headers.get('set-cookie'),/Domain=adsvioagency.com/);
});
test('Preview preference cookie remains host-only',()=>{
  const r=handler(new Request('https://deploy-preview-1--adsvioagency.netlify.app/?lang=es'),ctx('US',''));
  assert.doesNotMatch(r.headers.get('set-cookie'),/Domain=/);
});
for(const agent of ['Googlebot','Bingbot','facebookexternalhit','WhatsApp','LinkedInBot']) {
  test(agent+' receives crawlable chooser',()=>assert.equal(handler(new Request('https://adsvioagency.com/',{headers:{'user-agent':agent}}),ctx('DO','')),undefined));
}
test('Narrow root scope and graceful fallback',()=>{
  assert.deepEqual(config.path,['/','/index.html']);
  assert.equal(config.onError,'bypass');
});
