import React, { useState } from 'react';
import { useEffect } from 'react';
import { Header } from './components/Header';
import { TripPlanner } from './components/TripPlanner';
import { ItineraryView } from './components/ItineraryView';
import { InspireMeModal } from './components/InspireMeModal';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { FavoritesModal } from './components/FavoritesModal';
import { LoadingModal } from './components/LoadingModal';
import { AIInsightsModal } from './components/AIInsightsModal';
import { destinations } from './data/destinations';
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

type AppState = 'planning' | 'itinerary';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('planning');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentTripType, setCurrentTripType] = useState<string>('');
  const [showInspireMe, setShowInspireMe] = useState(false);
  const [inspirationDestination, setInspirationDestination] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isGeneratingTrip, setIsGeneratingTrip] = useState(false);
  const [aiInsights, setAiInsights] = useState<AITripInsights | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

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
    setIsGeneratingTrip(true);
    
    try {
      // Generate AI trip plan
      const aiTripPlan = await generateTripPlan({
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        tripType: tripData.tripType,
        collaborators: tripData.collaborators || []
      });

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

      // Convert AI plan to itinerary format
      const { trip, dayItineraries, aiInsights: insights } = convertAITripPlanToItinerary(aiTripPlan, newTrip);
      
      setCurrentTrip(trip);
      setCurrentTripType(tripData.tripType || '');
      setAiInsights(insights);
      setIsGeneratingTrip(false);
      
      // Show AI insights modal first
      setShowAIInsights(true);
      
    } catch (error) {
      console.error('Error generating trip plan:', error);
      setIsGeneratingTrip(false);
      
      // Fallback to basic trip creation
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
      
      alert('Unable to generate AI suggestions. Using basic itinerary template.');
    }
  };

  const handleAIInsightsClose = () => {
    setShowAIInsights(false);
    setCurrentState('itinerary');
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
  };

  const handleToggleFavorite = (destinationId: string) => {
    setFavorites(prev => {
      if (prev.includes(destinationId)) {
        return prev.filter(id => id !== destinationId);
      } else {
        return [...prev, destinationId];
      }
    });
  };

  const handleRemoveFavorite = (destinationId: string) => {
    setFavorites(prev => prev.filter(id => id !== destinationId));
  };

  const handleFavoritesClick = () => {
    setShowFavorites(true);
  };

  const handlePlanTripFromFavorites = (destination: string) => {
    setInspirationDestination(destination);
    setCurrentState('planning');
  };

  const getFavoriteDestinations = () => {
    return destinations.filter(dest => favorites.includes(dest.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        user={user}
        onLogout={handleLogout}
        onHomeClick={handleHomeClick}
        onFavoritesClick={handleFavoritesClick}
        favoritesCount={favorites.length}
      />
      
      {currentState === 'planning' ? (
        <TripPlanner 
          onTripCreate={handleTripCreate} 
          onInspireMe={handleInspireMe}
          inspirationDestination={inspirationDestination}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
      ) : currentTrip ? (
        <ItineraryView 
          trip={currentTrip} 
          tripType={currentTripType}
          onBack={handleBackToPlanning}
        />
      ) : null}

      {showInspireMe && (
        <InspireMeModal
          onClose={() => setShowInspireMe(false)}
          onSelectDestination={handleSelectInspiration}
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

      {showFavorites && (
        <FavoritesModal
          favorites={getFavoriteDestinations()}
          onClose={() => setShowFavorites(false)}
          onRemoveFavorite={handleRemoveFavorite}
          onPlanTrip={handlePlanTripFromFavorites}
        />
      )}

      {/* Loading Modal */}
      <LoadingModal 
        destination={currentTrip?.destination || ''} 
        isVisible={isGeneratingTrip} 
      />

      {/* AI Insights Modal */}
      {showAIInsights && aiInsights && (
        <AIInsightsModal
          insights={aiInsights}
          destination={currentTrip?.destination || ''}
          onClose={handleAIInsightsClose}
        />
      )}
    </div>
  );
}

export default App;