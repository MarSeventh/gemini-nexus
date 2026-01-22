
export const ConnectionSettingsTemplate = `
<div class="setting-group">
    <h4 data-i18n="connection">Connection</h4>
    
    <div style="margin-bottom: 12px;">
        <label data-i18n="connectionProvider" style="font-weight: 500; display: block; margin-bottom: 6px;">Model Provider</label>
        <div class="settings-dropdown" id="provider-dropdown" style="width: 100%;">
            <button class="settings-dropdown-trigger" id="provider-dropdown-trigger" type="button" style="width: 100%;">
                <span class="dropdown-text" data-i18n="providerWeb">Gemini Web Client (Free)</span>
                <span class="dropdown-arrow">
                    <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                </span>
            </button>
            <div class="settings-dropdown-menu" id="provider-dropdown-menu">
                <div class="settings-dropdown-item selected" data-value="web">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="providerWeb">Gemini Web Client (Free)</span>
                </div>
                <div class="settings-dropdown-item" data-value="official">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="providerOfficial">Google Gemini API</span>
                </div>
                <div class="settings-dropdown-item" data-value="openai">
                    <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                    <span class="item-text" data-i18n="providerOpenAI">OpenAI Compatible API</span>
                </div>
            </div>
        </div>
    </div>
    
    <div id="api-key-container" style="display: none; flex-direction: column; gap: 12px; margin-bottom: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
        <!-- Official API Fields -->
        <div id="official-fields" style="display: none; flex-direction: column; gap: 12px;">
            <div>
                <label data-i18n="apiKey" style="font-weight: 500; display: block; margin-bottom: 2px;">API Key</label>
                <input type="password" id="api-key-input" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" data-i18n-placeholder="apiKeyPlaceholder" placeholder="Paste your Gemini API Key">
            </div>
            <div>
                <label style="font-weight: 500; display: block; margin-bottom: 2px;">Thinking Level (Gemini 3)</label>
                <div class="settings-dropdown" id="thinking-level-dropdown" style="width: 100%;">
                    <button class="settings-dropdown-trigger" id="thinking-level-trigger" type="button" style="width: 100%;">
                        <span class="dropdown-text">Minimal (Flash Only)</span>
                        <span class="dropdown-arrow">
                            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                        </span>
                    </button>
                    <div class="settings-dropdown-menu" id="thinking-level-menu">
                        <div class="settings-dropdown-item selected" data-value="minimal">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Minimal (Flash Only)</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="low">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Low (Faster)</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="medium">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Medium (Balanced)</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="high">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">High (Deep Reasoning)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- OpenAI Fields -->
        <div id="openai-fields" style="display: none; flex-direction: column; gap: 12px;">
            <div>
                <label data-i18n="baseUrl" style="font-weight: 500; display: block; margin-bottom: 2px;">Base URL</label>
                <input type="text" id="openai-base-url" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" data-i18n-placeholder="baseUrlPlaceholder" placeholder="https://api.openai.com/v1">
            </div>
            <div>
                <label data-i18n="apiKey" style="font-weight: 500; display: block; margin-bottom: 2px;">API Key</label>
                <input type="password" id="openai-api-key" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" data-i18n-placeholder="apiKeyPlaceholder" placeholder="sk-...">
            </div>
            <div>
                <label style="font-weight: 500; display: block; margin-bottom: 2px;">Model IDs (Comma separated)</label>
                <input type="text" id="openai-model" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" placeholder="e.g. gpt-4o, claude-3-5-sonnet">
            </div>
        </div>
    </div>

    <div style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div>
                <label data-i18n="mcpTools" style="font-weight: 500; display: block; margin-bottom: 2px;">External MCP Tools</label>
                <div data-i18n="mcpToolsDesc" style="font-size: 12px; opacity: 0.85;">Connect to a local/remote MCP server and use its tools in chat.</div>
            </div>
            <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="mcp-enabled" />
                <span data-i18n="enabled">Enabled</span>
            </label>
        </div>

        <div id="mcp-fields" style="display: none; flex-direction: column; gap: 12px; margin-top: 12px;">
            <div>
                <label data-i18n="mcpActiveServer" style="font-weight: 500; display: block; margin-bottom: 6px;">Active Server</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <div class="settings-dropdown" id="mcp-server-dropdown" style="flex: 1;">
                        <button class="settings-dropdown-trigger" id="mcp-server-trigger" type="button" style="width: 100%;">
                            <span class="dropdown-text">Select Server</span>
                            <span class="dropdown-arrow">
                                <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                            </span>
                        </button>
                        <div class="settings-dropdown-menu" id="mcp-server-menu"></div>
                    </div>
                    <button id="mcp-add-server" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpAddServer">Add</button>
                    <button id="mcp-remove-server" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpRemoveServer">Remove</button>
                </div>
            </div>

            <div>
                <label data-i18n="mcpServerName" style="font-weight: 500; display: block; margin-bottom: 2px;">Name</label>
                <input type="text" id="mcp-server-name" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" placeholder="Local Proxy">
            </div>
            <div>
                <label data-i18n="mcpTransport" style="font-weight: 500; display: block; margin-bottom: 2px;">Transport</label>
                <div class="settings-dropdown" id="mcp-transport-dropdown" style="width: 100%;">
                    <button class="settings-dropdown-trigger" id="mcp-transport-trigger" type="button" style="width: 100%;">
                        <span class="dropdown-text">SSE (http://.../sse)</span>
                        <span class="dropdown-arrow">
                            <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                        </span>
                    </button>
                    <div class="settings-dropdown-menu" id="mcp-transport-menu">
                        <div class="settings-dropdown-item selected" data-value="sse">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">SSE (http://.../sse)</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="streamable-http">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">Streamable HTTP (http://.../mcp)</span>
                        </div>
                        <div class="settings-dropdown-item" data-value="ws">
                            <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                            <span class="item-text">WebSocket (ws://)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <label data-i18n="mcpServerUrl" style="font-weight: 500; display: block; margin-bottom: 2px;">Server URL</label>
                <input type="text" id="mcp-server-url" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" placeholder="http://127.0.0.1:3006/sse">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="mcp-server-enabled" />
                    <span data-i18n="enabled">Enabled</span>
                </label>
                <button id="mcp-test-connection" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpTestConnection">Test</button>
            </div>
            <div id="mcp-test-status" style="font-size: 12px; opacity: 0.85;"></div>

            <div style="margin-top: 6px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 10px;">
                <div>
                    <label data-i18n="mcpToolMode" style="font-weight: 500; display: block; margin-bottom: 6px;">Expose Tools</label>
                    <div class="settings-dropdown" id="mcp-tool-mode-dropdown" style="width: 100%;">
                        <button class="settings-dropdown-trigger" id="mcp-tool-mode-trigger" type="button" style="width: 100%;">
                            <span class="dropdown-text" data-i18n="mcpToolModeAll">All tools (default)</span>
                            <span class="dropdown-arrow">
                                <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                            </span>
                        </button>
                        <div class="settings-dropdown-menu" id="mcp-tool-mode-menu">
                            <div class="settings-dropdown-item selected" data-value="all">
                                <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                                <span class="item-text" data-i18n="mcpToolModeAll">All tools (default)</span>
                            </div>
                            <div class="settings-dropdown-item" data-value="selected">
                                <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                                <span class="item-text" data-i18n="mcpToolModeSelected">Selected tools only</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                    <button id="mcp-refresh-tools" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpRefreshTools">Refresh Tools</button>
                    <button id="mcp-enable-all-tools" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpEnableAllTools">Enable All</button>
                    <button id="mcp-disable-all-tools" class="tool-btn" style="padding: 6px 10px;" type="button" data-i18n="mcpDisableAllTools">Disable All</button>
                </div>

                <input type="text" id="mcp-tool-search" class="shortcut-input" style="width: 100%; text-align: left; box-sizing: border-box;" data-i18n-placeholder="mcpToolSearchPlaceholder" placeholder="Search tools...">

                <div id="mcp-tools-summary" style="font-size: 12px; opacity: 0.85;"></div>

                <div id="mcp-tool-list" style="max-height: 220px; overflow: auto; padding: 8px; background: rgba(255,255,255,0.55); border-radius: 8px; border: 1px solid rgba(0,0,0,0.06);"></div>
            </div>
        </div>
    </div>
</div>`;
