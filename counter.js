async function fetchCount() {
    const { count: totalCount, totalerror } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true });

// 2. Count where llm_nsfw_reason IS NOT NULL
    const { count: reasonCount, reasonerror } = await supabase
        .from('emotes')
        .select('*', { count: 'exact', head: true })
        .not('llm_nsfw_reason', 'is', null);

    const el = document.getElementById('counter');
    if (totalerror) {
        console.error('Count error:', totalerror);
        el.textContent = '❌ Error loading count';
    } else if (reasonerror) {
        console.error('Count error:', reasonerror);
        el.textContent = '❌ Error loading count';
    } else {
        el.textContent = `👀 ${reasonCount}/${totalCount} Checked GIFs`;
    }
}

// Initial count
fetchCount();

// Subscribe to realtime changes
supabase.channel('realtime:emotes')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'emotes'
    }, payload => {
        fetchCount();
    })
    .subscribe();