export async function fetchLyricsFromGenius(
  songTitle: string,
  artistName?: string
): Promise<{ lyrics: string; source: string; title?: string; artist?: string } | null> {
  const query = `${songTitle} ${artistName || ''}`.trim();
  if (!query) return null;

  // 1. LrcLib Search API (Rất nhanh, chính xác và có đầy đủ bài hát Việt Nam lẫn Quốc tế)
  try {
    const lrcRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
    if (lrcRes.ok) {
      const lrcData: any = await lrcRes.json();
      if (Array.isArray(lrcData) && lrcData.length > 0) {
        const match = lrcData.find((item: any) => item.plainLyrics || item.syncedLyrics) || lrcData[0];
        let lyrics = match.plainLyrics;
        if (!lyrics && match.syncedLyrics) {
          lyrics = match.syncedLyrics.replace(/\[\d+:\d+\.\d+\]/g, '').trim();
        }
        if (lyrics && lyrics.trim()) {
          return {
            lyrics: lyrics.trim(),
            source: 'Genius/LrcLib',
            title: match.trackName,
            artist: match.artistName,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi kết nối LrcLib:', e);
  }

  // 2. DuckDuckGo / Genius Scraping Fallback
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:genius.com')}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (searchRes.ok) {
      const html = await searchRes.text();
      const matches = html.match(/https?:\/\/(?:www\.)?genius\.com\/[a-zA-Z0-9\-]+lyrics/gi);

      if (matches && matches.length > 0) {
        const geniusUrl = matches[0];
        const pageRes = await fetch(geniusUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (pageRes.ok) {
          const pageHtml = await pageRes.text();
          const containerRegex = /<div[^>]*data-lyrics-container="true"[^>]*>(.*?)<\/div>/gs;
          const foundContainers: string[] = [];
          let m: RegExpExecArray | null;
          while ((m = containerRegex.exec(pageHtml)) !== null) {
            foundContainers.push(m[1]);
          }

          if (foundContainers.length > 0) {
            const lyrics = foundContainers
              .join('\n')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&#x27;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .trim();

            if (lyrics) {
              return {
                lyrics,
                source: 'Genius',
              };
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi scraping Genius:', e);
  }

  return null;
}
