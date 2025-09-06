import { Trip, DayItinerary } from '../types';

export const generateDayItineraries = (trip: Trip): DayItinerary[] => {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const dayItineraries: DayItinerary[] = [];

  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dayItineraries.push({
      id: crypto.randomUUID(),
      tripId: trip.id,
      date: currentDate.toISOString().split('T')[0],
      activities: [],
      notes: '',
      budget: 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dayItineraries;
};

export const calculateTripDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  
  if (start.getMonth() === end.getMonth()) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  }
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
}