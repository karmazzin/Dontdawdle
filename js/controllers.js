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
        await Blocker.addBlockPromise(this.domain);
        await ChromeStorage.put('last_domain', this.domain);
        // Send message to content script to show block overlay
        const tab = await ChromeService.tabsPromise();
        await chrome.tabs.sendMessage(tab.id, { action: 'block' });
        window.close();
    }

    async goToList() {
        await chrome.runtime.openOptionsPage();
        window.close();
    }

    render() {
        const container = document.getElementById('popup-content');
        if (!container) return;

        if (!this.domain) {
            container.innerHTML = '<h4>Эту страницу нельзя заблокировать</h4>';
        } else {
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input class="btn btn-sm btn-danger" type="button" value="Заблокировать" id="block-button">
                    <input class="btn btn-sm btn-secondary" type="button" value="Перейти к списку доменов" id="list-button">
                </div>
            `;
            document.getElementById('block-button').addEventListener('click', () => this.lockCurrentUrl());
            document.getElementById('list-button').addEventListener('click', () => this.goToList());
        }
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
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th style="width: 70%">Домен</th>
                            <th style="width: 30%">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.domains.map(domain => `
                            <tr>
                                <td style="vertical-align: middle; word-break: break-all;">${domain}</td>
                                <td style="vertical-align: middle; text-align: right;">
                                    <button class="btn btn-sm btn-danger unlock-button" data-domain="${domain}">
                                        <span class="glyphicon glyphicon-remove"></span> Разблокировать
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}
