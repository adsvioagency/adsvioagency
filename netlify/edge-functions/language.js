/* Netlify GeoIP, no external service. Only neutral GET/HEAD entry requests. */
export function preferredBrowser(header, allowed = ["en", "es", "fr"]) {
  return (header || "").split(",").map((part, order) => {
    const [code, ...parameters] = part.trim().toLowerCase().split(";");
    const quality = parameters.find(p => p.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { lang: code.split("-")[0], q, order };
  }).filter(x => allowed.includes(x.lang) && Number.isFinite(x.q) && x.q > 0 && x.q <= 1)
    .sort((a, b) => b.q - a.q || a.order - b.order)[0]?.lang || "en";
}

export function chooseLanguage(country, browser, saved) {
  if (["en", "es", "fr"].includes(saved)) return saved;
  switch ((country || "").toUpperCase()) {
    case "DO": return "es";
    case "US": return "en";
    case "HT": return "fr";
    case "CA": return preferredBrowser(browser, ["en", "fr"]);
    default: return preferredBrowser(browser);
  }
}

export default function handler(request, context) {
  const url = new URL(request.url);
  if (!["/", "/index.html"].includes(url.pathname) || !["GET", "HEAD"].includes(request.method)) return;
  const explicit = url.searchParams.get("lang");
  const userAgent = request.headers.get("user-agent") || "";
  // A stable crawlable chooser for search crawlers and social previews;
  // explicit historical ?lang= URLs still resolve to their translated page.
  if (!explicit && /bot|crawler|spider|slurp|facebookexternalhit|whatsapp|linkedin|preview/i.test(userAgent)) return;
  const saved = context.cookies.get("adsvio_language");
  const lang = ["en", "es", "fr"].includes(explicit) ? explicit :
    chooseLanguage(context.geo?.country?.code, request.headers.get("accept-language"), saved);
  url.pathname = "/" + lang + "/";
  url.searchParams.delete("lang");
  const headers = new Headers({
    Location: url.toString(), "Cache-Control": "private, no-store",
    Vary: "Cookie, Accept-Language, User-Agent",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });
  if (["en", "es", "fr"].includes(explicit)) {
    const domain = /(^|\.)adsvioagency\.com$/.test(url.hostname) ? "; Domain=adsvioagency.com" : "";
    headers.set("Set-Cookie", "adsvio_language=" + lang + "; Path=/; Max-Age=31536000; SameSite=Lax; Secure" + domain);
  }
  return new Response(null, { status: 302, headers });
}

export const config = { path: ["/", "/index.html"], onError: "bypass" };
