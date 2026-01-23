
// background/handlers/session/quick_ask_handler.js
import { saveToHistory } from '../../managers/history_manager.js';
import { generateUUID } from '../../../lib/utils.js';

export class QuickAskHandler {
    constructor(sessionManager, imageHandler) {
        this.sessionManager = sessionManager;
        this.imageHandler = imageHandler;
    }

    async handleQuickAsk(request, sender) {
        const tabId = sender.tab ? sender.tab.id : null;

        // Reset context for new conversations, but preserve for follow-up messages
        if (!request.sessionId && !request.preserveContext) {
            await this.sessionManager.resetContext();
        } else {
            await this.sessionManager.ensureInitialized();
        }

        // Use provided model from request, otherwise fall back to configured quick action model
        if (!request.model) {
            const storage = await chrome.storage.local.get(['geminiQuickActionModel']);
            request.model = storage.geminiQuickActionModel || 'gemini-2.5-flash';
        }

        const onUpdate = (partialText, partialThoughts) => {
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    action: "GEMINI_STREAM_UPDATE",
                    text: partialText,
                    thoughts: partialThoughts
                }).catch(() => {});
            }
        };

        const result = await this.sessionManager.handleSendPrompt(request, onUpdate);

        // Don't save immediately - send pending session data instead
        // Session will only be saved when user clicks "Continue Chat"
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {
                action: "GEMINI_STREAM_DONE",
                result: result,
                // Send pending session data for later save
                pendingSession: result && result.status === 'success' ? {
                    text: request.text,
                    result: result,
                    files: null
                } : null
            }).catch(() => {});
        }
    }

    async handleQuickAskImage(request, sender) {
        const tabId = sender.tab ? sender.tab.id : null;

        const imgRes = await this.imageHandler.fetchImage(request.url);

        if (imgRes.error) {
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    action: "GEMINI_STREAM_DONE",
                    result: { status: "error", text: "Failed to load image: " + imgRes.error }
                }).catch(() => {});
            }
            return;
        }

        // Use provided model from request, otherwise fall back to configured quick action model
        let model = request.model;
        if (!model) {
            const storage = await chrome.storage.local.get(['geminiQuickActionModel']);
            model = storage.geminiQuickActionModel || 'gemini-2.5-flash';
        }

        const promptRequest = {
            text: request.text,
            model: model,
            files: [{
                base64: imgRes.base64,
                type: imgRes.type,
                name: imgRes.name
            }]
        };

        await this.sessionManager.resetContext();

        const onUpdate = (partialText, partialThoughts) => {
            if (tabId) {
                chrome.tabs.sendMessage(tabId, {
                    action: "GEMINI_STREAM_UPDATE",
                    text: partialText,
                    thoughts: partialThoughts
                }).catch(() => {});
            }
        };

        const result = await this.sessionManager.handleSendPrompt(promptRequest, onUpdate);

        // Don't save immediately - send pending session data instead
        // Session will only be saved when user clicks "Continue Chat"
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {
                action: "GEMINI_STREAM_DONE",
                result: result,
                // Send pending session data for later save (include image)
                pendingSession: result && result.status === 'success' ? {
                    text: request.text,
                    result: result,
                    files: [{ base64: imgRes.base64 }]
                } : null
            }).catch(() => {});
        }
    }

    /**
     * Called when user clicks "Continue Chat" - saves the pending session and returns the ID
     * Handles multi-turn conversations where pendingSession contains an array of messages
     */
    async handleSaveAndContinue(request, sender) {
        const { pendingSession } = request;

        if (!pendingSession) {
            return { sessionId: null };
        }

        // Handle new format with messages array
        if (pendingSession.messages && pendingSession.messages.length > 0) {
            return await this._saveMultiTurnSession(pendingSession);
        }

        // Legacy format: single exchange
        const savedSession = await saveToHistory(
            pendingSession.text,
            pendingSession.result,
            pendingSession.files
        );

        return { sessionId: savedSession ? savedSession.id : null };
    }

    /**
     * Saves a multi-turn conversation to history
     */
    async _saveMultiTurnSession(pendingSession) {
        try {
            const { geminiSessions = [] } = await chrome.storage.local.get(['geminiSessions']);

            const sessionId = generateUUID();
            const firstUserMsg = pendingSession.messages.find(m => m.role === 'user');
            const title = firstUserMsg && firstUserMsg.text
                ? (firstUserMsg.text.length > 30 ? firstUserMsg.text.substring(0, 30) + "..." : firstUserMsg.text)
                : "Quick Ask";

            // Transform messages to storage format
            const storageMessages = pendingSession.messages.map(msg => {
                if (msg.role === 'user') {
                    // Normalize image data
                    let storedImages = null;
                    if (msg.files) {
                        if (Array.isArray(msg.files)) {
                            storedImages = msg.files.map(f => f.base64 || f);
                        } else if (msg.files.base64) {
                            storedImages = [msg.files.base64];
                        }
                    }
                    return {
                        role: 'user',
                        text: msg.text,
                        image: storedImages
                    };
                } else {
                    return {
                        role: 'ai',
                        text: msg.text,
                        thoughts: msg.thoughts,
                        generatedImages: msg.images
                    };
                }
            });

            const newSession = {
                id: sessionId,
                title: title,
                timestamp: Date.now(),
                messages: storageMessages,
                context: pendingSession.context
            };

            geminiSessions.unshift(newSession);
            await chrome.storage.local.set({ geminiSessions });

            // Notify Sidepanel to reload if open
            chrome.runtime.sendMessage({
                action: "SESSIONS_UPDATED",
                sessions: geminiSessions
            }).catch(() => {});

            return { sessionId: sessionId };
        } catch (e) {
            console.error("Error saving multi-turn session:", e);
            return { sessionId: null };
        }
    }
}
