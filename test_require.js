const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gepveswygczjgcdnnxhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcHZlc3d5Z2N6amdjZG5ueGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ0NjIsImV4cCI6MjA4ODQ4MDQ2Mn0.T47H0pJuBPEmXuEJjfxLCkyHFcjytxS0XZPdGhsnwSM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data: availabilities, error: availError } = await supabase
          .from('availability')
          .select('*')
          .in('status', ['AVAILABLE', 'BREAK'])
          .gte('start_time', '2026-03-25T00:00:00.000Z')
          .lte('start_time', '2026-03-27T23:59:59.000Z');
    
    console.log("availError:", availError?.message || 'none');

    const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('date_time, status, service_id, services(duration)');

    console.log("apptError:", apptError?.message || 'none');
    console.log("Appointments fetched successfully.", appointments?.length || 0);
  } catch(e) { console.error(e); }
  process.exit(0);
}

check();
