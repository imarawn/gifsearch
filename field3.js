import {supabase} from "./supabaseclient.js";


export async function showGifDetails(url, slug) {
    const field3 = document.querySelector('main .grid > div:last-child');
    field3.innerHTML = '';

    const encoded = btoa(encodeURIComponent(JSON.stringify({ url, slug })));
    const basePath = window.location.pathname.replace(/\/[^\/]*$/, '/');
    const shareUrl = `${basePath}share.html?d=${encoded}`;
    const { data, error } = await supabase.rpc('get_emote_description', { given_slug: slug });
    const description = data?.[0]?.description || 'No description available.';

    field3.innerHTML = `
    <div class="flex flex-col items-center text-center space-y-4">
      <img src="${url}" alt="preview" class="w-full max-h-full rounded shadow-lg" />
      <div class="text-white text-sm font-semibold">${slug}</div>
      <div class="text-zinc-400 text-s italic">${description}</div>
      <button id="share-btn" class="mt-2 px-4 py-2 bg-brand text-black rounded hover:brightness-110 transition">
        🔗 Share
      </button>
    </div>
  `;

    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    url: shareUrl,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Copied to clipboard. Your browser does not support the share dialog.');
        }
    });
}
