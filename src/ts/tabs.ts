// tabs.ts
import { settingsState } from "./modules/store";
import { changeModal } from "./modules/changeModal";

const tabs = document.querySelectorAll(".tab-item");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    checkActiveTab(tab);
    changeModal((tab as HTMLElement).dataset.modal as string, null, 300, true);
  });
});

function checkActiveTab(tab: Element) {
  document.querySelectorAll(".tab-item").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
}

export function setupTabs() {
  const userActiveTab: string = settingsState.activeTab || "add";
  const initialTab = document.querySelector(`.tab-item.${userActiveTab}`);
  if (initialTab) {
    checkActiveTab(initialTab);
    changeModal(userActiveTab as string, null, 300, true);
  }
}