import OpenAI from 'openai';

// Initialize OpenAI client with error handling
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('your-') || apiKey.includes('sk-your-')) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export interface EnrichedActivity {
  title: string;
  description: string;
  detailedDescription: string;
  tips: string[];
  bestTimeToVisit: string;
  duration: string;
  difficulty: string;
  highlights: string[];
  localInsights: string[];
  budgetTips: string[];
}

export const enrichActivityWithAI = async (
  activityTitle: string,
  destination: string,
  tripType: string,
  category: string
): Promise<EnrichedActivity> => {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Create enriched, personalized content for this travel activity:

Activity: ${activityTitle}
Destination: ${destination}
Trip Type: ${tripType}
Category: ${category}

Provide detailed, engaging content that would help travelers make the most of this experience. Include local insights, practical tips, and personalized recommendations based on the trip type.

Return ONLY valid JSON in this exact format:
{
  "title": "Enhanced activity title",
  "description": "Brief engaging description (1-2 sentences)",
  "detailedDescription": "Detailed description with context and what to expect (3-4 sentences)",
  "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"],
  "bestTimeToVisit": "Best time of day/season to visit",
  "duration": "Recommended duration (e.g., 2-3 hours)",
  "difficulty": "Easy/Moderate/Challenging",
  "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3"],
  "localInsights": ["Local insight 1", "Local insight 2"],
  "budgetTips": ["Budget tip 1", "Budget tip 2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert travel guide with deep local knowledge. Create engaging, practical, and personalized travel content. Focus on ${tripType} travel style. Provide authentic local insights and practical tips. Return only valid JSON.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const enrichedData: EnrichedActivity = JSON.parse(response);
    
    // Validate the response structure
    if (!enrichedData.title || !enrichedData.description || !enrichedData.tips) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return enrichedData;
  } catch (error) {
    console.warn('Failed to enrich activity with AI:', error);
    
    // Return fallback enriched content
    return {
      title: activityTitle,
      description: `Experience ${activityTitle} in ${destination}`,
      detailedDescription: `Discover the authentic charm of ${activityTitle} during your ${tripType} adventure in ${destination}. This carefully curated experience offers the perfect blend of local culture and memorable moments.`,
      tips: [
        'Arrive early to avoid crowds',
        'Bring comfortable walking shoes',
        'Don\'t forget your camera'
      ],
      bestTimeToVisit: 'Morning or late afternoon',
      duration: '2-3 hours',
      difficulty: 'Easy',
      highlights: [
        'Authentic local experience',
        'Great photo opportunities',
        'Cultural immersion'
      ],
      localInsights: [
        'Popular with locals',
        'Best experienced at a relaxed pace'
      ],
      budgetTips: [
        'Look for local deals',
        'Consider group discounts'
      ]
    };
  }
};

export const generateItinerarySummary = async (
  trip: any,
  dayItineraries: any[],
  tripType: string,
  aiInsights?: any
): Promise<string> => {
  try {
    const openai = getOpenAIClient();
    
    const totalActivities = dayItineraries.reduce((total, day) => total + day.activities.length, 0);
    const totalBudget = dayItineraries.reduce((total, day) => 
      total + day.activities.reduce((dayTotal: number, activity: any) => 
        dayTotal + (activity.cost || 0), 0), 0);

    const activitiesByDay = dayItineraries.map(day => ({
      date: day.date,
      activities: day.activities.map((activity: any) => ({
        title: activity.title,
        time: `${activity.startTime} - ${activity.endTime}`,
        category: activity.category,
        cost: activity.cost
      }))
    }));

    const prompt = `Create a comprehensive, well-formatted travel itinerary summary for:

Destination: ${trip.destination}
Duration: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
Trip Type: ${tripType}
Total Activities: ${totalActivities}
Estimated Budget: $${totalBudget}

Daily Activities:
${JSON.stringify(activitiesByDay, null, 2)}

Create a professional, engaging summary that includes:
1. Trip overview with highlights
2. Day-by-day breakdown with timing
3. Budget breakdown
4. Essential travel tips
5. What to pack
6. Local recommendations

Format as a comprehensive travel guide that friends would find useful and exciting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional travel writer creating comprehensive itinerary summaries. Write in an engaging, informative style that makes travelers excited about their trip."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || 'Failed to generate summary';
  } catch (error) {
    console.warn('Failed to generate AI summary:', error);
    
    // Return fallback summary
    const totalActivities = dayItineraries.reduce((total, day) => total + day.activities.length, 0);
    const totalBudget = dayItineraries.reduce((total, day) => 
      total + day.activities.reduce((dayTotal: number, activity: any) => 
        dayTotal + (activity.cost || 0), 0), 0);

    return `# ${trip.destination} Travel Itinerary

## Trip Overview
- **Destination:** ${trip.destination}
- **Dates:** ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
- **Trip Style:** ${tripType}
- **Total Activities:** ${totalActivities}
- **Estimated Budget:** $${totalBudget}

## Daily Breakdown
${dayItineraries.map((day, index) => `
### Day ${index + 1} - ${new Date(day.date).toLocaleDateString()}
${day.activities.map((activity: any) => `
- **${activity.startTime}** - ${activity.title}
  - Duration: ${activity.startTime} - ${activity.endTime}
  - Cost: ${activity.cost ? `$${activity.cost}` : 'Free'}
`).join('')}
`).join('')}

## Budget Summary
- **Total Estimated Cost:** $${totalBudget}
- **Average per Day:** $${Math.round(totalBudget / dayItineraries.length)}

## Travel Tips
- Book accommodations in advance
- Check local weather conditions
- Bring comfortable walking shoes
- Keep copies of important documents

Generated by Exotic70 Travel Planner`;
  }
};