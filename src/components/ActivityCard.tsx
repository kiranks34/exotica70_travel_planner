import React from 'react';
import { Activity } from '../types';
import { Clock, MapPin, Edit2, Trash2, DollarSign, Sparkles, Undo2, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { getDestinationThumbnail, getActivityAddress, getActivityPhoneNumber } from '../utils/destinationImages';
import { getCategoryColor, getCategoryLabel, shouldShowPrice } from '../utils/categoryUtils';

interface ActivityCardProps {
  activity: Activity;
  activityNumber: number;
  destination: string;
  onEdit: () => void;
  onDelete: () => void;
  onAISuggest?: () => void;
  onUndo?: () => void;
  hasUndo?: boolean;
  onVote?: (activityId: string, choice: 'yes' | 'no' | 'maybe') => void;
  voteCounts?: { yes: number; no: number; maybe: number };
  userVote?: 'yes' | 'no' | 'maybe' | null;
  isLoggedIn?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  activityNumber,
  destination,
  onEdit,
  onDelete,
  onAISuggest,
  onUndo,
  hasUndo = false,
  onVote,
  voteCounts = { yes: 0, no: 0, maybe: 0 },
  userVote = null,
  isLoggedIn = false
}) => {
  const startTime = new Date(`2000-01-01T${activity.startTime}`);
  const endTime = new Date(`2000-01-01T${activity.endTime}`);
  const thumbnailImage = getDestinationThumbnail(activity.title, destination);
  const preciseAddress = getActivityAddress(activity.title, destination);
  const phoneNumber = getActivityPhoneNumber(activity.title, destination);
  const categoryColor = getCategoryColor(activity.category);
  const categoryLabel = getCategoryLabel(activity.category);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'booked':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleMapClick = () => {
    const encodedAddress = encodeURIComponent(preciseAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="relative group">
      {/* Edit/Delete Buttons - Outside card, top right */}
      <div className="absolute -top-2 -right-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={onEdit}
          className="p-2 bg-white text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors shadow-md border border-gray-200"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-md border border-gray-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-orange-200 transition-all duration-200">
        <div className="flex items-start p-6">
          {/* Content - Left Side */}
          <div className="flex-1 pr-6">
            {/* Activity Number and Title */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <span className="text-orange-500 font-bold mr-2">{activityNumber}.</span>
                {activity.title}
              </h3>
              
              {/* Category and Status */}
              <div className="flex items-center space-x-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColor}`}>
                  {categoryLabel}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.bookedStatus)}`}>
                  {activity.bookedStatus.replace('-', ' ')}
                </span>
              </div>
            </div>
          
          {/* Activity Details */}
          <div className="space-y-3 text-sm text-gray-600 mb-4">
            {/* Time */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>
                {startTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })} - {endTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            
            {/* Address with Google Maps */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMapClick}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                title="Open in Google Maps"
              >
                <MapPin className="h-4 w-4" />
                <span className="hover:underline">{preciseAddress}</span>
              </button>
            </div>
            
            {/* Phone Number under Maps */}
            {phoneNumber && (
              <div className="flex items-center space-x-2 ml-6">
                <span className="text-gray-400">📞</span>
                <a 
                  href={`tel:${phoneNumber}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors hover:underline text-sm"
                >
                  {phoneNumber}
                </a>
              </div>
            )}
            
            {/* Cost - only for bookable attractions */}
            {activity.cost && shouldShowPrice(activity.category, activity.title) && (
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>${activity.cost}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          {activity.description && (
            <p className="text-gray-700 mb-4">
              {activity.description}
            </p>
          )}

          {/* Voting Section */}
          {onVote && isLoggedIn && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">What do you think?</span>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{voteCounts.yes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>👎</span>
                    <span>{voteCounts.no}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🤷</span>
                    <span>{voteCounts.maybe}</span>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onVote(activity.id, 'yes')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    userVote === 'yes'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes</span>
                </button>
                
                <button
                  onClick={() => onVote(activity.id, 'no')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    userVote === 'no'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No</span>
                </button>
                
                <button
                  onClick={() => onVote(activity.id, 'maybe')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    userVote === 'maybe'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  <Meh className="h-4 w-4" />
                  <span>Maybe</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Login prompt for voting */}
          {onVote && !isLoggedIn && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Login to vote on activities</p>
                <div className="flex items-center justify-center space-x-2 opacity-50">
                  <button disabled className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Yes</span>
                  </button>
                  <button disabled className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 cursor-not-allowed">
                    <ThumbsDown className="h-4 w-4" />
                    <span>No</span>
                  </button>
                  <button disabled className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700 cursor-not-allowed">
                    <Meh className="h-4 w-4" />
                    <span>Maybe</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          
          {/* Thumbnail Image - Right Side */}
          <div className="flex-shrink-0 flex flex-col">
            <img
              src={thumbnailImage}
              alt={activity.title}
              className="w-80 h-48 object-cover rounded-lg"
            />
            
            {/* AI Suggested Section - Below Image */}
            {activity.notes && activity.notes.includes('AI curated') && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3 w-80">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center">
                    {hasUndo && onUndo && (
                      <button
                        onClick={onUndo}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-orange-600 transition-colors px-2 py-1 rounded-md hover:bg-white mr-2"
                        title="Undo last suggestion"
                      >
                        <Undo2 className="h-3 w-3" />
                        <span>Undo</span>
                      </button>
                    )}
                    {onAISuggest && (
                      <button
                        onClick={onAISuggest}
                        className="flex items-center space-x-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 font-medium whitespace-nowrap"
                        title="Get AI suggestion for this activity"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Suggest Alternatives</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    AI can make mistakes, so double-check it
                  </p>
                </div>
              </div>
            )}
            
            {/* AI Suggested Section - Below Image */}
            {activity.notes && activity.notes.includes('Suggested activity') && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3 w-64">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-xs font-medium text-orange-600">AI Suggested</span>
                </div>
                
                {/* AI Buttons */}
                <div className="flex items-center justify-end space-x-2">
                  {hasUndo && onUndo && (
                    <button
                      onClick={onUndo}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-orange-600 transition-colors px-2 py-1 rounded-md hover:bg-white"
                      title="Undo last suggestion"
                    >
                      <Undo2 className="h-3 w-3" />
                      <span>Undo</span>
                    </button>
                  )}
                  {onAISuggest && (
                    <button
                      onClick={onAISuggest}
                      className="flex items-center space-x-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 font-medium"
                      title="Get AI suggestion for this activity"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Suggest Alternative</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};