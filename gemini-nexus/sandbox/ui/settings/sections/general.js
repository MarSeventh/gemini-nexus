
// sandbox/ui/settings/sections/general.js

export class GeneralSection {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.modelOptions = [];
        this.elements = {};
        this.queryElements();
        this.bindEvents();
    }

    queryElements() {
        const get = (id) => document.getElementById(id);
        this.elements = {
            textSelectionToggle: get('text-selection-toggle'),
            imageToolsToggle: get('image-tools-toggle'),
            accountIndicesInput: get('account-indices-input'),
            quickActionModelSelect: get('quick-action-model-select'),
            // Custom dropdown elements
            modelDropdown: get('quick-action-model-dropdown'),
            modelTrigger: get('quick-action-model-trigger'),
            modelMenu: get('quick-action-model-menu'),
            sidebarRadios: document.querySelectorAll('input[name="sidebar-behavior"]')
        };
    }

    bindEvents() {
        const { textSelectionToggle, imageToolsToggle, modelDropdown, modelTrigger, modelMenu, sidebarRadios } = this.elements;

        if (textSelectionToggle) {
            textSelectionToggle.addEventListener('change', (e) => this.fire('onTextSelectionChange', e.target.checked));
        }
        if (imageToolsToggle) {
            imageToolsToggle.addEventListener('change', (e) => this.fire('onImageToolsChange', e.target.checked));
        }
        if (sidebarRadios) {
            sidebarRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if(e.target.checked) this.fire('onSidebarBehaviorChange', e.target.value);
                });
            });
        }

        // Custom dropdown events
        if (modelTrigger) {
            modelTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        if (modelMenu) {
            modelMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    this.selectDropdownItem(item.dataset.value);
                    this.fire('onQuickActionModelChange', item.dataset.value);
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (modelDropdown && !modelDropdown.contains(e.target)) {
                this.toggleDropdown(true);
            }
        });
    }

    toggleDropdown(forceClose = false) {
        const { modelDropdown } = this.elements;
        if (!modelDropdown) return;

        if (forceClose) {
            modelDropdown.classList.remove('open');
        } else {
            modelDropdown.classList.toggle('open');
        }
    }

    selectDropdownItem(value) {
        const { modelDropdown, modelTrigger, modelMenu } = this.elements;
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

        this.toggleDropdown(true);
    }

    setToggles(textSelection, imageTools) {
        if (this.elements.textSelectionToggle) this.elements.textSelectionToggle.checked = textSelection;
        if (this.elements.imageToolsToggle) this.elements.imageToolsToggle.checked = imageTools;
    }

    setAccountIndices(val) {
        if (this.elements.accountIndicesInput) this.elements.accountIndicesInput.value = val || "0";
    }

    setSidebarBehavior(behavior) {
        if (this.elements.sidebarRadios) {
            const val = behavior || 'auto';
            this.elements.sidebarRadios.forEach(radio => {
                radio.checked = (radio.value === val);
            });
        }
    }

    setModelOptions(options, selectedValue) {
        this.modelOptions = Array.isArray(options) ? options : [];
        const { modelMenu, modelTrigger } = this.elements;
        if (!modelMenu) return;

        const triggerText = modelTrigger ? modelTrigger.querySelector('.dropdown-text') : null;
        modelMenu.innerHTML = '';

        this.modelOptions.forEach((o, index) => {
            const item = document.createElement('div');
            item.className = 'settings-dropdown-item';
            item.dataset.value = o.val;

            const isSelected = selectedValue ? o.val === selectedValue : index === 0;
            if (isSelected) {
                item.classList.add('selected');
                if (triggerText) triggerText.textContent = o.txt;
            }

            item.innerHTML = `
                <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                <span class="item-text">${o.txt}</span>
            `;
            modelMenu.appendChild(item);
        });
    }

    setQuickActionModel(model) {
        if (model) {
            this.selectDropdownItem(model);
        }
    }

    getData() {
        const { textSelectionToggle, imageToolsToggle, accountIndicesInput, modelMenu } = this.elements;

        // Get selected model from custom dropdown
        let quickActionModel = null;
        if (modelMenu) {
            const selected = modelMenu.querySelector('.settings-dropdown-item.selected');
            quickActionModel = selected ? selected.dataset.value : null;
        }

        return {
            textSelection: textSelectionToggle ? textSelectionToggle.checked : true,
            imageTools: imageToolsToggle ? imageToolsToggle.checked : true,
            accountIndices: accountIndicesInput ? accountIndicesInput.value : "0",
            quickActionModel
        };
    }

    fire(event, data) {
        if (this.callbacks[event]) this.callbacks[event](data);
    }
}
