// Main app entry point for Mood Calendar

console.log('🚀 app.js started loading');

// UI Utilities
const UI = {
  showLoading() {
    console.log('Showing loading overlay');
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  },

  hideLoading() {
    console.log('Hiding loading overlay');
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  },

  showToast(message, type = 'info') {
    console.log(`Toast [${type}]:`, message);
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  handleError(error, context = '') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    const msg = context ? `Ошибка: ${context}` : 'Произошла ошибка';
    this.showToast(msg, 'error');
  }
};

window.UI = UI;

// Initialize app
async function initApp() {
  console.log('📅 Mood Calendar initializing...');
  UI.showLoading();
  
  // Safety timeout - hide loading after 5s no matter what
  setTimeout(() => {
    const overlay = document.getElementById('loading-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      console.warn('Force hiding loading after timeout');
      UI.hideLoading();
    }
  }, 5000);

  try {
    // Check if VK Bridge is available
    console.log('Checking VK Bridge...');
    if (typeof vkBridge !== 'undefined') {
      console.log('vkBridge found, trying to init...');
      try {
        await VKApi.init();
        console.log('✓ VK Bridge initialized');
      } catch (vkError) {
        console.warn('VK Bridge init failed (normal outside VK):', vkError.message);
      }
    } else {
      console.log('vkBridge not available (running outside VK)');
    }

    // Initialize storage
    console.log('Initializing storage...');
    await StorageManager.init();
    console.log('✓ Storage initialized');

    // Initialize colors manager
    console.log('Initializing colors...');
    ColorsManager.init();
    console.log('✓ Colors initialized');

    // Initialize calendar
    console.log('Initializing calendar...');
    CalendarManager.init();
    console.log('✓ Calendar initialized');

    // Initialize stats
    console.log('Initializing stats...');
    StatsManager.renderStats('stats-section');
    console.log('✓ Stats initialized');

    // Render color picker with callback
    console.log('Rendering color picker...');
    ColorsManager.renderColorPicker('color-picker', async (color) => {
      console.log('Color selected:', color);
      const selectedDate = CalendarManager.selectedDate;
      if (selectedDate) {
        try {
          await StorageManager.setMood(selectedDate, color);
          CalendarManager.render();
          UI.showToast('Настроение сохранено!', 'success');
        } catch (error) {
          UI.handleError(error, 'сохранение настроения');
        }
      }
    });
    console.log('✓ Color picker rendered');

    // Hide loading after successful init
    setTimeout(() => {
      UI.hideLoading();
    }, 300);

    console.log('🎉 App initialized successfully!');
    UI.showToast('Календарь готов!', 'success');
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    UI.handleError(error, 'инициализация приложения');
    UI.hideLoading();
    
    // Fallback: try to initialize basic features
    console.log('Attempting fallback initialization...');
    try {
      StorageManager.init();
      ColorsManager.init();
      CalendarManager.init();
      StatsManager.renderStats('stats-section');
      console.log('✓ Fallback init successful');
    } catch (fallbackError) {
      console.error('❌ Fallback init also failed:', fallbackError);
    }
  }
}

// Wait for DOM and start
console.log('Setting up DOM ready listener...');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
  console.log('Waiting for DOMContentLoaded...');
} else {
  console.log('DOM already ready, starting init...');
  initApp();
}
