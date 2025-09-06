import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
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
  Users,
  Share2
} from 'lucide-react';
import { supabase, signIn, signInWithGoogle, signOut, onAuthStateChange } from '../lib/supabase';
import { LoginModal } from '../components/LoginModal';
import { SignupModal } from '../components/SignupModal';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

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

interface TripData {
  trip: Trip;
  votes: { [activityId: string]: VoteCounts };
}

const TripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [voterId, setVoterId] = useState<string>('');
  const [votingStates, setVotingStates] = useState<{ [activityId: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [userVotes, setUserVotes] = useState<{ [activityId: string]: 'yes' | 'no' | 'maybe' }>({});
  const [showVotingResults, setShowVotingResults] = useState(false);

  // Generate or get voter ID from localStorage
  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          return;
        }
        
        if (session?.user) {
          setUserFromSession(session);
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserFromSession(session);
        setShowLogin(false);
        setShowSignup(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserVotes({});
      }
    });

    // Generate anonymous voter ID for non-authenticated users
    let storedVoterId = localStorage.getItem('anonymousVoterId');
    if (!storedVoterId) {
      storedVoterId = `anon_${crypto.randomUUID()}`;
      localStorage.setItem('anonymousVoterId', storedVoterId);
    }
    setVoterId(storedVoterId);

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to set user from session
  const setUserFromSession = (session: any) => {
    const user = session.user;
    const metadata = user.user_metadata || {};
    
    let firstName = metadata.first_name || metadata.given_name || '';
    let lastName = metadata.last_name || metadata.family_name || '';
    
    if (!firstName && !lastName && metadata.full_name) {
      const nameParts = metadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    if (!firstName && metadata.name) {
      const nameParts = metadata.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
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
    
    setUser(userData);
    setVoterId(user.id); // Use authenticated user ID as voter ID
  };

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
      
      // Load user's existing votes if authenticated
      if (user) {
        loadUserVotes(data.votes);
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  // Load user's existing votes
  const loadUserVotes = (allVotes: { [activityId: string]: VoteCounts }) => {
    // In a real implementation, you'd fetch user-specific votes from the database
    // For now, we'll use localStorage to track user votes
    const storedVotes = localStorage.getItem(`userVotes_${user?.id || voterId}`);
    if (storedVotes) {
      try {
        setUserVotes(JSON.parse(storedVotes));
      } catch (err) {
        console.error('Error parsing stored votes:', err);
      }
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

  // Vote on activity
  const handleVote = async (activityId: string, choice: 'yes' | 'no' | 'maybe') => {
    if (!id || votingStates[activityId]) return;

    // Use authenticated user ID or anonymous voter ID
    const currentVoterId = user?.id || voterId;
    if (!currentVoterId) return;

    setVotingStates(prev => ({ ...prev, [activityId]: true }));

    try {
      const response = await fetch(`/api/trip/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          choice,
          voterId: currentVoterId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      // Update local user votes
      const previousVote = userVotes[activityId];
      let newUserVotes = { ...userVotes };
      
      if (previousVote === choice) {
        // Remove vote if clicking same choice
        delete newUserVotes[activityId];
      } else {
        // Set new vote
        newUserVotes[activityId] = choice;
      }
      
      setUserVotes(newUserVotes);
      
      // Store votes locally
      localStorage.setItem(`userVotes_${currentVoterId}`, JSON.stringify(newUserVotes));

      // Refresh trip data to get updated votes
      await fetchTripData();
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setVotingStates(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    signOut().then(() => setUser(null));
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

  const { trip, votes } = tripData;
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
      {/* Header */}
      <Header 
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        user={user}
        onLogout={handleLogout}
        onHomeClick={() => window.location.href = '/'}
      />
      
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
                <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Users className="h-4 w-4" />
                  <span>Collaborative Trip</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowVotingResults(!showVotingResults)}
                className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{showVotingResults ? 'Hide Votes' : 'See Votes'}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span>{copiedLink ? 'Copied!' : 'Share Trip'}</span>
              </button>
            </div>
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
                  const activityVotes = votes[activity.id] || { yes: 0, no: 0, maybe: 0 };
                  const isVoting = votingStates[activity.id];

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
                      </div>

                      {/* Tags */}
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-4">
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

                      {/* Voting Buttons */}
                      <div className="flex items-center space-x-3 mb-3">
                        {!user && (
                          <div className="text-sm text-gray-600 mb-2">
                            <button
                              onClick={() => setShowLogin(true)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Login
                            </button>
                            {' or '}
                            <button
                              onClick={() => setShowSignup(true)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              sign up
                            </button>
                            {' to vote on activities'}
                          </div>
                        )}
                        <button
                          onClick={() => handleVote(activity.id, 'yes')}
                          disabled={isVoting || !user}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                            userVotes[activity.id] === 'yes'
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => handleVote(activity.id, 'no')}
                          disabled={isVoting || !user}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                            userVotes[activity.id] === 'no'
                              ? 'bg-red-500 text-white shadow-md'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>No</span>
                        </button>
                        <button
                          onClick={() => handleVote(activity.id, 'maybe')}
                          disabled={isVoting || !user}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                            userVotes[activity.id] === 'maybe'
                              ? 'bg-yellow-500 text-white shadow-md'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          <Meh className="h-4 w-4" />
                          <span>Maybe</span>
                        </button>
                      </div>

                      {/* Vote Counts */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <span>👍</span>
                          <span>{activityVotes.yes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>👎</span>
                          <span>{activityVotes.no}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>🤷</span>
                          <span>{activityVotes.maybe}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Voting Results Section */}
        {showVotingResults && Object.keys(tripData.votes).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Group Voting Results</h2>
            
            <div className="space-y-4">
              {trip.itinerary.map((day, dayIndex) => {
                const dayActivitiesWithVotes = day.activities.filter(activity => 
                  tripData.votes[activity.id] && 
                  (tripData.votes[activity.id].yes + tripData.votes[activity.id].no + tripData.votes[activity.id].maybe) > 0
                );
                
                if (dayActivitiesWithVotes.length === 0) return null;
                
                return (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Day {day.day}
                    </h3>
                    <div className="space-y-3">
                      {dayActivitiesWithVotes
                        .sort((a, b) => {
                          const aVotes = tripData.votes[a.id];
                          const bVotes = tripData.votes[b.id];
                          const aScore = aVotes.yes * 2 + aVotes.maybe * 1 - aVotes.no * 1;
                          const bScore = bVotes.yes * 2 + bVotes.maybe * 1 - bVotes.no * 1;
                          return bScore - aScore;
                        })
                        .map(activity => {
                          const votes = tripData.votes[activity.id];
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
          </div>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onSignupSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default TripPage;