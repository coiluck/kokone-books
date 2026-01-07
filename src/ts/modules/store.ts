// store.ts
import { Store } from '@tauri-apps/plugin-store';

interface SettingsState {
  activeTab: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  bgMildLevel: number;
}

const initialSettingsState: SettingsState = {
  activeTab: 'add',
  accentColor: '#ff7f7e',
  textColor: '#fff3f1',
  bgColor: '#0a0f1e',
  bgMildLevel: 0.05,
};

export const settingsState = structuredClone(initialSettingsState);

let settingsStoreCache: Store | null = null;

async function getSettingsStore(): Promise<Store> {
  if (!settingsStoreCache) {
    settingsStoreCache = await Store.load('settings.json');

    // 初期値
    const existing = await settingsStoreCache.get<SettingsState>('settings');
    if (!existing) {
      console.log('初期値を設定');
      await settingsStoreCache.set('settings', initialSettingsState);
      await settingsStoreCache.save();
    }
  }
  return settingsStoreCache;
}

export async function saveSettingsData() {
  const store = await getSettingsStore();
  await store.set('settings', settingsState);
  await store.save();
}