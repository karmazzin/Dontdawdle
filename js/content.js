// Content script for injecting blocked page content

// Function to check if current domain is blocked
async function checkAndBlock() {
    const domain = window.location.href.match(/^(http|https):\/\/[^/]+/)?.[0];
    if (!domain) return;

    try {
        const response = await chrome.runtime.sendMessage({ action: 'checkDomain', domain });
        if (response && response.isBlocked) {
            injectBlockedContent();
        }
    } catch (error) {
        console.error('Error checking domain:', error);
    }
}

// Function to create and inject the blocked page content
function injectBlockedContent() {
    // Stop page loading
    window.stop();
    
    // Clear the entire page content
    document.documentElement.innerHTML = '';
    
    // Create new head and body elements
    const head = document.createElement('head');
    const body = document.createElement('body');
    
    // Add meta charset
    const meta = document.createElement('meta');
    meta.setAttribute('charset', 'UTF-8');
    head.appendChild(meta);
    
    // Add viewport meta
    const viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    head.appendChild(viewport);
    
    // Add favicon
    const favicon = document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('type', 'image/png');
    favicon.setAttribute('href', chrome.runtime.getURL('i/128.png'));
    head.appendChild(favicon);
    
    // Add apple-touch-icon for Safari
    const appleIcon = document.createElement('link');
    appleIcon.setAttribute('rel', 'apple-touch-icon');
    appleIcon.setAttribute('href', chrome.runtime.getURL('i/128.png'));
    head.appendChild(appleIcon);
    
    // Add shortcut icon
    const shortcutIcon = document.createElement('link');
    shortcutIcon.setAttribute('rel', 'shortcut icon');
    shortcutIcon.setAttribute('href', chrome.runtime.getURL('i/128.png'));
    head.appendChild(shortcutIcon);
    
    // Create container for blocked content
    const container = document.createElement('div');
    container.id = 'dontdawdle-blocked-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        margin: 0;
        border: none;
        box-shadow: none;
    `;

    // Create content wrapper with specific styles
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    `;

    // Create content with specific styles
    contentWrapper.innerHTML = `
        <img src="${chrome.runtime.getURL('i/homer.jpg')}" alt="Homer Simpson" style="max-width: 50%; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;"/>
        <h1 style="font-size: 24px; margin: 20px 0; color: #333;">Ага, попался!</h1>
        <h2 style="font-size: 20px; margin: 20px 0; color: #666;">Давай работай!</h2>
        <div style="max-width: 480px; margin: 0 auto 10px; padding: 15px; background: #f5f5f5; border: 1px solid #e3e3e3; border-radius: 4px;">
            <button class="btn btn-primary" id="unlock-button" style="margin: 5px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; border-radius: 4px; color: #fff; background-color: #337ab7; border-color: #2e6da4; display: inline-block; margin-bottom: 0; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; border: 1px solid transparent;">Разблокировать домен</button>
            <button class="btn btn-secondary" id="list-button" style="margin: 5px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; border-radius: 4px; color: #fff; background-color: #6c757d; border-color: #545b62; display: inline-block; margin-bottom: 0; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; border: 1px solid transparent;">Перейти к списку</button>
        </div>
    `;

    // Create confirmation dialog (initially hidden)
    const dialog = document.createElement('div');
    dialog.id = 'unlock-confirmation-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 2147483648;
        display: none;
        text-align: center;
        min-width: 300px;
    `;
    dialog.innerHTML = `
        <h3 style="margin-top: 0; color: #333;">Вы уверены?</h3>
        <p style="color: #666; margin-bottom: 20px;">Может лучше поработать?</p>
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirm-unlock" disabled style="margin: 5px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; border-radius: 4px; color: #fff; background-color: #d9534f; border-color: #d43f3a; display: inline-block; margin-bottom: 0; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; cursor: not-allowed; border: 1px solid transparent; opacity: 0.5;">Да, разблокировать (20 секунд)</button>
            <button id="cancel-unlock" style="margin: 5px; padding: 6px 12px; font-size: 14px; line-height: 1.42857143; border-radius: 4px; color: #fff; background-color: #5cb85c; border-color: #4cae4c; display: inline-block; margin-bottom: 0; font-weight: 400; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; border: 1px solid transparent;">Нет, поработаю лучше</button>
        </div>
    `;

    // Add event listeners
    contentWrapper.querySelector('#unlock-button').addEventListener('click', () => {
        dialog.style.display = 'block';
        
        // Start countdown timer
        const confirmButton = dialog.querySelector('#confirm-unlock');
        let countdown = 20;
        
        const timer = setInterval(() => {
            countdown--;
            confirmButton.textContent = `Да, разблокировать (${countdown} секунд)`;
            
            if (countdown <= 0) {
                clearInterval(timer);
                confirmButton.disabled = false;
                confirmButton.style.cursor = 'pointer';
                confirmButton.style.opacity = '1';
                confirmButton.textContent = 'Да, разблокировать';
            }
        }, 1000);
    });

    contentWrapper.querySelector('#list-button').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'openOptions' });
    });

    dialog.querySelector('#confirm-unlock').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'unlockCurrentDomain' });
    });

    dialog.querySelector('#cancel-unlock').addEventListener('click', () => {
        dialog.style.display = 'none';
    });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #dontdawdle-blocked-container * {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            box-sizing: border-box;
        }
        #dontdawdle-blocked-container button:hover {
            opacity: 0.9;
        }
        #dontdawdle-blocked-container button:active {
            transform: translateY(1px);
        }
        #unlock-confirmation-dialog button:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }
    `;
    head.appendChild(style);

    // Add the content wrapper to the container
    container.appendChild(contentWrapper);
    body.appendChild(container);
    body.appendChild(dialog);

    // Add head and body to document
    document.documentElement.appendChild(head);
    document.documentElement.appendChild(body);
}

// Check domain immediately when script loads
checkAndBlock();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'block') {
        injectBlockedContent();
    } else if (message.action === 'checkDomain') {
        const domain = window.location.href.match(/^(http|https):\/\/[^/]+/)?.[0];
        if (!domain) {
            sendResponse({ isBlocked: false });
            return;
        }
        
        chrome.runtime.sendMessage({ action: 'isDomainBlocked', domain }, (response) => {
            sendResponse({ isBlocked: response });
        });
        return true; // Keep the message channel open for async response
    }
}); 