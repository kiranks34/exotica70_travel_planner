import React, { useState } from 'react';
import { Heart, MapPin, Users, Star } from 'lucide-react';

interface DestinationCardProps {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  hiddenGem: string;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPlanTrip: (destination: string) => void;
  onViewDetails: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  name,
  country,
  image,
  description,
  hiddenGem,
  rating,
  reviewCount,
  isFavorite,
  onToggleFavorite,
  onPlanTrip,
  onViewDetails
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favoriteClicked, setFavoriteClicked] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteClicked(true);
    onToggleFavorite(id);
    setTimeout(() => setFavoriteClicked(false), 300);
  };

  const handlePlanTripClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlanTrip(`${name}, ${country}`);
  };

  const handleCardClick = () => {
    onViewDetails(id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-white border-opacity-20 h-40"
    >
      {/* Horizontal Layout - Image left (40%), content right (60%) */}
      <div className="flex h-full">
        {/* Image Container - Left 40% */}
        <div className="relative w-[40%] overflow-hidden">
          <img
            src={image}
            alt={`${name}, ${country}`}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          
          {/* Favorite button - Top right of image */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/20 text-white hover:bg-white/30'
            } ${favoriteClicked ? 'scale-125' : 'scale-100'}`}
          >
            <Heart 
              className={`h-5 w-5 transition-all ${
                isFavorite ? 'fill-current' : ''
              }`} 
            />
          </button>

          {/* Rating - Top left of image */}
          <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-white text-sm font-medium">{rating}</span>
          </div>
        </div>

        {/* Content - Right 60% */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Location */}
          <div>
            <div className="flex items-center space-x-1 mb-1">
              <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">{name}</h3>
              <span className="text-white/70 text-xs">{country}</span>
            </div>

            {/* Description */}
            <p className="text-white/90 text-xs mb-2 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          {/* Hidden Gem */}
          <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-lg p-2 mb-2 border border-orange-400/30">
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-orange-300 text-xs font-semibold uppercase tracking-wide">Gem</span>
            </div>
            <p className="text-white text-xs italic leading-relaxed line-clamp-2">"{hiddenGem}"</p>
          </div>

          {/* Plan Trip Button */}
          <button
            onClick={handlePlanTripClick}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-2 px-3 rounded-lg font-semibold text-xs transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Plan Trip
          </button>
        </div>
      </div>
    </div>
  );
};