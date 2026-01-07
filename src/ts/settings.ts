// settings.ts
import { settingsState, saveSettingsData } from "./modules/store";

export function setUpSettings() {
  setUpAppearanceSettings();
}

const DEFAULT_VALUE = {
  font: 'mamelon',
  accentColor: '#ff7f7e',
  textColor: '#fff3f1',
  bgColor: '#0a0f1e',
  bgMildLevel: 8,
}
function setUpAppearanceSettings() {
  // font
  const userFont = settingsState.font || DEFAULT_VALUE.font;
  document.documentElement.style.setProperty('--font', userFont);
  const fontSelect = document.getElementById('setting-font-select') as HTMLSelectElement;
  if (fontSelect) {
    fontSelect.value = userFont;
    fontSelect.addEventListener('change', (e) => {
      const selectedFont = (e.target as HTMLSelectElement).value;
      settingsState.font = selectedFont;
      saveSettingsData();
      document.documentElement.style.setProperty('--font', selectedFont);
    });
  }
}