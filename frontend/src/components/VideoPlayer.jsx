import { useState } from 'react';
import { X, Play } from 'lucide-react';

const VideoPlayer = ({ videos, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId;

    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
  };

  if (!isOpen || !videos || videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];
  const isYouTube = isYouTubeUrl(currentVideo);
  const videoUrl = isYouTube ? getYouTubeEmbedUrl(currentVideo) : `http://localhost:5000${currentVideo}`;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-11/12 h-5/6 lg:w-3/4 lg:h-4/5 flex flex-col">
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
          {isYouTube ? (
            <iframe
              src={videoUrl}
              title={`Video ${currentIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <video
              key={currentVideo}
              src={videoUrl}
              autoPlay={isPlaying}
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="bg-gray-900 text-white p-4 rounded-b-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={videos.length <= 1}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-4 py-2 rounded-lg transition"
              title="Previous video (← key)"
            >
              ← Previous
            </button>

            <span className="text-sm font-medium">
              {currentIndex + 1} / {videos.length}
            </span>

            <button
              onClick={handleNext}
              disabled={videos.length <= 1}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white px-4 py-2 rounded-lg transition"
              title="Next video (→ key)"
            >
              Next →
            </button>
          </div>

          <span className="text-xs bg-white/20 px-3 py-1 rounded">
            {isYouTube ? 'YouTube' : 'Uploaded Video'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition z-10"
          title="Close (Esc key)"
        >
          <X size={24} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
        Arrow keys to navigate, Esc to close
      </div>
    </div>
  );
};

const VideoThumbnail = ({ video, onClick }) => {
  const isYouTube = video.includes('youtube.com') || video.includes('youtu.be');

  const handleClick = (e) => {
    if (e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className="relative bg-gray-100 rounded-lg overflow-hidden h-48 cursor-pointer group hover:shadow-lg transition-shadow"
    >
      {isYouTube ? (
        <>
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold">▶</div>
              <p className="text-xs mt-2">YouTube Video</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <video
            src={`http://localhost:5000${video}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="bg-white/90 group-hover:bg-white text-gray-900 p-3 rounded-full transition-colors opacity-0 group-hover:opacity-100">
          <Play size={24} fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export { VideoPlayer, VideoThumbnail };
