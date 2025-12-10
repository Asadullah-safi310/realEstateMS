import { useState, useEffect } from 'react';

const useViewPreference = (key) => {
  const [viewType, setViewType] = useState('card');

  useEffect(() => {
    const savedView = localStorage.getItem(`view_${key}`);
    if (savedView) {
      setViewType(savedView);
    }
  }, [key]);

  const toggleView = (view) => {
    setViewType(view);
    localStorage.setItem(`view_${key}`, view);
  };

  return { viewType, toggleView };
};

export default useViewPreference;
