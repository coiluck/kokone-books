// library.ts
import { getBooks } from "./modules/db";
import { webData } from "./modules/webData";

export async function setUpLibrary() {
  setUpSearch();
  setUpBookList();
}

function setUpSearch() {
  // 後で書く
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