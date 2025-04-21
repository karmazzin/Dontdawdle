// Initialize controllers based on the current page
import { PopupController } from './controllers.js';
import { LockController } from './controllers.js';
import { ListController } from './controllers.js';

// Determine which controller to initialize based on the current page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.endsWith('popup.html')) {
        window.popupController = new PopupController();
    } else if (path.endsWith('blocked.html')) {
        window.lockController = new LockController();
    } else if (path.endsWith('options.html')) {
        window.listController = new ListController();
    }
}); 