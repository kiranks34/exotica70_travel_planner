import React, { useState } from 'react';
import { MapPin, Heart, Star, Sparkles, Check } from 'lucide-react';

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  description: string;
  hiddenGem: string;
  rating: number;
  onPlanTrip: (destination: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  name,
  country,
  image,
  description,
  hiddenGem,
  rating,
  onPlanTrip
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTripFeedback, setShowTripFeedback] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handlePlanTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlanTrip(`${name}, ${country}`);
    setShowTripFeedback(true);
    setTimeout(() => setShowTripFeedback(false), 2000);
  };

  return (
    <div className="relative bg-white bg-opacity-20 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02] border border-white border-opacity-30 w-full max-w-xl">
      {/* Favorite Feedback */}
      {showFeedback && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 flex items-center space-x-2 animate-pulse">
          <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isFavorite ? 'Added to favorites!' : 'Removed from favorites'}
          </span>
        </div>
      )}
      
      {/* Trip Added Feedback */}
      {showTripFeedback && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center space-x-2 animate-pulse">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Destination added to planner!</span>
        </div>
      )}
      
      <div className="flex h-48">
        {/* Image Section - 45% width */}
        <div className="relative w-[50%] overflow-hidden">
          <img
            src={image}
            alt={`${name}, ${country}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Favorite Icon */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'
              }`} 
            />
          </button>

          {/* Rating and Add Trip Section */}
          <div className="absolute bottom-4 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-medium">{rating}</span>
            </div>
            <div className="ml-3">
            <button
              onClick={handlePlanTrip}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium transition-all transform hover:scale-105 whitespace-nowrap shadow-lg"
            >
              Add Trip
            </button>
            </div>
          </div>
        </div>

        {/* Content Section - 55% width */}
        <div className="w-[50%] p-5 flex flex-col justify-between">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              <h3 className="text-lg font-bold text-white drop-shadow-md">{name}</h3>
            </div>
            <span className="text-white/90 text-sm drop-shadow-sm">{country}</span>
          </div>

          {/* Description */}
          <p className="text-white/95 mb-4 leading-relaxed text-sm line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};