// settings.ts
import { settingsState, saveSettingsData } from "./modules/store";

export function setUpSettings() {
  setUpAppearanceSettings();
  setUpAppSettings();
  setUpAddSettings();
  setUpOtherSettings();
}

import { updateColor } from "./modules/color";

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
    // イベントリスナ
    fontSelect.addEventListener('change', (e) => {
      const selectedFont = (e.target as HTMLSelectElement).value;
      settingsState.font = selectedFont;
      saveSettingsData();
      document.documentElement.style.setProperty('--font', selectedFont);
    });
  }
  // color
  const inputs = {
    accent: document.querySelector('input[name="accent"]') as HTMLInputElement,
    text: document.querySelector('input[name="text"]') as HTMLInputElement,
    bg: document.querySelector('input[name="bg"]') as HTMLInputElement,
    bgMild: document.querySelector('input[name="bg-mild-level"]') as HTMLInputElement,
  };
  const labels = {
    accent: document.querySelector('#setting-color-accent .setting-color-value') as HTMLElement,
    text: document.querySelector('#setting-color-text .setting-color-value') as HTMLElement,
    bg: document.querySelector('#setting-color-bg .setting-color-value') as HTMLElement,
    bgMild: document.getElementById('setting-bg-mild-value') as HTMLElement,
  };
  // 初期値の適用
  inputs.accent.value = settingsState.accentColor || DEFAULT_VALUE.accentColor;
  inputs.text.value = settingsState.textColor || DEFAULT_VALUE.textColor;
  inputs.bg.value = settingsState.bgColor || DEFAULT_VALUE.bgColor;
  inputs.bgMild.value = String(settingsState.bgMildLevel || DEFAULT_VALUE.bgMildLevel);

  labels.accent.textContent = settingsState.accentColor || DEFAULT_VALUE.accentColor;
  labels.text.textContent = settingsState.textColor || DEFAULT_VALUE.textColor;
  labels.bg.textContent = settingsState.bgColor || DEFAULT_VALUE.bgColor;
  labels.bgMild.textContent = String(settingsState.bgMildLevel || DEFAULT_VALUE.bgMildLevel);

  updateColor();
  // イベントリスナ
  inputs.accent.addEventListener('input', updateColor);
  inputs.text.addEventListener('input', updateColor);
  inputs.bg.addEventListener('input', updateColor);
  inputs.bgMild.addEventListener('input', updateColor);

  document.getElementById('setting-reset')?.addEventListener('click', () => {
    inputs.accent.value = DEFAULT_VALUE.accentColor;
    inputs.text.value = DEFAULT_VALUE.textColor;
    inputs.bg.value = DEFAULT_VALUE.bgColor;
    inputs.bgMild.value = `${String(DEFAULT_VALUE.bgMildLevel)}%`;
    updateColor();
  });
}

function setUpAppSettings() {
  const firstTabSelect = document.getElementById('setting-first-tab-select') as HTMLSelectElement;
  if (firstTabSelect) {
    firstTabSelect.value = settingsState.activeTab ?? 'add';
    firstTabSelect.addEventListener('change', (e) => {
      const selectedTab = (e.target as HTMLSelectElement).value;
      settingsState.activeTab = selectedTab;
      saveSettingsData();
    });
  }
}

import { setUpPresetTags } from "./add";

function setUpAddSettings() {
  // auto input
  const autoInputSelect = document.getElementById('setting-auto-input') as HTMLSelectElement;
  if (autoInputSelect) {
    autoInputSelect.value = settingsState.autoInput ?? 'Focus';
    autoInputSelect.addEventListener('change', (e) => {
      const selectedAutoInput = (e.target as HTMLSelectElement).value;
      settingsState.autoInput = selectedAutoInput as 'Tab' | 'Focus' | 'Off';
      saveSettingsData();
    });
  }
  // auto input only url
  const autoInputOnlyUrlCheckbox = document.getElementById('setting-auto-input-only-url') as HTMLInputElement;
  if (autoInputOnlyUrlCheckbox) {
    autoInputOnlyUrlCheckbox.checked = settingsState.autoInputOnlyUrl ?? true;
    autoInputOnlyUrlCheckbox.addEventListener('change', (e) => {
      settingsState.autoInputOnlyUrl = (e.target as HTMLInputElement).checked;
      saveSettingsData();
    });
  }
  // preset tags
  const presetTagsInput = document.getElementById('setting-preset-tags') as HTMLInputElement;
  const presetTagsContainer = document.getElementById('setting-preset-tags-container') as HTMLElement;
  if (!presetTagsInput || !presetTagsContainer) return

  // 追加
  const addTag = (newTag: string) => {
    const newTagItem = document.createElement('div');
    newTagItem.className = 'setting-tag-item';
    newTagItem.textContent = newTag;
    newTagItem.addEventListener('click', () => {
      removePresetTag(newTagItem);
      setUpPresetTags();
    });
    presetTagsContainer.appendChild(newTagItem);
  }
  // 削除
  const removePresetTag = (tagItem: HTMLElement) => {
    settingsState.presetTags = settingsState.presetTags.filter(tag => tag !== tagItem.textContent);
    saveSettingsData();
    tagItem.remove();
  }

  // 初期値の適用
  for (const tag of settingsState.presetTags) {
    addTag(tag);
  }

  // 追加用のイベントリスナ
  presetTagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && presetTagsInput.value.trim() !== '') {
      const newTag = presetTagsInput.value.trim();
      presetTagsInput.value = '';
      if (settingsState.presetTags.includes(newTag)) {
        // すでに存在する場合
        // 後で書く
        return;
      }
      settingsState.presetTags.push(newTag);
      saveSettingsData();
      addTag(newTag);
      setUpPresetTags();
    }
  });
}

import packageJson from '../../package.json';

function setUpOtherSettings() {
  // app version
  const appVersion = document.getElementById('setting-app-version') as HTMLElement;
  if (appVersion) {
    appVersion.textContent = packageJson.version;
  }
  // export
  // import
}