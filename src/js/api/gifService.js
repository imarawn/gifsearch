async function insertGifToDatabase(slug, gif) {
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
        console.error('User is not authenticated!');
        return;
    }

    const cleanedSlug = slug.slice(1);

    const {count: totalCount, error: totalError} = await supabase
        .from('predefined_gifs')
        .select('*', {count: 'exact', head: true});

    if (totalError) {
        return;
    }

    if (totalCount >= MAX_TOTAL_GIFS) {
        const {data: oldestGlobalGif, error: globalDeleteError} = await supabase
            .from('predefined_gifs')
            .select('id')
            .not('user_id', 'is', null)  // Nur GIFs löschen, die von Nutzern hochgeladen wurden
            .order('created_at', {ascending: true}) // Ältestes zuerst
            .limit(1)
            .single();

        if (globalDeleteError || !oldestGlobalGif) {
            return;
        }

        await supabase.from('predefined_gifs').delete().eq('id', oldestGlobalGif.id);
    }

    const {count: userCount, error: userCountError} = await supabase
        .from('predefined_gifs')
        .select('*', {count: 'exact', head: true})
        .eq('user_id', user.id);

    if (userCountError) {
        return;
    }

    if (userCount >= MAX_GIFS_PER_USER) {
        const {data: oldestUserGif, error: userDeleteError} = await supabase
            .from('predefined_gifs')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', {ascending: true}) // Ältestes zuerst
            .limit(1)
            .single();

        if (userDeleteError || !oldestUserGif) {
            return;
        }

        await supabase.from('predefined_gifs').delete().eq('id', oldestUserGif.id);
        console.log('Oldest GIF deleted for user:', oldestUserGif.id);
    }

    const {data: existingGif, error: selectError} = await supabase
        .from('predefined_gifs')
        .select('id')
        .eq('slug', cleanedSlug)
        .maybeSingle();

    if (selectError) {
        return;
    }

    if (existingGif) {
        return;
    }

    const {data, error} = await supabase
        .from('predefined_gifs')
        .insert([{slug: cleanedSlug, url: gif.url, user_id: user.id}]);
}