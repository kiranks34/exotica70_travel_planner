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

// Cache to store generated images and avoid duplicates
const imageCache = new Map<string, string>();
const usedPrompts = new Set<string>();

export const generateActivityImage = async (
  activityTitle: string,
  destination: string,
  tripType: string = '',
  activityCategory: string = ''
): Promise<string> => {
  try {
    // Create a unique cache key
    const cacheKey = `${activityTitle}-${destination}-${tripType}-${activityCategory}`.toLowerCase();
    
    // Check if we already have this image
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    const openai = getOpenAIClient();
    
    // Create a detailed, unique prompt for DALL-E
    let basePrompt = `A beautiful, high-quality photograph of ${activityTitle} in ${destination}`;
    
    // Add trip type context
    if (tripType) {
      switch (tripType.toLowerCase()) {
        case 'adventure':
          basePrompt += ', dynamic action shot with adventure elements';
          break;
        case 'culture':
          basePrompt += ', showcasing cultural heritage and traditional architecture';
          break;
        case 'relaxation':
        case 'chill':
          basePrompt += ', peaceful and serene atmosphere';
          break;
        case 'party':
          basePrompt += ', vibrant nightlife and energetic atmosphere';
          break;
        case 'food':
          basePrompt += ', featuring delicious local cuisine and dining experience';
          break;
        case 'nature':
          basePrompt += ', surrounded by natural beauty and landscapes';
          break;
        case 'romantic':
          basePrompt += ', romantic and intimate setting';
          break;
        case 'family':
          basePrompt += ', family-friendly environment with welcoming atmosphere';
          break;
      }
    }
    
    // Add category-specific details
    if (activityCategory) {
      switch (activityCategory.toLowerCase()) {
        case 'restaurant':
          basePrompt += ', elegant dining setting with local cuisine';
          break;
        case 'attraction':
          basePrompt += ', iconic landmark with tourists enjoying the view';
          break;
        case 'activity':
          basePrompt += ', people engaged in the activity';
          break;
        case 'accommodation':
          basePrompt += ', luxurious hotel or accommodation exterior';
          break;
        case 'transport':
          basePrompt += ', transportation method in scenic setting';
          break;
        case 'shopping':
          basePrompt += ', bustling market or shopping area';
          break;
      }
    }
    
    // Add uniqueness to avoid duplicates
    const uniqueElements = [
      ', golden hour lighting',
      ', blue hour atmosphere',
      ', morning sunlight',
      ', dramatic clouds',
      ', clear sunny day',
      ', soft natural lighting',
      ', vibrant colors',
      ', warm sunset glow'
    ];
    
    // Select a unique element that hasn't been used recently
    let selectedElement = uniqueElements[Math.floor(Math.random() * uniqueElements.length)];
    let attempts = 0;
    while (usedPrompts.has(basePrompt + selectedElement) && attempts < uniqueElements.length) {
      selectedElement = uniqueElements[Math.floor(Math.random() * uniqueElements.length)];
      attempts++;
    }
    
    const finalPrompt = basePrompt + selectedElement + ', professional photography, high resolution, travel photography style';
    
    // Mark this prompt as used
    usedPrompts.add(finalPrompt);
    
    // Clean up old prompts if we have too many (keep last 50)
    if (usedPrompts.size > 50) {
      const promptsArray = Array.from(usedPrompts);
      usedPrompts.clear();
      promptsArray.slice(-25).forEach(prompt => usedPrompts.add(prompt));
    }

    console.log('🎨 Generating image with DALL-E for:', activityTitle);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from DALL-E');
    }

    // Cache the generated image
    imageCache.set(cacheKey, imageUrl);
    
    console.log('✅ Image generated successfully for:', activityTitle);
    return imageUrl;
    
  } catch (error) {
    console.warn('Failed to generate image with DALL-E:', error);
    
    // Fallback to existing thumbnail system
    const { getDestinationThumbnail } = await import('./destinationImages');
    return getDestinationThumbnail(activityTitle, destination);
  }
};

export const generateDestinationHeroImage = async (
  destination: string,
  tripType: string = ''
): Promise<string> => {
  try {
    const cacheKey = `hero-${destination}-${tripType}`.toLowerCase();
    
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    const openai = getOpenAIClient();
    
    let prompt = `A stunning, panoramic view of ${destination}, showcasing the city's most iconic landmarks and skyline`;
    
    if (tripType) {
      switch (tripType.toLowerCase()) {
        case 'adventure':
          prompt += ', with adventure activities visible in the scene';
          break;
        case 'culture':
          prompt += ', highlighting historical and cultural architecture';
          break;
        case 'nature':
          prompt += ', emphasizing natural landscapes and scenery';
          break;
        case 'food':
          prompt += ', with bustling food markets and dining areas';
          break;
      }
    }
    
    prompt += ', golden hour lighting, professional travel photography, ultra-high resolution, breathtaking vista';

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "hd",
      style: "natural"
    });

    const imageUrl = response.data[0]?.url;
    
    if (imageUrl) {
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    throw new Error('No image URL returned');
    
  } catch (error) {
    console.warn('Failed to generate hero image:', error);
    
    // Fallback to existing system
    const fallbackImages = [
      'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1792&h=1024',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1792&h=1024',
      'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=1792&h=1024'
    ];
    
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }
};