
// sandbox/controllers/session_flow.js
import { appendMessage } from '../render/message.js';
import { sendToBackground, saveSessionsToStorage } from '../../lib/messaging.js';
import { t } from '../core/i18n.js';

export class SessionFlowController {
    constructor(sessionManager, uiController, appController) {
        this.sessionManager = sessionManager;
        this.ui = uiController;
        this.app = appController;
    }

    handleNewChat() {
        if (this.app.isGenerating) this.app.prompt.cancel();

        this.app.messageHandler.resetStream();

        const currentModel = this.app.getSelectedModel();
        const s = this.sessionManager.createSession(currentModel);
        s.title = t('newChat');
        this.switchToSession(s.id);
    }

    switchToSession(sessionId) {
        if (this.app.isGenerating) this.app.prompt.cancel();

        this.app.messageHandler.resetStream();
        this.sessionManager.setCurrentId(sessionId);

        const session = this.sessionManager.getCurrentSession();
        if (!session) return;

        // Restore the session's model if it has one
        if (session.model) {
            this._selectModel(session.model);
        }

        this.ui.clearChatHistory();
        session.messages.forEach(msg => {
            let attachment = null;
            if (msg.role === 'user') attachment = msg.image;
            if (msg.role === 'ai') attachment = msg.generatedImages;
            // Pass msg.thoughts to appendMessage
            appendMessage(this.ui.historyDiv, msg.text, msg.role, attachment, msg.thoughts);
        });
        this.ui.scrollToBottom();

        if (session.context) {
            sendToBackground({
                action: "SET_CONTEXT",
                context: session.context,
                model: this.app.getSelectedModel()
            });
        } else {
            sendToBackground({ action: "RESET_CONTEXT" });
        }

        this.refreshHistoryUI();
        this.ui.resetInput();
    }

    refreshHistoryUI() {
        this.ui.renderHistoryList(
            this.sessionManager.getSortedSessions(),
            this.sessionManager.currentSessionId,
            {
                onSwitch: (id) => this.switchToSession(id),
                onDelete: (id) => this.handleDeleteSession(id)
            }
        );
    }

    handleDeleteSession(sessionId) {
        const switchNeeded = this.sessionManager.deleteSession(sessionId);
        saveSessionsToStorage(this.sessionManager.sessions);

        if (switchNeeded) {
            if (this.sessionManager.sessions.length > 0) {
                this.switchToSession(this.sessionManager.currentSessionId);
            } else {
                this.handleNewChat();
            }
        } else {
            this.refreshHistoryUI();
        }
    }

    _selectModel(value) {
        // Update custom dropdown UI
        const modelMenu = document.getElementById('model-dropdown-menu');
        const modelTrigger = document.getElementById('model-dropdown-trigger');

        if (modelMenu) {
            const items = modelMenu.querySelectorAll('.settings-dropdown-item');
            let found = false;

            items.forEach(item => {
                if (item.dataset.value === value) {
                    item.classList.add('selected');
                    found = true;
                    // Update trigger text
                    if (modelTrigger) {
                        const triggerText = modelTrigger.querySelector('.dropdown-text');
                        if (triggerText) {
                            triggerText.textContent = item.querySelector('.item-text').textContent;
                        }
                    }
                } else {
                    item.classList.remove('selected');
                }
            });

            // Fallback to first item if model not found
            if (!found && items.length > 0) {
                items[0].classList.add('selected');
                if (modelTrigger) {
                    const triggerText = modelTrigger.querySelector('.dropdown-text');
                    if (triggerText) {
                        triggerText.textContent = items[0].querySelector('.item-text').textContent;
                    }
                }
            }
        }

        // Also update hidden select if it exists (legacy)
        if (this.ui.modelSelect) {
            this.ui.modelSelect.value = value;
            if (this.ui.modelSelect.selectedIndex === -1 && this.ui.modelSelect.options.length > 0) {
                this.ui.modelSelect.selectedIndex = 0;
            }
        }
    }
}
