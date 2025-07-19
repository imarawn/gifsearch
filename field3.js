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