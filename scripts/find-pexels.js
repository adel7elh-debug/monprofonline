import fs from 'fs';

const queries = [
  'online learning student laptop',
  'university students studying laptop',
  'students studying together university laptop',
];

(async () => {
  for (const query of queries) {
    const html = await fetch(`https://www.pexels.com/search/${encodeURIComponent(query)}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    }).then((res) => res.text());
    const urls = [...html.matchAll(/https:\/\/images\.pexels\.com\/photos\/[^"' <]+/g)]
      .map((match) => match[0].replaceAll('\\u002F', '/').replaceAll('&amp;', '&'))
      .filter((url) => url.includes('auto=compress') || url.includes('pexels-photo'));
    const unique = [...new Set(urls)].slice(0, 12);
    fs.mkdirSync('public/images/search', { recursive: true });
    console.log(`\n${query}`);
    unique.forEach((url, index) => console.log(index + 1, url));
  }
})();
