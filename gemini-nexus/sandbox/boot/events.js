
// sandbox/boot/events.js
import { sendToBackground } from '../../lib/messaging.js';
import { t } from '../core/i18n.js';

export function bindAppEvents(app, ui, setResizeRef) {
    // New Chat Buttons
    document.getElementById('new-chat-header-btn').addEventListener('click', () => app.handleNewChat());
    
    // Tab Switcher Button
    const tabSwitcherBtn = document.getElementById('tab-switcher-btn');
    if (tabSwitcherBtn) {
        tabSwitcherBtn.addEventListener('click', () => app.handleTabSwitcher());
    }
    
    // Open Full Page Button
    const openFullPageBtn = document.getElementById('open-full-page-btn');
    if (openFullPageBtn) {
        openFullPageBtn.addEventListener('click', () => {
            window.parent.postMessage({ action: 'OPEN_FULL_PAGE' }, '*');
        });
    }

    // Tools Row Navigation
    const toolsRow = document.getElementById('tools-row');
    const scrollLeftBtn = document.getElementById('tools-scroll-left');
    const scrollRightBtn = document.getElementById('tools-scroll-right');

    if (toolsRow && scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
            toolsRow.scrollBy({ left: -150, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            toolsRow.scrollBy({ left: 150, behavior: 'smooth' });
        });
    }

    // Tools
    
    // Browser Control (Functional Toggle)
    const browserControlBtn = document.getElementById('browser-control-btn');
    if (browserControlBtn) {
        browserControlBtn.addEventListener('click', () => {
            app.toggleBrowserControl();
            if (ui.inputFn) ui.inputFn.focus();
        });
    }

    document.getElementById('quote-btn').addEventListener('click', () => {
        sendToBackground({ action: "GET_ACTIVE_SELECTION" });
        if (ui.inputFn) ui.inputFn.focus();
    });

    document.getElementById('ocr-btn').addEventListener('click', () => {
        app.setCaptureMode('ocr');
        sendToBackground({ action: "INITIATE_CAPTURE", mode: 'ocr', source: 'sidepanel' });
        ui.updateStatus(t('selectOcr'));
    });
    
    document.getElementById('screenshot-translate-btn').addEventListener('click', () => {
        app.setCaptureMode('screenshot_translate');
        sendToBackground({ action: "INITIATE_CAPTURE", mode: 'screenshot_translate', source: 'sidepanel' });
        ui.updateStatus(t('selectTranslate'));
    });

    document.getElementById('snip-btn').addEventListener('click', () => {
        app.setCaptureMode('snip');
        sendToBackground({ action: "INITIATE_CAPTURE", mode: 'snip', source: 'sidepanel' });
        ui.updateStatus(t('selectSnip'));
    });

    // Page Context Toggle
    const contextBtn = document.getElementById('page-context-btn');
    if (contextBtn) {
        contextBtn.addEventListener('click', () => {
            app.togglePageContext();
            if (ui.inputFn) ui.inputFn.focus();
        });
    }

    // Model Selector (Custom Dropdown)
    const modelDropdown = document.getElementById('model-dropdown');
    const modelTrigger = document.getElementById('model-dropdown-trigger');
    const modelMenu = document.getElementById('model-dropdown-menu');

    const toggleModelDropdown = (forceClose = false) => {
        if (!modelDropdown) return;
        if (forceClose) {
            modelDropdown.classList.remove('open');
        } else {
            modelDropdown.classList.toggle('open');
        }
    };

    const selectModelItem = (value) => {
        if (!modelDropdown || !modelMenu) return;
        const items = modelMenu.querySelectorAll('.settings-dropdown-item');
        const triggerText = modelTrigger ? modelTrigger.querySelector('.dropdown-text') : null;

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
        toggleModelDropdown(true);
    };

    const getSelectedModel = () => {
        if (!modelMenu) return null;
        const selected = modelMenu.querySelector('.settings-dropdown-item.selected');
        return selected ? selected.dataset.value : null;
    };

    const cycleModel = (direction) => {
        if (!modelMenu) return;
        const items = Array.from(modelMenu.querySelectorAll('.settings-dropdown-item'));
        if (items.length === 0) return;

        let currentIndex = items.findIndex(item => item.classList.contains('selected'));
        if (currentIndex === -1) currentIndex = 0;

        const newIndex = (currentIndex + direction + items.length) % items.length;
        const newValue = items[newIndex].dataset.value;
        selectModelItem(newValue);
        app.handleModelChange(newValue);
    };

    if (setResizeRef) setResizeRef(() => {}); // No-op for compatibility

    if (modelTrigger) {
        modelTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleModelDropdown();
        });
    }

    if (modelMenu) {
        modelMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.settings-dropdown-item');
            if (item) {
                const value = item.dataset.value;
                selectModelItem(value);
                app.handleModelChange(value);
            }
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (modelDropdown && !modelDropdown.contains(e.target)) {
            toggleModelDropdown(true);
        }
    });

    // Input Key Handling
    const inputFn = document.getElementById('prompt');
    const sendBtn = document.getElementById('send');

    if (inputFn && sendBtn) {
        inputFn.addEventListener('keydown', (e) => {
            // Tab Cycle Models
            if (e.key === 'Tab') {
                e.preventDefault();
                const direction = e.shiftKey ? -1 : 1;
                cycleModel(direction);
                return;
            }

            if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                e.preventDefault();
                sendBtn.click();
            }
        });

        sendBtn.addEventListener('click', () => {
            if (app.isGenerating) {
                app.handleCancel();
            } else {
                app.handleSendMessage();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            if(inputFn) inputFn.focus();
        }
    });
}
