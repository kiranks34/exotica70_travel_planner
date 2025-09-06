import React, { useState } from 'react';
import { ActivityCard } from './ActivityCard';
import { DayItinerary, Activity } from '../types';
import { generateActivitySuggestions } from '../utils/activitySuggestions';
import { Plus, FileText, Calendar } from 'lucide-react';

interface DayPlannerProps {
  day: DayItinerary;
  destination: string;
  tripType: string;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  onUpdateNotes: (dayId: string, notes: string) => void;
  onUpdateDay: (updatedDay: DayItinerary) => void;
  onVote?: (activityId: string, choice: 'yes' | 'no' | 'maybe') => void;
  voteCounts?: { [activityId: string]: { yes: number; no: number; maybe: number } };
  userVotes?: { [activityId: string]: 'yes' | 'no' | 'maybe' };
  isLoggedIn?: boolean;
}

export const DayPlanner: React.FC<DayPlannerProps> = ({
  day,
  destination,
  tripType,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onUpdateNotes,
  onUpdateDay,
  onVote,
  voteCounts = {},
  userVotes = {},
  isLoggedIn = false
}) => {
  const [notes, setNotes] = useState(day.notes);
  const [showNotes, setShowNotes] = useState(false);
  const [activityHistory, setActivityHistory] = useState<{[activityId: string]: Activity[]}>({});

  const handleNotesBlur = () => {
    onUpdateNotes(day.id, notes);
  };

  const dayDate = new Date(day.date);
  const sortedActivities = [...day.activities].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  const handleAISuggest = (activityToReplace: Activity) => {
    // Store current activity in history
    setActivityHistory(prev => ({
      ...prev,
      [activityToReplace.id]: [
        ...(prev[activityToReplace.id] || []),
        { ...activityToReplace }
      ]
    }));

    // Generate new suggestion for this specific activity
    const tempDay = { ...day, activities: [activityToReplace] };
    const suggestedDays = generateActivitySuggestions(destination, tripType, [tempDay]);
    
    if (suggestedDays[0] && suggestedDays[0].activities.length > 0) {
      const newSuggestion = suggestedDays[0].activities[0];
      
      // Keep the same ID and time slot but update other properties
      const updatedActivity: Activity = {
        ...newSuggestion,
        id: activityToReplace.id,
        startTime: activityToReplace.startTime,
        endTime: activityToReplace.endTime
      };

      // Update the day with the new suggestion
      const updatedActivities = day.activities.map(activity =>
        activity.id === activityToReplace.id ? updatedActivity : activity
      );

      const updatedDay = { ...day, activities: updatedActivities };
      onUpdateDay(updatedDay);
    }
  };

  const handleUndo = (activityId: string) => {
    const history = activityHistory[activityId];
    if (history && history.length > 0) {
      const previousActivity = history[history.length - 1];
      
      // Update the day with the previous activity
      const updatedActivities = day.activities.map(activity =>
        activity.id === activityId ? previousActivity : activity
      );

      const updatedDay = { ...day, activities: updatedActivities };
      onUpdateDay(updatedDay);

      // Remove the last item from history
      setActivityHistory(prev => ({
        ...prev,
        [activityId]: history.slice(0, -1)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {dayDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <p className="text-gray-600">
                {sortedActivities.length} {sortedActivities.length === 1 ? 'activity' : 'activities'} planned
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showNotes 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Notes</span>
            </button>
            
            <button
              onClick={onAddActivity}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Add Activity</span>
            </button>
          </div>
        </div>

        {/* Notes Section */}
        {showNotes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes for this day..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all resize-none"
              rows={4}
            />
          </div>
        )}
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              activityNumber={index + 1}
              destination={destination}
              onEdit={() => onEditActivity(activity)}
              onDelete={() => onDeleteActivity(day.id, activity.id)}
              onAISuggest={() => handleAISuggest(activity)}
              onUndo={() => handleUndo(activity.id)}
              hasUndo={activityHistory[activity.id]?.length > 0}
              onVote={onVote}
              voteCounts={voteCounts[activity.id]}
              userVote={userVotes[activity.id]}
              isLoggedIn={isLoggedIn}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-6 rounded-xl mb-6">
              <Calendar className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI-Powered Suggestions Ready!
              </h3>
              <p className="text-gray-600 mb-4">
                We've created a personalized itinerary based on your destination and preferences. 
                Each activity is carefully selected and can be easily modified to match your style.
              </p>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to explore your day?
            </h3>
            <p className="text-gray-600 mb-6">
              Click on a day from the sidebar to see your personalized suggestions, or add your own activities
            </p>
            <button
              onClick={onAddActivity}
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              <span>Add Custom Activity</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};