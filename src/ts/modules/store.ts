// store.ts
import { Store } from '@tauri-apps/plugin-store';

interface SettingsState {
  activeTab: string;
}

const initialSettingsState: SettingsState = {
  activeTab: 'home',
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