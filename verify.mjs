import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const url = "https://jfyhoqrtvsvxvvvhwqrd.supabase.co"
const key = "sb_publishable_rz-LJVDv_ENOQxyCQ4Mw6Q_V4S0mCVO"

if (!url || !key) {
  console.log("Could not find supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from("posts").select("*").limit(1);
  if (error) {
    console.error("Error fetching posts:", error);
  } else {
    console.log("Post keys:", data.length > 0 ? Object.keys(data[0]) : "No posts found, can't infer schema.");
  }
}
check();
