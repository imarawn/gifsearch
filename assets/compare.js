async function syncFavorites() {
    const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const user = supabase.auth.user(); // Get the logged-in user

    if (!user) {
        console.error('User is not logged in');
        return;
    }

    // Fetch existing favorites from Supabase
    const { data: supabaseFavorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id); // Ensure to fetch only the user's favorites

    console.log('Supabase Favorites:', supabaseFavorites);
        
    if (error) {
        console.error('Error fetching favorites from Supabase:', error);
        return;
    }

    // Find favorites to delete
    const favoritesToDelete = supabaseFavorites.filter(supabaseFavorite => 
        !localFavorites.some(localFavorite => localFavorite.slug === supabaseFavorite.slug)
    );

    // Find favorites to add
    const favoritesToAdd = localFavorites.filter(localFavorite => 
        !supabaseFavorites.some(supabaseFavorite => supabaseFavorite.slug === localFavorite.slug)
    ).map(fav => ({ ...fav, user_id: user.id })); // Add user_id to each favorite

    // Delete favorites from Supabase
    if (favoritesToDelete.length > 0) {
        const { error: deleteError } = await supabase
            .from('favorites')
            .delete()
            .in('slug', favoritesToDelete.map(fav => fav.slug));

        if (deleteError) {
            console.error('Error deleting favorites from Supabase:', deleteError);
            return;
        }
    }

    // Add favorites to Supabase
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
}