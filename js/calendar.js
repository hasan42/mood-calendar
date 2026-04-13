// Calendar logic for Mood Calendar

console.log('📅 calendar.js loading...');

const CalendarManager = {
  currentDate: new Date(),
  selectedDate: null,
  selectedColor: null,
  hasMoods: false,

  init() {
    console.log('CalendarManager.init() called');
    this.render();
    this.setupEventListeners();
    this.checkForEmptyState();
    console.log('CalendarManager initialized');
  },

  render() {
    console.log('CalendarManager.render() called');
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    console.log('Rendering calendar for:', year, month + 1);

    // Update header
    const monthNameEl = document.getElementById('month-name');
    const yearEl = document.getElementById('year');
    
    if (monthNameEl) {
      monthNameEl.textContent = this.currentDate.toLocaleDateString('ru-RU', { month: 'long' });
    }
    if (yearEl) {
      yearEl.textContent = year;
    }

    // Render calendar
    this.renderCalendarGrid(year, month);
  },

  renderCalendarGrid(year, month) {
    console.log('renderCalendarGrid called for:', year, month);
    const calendar = document.getElementById('calendar');
    if (!calendar) {
      console.error('ERROR: #calendar element not found!');
      return;
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();

    // Adjust for Russian week (Monday start)
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // Weekday headers
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    let html = `
      <div class="calendar-weekdays">
        ${weekdays.map(d => `<div class="weekday">${d}</div>`).join('')}
      </div>
      <div class="calendar-grid">
    `;

    // Empty cells for days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      html += `<div class="calendar-day other-month"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = isCurrentMonth && day === today.getDate();
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''}" data-date="${dateStr}">
          <span class="day-number">${day}</span>
          <div class="mood-indicator" id="mood-${dateStr}"></div>
        </div>
      `;
    }

    html += '</div>';
    calendar.innerHTML = html;
    console.log('Calendar HTML generated, length:', html.length);

    // Load moods for this month
    this.loadMonthMoods(year, month);
  },

  async loadMonthMoods(year, month) {
    try {
      const moods = await StorageManager.getMoodsForMonth(year, month);
      console.log('Loaded moods for month:', Object.keys(moods).length);
      
      let hasAnyMoods = false;
      
      for (const [date, mood] of Object.entries(moods)) {
        const indicator = document.getElementById(`mood-${date}`);
        if (indicator) {
          indicator.style.backgroundColor = mood.color;
          hasAnyMoods = true;
        }
      }
      
      this.hasMoods = hasAnyMoods;
    } catch (error) {
      console.error('Failed to load month moods:', error);
    }
  },

  async checkForEmptyState() {
    console.log('checkForEmptyState called');
    try {
      const data = await StorageManager.loadData();
      this.hasMoods = Object.keys(data.moods || {}).length > 0;
      
      if (!this.hasMoods) {
        this.showEmptyState();
      }
    } catch (error) {
      console.warn('Could not check empty state:', error);
    }
  },

  showEmptyState() {
    console.log('showEmptyState called');
    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      statsSection.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎨</div>
          <h3>Добро пожаловать!</h3>
          <p>Выберите день в календаре и отметьте своё настроение.<br>Начните отслеживать свои эмоции прямо сейчас!</p>
        </div>
      `;
    }
  },

  setupEventListeners() {
    console.log('setupEventListeners called');
    
    // Previous month
    const prevBtn = document.getElementById('prev-month');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        console.log('Prev month clicked');
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    } else {
      console.warn('prev-month button not found');
    }

    // Next month
    const nextBtn = document.getElementById('next-month');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        console.log('Next month clicked');
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    } else {
      console.warn('next-month button not found');
    }

    // Today button
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        console.log('Today button clicked');
        this.goToToday();
      });
    }

    // Day click - delegated
    const calendar = document.getElementById('calendar');
    if (calendar) {
      calendar.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day');
        if (!dayEl || !dayEl.dataset.date) return;

        const date = dayEl.dataset.date;
        console.log('Day clicked:', date);
        this.selectDay(date, dayEl);
      });
    } else {
      console.error('Calendar element not found for event delegation');
    }
  },

  async selectDay(date, element) {
    console.log('selectDay called for:', date);
    
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
      el.classList.remove('selected');
    });

    // Select new
    element.classList.add('selected');
    this.selectedDate = date;

    // Load existing mood
    try {
      const mood = await StorageManager.getMood(date);
      if (mood) {
        this.selectedColor = mood.color;
      } else {
        this.selectedColor = null;
      }
    } catch (error) {
      console.warn('Could not load mood:', error);
      this.selectedColor = null;
    }

    // Show color picker
    this.showColorPickerForDay(date);
  },

  showColorPickerForDay(date) {
    console.log('showColorPickerForDay called for:', date);
    ColorsManager.renderColorPicker('color-picker', async (color) => {
      try {
        if (color === null) {
          // Delete mood
          console.log('Deleting mood for date:', date);
          await StorageManager.removeMood(date);
          this.selectedColor = null;
          
          // Update indicator
          const indicator = document.querySelector(`#mood-${date}`);
          if (indicator) {
            indicator.style.backgroundColor = '';
          }
          
          UI.showToast('Настроение удалено', 'success');
          return;
        }
        
        console.log('Saving color:', color, 'for date:', date);
        await StorageManager.setMood(date, color);
        this.selectedColor = color;
        
        // Update indicator
        const indicator = document.querySelector(`#mood-${date}`);
        if (indicator) {
          indicator.style.backgroundColor = color;
        }

        // Update data
        const data = await StorageManager.loadData();
        await StorageManager.saveData(data);
        
        // Hide empty state if it was shown
        if (!this.hasMoods) {
          this.hasMoods = true;
          StatsManager.renderStats('stats-section');
        }
        
        UI.showToast('Настроение сохранено!', 'success');
      } catch (error) {
        console.error('Error saving mood:', error);
        UI.handleError(error, 'сохранение настроения');
      }
    }, this.selectedColor);
  },

  goToToday() {
    this.currentDate = new Date();
    this.render();
  },

  goToDate(dateString) {
    this.currentDate = new Date(dateString);
    this.render();
  }
};

window.CalendarManager = CalendarManager;
console.log('📅 CalendarManager ready');
