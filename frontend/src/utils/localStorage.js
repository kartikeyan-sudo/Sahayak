// LocalStorage utility functions for privacy-first data handling
import mockData from '../data/mockData';

const STORAGE_KEYS = {
  SESSION: 'sahayakSession',
  DRAFTS: 'sahayakDrafts',
  BOOKMARKS: 'sahayakBookmarks',
  ACTIVITY: 'sahayakActivity',
  USER_PREFERENCES: 'sahayakPreferences'
  ,SCHEMES: 'sahayakSchemes'
};

// Session Management
export const sessionStorage = {
  set: (sessionData) => {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
  },
  get: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
  isActive: () => {
    const session = sessionStorage.get();
    return session && session.isActive;
  }
};

// FIR Drafts Management
export const draftStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    return data ? JSON.parse(data) : [];
  },
  save: (draft) => {
    const drafts = draftStorage.getAll();
    const newDraft = {
      ...draft,
      id: draft.id || Date.now().toString(),
      lastModified: new Date().toISOString()
    };
    
    const existingIndex = drafts.findIndex(d => d.id === newDraft.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = newDraft;
    } else {
      drafts.push(newDraft);
    }
    
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
    return newDraft;
  },
  get: (id) => {
    const drafts = draftStorage.getAll();
    return drafts.find(d => d.id === id);
  },
  delete: (id) => {
    const drafts = draftStorage.getAll();
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filtered));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.DRAFTS);
  }
};

// Bookmarks Management
export const bookmarkStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },
  add: (schemeId) => {
    const bookmarks = bookmarkStorage.getAll();
    if (!bookmarks.includes(schemeId)) {
      bookmarks.push(schemeId);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    }
  },
  remove: (schemeId) => {
    const bookmarks = bookmarkStorage.getAll();
    const filtered = bookmarks.filter(id => id !== schemeId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
  },
  isBookmarked: (schemeId) => {
    const bookmarks = bookmarkStorage.getAll();
    return bookmarks.includes(schemeId);
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  }
};

// Activity Log Management
export const activityStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return data ? JSON.parse(data) : [];
  },
  add: (activity) => {
    const activities = activityStorage.getAll();
    const newActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    activities.unshift(newActivity); // Add to beginning
    
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
  }
};

// User Preferences
export const preferencesStorage = {
  get: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {
      theme: 'light',
      language: 'en',
      notifications: true
    };
  },
  set: (preferences) => {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
  }
};

// Schemes (Scheme Hub) stored locally for offline/dev fallback
export const schemesStorage = {
  // Return array of schemes; seed from mockData if none present
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEMES);
    if (!data) {
      // Seed with bundled mock data and persist
      try {
        const seeded = Array.isArray(mockData.schemeCatalogue) ? mockData.schemeCatalogue : [];
        localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(seeded));
        return seeded;
      } catch (e) {
        return [];
      }
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },
  save: (scheme) => {
    const schemes = schemesStorage.getAll();
    const newScheme = {
      ...scheme,
      id: scheme.id || `scheme-${Date.now()}`,
      lastModified: new Date().toISOString()
    };

    const idx = schemes.findIndex(s => s.id === newScheme.id);
    if (idx >= 0) schemes[idx] = newScheme; else schemes.push(newScheme);

    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
    return newScheme;
  },
  get: (id) => {
    const schemes = schemesStorage.getAll();
    return schemes.find(s => s.id === id) || null;
  },
  delete: (id) => {
    const schemes = schemesStorage.getAll();
    const filtered = schemes.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(filtered));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.SCHEMES);
  },
  // Helper to replace entire catalogue (useful for imports or syncing)
  replaceAll: (arr) => {
    const list = Array.isArray(arr) ? arr : [];
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(list));
    return list;
  }
};

// Clear all app data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export default {
  session: sessionStorage,
  drafts: draftStorage,
  bookmarks: bookmarkStorage,
  activity: activityStorage,
  preferences: preferencesStorage,
  schemes: schemesStorage,
  clearAll: clearAllData
};
