
// sandbox/ui/settings/sections/connection.js
import { sendToBackground } from '../../../../lib/messaging.js';

export class ConnectionSection {
    constructor() {
        this.elements = {};
        this.mcpServers = [];
        this.mcpActiveServerId = null;
        this.mcpToolsCache = new Map(); // serverId -> { key, tools }
        this.mcpToolsUiState = new Map(); // serverId -> { openGroups: Set<string> }
        this.queryElements();
        this.bindEvents();
    }

    _makeServerId() {
        return `srv_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    _getDefaultServer() {
        return {
            id: this._makeServerId(),
            name: 'Local Proxy',
            transport: 'sse',
            url: 'http://127.0.0.1:3006/sse',
            enabled: true,
            toolMode: 'all', // 'all' | 'selected'
            enabledTools: [] // only used when toolMode === 'selected'
        };
    }

    _getDefaultUrlForTransport(transport) {
        const t = (transport || 'sse').toLowerCase();
        if (t === 'ws' || t === 'websocket') return 'ws://127.0.0.1:3006/mcp';
        if (t === 'streamable-http' || t === 'streamablehttp') return 'http://127.0.0.1:3006/mcp';
        return 'http://127.0.0.1:3006/sse';
    }

    queryElements() {
        const get = (id) => document.getElementById(id);
        this.elements = {
            providerSelect: get('provider-select'),
            apiKeyContainer: get('api-key-container'),

            // Official Fields
            officialFields: get('official-fields'),
            apiKeyInput: get('api-key-input'),
            thinkingLevelSelect: get('thinking-level-select'),

            // OpenAI Fields
            openaiFields: get('openai-fields'),
            openaiBaseUrl: get('openai-base-url'),
            openaiApiKey: get('openai-api-key'),
            openaiModel: get('openai-model'),

            // MCP Fields
            mcpEnabled: get('mcp-enabled'),
            mcpFields: get('mcp-fields'),
            mcpServerSelect: get('mcp-server-select'),
            mcpAddServer: get('mcp-add-server'),
            mcpRemoveServer: get('mcp-remove-server'),
            mcpServerName: get('mcp-server-name'),
            mcpTransport: get('mcp-transport'),
            mcpServerUrl: get('mcp-server-url'),
            mcpServerEnabled: get('mcp-server-enabled'),
            mcpTestConnection: get('mcp-test-connection'),
            mcpTestStatus: get('mcp-test-status'),
            mcpToolMode: get('mcp-tool-mode'),
            mcpRefreshTools: get('mcp-refresh-tools'),
            mcpEnableAllTools: get('mcp-enable-all-tools'),
            mcpDisableAllTools: get('mcp-disable-all-tools'),
            mcpToolSearch: get('mcp-tool-search'),
            mcpToolsSummary: get('mcp-tools-summary'),
            mcpToolList: get('mcp-tool-list'),

            // Custom dropdown elements
            providerDropdown: get('provider-dropdown'),
            providerTrigger: get('provider-dropdown-trigger'),
            providerMenu: get('provider-dropdown-menu'),

            thinkingLevelDropdown: get('thinking-level-dropdown'),
            thinkingLevelTrigger: get('thinking-level-trigger'),
            thinkingLevelMenu: get('thinking-level-menu'),

            mcpServerDropdown: get('mcp-server-dropdown'),
            mcpServerTrigger: get('mcp-server-trigger'),
            mcpServerMenu: get('mcp-server-menu'),

            mcpTransportDropdown: get('mcp-transport-dropdown'),
            mcpTransportTrigger: get('mcp-transport-trigger'),
            mcpTransportMenu: get('mcp-transport-menu'),

            mcpToolModeDropdown: get('mcp-tool-mode-dropdown'),
            mcpToolModeTrigger: get('mcp-tool-mode-trigger'),
            mcpToolModeMenu: get('mcp-tool-mode-menu'),
        };
    }

    bindEvents() {
        const {
            providerDropdown, providerTrigger, providerMenu,
            thinkingLevelDropdown, thinkingLevelTrigger, thinkingLevelMenu,
            mcpServerDropdown, mcpServerTrigger, mcpServerMenu,
            mcpTransportDropdown, mcpTransportTrigger, mcpTransportMenu,
            mcpToolModeDropdown, mcpToolModeTrigger, mcpToolModeMenu
        } = this.elements;

        // Provider dropdown
        if (providerTrigger) {
            providerTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('provider');
            });
        }
        if (providerMenu) {
            providerMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    const value = item.dataset.value;
                    this._selectDropdownItem('provider', value);
                    this.updateVisibility(value);
                }
            });
        }

        // Thinking level dropdown
        if (thinkingLevelTrigger) {
            thinkingLevelTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('thinkingLevel');
            });
        }
        if (thinkingLevelMenu) {
            thinkingLevelMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    this._selectDropdownItem('thinkingLevel', item.dataset.value);
                }
            });
        }

        const { mcpEnabled } = this.elements;
        if (mcpEnabled) {
            mcpEnabled.addEventListener('change', (e) => {
                this.updateMcpVisibility(e.target.checked === true);
            });
        }

        // MCP Server dropdown
        if (mcpServerTrigger) {
            mcpServerTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('mcpServer');
            });
        }
        if (mcpServerMenu) {
            mcpServerMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    this._saveCurrentServerEdits();
                    this.mcpActiveServerId = item.dataset.value;
                    this._selectDropdownItem('mcpServer', item.dataset.value);
                    this._loadActiveServerIntoForm();
                    this._renderMcpServerOptions();
                    this.setMcpTestStatus('');
                }
            });
        }

        // MCP Transport dropdown
        if (mcpTransportTrigger) {
            mcpTransportTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('mcpTransport');
            });
        }
        if (mcpTransportMenu) {
            mcpTransportMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    const server = this._getActiveServer();
                    const prevTransport = server ? (server.transport || 'sse') : 'sse';
                    const nextTransport = item.dataset.value || 'sse';

                    this._selectDropdownItem('mcpTransport', nextTransport);

                    // Update placeholder to match transport
                    const { mcpServerUrl } = this.elements;
                    if (mcpServerUrl) {
                        mcpServerUrl.placeholder = this._getDefaultUrlForTransport(nextTransport);
                    }

                    // If URL is empty OR still equal to the previous transport default, swap to new default
                    if (server && mcpServerUrl) {
                        const currentUrl = (mcpServerUrl.value || '').trim();
                        const prevDefault = this._getDefaultUrlForTransport(prevTransport);
                        if (!currentUrl || currentUrl === prevDefault) {
                            mcpServerUrl.value = this._getDefaultUrlForTransport(nextTransport);
                        }
                    }

                    this._saveCurrentServerEdits();
                    this._renderMcpServerOptions();
                }
            });
        }

        // MCP Tool Mode dropdown
        if (mcpToolModeTrigger) {
            mcpToolModeTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleDropdown('mcpToolMode');
            });
        }
        if (mcpToolModeMenu) {
            mcpToolModeMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.settings-dropdown-item');
                if (item) {
                    this._selectDropdownItem('mcpToolMode', item.dataset.value);
                    this._saveCurrentServerEdits();
                    this._renderToolsUI();
                }
            });
        }

        // Close all dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (providerDropdown && !providerDropdown.contains(e.target)) {
                this._toggleDropdown('provider', true);
            }
            if (thinkingLevelDropdown && !thinkingLevelDropdown.contains(e.target)) {
                this._toggleDropdown('thinkingLevel', true);
            }
            if (mcpServerDropdown && !mcpServerDropdown.contains(e.target)) {
                this._toggleDropdown('mcpServer', true);
            }
            if (mcpTransportDropdown && !mcpTransportDropdown.contains(e.target)) {
                this._toggleDropdown('mcpTransport', true);
            }
            if (mcpToolModeDropdown && !mcpToolModeDropdown.contains(e.target)) {
                this._toggleDropdown('mcpToolMode', true);
            }
        });

        const { mcpAddServer, mcpRemoveServer, mcpServerName, mcpServerUrl,
                mcpServerEnabled, mcpTestConnection, mcpRefreshTools,
                mcpEnableAllTools, mcpDisableAllTools, mcpToolSearch } = this.elements;

        if (mcpAddServer) {
            mcpAddServer.addEventListener('click', () => {
                this._saveCurrentServerEdits();
                const server = this._getDefaultServer();
                this.mcpServers.push(server);
                this.mcpActiveServerId = server.id;
                this._renderMcpServerOptions();
                this._loadActiveServerIntoForm();
                this.setMcpTestStatus('');
            });
        }

        if (mcpRemoveServer) {
            mcpRemoveServer.addEventListener('click', () => {
                this._saveCurrentServerEdits();
                const id = this.mcpActiveServerId;
                if (!id) return;

                this.mcpServers = this.mcpServers.filter(s => s.id !== id);

                if (this.mcpServers.length === 0) {
                    const server = this._getDefaultServer();
                    server.enabled = false;
                    this.mcpServers = [server];
                }

                this.mcpActiveServerId = this.mcpServers[0].id;
                this._renderMcpServerOptions();
                this._loadActiveServerIntoForm();
                this.setMcpTestStatus('');
            });
        }

        const onEdit = () => {
            this._saveCurrentServerEdits();
            this._renderMcpServerOptions();
        };

        if (mcpServerName) mcpServerName.addEventListener('input', onEdit);
        if (mcpServerUrl) mcpServerUrl.addEventListener('input', onEdit);
        if (mcpServerEnabled) mcpServerEnabled.addEventListener('change', onEdit);

        if (mcpToolSearch) {
            mcpToolSearch.addEventListener('input', () => {
                this._renderToolsUI();
            });
        }

        if (mcpRefreshTools) {
            mcpRefreshTools.addEventListener('click', () => {
                this._saveCurrentServerEdits();
                const server = this._getActiveServer();
                if (!server) return;

                this.setMcpTestStatus('Fetching tools...');
                sendToBackground({
                    action: 'MCP_LIST_TOOLS',
                    serverId: server.id,
                    transport: server.transport || 'sse',
                    url: server.url || ''
                });
            });
        }

        if (mcpEnableAllTools) {
            mcpEnableAllTools.addEventListener('click', () => {
                const server = this._getActiveServer();
                if (!server) return;
                const cached = this._getCachedTools(server);
                if (!cached || cached.length === 0) return;
                server.toolMode = 'selected';
                server.enabledTools = cached.map(t => t.name).filter(Boolean);
                this._loadActiveServerIntoForm();
                this._renderToolsUI();
            });
        }

        if (mcpDisableAllTools) {
            mcpDisableAllTools.addEventListener('click', () => {
                const server = this._getActiveServer();
                if (!server) return;
                server.toolMode = 'selected';
                server.enabledTools = [];
                this._loadActiveServerIntoForm();
                this._renderToolsUI();
            });
        }

        if (mcpTestConnection) {
            mcpTestConnection.addEventListener('click', () => {
                this._saveCurrentServerEdits();
                const server = this._getActiveServer();
                if (!server) return;

                this.setMcpTestStatus('Testing connection...');
                sendToBackground({
                    action: 'MCP_TEST_CONNECTION',
                    serverId: server.id,
                    transport: server.transport || 'sse',
                    url: server.url || ''
                });
            });
        }
    }

    _toggleDropdown(type, forceClose = false) {
        const dropdownMap = {
            provider: this.elements.providerDropdown,
            thinkingLevel: this.elements.thinkingLevelDropdown,
            mcpServer: this.elements.mcpServerDropdown,
            mcpTransport: this.elements.mcpTransportDropdown,
            mcpToolMode: this.elements.mcpToolModeDropdown
        };
        const dropdown = dropdownMap[type];
        if (!dropdown) return;

        if (forceClose) {
            dropdown.classList.remove('open');
        } else {
            dropdown.classList.toggle('open');
        }
    }

    _selectDropdownItem(type, value) {
        const config = {
            provider: { dropdown: this.elements.providerDropdown, trigger: this.elements.providerTrigger, menu: this.elements.providerMenu },
            thinkingLevel: { dropdown: this.elements.thinkingLevelDropdown, trigger: this.elements.thinkingLevelTrigger, menu: this.elements.thinkingLevelMenu },
            mcpServer: { dropdown: this.elements.mcpServerDropdown, trigger: this.elements.mcpServerTrigger, menu: this.elements.mcpServerMenu },
            mcpTransport: { dropdown: this.elements.mcpTransportDropdown, trigger: this.elements.mcpTransportTrigger, menu: this.elements.mcpTransportMenu },
            mcpToolMode: { dropdown: this.elements.mcpToolModeDropdown, trigger: this.elements.mcpToolModeTrigger, menu: this.elements.mcpToolModeMenu }
        };
        const { dropdown, trigger, menu } = config[type] || {};
        if (!dropdown || !menu) return;

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

        this._toggleDropdown(type, true);
    }

    _getDropdownValue(type) {
        const menuMap = {
            provider: this.elements.providerMenu,
            thinkingLevel: this.elements.thinkingLevelMenu,
            mcpServer: this.elements.mcpServerMenu,
            mcpTransport: this.elements.mcpTransportMenu,
            mcpToolMode: this.elements.mcpToolModeMenu
        };
        const menu = menuMap[type];
        if (!menu) return null;
        const selected = menu.querySelector('.settings-dropdown-item.selected');
        return selected ? selected.dataset.value : null;
    }

    setData(data) {
        const {
            apiKeyInput,
            openaiBaseUrl, openaiApiKey, openaiModel,
            mcpEnabled
        } = this.elements;

        // Provider
        this._selectDropdownItem('provider', data.provider || 'web');
        this.updateVisibility(data.provider || 'web');

        // Official
        if (apiKeyInput) apiKeyInput.value = data.apiKey || "";
        this._selectDropdownItem('thinkingLevel', data.thinkingLevel || 'low');
        
        // OpenAI
        if (openaiBaseUrl) openaiBaseUrl.value = data.openaiBaseUrl || "";
        if (openaiApiKey) openaiApiKey.value = data.openaiApiKey || "";
        if (openaiModel) openaiModel.value = data.openaiModel || "";

        // MCP
        if (mcpEnabled) {
            mcpEnabled.checked = data.mcpEnabled === true;
            this.updateMcpVisibility(mcpEnabled.checked);
        }

        // Servers list (preferred)
        const servers = Array.isArray(data.mcpServers) ? data.mcpServers : null;
        const activeId = typeof data.mcpActiveServerId === 'string' ? data.mcpActiveServerId : null;

        if (servers && servers.length > 0) {
            this.mcpServers = servers.map(s => ({
                id: s.id || this._makeServerId(),
                name: s.name || '',
                transport: s.transport || 'sse',
                url: s.url || '',
                enabled: s.enabled !== false,
                toolMode: s.toolMode === 'selected' ? 'selected' : 'all',
                enabledTools: Array.isArray(s.enabledTools) ? s.enabledTools : []
            }));
            this.mcpActiveServerId = activeId && this.mcpServers.some(s => s.id === activeId) ? activeId : this.mcpServers[0].id;
        } else {
            // Legacy single server fields
            const legacyUrl = data.mcpServerUrl || "";
            const legacyTransport = data.mcpTransport || "sse";
            const server = this._getDefaultServer();
            server.transport = legacyTransport;
            server.url = legacyUrl || server.url;
            server.enabled = data.mcpEnabled === true;
            this.mcpServers = [server];
            this.mcpActiveServerId = server.id;
        }

        this._renderMcpServerOptions();
        this._loadActiveServerIntoForm();
        this.setMcpTestStatus('');
    }

    getData() {
        const {
            apiKeyInput,
            openaiBaseUrl, openaiApiKey, openaiModel,
            mcpEnabled
        } = this.elements;

        this._saveCurrentServerEdits();
        const servers = Array.isArray(this.mcpServers) ? this.mcpServers : [];
        // Get the first enabled server for legacy compatibility
        const firstEnabled = servers.find(s => s.enabled !== false && s.url && s.url.trim());

        return {
            provider: this._getDropdownValue('provider') || 'web',
            // Official
            apiKey: apiKeyInput ? apiKeyInput.value.trim() : "",
            thinkingLevel: this._getDropdownValue('thinkingLevel') || "low",
            // OpenAI
            openaiBaseUrl: openaiBaseUrl ? openaiBaseUrl.value.trim() : "",
            openaiApiKey: openaiApiKey ? openaiApiKey.value.trim() : "",
            openaiModel: openaiModel ? openaiModel.value.trim() : "",

            // MCP - Multi-server mode: all enabled servers will be used
            mcpEnabled: mcpEnabled ? mcpEnabled.checked === true : false,
            mcpServers: servers,
            // Keep mcpActiveServerId for backward compatibility but it's no longer required
            mcpActiveServerId: this.mcpActiveServerId || (servers[0] ? servers[0].id : null),

            // Legacy fields for single-server backward compatibility
            mcpTransport: firstEnabled ? (firstEnabled.transport || 'sse') : 'sse',
            mcpServerUrl: firstEnabled ? (firstEnabled.url || '') : ''
        };
    }

    updateVisibility(provider) {
        const { apiKeyContainer, officialFields, openaiFields } = this.elements;
        if (!apiKeyContainer) return;

        if (provider === 'web') {
            apiKeyContainer.style.display = 'none';
        } else {
            apiKeyContainer.style.display = 'flex';
            if (provider === 'official') {
                if (officialFields) officialFields.style.display = 'flex';
                if (openaiFields) openaiFields.style.display = 'none';
            } else if (provider === 'openai') {
                if (officialFields) officialFields.style.display = 'none';
                if (openaiFields) openaiFields.style.display = 'flex';
            }
        }
    }

    updateMcpVisibility(enabled) {
        const { mcpFields } = this.elements;
        if (!mcpFields) return;
        mcpFields.style.display = enabled ? 'flex' : 'none';
    }

    _getActiveServer() {
        if (!this.mcpServers || this.mcpServers.length === 0) return null;
        const activeId = this.mcpActiveServerId;
        const match = activeId ? this.mcpServers.find(s => s.id === activeId) : null;
        return match || this.mcpServers[0];
    }

    _saveCurrentServerEdits() {
        const {
            mcpServerName,
            mcpServerUrl,
            mcpServerEnabled
        } = this.elements;

        const server = this._getActiveServer();
        if (!server) return;

        const prevKey = this._serverKey(server);

        if (mcpServerName) server.name = mcpServerName.value || '';
        server.transport = this._getDropdownValue('mcpTransport') || 'sse';
        if (mcpServerUrl) server.url = (mcpServerUrl.value || '').trim();
        if (mcpServerEnabled) server.enabled = mcpServerEnabled.checked === true;
        server.toolMode = this._getDropdownValue('mcpToolMode') === 'selected' ? 'selected' : 'all';

        // If transport/url changed, invalidate cached tool list for this server.
        const nextKey = this._serverKey(server);
        if (prevKey !== nextKey) {
            this.mcpToolsCache.delete(server.id);
        }
    }

    _loadActiveServerIntoForm() {
        const {
            mcpServerName,
            mcpServerUrl,
            mcpServerEnabled
        } = this.elements;

        const server = this._getActiveServer();
        if (!server) return;

        this._selectDropdownItem('mcpServer', server.id);
        if (mcpServerName) mcpServerName.value = server.name || '';
        this._selectDropdownItem('mcpTransport', server.transport || 'sse');
        if (mcpServerUrl) mcpServerUrl.value = server.url || '';
        if (mcpServerUrl) mcpServerUrl.placeholder = this._getDefaultUrlForTransport(server.transport || 'sse');
        if (mcpServerEnabled) mcpServerEnabled.checked = server.enabled !== false;
        this._selectDropdownItem('mcpToolMode', server.toolMode === 'selected' ? 'selected' : 'all');

        this._renderToolsUI();
    }

    _renderMcpServerOptions() {
        const { mcpServerMenu, mcpServerTrigger } = this.elements;
        if (!mcpServerMenu) return;

        const active = this._getActiveServer();
        if (active) this.mcpActiveServerId = active.id;

        mcpServerMenu.innerHTML = '';
        const triggerText = mcpServerTrigger ? mcpServerTrigger.querySelector('.dropdown-text') : null;

        for (const server of this.mcpServers) {
            const item = document.createElement('div');
            item.className = 'settings-dropdown-item';
            item.dataset.value = server.id;

            const name = (server.name || '').trim();
            const label = name || (server.url || 'MCP Server');
            const status = server.enabled === false ? '✗' : '✓';

            if (active && server.id === active.id) {
                item.classList.add('selected');
                if (triggerText) triggerText.textContent = `${status} ${label}`;
            }

            item.innerHTML = `
                <span class="check-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span>
                <span class="item-text">${status} ${label}</span>
            `;
            mcpServerMenu.appendChild(item);
        }
    }

    setMcpTestStatus(text, isError = false) {
        const { mcpTestStatus } = this.elements;
        if (!mcpTestStatus) return;
        mcpTestStatus.textContent = text || '';
        mcpTestStatus.style.color = isError ? '#b00020' : '';
    }

    _serverKey(server) {
        const transport = (server.transport || 'sse').toLowerCase();
        const url = (server.url || '').trim();
        return `${transport}:${url}`;
    }

    _getCachedTools(server) {
        const entry = this.mcpToolsCache.get(server.id);
        if (!entry) return null;
        if (entry.key !== this._serverKey(server)) return null;
        return Array.isArray(entry.tools) ? entry.tools : null;
    }

    setMcpToolsList(serverId, transport, url, tools) {
        const id = serverId || (this._getActiveServer() ? this._getActiveServer().id : null);
        if (!id) return;

        this.mcpToolsCache.set(id, {
            key: `${(transport || 'sse').toLowerCase()}:${(url || '').trim()}`,
            tools: Array.isArray(tools) ? tools : []
        });

        this.setMcpTestStatus('');
        this._renderToolsUI();
    }

    _renderToolsUI() {
        const { mcpToolsSummary, mcpToolList, mcpToolSearch } = this.elements;
        const server = this._getActiveServer();
        if (!server || !mcpToolList || !mcpToolsSummary) return;

        const cached = this._getCachedTools(server) || [];
        const toolMode = server.toolMode === 'selected' ? 'selected' : 'all';

        // Summary
        const enabledSet = new Set(Array.isArray(server.enabledTools) ? server.enabledTools : []);
        const total = cached.length;
        const enabledCount = toolMode === 'all' ? total : enabledSet.size;
        const modeLabel = toolMode === 'all' ? 'all' : 'selected';

        if (!server.url || !server.url.trim()) {
            mcpToolsSummary.textContent = 'Set Server URL to manage tools.';
        } else if (total === 0) {
            mcpToolsSummary.textContent = toolMode === 'all'
                ? 'All tools will be exposed. Click "Refresh Tools" to preview the tool list.'
                : 'No tool list loaded. Click "Refresh Tools" to load tools, then select which to expose.';
        } else {
            mcpToolsSummary.textContent = toolMode === 'all'
                ? `Mode: ${modeLabel}. Tools exposed: ${enabledCount}/${total}.`
                : `Mode: ${modeLabel}. Tools exposed: ${enabledCount}/${total}.`;
        }

        // Tool list
        mcpToolList.innerHTML = '';

        if (toolMode === 'all') {
            const div = document.createElement('div');
            div.style.opacity = '0.85';
            div.style.fontSize = '12px';
            div.textContent = 'Switch to "Selected tools only" to choose which tools the model can use.';
            mcpToolList.appendChild(div);
            return;
        }

        if (cached.length === 0) {
            const div = document.createElement('div');
            div.style.opacity = '0.85';
            div.style.fontSize = '12px';
            div.textContent = 'No tools loaded yet.';
            mcpToolList.appendChild(div);
            return;
        }

        const search = mcpToolSearch ? (mcpToolSearch.value || '').trim().toLowerCase() : '';
        const filtered = search
            ? cached.filter(t => (t.name || '').toLowerCase().includes(search) || (t.description || '').toLowerCase().includes(search))
            : cached;

        // Group tools by "server.tool" prefix (like MCP-SuperAssistant).
        const groups = new Map(); // groupName -> tools[]
        const ungroupedKey = '(other)';

        for (const tool of filtered) {
            const toolName = tool.name || '';
            if (!toolName) continue;
            const dot = toolName.indexOf('.');
            const group = dot > 0 ? toolName.slice(0, dot) : ungroupedKey;
            if (!groups.has(group)) groups.set(group, []);
            groups.get(group).push(tool);
        }

        const sortedGroupNames = Array.from(groups.keys()).sort((a, b) => {
            if (a === ungroupedKey) return 1;
            if (b === ungroupedKey) return -1;
            return a.localeCompare(b);
        });

        const uiState = this._getToolsUiState(server.id);

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';

        const renderToolRow = (tool) => {
            const toolName = tool.name || '';
            const dot = toolName.indexOf('.');
            const displayName = dot > 0 ? toolName.slice(dot + 1) : toolName;

            const row = document.createElement('label');
            row.style.display = 'flex';
            row.style.alignItems = 'flex-start';
            row.style.gap = '8px';
            row.style.cursor = 'pointer';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = enabledSet.has(toolName);
            cb.addEventListener('change', () => {
                if (cb.checked) enabledSet.add(toolName);
                else enabledSet.delete(toolName);
                server.enabledTools = Array.from(enabledSet);
                // Avoid full rerender for single toggles? For correctness, rerender to keep group counts accurate.
                this._renderToolsUI();
            });

            const text = document.createElement('div');
            text.style.display = 'flex';
            text.style.flexDirection = 'column';
            text.style.gap = '2px';

            const nameEl = document.createElement('div');
            nameEl.style.fontSize = '12px';
            nameEl.style.fontWeight = '500';
            nameEl.textContent = displayName;

            const fullEl = document.createElement('div');
            fullEl.style.fontSize = '11px';
            fullEl.style.opacity = '0.7';
            fullEl.textContent = toolName;

            const descEl = document.createElement('div');
            descEl.style.fontSize = '11px';
            descEl.style.opacity = '0.85';
            descEl.textContent = tool.description || '';

            text.appendChild(nameEl);
            text.appendChild(fullEl);
            if (tool.description) text.appendChild(descEl);

            row.appendChild(cb);
            row.appendChild(text);
            return row;
        };

        const renderGroup = (groupName, tools) => {
            tools.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            // Group header counts
            const toolNames = tools.map(t => t.name).filter(Boolean);
            const enabledCountInGroup = toolNames.filter(n => enabledSet.has(n)).length;
            const totalInGroup = toolNames.length;

            const details = document.createElement('details');
            details.open = uiState.openGroups.has(groupName);
            details.addEventListener('toggle', () => {
                if (details.open) uiState.openGroups.add(groupName);
                else uiState.openGroups.delete(groupName);
            });

            const summary = document.createElement('summary');
            summary.style.cursor = 'pointer';
            summary.style.userSelect = 'none';
            summary.style.display = 'flex';
            summary.style.alignItems = 'center';
            summary.style.justifyContent = 'space-between';
            summary.style.gap = '10px';
            summary.style.padding = '6px 8px';
            summary.style.background = 'rgba(0,0,0,0.04)';
            summary.style.borderRadius = '8px';
            summary.style.listStyle = 'none';

            // Left: checkbox + group name
            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '8px';

            const groupCb = document.createElement('input');
            groupCb.type = 'checkbox';
            groupCb.checked = totalInGroup > 0 && enabledCountInGroup === totalInGroup;
            groupCb.indeterminate = enabledCountInGroup > 0 && enabledCountInGroup < totalInGroup;
            groupCb.addEventListener('click', (e) => {
                // Prevent toggling <details> when clicking checkbox
                e.stopPropagation();
            });
            groupCb.addEventListener('change', () => {
                if (groupCb.checked) {
                    for (const n of toolNames) enabledSet.add(n);
                } else {
                    for (const n of toolNames) enabledSet.delete(n);
                }
                server.enabledTools = Array.from(enabledSet);
                this._renderToolsUI();
            });

            const groupTitle = document.createElement('div');
            groupTitle.style.fontSize = '12px';
            groupTitle.style.fontWeight = '600';
            groupTitle.textContent = groupName === ungroupedKey ? 'Other tools' : groupName;

            left.appendChild(groupCb);
            left.appendChild(groupTitle);

            // Right: counts
            const right = document.createElement('div');
            right.style.fontSize = '12px';
            right.style.opacity = '0.85';
            right.textContent = `${enabledCountInGroup}/${totalInGroup}`;

            summary.appendChild(left);
            summary.appendChild(right);

            const list = document.createElement('div');
            list.style.display = 'flex';
            list.style.flexDirection = 'column';
            list.style.gap = '6px';
            list.style.padding = '8px 2px 2px 2px';

            for (const tool of tools) {
                list.appendChild(renderToolRow(tool));
            }

            details.appendChild(summary);
            details.appendChild(list);
            return details;
        };

        for (const groupName of sortedGroupNames) {
            container.appendChild(renderGroup(groupName, groups.get(groupName)));
        }

        mcpToolList.appendChild(container);
    }

    _getToolsUiState(serverId) {
        const key = serverId || 'default';
        const existing = this.mcpToolsUiState.get(key);
        if (existing) return existing;

        const state = { openGroups: new Set() };
        // Default: keep groups expanded for usability.
        state.openGroups.add('(other)');
        this.mcpToolsUiState.set(key, state);
        return state;
    }
}
