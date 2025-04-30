'use strict';

// Import required modules
import { ChromeStorage } from './services.js';
import { Blocker } from './services.js';
import { Helper } from './services.js';

// Initialize the service worker
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changedInfo, tab) => {
    if (!tab.url) return;
    
    const domain = Helper.getDomain(tab.url);
    
    try {
        const blockedList = await Blocker.getAllBlockedPromise();
        
        // Update badge
        await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 190] });
        await chrome.action.setBadgeText({ text: blockedList.length.toString() });
        
        // Check if domain is blocked
        const isBlocked = await Blocker.isBlocked(domain);
        
        if (isBlocked) {
            // Store the domain
            await ChromeStorage.put('last_domain', domain);
            // Inject content script to block the page
            await chrome.tabs.sendMessage(tabId, { action: 'block' });
        }
    } catch (error) {
        console.error('Error in background service worker:', error);
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'openOptions') {
        chrome.runtime.openOptionsPage();
    } else if (message.action === 'unlockCurrentDomain') {
        const tab = await chrome.tabs.get(sender.tab.id);
        const domain = Helper.getDomain(tab.url);
        if (domain) {
            await Blocker.removeBlock(domain);
            await chrome.tabs.reload(sender.tab.id);
        }
    } else if (message.action === 'isDomainBlocked') {
        const isBlocked = await Blocker.isBlocked(message.domain);
        sendResponse(isBlocked);
        return true; // Keep the message channel open for async response
    }
});
