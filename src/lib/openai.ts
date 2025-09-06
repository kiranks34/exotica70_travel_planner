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
  } catch (error) {
    console.error('OpenAI configuration error:', error);
    // Return fallback trip plan when API key is missing
    return generateFallbackTripPlan(request);
  }
  
  const startDate = new Date(request.startDate);
  const endDate = new Date(request.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `
Create a detailed ${duration}-day trip itinerary for ${request.destination} from ${request.startDate} to ${request.endDate}.

Trip Details:
- Destination: ${request.destination}
- Duration: ${duration} days
- Trip Type: ${request.tripType}
- Travel Style: ${getTripStyleDescription(request.tripType)}
${request.collaborators.length > 0 ? `- Traveling with: ${request.collaborators.length} other people` : '- Solo travel'}

Please provide a comprehensive trip plan in JSON format with the following structure:
{
  "destination": "${request.destination}",
  "duration": ${duration},
  "totalBudgetEstimate": number (in USD),
  "bestTimeToVisit": "string",
  "weatherInfo": "string describing expected weather",
  "localCurrency": "string",
  "languageInfo": "string about local language and useful phrases",
  "culturalTips": ["array of cultural etiquette tips"],
  "packingRecommendations": ["array of packing suggestions"],
  "dayPlans": [
    {
      "date": "YYYY-MM-DD",
      "theme": "string describing the day's focus",
      "activities": [
        {
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Specific address or area",
          "startTime": "HH:MM",
          "endTime": "HH:MM",
          "category": "accommodation|transport|restaurant|attraction|activity|shopping|other",
          "estimatedCost": number (in USD, optional),
          "bookingRequired": boolean,
          "tips": ["array of specific tips for this activity"]
        }
      ],
      "localTips": ["array of tips specific to this day"],
      "budgetEstimate": number (daily budget in USD)
    }
  ],
  "emergencyInfo": {
    "emergencyNumber": "local emergency number",
    "nearestEmbassy": "if applicable",
    "importantAddresses": ["array of important locations"]
  }
}

Requirements:
1. Create realistic daily schedules (8 AM to 10 PM)
2. Include a mix of must-see attractions, local experiences, and ${request.tripType} activities
3. Suggest specific restaurants, hotels, and attractions with real names when possible
4. Provide realistic cost estimates
5. Include practical travel tips and cultural insights
6. Balance popular tourist spots with authentic local experiences
7. Consider travel time between activities
8. Include rest periods and meal times
9. Adapt suggestions based on the "${request.tripType}" trip type

Focus on creating an authentic, well-researched itinerary that captures the essence of ${request.destination} while catering to a ${request.tripType} travel style.
`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner with extensive knowledge of destinations worldwide. Provide detailed, practical, and culturally-aware travel itineraries in valid JSON format only. Do not include any text outside the JSON response."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const tripPlan: AITripPlan = JSON.parse(response);
    
    // Validate the response structure
    if (!tripPlan.dayPlans || !Array.isArray(tripPlan.dayPlans)) {
      throw new Error('Invalid trip plan structure');
    }

    return tripPlan;
  } catch (error) {
    console.error('Error generating trip plan:', error);
    
    // Fallback to a basic structure if OpenAI fails
    return generateFallbackTripPlan(request);
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