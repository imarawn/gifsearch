async function fetchCount() {
    const {count, error} = await supabase
        .from('emotes')
        .select('*', {count: 'exact', head: true})
        .not('llm_nsfw_reason', 'is', null);

    const el = document.getElementById('counter');
    if (error) {
        console.error('Count error:', error);
        el.textContent = '❌ Error loading count';
    } else {
        el.textContent = `🧠 ${count} LLM-categorized GIFs`;
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