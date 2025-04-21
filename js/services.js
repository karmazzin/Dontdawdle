'use strict';

// Chrome Service
export class ChromeService {
    static async tabsPromise() {
        const tabs = await chrome.tabs.query({currentWindow: true, active: true});
        return tabs[0];
    }
}

// Helper Service
export class Helper {
    static getDomain(url) {
        const m = url.match(/^(http|https):\/\/[^/]+/);
        return m ? m[0] : '';
    }
}

// Blocker Service
export class Blocker {
    static async _setAllBlocked(list) {
        await ChromeStorage.put('blocklist', list);
    }

    static async isBlocked(domain) {
        const blockedList = await this.getAllBlockedPromise();
        return blockedList.indexOf(domain) >= 0;
    }

    static async addBlockPromise(domain) {
        const isBlocked = await this.isBlocked(domain);
        if (isBlocked) return;

        const blockedList = await this.getAllBlockedPromise();
        blockedList.push(domain);
        await this._setAllBlocked(blockedList);
    }

    static async removeBlock(domain) {
        const isBlocked = await this.isBlocked(domain);
        if (!isBlocked) return;

        const blockedList = await this.getAllBlockedPromise();
        const index = blockedList.indexOf(domain);
        if (index > -1) {
            blockedList.splice(index, 1);
            await this._setAllBlocked(blockedList);
        }
    }

    static async getAllBlockedPromise() {
        const result = await ChromeStorage.getPromise('blocklist');
        return result || [];
    }
}

// Chrome Storage Service
export class ChromeStorage {
    static async getPromise(key) {
        const result = await chrome.storage.sync.get(key);
        return result[key];
    }

    static async put(key, value) {
        await chrome.storage.sync.set({ [key]: value });
    }
}

// Initialize blocklist if empty
(async () => {
    const blockedList = await Blocker.getAllBlockedPromise();
    if (!Array.isArray(blockedList) || !blockedList.length) {
        await Blocker._setAllBlocked([]);
    }
})();
