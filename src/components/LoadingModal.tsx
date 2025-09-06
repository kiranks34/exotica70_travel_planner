import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Plane, Brain, Clock, CheckCircle } from 'lucide-react';

interface LoadingModalProps {
  destination: string;
  isVisible: boolean;
  tripType?: string;
  onComplete?: () => void;
}

interface AIStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ 
  destination, 
  isVisible, 
  tripType = 'adventure',
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<AIStep[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Generate AI steps based on trip type and destination
  const generateAISteps = (destination: string, tripType: string): AIStep[] => {
    const baseSteps = [
      {
        id: 'analyze',
        title: 'Analyzing Your Preferences',
        description: `Understanding your ${tripType} travel style and preferences`,
        duration: 2000,
        completed: false
      },
      {
        id: 'research',
        title: `Researching ${destination}`,
        description: `Gathering local insights and hidden gems in ${destination}`,
        duration: 2500,
        completed: false
      },
      {
        id: 'activities',
        title: 'Curating Perfect Activities',
        description: `Finding the best ${tripType} experiences and attractions`,
        duration: 3000,
        completed: false
      },
      {
        id: 'optimize',
        title: 'Optimizing Your Itinerary',
        description: 'Creating the perfect daily schedule and route planning',
        duration: 2000,
        completed: false
      },
      {
        id: 'insights',
        title: 'Adding Local Insights',
        description: 'Including cultural tips, weather info, and travel recommendations',
        duration: 1500,
        completed: false
      }
    ];

    // Add trip-type specific steps
    if (tripType === 'food' || tripType === 'culture') {
      baseSteps.splice(3, 0, {
        id: 'local',
        title: 'Finding Local Experiences',
        description: `Discovering authentic ${tripType === 'food' ? 'culinary' : 'cultural'} experiences`,
        duration: 2000,
        completed: false
      });
    }

    if (tripType === 'adventure') {
      baseSteps.splice(2, 0, {
        id: 'adventure',
        title: 'Scouting Adventure Activities',
        description: 'Finding thrilling outdoor activities and adventure sports',
        duration: 2500,
        completed: false
      });
    }

    return baseSteps;
  };

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStepIndex(0);
      setSteps([]);
      setIsCompleting(false);
      return;
    }

    // Initialize steps
    const aiSteps = generateAISteps(destination, tripType);
    setSteps(aiSteps);

    let stepIndex = 0;
    const totalSteps = aiSteps.length;

    const processSteps = () => {
      if (stepIndex >= totalSteps) {
        // All steps completed, start completion phase
        setIsCompleting(true);
        setProgress(100);
        
        setTimeout(() => {
          onComplete?.();
        }, 1500);
        return;
      }

      const currentStep = aiSteps[stepIndex];
      setCurrentStepIndex(stepIndex);

      // Animate progress for current step
      const stepProgressIncrement = (90 / totalSteps) / (currentStep.duration / 100);
      let stepProgress = 0;

      const progressInterval = setInterval(() => {
        stepProgress += stepProgressIncrement;
        const newTotalProgress = (stepIndex * (90 / totalSteps)) + (stepProgress * (90 / totalSteps) / 100);
        
        if (newTotalProgress >= (stepIndex + 1) * (90 / totalSteps)) {
          clearInterval(progressInterval);
          
          // Mark step as completed
          setSteps(prev => prev.map((step, index) => 
            index === stepIndex ? { ...step, completed: true } : step
          ));
          
          setProgress((stepIndex + 1) * (90 / totalSteps));
          stepIndex++;
          
          // Move to next step after a brief pause
          setTimeout(processSteps, 300);
        } else {
          setProgress(Math.min(newTotalProgress, 89));
        }
      }, 100);
    };

    // Start processing steps after a brief delay
    const startTimeout = setTimeout(processSteps, 500);

    return () => {
      clearTimeout(startTimeout);
    };
  }, [isVisible, destination, tripType, onComplete]);

  if (!isVisible) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
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
            
            {/* Central AI Icon */}
            <div className="flex justify-center">
              <div className="animate-spin">
                <Brain className="h-12 w-12 text-purple-500" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI is Crafting Your Perfect Trip
          </h2>
          <p className="text-orange-600 font-medium text-lg">
            {destination}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-orange-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Current Activity */}
        {currentStep && !isCompleting && (
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="animate-spin">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStep.title}
              </h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        )}

        {/* Completion State */}
        {isCompleting && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Almost Ready!
              </h3>
            </div>
            <p className="text-gray-700 text-sm">
              Finalizing your personalized itinerary and preparing insights...
            </p>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                index === currentStepIndex && !step.completed
                  ? 'bg-orange-100 border-2 border-orange-200' 
                  : step.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.completed
                  ? 'bg-green-500'
                  : index === currentStepIndex
                    ? 'bg-orange-500 animate-pulse'
                    : 'bg-gray-300'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : index === currentStepIndex ? (
                  <Clock className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  step.completed ? 'text-green-700' : 
                  index === currentStepIndex ? 'text-orange-700' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Fun Fact */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Did you know?</span> Our AI considers over 50 factors including local weather, cultural events, and your travel preferences to create the perfect personalized itinerary!
          </p>
        </div>
      </div>
    </div>
  );
};