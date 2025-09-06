import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Star, Heart, DollarSign, Calendar, Lightbulb, Users, Sparkles, Plane } from 'lucide-react';
import { TravelPreferences, PersonalizedDestination, generatePersonalizedDestinations } from '../utils/inspirationGenerator';

interface PersonalizedSuggestionsPageProps {
  preferences: TravelPreferences;
  onBack: () => void;
  onSelectDestination: (destination: string) => void;
  onViewDestinationDetails: (name: string, country: string, image: string, rating: number) => void;
}

export const PersonalizedSuggestionsPage: React.FC<PersonalizedSuggestionsPageProps> = ({
  preferences,
  onBack,
  onSelectDestination,
  onViewDestinationDetails
}) => {
  const [destinations, setDestinations] = useState<PersonalizedDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const personalizedDestinations = await generatePersonalizedDestinations(preferences);
        setDestinations(personalizedDestinations);
      } catch (err) {
        console.error('Error generating destinations:', err);
        setError('Failed to generate personalized suggestions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [preferences]);

  const handleFavoriteToggle = (destinationId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(destinationId)) {
        newFavorites.delete(destinationId);
      } else {
        newFavorites.add(destinationId);
      }
      return newFavorites;
    });
  };

  const getPreferenceLabel = (key: keyof TravelPreferences, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      budget: {
        budget: 'Budget-Friendly',
        'mid-range': 'Mid-Range',
        luxury: 'Luxury'
      },
      climate: {
        tropical: 'Tropical',
        temperate: 'Temperate',
        cold: 'Cold',
        desert: 'Desert'
      },
      travelStyle: {
        adventure: 'Adventure',
        relaxation: 'Relaxation',
        culture: 'Culture',
        nightlife: 'Nightlife',
        nature: 'Nature',
        food: 'Food'
      },
      groupSize: {
        solo: 'Solo Travel',
        couple: 'Couple',
        family: 'Family',
        friends: 'Friends'
      }
    };
    
    return labels[key]?.[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Perfect Destinations for You
                </h1>
                <p className="text-gray-600 mt-1">Personalized recommendations based on your preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
            Your Travel Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(preferences).map(([key, value]) => {
              if (!value) return null;
              return (
                <div key={key} className="bg-white rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="font-semibold text-gray-900">{getPreferenceLabel(key as keyof TravelPreferences, value)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={`${destination.name}, ${destination.country}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleFavoriteToggle(`${destination.name}-${destination.country}`)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
                >
                  <Heart 
                    className={`h-4 w-4 transition-colors ${
                      favorites.has(`${destination.name}-${destination.country}`) 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-xs font-medium">{destination.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-900">{destination.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{destination.country}</p>
                </div>

                {/* Overview */}
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {destination.overview}
                </p>

                {/* Why Perfect For You */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-1 text-orange-500" />
                    Why Perfect for You
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {destination.whyPerfectForYou}
                  </p>
                </div>

                {/* Budget Info */}
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Budget</h4>
                  </div>
                  <p className="text-green-700 font-medium text-sm mb-2">{destination.budgetInfo.dailyBudget}</p>
                  <div className="space-y-1">
                    {destination.budgetInfo.costBreakdown.map((cost, idx) => (
                      <p key={idx} className="text-green-600 text-xs">{cost}</p>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                  <div className="space-y-1">
                    {destination.highlights.slice(0, 3).map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                        <p className="text-gray-700 text-sm">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => onViewDestinationDetails(destination.name, destination.country, destination.image, destination.rating)}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => onSelectDestination(`${destination.name}, ${destination.country}`)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium flex items-center justify-center space-x-2"
                  >
                    <Plane className="h-4 w-4" />
                    <span>Start Planning Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Don't see what you're looking for?</h3>
            <p className="text-gray-600 mb-6">Adjust your preferences to discover more personalized destinations</p>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              Update Preferences
              <span className="font-medium">Back to Preferences</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};