import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Globe, Utensils, Camera, DollarSign, Lightbulb, Star, Info, Plane } from 'lucide-react';
import { generateDestinationDetails, DestinationDetails } from '../utils/destinationDetails';

interface DestinationDetailsPageProps {
  destinationName: string;
  country: string;
  image: string;
  onBack: () => void;
}

export const DestinationDetailsPage: React.FC<DestinationDetailsPageProps> = ({
  destinationName,
  country,
  image,
  onBack
}) => {
  const [details, setDetails] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const destinationDetails = await generateDestinationDetails(destinationName, country);
        setDetails(destinationDetails);
      } catch (err) {
        console.error('Error fetching destination details:', err);
        setError('Failed to load destination details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationDetails();
  }, [destinationName, country]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Info className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Details</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={image}
          alt={`${destinationName}, ${country}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center space-x-2 bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-6 w-6 text-white" />
            <span className="text-white text-lg">{country}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{destinationName}</h1>
          <p className="text-white text-lg max-w-2xl leading-relaxed">{details.overview}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Highlights */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Star className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Top Highlights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {details.highlights.map((highlight, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Best Time to Visit */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">Best Time to Visit</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{details.bestTimeToVisit}</p>
            </div>

            {/* Local Culture */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Local Culture</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{details.localCulture}</p>
            </div>

            {/* Cuisine */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Utensils className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Local Cuisine</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {details.cuisine.map((dish, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-800 font-medium text-sm">{dish}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transportation */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Plane className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Transportation</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{details.transportation}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Activities */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="h-6 w-6 text-pink-600" />
                <h3 className="text-xl font-semibold text-gray-900">Popular Activities</h3>
              </div>
              <div className="space-y-2">
                {details.activities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                    <p className="text-gray-700">{activity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Tips */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <DollarSign className="h-6 w-6 text-yellow-600" />
                <h3 className="text-xl font-semibold text-gray-900">Budget Tips</h3>
              </div>
              <div className="space-y-2">
                {details.budgetTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Gems */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Lightbulb className="h-6 w-6 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Hidden Gems</h3>
              </div>
              <div className="space-y-2">
                {details.hiddenGems.map((gem, index) => (
                  <div key={index} className="bg-orange-50 rounded-lg p-3">
                    <p className="text-orange-800 font-medium text-sm">{gem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Practical Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Currency</p>
                  <p className="text-gray-900">{details.practicalInfo.currency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Language</p>
                  <p className="text-gray-900">{details.practicalInfo.language}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time Zone</p>
                  <p className="text-gray-900">{details.practicalInfo.timeZone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Climate</p>
                  <p className="text-gray-900">{details.practicalInfo.climate}</p>
                </div>
              </div>
            </div>

            {/* Travel Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Essential Travel Tips</h3>
              <div className="space-y-2">
                {details.travelTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Plan Your Trip?</h3>
            <p className="text-lg mb-6 opacity-90">Start creating your personalized itinerary for {destinationName}</p>
            <button
              onClick={onBack}
              className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Planning Your Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};