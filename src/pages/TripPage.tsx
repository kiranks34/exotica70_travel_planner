import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Users
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  time: string;
  est_cost: number;
  tags: string[];
}

interface Day {
  day: number;
  activities: Activity[];
}

interface Trip {
  destination: string;
  days: number;
  budget: number;
  itinerary: Day[];
}

interface VoteCounts {
  yes: number;
  no: number;
  maybe: number;
}

interface Votes {
  [activityId: string]: VoteCounts;
}

interface TripData {
  trip: Trip;
  votes?: Votes;
}

const TripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userVotes, setUserVotes] = useState<{[activityId: string]: string}>({});

  // Fetch trip data
  const fetchTripData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trip/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trip: ${response.status}`);
      }
      
      const data: TripData = await response.json();
      setTripData(data);
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [id]);

  // Copy link functionality
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Simplified voting - just local state for now
  const handleVote = (activityId: string, choice: 'yes' | 'no' | 'maybe') => {
    setUserVotes(prev => ({ ...prev, [activityId]: choice }));
  };
  // Calculate total spent
  const calculateTotalSpent = (): number => {
    if (!tripData?.trip.itinerary) return 0;
    
    return tripData.trip.itinerary.reduce((total, day) => {
      return total + day.activities.reduce((dayTotal, activity) => {
        return dayTotal + (activity.est_cost || 0);
      }, 0);
    }, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Trip</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTripData}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No trip data
  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Trip not found</p>
        </div>
      </div>
    );
  }

  const { trip } = tripData;
  const totalSpent = calculateTotalSpent();
  const budgetProgress = trip.budget > 0 ? (totalSpent / trip.budget) * 100 : 0;

  // Empty itinerary state
  if (!trip.itinerary || trip.itinerary.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.destination}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{trip.days} days</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${trip.budget}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Yet</h2>
            <p className="text-gray-600">
              This trip doesn't have an itinerary yet. Check back later or contact the trip organizer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.destination}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>{trip.days} days</span>
                </div>
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  <span>${trip.budget}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Budget</h2>
            <span className="text-sm text-gray-600">
              ${totalSpent.toFixed(2)} / ${trip.budget}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                budgetProgress > 100 ? 'bg-red-500' : budgetProgress > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
          {budgetProgress > 100 && (
            <p className="text-red-600 text-sm mt-2">
              Over budget by ${(totalSpent - trip.budget).toFixed(2)}
            </p>
          )}
        </div>

        {/* Days and Activities */}
        <div className="space-y-6">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-semibold">
                  Day {day.day}
                </div>
                <span className="text-gray-600">
                  {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              <div className="space-y-4">
                {day.activities.map((activity) => {
                  const userVote = userVotes[activity.id];

                  return (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Activity Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{activity.time}</span>
                          </div>
                          {activity.est_cost > 0 && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${activity.est_cost}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Voting Section */}
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">What do you think?</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleVote(activity.id, 'yes')}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                                  userVote === 'yes'
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                                }`}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span>Yes</span>
                              </button>
                              <button
                                onClick={() => handleVote(activity.id, 'maybe')}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                                  userVote === 'maybe'
                                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                              >
                                <Meh className="h-4 w-4" />
                                <span>Maybe</span>
                              </button>
                              <button
                                onClick={() => handleVote(activity.id, 'no')}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                                  userVote === 'no'
                                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                <ThumbsDown className="h-4 w-4" />
                                <span>No</span>
                              </button>
                            </div>
                          </div>
                          {userVote && (
                            <div className="text-sm text-gray-500">
                              Your choice: <span className="font-medium capitalize">{userVote}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {activity.tags && activity.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-wrap gap-2">
                          {activity.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripPage;