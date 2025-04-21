'use strict';

import { ChromeService } from './services.js';
import { Helper } from './services.js';
import { ChromeStorage } from './services.js';
import { Blocker } from './services.js';

// Popup Controller
export class PopupController {
    constructor() {
        this.domain = '';
        this.init();
    }

    async init() {
        const tab = await ChromeService.tabsPromise();
        this.domain = Helper.getDomain(tab.url);
        this.render();
    }

    async lockCurrentUrl() {
        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackEvent', 'Block', 'Block domain ' + this.domain]);
        }

        await Blocker.addBlockPromise(this.domain);
        await ChromeStorage.put('last_domain', this.domain);
        const tab = await ChromeService.tabsPromise();
        await chrome.tabs.update(tab.id, { url: "blocked.html" });
        window.close();
    }

    render() {
        const container = document.getElementById('popup-content');
        if (!container) return;

        if (!this.domain) {
            container.innerHTML = '<h4>Эту страницу нельзя заблокировать</h4>';
        } else {
            container.innerHTML = `
                <input class="btn btn-sm btn-danger" type="button" value="Заблокировать" id="block-button">
            `;
            document.getElementById('block-button').addEventListener('click', () => this.lockCurrentUrl());
        }
    }
}

// Lock Controller
export class LockController {
    constructor() {
        this.init();
    }

    async init() {
        this.tab = await ChromeService.tabsPromise();
        this.render();
    }

    async unlockLastDomain() {
        const lastDomain = await ChromeStorage.getPromise('last_domain');
        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackEvent', 'Unlock last', 'Unlock last domain ' + lastDomain]);
        }

        await Blocker.removeBlock(lastDomain);
        await chrome.tabs.update(this.tab.id, { url: lastDomain });
    }

    async redirectToList() {
        await chrome.tabs.update(this.tab.id, { url: "options.html" });
    }

    render() {
        const container = document.getElementById('lock-content');
        if (!container) return;

        container.innerHTML = `
            <button class="btn btn-primary" id="unlock-button">Разблокировать последний домен</button>
            <button class="btn btn-secondary" id="list-button">Перейти к списку</button>
        `;

        document.getElementById('unlock-button').addEventListener('click', () => this.unlockLastDomain());
        document.getElementById('list-button').addEventListener('click', () => this.redirectToList());
    }
}

// List Controller
export class ListController {
    constructor() {
        this.domains = [];
        this.init();
    }

    async init() {
        this.domains = await Blocker.getAllBlockedPromise();
        this.render();
        this.setupEventListeners();
    }

    async unlockDomain(domain) {
        if (typeof _gaq !== 'undefined') {
            _gaq.push(['_trackEvent', 'Unlock', 'Unlock domain ' + domain]);
        }

        await Blocker.removeBlock(domain);
        this.domains = this.domains.filter(d => d !== domain);
        await chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 190] });
        await chrome.action.setBadgeText({ text: this.domains.length.toString() });
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const container = document.getElementById('list-content');
        if (!container) return;

        // Use event delegation for the unlock buttons
        container.addEventListener('click', (event) => {
            const button = event.target.closest('.unlock-button');
            if (button && button.dataset.domain) {
                this.unlockDomain(button.dataset.domain);
            }
        });
    }

    render() {
        const container = document.getElementById('list-content');
        if (!container) return;

        if (this.domains.length === 0) {
            container.innerHTML = '<p>Нет заблокированных доменов</p>';
            return;
        }

        container.innerHTML = `
            <ul class="list-group">
                ${this.domains.map(domain => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${domain}
                        <button class="btn btn-sm btn-danger unlock-button" data-domain="${domain}">
                            Разблокировать
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
    }
}