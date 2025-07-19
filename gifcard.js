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

    buttonContainer.appendChild(starButton);
    buttonContainer.appendChild(copyButton);

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

export function showGifDetails(url, slug) {
    const field3 = document.querySelector('main .grid > div:last-child');
    field3.innerHTML = '';
    field3.innerHTML = `
    <div class="flex flex-col items-center text-center space-y-4">
      <img src="${url}" alt="preview" class="w-full max-h-full rounded shadow-lg" />
      <div class="text-white text-sm font-semibold">${slug}</div>
      <div class="text-zinc-400 text-xs italic">More info coming soon...</div>
    </div>
  `;
}

export function populateGifDisplay(gifArray) {
    const container = document.getElementById('gif-display');
    container.scrollTop = 0;
    container.innerHTML = '';
    gifArray.forEach(gif => {
        container.appendChild(createGifCard(gif));
    });
}
