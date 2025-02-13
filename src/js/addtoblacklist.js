async function addToSupabase(emoteUrl, emoteSlug) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("User is not authenticated:", error?.message || "");
        return;
    }

    // Insert the emote information into the Supabase table
    const { error: insertError } = await supabase
        .from('blacklist') // Replace with your actual table name
        .insert([
            {
                user_id: user.id,
                url: emoteUrl,
                slug: emoteSlug,
                created_at: new Date().toISOString() // You might want to adjust this if needed
            }
        ]);

    if (insertError) {
        console.error("Error adding emote to Supabase:", insertError);
        return;
    }

    console.log("Emote added to Supabase successfully:", emoteUrl, emoteSlug);
}

document.querySelectorAll('.visible-button').forEach(button => {
    button.addEventListener('click', function() {
        const emoteBox = button.closest('.emote-box'); // Get the closest emote box
        addToSupabase(emoteBox.querySelector('img').src, emoteBox.querySelector('.emote-name').textContent.slice(1));
    });
});