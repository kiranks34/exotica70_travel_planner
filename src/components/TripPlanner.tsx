import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Sparkles, UserPlus, Lightbulb, X, ChevronDown } from 'lucide-react';

interface TripPlannerProps {
  onTripCreate: (tripData: any) => void;
  onInspireMe: () => void;
  inspirationDestination?: string;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({ onTripCreate, onInspireMe, inspirationDestination }) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');
  const [tripType, setTripType] = useState('');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(1000);
  const [budgetMinInput, setBudgetMinInput] = useState('0');
  const [budgetMaxInput, setBudgetMaxInput] = useState('1000');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Beautiful travel videos from Pexels - various landscapes and experiences
  const travelVideos = [
    'https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_25fps.mp4',
    'https://videos.pexels.com/video-files/1526909/1526909-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1409899/1409899-hd_1920_1080_24fps.mp4',
    'https://videos.pexels.com/video-files/1721294/1721294-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1534735/1534735-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_25fps.mp4',
    'https://videos.pexels.com/video-files/1851190/1851190-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',
    'https://videos.pexels.com/video-files/2022395/2022395-hd_1920_1080_30fps.mp4'
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
        (prevIndex + 1) % travelVideos.length
      );
    }, 7000); // 7 seconds per video

    return () => clearInterval(interval);
  }, [travelVideos.length]);

  // Preload next video for smoother transitions
  React.useEffect(() => {
    const nextIndex = (currentVideoIndex + 1) % travelVideos.length;
    const video = document.createElement('video');
    video.src = travelVideos[nextIndex];
    video.load();
  }, [currentVideoIndex, travelVideos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !numberOfDays) return;

    // Calculate end date based on start date and number of days
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(numberOfDays) - 1);
    const endDate = end.toISOString().split('T')[0];

    onTripCreate({
      destination,
      startDate,
      endDate,
      tripType,
      collaborators: []
    });
  };

  const handleDateSelect = (date: string) => {
    setStartDate(date);
    setShowCalendar(false);
  };

  const handleBudgetMinChange = (value: number) => {
    const newMin = Math.min(value, budgetMax - 100); // Ensure min is always less than max
    setBudgetMin(newMin);
    setBudgetMinInput(newMin.toString());
  };

  const handleBudgetMaxChange = (value: number) => {
    const newMax = Math.max(value, budgetMin + 100); // Ensure max is always greater than min
    setBudgetMax(newMax);
    setBudgetMaxInput(newMax.toString());
  };

  const handleBudgetMinInputChange = (value: string) => {
    setBudgetMinInput(value);
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(budgetMax - 100, numValue));
    setBudgetMin(clampedValue);
  };

  const handleBudgetMaxInputChange = (value: string) => {
    setBudgetMaxInput(value);
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(budgetMin + 100, Math.min(10000, numValue));
    setBudgetMax(clampedValue);
  };

  const openCalendar = () => {
    setShowCalendar(true);
  };


  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const getNextMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
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

  return (
    <div className="min-h-screen flex items-center p-4 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {travelVideos.map((videoUrl, index) => (
          <div key={`video-${index}`} className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentVideoIndex ? 'opacity-100' : 'opacity-0'
          }`}>
            <video
              key={`video-element-${index}-${currentVideoIndex}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover z-10"
              poster={travelImages[index]}
              onLoadStart={() => console.log(`Loading video ${index}`)}
              onCanPlay={() => console.log(`Video ${index} can play`)}
              onError={(e) => console.log(`Video ${index} error:`, e)}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Background image fallback - lower z-index so video appears on top */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
              style={{ backgroundImage: `url(${travelImages[index]})` }}
            />
          </div>
        ))}
        
        {/* Overlay to ensure form readability - higher z-index */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-20" />
      </div>

      <div className="max-w-xl w-full ml-8 lg:ml-16">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-2xl p-5 md:p-6 border border-white border-opacity-80 relative z-10">
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
                Where's your dream destination?
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Paris, Hawaii, Japan, India"
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
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                When are you going and for how long?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      ref={dateInputRef}
                      type="text"
                      value={formatDateForDisplay(startDate)}
                      onClick={openCalendar}
                      placeholder="Select start date"
                      readOnly
                      className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 bg-white rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>
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
                      pointer-events: all;
                    }
                    .range-slider::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #f97316;
                      cursor: pointer;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      pointer-events: all;
                    }
                  `}</style>
                </div>
                
                {/* Input Fields */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={budgetMinInput}
                      onChange={(e) => handleBudgetMinInputChange(e.target.value)}
                      placeholder="$0"
                      className="w-full px-4 py-2 border-2 border-gray-200 bg-white rounded-full text-center focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-500 font-medium">—</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={budgetMaxInput}
                      onChange={(e) => handleBudgetMaxInputChange(e.target.value)}
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
              disabled={!destination || !startDate || !numberOfDays || !tripType}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              Start planning
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onInspireMe}
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

      {/* Calendar Overlay - Slides from right */}
      {showCalendar && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" />
          
          {/* Calendar Panel */}
          <div 
            ref={calendarRef}
            className={`fixed top-0 right-0 h-full w-96 bg-white bg-opacity-95 backdrop-blur-lg shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              showCalendar ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Select Start Date
                </h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Current Month */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                    {getCurrentMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-sm font-medium text-gray-500 text-center py-2">
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
                          key={index}
                          onClick={() => !isDisabled && handleDateSelect(dateStr)}
                          disabled={isDisabled}
                          className={`
                            w-10 h-10 text-sm rounded-lg transition-all font-medium
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
                
                {/* Next Month */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                    {getNextMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                      <div key={day} className="text-sm font-medium text-gray-500 text-center py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(getNextMonth()).map((date, index) => {
                      const isCurrentMonth = date.getMonth() === getNextMonth().getMonth();
                      const isSelected = isDateSelected(date);
                      const isDisabled = isDateDisabled(date);
                      const dateStr = date.toISOString().split('T')[0];
                      
                      return (
                        <button
                          key={index}
                          onClick={() => !isDisabled && handleDateSelect(dateStr)}
                          disabled={isDisabled}
                          className={`
                            w-10 h-10 text-sm rounded-lg transition-all font-medium
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
              </div>
              
              {/* Selected Date Display */}
              {startDate && (
                <div className="mt-8 p-4 bg-orange-50 rounded-xl">
                  <p className="text-orange-700 text-center font-medium">
                    <span className="font-semibold">Selected:</span> {formatDateForDisplay(startDate)}
                    {numberOfDays && (
                      <span className="block text-sm mt-1">
                        Duration: {numberOfDays} day{numberOfDays !== '1' ? 's' : ''}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};