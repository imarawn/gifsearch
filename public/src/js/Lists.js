import { supabase } from './Database.js';
import { showFavorites } from './Favorites.js';
import { checkSession } from './Auth.js';

export async function getUserLists() {
    const user = await checkSession();
    if (!user) return [];

    const { data: lists, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching lists:', error);
        return [];
    }
    return lists;
}

export async function createNewList(listName) {
    const user = await checkSession();
    if (!user) {
        console.error('User not logged in');
        return null;
    }

    const { data: newList, error } = await supabase
        .from('lists')
        .insert([{ user_id: user.id, name: listName }])
        .select();

    if (error) {
        console.error('Error creating new list:', error);
        return null;
    }
    return newList[0];
}

export async function showListEmotes() {
    const listId = document.getElementById('list-picker').value;
    const emotesDiv = document.getElementById('favorite-emotes');

    if (!listId) {
        emotesDiv.innerHTML = '<p>Please select a list to see the emotes.</p>';
        return;
    }

    emotesDiv.innerHTML = '';

    try {
        const { data: emotes, error } = await supabase
            .from('favorites')
            .select('slug, url')
            .eq('list', listId);

        if (error) {
            console.error('Error fetching emotes for list:', error);
            await showFavorites();
            return;
        }

        if (emotes.length > 0) {
            emotes.forEach((emote) => displayEmote(emote, emotesDiv));
        } else {
            emotesDiv.innerHTML = '<p>No emotes found in this list.</p>';
        }
    } catch (error) {
        console.error('Unexpected error fetching emotes:', error);
        emotesDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}

export async function populateListPicker() {
    const listPicker = document.getElementById('list-picker');
    if (!listPicker) return;

    listPicker.innerHTML = '<option value="">-- Select a List --</option>';

    const lists = await getUserLists(); // Ensure `getUserLists()` is imported

    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        listPicker.appendChild(option);
    });
}
