// library.ts
import { getBooks } from "./modules/db";
import { webData } from "./modules/webData";

export async function setUpLibrary() {
  setUpSearch();
  setUpBookList();
}

function setUpSearch() {
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
          <input type="text" id="library-search-positive-tags" placeholder="抽出タグを入力 & Enterキーで追加" spellcheck="false" autocomplete="off" />
        </div>
      </div>
      <div class="search-item">
        <span class="search-label">除外タグ</span>
        <div class="search-tags-input-container" id="library-search-negative-tags-container">
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
  // 後で書く
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
      });

      container.insertBefore(chip, input);
      input.value = '';
    }
  });
}

async function setUpBookList() {
  const libraryBookListContainer = document.getElementById('library-book-list-container') as HTMLElement;
  if (!libraryBookListContainer) return;
  libraryBookListContainer.innerHTML = '';
  const books = await getBooks();
  books.forEach((book) => {
    const bookItem = document.createElement('a');
    if(book.type === 'web' && book.top_url) {
      bookItem.href = book.top_url;
      bookItem.target = '_blank';
    }
    bookItem.classList.add('library-book-item');
    const siteName = book.site_type ? webData.find((site) => site.id === book.site_type)?.name : null;
    bookItem.innerHTML = `
      <div class="library-book-item-text">
        <div class="library-book-item-title">${book.title}</div>
        <div class="library-book-item-tags">${book.tags.map((tag) => `<span class="library-book-item-tag" data-tag="${tag}">${tag}</span>`).join('')}</div>
        <div class="library-book-item-metadata">
          <span>${book.created_at.split('T')[0]}</span>
          <span>•</span>
          <span>${siteName}</span>
        </div>
      </div>
      <div class="library-book-item-edit"></div>
    `;

    const allTagsElements = bookItem.querySelectorAll('.library-book-item-tag') as NodeListOf<HTMLElement>;
    for (const tagElement of allTagsElements) {
      tagElement.addEventListener('click', () => {
        const tag= ((tagElement as HTMLElement).dataset.tag as string);
        console.log(tag); // 後で書く
      });
    }

    const editButton = bookItem.querySelector('.library-book-item-edit') as HTMLElement;
    editButton.addEventListener('click', () => {
      console.log('edit'); // 後で書く
    });

    libraryBookListContainer.appendChild(bookItem);
  });
}