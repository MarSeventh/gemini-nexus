
// sandbox/ui/ui_controller.js
import { ChatController } from './chat.js';
import { SidebarController } from './sidebar.js';
import { SettingsController } from './settings.js';
import { ViewerController } from './viewer.js';
import { TabSelectorController } from './tab_selector.js';

export class UIController {
    constructor(elements) {
        // Initialize Sub-Controllers
        this.chat = new ChatController(elements);
        
        this.sidebar = new SidebarController(elements, {
            onOverlayClick: () => this.settings.close()
        });
        
        // Settings and Viewer now self-manage their DOM
        this.settings = new SettingsController({
            onOpen: () => this.sidebar.close(),
            onSettingsChanged: (connectionSettings) => {
                this.updateModelList(connectionSettings);
            }
        });
        
        this.viewer = new ViewerController();
        
        this.tabSelector = new TabSelectorController();

        // Properties exposed for external use (AppController/MessageHandler)
        this.inputFn = this.chat.inputFn;
        this.historyDiv = this.chat.historyDiv;
        this.sendBtn = this.chat.sendBtn;
        this.modelSelect = elements.modelSelect;
        this.tabSwitcherBtn = document.getElementById('tab-switcher-btn');

        // Initialize Layout Detection
        this.checkLayout();
        window.addEventListener('resize', () => this.checkLayout());
    }

    checkLayout() {
        // Threshold for Wide Mode (e.g. Full Page Tab or large side panel)
        const isWide = window.innerWidth > 800;
        if (isWide) {
            document.body.classList.add('layout-wide');
        } else {
            document.body.classList.remove('layout-wide');
        }
    }

    // --- DynamicModel List ---

    updateModelList(settings) {
        // Get custom dropdown elements
        const modelMenu = document.getElementById('model-dropdown-menu');
        const modelTrigger = document.getElementById('model-dropdown-trigger');

        if (!modelMenu) return;

        // Get current selection before updating
        const selectedItem = modelMenu.querySelector('.settings-dropdown-item.selected');
        const current = selectedItem ? selectedItem.dataset.value : null;

        // Determine provider. Fallback to 'web' if not set.
        // Legacy support: if provider missing but useOfficialApi is true, assume 'official'.
        const provider = settings.provider || (settings.useOfficialApi ? 'official' : 'web');

        let opts = [];
        if (provider === 'official') {
            // Official API Models
            opts = [
                { val: 'gemini-3-flash-preview', txt: 'Gemini 3 Flash' },
                { val: 'gemini-3-pro-preview', txt: 'Gemini 3 Pro' }
            ];
        } else if (provider === 'openai') {
            // OpenAI Compatible: Support multiple models comma-separated
            const rawModels = settings.openaiModel || "";
            // Split by comma, trim whitespace, remove empty entries
            const models = rawModels.split(',').map(m => m.trim()).filter(m => m);

            if (models.length === 0) {
                opts = [{ val: 'openai_custom', txt: 'Custom Model' }];
            } else {
                opts = models.map(m => ({ val: m, txt: m }));
            }
        } else {
            // Web Client Models
            opts = [
                { val: 'gemini-3-flash', txt: 'Fast' },
                { val: 'gemini-3-flash-thinking', txt: 'Thinking' },
                { val: 'gemini-3-pro', txt: '3 Pro' }
            ];
        }

        // Clear and rebuild the custom dropdown menu
        modelMenu.innerHTML = '';

        opts.forEach(o => {
            const item = document.createElement('div');
            item.className = 'settings-dropdown-item';
            item.dataset.value = o.val;
            item.innerHTML = `
                <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                <span class="item-text">${o.txt}</span>
            `;
            modelMenu.appendChild(item);
        });

        // Restore selection if valid, else default to first option
        const match = opts.find(o => o.val === current);
        const selectedValue = match ? current : (opts.length > 0 ? opts[0].val : null);

        if (selectedValue) {
            this._selectModelDropdownItem(selectedValue, modelMenu, modelTrigger);
        }

        // Also update legacy hidden select for compatibility
        if (this.modelSelect) {
            this.modelSelect.innerHTML = '';
            opts.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.val;
                opt.textContent = o.txt;
                this.modelSelect.appendChild(opt);
            });
            if (selectedValue) {
                this.modelSelect.value = selectedValue;
            }
        }
    }

    _selectModelDropdownItem(value, menu, trigger) {
        if (!menu) return;

        const items = menu.querySelectorAll('.settings-dropdown-item');
        const triggerText = trigger ? trigger.querySelector('.dropdown-text') : null;

        items.forEach(item => {
            if (item.dataset.value === value) {
                item.classList.add('selected');
                if (triggerText) {
                    const textEl = item.querySelector('.item-text');
                    if (textEl) triggerText.textContent = textEl.textContent;
                }
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // --- Delegation Methods ---

    // Chat / Input
    updateStatus(text) { this.chat.updateStatus(text); }
    clearChatHistory() { this.chat.clear(); }
    scrollToBottom() { this.chat.scrollToBottom(); }
    resetInput() { this.chat.resetInput(); }
    setLoading(isLoading) { this.chat.setLoading(isLoading); }
    
    // Sidebar
    toggleSidebar() { this.sidebar.toggle(); }
    closeSidebar() { this.sidebar.close(); }
    renderHistoryList(sessions, currentId, callbacks) {
        this.sidebar.renderList(sessions, currentId, callbacks);
    }

    // Settings
    updateShortcuts(payload) { this.settings.updateShortcuts(payload); }
    updateTheme(theme) { this.settings.updateTheme(theme); }
    updateLanguage(lang) { this.settings.updateLanguage(lang); }
    
    // Tab Selector
    openTabSelector(tabs, onSelect, lockedTabId) {
        this.tabSelector.open(tabs, onSelect, lockedTabId);
    }
    
    toggleTabSwitcher(show) {
        if (this.tabSwitcherBtn) {
            this.tabSwitcherBtn.style.display = show ? 'flex' : 'none';
        }
    }
}