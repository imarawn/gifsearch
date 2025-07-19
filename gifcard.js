import {showGifDetails} from "./field3.js";

function createGifCard({ slug, url }) {
    const card = document.createElement('div');
    card.className = 'gif-card relative p-2 rounded h-[96px] flex items-center gap-4 cursor-pointer bg-zinc-800 transition-colors';

    const img = document.createElement('img');
    img.src = url;
    img.alt = 'preview';
    img.className = 'max-h-20 max-w-[250px] rounded object-contain';
    img.loading="lazy"

    img.onload = () => {
        const exceeds = img.naturalHeight > 80 || img.naturalWidth > 250;
        card.classList.remove('bg-zinc-800', 'bg-zinc-700');
        card.classList.add(exceeds ? 'bg-red-800' : 'bg-green-800');
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ml-auto flex gap-2';

    const starButton = document.createElement('button');
    starButton.className = 'text-yellow-400 text-xl hover:text-yellow-300 transition';
    starButton.innerText = '⭐';

    const copyButton = document.createElement('button');
    copyButton.className = 'text-white text-lg hover:text-brand transition';
    copyButton.innerText = '📋';
    copyButton.onclick = () => navigator.clipboard.writeText(`:${slug}`);

    const reportButton = document.createElement('button');
    reportButton.className = 'text-white text-lg hover:text-brand transition';
    reportButton.innerText = '⚠️';

    buttonContainer.appendChild(starButton);
    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(reportButton);

    const slugLabel = document.createElement('span');
    slugLabel.className = 'absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium';
    slugLabel.innerText = `:${slug}`;

    card.appendChild(img);
    card.appendChild(buttonContainer);
    card.appendChild(slugLabel);

    card.addEventListener('click', () => {
        showGifDetails(url, slug);
    });

    return card;
}

export function populateGifDisplay(gifArray) {
    const container = document.getElementById('gif-display');
    container.scrollTop = 0;
    container.innerHTML = '';
    gifArray.forEach(gif => {
        container.appendChild(createGifCard(gif));
    });
}
