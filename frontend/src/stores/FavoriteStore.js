import { makeAutoObservable, reaction } from 'mobx';
import authStore from './AuthStore';

class FavoriteStore {
  favorites = []; // Array of property IDs

  constructor() {
    makeAutoObservable(this);
    // React to user changes to reload favorites
    reaction(
      () => authStore.user,
      (user) => {
        if (user) {
          this.loadFavorites(user.user_id);
        } else {
          this.favorites = [];
        }
      }
    );
    
    // Initial load if user is already present
    if (authStore.user) {
      this.loadFavorites(authStore.user.user_id);
    }
  }

  loadFavorites(userId) {
    if (!userId) return;
    const key = `favorites_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.favorites = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse favorites', e);
        this.favorites = [];
      }
    } else {
        this.favorites = [];
    }
  }

  saveFavorites() {
    if (!authStore.user) return;
    const key = `favorites_${authStore.user.user_id}`;
    localStorage.setItem(key, JSON.stringify(this.favorites));
  }

  addFavorite(propertyId) {
    if (!authStore.isAuthenticated) return;
    if (!this.favorites.includes(propertyId)) {
      this.favorites.push(propertyId);
      this.saveFavorites();
    }
  }

  removeFavorite(propertyId) {
    if (!authStore.isAuthenticated) return;
    this.favorites = this.favorites.filter(id => id !== propertyId);
    this.saveFavorites();
  }

  toggleFavorite(propertyId) {
    if (!authStore.isAuthenticated) return;
    
    if (this.isFavorite(propertyId)) {
      this.removeFavorite(propertyId);
    } else {
      this.addFavorite(propertyId);
    }
  }

  isFavorite(propertyId) {
    return this.favorites.includes(propertyId);
  }
}

export default new FavoriteStore();
