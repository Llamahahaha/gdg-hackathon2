import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nbelnygepscexmweycdy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZWxueWdlcHNjZXhtd2V5Y2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MTgxNDgsImV4cCI6MjA5Mzk5NDE0OH0.wACtwdoWHyWTyRQVzMS9Kmwo0wDRCX1sK9W6aifV36w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('match_telemetry').insert([{
    match_id: 'test_match',
    total_frames: 1,
    timeline_data: [{ test: "data" }]
  }]);
  
  if (error) {
    console.error("Error:", error);
    console.error("Error stringified:", JSON.stringify(error));
  } else {
    console.log("Success:", data);
  }
}

test();
