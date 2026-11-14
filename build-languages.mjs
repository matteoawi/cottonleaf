import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const write = (path, contents) => writeFileSync(new URL(path, import.meta.url), contents.replaceAll('\r\n', '\n'));
const catalog = JSON.parse(read('translations.json'));
const version = read('VERSION').trim();
const home = read('index.html');
const changelog = read('changelog.html');
const origin = 'https://cottonleaf.it/';
const releaseDate = changelog.match(/<time datetime="(\d{4}-\d{2}-\d{2})">/)[1];

const localizedPath = (code, page) => (code === 'it' ? '' : code + '/') + page;
const escapeAttribute = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const phone = '<a class="inline-link" dir="ltr" href="tel:+393452357524">+39&nbsp;345&nbsp;235&nbsp;7524</a>';
const withVersion = (html) => html.replace(/((?:styles\.css|home\.js|maps\.js|language\.js)\?v=|changelog\.html">[^<]+ · v)\d+\.\d+\.\d+/g, (_, prefix) => prefix + version);
const setText = (html, before, after) => {
  if (!html.includes(before)) throw new Error('Missing translation source: ' + before);
  return html.replaceAll(before, () => after);
};
const bodyKeys = ['navSteps', 'navFabrics', 'navStores', 'pay', 'skip', 'headline', 'price', 'call', 'visit', 'free', 'pickup', 'delivery', 'steps', 'stepsLead', 'step1', 'step2', 'step2Text', 'step3', 'step3Text', 'fabricTitle', 'fabricText', 'bookCaption', 'gallery', 'stores', 'storesText', 'booking', 'reviewTitle', 'reviewText'];
const attrKeys = ['navLabel', 'fees', 'prev', 'next', 'galleryLabel', 'heroAlt', 'bookAlt', 'photo1', 'photo2', 'photo3', 'photo4', 'photo5', 'photo6', 'socialAlt'];

function addLanguages(html, code, page) {
  const pathToRoot = code === 'it' ? './' : '../';
  const links = Object.entries(catalog).map(([id, item]) => {
    const current = id === code ? ' aria-current="page"' : '';
    return `<a href="${pathToRoot}${localizedPath(id, page)}" lang="${item.lang}" hreflang="${item.lang}" dir="${item.dir}"${current}>${item.name}</a>`;
  });
  const alternates = [...Object.entries(catalog).map(([id, item]) => [item.lang, localizedPath(id, page)]), ['x-default', page]];
  const tags = alternates.map(([lang, path]) => `<link rel="alternate" hreflang="${lang}" href="${origin}${path}">`);
  return html.replace(/<!-- alternate-languages -->(?:[\s\S]*?<!-- end-alternate-languages -->)?/, '<!-- alternate-languages -->\n  ' + tags.join('\n  ') + '\n  <!-- end-alternate-languages -->')
    .replace(/<!-- language-options -->(?:[\s\S]*?<!-- end-language-options -->)?/, `<!-- language-options -->\n        <div class="language-options">\n          ${links.join('\n          ')}\n        </div>\n        <!-- end-language-options -->`)
    .replace('>IT</summary>', () => `>${code.toUpperCase()}</summary>`);
}

function localizeHome(code) {
  const { text, lang, faq } = catalog[code];
  const it = catalog.it.text;
  let html = home;
  for (const key of attrKeys) html = setText(html, '"' + it[key] + '"', '"' + escapeAttribute(text[key]) + '"');
  html = setText(html, it.language + ': </span>', text.language + ': </span>');
  for (const key of bodyKeys) html = setText(html, '>' + it[key] + '<', '>' + text[key] + '<');
  html = setText(html, '>' + it.pay + ' <svg', '>' + text.pay + ' <svg');
  html = setText(html, '</strong> ' + it.lead + '</p>', '</strong> ' + text.lead + '</p>');
  html = setText(html, it.step1Text.replace('{phone}', phone), text.step1Text.replace('{phone}', phone));
  html = setText(html, '>' + it.news + ' ·', '>' + text.news + ' ·');
  html = setText(html, '<title>' + it.title + '</title>', '<title>' + text.title + (code === 'it' ? '' : ' | Cotton Leaf') + '</title>');
  html = html.replace(/(<meta (?:name="description"|property="og:description") content=")[^"]+"/g, (_, start) => start + escapeAttribute(text.description) + '"');
  html = html.replace(/(<meta property="og:title" content=")[^"]+"/, (_, start) => start + escapeAttribute(text.title + (code === 'it' ? '' : ' | Cotton Leaf')) + '"');
  const socialLocales = { it: 'it_IT', en: 'en_GB', ar: 'ar_AR', zh: 'zh_CN', fr: 'fr_FR', es: 'es_ES', de: 'de_DE', bn: 'bn_BD' };
  html = html.replace('content="it_IT"', 'content="' + socialLocales[code] + '"');
  const pageUrl = origin + localizedPath(code, '');
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, start, source, end) => {
    const data = JSON.parse(source);
    const graph = data['@graph'].filter((item) => item['@type'] !== 'WebPage');
    const service = graph.find((item) => item['@type'] === 'Service');
    if (code !== 'it') {
      service.description = text.description;
      service.name = text.title;
    }
    graph.push({
      '@type': 'WebPage',
      '@id': pageUrl + '#webpage',
      url: pageUrl,
      name: text.title,
      description: text.description,
      inLanguage: lang,
      isPartOf: { '@id': origin + '#website' },
      mainEntity: { '@id': service['@id'] }
    });
    data['@graph'] = graph;
    return start + '\n' + JSON.stringify(data, null, 2).split('\n').map((line) => '  ' + line).join('\n') + '\n  ' + end;
  });
  html = setText(html, ' ' + it.book + '</a>', ' ' + text.book + '</a>');
  html = setText(html, '>' + it.review + ' <svg', '>' + text.review + ' <svg');
  html = setText(html, '>' + it.directions + '<', '>' + text.directions + '<');
  const href = (message) => 'https://wa.me/393452357524?text=' + encodeURIComponent(message);
  let bookingLink = 0;
  html = html.replace(/https:\/\/wa\.me\/393452357524\?text=[^"]+/g, () => href(++bookingLink === 2 ? text.fabricMessage : text.message));
  html = html.replace(/(<button [^\n]+ map-toggle"[^>]* hidden)([^>]*>)[^<]+/g, (_, opening, end) => opening + end + text.mapOpen);
  html = html.replace(/(<button [^\n]+ map-toggle"[^>]*)(>)/g, (_, opening, end) => opening.replace(/ data-(open|close)-label="[^"]*"/g, '') + ' data-open-label="' + escapeAttribute(text.mapOpen) + '" data-close-label="' + escapeAttribute(text.mapClose) + '"' + end);
  if (code !== 'it') {
    html = html.replace(/data-title="Mappa di Cotton Leaf in ([^"]+)"/g, (_, address) => 'data-title="' + escapeAttribute(text.mapTitle + ' (' + address + ')') + '"');
    html = html.replace(/<span class="visually-hidden"> di (Via (?:Nomentana|Venti Settembre))<\/span>/g, '<span class="visually-hidden"> ($1)</span>');
  }
  html = html.replace(/ · Scheda del negozio in (Via (?:Nomentana|Venti Settembre)) su Google Maps/g, (_, street) => ' · ' + text.storeLabel + ' (' + street + ')');
  const [faqTitle, ...questionsAndAnswers] = faq;
  const faqMarkup = ['<section id="domande-frequenti" class="wrap faq" aria-labelledby="titolo-faq">', '      <h2 id="titolo-faq">' + faqTitle + '</h2>'];
  for (let index = 0; index < questionsAndAnswers.length; index += 2) {
    const [question, answer] = questionsAndAnswers.slice(index, index + 2);
    faqMarkup.push('      <div class="faq-item">', '        <h3>' + question + '</h3>', '        <p>' + answer.replace('{phone}', phone) + '</p>', '      </div>');
  }
  faqMarkup.push('    </section>');
  html = html.replace(/<!-- faq-content -->(?:[\s\S]*?<!-- end-faq-content -->)?/, () => '<!-- faq-content -->\n    ' + faqMarkup.join('\n') + '\n    <!-- end-faq-content -->');
  return prepare(html, code, '');
}

function prepare(html, code, page) {
  const { lang, dir } = catalog[code];
  html = addLanguages(withVersion(html), code, page);
  html = html.replace('<html lang="it">', '<html lang="' + lang + '"' + (dir === 'rtl' ? ' dir="rtl"' : '') + '>');
  html = html.replace(/(rel="canonical" href=")[^"]+/g, '$1' + origin + localizedPath(code, page));
  if (code !== 'it') {
    html = html.replace(/(src|href)="(assets\/|(?:styles\.css|home\.js|maps\.js|language\.js)\?)/g, '$1="../$2');
    html = html.replace(/((?:image)?srcset="[^"]*)"/gi, (_, srcset) => srcset.replaceAll('assets/', '../assets/') + '"');
    html = html.replace('property="og:url" content="' + origin + '"', 'property="og:url" content="' + origin + localizedPath(code, page) + '"');
  }
  return html;
}

function localizeChangelog(code) {
  const { text, seoRelease } = catalog[code];
  const it = catalog.it.text;
  let html = changelog;
  for (const key of ['back', 'language', 'release1', 'release2', 'release3']) html = setText(html, it[key], text[key]);
  html = html.replace(/(<li data-seo-release>)[^<]+/, (_, opening) => opening + seoRelease);
  html = setText(html, '<title>' + it.news, '<title>' + text.news);
  html = setText(html, '>' + it.news + '<', '>' + text.news + '<');
  html = setText(html, '>' + it.version + ' ' + version + '<', '>' + text.version + ' ' + version + '<');
  html = html.replace(/(<meta name="description" content=")[^"]+"/, (_, start) => start + escapeAttribute(text.news + ' · Cotton Leaf') + '"');
  const date = new Intl.DateTimeFormat(catalog[code].lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(releaseDate));
  if (code !== 'it') {
    html = html.replace(/(<time datetime="[^"]+">)[^<]+/, (_, opening) => opening + date);
    const currentRelease = 'versione-' + version.replaceAll('.', '-');
    html = html.replace(/<article aria-labelledby="([^"]+)"/g, (article, id) => id === currentRelease ? article : '<article lang="it" dir="ltr" aria-labelledby="' + id + '"');
  }
  return prepare(html, code, 'changelog.html');
}

for (const code of Object.keys(catalog)) {
  if (code !== 'it') mkdirSync(new URL(code + '/', import.meta.url), { recursive: true });
  write(localizedPath(code, 'index.html'), code === 'it' ? localizeHome(code) : '<!-- Generated by build-languages.mjs -->\n' + localizeHome(code));
  write(localizedPath(code, 'changelog.html'), code === 'it' ? localizeChangelog(code) : '<!-- Generated by build-languages.mjs -->\n' + localizeChangelog(code));
}

const localizedUrls = Object.keys(catalog).filter((code) => code !== 'it').flatMap((code) =>
  ['', 'changelog.html'].map((page) => `  <url><loc>${origin}${localizedPath(code, page)}</loc><lastmod>${releaseDate}</lastmod></url>`)
);
const sitemap = read('sitemap.xml').replace(/  <!-- localized-urls -->[\s\S]*?  <!-- end-localized-urls -->\n?/g, '');
write('sitemap.xml', sitemap.replace('</urlset>', '  <!-- localized-urls -->\n' + localizedUrls.join('\n') + '\n  <!-- end-localized-urls -->\n</urlset>'));
