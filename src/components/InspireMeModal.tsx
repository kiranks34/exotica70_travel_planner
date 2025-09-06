import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Thermometer, DollarSign, Users, Shuffle } from 'lucide-react';

interface InspireMeModalProps {
  onClose: () => void;
  onSelectDestination: (destination: string) => void;
  onShowPersonalizedSuggestions: (preferences: TravelPreferences) => void;
}

export interface TravelPreferences {
  budget: 'budget' | 'mid-range' | 'luxury' | '';
  climate: 'tropical' | 'temperate' | 'cold' | 'desert' | '';
  travelStyle: 'adventure' | 'relaxation' | 'culture' | 'nightlife' | 'nature' | '';
  groupSize: 'solo' | 'couple' | 'family' | 'friends' | '';
  season: 'spring' | 'summer' | 'fall' | 'winter' | '';
}

const destinations = {
  tropical: {
    budget: ['Bali, Indonesia', 'Thailand', 'Philippines', 'Vietnam'],
    'mid-range': ['Costa Rica', 'Malaysia', 'Sri Lanka', 'Mexico'],
    luxury: ['Maldives', 'Seychelles', 'Fiji', 'Bora Bora']
  },
  temperate: {
    budget: ['Portugal', 'Czech Republic', 'Poland', 'Hungary'],
    'mid-range': ['Spain', 'Italy', 'Greece', 'Turkey'],
    luxury: ['France', 'Switzerland', 'Austria', 'Germany']
  },
  cold: {
    budget: ['Estonia', 'Latvia', 'Lithuania', 'Romania'],
    'mid-range': ['Norway', 'Sweden', 'Finland', 'Iceland'],
    luxury: ['Canada', 'Alaska', 'Greenland', 'Antarctica']
  },
  desert: {
    budget: ['Morocco', 'Jordan', 'Egypt', 'India (Rajasthan)'],
    'mid-range': ['UAE', 'Oman', 'Israel', 'Chile (Atacama)'],
    luxury: ['Dubai', 'Qatar', 'Namibia', 'Australia (Outback)']
  }
};

export const InspireMeModal: React.FC<InspireMeModalProps> = ({ 
  onClose, 
  onSelectDestination, 
  onShowPersonalizedSuggestions 
}) => {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    budget: '',
    climate: '',
    travelStyle: '',
    groupSize: '',
    season: ''
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handlePreferenceChange = (key: keyof TravelPreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const generateSuggestions = () => {
    if (!preferences.climate || !preferences.budget) {
      alert('Please select at least climate and budget preferences');
      return;
    }

    // Navigate to personalized suggestions page
    onShowPersonalizedSuggestions(preferences);
    onClose();
  };

  const handleSelectDestination = (destination: string) => {
    onSelectDestination(destination);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Inspire Me</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-center">
            Tell us your preferences and we'll suggest amazing destinations for your next adventure!
          </p>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <DollarSign className="inline h-4 w-4 mr-1" />
              What's your budget?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'budget', label: 'Budget', desc: 'Under $50/day' },
                { value: 'mid-range', label: 'Mid-range', desc: '$50-150/day' },
                { value: 'luxury', label: 'Luxury', desc: '$150+/day' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('budget', option.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    preferences.budget === option.value
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Climate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Thermometer className="inline h-4 w-4 mr-1" />
              What climate do you prefer?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'tropical', label: 'Tropical', emoji: '🌴' },
                { value: 'temperate', label: 'Temperate', emoji: '🌸' },
                { value: 'cold', label: 'Cold', emoji: '❄️' },
                { value: 'desert', label: 'Desert', emoji: '🏜️' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('climate', option.value)}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    preferences.climate === option.value
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="font-medium text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MapPin className="inline h-4 w-4 mr-1" />
              What's your travel style?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: 'adventure', label: 'Adventure' },
                { value: 'relaxation', label: 'Relaxation' },
                { value: 'culture', label: 'Culture' },
                { value: 'nightlife', label: 'Nightlife' },
                { value: 'nature', label: 'Nature' },
                { value: 'food', label: 'Food' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('travelStyle', option.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    preferences.travelStyle === option.value
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Users className="inline h-4 w-4 mr-1" />
              Who are you traveling with?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'solo', label: 'Solo' },
                { value: 'couple', label: 'Couple' },
                { value: 'family', label: 'Family' },
                { value: 'friends', label: 'Friends' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('groupSize', option.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    preferences.groupSize === option.value
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateSuggestions}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
          >
            <Shuffle className="h-5 w-5" />
            <span>Get My Destination Suggestions</span>
          </button>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Perfect destinations for you:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((destination, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectDestination(destination)}
                    className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group border-2 border-transparent hover:border-orange-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {destination}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Click to start planning
                        </p>
                      </div>
                      <MapPin className="h-5 w-5 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={generateSuggestions}
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1 mx-auto"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Get different suggestions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};