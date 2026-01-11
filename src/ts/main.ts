// main.ts
import { applyStore } from "./modules/store";
import { setupTabs } from "./tabs";
import { setUpAdd } from "./add";
import { setUpSettings } from "./settings";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  setupTabs();
  setUpAdd();
  setUpSettings();
});
