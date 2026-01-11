// add.ts
import { settingsState } from "./modules/store";

export function setUpAdd() {
  setUpInputTags();
  setUpPresetTags();
}

function setUpInputTags() {
  const inputTags = document.getElementById('add-book-tags-input') as HTMLInputElement;
  const inputTagsContainer = document.getElementById('add-book-tags-input-suggestions') as HTMLElement;
  inputTagsContainer.innerHTML = '';
  inputTags.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = inputTags.value.trim();
      inputTags.value = '';
      if (newTag === '') return;
      addTag(inputTagsContainer, newTag, (tagElement) => {
        tagElement.remove();
      });
    }
  });
}

// これはsettingState.presetTagsを変更するときも呼び出す
export function setUpPresetTags() {
  const presetTags = settingsState.presetTags as string[];
  const presetTagsContainer = document.getElementById('add-book-tags-suggestions') as HTMLElement;
  presetTagsContainer.innerHTML = '';
  for (const tag of presetTags) {
    addTag(presetTagsContainer, tag, (tagElement) => {
      tagElement.classList.toggle('active');
    });
  }
}

const addTag = (container: HTMLElement, tag: string, onClick: (element: HTMLElement) => void) => {
  const newTagItem = document.createElement('div');
  newTagItem.className = 'add-book-tag-suggestion';
  newTagItem.textContent = tag;

  newTagItem.addEventListener('click', () => {
    onClick(newTagItem);
  });

  container.appendChild(newTagItem);
}