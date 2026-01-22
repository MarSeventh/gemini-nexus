
// sandbox/ui/settings/sections/appearance.js

export class AppearanceSection {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.elements = {};
        this.queryElements();
        this.bindEvents();
    }

    queryElements() {
        const get = (id) => document.getElementById(id);
        this.elements = {
            themeSelect: get('theme-select'),
            languageSelect: get('language-select'),
            // Custom dropdown elements
            themeDropdown: get('theme-dropdown'),
            themeTrigger: get('theme-dropdown-trigger'),
            themeMenu: get('theme-dropdown-menu'),
            languageDropdown: get('language-dropdown'),
            languageTrigger: get('language-dropdown-trigger'),
            languageMenu: get('language-dropdown-menu')
        };
    }

    bindEvents() {
        const { themeDropdown, themeTrigger, themeMenu, languageDropdown, languageTrigger, languageMenu } = this.elements;

        // Theme dropdown events
        if (themeTrigger) {
            themeTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('theme');
            });
        }

        if (themeMenu) {
            themeMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    const value = item.dataset.value;
                    this._selectDropdownItem('theme', value);
                    this.applyVisualTheme(value);
                    this.fire('onThemeChange', value);
                }
            });
        }

        // Language dropdown events
        if (languageTrigger) {
            languageTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('language');
            });
        }

        if (languageMenu) {
            languageMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    const value = item.dataset.value;
                    this._selectDropdownItem('language', value);
                    this.fire('onLanguageChange', value);
                }
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (themeDropdown && !themeDropdown.contains(e.target)) {
                this._toggleDropdown('theme', true);
            }
            if (languageDropdown && !languageDropdown.contains(e.target)) {
                this._toggleDropdown('language', true);
            }
        });

        // System Theme Listener
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            const currentTheme = this._getDropdownValue('theme');
            if (currentTheme === 'system') {
                this.applyVisualTheme('system');
            }
        });
    }

    _toggleDropdown(type, forceClose = false) {
        const dropdown = type === 'theme' ? this.elements.themeDropdown : this.elements.languageDropdown;
        if (!dropdown) return;

        if (forceClose) {
            dropdown.classList.remove('open');
        } else {
            dropdown.classList.toggle('open');
        }
    }

    _selectDropdownItem(type, value) {
        const dropdown = type === 'theme' ? this.elements.themeDropdown : this.elements.languageDropdown;
        const trigger = type === 'theme' ? this.elements.themeTrigger : this.elements.languageTrigger;
        const menu = type === 'theme' ? this.elements.themeMenu : this.elements.languageMenu;

        if (!dropdown || !menu) return;

        const items = menu.querySelectorAll('.settings-dropdown-item');
        const triggerText = trigger ? trigger.querySelector('.dropdown-text') : null;

        items.forEach(item => {
            if (item.dataset.value === value) {
                item.classList.add('selected');
                if (triggerText) {
                    triggerText.textContent = item.querySelector('.item-text').textContent;
                }
            } else {
                item.classList.remove('selected');
            }
        });

        this._toggleDropdown(type, true);
    }

    _getDropdownValue(type) {
        const menu = type === 'theme' ? this.elements.themeMenu : this.elements.languageMenu;
        if (!menu) return null;
        const selected = menu.querySelector('.settings-dropdown-item.selected');
        return selected ? selected.dataset.value : null;
    }

    setTheme(theme) {
        this._selectDropdownItem('theme', theme);
        this.applyVisualTheme(theme);
    }

    setLanguage(lang) {
        this._selectDropdownItem('language', lang);
    }

    applyVisualTheme(theme) {
        let applied = theme;
        if (theme === 'system') {
             applied = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', applied);
    }

    fire(event, data) {
        if (this.callbacks[event]) this.callbacks[event](data);
    }
}
