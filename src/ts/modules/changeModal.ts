// modules/changeModal.js
import { closeEditSubModal } from "./editBook";

let isChanging: boolean = false;

export function changeModal(modalName: string, scrollContainer: string | null, duration: number = 500, isFlex: boolean = false) {
  if (isChanging) return;
  isChanging = true;

  // sub modalを閉じる
  closeEditSubModal();

  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    (modal as HTMLElement).classList.remove('fade-in');
    (modal as HTMLElement).classList.add('fade-out')
  });
  setTimeout(function() {
    // targetモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      (modal as HTMLElement).style.display = 'none';
    });
    const targetModal = document.getElementById(`modal-${modalName}`);
    if (targetModal) {
      targetModal.classList.remove('fade-out');
      if (isFlex) {
        targetModal.style.display = 'flex';
      } else {
        targetModal.style.display = 'block';
      }
      targetModal.classList.add('fade-in');
    }
    // スクロールをリセット（表示されていないとダメみたい）
    if (scrollContainer) {
      const scrollContainerElement = document.querySelector(`${scrollContainer}`) as HTMLElement;
      if (scrollContainerElement) {
        scrollContainerElement.scrollTop = 0;
      }
    }
    isChanging = false;
  }, duration);
}