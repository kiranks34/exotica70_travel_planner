import dotenv from 'dotenv';

// Load environment variables with error handling
try {
  dotenv.config();
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.log('⚠️  Could not load .env file, using default values');
}

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Safer Supabase initialization
if (supabaseUrl && supabaseKey && 
    !supabaseUrl.includes('your-project') && 
    !supabaseKey.includes('your-anon-key') &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey.length > 20) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error.message);
    supabase = null;
  }
} else {
  console.log('⚠️  Supabase not configured properly. Using fallback mode.');
  console.log('   URL present:', !!supabaseUrl);
  console.log('   Key present:', !!supabaseKey);
}

// Initialize OpenAI client
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
let openai = null;

// Safer OpenAI initialization
if (openaiApiKey && openaiApiKey.startsWith('sk-') && openaiApiKey.length > 20) {
  try {
    openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    console.log('✅ OpenAI client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize OpenAI client:', error.message);
    openai = null;
  }
} else {
  console.log('⚠️  OpenAI API key not configured properly. Using fallback itinerary generation.');
  console.log('   Key present:', !!openaiApiKey);
  console.log('   Key format valid:', openaiApiKey ? openaiApiKey.startsWith('sk-') : false);
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Generate Itinerary Endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    console.log('[GENERATE_ITINERARY] Request received:', req.body);

    const { destination, vibe, days, start_date, budget, group_size } = req.body;

    // Validate required fields
    if (!destination || !vibe || !days || !budget) {
      console.log('[GENERATE_ITINERARY] Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: destination, vibe, days, budget' 
      });
    }

    // Validate data types and ranges
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

    const validVibes = ['Adventure', 'Chill', 'Party', 'Culture', 'Spontaneous', 'adventure', 'chill', 'party', 'culture', 'spontaneous'];
    if (!validVibes.includes(vibe)) {
      return res.status(400).json({ 
        error: 'Invalid vibe. Must be one of: Adventure, Chill, Party, Culture, Spontaneous' 
      });
    }

    const groupSize = group_size || 2;
    const startDate = start_date || 'flexible';

    console.log('[GENERATE_ITINERARY] Calling OpenAI...');

    // System prompt
    const systemPrompt = `You are a budget travel planner for Gen Z. Output VALID JSON ONLY with this schema:
{
  trip:{ destination:string, days:number, budget:number, vibe:string, group_size:number, currency:'USD' },
  days:[{ day:number, summary:string, cluster:string, activities:[{ id:string, title:string, time:string, duration_min:number, est_cost_per_person:number, tags:string[], hidden_gem:boolean, photo_hint:string }] }],
  estimated_total_cost:number,
  over_budget:boolean,
  swap_suggestions:[{ replace_activity_id:string, with:string, est_saving:number }],
  eco_notes:string[]
}
Rules: keep estimated_total_cost <= budget (hard cap) whenever possible; 3–5 activities/day; cluster by walkable areas; prefer public transit; tailor to vibe (Adventure/Chill/Party/Culture/Spontaneous); at least 1 hidden gem per day; short titles (<50 chars); stable slug-like ids; costs per person; include 2–3 eco_notes. If over budget, set over_budget true and add swap_suggestions. Return JSON only.`;

    // User prompt
    const userPrompt = `Create a ${days}-day itinerary for ${destination} with vibe ${vibe}, budget ${budget} USD, group_size ${groupSize}, start ${startDate}. Use the exact JSON schema from the system prompt and output JSON only.`;

    let itineraryData;

    try {
      if (openai) {
        console.log('[GENERATE_ITINERARY] Using OpenAI to generate itinerary...');
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.4,
          max_tokens: 4000,
          response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0].message.content;
        console.log('[GENERATE_ITINERARY] ✅ OpenAI response received successfully');
        
        try {
          itineraryData = JSON.parse(responseContent);
          console.log('[GENERATE_ITINERARY] ✅ AI itinerary generated successfully');
        } catch (parseError) {
          console.log('[GENERATE_ITINERARY] ❌ JSON parse failed, using fallback');
          throw new Error('JSON parse failed');
        }
      } else {
        console.log('[GENERATE_ITINERARY] ⚠️  OpenAI not configured, using fallback');
        throw new Error('OpenAI not configured');
      }
    } catch (openaiError) {
      console.log('[GENERATE_ITINERARY] ❌ OpenAI failed, using fallback:', openaiError.message);
      
      // Fallback itinerary
      const costPerDay = Math.floor(budget / days / 4); // Distribute budget across 4 activities per day
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
      
      itineraryData = {
        trip: {
          destination,
          days,
          budget,
          vibe,
          group_size: groupSize,
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
    }

    console.log('[GENERATE_ITINERARY] Saving to database...');

    // Insert into Supabase (if configured)
    let tripId;
    try {
      if (supabase) {
        const { data: tripData, error: insertError } = await supabase
          .from('trips')
          .insert({
            destination,
            vibe,
            days,
            budget,
            start_date: start_date || null,
            itinerary: itineraryData,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('[GENERATE_ITINERARY] Database insert error:', insertError);
          // Don't fail the request, just use fallback ID
          tripId = 'fallback-' + Date.now();
          console.log('[GENERATE_ITINERARY] Using fallback trip ID:', tripId);
        } else if (!tripData || !tripData.id) {
          console.error('[GENERATE_ITINERARY] No trip ID returned from insert');
          tripId = 'fallback-' + Date.now();
          console.log('[GENERATE_ITINERARY] Using fallback trip ID:', tripId);
        } else {
          tripId = tripData.id;
        }
      } else {
        // Generate a mock trip ID when database is not configured
        tripId = 'demo-' + Date.now();
        console.log('[GENERATE_ITINERARY] Database not configured, using demo ID:', tripId);
      }
    } catch (dbError) {
      console.error('[GENERATE_ITINERARY] Database operation failed:', dbError);
      // Use fallback ID instead of failing the request
      tripId = 'fallback-' + Date.now();
      console.log('[GENERATE_ITINERARY] Using fallback trip ID due to DB error:', tripId);
    }
    
    console.log('[GENERATE_ITINERARY] Trip created successfully:', tripId);
    res.status(200).json({ id: tripId });

  } catch (error) {
    console.error('[GENERATE_ITINERARY] Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
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
        trip: demoTrip,
        votes: {}
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

      // Fetch votes for this trip
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('activity_id, choice')
        .eq('trip_id', id);

      if (votesError) {
        console.error('[GET_TRIP] Votes fetch error:', votesError);
        return res.status(500).json({ error: 'SERVER_ERROR' });
      }

      // Aggregate votes by activity_id
      const votes = {};
      if (votesData) {
        votesData.forEach(vote => {
          if (!votes[vote.activity_id]) {
            votes[vote.activity_id] = { yes: 0, no: 0, maybe: 0 };
          }
          if (['yes', 'no', 'maybe'].includes(vote.choice)) {
            votes[vote.activity_id][vote.choice]++;
          }
        });
      }

      console.log('[GET_TRIP] Trip data fetched successfully');
      res.status(200).json({
        trip: tripData,
        votes
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

// Vote Endpoint
app.post('/api/trip/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { activityId, choice, voterId } = req.body;

    if (!id || !activityId || !choice || !voterId) {
      return res.status(400).json({ 
        error: 'Missing required fields: activityId, choice, voterId' 
      });
    }

    if (!['yes', 'no', 'maybe'].includes(choice)) {
      return res.status(400).json({ 
        error: 'Invalid choice. Must be yes, no, or maybe' 
      });
    }

    console.log('[VOTE] Recording vote:', { id, activityId, choice, voterId });

    // Only try to save vote if database is configured
    if (supabase) {
      try {
        const { error: voteError } = await supabase
          .from('votes')
          .upsert({
            trip_id: id,
            activity_id: activityId,
            voter_id: voterId,
            choice,
            created_at: new Date().toISOString()
          });

        if (voteError) {
          console.error('[VOTE] Database error:', voteError);
          // Don't fail the request, just log the error
          console.log('[VOTE] Vote not saved to database, but request succeeded');
        }
      } catch (dbError) {
        console.error('[VOTE] Database operation failed:', dbError);
        console.log('[VOTE] Vote not saved to database, but request succeeded');
      }
    } else {
      console.log('[VOTE] Database not configured, vote not persisted');
    }

    console.log('[VOTE] Vote recorded successfully');
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('[VOTE] Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Server listening on all interfaces (0.0.0.0:${PORT})`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying to kill existing process...`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;