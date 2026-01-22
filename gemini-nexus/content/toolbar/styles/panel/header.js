
(function() {
    window.GeminiStyles = window.GeminiStyles || {};
    window.GeminiStyles.PanelHeader = `
        /* --- Standard Header Styles --- */

        .ask-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 16px;
            cursor: move;
            user-select: none;
            background: #fff;
            flex-shrink: 0;
        }
        
        @media (max-width: 600px) {
            .ask-header {
                cursor: default; 
            }
        }

        .window-title {
            font-weight: 600;
            font-size: 15px;
            color: #1f1f1f;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 120px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        /* Custom Model Selector Dropdown */
        .model-dropdown {
            position: relative;
            display: inline-block;
        }

        .model-dropdown-trigger {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #f0f4f9;
            border: 1px solid transparent;
            border-radius: 18px;
            padding: 0 10px 0 12px;
            font-size: 13px;
            font-weight: 500;
            color: #444746;
            outline: none;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            height: 32px;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .model-dropdown-trigger:hover {
            background: #e9eef6;
            color: #1f1f1f;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .model-dropdown-trigger .dropdown-arrow {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }

        .model-dropdown-trigger .dropdown-arrow svg {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }

        .model-dropdown.open .dropdown-arrow {
            transform: rotate(180deg);
        }

        .model-dropdown-menu {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            min-width: 140px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
            padding: 6px;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-8px);
            transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
        }

        .model-dropdown.open .model-dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .model-dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 500;
            color: #444746;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            white-space: nowrap;
        }

        .model-dropdown-item:hover {
            background: #f0f4f9;
            color: #1f1f1f;
        }

        .model-dropdown-item.selected {
            background: #e8f0fe;
            color: #1a73e8;
        }

        .model-dropdown-item .check-icon {
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
        }

        .model-dropdown-item.selected .check-icon {
            opacity: 1;
        }

        .model-dropdown-item .check-icon svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: #5e5e5e;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, color 0.2s;
        }
        .icon-btn:hover {
            background: #f0f1f1;
            color: #1f1f1f;
        }
    `;
})();
