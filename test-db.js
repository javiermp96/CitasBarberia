import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gepveswygczjgcdnnxhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcHZlc3d5Z2N6amdjZG5ueGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ0NjIsImV4cCI6MjA4ODQ4MDQ2Mn0.T47H0pJuBPEmXuEJjfxLCkyHFcjytxS0XZPdGhsnwSM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('availability').select('*');
  console.log("Availability:", data, "Error:", error);
  
  const { data: appts, error: apptError } = await supabase.from('appointments').select('*');
  console.log("Appointments:", appts?.length, "Error:", apptError);
}

check();
