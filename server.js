import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase (optional)
let supabase = null;
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
  } catch (error) {
    console.log('⚠️  Supabase initialization failed:', error.message);
  }
} else {
  console.log('⚠️  Supabase not configured, using demo mode');
}

// Middleware
app.use(cors());
app.use(express.json());

const validVibes = ['Adventure', 'Chill', 'Party', 'Culture', 'Spontaneous', 'adventure', 'chill', 'party', 'culture', 'spontaneous'];

// Generate Itinerary Endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { destination, vibe, days, budget, startDate, groupSize } = req.body;

    if (!destination || !vibe || !days || !budget) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination, vibe, days, budget' 
      });
    }

    if (typeof days !== 'number' || days < 1 || days > 30) {
      return res.status(400).json({ 
        error: 'Days must be a number between 1 and 30' 
      });
    }

    if (typeof budget !== 'number' || budget <= 0) {
      return res.status(400).json({ 
        error: 'Budget must be a positive number' 
      });
    }

    if (!validVibes.includes(vibe)) {
      return res.status(400).json({ 
        error: 'Invalid vibe. Must be one of: Adventure, Chill, Party, Culture, Spontaneous' 
      });
    }

    const finalGroupSize = groupSize || 2;
    const finalStartDate = startDate || 'flexible';
    
    // Generate fallback itinerary
    const costPerDay = Math.floor(budget / days / 4);
    const fallbackDays = [];
    
    for (let i = 1; i <= days; i++) {
      fallbackDays.push({
        day: i,
        summary: `Day ${i} in ${destination}`,
        cluster: `${destination} Center`,
        activities: [
          {
            id: `day-${i}-activity-1`,
            title: `Morning ${vibe.toLowerCase()} activity`,
            time: "09:00",
            duration_min: 120,
            est_cost_per_person: costPerDay,
            tags: [vibe.toLowerCase(), "morning"],
            hidden_gem: i === 1,
            photo_hint: `${destination} morning scene`
          },
          {
            id: `day-${i}-activity-2`,
            title: `Afternoon exploration`,
            time: "14:00",
            duration_min: 180,
            est_cost_per_person: costPerDay,
            tags: ["exploration", "afternoon"],
            hidden_gem: false,
            photo_hint: `${destination} afternoon activity`
          },
          {
            id: `day-${i}-activity-3`,
            title: `Evening ${vibe.toLowerCase()} experience`,
            time: "19:00",
            duration_min: 150,
            est_cost_per_person: costPerDay,
            tags: [vibe.toLowerCase(), "evening"],
            hidden_gem: false,
            photo_hint: `${destination} evening scene`
          }
        ]
      });
    }

    const totalCost = costPerDay * 3 * days;
    
    const itineraryData = {
      trip: {
        destination,
        days,
        budget,
        vibe,
        group_size: finalGroupSize,
        currency: 'USD'
      },
      days: fallbackDays,
      estimated_total_cost: totalCost,
      over_budget: totalCost > budget,
      swap_suggestions: totalCost > budget ? [
        {
          replace_activity_id: "day-1-activity-1",
          with: "Free walking tour",
          est_saving: costPerDay
        }
      ] : [],
      eco_notes: [
        "Use public transportation when possible",
        "Choose local restaurants to reduce carbon footprint",
        "Bring a reusable water bottle"
      ]
    };

    // Insert into Supabase (if configured)
    let tripId;
    if (supabase) {
      try {
        const { data: tripData, error: insertError } = await supabase
          .from('trips')
          .insert({
            destination,
            vibe,
            days,
            budget,
            start_date: finalStartDate === 'flexible' ? null : finalStartDate,
            itinerary: itineraryData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
          tripId = 'demo-' + Date.now();
        } else if (tripData && tripData.id) {
          tripId = tripData.id;
        } else {
          tripId = 'demo-' + Date.now();
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        tripId = 'demo-' + Date.now();
      }
    } else {
      tripId = 'demo-' + Date.now();
    }
    
    console.log('Trip created successfully:', tripId);
    res.status(200).json({ id: tripId });

  } catch (error) {
    console.error('Server error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get Trip Endpoint
app.get('/api/trip/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    console.log('[GET_TRIP] Fetching trip:', id);

    // Check if this is a demo trip or real trip
    if (id.startsWith('demo-')) {
      // Return demo trip data
      const demoTrip = {
        destination: 'Demo Destination',
        days: 3,
        budget: 1000,
        itinerary: {
          trip: {
            destination: 'Demo Destination',
            days: 3,
            budget: 1000,
            vibe: 'adventure',
            group_size: 2,
            currency: 'USD'
          },
          days: [
            {
              day: 1,
              summary: 'Day 1 exploring Demo Destination',
              cluster: 'Demo Center',
              activities: [
                {
                  id: 'demo-activity-1',
                  title: 'Morning Demo Activity',
                  time: '09:00',
                  duration_min: 180,
                  est_cost_per_person: 25,
                  tags: ['demo', 'sightseeing'],
                  hidden_gem: true,
                  photo_hint: 'Beautiful demo location'
                }
              ]
            }
          ],
          estimated_total_cost: 300,
          over_budget: false,
          swap_suggestions: [],
          eco_notes: ['This is a demo trip']
        }
      };
      
      console.log('[GET_TRIP] Returning demo trip data');
      return res.status(200).json({
        trip: demoTrip
      });
    }

    // Handle real trips with Supabase
    if (!supabase) {
      console.log('[GET_TRIP] Database not configured');
      return res.status(500).json({ error: 'DATABASE_NOT_CONFIGURED' });
    }

    try {
      // Fetch trip data
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('destination, days, budget, itinerary')
        .eq('id', id)
        .single();

      if (tripError) {
        if (tripError.code === 'PGRST116') {
          console.log('[GET_TRIP] Trip not found:', id);
          return res.status(404).json({ error: 'NOT_FOUND' });
        }
        console.error('[GET_TRIP] Database error:', tripError);
        return res.status(500).json({ error: 'SERVER_ERROR' });
      }

      console.log('[GET_TRIP] Trip data fetched successfully');
      res.status(200).json({
        trip: tripData
      });
    } catch (dbError) {
      console.error('[GET_TRIP] Database connection error:', dbError);
      return res.status(500).json({ error: 'DATABASE_CONNECTION_ERROR' });
    }

  } catch (error) {
    console.error('[GET_TRIP] Server error:', error);
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;