import React, { useState } from 'react';
import { DayPlanner } from './DayPlanner';
import { ActivityModal } from './ActivityModal';
import { ShareModal } from './ShareModal';
import { AIInsightsModal } from './AIInsightsModal';
import { VotingSummary } from './VotingSummary';
import { Trip, DayItinerary, Activity } from '../types';
import { generateDayItineraries } from '../utils/tripUtils';
import { generateActivitySuggestions } from '../utils/activitySuggestions';
import { ArrowLeft, Share2, Plus, Calendar, MapPin, Lightbulb } from 'lucide-react';
import { AITripInsights } from '../utils/aiTripConverter';

interface VoteCounts {
  yes: number;
  no: number;
  maybe: number;
}
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
  const [dayItineraries, setDayItineraries] = useState<DayItinerary[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayItinerary | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<{[activityId: string]: 'yes' | 'no' | 'maybe'}>({});
  const [voteCounts, setVoteCounts] = useState<{[activityId: string]: VoteCounts}>({});

  // Load trip data and votes on component mount
  React.useEffect(() => {
    const loadTripData = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have AI insights, if so use enhanced suggestions
        let initialDayItineraries;
        if (aiInsights) {
          // Use AI-enhanced activity suggestions
          initialDayItineraries = generateAIEnhancedSuggestions(trip.destination, tripType, generateDayItineraries(trip), aiInsights);
        } else {
          // Fallback to regular AI suggestions
          initialDayItineraries = generateActivitySuggestions(trip.destination, tripType, generateDayItineraries(trip));
        }
        
        setDayItineraries(initialDayItineraries);
        setSelectedDay(initialDayItineraries[0] || null);
        
        // Initialize vote counts for all activities
        const initialVoteCounts: {[activityId: string]: VoteCounts} = {};
        initialDayItineraries.forEach(day => {
          day.activities.forEach(activity => {
            initialVoteCounts[activity.id] = { yes: 0, no: 0, maybe: 0 };
          });
        });
        setVoteCounts(initialVoteCounts);
        
      } catch (error) {
        console.error('Error loading trip data:', error);
        // Fallback to basic suggestions on error
        const initialDayItineraries = generateActivitySuggestions(trip.destination, tripType, generateDayItineraries(trip));
        setDayItineraries(initialDayItineraries);
        setSelectedDay(initialDayItineraries[0] || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, [trip.id, trip.destination, tripType]);

  // Generate AI-enhanced suggestions when we have AI insights
  const generateAIEnhancedSuggestions = (destination: string, tripType: string, dayItineraries: DayItinerary[], insights: AITripInsights): DayItinerary[] => {
    const enhancedDays = generateActivitySuggestions(destination, tripType, dayItineraries);
    
    // Enhance activities with AI insights
    return enhancedDays.map((day, index) => ({
      ...day,
      activities: day.activities.map(activity => ({
        ...activity,
        notes: `${activity.notes}\n\n🤖 AI Enhanced:\n• Best time to visit: ${insights.bestTimeToVisit}\n• Local currency: ${insights.localCurrency}\n• Cultural tip: ${insights.culturalTips[index % insights.culturalTips.length] || 'Respect local customs'}`
      })),
      notes: `${day.notes}\n\n💡 AI Insight: ${insights.culturalTips[index] || 'Enjoy your day exploring!'}`
    }));
  };

  // Helper function to convert API itinerary format to our day itineraries format
  const convertAPIItineraryToDayItineraries = (apiItinerary: any, trip: Trip): DayItinerary[] => {
    if (!apiItinerary.days || !Array.isArray(apiItinerary.days)) {
      return [];
    }

    const startDate = new Date(trip.startDate);
    
    return apiItinerary.days.map((day: any, index: number) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + index);
      
      const activities: Activity[] = day.activities.map((activity: any) => ({
        id: activity.id || crypto.randomUUID(),
        title: activity.title,
        description: activity.description || '',
        location: trip.destination,
        startTime: activity.time || '09:00',
        endTime: calculateEndTime(activity.time || '09:00', activity.duration_min || 120),
        category: mapAPICategory(activity.category || 'activity'),
        notes: `AI curated activity\n\nTips:\n${(activity.tips || []).map((tip: string) => `• ${tip}`).join('\n')}`,
        cost: activity.est_cost_per_person,
        bookedStatus: 'not-booked' as const
      }));

      return {
        id: crypto.randomUUID(),
        tripId: trip.id,
        date: dayDate.toISOString().split('T')[0],
        activities,
        notes: day.summary || `Day ${day.day} in ${trip.destination}`,
        budget: day.budget_estimate || 0
      };
    });
  };

  const calculateEndTime = (startTime: string, durationMin: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMin * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const mapAPICategory = (apiCategory: string): ActivityCategory => {
    const categoryMap: { [key: string]: ActivityCategory } = {
      'accommodation': 'accommodation',
      'transport': 'transport',
      'restaurant': 'restaurant',
      'attraction': 'attraction',
      'activity': 'activity',
      'shopping': 'shopping',
      'other': 'other'
    };
    
    return categoryMap[apiCategory] || 'activity';
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
    
    // Initialize vote counts for new activity
    setVoteCounts(prev => ({
      ...prev,
      [activity.id]: { yes: 0, no: 0, maybe: 0 }
    }));
    
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
    
    // Remove votes for deleted activity
    setUserVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[activityId];
      return newVotes;
    });
    
    setVoteCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[activityId];
      return newCounts;
    });
    
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

  const handleVote = (activityId: string, vote: 'yes' | 'no' | 'maybe') => {
    const previousVote = userVotes[activityId];
    
    // Update user vote
    setUserVotes(prev => ({
      ...prev,
      [activityId]: vote
    }));
    
    // Update vote counts
    setVoteCounts(prev => {
      const newCounts = { ...prev };
      if (!newCounts[activityId]) {
        newCounts[activityId] = { yes: 0, no: 0, maybe: 0 };
      }
      
      // Remove previous vote if exists
      if (previousVote) {
        newCounts[activityId][previousVote] = Math.max(0, newCounts[activityId][previousVote] - 1);
      }
      
      // Add new vote
      newCounts[activityId][vote] += 1;
      
      return newCounts;
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your itinerary...</p>
            </div>
          </div>
        ) : (
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
               userVotes={userVotes}
               voteCounts={voteCounts}
               onVote={handleVote}
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
        )}
        
        {/* Voting Summary */}
        {!isLoading && dayItineraries.length > 0 && (
          <VotingSummary
            dayItineraries={dayItineraries}
            voteCounts={voteCounts}
            userVotes={userVotes}
          />
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