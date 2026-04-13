// Main app entry point for Mood Calendar

console.log('🚀 app.js started loading');

// Theme Manager
const ThemeManager = {
  currentTheme: 'auto',

  init() {
    // Load saved theme or detect from system
    const savedTheme = localStorage.getItem('mood-calendar-theme') || 'auto';
    this.setTheme(savedTheme);
    this.renderToggle();
  },

  setTheme(theme) {
    this.currentTheme = theme;
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      // Auto - remove attribute to use media query
      root.removeAttribute('data-theme');
    }
    
    localStorage.setItem('mood-calendar-theme', theme);
  },

  toggle() {
    const themes = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    this.setTheme(nextTheme);
    
    const labels = { auto: 'Авто', light: '☀️ Светлая', dark: '🌙 Тёмная' };
    UI.showToast(`Тема: ${labels[nextTheme]}`, 'success');
    this.updateToggleIcon();
  },

  renderToggle() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let toggle = document.getElementById('theme-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'theme-toggle';
      toggle.className = 'theme-toggle-btn';
      toggle.title = 'Переключить тему';
      toggle.addEventListener('click', () => this.toggle());
      header.appendChild(toggle);
    }
    
    this.updateToggleIcon();
  },

  updateToggleIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    
    const icons = { auto: '🌓', light: '☀️', dark: '🌙' };
    toggle.textContent = icons[this.currentTheme] || '🌓';
  }
};

window.ThemeManager = ThemeManager;

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
  },

  // Skeleton loading animation
  showSkeleton(containerId, count = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = Array(count).fill(0).map(() => `
      <div class="skeleton skeleton-pulse">
        <div class="skeleton-line" style="width: 60%"></div>
        <div class="skeleton-line" style="width: 40%"></div>
      </div>
    `).join('');
  }
};

window.UI = UI;

// Floating Action Button Manager
const FABManager = {
  init() {
    const fab = document.createElement('button');
    fab.id = 'fab-quick-add';
    fab.className = 'fab-button';
    fab.innerHTML = '+';
    fab.title = 'Быстрое добавление настроения';
    
    fab.addEventListener('click', () => {
      // Scroll to color picker and select today
      CalendarManager.goToToday();
      const today = new Date().toISOString().split('T')[0];
      const todayEl = document.querySelector(`[data-date="${today}"]`);
      if (todayEl) {
        todayEl.click();
      }
    });
    
    document.body.appendChild(fab);
    
    // Show/hide on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 200) {
        fab.classList.add('fab-hidden');
      } else {
        fab.classList.remove('fab-hidden');
      }
      lastScroll = currentScroll;
    });
  }
};

window.FABManager = FABManager;

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

    // Initialize theme
    console.log('Initializing theme...');
    ThemeManager.init();
    console.log('✓ Theme initialized');

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

    // Initialize heatmap
    console.log('Initializing heatmap...');
    HeatmapManager.renderHeatmap('main');
    console.log('✓ Heatmap initialized');

    // Initialize stats
    console.log('Initializing stats...');
    StatsManager.renderStats('stats-section');
    console.log('✓ Stats initialized');

    // Initialize export manager
    console.log('Initializing export...');
    ExportManager.renderExportUI('stats-section');
    console.log('✓ Export initialized');

    // Initialize FAB
    console.log('Initializing FAB...');
    FABManager.init();
    console.log('✓ FAB initialized');

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
