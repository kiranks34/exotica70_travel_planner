import React, { useState } from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { TripPlanner } from './components/TripPlanner';
import { ItineraryView } from './components/ItineraryView';
import { InspireMeModal } from './components/InspireMeModal';
import { PersonalizedSuggestionsPage } from './components/PersonalizedSuggestionsPage';
import { TravelPreferences } from './components/InspireMeModal';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { LoadingModal } from './components/LoadingModal';
import { AIInsightsPage } from './components/AIInsightsPage';
import TripPage from './pages/TripPage';
import { DestinationDetailsPage } from './components/DestinationDetailsPage';
import { ItinerarySummaryPage } from './components/ItinerarySummaryPage';
import { Trip } from './types';
import { generateTripPlan } from './lib/openai';
import { convertAITripPlanToItinerary, AITripInsights } from './utils/aiTripConverter';
import { supabase, signOut, onAuthStateChange } from './lib/supabase';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

type AppState = 'planning' | 'ai-insights' | 'itinerary' | 'destination-details' | 'personalized-suggestions';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('planning');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentTripType, setCurrentTripType] = useState<string>('');
  const [showInspireMe, setShowInspireMe] = useState(false);
  const [inspirationDestination, setInspirationDestination] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [aiInsights, setAiInsights] = useState<AITripInsights | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    country: string;
    image: string;
    rating: number;
    isFavorite: boolean;
  } | null>(null);
  const [savedPreferences, setSavedPreferences] = useState<TravelPreferences | null>(null);

  // Listen for auth changes
  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session:', session.user.email);
          setUserFromSession(session);
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      console.log('Full session data:', session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in successfully');
        setUserFromSession(session);
        setShowLogin(false);
        setShowSignup(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setCurrentState('planning');
        setCurrentTrip(null);
        setCurrentTripType('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to set user from session
  const setUserFromSession = (session: any) => {
    const user = session.user;
    const metadata = user.user_metadata || {};
    
    console.log('Session user metadata:', metadata);
    
    // Handle Google OAuth user data
    let firstName = metadata.first_name || metadata.given_name || '';
    let lastName = metadata.last_name || metadata.family_name || '';
    
    // Fallback to full_name if individual names not available
    if (!firstName && !lastName && metadata.full_name) {
      const nameParts = metadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Additional fallback for Google users
    if (!firstName && metadata.name) {
      const nameParts = metadata.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Final fallback
    if (!firstName) {
      firstName = user.email?.split('@')[0] || 'User';
    }
    
    const userData = {
      id: user.id,
      firstName,
      lastName,
      email: user.email || '',
      avatar: metadata.avatar_url || metadata.picture
    };
    
    console.log('Setting user data:', userData);
    setUser(userData);
  };
  const handleTripCreate = async (tripData: any) => {
    console.log('🎯 App.tsx handleTripCreate called with:', tripData);
    
    try {
      if (!tripData.destination || !tripData.startDate || !tripData.endDate) {
        throw new Error('Missing required trip data');
      }
      
      // Create trip object
      const newTrip: Trip = {
        id: crypto.randomUUID(),
        title: `${tripData.destination} Trip`,
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        collaborators: tripData.collaborators || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('✅ Trip object created:', newTrip);
      
      setCurrentTrip(newTrip);
      setCurrentTripType(tripData.tripType || '');
      
      // If AI trip data is available, process it
      if (tripData.aiTripData) {
        try {
          console.log('🤖 Processing AI trip data...');
          const { convertAITripPlanToItinerary } = await import('./utils/aiTripConverter');
          const { aiInsights } = convertAITripPlanToItinerary(tripData.aiTripData, newTrip);
          setAiInsights(aiInsights);
          console.log('✅ AI insights generated successfully');
        } catch (error) {
          console.warn('Failed to process AI insights:', error);
        }
      } else {
        console.log('ℹ️ No AI trip data available, using fallback suggestions');
      }
      
      // Go directly to itinerary view
      console.log('🚀 Navigating to itinerary view...');
      setCurrentState('itinerary');
      
    } catch (error) {
      console.error('❌ Error in handleTripCreate:', error);
      
      // Fallback to basic trip creation on error
      console.log('🔄 Falling back to basic trip creation...');
      try {
        handleTripCreateBasic(tripData);
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        // Reset to planning state
        setCurrentState('planning');
        setCurrentTrip(null);
        setCurrentTripType('');
      }
    }
  };

  const handleAIInsightsStartPlanning = () => {
    setCurrentState('itinerary');
  };

  const handleAIInsightsBack = () => {
    setCurrentState('planning');
    setCurrentTrip(null);
    setCurrentTripType('');
    setAiInsights(null);
  };

  const handleTripCreateBasic = (tripData: any) => {
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      title: `${tripData.destination} Trip`,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      collaborators: tripData.collaborators || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentTrip(newTrip);
    setCurrentTripType(tripData.tripType || '');
    setCurrentState('itinerary');
  };

  const handleBackToPlanning = () => {
    setCurrentState('planning');
    setCurrentTrip(null);
    setCurrentTripType('');
  };

  const handleShare = () => {
    if (currentTrip) {
      // This would be handled by the ShareModal in ItineraryView
      console.log('Share trip:', currentTrip);
    }
  };

  const handleInspireMe = () => {
    setShowInspireMe(true);
  };

  const handleSelectInspiration = (destination: string) => {
    setShowInspireMe(false);
    // We'll pass this to TripPlanner via a prop
    setInspirationDestination(destination);
    setCurrentState('planning');
  };

  const handleShowPersonalizedSuggestions = (preferences: TravelPreferences) => {
    setSavedPreferences(preferences);
    setCurrentState('personalized-suggestions');
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    signOut().then(() => {
      setUser(null);
      // Reset to planning state when logging out
      setCurrentState('planning');
      setCurrentTrip(null);
      setCurrentTripType('');
    });
  };

  const handleHomeClick = () => {
    setCurrentState('planning');
    setCurrentTrip(null);
    setCurrentTripType('');
    setInspirationDestination('');
    setSelectedDestination(null);
  };

  const handleShowDestinationDetails = (name: string, country: string, image: string) => {
    // Find the destination data to get rating and favorite status
    const destinationCards = [
      {
        name: 'Santorini',
        country: 'Greece',
        image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.8
      },
      {
        name: 'Kyoto',
        country: 'Japan',
        image: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.9
      },
      {
        name: 'Banff',
        country: 'Canada',
        image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.7
      },
      {
        name: 'Marrakech',
        country: 'Morocco',
        image: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.6
      },
      {
        name: 'Reykjavik',
        country: 'Iceland',
        image: 'https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.5
      },
      {
        name: 'Bagan',
        country: 'Myanmar',
        image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
        rating: 4.8
      }
    ];
    
    const destinationData = destinationCards.find(dest => dest.name === name && dest.country === country);
    setSelectedDestination({ 
      name, 
      country, 
      image, 
      rating: destinationData?.rating || 4.5,
      isFavorite: false // You can track this in state if needed
    });
    setCurrentState('destination-details');
  };

  const handleStartPlanningFromDetails = (destination: string) => {
    setInspirationDestination(destination);
    setSelectedDestination(null);
    setCurrentState('planning');
  };

  const handleBackFromDestinationDetails = () => {
    setSelectedDestination(null);
    setCurrentState('planning');
  };

  const handleBackFromPersonalizedSuggestions = () => {
    setCurrentState('planning');
    setShowInspireMe(true);
  };

  const handlePersonalizedDestinationSelect = (destination: string) => {
    setInspirationDestination(destination);
    setCurrentState('planning');
  };

  const handlePersonalizedDestinationDetails = (name: string, country: string, image: string, rating: number) => {
    setSelectedDestination({ 
      name, 
      country, 
      image, 
      rating,
      isFavorite: false
    });
    setCurrentState('destination-details');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home route */}
          <Route path="/" element={
            <>
              <Header 
                onLoginClick={handleLoginClick}
                onSignupClick={handleSignupClick}
                user={user}
                onLogout={handleLogout}
                onHomeClick={handleHomeClick}
                favoriteCount={favoriteCount}
              />
              
              {currentState === 'planning' ? (
                <TripPlanner 
                  onTripCreate={handleTripCreate} 
                  onInspireMe={handleInspireMe}
                  inspirationDestination={inspirationDestination}
                  onFavoriteCountChange={setFavoriteCount}
                  onShowDestinationDetails={handleShowDestinationDetails}
                />
              ) : currentState === 'destination-details' && selectedDestination ? (
                <DestinationDetailsPage
                  destinationName={selectedDestination.name}
                  country={selectedDestination.country}
                  image={selectedDestination.image}
                  rating={selectedDestination.rating}
                  initialFavorite={selectedDestination.isFavorite}
                  onBack={handleBackFromDestinationDetails}
                  onStartPlanning={handleStartPlanningFromDetails}
                  onFavoriteToggle={(isFavorite) => {
                    if (selectedDestination) {
                      setSelectedDestination({ ...selectedDestination, isFavorite });
                    }
                  }}
                />
              ) : currentState === 'personalized-suggestions' && savedPreferences ? (
                <PersonalizedSuggestionsPage
                  preferences={savedPreferences}
                  onBack={handleBackFromPersonalizedSuggestions}
                  onSelectDestination={handlePersonalizedDestinationSelect}
                  onViewDestinationDetails={handlePersonalizedDestinationDetails}
                />
              ) : currentState === 'ai-insights' && aiInsights ? (
                <AIInsightsPage
                  insights={aiInsights}
                  destination={currentTrip?.destination || ''}
                  onBack={handleAIInsightsBack}
                  onStartPlanning={handleAIInsightsStartPlanning}
                />
              ) : currentTrip ? (
                <ItineraryView 
                  trip={currentTrip} 
                  tripType={currentTripType}
                  onBack={handleBackToPlanning}
                  user={user}
                  aiInsights={aiInsights}
                />
              ) : null}

              {showInspireMe && (
                <InspireMeModal
                  onClose={() => setShowInspireMe(false)}
                  onSelectDestination={handleSelectInspiration}
                  onShowPersonalizedSuggestions={handleShowPersonalizedSuggestions}
                />
              )}

              {showLogin && (
                <LoginModal
                  onClose={() => setShowLogin(false)}
                  onSwitchToSignup={handleSwitchToSignup}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}

              {showSignup && (
                <SignupModal
                  onClose={() => setShowSignup(false)}
                  onSwitchToLogin={handleSwitchToLogin}
                  onSignupSuccess={handleLoginSuccess}
                />
              )}

              {/* Loading Modal */}

            </>
          } />
          
          {/* Trip detail route */}
          <Route path="/trip/:id" element={<TripPage />} />
          
          {/* Itinerary summary route */}
          <Route path="/summary/:id" element={<ItinerarySummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;