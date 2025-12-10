import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ images = [], title = 'Photos', autoSlide = true, autoSlideInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(autoSlide);

  useEffect(() => {
    if (!isAutoPlayActive || !images || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [isAutoPlayActive, images, autoSlideInterval]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl h-64 md:h-96 flex items-center justify-center shadow-lg">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-semibold">No {title.toLowerCase()} available</p>
          <p className="text-gray-500 text-sm mt-1">Photos will appear here</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setIsAutoPlayActive(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlayActive(false);
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setIsAutoPlayActive(false);
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full bg-gray-900 rounded-t-xl overflow-hidden shadow-lg">
      <div className="relative h-64 md:h-96 w-full bg-black">
        <img
          src={`http://localhost:5000${currentImage}`}
          alt={`${title} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
          }}
        />

        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition duration-300" />

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              onMouseEnter={() => setIsAutoPlayActive(false)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 z-10"
              aria-label="Previous image"
              title="Previous"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              onMouseEnter={() => setIsAutoPlayActive(false)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 z-10"
              aria-label="Next image"
              title="Next"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        )}

        {autoSlide && isAutoPlayActive && images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-60 px-3 py-1 rounded-full text-white text-xs font-semibold z-10 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-playing
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="bg-gradient-to-t from-black to-transparent px-4 py-4 flex items-center justify-center gap-3">
          <div className="flex justify-center items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-500 w-6 shadow-lg'
                    : 'bg-gray-500 hover:bg-gray-400 w-2'
                }`}
                aria-label={`Go to image ${index + 1}`}
                title={`Image ${index + 1}`}
              />
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-white">
            <span className="text-sm font-semibold bg-black bg-opacity-40 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
