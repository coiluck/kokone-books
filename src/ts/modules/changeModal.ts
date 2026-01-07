// modules/changeModal.js
export function changeModal(modalName: string, scrollContainer: string | null, duration: number = 500, isFlex: boolean = false) {
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
  }, duration);
}

// 上から重ねるタイプのmodal表示
export function showModal(modalName: string, scrollContainer: string | null, isFlex: boolean = false) {
  const targetModal = document.getElementById(`modal-${modalName}`);
  if (!targetModal) return;

  if (!isFlex){
    targetModal.style.display = 'block';
  } else {
    targetModal.style.display = 'flex';
  }
  targetModal.classList.remove('fade-out');
  targetModal.classList.add('fade-in');

  if (scrollContainer) {
    const container = document.querySelector(scrollContainer) as HTMLElement;
    if (container) {
      container.scrollTop = 0;
    }
  }

  const overlay = document.createElement('div');
  overlay.id = 'sub-modal-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => {
    closeModal(targetModal);
  });
}

let isClosing = false;

function closeModal(targetModal: HTMLElement) {
  if (isClosing) return;
  isClosing = true;
  targetModal.classList.remove('fade-in');
  targetModal.classList.add('fade-out');
  const overlay = document.getElementById('sub-modal-overlay');
  if (overlay) {
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
  }
  setTimeout(() => {
    targetModal.style.display = 'none';
    if (overlay) {
      document.body.removeChild(overlay);
    }
    const activeElements = document.querySelectorAll('.sub-modal .active');
    activeElements.forEach(function(element) {
      (element as HTMLElement).classList.remove('active');
    });
    isClosing = false;
  }, 500);
}