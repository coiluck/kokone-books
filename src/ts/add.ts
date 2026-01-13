// add.ts
import { v4 as uuid } from 'uuid';
import { addBook } from "./modules/db";
import { settingsState } from "./modules/store";
import { getWebData } from "./modules/webData"

export function setUpAdd() {
  setUpInputTags();
  setUpPresetTags();

  const addBookCancel = document.getElementById('add-book-cancel') as HTMLButtonElement;
  addBookCancel.addEventListener('click', () => {
    resetAddBookTab();
  });
  const addBookSubmit = document.getElementById('add-book-submit') as HTMLButtonElement;
  addBookSubmit.addEventListener('click', async () => {
    const id = uuid();
    const tagsArray = getTags();
    const inputTitleValue = (document.getElementById('add-book-title') as HTMLInputElement).value.trim();
    const isWeb = URL.canParse(inputTitleValue);
    const bookDetails = isWeb
  ? await getWebData(inputTitleValue)
  : {
      type: 'physical' as const,
      title: inputTitleValue,
      top_url: null,
      site_type: null
    };
    addBook({
      id: id,
      ...bookDetails,
      tags: tagsArray || [],
      created_at: new Date().toISOString()
    });
    resetAddBookTab();
  });
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
  newTagItem.dataset.tag = tag;
  newTagItem.addEventListener('click', () => {
    onClick(newTagItem);
  });
  container.appendChild(newTagItem);
}

const getTags = () => {
  const manualTags = document.querySelectorAll('#add-book-tags-input-suggestions .add-book-tag-suggestion');
  const activePresetTags = document.querySelectorAll('#add-book-tags-suggestions .add-book-tag-suggestion.active');
  const allTags = [...Array.from(manualTags), ...Array.from(activePresetTags)];
  const result: string[] = [];
  for (const tagElement of allTags) {
    const tag = (tagElement as HTMLElement).dataset.tag;
    if (tag) result.push(tag);
  }
  return result;
}

const resetAddBookTab = () => {
  const inputTitle = document.getElementById('add-book-title') as HTMLInputElement;
  const inputTags = document.getElementById('add-book-tags-input') as HTMLInputElement;
  const inputTagsContainer = document.getElementById('add-book-tags-input-suggestions') as HTMLElement;
  inputTitle.value = '';
  inputTags.value = '';
  inputTagsContainer.innerHTML = '';
  setUpPresetTags();
};
