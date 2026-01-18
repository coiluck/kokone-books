// main.ts
import { applyStore } from "./modules/store";
import { setupTabs } from "./tabs";
import { initDB } from "./modules/db";
import { setUpLibrary } from "./library";
import { setUpAdd } from "./add";
import { setUpSettings } from "./settings";
import { closeEditMenu } from "./modules/editBook";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  setupTabs();
  await initDB();
  setUpLibrary();
  setUpAdd();
  setUpSettings();
  document.addEventListener('click', () => {
    closeEditMenu();
  });

  listenForShareEvents(async (intent: ShareEvent) => {
    const sharedData = intent.uri; // 共有されたテキスト（URL）
    if (sharedData) {
      changeModal('add', null, 300, true);
      let sharedText: string | null = null;
      const match = intent.uri.match(/S\.android\.intent\.extra\.TEXT=([^;]+)/);
      if (match && match[1]) {
        // URLデコード
        sharedText = decodeURIComponent(match[1]);
        setTimeout(() => {
          const addBookTitle = document.getElementById('add-book-title') as HTMLInputElement;
          if (!addBookTitle) return;
          addBookTitle.value = sharedText || '';
        }, 300);
      }
    }
  });
});

import { listenForShareEvents, type ShareEvent } from "tauri-plugin-sharetarget-api";
import { changeModal } from "./modules/changeModal";

listenForShareEvents(async (intent: ShareEvent) => {
  const sharedData = intent.uri; // 共有されたテキスト（URL）
  if (sharedData) {
    changeModal('add', null, 300, true);
    let sharedText: string | null = null;
    const match = intent.uri.match(/S\.android\.intent\.extra\.TEXT=([^;]+)/);
    if (match && match[1]) {
      // URLデコード
      sharedText = decodeURIComponent(match[1]);
      setTimeout(() => {
        const addBookTitle = document.getElementById('add-book-title') as HTMLInputElement;
        if (!addBookTitle) return;
        addBookTitle.value = sharedText || '';
      }, 300);
    }
  }
});