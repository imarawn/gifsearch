import { copyToClipboard } from './Utils.js';
import {fetchSingleEmote, searchSimilarGifs} from "./GIFs";

export async function renderHistory() {
    const historyDiv = document.getElementById('history').querySelector('.history-content');
    const history = JSON.parse(localStorage.getItem('history')) || [];
    historyDiv.innerHTML = '';

    for (const entry of history) {
        const box = document.createElement('div');
        box.className = entry.type === 'gif' ? 'emote-box' : 'slug-box emote-box';
        box.setAttribute('title', `:${entry.slug || entry.gif}`);

        if (entry.type === 'gif') {
            const emote = await fetchSingleEmote(entry.gif); // ✅ Properly awaiting the response
            if (emote) {
                box.innerHTML = `<img src="${emote.url}" alt="${entry.gif}">
                                <div class="emote-name">:${entry.gif}</div>`;
                box.addEventListener('click', () => copyToClipboard(`:${entry.slug}`, emote.url));
            } else {
                box.textContent = `Failed to load GIF: ${entry.gif}`;
            }
        } else {
            box.textContent = entry.slug;
            box.addEventListener('click', () => {
                navigator.clipboard.writeText(entry.slug);
                document.getElementById('manual-slug-input').value = entry.slug;
            });
        }
        historyDiv.appendChild(box);
    }
}

export function deleteHistory() {
    const historyDiv = document.getElementById('history')?.querySelector('.history-content');
    if (!historyDiv) return;

    historyDiv.classList.add('shrink');
    historyDiv.addEventListener('transitionend', () => {
        localStorage.removeItem('history');
        historyDiv.classList.remove('shrink');
        renderHistory();
    }, { once: true });
}

export function displayEmote(emote, parentElement) {
    const emoteBox = document.createElement('div');
    emoteBox.className = 'emote-box visible';

    emoteBox.innerHTML = `
        <div class="image-container">
            <img src="${emote.url}" alt="${emote.slug}" class="emote-img">
        </div>
        <div class="details-container">
            <div class="emote-name">:${emote.slug}</div>
            <div class="button-container">
                <button class="button dimensions-button" title="_" data-translate-title="buttons.dimensionsButton">
                    Calculating...
                </button>
                <button class="share-button tinybutton button" title="" data-translate-title="buttons.shareButtonGif" onclick="share(true, '${emote.slug}')"></button>
                <button class="search-button tinybutton button" title="_" data-translate-title="buttons.similarButton" onclick="searchSimilarGifs('${emote.slug}')"></button>
                <button class="change-list-button button tinybutton" title="_" data-translate-title="buttons.change-list-button"></button>
            </div>
        </div>
        <button class="visible-button tinybutton button" title="_" data-translate-title="buttons.visibleButton"></button>
        <button class="favorite-button" title="_" data-translate-title="buttons.favoriteAdd">☆</button>
    `;

    parentElement.appendChild(emoteBox);

    const imgElement = emoteBox.querySelector('.emote-img');
    const dimensionsButton = emoteBox.querySelector('.dimensions-button');

    imgElement.onload = function () {
        const width = imgElement.naturalWidth;
        const height = imgElement.naturalHeight;
        dimensionsButton.textContent = `${width}x${height}`;

        // ✅ If image is too large, highlight in red
        if (width > 250 || height > 80) {
            emoteBox.style.backgroundColor = 'red';
        }
        imgElement.addEventListener('click', () => {
            copyToClipboard(`:${emote.slug}`, emote.url);
        });

        growGifOnLoad(imgElement);
    };
}






export function menuButton() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        console.error("⚠️ #menu-container not found!");
        return;
    }

    // Select all direct child elements inside #menu-container except #menuButton
    const menuItems = menuContainer.querySelectorAll(':scope > *:not(#menuButton)');

    if (menuItems.length === 0) {
        console.warn("⚠️ No menu items found inside #menu-container!");
        return;
    }

    // Toggle visibility for all elements inside #menu-container except #menuButton
    menuItems.forEach(item => {
        // If it's the language picker, toggle only its inner buttons but keep the container
        if (item.classList.contains('language-picker')) {
            const languageButtons = item.querySelectorAll('.flag-button'); // All language options
            languageButtons.forEach(langBtn => {
                langBtn.classList.toggle('hidden'); // Hide/Show language buttons
            });
        } else {
            item.classList.toggle('hidden'); // Hide/Show other menu items
        }
    });
}

export function growGifOnLoad(imgElement) {
    const emoteBox = imgElement.closest('.emote-box');
    if (emoteBox) {
        emoteBox.classList.add('visible'); // Ensures visibility after loading
    }
}
