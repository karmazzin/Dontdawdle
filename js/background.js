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
            // Store the domain and redirect
            await ChromeStorage.put('last_domain', domain);
            await chrome.tabs.update(tabId, { url: "blocked.html" });
        }
    } catch (error) {
        console.error('Error in background service worker:', error);
    }
});
