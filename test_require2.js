const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gepveswygczjgcdnnxhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcHZlc3d5Z2N6amdjZG5ueGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ0NjIsImV4cCI6MjA4ODQ4MDQ2Mn0.T47H0pJuBPEmXuEJjfxLCkyHFcjytxS0XZPdGhsnwSM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: availabilities, error: availError } = await supabase
        .from('availability')
        .select('*')
        .in('status', ['AVAILABLE']);
  
  console.log("availError with only AVAILABLE:", availError?.message || 'none', availabilities?.length);
  process.exit(0);
}

check();
