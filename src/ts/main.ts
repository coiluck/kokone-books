// main.ts
import { applyStore } from "./modules/store";
import { setUpSettings } from "./settings";
import { setupTabs } from "./tabs";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  setupTabs();
  setUpSettings();
});
