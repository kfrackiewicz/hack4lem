import { Arrow } from './arrow.js';
import { Menu } from './menu.js';

export class Trigger {
    constructor(container, onMenuPick) {
        this.container = container;
        this.onMenuPick = onMenuPick;
        this.async();
    }

    async async () {
        this.menuData = await fetch('./data/menu.json').then(response => response.json());
 
        this.prepare();
        this.live();
    }
    
    get() {
        return this.trigger;
    }

    prepare() {
        this.menu = new Menu(this.menuData, this.container, this.onPick.bind(this));

        this.trigger = document.createElement('trigger');
        this.triggerDrop = document.createElement('triggerDrop');

        this.container.appendChild(this.trigger);
        this.container.appendChild(this.triggerDrop);
    }
    
    onPick(menuPick) {
        this.onTouchEnd();
        this.onMenuPick(menuPick);
    }

    setPosition(x, y) {
        this.trigger.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    resetArrows()  {
        clearInterval(this.arrowsTimer);

        this.arrows.forEach(arrow => this.container.removeChild(arrow.get()));
        this.arrows = [];
    }

    resetTrigger() {
        this.trigger.style.transform = 'translate3d(0, 0, 0)';
        this.position = { x: 0, y: 0 };
    }

    reset() {
        if (this.settingsTimer) {
            clearTimeout(this.settingsTimer);
            delete this.settingsTimer;
        }

        this.trigger.classList.remove('up');
        this.triggerDrop.classList.remove('up');
        this.container.classList.remove('hide');
        this.container.classList.remove('inMenu');

        this.resetTrigger();
        this.resetArrows();
    }

    navigate() {
        this.arrows = [];

        this.arrowsTimer = setInterval(() => {
            this.arrows.push(new Arrow());
            this.container.appendChild(this.arrows[this.arrows.length - 1].get());
        }, 300);
    }

    onTouchStart(event) {
        const { clientX, clientY } = event.touches[0];

        this.touching = true;
        this.position = { x: clientX, y: clientY };
        this.trigger.classList.add('up');
        this.triggerDrop.classList.add('up');
        this.container.classList.add('hide');

        this.navigate();

        this.settingsTimer = setTimeout(() => {
            this.onTouchEnd();
            this.menu.openSettings();
        }, 1000);
    }

    showMenu() {
        this.touching = false;
        this.inMenu = true;
        this.container.classList.add('inMenu');

        this.resetArrows();
        this.menu.show();
    }

    onTouchMove(event) {
        if (!this.touching) {
            return void 0;
        }
        
        if (this.settingsTimer) {
            clearTimeout(this.settingsTimer);
            delete this.settingsTimer;
        }

        const { clientX, clientY } = event.touches[0];

        this.setPosition(clientX - this.position.x, clientY - this.position.y);

        if (document.elementFromPoint(clientX, clientY) === this.triggerDrop) {
            this.showMenu();
        }
    }

    onTouchEnd() {
        this.touching = false;
        this.reset();

        if (this.inMenu) {
            this.menu.hide();
            this.inMenu = false;
        }
    }

    live() {
        this.trigger.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.trigger.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.trigger.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        this.trigger.addEventListener('touchcancel', this.onTouchEnd.bind(this), false);
    }
}