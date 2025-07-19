import {supabase} from "./supabaseclient.js";
import { populateGifDisplay } from './gifcard.js';


export async function loadPredefinedGifs(list) {
    const { data, error } = await supabase
        .from(list)
        .select('search_slug, url')

    if (error) {
        console.error('Failed to load GIFs:', error.message);
        return;
    }

    const formatted = data.map(gif => ({
        slug: gif.search_slug,
        url: gif.url
    }));

    populateGifDisplay(formatted);
}