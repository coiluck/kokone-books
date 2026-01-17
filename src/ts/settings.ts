// settings.ts
import { settingsState, saveSettingsData } from "./modules/store";

export function setUpSettings() {
  setUpAppearanceSettings();
  setUpAppSettings();
  setUpLibrarySettings();
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

import { setUpLibrary } from "./library";
import { showMessage } from "./modules/message";

function setUpLibrarySettings() {
  // is need icon
  const isNeedIconCheckbox = document.getElementById('setting-is-need-icon') as HTMLInputElement;
  if (isNeedIconCheckbox) {
    isNeedIconCheckbox.checked = settingsState.isNeedIcon ?? true;
    isNeedIconCheckbox.addEventListener('change', (e) => {
      settingsState.isNeedIcon = (e.target as HTMLInputElement).checked;
      saveSettingsData();
      setUpLibrary();
    });
  }
  const defaultSearchPositiveTagsContainer = document.getElementById('setting-default-search-positive-tags-container') as HTMLElement;
  const defaultSearchPositiveTagsInput = document.getElementById('setting-default-search-positive-tags') as HTMLInputElement;
  const defaultSearchNegativeTagsContainer = document.getElementById('setting-default-search-negative-tags-container') as HTMLElement;
  const defaultSearchNegativeTagsInput = document.getElementById('setting-default-search-negative-tags') as HTMLInputElement;

  const addDefaultSearchTags = (tag: string, type: 'positive' | 'negative') => {
    const containerElement = type === 'positive' ? defaultSearchPositiveTagsContainer : defaultSearchNegativeTagsContainer;
    const inputElement = type === 'positive' ? defaultSearchPositiveTagsInput : defaultSearchNegativeTagsInput;
    const newTagItem = document.createElement('div');
    newTagItem.className = 'setting-default-search-tag-item';
    newTagItem.textContent = tag;
    newTagItem.addEventListener('click', () => {
      removeDefaultSearchTags(newTagItem, type);
    });
    containerElement.insertBefore(newTagItem, inputElement);
  }
  const removeDefaultSearchTags = (tagItem: HTMLElement, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      settingsState.defaultSearchPositiveTags = settingsState.defaultSearchPositiveTags.filter(
        tag => tag !== tagItem.textContent
      );
    } else {
      settingsState.defaultSearchNegativeTags = settingsState.defaultSearchNegativeTags.filter(
        tag => tag !== tagItem.textContent
      );
    }
    saveSettingsData();
    tagItem.remove();
  }

  // default search positive tags
  if (defaultSearchPositiveTagsInput) {
    for (const tag of settingsState.defaultSearchPositiveTags) {
      addDefaultSearchTags(tag, 'positive');
    }
    defaultSearchPositiveTagsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && defaultSearchPositiveTagsInput.value.trim() !== '') {
        const newTag = defaultSearchPositiveTagsInput.value.trim();
        defaultSearchPositiveTagsInput.value = '';
        if (settingsState.defaultSearchPositiveTags.includes(newTag)) {
          // すでに存在する場合
          showMessage(`#${newTag} はすでに登録されています`);
          return;
        }
        settingsState.defaultSearchPositiveTags.push(newTag);
        saveSettingsData();
        addDefaultSearchTags(newTag, 'positive');
      }
    });
  }
  // default search negative tags
  if (defaultSearchNegativeTagsInput) {
    for (const tag of settingsState.defaultSearchNegativeTags) {
      addDefaultSearchTags(tag, 'negative');
    }
  }
  defaultSearchNegativeTagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && defaultSearchNegativeTagsInput.value.trim() !== '') {
      const newTag = defaultSearchNegativeTagsInput.value.trim();
      defaultSearchNegativeTagsInput.value = '';
      if (settingsState.defaultSearchNegativeTags.includes(newTag)) {
        // すでに存在する場合
        showMessage(`#${newTag} はすでに登録されています`);
        return;
      }
      settingsState.defaultSearchNegativeTags.push(newTag);
      saveSettingsData();
      addDefaultSearchTags(newTag, 'negative');
    }
  });
}

import { setUpPresetTags } from "./add";

function setUpAddSettings() {
  // auto input
  const autoInputSelect = document.getElementById('setting-auto-input') as HTMLSelectElement;
  if (autoInputSelect) {
    autoInputSelect.value = settingsState.autoInput ?? 'Focus';
    autoInputSelect.addEventListener('change', (e) => {
      const selectedAutoInput = (e.target as HTMLSelectElement).value;
      settingsState.autoInput = selectedAutoInput as 'Focus' | 'Off';
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
        showMessage(`#${newTag} はすでに登録されています`);
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
import { exportDatabase, importDatabase } from "./modules/db";

function setUpOtherSettings() {
  // app version
  const appVersion = document.getElementById('setting-app-version') as HTMLElement;
  if (appVersion) {
    appVersion.textContent = packageJson.version;
  }
  // export
  const exportDatabaseButton = document.getElementById('setting-export-database') as HTMLButtonElement;
  if (exportDatabaseButton) {
    exportDatabaseButton.addEventListener('click', () => {
      exportDatabase();
    });
  }
  // import
  const importDatabaseButton = document.getElementById('setting-import-database') as HTMLButtonElement;
  if (importDatabaseButton) {
    importDatabaseButton.addEventListener('click', () => {
      importDatabase();
    });
  }
}