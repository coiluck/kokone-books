// webData.ts
import { invoke } from '@tauri-apps/api/core';

export const webData = [
  {
    name: "小説家になろう",
    id: "narou",
    base_url: "https://ncode.syosetu.com",
    url_pattern: "https://ncode.syosetu.com/${id}/${chapter_number}/",
    title_pattern: "${title} - ${page_title}",
    title_top: "${title}"
  },
  {
    name: "ハーメルン",
    id: "hameln",
    base_url: "https://syosetu.org",
    url_pattern: "https://syosetu.org/${id}/${chapter_number}/",
    title_pattern: "${title} - ${page_title} - ハーメルン",
    title_top: "${title} - ハーメルン"
  },
  {
    name: "カクヨム",
    id: "kakuyomu",
    base_url: "https://kakuyomu.jp",
    url_pattern: "https://kakuyomu.jp/works/${id}/episodes/${chapter_number}/",
    title_pattern: "${page_title} - ${title}（${author}） - カクヨム",
    title_top: "${title}（${author}） - カクヨム"
  },
  {
    name: "はてなブログ",
    id: "hatenablog",
    base_url: "hatenablog.com",
    url_pattern: "https://${variable}.hatenablog.com/entry/${id}",
    title_pattern: "${title} - ${author}",
    title_top: "${title} - ${author}"
  }
]

interface WebDataResult {
  type: 'web';
  title: string;
  top_url: string;
  site_type: 'narou' | 'kakuyomu' | 'hameln' | 'hatenablog' | 'other';
}

export async function getWebData(url: string) {
  const siteData = webData.find(data => url.includes(data.base_url));

  let siteType: WebDataResult['site_type'] = 'other';
  let topUrl = url;
  let title = '';

  if (siteData) {
    siteType = siteData.id as WebDataResult['site_type'];

    const isTop = isTopPage(url, siteData);
    if (!isTop) {
      topUrl = getTopUrl(url, siteData);
    }

    const ogTitle = await invoke('fetch_og_title', { url: url });
    if (ogTitle) {
      const pattern = isTop ? siteData.title_top : siteData.title_pattern;
      title = extractTitle(ogTitle as string, pattern);
    }
  }
  return {
    type: 'web' as const,
    title: title,
    top_url: topUrl,
    site_type: siteType
  };
}

function isTopPage(url: string, siteData: typeof webData[0]): boolean {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  switch (siteData.id) {
    case 'narou':
    case 'hameln':
      // /n2534js/ or /n2534js のような形式がトップページ
      return /^\/[^\/]+\/?$/.test(pathname);
    case 'kakuyomu':
      // /works/{id} がトップページ
      return /^\/works\/[^\/]+\/?$/.test(pathname);
    case 'hatenablog':
      // 個別ページが存在しない
      return true;
    default:
      return true;
  }
}
function getTopUrl(url: string, siteData: typeof webData[0]): string {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  switch (siteData.id) {
    case 'narou':
    case 'hameln': {
      // /n2534js/2/ -> /n2534js/
      const match = pathname.match(/^\/([^\/]+)/);
      if (match) {
        return `${urlObj.origin}/${match[1]}/`;
      }
      return url;
    }
    case 'kakuyomu': {
      // /works/{id}/episodes/{episode_id} -> /works/{id}
      const match = pathname.match(/^\/works\/([^\/]+)/);
      if (match) {
        return `${urlObj.origin}/works/${match[1]}`;
      }
      return url;
    }
    case 'hatenablog':
      return url;
    default:
      if (/\/\d{1,2}\/?$/.test(pathname)) {
        return `${urlObj.origin}${pathname.replace(/\/\d{1,2}\/?$/, '/')}`;
      }
      return url;
  }
}

function extractTitle(ogTitle: string, pattern: string): string {
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\$\{title\}/g, '(.+?)')
    .replace(/\$\{page_title\}/g, '.+?')
    .replace(/\$\{author\}/g, '.+?');

  const regex = new RegExp(`^${regexPattern}$`);
  const match = ogTitle.match(regex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // マッチしない場合は、ogTitleをそのまま返す
  return ogTitle;
}