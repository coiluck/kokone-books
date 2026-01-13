// main.ts
import { applyStore } from "./modules/store";
import { setupTabs } from "./tabs";
import { initDB } from "./modules/db";
import { setUpLibrary } from "./library";
import { setUpAdd } from "./add";
import { setUpSettings } from "./settings";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  setupTabs();
  await initDB();
  setUpLibrary();
  setUpAdd();
  setUpSettings();
});
