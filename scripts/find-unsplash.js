import fs from 'fs';
const queries = [
  'university-students-studying-laptop',
  'students-preparing-exam-laptop',
  'online-learning-student-laptop',
  'university-study-group-laptop',
];

(async () => {
  for (const query of queries) {
    const html = await fetch(`https://unsplash.com/s/photos/${query}`).then((res) => res.text());
    const urls = [...html.matchAll(/https:\/\/(?:images|plus)\.unsplash\.com\/[^"' <]+/g)]
      .map((match) => match[0].replaceAll('&amp;', '&'))
      .filter((url) => url.includes('auto=format') && url.includes('fit=crop'));
    const unique = [...new Set(urls)].slice(0, 8);
    fs.mkdirSync('public/images/search', { recursive: true });
    console.log(`\n${query}`);
    unique.forEach((url, index) => console.log(index + 1, url));
  }
})();
