// Statistics and analytics for Mood Calendar

console.log('📊 stats.js loading...');

const StatsManager = {
  async getStatsForPeriod(startDate, endDate) {
    const data = await StorageManager.loadData();
    const moods = data.moods || {};
    
    const stats = {
      totalDays: 0,
      colorCounts: {},
      moodHistory: []
    };
    
    for (const [date, mood] of Object.entries(moods)) {
      if (date >= startDate && date <= endDate) {
        stats.totalDays++;
        stats.moodHistory.push({ date, ...mood });
        
        const color = mood.color;
        stats.colorCounts[color] = (stats.colorCounts[color] || 0) + 1;
      }
    }
    
    stats.colorPercentages = {};
    if (stats.totalDays > 0) {
      for (const [color, count] of Object.entries(stats.colorCounts)) {
        stats.colorPercentages[color] = Math.round((count / stats.totalDays) * 100);
      }
    }
    
    return stats;
  },

  async getMonthlyStats(year, month) {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    return this.getStatsForPeriod(startDate, endDate);
  },

  async getYearlyStats(year) {
    return this.getStatsForPeriod(`${year}-01-01`, `${year}-12-31`);
  },

  renderStats(containerId) {
    console.log('renderStats called for container:', containerId);
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Stats container not found:', containerId);
      return;
    }

    container.innerHTML = `
      <div class="stats-section">
        <h3>Статистика</h3>
        <div class="stats-placeholder">
          <p>📊 Здесь будет отображаться статистика ваших настроений</p>
          <p>Выберите период для просмотра:</p>
          <button id="stats-month" class="stats-btn">Этот месяц</button>
          <button id="stats-year" class="stats-btn">Этот год</button>
        </div>
        <div id="stats-content" class="stats-content"></div>
      </div>
    `;

    container.querySelector('#stats-month')?.addEventListener('click', () => {
      this.showMonthlyStats();
    });

    container.querySelector('#stats-year')?.addEventListener('click', () => {
      this.showYearlyStats();
    });
    
    console.log('Stats rendered');
  },

  async showMonthlyStats() {
    const now = new Date();
    const stats = await this.getMonthlyStats(now.getFullYear(), now.getMonth());
    this.displayStats(stats, 'Этот месяц');
  },

  async showYearlyStats() {
    const now = new Date();
    const stats = await this.getYearlyStats(now.getFullYear());
    this.displayStats(stats, `Год ${now.getFullYear()}`);
  },

  displayStats(stats, title) {
    const content = document.getElementById('stats-content');
    if (!content) return;

    if (stats.totalDays === 0) {
      content.innerHTML = `<p class="no-data">Нет данных за выбранный период</p>`;
      return;
    }

    const colorBars = Object.entries(stats.colorCounts)
      .map(([color, count]) => `
        <div class="color-bar">
          <div class="color-swatch" style="background-color: ${color}"></div>
          <div class="color-count">${count} дней</div>
          <div class="color-percent">${stats.colorPercentages[color]}%</div>
        </div>
      `).join('');

    content.innerHTML = `
      <div class="stats-result">
        <h4>${title}</h4>
        <div class="stats-summary">
          <p>Всего дней с записями: <strong>${stats.totalDays}</strong></p>
        </div>
        <div class="color-distribution">
          <h5>Распределение настроений:</h5>
          ${colorBars}
        </div>
      </div>
    `;
  }
};

window.StatsManager = StatsManager;
console.log('📊 StatsManager ready');
