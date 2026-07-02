export const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    if (parsed.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
    }
    if (parsed.pathname.includes('/playlist')) {
      const list = parsed.searchParams.get('list');
      return list ? `https://www.youtube.com/embed/videoseries?list=${list}` : null;
    }
  } catch {
    return null;
  }
  return null;
};
