async function showFavorites() {
    const desktopFavorites = document.getElementById('favorite-emotes');
    const listPicker = document.getElementById('list-picker');
    const selectedListId = listPicker.value; // Get the selected list ID

    desktopFavorites.innerHTML = ''; // Clear the current favorites

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        displayNoFavoritesMessage(desktopFavorites);
        return;
    }

    // Filter the favorites based on the selected list (if any)
    const filteredFavorites = selectedListId
        ? favorites.filter(favorite => favorite.list === selectedListId)
        : favorites;

    // If no favorites for the selected list, show the "No favorites" message
    if (filteredFavorites.length === 0) {
        const noFavoritesMessage = document.createElement('p');
        noFavoritesMessage.textContent = selectedListId ? 'No favorites in this list.' : 'No favorites added yet.';
        noFavoritesMessage.className = 'no-favorites-message';
        desktopFavorites.appendChild(noFavoritesMessage);
        return;
    }

    const sortedFavorites = filteredFavorites.sort((a, b) => a.slug.localeCompare(b.slug));

    // Display the sorted favorites
    sortedFavorites.forEach(emote => {
        displayEmote(emote, desktopFavorites);
        const star = document.querySelector('.favorite-button');
        star.addEventListener('click', () => {
            addToFavorites(emote);
        });
    });
}

function displayNoFavoritesMessage(container) {
    const noFavoritesMessage = document.createElement('p');
    noFavoritesMessage.textContent = 'No favorites added yet.';
    noFavoritesMessage.className = 'no-favorites-message';
    container.appendChild(noFavoritesMessage);
}

async function renderUserGifs(table_name) {
    const resultsDiv = document.getElementById('results'); // The div where the GIFs will be displayed

    // Clear previous results
    resultsDiv.innerHTML = '';
    // Fetch the GIFs from the user_emoticons table for the authenticated user
    try {
        const { data: gifs, error } = await supabase
            .from(table_name)
            .select('slug, url') // Fetch the slug and URL of the GIFs

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = '<p>Error fetching GIFs. Please try again later.</p>';
            return;
        }

        // If GIFs exist, display them
        if (gifs && gifs.length > 0) {
            gifs.forEach((gif) => {
                displayEmote(gif, resultsDiv); // Use the existing displayEmote function
            });
        } else {
            resultsDiv.innerHTML = '<p>No GIFs found for this user.</p>';
        }
    } catch (err) {
        console.error('Unexpected error fetching GIFs:', err);
        resultsDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}

function toggleFavorite(emote, list = null) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Check if the emote is already in favorites
    const isAlreadyFavorited = favorites.some(favorite => favorite.slug === emote.slug);

    if (isAlreadyFavorited) {
        // If it is, remove it
        const updatedFavorites = favorites.filter(favorite => favorite.slug !== emote.slug);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        removeSingleFavorite(emote);
    } else {
        // If it's not, add it
        favorites.push(emote);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (checkSession()) {
            syncSingleFavorite(emote, list);  // Pass the list
        } else {
            syncSingleFavorite(emote);
        }
    }

    updateFavoritesCounter(); // Update the favorites counter
    showFavorites(); // Refresh the favorites list
}


function openmobilefavorites() {
    const favoritesSection = document.getElementById('favorites');
    favoritesSection.classList.toggle('mobile-favorites-open');
    const overlay = document.getElementById('favorites-overlay');
    overlay.classList.toggle('open');
}

function downloadFavorites() {
    // Retrieve the favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        alert('No favorites to download.');
        return;
    }

    // Extract the URLs from the favorites
    const favoriteUrls = favorites.map(favorite => favorite.slug);

    // Create a blob from the URLs
    const blob = new Blob([favoriteUrls.join('\n')], { type: 'text/plain' });

    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'favorites.txt';
    document.body.appendChild(a);

    // Programmatically click the link to trigger the download
    a.click();

    // Remove the link from the document
    document.body.removeChild(a);
}

async function deleteFavorites() {
    // Retrieve the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('User not authenticated:', authError?.message || '');
        return;
    }

    // Remove the favorites from Supabase
    const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

    if (deleteError) {
        console.error('Error deleting favorites from Supabase:', deleteError);
        return;
    }

    console.log('Favorites deleted from Supabase successfully');

    // Remove the favorites from localStorage
    localStorage.removeItem('favorites');
    updateFavoritesCounter();
    showFavorites(); // Refresh the UI after deletion
}


async function syncSingleFavorite(favorite, list) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Syncing favorite:', favorite);

    // Use upsert to avoid checking first
    const { error: insertError } = await supabase
        .from('favorites')
        .upsert({
            user_id: user.id,
            slug: favorite.slug,
            url: favorite.url,
            list: list.id,
        }, { onConflict: ['user_id', 'slug'] });

    if (insertError) {
        console.error('Error adding favorite to Supabase:', insertError);
        return;
    }

    console.log('Favorite synchronized successfully:', favorite);
}

async function removeSingleFavorite(favorite) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Removing favorite:', favorite);

    const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('slug', favorite.slug);

    if (deleteError) {
        console.error('Error deleting favorite from Supabase:', deleteError);
        return;
    }

    console.log('Favorite removed successfully:', favorite);
}

async function loadFavoritesFromSupabase() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    const { data: favorites, error: fetchError } = await supabase
        .from('favorites')
        .select('slug, url')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    console.log('Fetched favorites from Supabase:', favorites);


    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Favorites loaded from Supabase:', favorites);
    console.log(localStorage.getItem('favorites'));
    showFavorites();
}

async function syncFavorites() {
    const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error('User not logged in:', error?.message || '');
        openLoginModal()
        return;
    }

    // Get existing favorites from Supabase
    const { data: supabaseFavorites, error: fetchError } = await supabase
        .from('favorites')
        .select('slug')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    const existingSlugs = new Set(supabaseFavorites.map(fav => fav.slug));

    const favoritesToAdd = localFavorites
        .filter(localFav => !existingSlugs.has(localFav.slug))
        .map(fav => ({
            user_id: user.id,
            slug: fav.slug,
            url: fav.url,
        }));

    if (favoritesToAdd.length > 0) {
        const { error: insertError } = await supabase
            .from('favorites')
            .insert(favoritesToAdd);

        if (insertError) {
            console.error('Error adding favorites to Supabase:', insertError);
            return;
        }
    }

    console.log('Favorites synchronized successfully');
    localStorage.removeItem('favorites');
}

async function getUserLists() {
    const user = await checkSession(); // Check if user is logged in
    if (!user) return []; // If not logged in, return empty array

    const { data: lists, error } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching lists:', error);
        return [];
    }
    console.log('Lists:', lists);
    return lists;
}

async function createNewList(listName) {
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
    console.log(newList.id);
    return newList[0];
}

async function promptListSelection(emote) {
    const user = await checkSession();
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isAlreadyFavorited = favorites.some(favorite => favorite.slug === emote.slug);

    if (!user || isAlreadyFavorited) {
        // User is not logged in or emote already favorited, toggle favorite
        toggleFavorite(emote);
        return;
    }

    // Fetch user lists from Supabase
    const lists = await getUserLists();

    // Get the dialog and list container elements
    const dialog = document.getElementById('list-selection-dialog');
    const listOptionsContainer = document.getElementById('list-options-container');
    listOptionsContainer.innerHTML = '';  // Clear previous list items

    // Create a list of clickable list options
    lists.forEach(list => {
        const listButton = document.createElement('button');
        listButton.textContent = list.name;
        listButton.addEventListener('click', () => handleListSelection(emote, list));
        listOptionsContainer.appendChild(listButton);
    });

    // Show the dialog
    dialog.classList.add('show');

    // Handle creating a new list
    document.getElementById('create-new-list-button').addEventListener('click', async () => {
        const newListName = document.getElementById('new-list-name').value.trim();
        if (newListName) {
            const newList = await createNewList(newListName);
            if (newList) {
                handleListSelection(emote, newList);
            }
        }
    });

    // Close the dialog
    document.getElementById('close-dialog-button').addEventListener('click', () => {
        dialog.classList.remove('show');
    });
}

async function handleListSelection(emote, list) {
    // Now that a list has been selected or created, toggle the favorite
    toggleFavorite(emote, list);

    // Close the dialog after selection
    const dialog = document.getElementById('list-selection-dialog');
    dialog.classList.remove('show');
}


async function changeFavoriteList(emote) {
    const user = await checkSession();

    if (!user) {
        console.error('User not logged in');
        return;
    }

    // Get user lists from Supabase
    const lists = await getUserLists();

    // Prepare list options
    let listOptions = lists.map(list => list.name).join('\n');
    listOptions += lists.length > 0
        ? '\nOr enter a new name to create a list\nOr leave blank to remove from all lists'
        : 'No lists found. Enter a name to create a new list.\nOr leave blank to remove from all lists.';

    // Prompt user for list selection or new list name
    let selectedListName = prompt(
        'Choose a list or enter a new name:\n' + listOptions
    );

    // If user cancels or leaves input blank, remove from all lists
    if (selectedListName === null || selectedListName.trim() === '') {
        console.log('No list selected. Removing from all lists.');
        await updateFavoriteList(emote, null, user);  // Remove from all lists
        return;
    }

    // Check if the list already exists
    let selectedList = lists.find(list => list.name === selectedListName);

    if (!selectedList) {
        // If the list is new, create it
        selectedList = await createNewList(selectedListName);

        if (!selectedList) {
            console.error('Failed to create new list');
            return;
        }
    }

    // Now that we have a list, update the favorite
    console.log('Selected list:', selectedList);
    await updateFavoriteList(emote, selectedList, user);
}


async function updateFavoriteList(emote, list = null, user) {
    console.log('Updating favorite list:', emote);

    // If list is null or undefined, we exit early
    if (!list) {
        console.log('No valid list selected. Skipping update.');
        return;
    }

    // Update the favorite with the new list
    const { error: updateError } = await supabase
        .from('favorites')
        .update({
            list: list.id  // Ensure list.id is being passed
        })
        .eq('user_id', user.id)
        .eq('slug', emote.slug);

    if (updateError) {
        console.error('Error updating favorite list in Supabase:', updateError);
        return;
    }

    console.log('Favorite list updated successfully:', emote);

    // Refresh the favorites view
    showFavorites();
}

async function getUserListsPicker() {
    const user = await checkSession(); // Check if user is logged in
    if (!user) return []; // If not logged in, return empty array

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

async function populateListPicker() {
    const lists = await getUserLists(); // Fetch user lists from the database
    const listPicker = document.getElementById('list-picker');

    // Clear the dropdown options
    listPicker.innerHTML = '<option value="">-- Select a List --</option>';

    // Add options for each list in the dropdown
    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.id;
        option.textContent = list.name;
        listPicker.appendChild(option);
    });

    // Add event listener for the list picker to filter favorites when changed
    listPicker.addEventListener('change', () => {
        showFavorites(); // Re-render favorites based on the selected list
    });
}

async function showListEmotes() {
    const listId = document.getElementById('list-picker').value;
    const emotesDiv = document.getElementById('results');

    if (!listId) {
        // If no list is selected, prompt the user to select a list
        emotesDiv.innerHTML = '<p>Please select a list to see the emotes.</p>';
        return;
    }

    // Clear the current emotes displayed
    emotesDiv.innerHTML = '';

    try {
        // Fetch the emotes associated with the selected list
        const { data: emotes, error } = await supabase
            .from('favorites') // Assuming you have a table for emotes
            .select('slug, url') // Fields we need (slug and URL of the emotes)
            .eq('list', listId); // Filter by the selected list ID

        if (error) {
            console.error('Error fetching emotes for list:', error);
            emotesDiv.innerHTML = '<p>Failed to load emotes. Please try again later.</p>';
            return;
        }

        // If emotes are found, display them
        if (emotes.length > 0) {
            emotes.forEach((emote) => {
                // Use the existing `displayEmote` function to show each emote
                displayEmote(emote, emotesDiv);
            });
        } else {
            // If no emotes are found for the selected list, display a message
            emotesDiv.innerHTML = '<p>No emotes found in this list.</p>';
        }
    } catch (error) {
        console.error('Unexpected error fetching emotes:', error);
        emotesDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}
