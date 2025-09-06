export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'MISSING_ID' });
  }

  try {
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'SERVER_ERROR' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch trip data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('destination, days, budget, itinerary')
      .eq('id', id)
      .single();

    if (tripError) {
      console.error('Trip fetch error:', tripError);
      if (tripError.code === 'PGRST116') {
        return res.status(404).json({ error: 'NOT_FOUND' });
      }
      return res.status(500).json({ error: 'SERVER_ERROR' });
    }

    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }

    // Fetch votes for this trip
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('activity_id, choice')
      .eq('trip_id', id);

    if (votesError) {
      console.error('Votes fetch error:', votesError);
      return res.status(500).json({ error: 'SERVER_ERROR' });
    }

    // Aggregate votes by activity_id
    const votes = {};
    
    if (votesData && votesData.length > 0) {
      votesData.forEach(vote => {
        const { activity_id, choice } = vote;
        
        if (!votes[activity_id]) {
          votes[activity_id] = { yes: 0, no: 0, maybe: 0 };
        }
        
        if (choice && ['yes', 'no', 'maybe'].includes(choice)) {
          votes[activity_id][choice]++;
        }
      });
    }

    // Return the response
    return res.status(200).json({
      trip,
      votes
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
}