import React, { useState } from 'react';
import { DayPlanner } from './DayPlanner';
import { ActivityModal } from './ActivityModal';
import { ShareModal } from './ShareModal';
import { AIInsightsModal } from './AIInsightsModal';
import { Trip, DayItinerary, Activity } from '../types';
import { generateDayItineraries } from '../utils/tripUtils';
import { generateActivitySuggestions } from '../utils/activitySuggestions';
import { ArrowLeft, Share2, Plus, Calendar, MapPin, Lightbulb } from 'lucide-react';
import { AITripInsights } from '../utils/aiTripConverter';
import { supabase } from '../lib/supabase';

interface ItineraryViewProps {
  trip: Trip;
  tripType?: string;
  onBack: () => void;
  user?: any;
  aiInsights?: AITripInsights | null;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ 
  trip, 
  tripType = '', 
  onBack, 
  user,
  aiInsights 
}) => {
  const initialDayItineraries = generateActivitySuggestions(trip.destination, tripType, generateDayItineraries(trip));
  const [dayItineraries, setDayItineraries] = useState<DayItinerary[]>(initialDayItineraries);
  const [selectedDay, setSelectedDay] = useState<DayItinerary | null>(initialDayItineraries[0] || null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ [activityId: string]: { yes: number; no: number; maybe: number } }>({});
  const [userVotes, setUserVotes] = useState<{ [activityId: string]: 'yes' | 'no' | 'maybe' }>({});
  const [showVotesResults, setShowVotesResults] = useState(false);

  // Load votes when component mounts
  React.useEffect(() => {
    if (user && trip.id) {
      loadVotes();
    }
  }, [user, trip.id]);

  const loadVotes = async () => {
    if (!user || !trip.id) return;

    try {
      // Get all votes for this trip
      const { data: votes, error } = await supabase
        .from('votes')
        .select('activity_id, choice, voter_id')
        .eq('trip_id', trip.id);

      if (error) {
        console.error('Error loading votes:', error);
        return;
      }

      // Aggregate vote counts
      const counts: { [activityId: string]: { yes: number; no: number; maybe: number } } = {};
      const userVoteMap: { [activityId: string]: 'yes' | 'no' | 'maybe' } = {};

      votes?.forEach(vote => {
        if (!counts[vote.activity_id]) {
          counts[vote.activity_id] = { yes: 0, no: 0, maybe: 0 };
        }
        counts[vote.activity_id][vote.choice as 'yes' | 'no' | 'maybe']++;

        // Track current user's votes
        if (vote.voter_id === user.id) {
          userVoteMap[vote.activity_id] = vote.choice as 'yes' | 'no' | 'maybe';
        }
      });

      setVoteCounts(counts);
      setUserVotes(userVoteMap);
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleAddActivity = (activity: Activity) => {
    if (!selectedDay) return;

    setDayItineraries(prev => 
      prev.map(day => 
        day.id === selectedDay.id
          ? { ...day, activities: [...day.activities, activity] }
          : day
      )
    );
    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    setDayItineraries(prev => 
      prev.map(day => 
        day.id === dayId
          ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
          : day
      )
    );
    
    // Update selected day if it's the one being modified
    if (selectedDay?.id === dayId) {
      setSelectedDay(prev => 
        prev ? { ...prev, activities: prev.activities.filter(a => a.id !== activityId) } : null
      );
    }
  };

  const handleUpdateNotes = (dayId: string, notes: string) => {
    setDayItineraries(prev => 
      prev.map(day => 
        day.id === dayId ? { ...day, notes } : day
      )
    );
  };

  const handleUpdateDay = (updatedDay: DayItinerary) => {
    setDayItineraries(prev => 
      prev.map(day => 
        day.id === updatedDay.id ? updatedDay : day
      )
    );
    
    // Update selected day if it's the one being updated
    if (selectedDay?.id === updatedDay.id) {
      setSelectedDay(updatedDay);
    }
  };

  const handleVote = async (activityId: string, choice: 'yes' | 'no' | 'maybe') => {
    if (!user || !trip.id) return;

    try {
      const previousVote = userVotes[activityId];
      
      // If user clicks the same vote, remove it (toggle off)
      if (previousVote === choice) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('trip_id', trip.id)
          .eq('activity_id', activityId)
          .eq('voter_id', user.id);

        if (error) {
          console.error('Error removing vote:', error);
          return;
        }

        // Update local state
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[activityId];
          return newVotes;
        });
        
        setVoteCounts(prev => {
          const currentCounts = prev[activityId] || { yes: 0, no: 0, maybe: 0 };
          return {
            ...prev,
            [activityId]: {
              ...currentCounts,
              [choice]: Math.max(0, currentCounts[choice] - 1)
            }
          };
        });
        return;
      }

      // Upsert the vote
      const { error } = await supabase
        .from('votes')
        .upsert({
          trip_id: trip.id,
          activity_id: activityId,
          voter_id: user.id,
          choice
        });

      if (error) {
        console.error('Error saving vote:', error);
        return;
      }

      // Update local state
      setUserVotes(prev => ({ ...prev, [activityId]: choice }));
      
      setVoteCounts(prev => {
        const currentCounts = prev[activityId] || { yes: 0, no: 0, maybe: 0 };
        
        // Remove previous vote if exists
        if (previousVote) {
          currentCounts[previousVote] = Math.max(0, currentCounts[previousVote] - 1);
        }
        
        // Add new vote
        currentCounts[choice] = currentCounts[choice] + 1;
        
        return {
          ...prev,
          [activityId]: { ...currentCounts }
        };
      });
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };

  const tripDuration = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  const dayCount = Math.ceil(tripDuration / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {trip.destination}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{dayCount} days</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {aiInsights && (
                <button
                  onClick={() => setShowAIInsights(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>AI Insights</span>
                </button>
              )}
              
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Day List Sidebar */}
          <div className="lg:col-span-1">
           <div className="bg-gray-50 rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Days</h2>
             <div className="space-y-3 relative">
                {dayItineraries.map((day, index) => {
                  const dayDate = new Date(day.date);
                  const isSelected = selectedDay?.id === day.id;
                  
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day)}
                     className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                        isSelected 
                         ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                         : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md text-gray-700'
                      }`}
                    >
                     <div className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                       Day {index + 1}
                     </div>
                     <div className={`text-sm ${isSelected ? 'text-orange-100' : 'text-gray-600'}`}>
                        {dayDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                     <div className={`text-xs mt-2 ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>
                        {day.activities.length} activities
                      </div>
                     {isSelected && (
                       <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                     )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Day Planner */}
          <div className="lg:col-span-3">
            {selectedDay ? (
              <DayPlanner
                day={selectedDay}
               destination={trip.destination}
               tripType={tripType}
                onAddActivity={() => setShowActivityModal(true)}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onUpdateNotes={handleUpdateNotes}
               onUpdateDay={handleUpdateDay}
                onVote={handleVote}
                voteCounts={voteCounts}
                userVotes={userVotes}
               isLoggedIn={!!user}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Select a day to start planning
                </h3>
                <p className="text-gray-600">
                  Choose a day from the sidebar to add activities and notes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Votes Results Section */}
        {user && Object.keys(voteCounts).length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Group Voting Results</h2>
                <button
                  onClick={() => setShowVotesResults(!showVotesResults)}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  {showVotesResults ? 'Hide Results' : 'See Votes'}
                </button>
              </div>
              
              {showVotesResults && (
                <div className="space-y-4">
                  {dayItineraries.map(day => {
                    const dayActivitiesWithVotes = day.activities.filter(activity => 
                      voteCounts[activity.id] && 
                      (voteCounts[activity.id].yes + voteCounts[activity.id].no + voteCounts[activity.id].maybe) > 0
                    );
                    
                    if (dayActivitiesWithVotes.length === 0) return null;
                    
                    return (
                      <div key={day.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Day {dayItineraries.indexOf(day) + 1} - {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <div className="space-y-3">
                          {dayActivitiesWithVotes
                            .sort((a, b) => {
                              const aVotes = voteCounts[a.id];
                              const bVotes = voteCounts[b.id];
                              const aScore = aVotes.yes * 2 + aVotes.maybe * 1 - aVotes.no * 1;
                              const bScore = bVotes.yes * 2 + bVotes.maybe * 1 - bVotes.no * 1;
                              return bScore - aScore;
                            })
                            .map(activity => {
                              const votes = voteCounts[activity.id];
                              const totalVotes = votes.yes + votes.no + votes.maybe;
                              const score = votes.yes * 2 + votes.maybe * 1 - votes.no * 1;
                              const isTopVoted = score > 0 && votes.yes >= votes.no;
                              
                              return (
                                <div key={activity.id} className={`flex items-center justify-between p-3 rounded-lg ${
                                  isTopVoted ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                                }`}>
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${isTopVoted ? 'text-green-800' : 'text-gray-900'}`}>
                                      {activity.title}
                                      {isTopVoted && <span className="ml-2 text-green-600">⭐ Top Choice</span>}
                                    </h4>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="flex items-center space-x-1">
                                      <span>👍</span>
                                      <span className="font-medium">{votes.yes}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <span>👎</span>
                                      <span className="font-medium">{votes.no}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <span>🤷</span>
                                      <span className="font-medium">{votes.maybe}</span>
                                    </span>
                                    <span className="text-gray-500">({totalVotes} votes)</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showActivityModal && selectedDay && (
        <ActivityModal
          day={selectedDay}
          activity={editingActivity}
          onSave={handleAddActivity}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
        />
      )}

      {showShareModal && (
        <ShareModal
          trip={trip}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showAIInsights && aiInsights && (
        <AIInsightsModal
          insights={aiInsights}
          destination={trip.destination}
          onClose={() => setShowAIInsights(false)}
        />
      )}
    </div>
  );
};