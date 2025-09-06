import React from 'react';
import { Activity } from '../types';
import { Clock, MapPin, Edit2, Trash2, DollarSign, Sparkles, Undo2, ThumbsUp, ThumbsDown, Meh, Users } from 'lucide-react';
import { getDestinationThumbnail, getActivityAddress, getActivityPhoneNumber } from '../utils/destinationImages';
import { getCategoryColor, getCategoryLabel, shouldShowPrice } from '../utils/categoryUtils';

interface VoteCounts {
  yes: number;
  no: number;
  maybe: number;
}

interface ActivityCardProps {
  activity: Activity;
  activityNumber: number;
  destination: string;
  onEdit: () => void;
  onDelete: () => void;
  onAISuggest?: () => void;
  onUndo?: () => void;
  hasUndo?: boolean;
  userVote?: 'yes' | 'no' | 'maybe';
  voteCounts?: VoteCounts;
  onVote?: (activityId: string, vote: 'yes' | 'no' | 'maybe') => void;
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
  userVote,
  voteCounts,
  onVote,
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

  const handleVote = (vote: 'yes' | 'no' | 'maybe') => {
    if (onVote) {
      onVote(activity.id, vote);
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
        <div className="flex items-start">
          {/* Activity Image */}
          <div className="w-32 h-32 flex-shrink-0">
            <img
              src={thumbnailImage}
              alt={activity.title}
              className="w-full h-full object-cover rounded-l-xl"
            />
          </div>

          {/* Content - Left Side */}
          <div className="flex-1 pr-6">
            <div className="p-6">
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
                  <span>{preciseAddress}</span>
                </button>
              </div>

              {/* Cost */}
              {activity.cost && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>${activity.cost}</span>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Voting Section */}
        {onVote && (
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">What do you think?</span>
                </div>
                
                {/* Voting Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote('yes')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      userVote === 'yes'
                        ? 'bg-green-500 text-white shadow-md transform scale-105'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-sm'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Yes</span>
                    {voteCounts && voteCounts.yes > 0 && (
                      <span className="bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs">
                        {voteCounts.yes}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleVote('maybe')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      userVote === 'maybe'
                        ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:shadow-sm'
                    }`}
                  >
                    <Meh className="h-4 w-4" />
                    <span>Maybe</span>
                    {voteCounts && voteCounts.maybe > 0 && (
                      <span className="bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs">
                        {voteCounts.maybe}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleVote('no')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      userVote === 'no'
                        ? 'bg-red-500 text-white shadow-md transform scale-105'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-sm'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>No</span>
                    {voteCounts && voteCounts.no > 0 && (
                      <span className="bg-white bg-opacity-30 px-1.5 py-0.5 rounded-full text-xs">
                        {voteCounts.no}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Vote Summary */}
              {voteCounts && getTotalVotes() > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{getTotalVotes()}</span> vote{getTotalVotes() !== 1 ? 's' : ''}
                  {userVote && (
                    <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                      You voted: <span className="font-medium capitalize">{userVote}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};