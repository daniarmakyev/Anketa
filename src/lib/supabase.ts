import { createClient } from "@supabase/supabase-js";
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Supabase URL и Anon Key не найдены. Проверьте файл .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
