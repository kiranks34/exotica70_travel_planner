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

export interface TravelPreferences {
  budget: 'budget' | 'mid-range' | 'luxury' | '';
  climate: 'tropical' | 'temperate' | 'cold' | 'desert' | '';
  travelStyle: 'adventure' | 'relaxation' | 'culture' | 'nightlife' | 'nature' | 'food' | '';
  groupSize: 'solo' | 'couple' | 'family' | 'friends' | '';
}

export interface PersonalizedDestination {
  name: string;
  country: string;
  image: string;
  rating: number;
  overview: string;
  whyPerfectForYou: string;
  highlights: string[];
  personalizedActivities: string[];
  budgetInfo: {
    dailyBudget: string;
    costBreakdown: string[];
  };
  bestTimeToVisit: string;
  travelTips: string[];
  localInsights: string[];
}

export const generatePersonalizedDestinations = async (
  preferences: TravelPreferences
): Promise<PersonalizedDestination[]> => {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Based on these travel preferences, suggest 6 perfect destinations:

Preferences:
- Budget: ${preferences.budget}
- Climate: ${preferences.climate}
- Travel Style: ${preferences.travelStyle}
- Group: ${preferences.groupSize}

Create personalized destination recommendations that perfectly match these preferences. For each destination, explain WHY it's perfect for this specific traveler profile.

Return ONLY valid JSON in this exact format:
{
  "destinations": [
    {
      "name": "Destination Name",
      "country": "Country",
      "image": "https://images.pexels.com/photos/[relevant-image-id]/pexels-photo-[id].jpeg?auto=compress&cs=tinysrgb&w=400&h=300",
      "rating": 4.8,
      "overview": "Brief engaging overview (2-3 sentences)",
      "whyPerfectForYou": "Specific explanation of why this destination matches their ${preferences.budget} budget, ${preferences.climate} climate preference, ${preferences.travelStyle} style, and ${preferences.groupSize} travel group",
      "highlights": ["Highlight 1 tailored to ${preferences.travelStyle}", "Highlight 2", "Highlight 3", "Highlight 4"],
      "personalizedActivities": ["Activity 1 perfect for ${preferences.travelStyle} ${preferences.groupSize} travelers", "Activity 2", "Activity 3", "Activity 4"],
      "budgetInfo": {
        "dailyBudget": "${preferences.budget === 'budget' ? '$30-50' : preferences.budget === 'mid-range' ? '$50-150' : '$150-300+'} per day",
        "costBreakdown": ["Accommodation: $X-Y", "Food: $X-Y", "Activities: $X-Y", "Transport: $X-Y"]
      },
      "bestTimeToVisit": "Best time considering ${preferences.climate} preference",
      "travelTips": ["Tip 1 for ${preferences.groupSize} travelers", "Tip 2 for ${preferences.travelStyle} style", "Tip 3"],
      "localInsights": ["Local insight 1", "Local insight 2", "Local insight 3"]
    }
  ]
}

IMPORTANT: 
- Make each destination HIGHLY SPECIFIC to the user's preferences
- Explain WHY each destination is perfect for their specific profile
- Use real Pexels image URLs that exist
- Tailor budget information to their budget level
- Focus on ${preferences.travelStyle} activities and experiences
- Consider ${preferences.groupSize} group dynamics in recommendations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert travel advisor specializing in personalized destination recommendations. Create highly tailored suggestions that perfectly match the user's specific preferences. Focus on explaining WHY each destination is ideal for their profile.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(response);
    return result.destinations || [];
  } catch (error) {
    console.warn('Failed to generate personalized destinations with AI:', error);
    return generateFallbackDestinations(preferences);
  }
};

const generateFallbackDestinations = (preferences: TravelPreferences): PersonalizedDestination[] => {
  const fallbackDestinations: PersonalizedDestination[] = [
    {
      name: 'Bali',
      country: 'Indonesia',
      image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      rating: 4.7,
      overview: 'A tropical paradise perfect for relaxation and cultural exploration.',
      whyPerfectForYou: `Ideal for ${preferences.travelStyle} travelers seeking ${preferences.climate} climate experiences.`,
      highlights: ['Beautiful temples', 'Rice terraces', 'Beach relaxation', 'Yoga retreats'],
      personalizedActivities: ['Temple hopping', 'Cooking classes', 'Beach time', 'Spa treatments'],
      budgetInfo: {
        dailyBudget: preferences.budget === 'budget' ? '$25-40 per day' : preferences.budget === 'mid-range' ? '$50-100 per day' : '$150+ per day',
        costBreakdown: ['Accommodation: $10-50', 'Food: $5-25', 'Activities: $10-30', 'Transport: $5-15']
      },
      bestTimeToVisit: 'April to October for dry season',
      travelTips: ['Rent a scooter for easy transport', 'Try local warungs for authentic food', 'Respect temple dress codes'],
      localInsights: ['Ubud is perfect for culture lovers', 'Canggu great for digital nomads', 'Sanur ideal for families']
    },
    {
      name: 'Portugal',
      country: 'Portugal',
      image: 'https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      rating: 4.6,
      overview: 'Charming European destination with great weather and affordable prices.',
      whyPerfectForYou: `Perfect for ${preferences.budget} budget travelers who love ${preferences.travelStyle} experiences.`,
      highlights: ['Historic cities', 'Beautiful coastline', 'Great food scene', 'Friendly locals'],
      personalizedActivities: ['Porto wine tasting', 'Lisbon tram tours', 'Algarve beaches', 'Sintra palaces'],
      budgetInfo: {
        dailyBudget: preferences.budget === 'budget' ? '$40-60 per day' : preferences.budget === 'mid-range' ? '$60-120 per day' : '$120+ per day',
        costBreakdown: ['Accommodation: $20-80', 'Food: $15-40', 'Activities: $10-30', 'Transport: $5-20']
      },
      bestTimeToVisit: 'May to September for best weather',
      travelTips: ['Use public transport in cities', 'Try pastéis de nata everywhere', 'Book accommodations early in summer'],
      localInsights: ['Porto is great for culture', 'Algarve perfect for beaches', 'Lisbon offers urban excitement']
    }
  ];

  return fallbackDestinations.slice(0, 6);
};