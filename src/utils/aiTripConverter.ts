import { AITripPlan, AIDayPlan, AIActivitySuggestion } from '../lib/openai';
import { Trip, DayItinerary, Activity, ActivityCategory } from '../types';

export const convertAITripPlanToItinerary = (
  aiTripPlan: AITripPlan,
  originalTrip: Trip
): { trip: Trip; dayItineraries: DayItinerary[]; aiInsights: AITripInsights } => {
  // Convert AI day plans to day itineraries
  const dayItineraries: DayItinerary[] = aiTripPlan.dayPlans.map((dayPlan: AIDayPlan) => ({
    id: crypto.randomUUID(),
    tripId: originalTrip.id,
    date: dayPlan.date,
    activities: dayPlan.activities.map((aiActivity: AIActivitySuggestion) => convertAIActivityToActivity(aiActivity)),
    notes: `${dayPlan.theme}\n\nLocal Tips:\n${dayPlan.localTips.map(tip => `• ${tip}`).join('\n')}`,
    budget: dayPlan.budgetEstimate
  }));

  // Extract AI insights for display
  const aiInsights: AITripInsights = {
    totalBudgetEstimate: aiTripPlan.totalBudgetEstimate,
    bestTimeToVisit: aiTripPlan.bestTimeToVisit,
    weatherInfo: aiTripPlan.weatherInfo,
    localCurrency: aiTripPlan.localCurrency,
    languageInfo: typeof aiTripPlan.languageInfo === 'object' 
      ? JSON.stringify(aiTripPlan.languageInfo) 
      : String(aiTripPlan.languageInfo || ''),
    culturalTips: aiTripPlan.culturalTips,
    packingRecommendations: aiTripPlan.packingRecommendations,
    emergencyInfo: aiTripPlan.emergencyInfo
  };

  return {
    trip: originalTrip,
    dayItineraries,
    aiInsights
  };
};

const convertAIActivityToActivity = (aiActivity: AIActivitySuggestion): Activity => {
  return {
    id: crypto.randomUUID(),
    title: aiActivity.title,
    description: aiActivity.description,
    location: aiActivity.location,
    startTime: aiActivity.startTime,
    endTime: aiActivity.endTime,
    category: aiActivity.category as ActivityCategory,
    notes: `AI curated activity\n\nTips:\n${aiActivity.tips.map(tip => `• ${tip}`).join('\n')}${aiActivity.bookingRequired ? '\n\n⚠️ Booking required in advance' : ''}`,
    cost: aiActivity.estimatedCost,
    bookedStatus: 'not-booked' as const
  };
};

export interface AITripInsights {
  totalBudgetEstimate: number;
  bestTimeToVisit: string;
  weatherInfo: string;
  localCurrency: string;
  languageInfo: string;
  culturalTips: string[];
  packingRecommendations: string[];
  emergencyInfo: {
    emergencyNumber: string;
    nearestEmbassy?: string;
    importantAddresses: string[];
  };
}