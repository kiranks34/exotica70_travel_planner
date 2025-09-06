import React, { useState, useRef } from 'react';
import { Calendar, MapPin, Users, Plus, Sparkles, UserPlus, Lightbulb, X, ChevronDown } from 'lucide-react';
import { DestinationCard } from './DestinationCard';

interface TripPlannerProps {
  onTripCreate: (tripData: any) => void;
  onInspireMe: () => void;
  inspirationDestination?: string;
  onFavoriteCountChange?: (count: number) => void;
  onFavoriteCountChange?: (count: number) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ onTripCreate, onInspireMe, inspirationDestination, onFavoriteCountChange }) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [tripType, setTripType] = useState('');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(1000);
  const [budgetMinInput, setBudgetMinInput] = useState('0');
  const [budgetMaxInput, setBudgetMaxInput] = useState('1000');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [favoriteCards, setFavoriteCards] = useState<Set<string>>(new Set());
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Destination cards data
  const destinationCards = [
    {
      name: 'Santorini',
      country: 'Greece',
      image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Breathtaking sunsets, white-washed buildings, and crystal-clear waters in this Greek island paradise.',
      hiddenGem: 'Visit the hidden village of Pyrgos for authentic local cuisine away from tourist crowds.',
      rating: 4.8
    },
    {
      name: 'Kyoto',
      country: 'Japan',
      image: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Ancient temples, traditional gardens, and timeless beauty in Japan\'s cultural heart.',
      hiddenGem: 'Explore the bamboo groves of Arashiyama at dawn for a magical, crowd-free experience.',
      rating: 4.9
    },
    {
      name: 'Banff',
      country: 'Canada',
      image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Pristine mountain lakes, towering peaks, and abundant wildlife in stunning national parks.',
      hiddenGem: 'Hike to the secret Ink Pots hot springs for a natural spa experience in the wilderness.',
      rating: 4.7
    },
    {
      name: 'Marrakech',
      country: 'Morocco',
      image: 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Vibrant souks, stunning architecture, and magical North African culture experiences.',
      hiddenGem: 'Visit the secret rooftop gardens of Bahia Palace for panoramic views of the medina.',
      rating: 4.6
    },
    {
      name: 'Reykjavik',
      country: 'Iceland',
      image: 'https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Northern Lights, dramatic landscapes, and relaxing geothermal hot springs.',
      hiddenGem: 'Discover the hidden Seljavallalaug pool, a geothermal swimming spot surrounded by mountains.',
      rating: 4.5
    },
    {
      name: 'Bagan',
      country: 'Myanmar',
      image: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      description: 'Thousands of ancient temples and pagodas across mystical plains in this archaeological wonder.',
      hiddenGem: 'Take a sunrise hot air balloon ride over the temple plains for an unforgettable aerial view.',
      rating: 4.8
    }
  ];

  // Beautiful travel videos from Pexels - various landscapes and experiences
  const travelVideos = [
    // Using static background images instead of videos for better compatibility
  ];

  // High-quality 4K travel destination images from Pexels
  const travelImages = [
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1434819/pexels-photo-1434819.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160',
    'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=3840&h=2160'
  ];

  // Update destination when inspiration is selected
  React.useEffect(() => {
    if (inspirationDestination) {
      setDestination(inspirationDestination);
    }
  }, [inspirationDestination]);

  // Handle click outside calendar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showCalendar &&
        calendarRef.current &&
        dateInputRef.current &&
        !calendarRef.current.contains(target) &&
        !dateInputRef.current.contains(target)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Auto-rotate videos every 6 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => 
        (prevIndex + 1) % travelImages.length
      );
    }, 7000); // 7 seconds per image

    return () => clearInterval(interval);
  }, [travelImages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !numberOfDays || !tripType) return;

    handleTripCreation();
  };

  const handleDateSelect = (date: string) => {
    setStartDate(date);
    setShowCalendar(false);
  };

  const handleBudgetMinChange = (value: number) => {
    const newMin = Math.max(0, Math.min(value, budgetMax - 50)); // Ensure min is always less than max and >= 0
    setBudgetMin(newMin);
    setBudgetMinInput(newMin.toString());
  };

  const handleBudgetMaxChange = (value: number) => {
    const newMax = Math.min(10000, Math.max(value, budgetMin + 50)); // Ensure max is always greater than min and <= 10000
    setBudgetMax(newMax);
    setBudgetMaxInput(newMax.toString());
  };

  const handleBudgetMinInputChange = (value: string) => {
    setBudgetMinInput(value);
    const numValue = parseInt(value) || 0;
    if (value !== '') {
      const clampedValue = Math.max(0, Math.min(budgetMax - 50, numValue));
      setBudgetMin(clampedValue);
    }
  };

  const handleBudgetMaxInputChange = (value: string) => {
    setBudgetMaxInput(value);
    const numValue = parseInt(value) || 0;
    if (value !== '') {
      const clampedValue = Math.max(budgetMin + 50, Math.min(10000, numValue));
      setBudgetMax(clampedValue);
    }
  };

  const openCalendar = () => {
    setShowCalendar(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentCalendarMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };


  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getCurrentMonth = () => {
    return currentCalendarMonth;
  };

  const isDateInRange = (date: Date) => {
    return false; // No range selection needed anymore
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === startDate;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDestinationSelect = (destination: string) => {
    setDestination(destination);
  };

  const handleFavoriteToggle = (cardId: string, isFavorite: boolean) => {
    setFavoriteCards(prev => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      onFavoriteCountChange?.(newSet.size);
      return newSet;
    });
  };

  const handleTripCreation = async () => {
    setIsCreatingTrip(true);
    setErrorMessage(null);
    
    try {
      // Calculate end date
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(startDateObj.getDate() + parseInt(numberOfDays) - 1);
      
      // Create trip data
      const tripData = {
        destination,
        startDate,
        endDate: endDateObj.toISOString().split('T')[0],
        tripType,
        collaborators: []
      };
      
      // Show success message briefly
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setIsCreatingTrip(false);
        setShowSuccessMessage(false);
        // Call the existing trip creation handler
        onTripCreate(tripData);
      }, 1500);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create trip. Please try again.');
      setIsCreatingTrip(false);
      setShowSuccessMessage(false);
      // Auto-hide error after 5 seconds
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {travelImages.map((imageUrl, index) => (
          <div key={`video-${index}`} className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Background image */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          </div>
        ))}
        
        {/* Overlay to ensure form readability - higher z-index */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-20" />
      </div>

      <div className="flex w-full max-w-7xl items-start relative z-10">
        {/* Trip Planner Form - Left Side */}
        <div className="w-2/5 flex-shrink-0 ml-8">
          <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-5 md:p-6 border border-white border-opacity-80">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-heading">
              Every Trip Has a Plan. What's Yours?
            </h1>
            <p className="text-sm text-gray-800 font-medium font-body">
              Craft the perfect trip that's uniquely yours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Where's your dream destination? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, Hawaii, Japan, India"
                  required
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Trip Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                What type of trip are you planning?
              </label>
              <div className="relative">
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all appearance-none pr-10"
                >
                  <option value="" disabled>Select your vibe</option>
                  <option value="chill">Chill</option>
                  <option value="party">Party</option>
                  <option value="adventure">Adventure</option>
                  <option value="culture">Culture</option>
                  <option value="spontaneous">Spontaneous</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="family">Family</option>
                  <option value="romantic">Romantic</option>
                  <option value="business">Business</option>
                  <option value="food">Food & Culinary</option>
                  <option value="nature">Nature & Wildlife</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
            </div>

            {/* Start Date and Number of Days */}
            <div className="relative" ref={calendarRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                When are you going and for how long? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Days <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(e.target.value)}
                    placeholder="e.g. 7"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      ref={dateInputRef}
                      type="text"
                      value={formatDateForDisplay(startDate)}
                      onClick={openCalendar}
                      placeholder="Select start date"
                      readOnly
                      required
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer"
                    />
                    <ChevronDown className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-transform ${
                      showCalendar ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>
              </div>
              
              {/* Calendar positioned below start date field */}
              {showCalendar && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white bg-opacity-95 backdrop-blur-lg shadow-2xl z-50 rounded-xl border border-white border-opacity-80 max-w-sm mx-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        Select Start Date
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Month Navigation */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => navigateMonth('prev')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronDown className="h-4 w-4 rotate-90 text-gray-600" />
                        </button>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                          {getCurrentMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <button
                          type="button"
                          onClick={() => navigateMonth('next')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronDown className="h-4 w-4 -rotate-90 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Calendar Grid */}
                      <div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                              {day}
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays(getCurrentMonth()).map((date, index) => {
                            const isCurrentMonth = date.getMonth() === getCurrentMonth().getMonth();
                            const isSelected = isDateSelected(date);
                            const isDisabled = isDateDisabled(date);
                            const dateStr = date.toISOString().split('T')[0];
                            
                            return (
                              <button
                                type="button"
                                key={index}
                                onClick={() => !isDisabled && handleDateSelect(dateStr)}
                                disabled={isDisabled}
                                className={`
                                  w-7 h-7 text-xs rounded-lg transition-all font-medium
                                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                                  ${isSelected ? 'bg-orange-500 text-white font-semibold shadow-lg' : ''}
                                  ${!isSelected && isCurrentMonth && !isDisabled ? 'hover:bg-orange-100 hover:text-orange-700 text-gray-700' : ''}
                                  ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Selected Date Display */}
                      {startDate && (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-700 text-center font-medium text-sm">
                            <span className="font-semibold">Selected:</span> {formatDateForDisplay(startDate)}
                            {numberOfDays && (
                              <span className="block text-xs mt-1">
                                Duration: {numberOfDays} day{numberOfDays !== '1' ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Budget (Optional)
              </label>
              <div className="space-y-4">
                {/* Budget Display Bubble */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold text-lg">
                      ${budgetMin} - ${budgetMax}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-500"></div>
                  </div>
                </div>
                
                {/* Range Slider */}
                <div className="relative">
                  {/* Track */}
                  <div className="relative h-2 bg-gray-200 rounded-lg">
                    <div 
                      className="absolute h-2 bg-orange-500 rounded-lg"
                      style={{
                        left: `${(budgetMin / 10000) * 100}%`,
                        width: `${((budgetMax - budgetMin) / 10000) * 100}%`
                      }}
                    />
                  </div>
                  
                  {/* Min Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={budgetMin}
                    onChange={(e) => handleBudgetMinChange(parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                    style={{ zIndex: 1 }}
                  />
                  
                  {/* Max Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={budgetMax}
                    onChange={(e) => handleBudgetMaxChange(parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
                    style={{ zIndex: 2 }}
                  />
                  
                  <style jsx>{`
                    .range-slider::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #f97316;
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      position: relative;
                      z-index: 999;
                    }
                    .range-slider::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #f97316;
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      position: relative;
                      z-index: 999;
                    }
                  `}</style>
                </div>
                
                {/* Input Fields */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="50"
                      value={budgetMinInput}
                      onChange={(e) => handleBudgetMinInputChange(e.target.value)}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.max(0, Math.min(budgetMax - 50, value));
                        setBudgetMin(clampedValue);
                        setBudgetMinInput(clampedValue.toString());
                      }}
                      placeholder="$0"
                      className="w-full px-4 py-2 border-2 border-gray-200 bg-white rounded-full text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-500 font-medium">—</span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="50"
                      value={budgetMaxInput}
                      onChange={(e) => handleBudgetMaxInputChange(e.target.value)}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.max(budgetMin + 50, Math.min(10000, value));
                        setBudgetMax(clampedValue);
                        setBudgetMaxInput(clampedValue.toString());
                      }}
                      placeholder="$1000"
                      className="w-full px-4 py-2 border-2 border-gray-200 bg-white rounded-full text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              disabled={!destination || !startDate || !numberOfDays || !tripType || isCreatingTrip || showSuccessMessage}
              className={`w-full py-2.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                showSuccessMessage 
                  ? 'bg-green-500 text-white' 
                  : isCreatingTrip
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              }`}
            >
              {showSuccessMessage ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Trip created! Redirecting...</span>
                </div>
              ) : isCreatingTrip ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  <span className="animate-pulse">Creating your trip<span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span></span>
                </div>
              ) : (
                'Start planning'
              )}
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={onInspireMe}
                disabled={isCreatingTrip || showSuccessMessage}
                className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-all font-medium hover:scale-105 group"
              >
                <div className="flex items-center space-x-1">
                  <Lightbulb className="h-5 w-5 group-hover:text-yellow-500 transition-colors" />
                  <Sparkles className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-all" />
                </div>
                <span>Need inspiration? Let us suggest a destination!</span>
              </button>
            </div>
          </form>
        </div>
        </div>

        {/* Destination Cards - Right Side */}
        <div className="flex-1 max-h-screen overflow-hidden flex flex-col items-center">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Popular Destinations</h2>
            <p className="text-white/90 drop-shadow-md">Discover amazing places around the world</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl px-4">
            {destinationCards.map((destination, index) => (
              <DestinationCard
                key={`${destination.name}-${destination.country}`}
                name={destination.name}
                country={destination.country}
                image={destination.image}
                description={destination.description}
                hiddenGem={destination.hiddenGem}
                rating={destination.rating}
                onPlanTrip={handleDestinationSelect}
                onFavoriteToggle={(isFavorite) => handleFavoriteToggle(`${destination.name}-${destination.country}`, isFavorite)}
                favoriteCount={favoriteCards.size}
              />
            ))}
          </div>
          
          {/* Explore More Button */}
          <div className="flex justify-center mt-8 mb-8">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg">
              Explore More Destinations
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};