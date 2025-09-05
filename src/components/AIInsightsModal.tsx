import React from 'react';
import { X, DollarSign, Cloud, Globe, MessageCircle, Backpack, AlertTriangle, Phone, MapPin } from 'lucide-react';
import { AITripInsights } from '../utils/aiTripConverter';

interface AIInsightsModalProps {
  insights: AITripInsights;
  destination: string;
  onClose: () => void;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ insights, destination, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Travel Insights</h2>
            <p className="text-gray-600 mt-1">Essential information for your {destination} trip</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Budget Overview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Budget Estimate</h3>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${insights.totalBudgetEstimate.toLocaleString()}
            </div>
            <p className="text-gray-600">Total estimated cost for your entire trip</p>
          </div>

          {/* Weather & Best Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Cloud className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Weather Info</h3>
              </div>
              <p className="text-gray-700 mb-4">{insights.weatherInfo}</p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm font-medium text-blue-600">Best Time to Visit</p>
                <p className="text-gray-700">{insights.bestTimeToVisit}</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Local Info</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-600">Currency</p>
                  <p className="text-gray-700">{insights.localCurrency}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-600">Language</p>
                  <p className="text-gray-700">{insights.languageInfo}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Tips */}
          <div className="bg-orange-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cultural Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.culturalTips.map((tip, index) => (
                <div key={index} className="bg-white rounded-lg p-4 flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Packing Recommendations */}
          <div className="bg-indigo-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Backpack className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Packing Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {insights.packingRecommendations.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  <p className="text-gray-700 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Information */}
          <div className="bg-red-50 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Emergency Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-600">Emergency Number</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{insights.emergencyInfo.emergencyNumber}</p>
              </div>
              
              {insights.emergencyInfo.nearestEmbassy && (
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-600">Embassy</p>
                  </div>
                  <p className="text-gray-700">{insights.emergencyInfo.nearestEmbassy}</p>
                </div>
              )}
            </div>
            
            {insights.emergencyInfo.importantAddresses.length > 0 && (
              <div className="mt-4">
                <p className="font-medium text-gray-900 mb-2">Important Addresses:</p>
                <div className="space-y-2">
                  {insights.emergencyInfo.importantAddresses.map((address, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">{address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              Got it, let's start planning!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};