import {supabase} from "./supabaseclient.js";
import {populateGifDisplay} from './gifcard.js';


export async function loadPredefinedGifs(list) {
    const {data, error} = await supabase
        .from(list)
        .select('search_slug, url')

    if (error) {
        console.error('Failed to load GIFs:', error.message);
        return;
    }

    const formatted = data.map(gif => ({
        slug: gif.search_slug,
        url: gif.url,
        list: list
    }));

    populateGifDisplay(formatted);
}

export async function loadRandom(list) {
    const { data, error } = list === 'random_emotes' ?
        await supabase.rpc('get_random_emotes', { p_limit: 80 })
        : await supabase.rpc('get_random_nsfw_emotes', { p_limit: 80 })

    if (error) {
        console.error('Failed to load random:', error.message);
        return;
    }
    const formatted = data.map(gif => ({
        slug: gif.search_slug,
        url: gif.url,
        list: list,
    }))
    populateGifDisplay(formatted);
}