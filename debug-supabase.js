import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase configuration...');
console.log('URL configured:', !!supabaseUrl && !supabaseUrl.includes('your-'));
console.log('Key configured:', !!supabaseKey && !supabaseKey.includes('your-'));

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-') && !supabaseKey.includes('your-')) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('\n📊 Fetching trips from database...');
  
  try {
    // Check trips table
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .limit(5);
    
    if (tripsError) {
      console.error('❌ Error fetching trips:', tripsError);
    } else {
      console.log('✅ Found', trips?.length || 0, 'trips');
      if (trips && trips.length > 0) {
        console.log('\n📋 Sample trip structure:');
        console.log('ID:', trips[0].id);
        console.log('Destination:', trips[0].destination);
        console.log('Days:', trips[0].days);
        console.log('Budget:', trips[0].budget);
        console.log('Has itinerary:', !!trips[0].itinerary);
        console.log('Itinerary type:', typeof trips[0].itinerary);
        
        if (trips[0].itinerary) {
          console.log('\n🗂️ Itinerary structure:');
          console.log('Keys:', Object.keys(trips[0].itinerary));
          if (trips[0].itinerary.days) {
            console.log('Days in itinerary:', trips[0].itinerary.days.length);
            if (trips[0].itinerary.days[0]) {
              console.log('First day structure:', Object.keys(trips[0].itinerary.days[0]));
              if (trips[0].itinerary.days[0].activities) {
                console.log('Activities count:', trips[0].itinerary.days[0].activities.length);
                if (trips[0].itinerary.days[0].activities[0]) {
                  console.log('First activity keys:', Object.keys(trips[0].itinerary.days[0].activities[0]));
                }
              }
            }
          }
        }
      }
    }
    
    // Check votes table
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(5);
    
    if (votesError) {
      console.error('❌ Error fetching votes:', votesError);
    } else {
      console.log('\n🗳️ Found', votes?.length || 0, 'votes');
      if (votes && votes.length > 0) {
        console.log('Sample vote:', votes[0]);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
} else {
  console.log('⚠️ Supabase not properly configured');
}