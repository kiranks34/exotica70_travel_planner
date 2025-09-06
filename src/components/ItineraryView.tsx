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
  const handleVote = (activityId: string, choice: 'yes' | 'no' | 'maybe') => {
    if (!user) return; // Only allow voting if user is logged in
    
    const previousVote = userVotes[activityId];
    
    // If user clicks the same vote, remove it (toggle off)
    if (previousVote === choice) {
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[activityId];
        return newVotes;
      });
      
      // Decrease the count for the removed vote
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
    
    // Update user's vote
    setUserVotes(prev => ({ ...prev, [activityId]: choice }));
    
    // Update vote counts (simulate real-time voting)
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