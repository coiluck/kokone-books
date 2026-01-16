// library.ts
import { BookItem, getBooks } from "./modules/db";
import { webData } from "./modules/webData";
import { settingsState } from "./modules/store";

export async function setUpLibrary() {
  setUpSearch();
}

async function setUpSearch() {
  const librarySearchContainer = document.getElementById('library-search-container') as HTMLElement;
  if (!librarySearchContainer) return;
  librarySearchContainer.innerHTML = '';

  const detailsModal = document.createElement('details');

  detailsModal.innerHTML = `
    <summary>Search</summary>
    <div class="search-button-container">
      <button id="library-search-button-clear">Clear</button>
    </div>
    <div class="search-items-container">
      <div class="search-item">
        <span class="search-label">タイトル</span>
        <input type="text" id="library-search-title-input" placeholder="タイトルを入力" spellcheck="false" autocomplete="off" />
      </div>
      <div class="search-item">
        <span class="search-label">抽出タグ</span>
        <div class="search-tags-input-container" id="library-search-positive-tags-container">
          <!-- atode -->
          <input type="text" id="library-search-positive-tags" placeholder="抽出タグを入力 & Enterキーで追加" spellcheck="false" autocomplete="off" />
        </div>
      </div>
      <div class="search-item">
        <span class="search-label">除外タグ</span>
        <div class="search-tags-input-container" id="library-search-negative-tags-container">
          <!-- atode -->
          <input type="text" id="library-search-negative-tags" placeholder="除外タグを入力 & Enterキーで追加" spellcheck="false" autocomplete="off" />
        </div>
      </div>
      <div class="search-sort-item">
        <span class="search-label">表示順</span>
        <div class="search-sort-toggle">
          <input type="radio" name="search-sort-condition" id="search-sort-condition-newest" value="NEWEST" checked>
          <label for="search-sort-condition-newest" class="search-sort-toggle-option">新着順</label>
          <input type="radio" name="search-sort-condition" id="search-sort-condition-oldest" value="OLDEST">
          <label for="search-sort-condition-oldest" class="search-sort-toggle-option">古い順</label>
        </div>
      </div>
    </div>
  `;
  librarySearchContainer.appendChild(detailsModal);

  const includeInput = document.querySelector('#library-search-positive-tags') as HTMLInputElement;
  const includeContainer = document.querySelector('#library-search-positive-tags-container') as HTMLElement;
  addTagChip(includeContainer, includeInput);

  const excludeInput = document.querySelector('#library-search-negative-tags') as HTMLInputElement;
  const excludeContainer = document.querySelector('#library-search-negative-tags-container') as HTMLElement;
  addTagChip(excludeContainer, excludeInput);

  // 検索処理
  const titleInput = document.getElementById('library-search-title-input') as HTMLInputElement;
  titleInput.addEventListener('input', executeSearch);

  // ソート
  const sortRadios = document.querySelectorAll('input[name="search-sort-condition"]') as NodeListOf<HTMLInputElement>;
    sortRadios.forEach(radio => {
    radio.addEventListener('change', executeSearch);
  });

  // クリア
  const clearButton = document.getElementById('library-search-button-clear') as HTMLButtonElement;
  clearButton.addEventListener('click', () => {
    titleInput.value = '';
    const positiveChips = includeContainer.querySelectorAll('.search-tag-chip');
    positiveChips.forEach(chip => chip.remove());
    const negativeChips = excludeContainer.querySelectorAll('.search-tag-chip');
    negativeChips.forEach(chip => chip.remove());
    executeSearch();
  });

  // デフォルトの検索条件を適用
  for (const tag of settingsState.defaultSearchPositiveTags) {
    addDefaultSearchTags(tag, 'positive');
  }
  for (const tag of settingsState.defaultSearchNegativeTags) {
    addDefaultSearchTags(tag, 'negative');
  }

  // 初回描画
  const conditions = {
    title: '',
    positiveTags: settingsState.defaultSearchPositiveTags,
    negativeTags: settingsState.defaultSearchNegativeTags,
    sortCondition: 'NEWEST' as 'NEWEST' | 'OLDEST',
  };
  const books = await searchBooks(conditions);
  await renderBookList(books);
}

const addTagChip = (container: HTMLElement, input: HTMLInputElement) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
      e.preventDefault();
      const tagText = input.value.trim();
      const chip = document.createElement('div');
      chip.className = 'search-tag-chip';
      chip.textContent = tagText;

      chip.addEventListener('click', () => {
        chip.remove();
        executeSearch();
      });

      container.insertBefore(chip, input);
      input.value = '';

      executeSearch();
    }
  });
}
const addDefaultSearchTags = (tag: string, type: 'positive' | 'negative') => {
  const container = type === 'positive' ? document.querySelector('#library-search-positive-tags-container') as HTMLElement : document.querySelector('#library-search-negative-tags-container') as HTMLElement;
  const input = type === 'positive' ? document.querySelector('#library-search-positive-tags') as HTMLInputElement : document.querySelector('#library-search-negative-tags') as HTMLInputElement;
  const chip = document.createElement('div');
  chip.className = 'search-tag-chip';
  chip.textContent = tag;
  chip.addEventListener('click', () => {
    chip.remove();
    executeSearch();
  });
  container.insertBefore(chip, input);
}

export const executeSearch = async () => {
  const conditions = getSearchConditions();
  const books = await searchBooks(conditions);
  await renderBookList(books);
}
// 検索条件を取得
interface SearchConditions {
  title: string;
  positiveTags: string[];
  negativeTags: string[];
  sortCondition: 'NEWEST' | 'OLDEST';
}
function getSearchConditions(): SearchConditions {
  const titleInput = document.querySelector('#library-search-title-input') as HTMLInputElement;
  const title = titleInput?.value.trim() || '';

  const positiveContainer = document.querySelector('#library-search-positive-tags-container') as HTMLElement;
  const positiveChips = positiveContainer?.querySelectorAll('.search-tag-chip') || [];
  const positiveTags = Array.from(positiveChips).map(chip => chip.textContent?.trim() || '').filter(Boolean);

  const negativeContainer = document.querySelector('#library-search-negative-tags-container') as HTMLElement;
  const negativeChips = negativeContainer?.querySelectorAll('.search-tag-chip') || [];
  const negativeTags = Array.from(negativeChips).map(chip => chip.textContent?.trim() || '').filter(Boolean);

  const sortRadio = document.querySelector('input[name="search-sort-condition"]:checked') as HTMLInputElement;
  const sortCondition = (sortRadio?.value as 'NEWEST' | 'OLDEST') || 'NEWEST';

  return { title, positiveTags, negativeTags, sortCondition };
}

async function searchBooks(conditions: SearchConditions): Promise<BookItem[]> {
  const books = await getBooks();

  // フィルタリング
  let filteredBooks = books.filter((book) => {
    // タイトル
    if (conditions.title && !book.title.includes(conditions.title)) {
      return false;
    }
    // 抽出タグ
    if (conditions.positiveTags.length > 0) {
      const hasAllPositiveTags = conditions.positiveTags.every(tag => book.tags.includes(tag));
      if (!hasAllPositiveTags) {
        return false;
      }
    }
    // 除外タグ
    if (conditions.negativeTags.length > 0) {
      const hasAnyNegativeTag = conditions.negativeTags.some(tag => book.tags.includes(tag));
      if (hasAnyNegativeTag) {
        return false;
      }
    }
    return true;
  });
  // ソート
  filteredBooks.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return conditions.sortCondition === 'NEWEST' ? dateB - dateA : dateA - dateB;
  });
  return filteredBooks;
}

async function renderBookList(books: BookItem[]) {
  const libraryBookListContainer = document.getElementById('library-book-list-container') as HTMLElement;
  if (!libraryBookListContainer) return;
  libraryBookListContainer.innerHTML = '';
  books.forEach((book) => {
    const bookItem = document.createElement('a');
    if(book.type === 'web' && book.top_url) {
      bookItem.href = book.top_url;
      bookItem.target = '_blank';
    }
    bookItem.classList.add('library-book-item');
    const siteName = book.site_type ? webData.find((site) => site.id === book.site_type)?.name : '書籍'; // 外のサイトはundefined
    let itemIcon = '';
    if(book.type === 'web' && settingsState.isNeedIcon) {
      itemIcon = `
      <div class="library-book-item-icon-container">
        <div class="library-book-item-icon web"></div>
      </div>`;
    } else if(book.type === 'physical' && settingsState.isNeedIcon) {
      itemIcon = `
      <div class="library-book-item-icon-container">
        <div class="library-book-item-icon physical"></div>
      </div>`;
    };
    bookItem.innerHTML = `
      ${itemIcon}
      <div class="library-book-item-text">
        <div class="library-book-item-title">${book.title}</div>
        <div class="library-book-item-metadata">
          <span>${book.created_at.split('T')[0]}</span>
          <span>•</span>
          <span>${siteName}</span>
          <div class="library-book-item-tags">
            ${book.tags.map((tag) => `<span class="library-book-item-tag" data-tag="${tag}">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="library-book-item-edit"></div>
    `;

    const allTagsElements = bookItem.querySelectorAll('.library-book-item-tag') as NodeListOf<HTMLElement>;
    for (const tagElement of allTagsElements) {
      tagElement.addEventListener('click', (e) => {
        const tag= ((tagElement as HTMLElement).dataset.tag as string);
        e.preventDefault();
        console.log(tag); // 後で書く
      });
    }

    const editButton = bookItem.querySelector('.library-book-item-edit') as HTMLElement;
    editButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showEditMenu(book, editButton);
    });

    libraryBookListContainer.appendChild(bookItem);
  });
}

import { showEditMenu } from "./modules/editBook";