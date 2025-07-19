import { supabase } from './supabaseclient.js';
import { createGifCard } from './gifcard.js';

// Render favorites of a selected list into field2
export async function loadFavoritesFromList(listName, userId) {
    const { data, error } = await supabase
        .rpc('get_favorites_by_list', {
            p_list: listName,
            p_id: userId
        });

    if (error) {
        console.error(`Error loading favorites for list "${listName}":`, error.message);
        return;
    }

    const container = document.querySelector('main .grid > div:nth-child(2)');
    container.scrollTop = 0;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="text-sm text-zinc-400 p-4">No favorites found in "${listName}".</div>`;
        return;
    }

    data.forEach(({ url, search_slug }) => {
        const card = createGifCard({
            slug: search_slug,
            url: url,
            list: listName
        });
        container.appendChild(card);
    });
}
