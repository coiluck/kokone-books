// main.ts
import { applyStore } from "./modules/store";
import { setUpSettings } from "./settings";

window.addEventListener("DOMContentLoaded", async () => {
  await applyStore();
  setUpSettings();
});
