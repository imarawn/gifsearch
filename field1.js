import { supabase } from './supabaseclient.js';
import {loadFavoritesFromList} from "./renderfavorites.js";

async function loadUserLists(userId) {
    const { data, error } = await supabase.rpc('get_user_lists', { p_id: userId });

    if (error) {
        console.error('Error loading lists:', error.message);
        return [];
    }

    console.log(data);
    return [...new Set(data.map(item => item.list))];
}

export async function renderUserLists(anonId) {
    const lists = await loadUserLists(anonId);
    const container = document.querySelector('main .grid > div:first-child');
    container.innerHTML = '';

    if (lists.length === 0) {
        container.innerHTML = '<div class="text-sm text-zinc-400">No lists found</div>';
        return;
    }

    // 🔤 Sort lists alphabetically (case-insensitive)
    lists.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    for (const listName of lists) {
        const previewUrl = await getFirstEmoteOfList(listName, anonId);
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3 p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 cursor-pointer';

        div.innerHTML = `
            ${previewUrl ? `<img src="${previewUrl}" class="w-10 h-10 rounded object-cover" alt="preview" />` : ''}
            <span class="text-sm font-medium">${listName}</span>
        `;

        div.addEventListener('click', () => {
            loadFavoritesFromList(listName, anonId);
        });

        container.appendChild(div);
    }
}


async function getFirstEmoteOfList(listName, userId) {
    const { data, error } = await supabase.rpc('get_first_emote_of_list', {
        p_list: listName,
        p_id: userId
    });

    if (error) {
        console.warn(`No preview for list "${listName}":`, error.message);
        return null;
    }

    return data ?? null;
}

