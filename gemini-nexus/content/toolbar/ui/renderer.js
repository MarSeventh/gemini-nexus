
// content/toolbar/ui/renderer.js
(function() {
    /**
     * Handles the rendering of results in the toolbar window,
     * including Markdown transformation (via Bridge) and Generated Images grid.
     */
    class UIRenderer {
        constructor(view, bridge) {
            this.view = view;
            this.bridge = bridge;
            this.currentResultText = '';
        }

        /**
         * Renders the text result and optionally processes generated images.
         * During streaming, uses lightweight rendering for performance.
         * Full Markdown rendering only happens when streaming is complete.
         */
        async show(text, title, isStreaming, images = []) {
            this.currentResultText = text;

            let html = text;
            let tasks = [];

            if (isStreaming) {
                // Lightweight rendering during streaming - skip Bridge for performance
                // Simple escape with basic formatting
                html = this._escapeHtml(text);
            } else if (this.bridge) {
                // Full Markdown rendering when streaming is complete
                try {
                    const result = await this.bridge.render(text, images);
                    html = result.html;
                    tasks = result.fetchTasks || [];
                } catch (e) {
                    console.warn("Bridge render failed, falling back to simple escape");
                    html = this._escapeHtml(text);
                }
            }

            // Pass to view
            this.view.showResult(html, title, isStreaming);

            // Execute fetch tasks (images) if any
            if (tasks.length > 0) {
                this._executeImageFetchTasks(tasks);
            }
        }

        /**
         * Simple HTML escape for streaming display
         */
        _escapeHtml(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
        }
        
        _executeImageFetchTasks(tasks) {
            const container = this.view.elements.resultText;
            if(!container) return;

            tasks.forEach(task => {
                const img = container.querySelector(`img[data-req-id="${task.reqId}"]`);
                if(img) {
                    // Send message to background to fetch actual image
                    chrome.runtime.sendMessage({ 
                        action: "FETCH_GENERATED_IMAGE", 
                        url: task.url, 
                        reqId: task.reqId 
                    });
                }
            });
        }
        
        handleGeneratedImageResult(request) {
             const container = this.view.elements.resultText;
             if(!container) return;
             
             const img = container.querySelector(`img[data-req-id="${request.reqId}"]`);
             if (img) {
                 if (request.base64) {
                     img.src = request.base64;
                     img.classList.remove('loading');
                     img.style.minHeight = "auto";
                 } else {
                     img.style.background = "#ffebee";
                     img.alt = "Failed to load";
                 }
             }
        }

        get currentText() {
            return this.currentResultText;
        }
    }

    window.GeminiUIRenderer = UIRenderer;
})();
