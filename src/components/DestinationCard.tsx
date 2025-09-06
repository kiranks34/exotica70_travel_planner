import React, { useState } from 'react';
import { MapPin, Heart, Star, Sparkles } from 'lucide-react';

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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handlePlanTrip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlanTrip(`${name}, ${country}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:scale-[1.02]">
      <div className="flex h-40">
        {/* Image Section - 40% width */}
        <div className="relative w-2/5 overflow-hidden">
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

          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>
        </div>

        {/* Content Section - 60% width */}
        <div className="w-3/5 p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="mb-2">
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            </div>
            <span className="text-gray-600 text-sm">{country}</span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            {description}
          </p>

          {/* Hidden Gem */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-purple-700 text-xs font-medium">Hidden Gem</span>
            </div>
            <p className="text-purple-600 text-xs mt-1 leading-relaxed whitespace-normal">
              {hiddenGem}
            </p>
          </div>

          {/* Plan a Trip Button */}
          <button
            onClick={handlePlanTrip}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 text-sm whitespace-nowrap"
          >
            Plan a Trip
          </button>
        </div>
      </div>
    </div>
  );
};