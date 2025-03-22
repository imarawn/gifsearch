import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function insertGifToDatabase(slug, gif) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return console.error('User not authenticated!');

    const cleanedSlug = slug.slice(1);
    const { count: totalCount } = await supabase.from('predefined_gifs').select('*', { count: 'exact', head: true });
    if (totalCount >= MAX_TOTAL_GIFS) await deleteOldestGlobalGif();

    const { count: userCount } = await supabase.from('predefined_gifs').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (userCount >= MAX_GIFS_PER_USER) await deleteOldestUserGif(user.id);

    const { data: existingGif } = await supabase.from('predefined_gifs').select('id').eq('slug', cleanedSlug).maybeSingle();
    if (!existingGif) await supabase.from('predefined_gifs').insert([{ slug: cleanedSlug, url: gif.url, user_id: user.id }]);
}

async function deleteOldestGlobalGif() {
    const { data: oldestGif } = await supabase.from('predefined_gifs').select('id').not('user_id', 'is', null).order('created_at', { ascending: true }).limit(1).single();
    if (oldestGif) await supabase.from('predefined_gifs').delete().eq('id', oldestGif.id);
}

async function deleteOldestUserGif(userId) {
    const { data: oldestUserGif } = await supabase.from('predefined_gifs').select('id').eq('user_id', userId).order('created_at', { ascending: true }).limit(1).single();
    if (oldestUserGif) await supabase.from('predefined_gifs').delete().eq('id', oldestUserGif.id);
}
