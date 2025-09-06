export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  hiddenGem: string;
  rating: number;
  reviewCount: number;
}

export const destinations: Destination[] = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'The City of Light beckons with its timeless elegance, world-class museums, and romantic boulevards that have inspired artists for centuries.',
    hiddenGem: 'A secret rooftop garden at Galeries Lafayette with stunning Eiffel Tower views that locals keep to themselves.',
    rating: 4.8,
    reviewCount: 2847
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'Where ancient traditions meet cutting-edge technology, Tokyo offers an electrifying blend of neon-lit streets and serene temples.',
    hiddenGem: 'A tiny 8-seat ramen shop in Shibuya where the chef personally greets every customer and remembers their preferences.',
    rating: 4.9,
    reviewCount: 3156
  },
  {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'An island paradise where emerald rice terraces cascade down volcanic slopes and ancient temples overlook pristine beaches.',
    hiddenGem: 'A hidden waterfall accessible only by a 20-minute trek through bamboo forests, where locals come to meditate at sunrise.',
    rating: 4.7,
    reviewCount: 1923
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    country: 'India',
    image: 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'The city that never sleeps pulses with Bollywood dreams, street food adventures, and the infectious energy of 20 million dreamers.',
    hiddenGem: 'A century-old Irani café in Fort district where film stars still sneak in for the best bun maska and chai in the city.',
    rating: 4.6,
    reviewCount: 2134
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    image: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'The concrete jungle where dreams are made, offering world-class culture, diverse neighborhoods, and energy that never stops.',
    hiddenGem: 'A speakeasy hidden behind a phone booth in East Village where jazz musicians jam until 4 AM every Thursday.',
    rating: 4.8,
    reviewCount: 4521
  },
  {
    id: 'london',
    name: 'London',
    country: 'England',
    image: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
    description: 'A city where royal history meets modern innovation, from ancient castles to cutting-edge galleries and cozy pub culture.',
    hiddenGem: 'A secret garden pub in Hampstead where locals gather for Sunday roasts and the landlord plays piano every evening.',
    rating: 4.7,
    reviewCount: 3847
  }
];