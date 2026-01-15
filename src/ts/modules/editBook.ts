// editBook.ts
import { BookItem } from "./db";

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
    console.log('edit');
    closeEditMenu();
  });
  document.getElementById('edit-menu-item-delete')?.addEventListener('click', () => {
    console.log('delete');
    closeEditMenu();
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