// Colors management for Mood Calendar

console.log('🎨 colors.js loading...');

const PRESET_COLORS = [
  { id: 'green', hex: '#22c55e', gradient: 'var(--mood-green)', name: 'Отличное', emoji: '🟢' },
  { id: 'yellow', hex: '#eab308', gradient: 'var(--mood-yellow)', name: 'Нейтральное', emoji: '🟡' },
  { id: 'red', hex: '#dc2626', gradient: 'var(--mood-red)', name: 'Плохое', emoji: '🔴' },
  { id: 'blue', hex: '#3b82f6', gradient: 'var(--mood-blue)', name: 'Грусть', emoji: '🔵' },
  { id: 'purple', hex: '#9333ea', gradient: 'var(--mood-purple)', name: 'Вдохновение', emoji: '🟣' },
  { id: 'black', hex: '#1f2937', gradient: 'var(--mood-black)', name: 'Очень плохое', emoji: '⚫' }
];

const ColorsManager = {
  customColors: [],

  init() {
    console.log('ColorsManager.init() called');
    this.loadCustomColors();
    console.log('ColorsManager initialized');
  },

  getAllColors() {
    return [...PRESET_COLORS, ...this.customColors];
  },

  getPresetColors() {
    return PRESET_COLORS;
  },

  addCustomColor(hex, name, description) {
    const newColor = {
      id: 'custom_' + Date.now(),
      hex,
      name,
      description,
      isCustom: true
    };
    this.customColors.push(newColor);
    this.saveCustomColors();
    console.log('Custom color added:', name, hex);
    return newColor;
  },

  removeCustomColor(id) {
    this.customColors = this.customColors.filter(c => c.id !== id);
    this.saveCustomColors();
    console.log('Custom color removed:', id);
  },

  saveCustomColors() {
    localStorage.setItem('mood-calendar-custom-colors', JSON.stringify(this.customColors));
  },

  loadCustomColors() {
    const saved = localStorage.getItem('mood-calendar-custom-colors');
    if (saved) {
      try {
        this.customColors = JSON.parse(saved);
        console.log('Loaded custom colors:', this.customColors.length);
      } catch (e) {
        console.error('Failed to load custom colors:', e);
        this.customColors = [];
      }
    }
  },

  renderColorPicker(containerId, onSelect, selectedColor = null) {
    console.log('renderColorPicker called for container:', containerId);
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    const colors = this.getAllColors();
    const isEdit = selectedColor !== null;
    
    container.innerHTML = `
      <h3>${isEdit ? 'Изменить настроение:' : 'Выберите настроение:'}</h3>
      <div class="colors-grid" id="colors-grid-inner">
        ${colors.map(color => `
          <div 
            class="color-option ${selectedColor === color.hex ? 'selected' : ''}" 
            style="background: ${color.gradient || color.hex}"
            data-color="${color.hex}"
            title="${color.name}"
          >
            ${color.emoji || ''}
          </div>
        `).join('')}
        <div class="color-option add-custom" id="add-custom-color" title="Добавить свой цвет">
          +
        </div>
      </div>
      ${isEdit ? `
        <div class="color-actions">
          <button class="delete-mood-btn" id="delete-mood-btn">❌ Удалить</button>
        </div>
      ` : ''}
    `;

    // Add click handlers
    container.querySelectorAll('.color-option:not(.add-custom)').forEach(el => {
      el.addEventListener('click', () => {
        const color = el.dataset.color;
        console.log('Color clicked:', color);
        onSelect(color);
        
        container.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
        el.classList.add('selected');
      });
    });

    const addBtn = container.querySelector('#add-custom-color');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showAddCustomColorDialog();
      });
    }

    // Add delete button handler
    const deleteBtn = container.querySelector('#delete-mood-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        onSelect(null); // null means delete
      });
    }
    
    console.log('Color picker rendered');
  },

  showAddCustomColorDialog() {
    const hex = prompt('Введите цвет в формате HEX (например, #FF9800):');
    if (!hex) return;
    
    const name = prompt('Название цвета:');
    if (!name) return;
    
    const description = prompt('Описание (необязательно):') || '';
    
    this.addCustomColor(hex, name, description);
    alert(`Цвет "${name}" добавлен!`);
  }
};

window.ColorsManager = ColorsManager;
console.log('🎨 ColorsManager ready');
