// VK Bridge API integration
// App ID: 54534829

console.log('🔌 vk-api.js loading...');

const VK_APP_ID = 54534829;

const VKApi = {
  initialized: false,

  async init(timeout = 2000) {
    console.log('VKApi.init() called with timeout:', timeout);
    
    return new Promise((resolve, reject) => {
      // Timeout safety
      const timeoutId = setTimeout(() => {
        console.warn('VK Bridge init timeout');
        resolve(false); // Resolve with false instead of reject
      }, timeout);
      
      if (this.initialized) {
        clearTimeout(timeoutId);
        resolve(true);
        return;
      }

      // Check if vkBridge is available
      if (typeof vkBridge === 'undefined') {
        clearTimeout(timeoutId);
        console.log('vkBridge not available');
        resolve(false);
        return;
      }

      vkBridge
        .send('VKWebAppInit')
        .then(() => {
          clearTimeout(timeoutId);
          this.initialized = true;
          console.log('VK Bridge initialized successfully');
          resolve(true);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          console.warn('VK Bridge init failed:', error.message || error);
          // Don't reject, resolve with false
          resolve(false);
        });
    });
  },

  async getClientWidth() {
    try {
      const result = await vkBridge.send('VKWebAppGetClientWidth');
      return result;
    } catch (e) {
      console.warn('Could not get client width:', e);
      return { width: window.innerWidth };
    }
  },

  async storageGet(key) {
    if (!this.initialized) {
      console.warn('VK Storage not initialized');
      return null;
    }
    
    try {
      const result = await vkBridge.send('VKWebAppStorageGet', { keys: [key] });
      return result.keys[0]?.value || null;
    } catch (e) {
      console.warn('Storage get failed:', e);
      return null;
    }
  },

  async storageSet(key, value) {
    if (!this.initialized) {
      console.warn('VK Storage not initialized');
      return false;
    }
    
    try {
      await vkBridge.send('VKWebAppStorageSet', { key, value });
      return true;
    } catch (e) {
      console.error('Storage set failed:', e);
      return false;
    }
  },

  async storageGetKeys() {
    if (!this.initialized) {
      console.warn('VK Storage not initialized');
      return [];
    }
    
    try {
      const result = await vkBridge.send('VKWebAppStorageGetKeys');
      return result.keys || [];
    } catch (e) {
      console.warn('Storage get keys failed:', e);
      return [];
    }
  }
};

window.VKApi = VKApi;
console.log('🔌 VKApi ready');
