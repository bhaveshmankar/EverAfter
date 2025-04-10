import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface VirtualTourProps {
  venueId: string;
  venueName: string;
  tourImages: string[];
  onClose: () => void;
}

const VirtualTour = ({ venueName, tourImages, onClose }: VirtualTourProps) => {
  const [currentView, setCurrentView] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle navigation between tour images
  const navigateToView = (index: number) => {
    setCurrentView(index);
    setRotationDegree(0); // Reset rotation when changing views
  };
  
  // Go to next view - wrapped in useCallback
  const nextView = useCallback(() => {
    setCurrentView((prev) => (prev + 1) % tourImages.length);
    setRotationDegree(0);
  }, [tourImages.length]);
  
  // Go to previous view - wrapped in useCallback
  const prevView = useCallback(() => {
    setCurrentView((prev) => (prev - 1 + tourImages.length) % tourImages.length);
    setRotationDegree(0);
  }, [tourImages.length]);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle mouse down event for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  
  // Handle mouse move event for rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      setRotationDegree((prev) => {
        // Calculate new rotation value
        const newRotation = prev + deltaX * 0.5;
        
        // Reset startX for continuous movement
        setStartX(e.clientX);
        
        // Normalize rotation to keep it between 0 and 360
        return newRotation % 360;
      });
    }
  };
  
  // Handle mouse up event to stop rotation
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Reset rotation
  const resetRotation = () => {
    setRotationDegree(0);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        prevView();
      } else if (e.key === 'ArrowRight') {
        nextView();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, prevView, nextView]);
  
  useEffect(() => {
    // Prevent scrolling while tour is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 text-white">
        <div>
          <h2 className="text-xl font-bold">{venueName}</h2>
          <p className="text-sm text-gray-300">Virtual Tour</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      {/* Main tour view */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 360 view */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            transform: `perspective(1000px) rotateY(${rotationDegree}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
        >
          <img
            src={tourImages[currentView]}
            alt={`360 view ${currentView + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Reset rotation button */}
        <button
          onClick={resetRotation}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        >
          <RotateCcw size={20} />
        </button>
        
        {/* Navigation overlay */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4">
          <button
            onClick={prevView}
            className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextView}
            className="bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* View indicator */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full">
          {currentView + 1} / {tourImages.length}
        </div>
        
        {/* Interaction hint */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm fade-out">
          Click and drag to look around
        </div>
      </div>
      
      {/* Thumbnail navigation */}
      <div className="p-4 bg-black bg-opacity-50">
        <div className="flex space-x-2 overflow-x-auto py-2">
          {tourImages.map((image, index) => (
            <button
              key={index}
              onClick={() => navigateToView(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition ${
                currentView === index 
                  ? 'border-blue-500 opacity-100' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualTour; 