import { createClient } from "@supabase/supabase-js";
import env from "dotenv";

env.config();

const KEY = process.env.SUPABASE_KEY;
const URL = process.env.SUPABASE_URL;

export const supabase = createClient(URL,KEY);
