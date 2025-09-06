import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Plane } from 'lucide-react';

interface LoadingModalProps {
  destination: string;
  isVisible: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ destination, isVisible }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Analyzing your preferences...',
    'Finding the best attractions...',
    'Curating local experiences...',
    'Optimizing your itinerary...'
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Don't complete until trip is actually done
        return prev + Math.random() * 15; // Random increment for realistic feel
      });
    }, 500);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Animated Icons */}
        <div className="relative mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="animate-bounce delay-0">
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>
            <div className="animate-bounce delay-150">
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            <div className="animate-bounce delay-300">
              <Plane className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          {/* Central Sparkles Icon */}
          <div className="flex justify-center">
            <div className="animate-spin">
              <Sparkles className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Creating Your Perfect Trip
        </h2>
        
        <div className="space-y-3 text-gray-600">
          <p className="text-lg font-medium text-orange-600 text-left">
            Destination: {destination}
          </p>
          
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${currentStep >= 0 ? 'bg-orange-500' : 'bg-gray-300'} ${currentStep === 0 ? 'animate-pulse' : ''}`}></div>
              <span className={currentStep === 0 ? 'font-medium' : ''}>Analyzing your preferences...</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'} ${currentStep === 1 ? 'animate-pulse' : ''}`}></div>
              <span className={currentStep === 1 ? 'font-medium' : ''}>Finding the best attractions...</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'} ${currentStep === 2 ? 'animate-pulse' : ''}`}></div>
              <span className={currentStep === 2 ? 'font-medium' : ''}>Curating local experiences...</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${currentStep >= 3 ? 'bg-purple-500' : 'bg-gray-300'} ${currentStep === 3 ? 'animate-pulse' : ''}`}></div>
              <span className={currentStep === 3 ? 'font-medium' : ''}>Optimizing your itinerary...</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${Math.min(progress, 95)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">This may take a few moments...</p>
            <p className="text-xs text-gray-600 font-medium">{Math.round(Math.min(progress, 95))}%</p>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-700 text-left">
            <span className="font-semibold">💡 Did you know?</span> Our AI considers over 50 factors including local weather, cultural events, and traveler preferences to create your personalized itinerary!
          </p>
        </div>
      </div>
    </div>
  );
};