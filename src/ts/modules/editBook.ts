// editBook.ts
import { BookItem, deleteBook } from "./db";

export const showEditMenu = (book: BookItem, editButton: HTMLElement) => {
  // 閉じる処理
  closeEditMenu();

  // 編集メニューを表示
  const menu = document.createElement('div');
  menu.classList.add('edit-menu');

  const scrollContainer = editButton.closest('.modal, #modal-library');
  const rect = editButton.getBoundingClientRect();
  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    menu.style.top = `${rect.bottom - containerRect.top + scrollContainer.scrollTop}px`;
    menu.style.right = `${containerRect.right - rect.right}px`;
    scrollContainer.appendChild(menu);
  }

  menu.innerHTML = `
    <div class="edit-menu-item" id="edit-menu-item-edit">
      <div class="edit-menu-icon" id="edit-menu-icon-edit"></div>
      <span>情報を編集</span>
    </div>
    <div class="edit-menu-item" id="edit-menu-item-delete">
      <div class="edit-menu-icon" id="edit-menu-icon-delete"></div>
      <span>Delete</span>
    </div>
  `;

  document.getElementById('edit-menu-item-edit')?.addEventListener('click', () => {
    openEditSubModal(book);
    closeEditMenu();
  });
  document.getElementById('edit-menu-item-delete')?.addEventListener('click', async () => {
    closeEditMenu();
    await deleteBook(book.id);
    executeSearch();
  });
}

export const closeEditMenu = () => {
  const editMenus = document.querySelectorAll('.edit-menu') as NodeListOf<HTMLElement>;
  if (editMenus.length > 0) {
    editMenus.forEach(menu => {
      menu.remove();
    });
  }
}

function openEditSubModal(book: BookItem) {
  const overlay = document.createElement('div');
  overlay.id = 'sub-modal-overlay';

  const urlItem = book.type === 'web' && book.top_url ?
  `<div class="edit-content-item">
    <p>URL</p>
    <input type="text" id="edit-url-input" value="${book.top_url}" spellcheck="false" autocomplete="off" />
  </div>` : '';

  overlay.innerHTML = `
    <div class="sub-modal">
      <p class="edit-title">情報を編集</p>
      <div class="edit-content">
        <div class="edit-content-item">
          <p>タイトル</p>
          <input type="text" id="edit-title-input" value="${book.title}" spellcheck="false" autocomplete="off" />
        </div>
        ${urlItem}
        <div class="edit-content-item">
          <p>タグ</p>
          <input type="text" id="edit-tags-input" value="${book.tags.join(', ')}" spellcheck="false" autocomplete="off" />
        </div>
      </div>
      <div class="edit-button-container">
        <button id="edit-button-cancel">Cancel</button>
        <button id="edit-button-save">Save</button>
      </div>
    </div>
  `;
  document.querySelector('.main-container')?.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeEditSubModal();
    }
  });
  document.getElementById('edit-button-cancel')?.addEventListener('click', () => {
    closeEditSubModal();
  });
  document.getElementById('edit-button-save')?.addEventListener('click', () => {
    saveBook(book);
    closeEditSubModal();
  });
}

export const closeEditSubModal = () => {
  // 基本は上のopenEditSubModal関数内のイベントリスナでいいけど
  // .tabs-containerの中をクリックしてもとじないのが気になるからchangeModal内に書いておく
  const overlay = document.getElementById('sub-modal-overlay');
  if (overlay) {
    overlay.remove();
  }
}

import { updateBook } from "./db";
import { webData } from "./webData";
import { executeSearch } from "../library";

async function saveBook(book: BookItem) {
  const titleInput = document.getElementById('edit-title-input') as HTMLInputElement;
  const urlInput = document.getElementById('edit-url-input') as HTMLInputElement;
  const tagsInput = document.getElementById('edit-tags-input') as HTMLInputElement;
  if (titleInput && tagsInput) {
    // 値の取得と整形
    const newTitle = titleInput.value.trim();
    const newTags = tagsInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const updatedBook: BookItem = { ...book };
    updatedBook.title = newTitle;
    updatedBook.tags = newTags;

    if (updatedBook.type === 'web' && urlInput) {
      const newUrl = urlInput.value.trim();
      if (newUrl !== updatedBook.top_url) {
        updatedBook.top_url = newUrl;
        const siteData = webData.find(data => newUrl.includes(data.base_url));
        updatedBook.site_type = siteData ? (siteData.id as any) : 'other';
      }
    }
    await updateBook(updatedBook);
  }
  // 描画も必要
  executeSearch();
}