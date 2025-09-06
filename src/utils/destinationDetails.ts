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

export interface DestinationDetails {
  name: string;
  country: string;
  overview: string;
  highlights: string[];
  bestTimeToVisit: string;
  localCulture: string;
  cuisine: string[];
  activities: string[];
  transportation: string;
  budgetTips: string[];
  hiddenGems: string[];
  practicalInfo: {
    currency: string;
    language: string;
    timeZone: string;
    climate: string;
  };
  travelTips: string[];
}

export const generateDestinationDetails = async (
  destinationName: string,
  country: string
): Promise<DestinationDetails> => {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Create comprehensive, engaging travel information for ${destinationName}, ${country}.

Provide detailed, personalized content that would help travelers understand and plan their visit to this destination. Include local insights, cultural information, and practical advice.

Return ONLY valid JSON in this exact format:
{
  "name": "${destinationName}",
  "country": "${country}",
  "overview": "Engaging 2-3 sentence overview of the destination",
  "highlights": ["Top highlight 1", "Top highlight 2", "Top highlight 3", "Top highlight 4", "Top highlight 5"],
  "bestTimeToVisit": "Best time to visit with seasonal information",
  "localCulture": "Description of local culture and customs",
  "cuisine": ["Local dish 1", "Local dish 2", "Local dish 3", "Local dish 4"],
  "activities": ["Activity 1", "Activity 2", "Activity 3", "Activity 4", "Activity 5"],
  "transportation": "Transportation options and tips",
  "budgetTips": ["Budget tip 1", "Budget tip 2", "Budget tip 3"],
  "hiddenGems": ["Hidden gem 1", "Hidden gem 2", "Hidden gem 3"],
  "practicalInfo": {
    "currency": "Local currency",
    "language": "Primary language(s)",
    "timeZone": "Time zone",
    "climate": "Climate description"
  },
  "travelTips": ["Travel tip 1", "Travel tip 2", "Travel tip 3", "Travel tip 4"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert travel guide with deep knowledge of destinations worldwide. Create engaging, accurate, and practical travel information. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const destinationDetails: DestinationDetails = JSON.parse(response);
    
    // Validate the response structure
    if (!destinationDetails.name || !destinationDetails.overview || !destinationDetails.highlights) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return destinationDetails;
  } catch (error) {
    console.warn('Failed to generate destination details with AI:', error);
    
    // Return fallback destination details
    return generateFallbackDestinationDetails(destinationName, country);
  }
};

const generateFallbackDestinationDetails = (name: string, country: string): DestinationDetails => {
  return {
    name,
    country,
    overview: `${name} is a captivating destination in ${country} that offers visitors an unforgettable experience. Known for its unique charm and cultural richness, this destination provides the perfect blend of adventure and relaxation.`,
    highlights: [
      `Historic landmarks and architecture`,
      `Local markets and shopping`,
      `Cultural experiences and museums`,
      `Natural beauty and scenic views`,
      `Traditional cuisine and dining`
    ],
    bestTimeToVisit: "Year-round destination with seasonal variations. Spring and fall typically offer the most pleasant weather.",
    localCulture: `The local culture of ${name} is rich with traditions and customs that reflect the heritage of ${country}. Visitors will find warm hospitality and fascinating cultural experiences.`,
    cuisine: [
      "Traditional local dishes",
      "Fresh regional ingredients",
      "Street food specialties",
      "Local beverages and treats"
    ],
    activities: [
      "Sightseeing and photography",
      "Cultural tours and experiences",
      "Local workshops and classes",
      "Nature walks and exploration",
      "Shopping and markets"
    ],
    transportation: "Various transportation options available including public transit, taxis, and walking. Consider local transport passes for convenience.",
    budgetTips: [
      "Visit during shoulder season for better prices",
      "Try local street food for authentic and affordable meals",
      "Use public transportation when possible"
    ],
    hiddenGems: [
      "Local neighborhood exploration",
      "Off-the-beaten-path attractions",
      "Traditional local experiences"
    ],
    practicalInfo: {
      currency: "Local currency",
      language: "Local language",
      timeZone: "Local time zone",
      climate: "Varies by season"
    },
    travelTips: [
      "Learn basic local phrases",
      "Respect local customs and traditions",
      "Keep important documents safe",
      "Stay hydrated and dress appropriately"
    ]
  };
};