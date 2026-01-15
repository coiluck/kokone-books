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
});
