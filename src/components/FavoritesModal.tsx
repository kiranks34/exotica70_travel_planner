import React from 'react';
import { X, Heart, MapPin, Trash2 } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
}

interface FavoritesModalProps {
  favorites: Destination[];
  onClose: () => void;
  onRemoveFavorite: (id: string) => void;
  onPlanTrip: (destination: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  favorites,
  onClose,
  onRemoveFavorite,
  onPlanTrip
}) => {
  const handlePlanTrip = (destination: Destination) => {
    onPlanTrip(`${destination.name}, ${destination.country}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            <h2 className="text-2xl font-bold text-gray-900">My Favorite Destinations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600">
                Start exploring destinations and save your favorites by clicking the heart icon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((destination) => (
                <div key={destination.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-40">
                    <img
                      src={destination.image}
                      alt={`${destination.name}, ${destination.country}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveFavorite(destination.id)}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <h3 className="font-semibold text-gray-900">{destination.name}</h3>
                      <span className="text-gray-600 text-sm">{destination.country}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {destination.description}
                    </p>
                    
                    <button
                      onClick={() => handlePlanTrip(destination)}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105"
                    >
                      Plan Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};