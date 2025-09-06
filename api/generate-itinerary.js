export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate required inputs
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

    if (typeof budget !== 'number' || budget < 1) {
      return res.status(400).json({ 
        error: 'Budget must be a positive number' 
      });
    }

    const validVibes = ['Adventure', 'Chill', 'Party', 'Culture', 'Spontaneous'];
    if (!validVibes.includes(vibe)) {
      return res.status(400).json({ 
        error: 'Vibe must be one of: Adventure, Chill, Party, Culture, Spontaneous' 
      });
    }

    // Import OpenAI
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.VITE_OPENAI_API_KEY,
    });

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

    // User prompt with template substitution
    const userPrompt = `Create a ${days}-day itinerary for ${destination} with vibe ${vibe}, budget ${budget} USD, group_size ${groupSize || 2}, start ${startDate || 'flexible'}. Use the exact JSON schema from the system prompt and output JSON only.`;

    let itineraryData;

    try {
      // Call OpenAI
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

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      itineraryData = JSON.parse(response);
      
      // Validate basic structure
      if (!itineraryData.trip || !itineraryData.days || !Array.isArray(itineraryData.days)) {
        throw new Error('Invalid itinerary structure from OpenAI');
      }

    } catch (openaiError) {
      console.error('OpenAI Error:', openaiError);
      
      // Fallback hardcoded itinerary
      itineraryData = {
        trip: {
          destination,
          days,
          budget,
          vibe,
          group_size: groupSize || 2,
          currency: 'USD'
        },
        days: Array.from({ length: days }, (_, i) => ({
          day: i + 1,
          summary: `Day ${i + 1} exploring ${destination}`,
          cluster: `${destination} Center`,
          activities: [
            {
              id: `day-${i + 1}-morning`,
              title: `Morning Activity in ${destination}`,
              time: '09:00',
              duration_min: 180,
              est_cost_per_person: Math.min(25, budget / days / 3),
              tags: [vibe.toLowerCase(), 'sightseeing'],
              hidden_gem: i === 0,
              photo_hint: `Beautiful morning view in ${destination}`
            },
            {
              id: `day-${i + 1}-afternoon`,
              title: `Afternoon ${vibe} Experience`,
              time: '14:00',
              duration_min: 240,
              est_cost_per_person: Math.min(35, budget / days / 2),
              tags: [vibe.toLowerCase(), 'experience'],
              hidden_gem: false,
              photo_hint: `${vibe} activity in ${destination}`
            },
            {
              id: `day-${i + 1}-evening`,
              title: 'Local Dining Experience',
              time: '19:00',
              duration_min: 120,
              est_cost_per_person: Math.min(30, budget / days / 3),
              tags: ['food', 'local'],
              hidden_gem: false,
              photo_hint: `Local cuisine in ${destination}`
            }
          ]
        })),
        estimated_total_cost: Math.min(budget * 0.9, budget),
        over_budget: false,
        swap_suggestions: [],
        eco_notes: [
          'Use public transportation when possible',
          'Support local businesses and restaurants',
          'Bring a reusable water bottle'
        ]
      };
    }

    // Import Supabase
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert into Supabase trips table
    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        destination,
        vibe,
        days,
        budget,
        start_date: startDate || null,
        itinerary: itineraryData,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return res.status(500).json({ error: 'Failed to save trip' });
    }

    if (!trip || !trip.id) {
      console.error('No trip ID returned from insert');
      return res.status(500).json({ error: 'Failed to create trip' });
    }

    // Return success with trip ID
    return res.status(200).json({ id: trip.id });

  } catch (error) {
    console.error('Generate Itinerary Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}