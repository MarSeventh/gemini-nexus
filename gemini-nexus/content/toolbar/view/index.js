
// content/toolbar/view/index.js
(function() {
    /**
     * Main View Facade
     * Orchestrates WidgetView and WindowView
     */
    class ToolbarView {
        constructor(shadowRoot) {
            this.shadow = shadowRoot;
            this.elements = {};
            this.cacheElements();
            
            // Initialize Sub-Views
            this.widgetView = new window.GeminiViewWidget(this.elements);
            this.windowView = new window.GeminiViewWindow(this.elements);
        }

        cacheElements() {
            const get = (id) => this.shadow.getElementById(id);
            this.elements = {
                toolbar: get('toolbar'),
                toolbarDrag: get('toolbar-drag'),
                imageBtn: get('image-btn'),
                
                // New Window Elements
                askWindow: get('ask-window'),
                askHeader: get('ask-header'),
                windowTitle: get('window-title'),
                contextPreview: get('context-preview'),
                askInput: get('ask-input'),
                resultArea: get('result-area'),
                resultText: get('result-text'),
                askModelSelect: get('ask-model-select'),

                // Model Dropdown Elements
                modelDropdown: get('model-dropdown'),
                modelDropdownTrigger: get('model-dropdown-trigger'),
                modelDropdownMenu: get('model-dropdown-menu'),
                
                // Footer Elements
                windowFooter: get('window-footer'),
                footerActions: get('footer-actions'),
                footerStop: get('footer-stop'),
                
                // Buttons
                buttons: {
                    copySelection: get('btn-copy'),
                    ask: get('btn-ask'),
                    grammar: get('btn-grammar'),
                    translate: get('btn-translate'),
                    explain: get('btn-explain'),
                    summarize: get('btn-summarize'),
                    headerClose: get('btn-header-close'),
                    stop: get('btn-stop-gen'),
                    continue: get('btn-continue-chat'),
                    copy: get('btn-copy-result'),
                    retry: get('btn-retry'),
                    insert: get('btn-insert'),
                    replace: get('btn-replace'),
                    
                    // Image Menu Buttons
                    imageChat: get('btn-image-chat'),
                    imageDescribe: get('btn-image-describe'),
                    imageExtract: get('btn-image-extract'),
                    
                    // Image Edit Buttons
                    imageRemoveBg: get('btn-image-remove-bg'),
                    imageRemoveText: get('btn-image-remove-text'),
                    imageRemoveWatermark: get('btn-image-remove-watermark'),
                    imageUpscale: get('btn-image-upscale'),
                    imageExpand: get('btn-image-expand')
                }
            };
        }

        // --- Delegation to Widget View ---

        showToolbar(rect, mousePoint) { this.widgetView.showToolbar(rect, mousePoint); }
        hideToolbar() { this.widgetView.hideToolbar(); }
        showImageButton(rect) { this.widgetView.showImageButton(rect); }
        hideImageButton() { this.widgetView.hideImageButton(); }
        isToolbarVisible() { return this.widgetView.isToolbarVisible(); }
        toggleCopySelectionIcon(success) { this.widgetView.toggleCopySelectionIcon(success); }

        // --- Delegation to Window View ---

        get isPinned() { return this.windowView.isPinned; }
        get isDocked() { return this.windowView.isDocked; }
        
        togglePin() { return this.windowView.togglePin(); }
        showAskWindow(rect, contextText, title, resetDrag, mousePoint) { return this.windowView.show(rect, contextText, title, resetDrag, mousePoint); }
        hideAskWindow() { this.windowView.hide(); }
        showLoading(msg) { this.windowView.showLoading(msg); }
        
        // Pass optional isHtml flag
        showResult(text, title, isStreaming, isHtml = false) { 
            this.windowView.showResult(text, title, isStreaming, isHtml); 
        }
        
        updateStreamingState(isStreaming) { this.windowView.updateStreamingState(isStreaming); }

        showError(text) { this.windowView.showError(text); }
        toggleCopyIcon(success) { this.windowView.toggleCopyIcon(success); }
        setInputValue(text) { this.windowView.setInputValue(text); }
        isWindowVisible() { return this.windowView.isVisible(); }

        dockWindow(side, top) { this.windowView.dockWindow(side, top); }
        undockWindow() { this.windowView.undockWindow(); }

        // --- Model Selection ---

        getSelectedModel() {
            const dropdown = this.elements.modelDropdown;
            if (dropdown) {
                const selected = dropdown.querySelector('.model-dropdown-item.selected');
                return selected ? selected.dataset.value : "gemini-2.5-flash";
            }
            return "gemini-2.5-flash";
        }


        setSelectedModel(model) {
            const dropdown = this.elements.modelDropdown;
            if (!dropdown || !model) return;

            const items = dropdown.querySelectorAll('.model-dropdown-item');
            const trigger = dropdown.querySelector('.model-dropdown-text');

            items.forEach(item => {
                if (item.dataset.value === model) {
                    item.classList.add('selected');
                    if (trigger) {
                        trigger.textContent = item.querySelector('span:last-child').textContent;
                    }
                } else {
                    item.classList.remove('selected');
                }
            });
        }


        updateModelOptions(options, selectedValue) {
            const dropdown = this.elements.modelDropdown;
            const menu = this.elements.modelDropdownMenu;
            const trigger = dropdown ? dropdown.querySelector('.model-dropdown-text') : null;
            if (!menu) return;

            menu.innerHTML = '';

            options.forEach((o, index) => {
                const item = document.createElement('div');
                item.className = 'model-dropdown-item';
                item.dataset.value = o.val;

                const isSelected = selectedValue ? o.val === selectedValue : index === 0;
                if (isSelected) {
                    item.classList.add('selected');
                    if (trigger) trigger.textContent = o.txt;
                }

                item.innerHTML = `
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span>${o.txt}</span>
                `;
                menu.appendChild(item);
            });
        }

        toggleModelDropdown(forceClose = false) {
            const dropdown = this.elements.modelDropdown;
            if (!dropdown) return;

            if (forceClose) {
                dropdown.classList.remove('open');
            } else {
                dropdown.classList.toggle('open');
            }
        }

        selectModelItem(value) {
            const dropdown = this.elements.modelDropdown;
            if (!dropdown) return;

            const items = dropdown.querySelectorAll('.model-dropdown-item');
            const trigger = dropdown.querySelector('.model-dropdown-text');

            items.forEach(item => {
                if (item.dataset.value === value) {
                    item.classList.add('selected');
                    if (trigger) {
                        trigger.textContent = item.querySelector('span:last-child').textContent;
                    }
                } else {
                    item.classList.remove('selected');
                }
            });

            this.toggleModelDropdown(true);
        }


        // --- General ---

        isHost(target, host) {
            return target === host || this.windowView.isHost(target);
        }
    }

    window.GeminiToolbarView = ToolbarView;
})();
