import OpenAI from 'openai';

// Initialize OpenAI client with error handling
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey.includes('your-') || apiKey.includes('sk-your-')) {
    throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
  });
};

export interface TripPlanningRequest {
  destination: string;
  startDate: string;
  endDate: string;
  tripType: string;
  collaborators: string[];
}

export interface AIActivitySuggestion {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: 'accommodation' | 'transport' | 'restaurant' | 'attraction' | 'activity' | 'shopping' | 'other';
  estimatedCost?: number;
  bookingRequired: boolean;
  tips: string[];
}

export interface AIDayPlan {
  date: string;
  theme: string;
  activities: AIActivitySuggestion[];
  localTips: string[];
  budgetEstimate: number;
}

export interface AITripPlan {
  destination: string;
  duration: number;
  totalBudgetEstimate: number;
  bestTimeToVisit: string;
  weatherInfo: string;
  localCurrency: string;
  languageInfo: string;
  culturalTips: string[];
  packingRecommendations: string[];
  dayPlans: AIDayPlan[];
  emergencyInfo: {
    emergencyNumber: string;
    nearestEmbassy?: string;
    importantAddresses: string[];
  };
}

export const generateTripPlan = async (request: TripPlanningRequest): Promise<AITripPlan> => {
  try {
    const openai = getOpenAIClient();
    console.log('🤖 Starting OpenAI trip generation for:', request.destination);
  } catch (error) {
    console.error('OpenAI configuration error:', error);
    // Return fallback trip plan when API key is missing
    return generateFallbackTripPlan(request);
  }
  
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `Create a highly personalized and detailed ${duration}-day trip itinerary for ${request.destination}.

Trip Details:
- Destination: ${request.destination}
- Duration: ${duration} days
- Start Date: ${request.startDate}
- End Date: ${request.endDate}
- Trip Type: ${request.tripType}
- Travel Style: ${getTripStyleDescription(request.tripType)} 
${request.collaborators.length > 0 ? `- Traveling with: ${request.collaborators.length} other people` : '- Solo travel'}

IMPORTANT: Create a PERSONALIZED experience tailored specifically to the "${request.tripType}" travel style. 

For ${request.tripType} travelers, focus on:
${getPersonalizationPrompt(request.tripType)}

Provide a comprehensive, personalized trip plan in JSON format:
{
  "destination": "${request.destination}",
  "duration": ${duration},
  "totalBudgetEstimate": number (in USD),
  "bestTimeToVisit": "specific advice for ${request.tripType} travelers",
  "weatherInfo": "weather info relevant to ${request.tripType} activities",
  "localCurrency": "string",
  "languageInfo": "language info with phrases useful for ${request.tripType} activities",
  "culturalTips": ["cultural tips specifically relevant to ${request.tripType} travelers"],
  "packingRecommendations": ["packing suggestions optimized for ${request.tripType} activities"],
  "dayPlans": [
    {
      "date": "YYYY-MM-DD",
      "theme": "day theme aligned with ${request.tripType} interests",
      "activities": [
        {
          "title": "Activity name (${request.tripType}-focused)",
          "description": "Detailed description explaining why this fits ${request.tripType} style",
          "location": "Specific address or area",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "category": "accommodation|transport|restaurant|attraction|activity|shopping|other",
          "estimatedCost": number (in USD, optional),
          "bookingRequired": boolean,
          "tips": ["specific tips for ${request.tripType} travelers at this activity"]
        }
      ],
      "localTips": ["${request.tripType}-specific tips for this day"],
      "budgetEstimate": number (daily budget in USD)
    }
  ],
  "emergencyInfo": {
    "emergencyNumber": "local emergency number",
    "nearestEmbassy": "if applicable",
    "importantAddresses": ["important locations for ${request.tripType} travelers"]
  }
}

Requirements:
1. PERSONALIZE everything for ${request.tripType} travelers
2. Create realistic schedules optimized for ${request.tripType} activities
3. Include specific venues that cater to ${request.tripType} interests
4. Provide insider tips that ${request.tripType} travelers would find valuable
5. Balance must-see spots with hidden gems perfect for ${request.tripType} style
6. Consider optimal timing for ${request.tripType} activities
7. Include ${request.tripType}-appropriate dining and accommodation suggestions
8. Add cultural insights relevant to ${request.tripType} experiences

Make this itinerary feel like it was created by a local expert who specializes in ${request.tripType} travel!
`;

  try {
    const openai = getOpenAIClient();
    console.log('🤖 Sending request to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert travel planner specializing in ${request.tripType} travel experiences. You have extensive local knowledge and connections worldwide. Create highly personalized, authentic itineraries that go beyond typical tourist recommendations. Focus on experiences that truly match the traveler's style and interests. Provide valid JSON format only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // Higher creativity for personalization
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ OpenAI response received, parsing...');
    
    // Parse the JSON response
    const tripPlan: AITripPlan = JSON.parse(response);
    
    // Validate the response structure
    if (!tripPlan.dayPlans || !Array.isArray(tripPlan.dayPlans)) {
      throw new Error('Invalid trip plan structure');
    }

    console.log('✅ AI trip plan generated successfully:', {
      destination: tripPlan.destination,
      days: tripPlan.dayPlans.length,
      budget: tripPlan.totalBudgetEstimate
    });

    return tripPlan;
  } catch (error) {
    console.error('Error generating trip plan:', error);
    
    // Fallback to a basic structure if OpenAI fails
    console.log('⚠️ Using fallback trip plan');
    return generateFallbackTripPlan(request);
  }
};

const getPersonalizationPrompt = (tripType: string): string => {
  switch (tripType) {
    case 'adventure':
      return `- Outdoor activities, hiking trails, extreme sports, adventure tours
- Off-the-beaten-path locations and hidden natural wonders
- Local adventure guides and equipment rental spots
- Early morning activities to catch the best conditions
- Physical challenges and adrenaline-pumping experiences`;
    case 'chill':
    case 'relaxation':
      return `- Peaceful locations, spas, wellness centers, quiet beaches
- Slow-paced activities with plenty of rest time
- Scenic spots perfect for meditation or reading
- Comfortable accommodations with relaxation amenities
- Local cafes and peaceful dining experiences`;
    case 'party':
      return `- Vibrant nightlife, clubs, bars, live music venues
- Social activities and group experiences
- Local party districts and entertainment areas
- Late-night dining and street food scenes
- Festival events and social gatherings`;
    case 'culture':
      return `- Museums, historical sites, art galleries, cultural centers
- Traditional performances, workshops, and classes
- Local artisan shops and cultural markets
- Heritage sites and architectural marvels
- Interactions with local artists and cultural experts`;
    case 'spontaneous':
      return `- Flexible activities that can be decided day-of
- Local recommendations and hidden gems
- Markets, street food, and impromptu discoveries
- Activities that allow for last-minute changes
- Experiences that capture the authentic local vibe`;
    case 'food':
      return `- Local food markets, cooking classes, food tours
- Authentic restaurants known by locals
- Street food vendors and culinary experiences
- Wine/beer tastings and local beverage culture
- Farm-to-table experiences and local ingredients`;
    case 'romantic':
      return `- Intimate dining experiences and romantic settings
- Sunset viewpoints and scenic couple activities
- Luxury accommodations and spa experiences
- Private tours and exclusive experiences
- Beautiful photo opportunities for couples`;
    case 'family':
      return `- Family-friendly attractions and activities for all ages
- Educational experiences and interactive museums
- Parks, playgrounds, and outdoor family activities
- Restaurants with kid-friendly options
- Safe, accessible locations with family amenities`;
    case 'nature':
      return `- National parks, nature reserves, wildlife viewing
- Hiking trails, botanical gardens, natural landmarks
- Eco-friendly accommodations and sustainable tourism
- Bird watching, photography, and nature education
- Conservation experiences and environmental learning`;
    default:
      return `- Balanced mix of popular attractions and local experiences
- Variety of activities to suit different interests
- Cultural immersion and authentic local interactions
- Comfortable pacing with time for exploration
- Mix of planned activities and free time for discovery`;
  }
};
const getTripStyleDescription = (tripType: string): string => {
  switch (tripType) {
    case 'adventure':
      return 'Adventure-focused with outdoor activities, hiking, and thrilling experiences';
    case 'relaxation':
      return 'Relaxing and leisurely with spa visits, beaches, and peaceful activities';
    case 'cultural':
      return 'Cultural immersion with museums, historical sites, and local traditions';
    case 'food':
      return 'Culinary journey with food tours, cooking classes, and local cuisine';
    case 'romantic':
      return 'Romantic getaway with intimate dining, scenic views, and couple activities';
    case 'family':
      return 'Family-friendly with activities suitable for all ages';
    case 'business':
      return 'Business travel with networking opportunities and professional venues';
    case 'nature':
      return 'Nature-focused with wildlife, parks, and outdoor exploration';
    default:
      return 'Balanced mix of sightseeing, culture, and leisure activities';
  }
};

const generateFallbackTripPlan = (request: TripPlanningRequest): AITripPlan => {
  const startDate = new Date(request.startDate);
  const duration = Math.ceil((new Date(request.endDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const dayPlans: AIDayPlan[] = [];
  
  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    dayPlans.push({
      date: currentDate.toISOString().split('T')[0],
      theme: `Day ${i + 1} - Exploring ${request.destination}`,
      activities: [
        {
          title: `Morning Activity in ${request.destination}`,
          description: `Start your day exploring the highlights of ${request.destination}`,
          location: request.destination,
          startTime: '09:00',
          endTime: '12:00',
          category: 'attraction',
          estimatedCost: 25,
          bookingRequired: false,
          tips: ['Arrive early to avoid crowds', 'Bring comfortable walking shoes']
        },
        {
          title: 'Local Lunch Experience',
          description: 'Enjoy authentic local cuisine',
          location: request.destination,
          startTime: '12:30',
          endTime: '14:00',
          category: 'restaurant',
          bookingRequired: false,
          tips: ['Try local specialties', 'Ask for recommendations']
        },
        {
          title: `Afternoon ${request.tripType} Activity`,
          description: `${request.tripType} focused activity in ${request.destination}`,
          location: request.destination,
          startTime: '15:00',
          endTime: '18:00',
          category: 'activity',
          estimatedCost: 40,
          bookingRequired: true,
          tips: ['Book in advance', 'Check weather conditions']
        }
      ],
      localTips: [`Best time to visit is early morning`, `Local currency exchange available at banks`],
      budgetEstimate: 100
    });
  }

  return {
    destination: request.destination,
    duration,
    totalBudgetEstimate: duration * 100,
    bestTimeToVisit: 'Year-round destination with seasonal variations',
    weatherInfo: 'Check local weather forecast before traveling',
    localCurrency: 'Local currency',
    languageInfo: 'English is widely spoken in tourist areas',
    culturalTips: ['Respect local customs', 'Dress appropriately for religious sites'],
    packingRecommendations: ['Comfortable walking shoes', 'Weather-appropriate clothing', 'Travel adapter'],
    dayPlans,
    emergencyInfo: {
      emergencyNumber: '911',
      importantAddresses: ['Local hospital', 'Tourist information center']
    }
  };
};