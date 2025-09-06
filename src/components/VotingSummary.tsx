import React from 'react';
import { DayItinerary } from '../types';
import { BarChart3, TrendingUp, Users, Award, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

interface VoteCounts {
  yes: number;
  no: number;
  maybe: number;
}

interface VotingSummaryProps {
  dayItineraries: DayItinerary[];
  voteCounts: {[activityId: string]: VoteCounts};
  userVotes: {[activityId: string]: 'yes' | 'no' | 'maybe'};
}

export const VotingSummary: React.FC<VotingSummaryProps> = ({
  dayItineraries,
  voteCounts,
  userVotes
}) => {
  // Calculate overall statistics
  const getAllActivities = () => {
    return dayItineraries.flatMap(day => day.activities);
  };

  const getTotalVotes = () => {
    return Object.values(voteCounts).reduce((total, counts) => 
      total + counts.yes + counts.no + counts.maybe, 0
    );
  };

  const getTopVotedActivities = () => {
    const activities = getAllActivities();
    return activities
      .map(activity => ({
        ...activity,
        votes: voteCounts[activity.id] || { yes: 0, no: 0, maybe: 0 },
        totalVotes: (voteCounts[activity.id]?.yes || 0) + 
                   (voteCounts[activity.id]?.no || 0) + 
                   (voteCounts[activity.id]?.maybe || 0),
        yesPercentage: voteCounts[activity.id] ? 
          Math.round((voteCounts[activity.id].yes / 
            ((voteCounts[activity.id].yes + voteCounts[activity.id].no + voteCounts[activity.id].maybe) || 1)) * 100) : 0
      }))
      .filter(activity => activity.totalVotes > 0)
      .sort((a, b) => {
        // Sort by yes percentage first, then by total votes
        if (b.yesPercentage !== a.yesPercentage) {
          return b.yesPercentage - a.yesPercentage;
        }
        return b.totalVotes - a.totalVotes;
      })
      .slice(0, 5);
  };

  const getMostControversialActivities = () => {
    const activities = getAllActivities();
    return activities
      .map(activity => ({
        ...activity,
        votes: voteCounts[activity.id] || { yes: 0, no: 0, maybe: 0 },
        totalVotes: (voteCounts[activity.id]?.yes || 0) + 
                   (voteCounts[activity.id]?.no || 0) + 
                   (voteCounts[activity.id]?.maybe || 0),
        controversy: voteCounts[activity.id] ? 
          Math.min(voteCounts[activity.id].yes, voteCounts[activity.id].no) : 0
      }))
      .filter(activity => activity.totalVotes > 0 && activity.controversy > 0)
      .sort((a, b) => b.controversy - a.controversy)
      .slice(0, 3);
  };

  const getVoteDistribution = () => {
    const total = getTotalVotes();
    if (total === 0) return { yes: 0, no: 0, maybe: 0 };
    
    const totalYes = Object.values(voteCounts).reduce((sum, counts) => sum + counts.yes, 0);
    const totalNo = Object.values(voteCounts).reduce((sum, counts) => sum + counts.no, 0);
    const totalMaybe = Object.values(voteCounts).reduce((sum, counts) => sum + counts.maybe, 0);
    
    return {
      yes: Math.round((totalYes / total) * 100),
      no: Math.round((totalNo / total) * 100),
      maybe: Math.round((totalMaybe / total) * 100)
    };
  };

  const topVoted = getTopVotedActivities();
  const controversial = getMostControversialActivities();
  const distribution = getVoteDistribution();
  const totalVotes = getTotalVotes();
  const totalActivities = getAllActivities().length;
  const votedActivities = Object.values(voteCounts).filter(counts => 
    counts.yes + counts.no + counts.maybe > 0
  ).length;

  if (totalVotes === 0) {
    return (
      <div className="mt-12 bg-white rounded-xl shadow-sm p-8 text-center">
        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Votes Yet</h3>
        <p className="text-gray-600">
          Start voting on activities to see the voting summary and popular choices!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voting Summary</h2>
        <p className="text-gray-600">See what everyone thinks about the planned activities</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalVotes}</div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <ThumbsUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{distribution.yes}%</div>
          <div className="text-sm text-gray-600">Yes Votes</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Meh className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{distribution.maybe}%</div>
          <div className="text-sm text-gray-600">Maybe Votes</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <ThumbsDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{distribution.no}%</div>
          <div className="text-sm text-gray-600">No Votes</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Voted Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 rounded-full p-2">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Most Popular Activities</h3>
          </div>

          {topVoted.length > 0 ? (
            <div className="space-y-4">
              {topVoted.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 font-medium">{activity.votes.yes}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Meh className="h-3 w-3 text-yellow-600" />
                        <span className="text-yellow-600">{activity.votes.maybe}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        <span className="text-red-600">{activity.votes.no}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold text-green-600">{activity.yesPercentage}%</div>
                    <div className="text-xs text-gray-500">{activity.totalVotes} votes</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activities have been voted on yet</p>
            </div>
          )}
        </div>

        {/* Most Controversial */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-100 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Most Debated Activities</h3>
          </div>

          {controversial.length > 0 ? (
            <div className="space-y-4">
              {controversial.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold text-sm text-white">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <ThumbsUp className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 font-medium">{activity.votes.yes}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <ThumbsDown className="h-3 w-3 text-red-600" />
                        <span className="text-red-600 font-medium">{activity.votes.no}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Meh className="h-3 w-3 text-yellow-600" />
                        <span className="text-yellow-600">{activity.votes.maybe}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-medium text-orange-600">Mixed</div>
                    <div className="text-xs text-gray-500">{activity.totalVotes} votes</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No controversial activities yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Participation Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Participation Overview</h3>
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{votedActivities}</div>
              <div className="text-sm text-gray-600">Activities Voted On</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalActivities}</div>
              <div className="text-sm text-gray-600">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalActivities > 0 ? Math.round((votedActivities / totalActivities) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Participation Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};