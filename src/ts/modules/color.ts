// color.ts
import { settingsState, saveSettingsData } from "./store";

export function updateColor() {
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

  // label
  labels.accent.textContent = inputs.accent.value;
  labels.text.textContent = inputs.text.value;
  labels.bg.textContent = inputs.bg.value;
  labels.bgMild.textContent = `${inputs.bgMild.value}%`;

  settingsState.accentColor = inputs.accent.value;
  settingsState.textColor = inputs.text.value;
  settingsState.bgColor = inputs.bg.value;
  settingsState.bgMildLevel = parseInt(inputs.bgMild.value.replace('%', ''));

  document.documentElement.style.setProperty('--accent', settingsState.accentColor);
  document.documentElement.style.setProperty('--text', settingsState.textColor);
  document.documentElement.style.setProperty('--bg', settingsState.bgColor);
  const isBbright = judgeBrightness(settingsState.bgColor);
  if (isBbright) {
    const mildBg = makeMildBg(settingsState.bgColor, 'darker', settingsState.bgMildLevel);
    document.documentElement.style.setProperty('--bg-mild', mildBg);
    document.documentElement.style.setProperty('--bg-hover', 'rgba(0, 0, 0, 0.1)');
  } else {
    const mildBg = makeMildBg(settingsState.bgColor, 'lighter', settingsState.bgMildLevel);
    document.documentElement.style.setProperty('--bg-mild', mildBg);
    document.documentElement.style.setProperty('--bg-hover', 'rgba(255, 255, 255, 0.1)');
  }
  saveSettingsData();
}



function judgeBrightness(color: string): boolean {
  const match = color.match(/\w\w/g);

  if (!match) {
    throw new Error("Invalid color format");
  }

  const rgb = match.map(hex => parseInt(hex, 16)); // [r, g, b]
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128;
}

function makeMildBg(baseColor: string, mode: 'lighter' | 'darker', percent: number): string {
  // RGBに変換
  const match = baseColor.match(/\w\w/g);

  if (!match) {
    throw new Error("Invalid color format");
  }

  let rgb = match.map(hex => parseInt(hex, 16));
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  // HSLに変換
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h: number = 0;
  let s: number = 0;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // 無彩色
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // 輝度を調整
  const adjustment = mode === 'lighter' ? (percent / 100) : -(percent / 100);
  l = Math.max(0, Math.min(1, l + adjustment));

  // RGBに戻す
  let r2: number, g2: number, b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1/3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1/3);
  }

  // 16進数に戻す
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}