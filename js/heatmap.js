// Yearly heatmap for Mood Calendar

console.log('🔥 heatmap.js loading...');

const HeatmapManager = {
  currentYear: new Date().getFullYear(),

  async generateYearData(year) {
    const data = await StorageManager.loadData();
    const moods = data.moods || {};
    
    const yearData = {};
    
    for (let month = 0; month < 12; month++) {
      yearData[month] = {};
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        yearData[month][day] = moods[dateStr]?.color || null;
      }
    }
    
    return yearData;
  },

  renderHeatmap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Heatmap container not found:', containerId);
      return;
    }

    const section = document.createElement('div');
    section.className = 'heatmap-section';
    section.id = 'heatmap-container';
    
    section.innerHTML = `
      <h3>🔥 Годовая карта</h3>
      <div class="heatmap-nav">
        <button id="heatmap-prev-year" class="heatmap-nav-btn">←</button>
        <span class="heatmap-year" id="heatmap-year-display">${this.currentYear}</span>
        <button id="heatmap-next-year" class="heatmap-nav-btn">→</button>
      </div>
      <div class="heatmap-grid" id="heatmap-grid"></div>
      <div class="heatmap-legend">
        <span>Меньше</span>
        <div class="legend-colors">
          <div class="legend-item" style="background: #e0e0e0" title="Нет данных"></div>
          <div class="legend-item" style="background: #4CAF50" title="Отличное"></div>
          <div class="legend-item" style="background: #FFEB3B" title="Нейтральное"></div>
          <div class="legend-item" style="background: #F44336" title="Плохое"></div>
          <div class="legend-item" style="background: #2196F3" title="Грусть"></div>
          <div class="legend-item" style="background: #9C27B0" title="Вдохновение"></div>
          <div class="legend-item" style="background: #212121" title="Очень плохое"></div>
        </div>
        <span>Больше</span>
      </div>
    `;
    
    // Insert before stats section
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      statsSection.parentNode.insertBefore(section, statsSection);
    } else {
      container.appendChild(section);
    }
    
    // Add event listeners
    section.querySelector('#heatmap-prev-year')?.addEventListener('click', () => {
      this.currentYear--;
      this.refreshHeatmap();
    });
    
    section.querySelector('#heatmap-next-year')?.addEventListener('click', () => {
      this.currentYear++;
      this.refreshHeatmap();
    });
    
    this.refreshHeatmap();
    console.log('Heatmap rendered');
  },

  async refreshHeatmap() {
    const yearDisplay = document.getElementById('heatmap-year-display');
    const grid = document.getElementById('heatmap-grid');
    
    if (yearDisplay) yearDisplay.textContent = this.currentYear;
    if (!grid) return;
    
    const yearData = await this.generateYearData(this.currentYear);
    
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    const maxDays = 31;
    
    let html = '<div class="heatmap-months">';
    
    // Header with month names
    html += '<div class="heatmap-header"></div>'; // Empty corner
    for (let month = 0; month < 12; month++) {
      html += `<div class="heatmap-month-label">${months[month]}</div>`;
    }
    html += '</div>';
    
    // Days grid
    html += '<div class="heatmap-days">';
    for (let day = 1; day <= maxDays; day++) {
      html += `<div class="heatmap-day-row">`;
      html += `<div class="heatmap-day-label">${day}</div>`;
      
      for (let month = 0; month < 12; month++) {
        const color = yearData[month][day];
        const style = color ? `background-color: ${color}` : 'background-color: var(--bg-tertiary)';
        const hasData = color ? 'has-data' : '';
        const dateStr = `${this.currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        html += `<div class="heatmap-cell ${hasData}" data-date="${dateStr}" style="${style}" title="${dateStr}"></div>`;
      }
      
      html += '</div>';
    }
    html += '</div>';
    
    grid.innerHTML = html;
    
    // Add click handlers
    grid.querySelectorAll('.heatmap-cell.has-data').forEach(cell => {
      cell.addEventListener('click', () => {
        const date = cell.dataset.date;
        CalendarManager.goToDate(date);
        UI.showToast(`Перешли к ${date}`, 'success');
      });
    });
  }
};

window.HeatmapManager = HeatmapManager;
console.log('🔥 HeatmapManager ready');
