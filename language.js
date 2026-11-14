const languageMenu = document.querySelector('.language-menu');
const languageLinks = [...languageMenu.querySelectorAll('a[hreflang]')];
const languageKey = 'cottonleaf-language';
const getLanguageCode = (tag) => tag.toLowerCase().split('-')[0];
const linkFor = (code) => languageLinks.find((link) => getLanguageCode(link.hreflang) === code);
const currentLanguage = getLanguageCode(document.documentElement.lang);
const explicitLanguage = new URLSearchParams(location.search).get('lang');

function rememberLanguage(code) {
  try {
    localStorage.setItem(languageKey, code);
  } catch {
    // The language links still work when storage is unavailable.
  }
}

for (const link of languageLinks) {
  link.addEventListener('click', () => rememberLanguage(getLanguageCode(link.hreflang)));
}

languageMenu.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && languageMenu.open) {
    languageMenu.open = false;
    languageMenu.querySelector('summary').focus();
  }
});

if (linkFor(explicitLanguage) && explicitLanguage === currentLanguage) {
  rememberLanguage(explicitLanguage);
  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('lang');
  history.replaceState(null, '', cleanUrl);
} else if (currentLanguage === 'it' && !explicitLanguage) {
  let savedLanguage;
  try {
    savedLanguage = localStorage.getItem(languageKey);
  } catch {
    // Use the browser preference in restricted sessions.
  }
  const candidates = savedLanguage ? [savedLanguage] : (navigator.languages?.length ? navigator.languages : [navigator.language]);
  const preferred = candidates.map(getLanguageCode).find(linkFor) ?? 'it';
  if (preferred !== 'it') {
    const destination = new URL(linkFor(preferred).href);
    destination.search = location.search;
    destination.hash = location.hash;
    location.replace(destination);
  }
}
