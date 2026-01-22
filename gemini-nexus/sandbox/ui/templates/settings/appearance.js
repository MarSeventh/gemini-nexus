
export const AppearanceSettingsTemplate = `
<div class="setting-group">
    <h4 data-i18n="appearance">Appearance</h4>
    <div class="shortcut-row">
        <label data-i18n="theme">Theme</label>
        <div class="settings-dropdown" id="theme-dropdown">
            <button class="settings-dropdown-trigger" id="theme-dropdown-trigger" type="button">
                <span class="dropdown-text" data-i18n="system">System Default</span>
                <span class="dropdown-arrow">
                    <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </span>
            </button>
            <div class="settings-dropdown-menu" id="theme-dropdown-menu">
                <div class="settings-dropdown-item selected" data-value="system">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="system">System Default</span>
                </div>
                <div class="settings-dropdown-item" data-value="light">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="light">Light</span>
                </div>
                <div class="settings-dropdown-item" data-value="dark">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="dark">Dark</span>
                </div>
            </div>
        </div>
    </div>
    <div class="shortcut-row">
        <label data-i18n="language">Language</label>
        <div class="settings-dropdown" id="language-dropdown">
            <button class="settings-dropdown-trigger" id="language-dropdown-trigger" type="button">
                <span class="dropdown-text" data-i18n="system">System Default</span>
                <span class="dropdown-arrow">
                    <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </span>
            </button>
            <div class="settings-dropdown-menu" id="language-dropdown-menu">
                <div class="settings-dropdown-item selected" data-value="system">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="system">System Default</span>
                </div>
                <div class="settings-dropdown-item" data-value="en">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text">English</span>
                </div>
                <div class="settings-dropdown-item" data-value="zh">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text">中文</span>
                </div>
            </div>
        </div>
    </div>
</div>`;
