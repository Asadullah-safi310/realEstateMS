import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';

const PhotoViewer = ({ photos, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(100);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') setZoom(100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setZoom(100);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setZoom(100);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 300));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    e.currentTarget.touchStartX = touch.clientX;
  };

  const handleTouchEnd = (e) => {
    const touchStartX = e.currentTarget.touchStartX;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  if (!isOpen || !photos || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-11/12 h-5/6 flex items-center justify-center overflow-hidden rounded-lg">
          <img
            src={`http://localhost:5000${currentPhoto}`}
            alt={`Photo ${currentIndex + 1}`}
            style={{
              transform: `scale(${zoom / 100})`,
              transition: 'transform 0.2s ease-in-out',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            className="cursor-move"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleZoomOut}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
                title="Zoom out (- key)"
              >
                <ZoomOut size={20} />
              </button>

              <div className="bg-white/20 px-4 py-2 rounded-lg text-white text-sm">
                {zoom}%
              </div>

              <button
                onClick={handleZoomIn}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
                title="Zoom in (+ key)"
              >
                <ZoomIn size={20} />
              </button>

              <button
                onClick={() => setZoom(100)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition text-sm"
                title="Reset zoom (0 key)"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrevious}
          disabled={photos.length <= 1}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white p-2 rounded-lg transition z-10"
          title="Previous (← key)"
        >
          <ChevronLeft size={32} />
        </button>

        <button
          onClick={handleNext}
          disabled={photos.length <= 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 disabled:opacity-30 text-white p-2 rounded-lg transition z-10"
          title="Next (→ key)"
        >
          <ChevronRight size={32} />
        </button>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition z-10"
          title="Close (Esc key)"
        >
          <X size={24} />
        </button>

        <div className="absolute bottom-4 left-4 bg-white/20 text-white px-4 py-2 rounded-lg text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
        Use arrow keys to navigate, +/- to zoom, 0 to reset, Esc to close
      </div>
    </div>
  );
};

export default PhotoViewer;
