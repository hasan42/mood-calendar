// Export/Import functionality for Mood Calendar

console.log('📤 export.js loading...');

const ExportManager = {
  // Export data to JSON file
  async exportData() {
    try {
      const data = await StorageManager.loadData();
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const filename = `mood-calendar-backup-${date}.json`;
      
      // Create temporary link and click
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      UI.showToast('Резервная копия сохранена!', 'success');
      console.log('Export successful:', filename);
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      UI.handleError(error, 'экспорт данных');
      return false;
    }
  },
  
  // Import data from JSON file
  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Неверный формат файла');
      }
      
      if (!data.moods || typeof data.moods !== 'object') {
        throw new Error('Файл не содержит данных о настроениях');
      }
      
      // Confirm import
      const moodCount = Object.keys(data.moods).length;
      if (!confirm(`Импортировать ${moodCount} записей? Это заменит текущие данные.`)) {
        return false;
      }
      
      // Save data
      await StorageManager.saveData(data);
      
      // Refresh UI
      CalendarManager.render();
      StatsManager.renderStats('stats-section');
      
      UI.showToast(`Импортировано ${moodCount} записей!`, 'success');
      console.log('Import successful:', moodCount, 'entries');
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      UI.handleError(error, 'импорт данных');
      return false;
    }
  },
  
  // Share data via VK (if available)
  async shareViaVK() {
    if (!window.VKApi || !VKApi.initialized) {
      UI.showToast('Доступно только в приложении VK', 'info');
      return false;
    }
    
    try {
      const data = await StorageManager.loadData();
      const summary = this.getDataSummary(data);
      
      const message = `📅 Моя статистика настроений:\n${summary}`;
      
      await vkBridge.send('VKWebAppShowWallPostBox', {
        message: message
      });
      
      UI.showToast('Поделись статистикой!', 'success');
      return true;
    } catch (error) {
      console.error('VK share failed:', error);
      UI.showToast('Не удалось поделиться', 'error');
      return false;
    }
  },
  
  // Get data summary for sharing
  getDataSummary(data) {
    const moods = data.moods || {};
    const count = Object.keys(moods).length;
    
    if (count === 0) {
      return 'Пока нет записей';
    }
    
    // Count colors
    const colorCounts = {};
    for (const mood of Object.values(moods)) {
      const color = mood.color;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
    
    // Find most common
    let topColor = null;
    let topCount = 0;
    for (const [color, c] of Object.entries(colorCounts)) {
      if (c > topCount) {
        topCount = c;
        topColor = color;
      }
    }
    
    const allColors = ColorsManager.getAllColors();
    const colorInfo = allColors.find(c => c.hex === topColor);
    const colorName = colorInfo ? colorInfo.name : 'неизвестно';
    
    return `Всего записей: ${count}\nЧаще всего: ${colorName} (${topCount} раз)`;
  },
  
  // Render export UI
  renderExportUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Export container not found:', containerId);
      return;
    }
    
    // Create file input for import (hidden)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    fileInput.id = 'import-file-input';
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.importData(e.target.files[0]);
      }
    });
    document.body.appendChild(fileInput);
    
    // Create export section
    const section = document.createElement('div');
    section.className = 'export-section';
    section.innerHTML = `
      <h3>Данные</h3>
      <div class="export-buttons">
        <button id="btn-export" class="export-btn" title="Сохранить резервную копию">
          💾 Экспорт
        </button>
        <button id="btn-import" class="export-btn" title="Загрузить из файла">
          📥 Импорт
        </button>
        <button id="btn-share" class="export-btn" title="Поделиться в VK">
          📤 Поделиться
        </button>
      </div>
    `;
    
    // Add to container (after stats section)
    container.appendChild(section);
    
    // Add event listeners
    section.querySelector('#btn-export')?.addEventListener('click', () => {
      this.exportData();
    });
    
    section.querySelector('#btn-import')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });
    
    section.querySelector('#btn-share')?.addEventListener('click', () => {
      this.shareViaVK();
    });
    
    console.log('Export UI rendered');
  }
};

window.ExportManager = ExportManager;
console.log('📤 ExportManager ready');
