// Storage management for Mood Calendar
// Uses VK Storage API with localStorage fallback

console.log('📦 storage.js loading...');

const StorageManager = {
  useVKStorage: false,
  dataKey: 'mood-calendar-data',

  async init() {
    console.log('Initializing StorageManager...');
    
    // Try to initialize VK storage
    if (window.VKApi && typeof VKApi.init === 'function') {
      try {
        this.useVKStorage = VKApi.initialized;
        console.log('VK Storage status:', this.useVKStorage ? 'enabled' : 'disabled');
      } catch (e) {
        console.warn('VK Storage check failed:', e.message);
        this.useVKStorage = false;
      }
    } else {
      console.log('VKApi not available, using localStorage only');
      this.useVKStorage = false;
    }
    
    console.log('StorageManager initialized (VK:', this.useVKStorage, ')');
  },

  async loadData() {
    console.log('Loading data...');
    
    if (this.useVKStorage && window.VKApi) {
      try {
        const vkData = await VKApi.storageGet(this.dataKey);
        if (vkData) {
          try {
            const parsed = JSON.parse(vkData);
            console.log('Data loaded from VK Storage');
            return parsed;
          } catch (e) {
            console.error('Failed to parse VK storage data:', e);
          }
        }
      } catch (e) {
        console.warn('VK Storage load failed:', e.message);
      }
    }

    // Fallback to localStorage
    const localData = localStorage.getItem(this.dataKey);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        console.log('Data loaded from localStorage');
        return parsed;
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }

    // Return default structure
    console.log('Returning default data structure');
    return {
      moods: {},
      customColors: [],
      settings: {
        theme: 'light'
      }
    };
  },

  async saveData(data) {
    console.log('Saving data...');
    
    // Always save to localStorage as backup
    localStorage.setItem(this.dataKey, JSON.stringify(data));
    console.log('Data saved to localStorage');
    
    // Also try VK Storage if available
    if (this.useVKStorage && window.VKApi) {
      try {
        const success = await VKApi.storageSet(this.dataKey, JSON.stringify(data));
        if (success) {
          console.log('Data also saved to VK Storage');
        }
      } catch (e) {
        console.warn('VK Storage save failed:', e.message);
      }
    }
    
    return true;
  },

  async setMood(date, colorHex, note = '') {
    console.log('Setting mood for', date, ':', colorHex);
    const data = await this.loadData();
    data.moods[date] = {
      color: colorHex,
      note,
      timestamp: Date.now()
    };
    await this.saveData(data);
  },

  async getMood(date) {
    const data = await this.loadData();
    return data.moods[date] || null;
  },

  async removeMood(date) {
    const data = await this.loadData();
    delete data.moods[date];
    await this.saveData(data);
  },

  async getMoodsForMonth(year, month) {
    const data = await this.loadData();
    const result = {};
    
    const monthStr = String(month + 1).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;
    
    for (const [date, mood] of Object.entries(data.moods)) {
      if (date.startsWith(prefix)) {
        result[date] = mood;
      }
    }
    
    return result;
  },

  async exportData() {
    const data = await this.loadData();
    return JSON.stringify(data, null, 2);
  },

  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      await this.saveData(data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
};

window.StorageManager = StorageManager;
console.log('📦 StorageManager ready');
