
export const HeaderTemplate = `
    <!-- HEADER -->
    <div class="header">
        <div class="header-left">
            <button id="history-toggle" class="icon-btn" data-i18n-title="toggleHistory" title="Chat History">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            <div class="model-select-wrapper">
                <div class="settings-dropdown header-model-dropdown" id="model-dropdown">
                    <button class="settings-dropdown-trigger" id="model-dropdown-trigger" type="button" data-i18n-title="modelSelectTooltip" title="Select Model (Tab to cycle)">
                        <span class="dropdown-text">Fast</span>
                        <span class="dropdown-arrow">
                            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                        </span>
                    </button>
                    <div class="settings-dropdown-menu" id="model-dropdown-menu">
                        <div class="settings-dropdown-item selected" data-value="gemini-3-flash">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Fast</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="gemini-3-flash-thinking">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Thinking</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="gemini-3-pro">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">3 Pro</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="header-right">
            <button id="tab-switcher-btn" class="icon-btn" style="display: none;" data-i18n-title="selectTabTooltip" title="Select a tab to control">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 6h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
                    <path d="M2 6l2.5-3.5A2 2 0 0 1 6.1 1h11.8a2 2 0 0 1 1.6 1.5L22 6"/>
                </svg>
            </button>
            <button id="new-chat-header-btn" class="icon-btn" data-i18n-title="newChatTooltip" title="New Chat">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
    </div>

    <!-- Corner Button -->
    <button id="open-full-page-btn" class="corner-btn" data-i18n-title="openFullPageTooltip" title="Open in Full Page">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
    </button>
`;