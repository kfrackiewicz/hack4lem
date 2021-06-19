import { Trigger }  from './trigger.js';

export class Main {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        const welcome = document.createElement('welcome');
        const title = document.createElement('hello');

        title.innerHTML = `Dotknij aby się <span>zalogować</span>`;
        welcome.addEventListener('click', () => {
            document.documentElement.webkitRequestFullScreen();
            welcome.classList.add('hide');
            this.start();
        });

        welcome.appendChild(title);
        this.container.appendChild(welcome);
    }

    async start() {
        this.data = await fetch('./data/status.json').then(response => response.json());
        this.dataHistory = await fetch('./data/history.json').then(response => response.json());

        this.prepare();
    }

    getHistory() {
        return this.dataHistory.map(item => 
            `<div class="${item.type} ${item.amount > 0 ? 'in' : 'out'}">
                <span class="when">${item.when}</span>
                <span class="title">${item.title}</span>
                <span class="amount">${this.moneyToDisplay(item.amount)}</span>
            </div>`)
    }

    moneyToDisplay(value) {
        return `${String(value).replace('.', ',')} PLN`;
    }

    prepare() {
        this.wrapper = document.createElement('wrapper');

        this.hello = document.createElement('hello');
        this.hello.innerHTML = `Witaj ponownie <span>${this.data.name}</span>`;

        this.balance = document.createElement('balance');
        this.balance.innerHTML = `Dostępne saldo <span>${this.moneyToDisplay(this.data.balance)}</span>`;

        this.history = document.createElement('history');
        this.history.innerHTML = `Ostatnie operacje ${this.getHistory().join('')}`;

        this.container.appendChild(this.hello);
        this.container.appendChild(this.balance);
        this.container.appendChild(this.history );

        this.trigger = new Trigger(this.container, this.onMenuPick.bind(this));
        this.container.appendChild(this.wrapper);
    }

    onMenuPick(node) {
        if (!this.page) {
            this.page = document.createElement('page');
            this.title = document.createElement('hello');
            this.description = document.createElement('description');

            const placeholder = document.createElement('placeholder');
            const close = document.createElement('close');
    
            placeholder.innerHTML = `
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Aenean a arcu ac erat volutpat mollis. Integer quam lacus, 
                malesuada eu tristique at, pharetra vitae dui. Quisque quis 
                nisi non lectus luctus molestie a in nisi. Duis placerat 
                laoreet tortor. Aliquam erat volutpat. Integer scelerisque, 
                dolor eu aliquam sagittis, justo dui hendrerit leo, ac 
                molestie justo est ut sapien. Quisque commodo lacinia 
                turpis. Donec condimentum enim a vulputate ultricies. Mauris 
                a magna risus. Sed auctor ullamcorper ex ullamcorper tempus. 
                Nullam accumsan, risus vel porttitor commodo, mi ligula v
                ulputate sem, et porttitor nibh libero vel odio.
                <br/><br/>
                Mauris maximus interdum ligula, sed sollicitudin metus. 
                Nullam non eleifend tellus, eget lacinia diam. Aliquam 
                dignissim a magna egestas semper. Phasellus at rutrum libero. 
                Pellentesque habitant morbi tristique senectus et netus et 
                malesuada fames ac turpis egestas. Suspendisse molestie 
                enim in ultricies sollicitudin. Mauris at ultrices eros. 
                Vestibulum commodo, lacus vel aliquet vehicula, felis nisi 
                ultrices ante, vel ultrices felis augue vitae nisl. Nullam 
                tellus mi, porttitor eu arcu sed, tincidunt eleifend mi. 
                Nulla maximus tellus aliquam leo aliquet iaculis. Aenean 
                posuere mauris ac egestas hendrerit.;`

            close.innerHTML = `wyjdź`;
    
            close.addEventListener('click', () => {
                this.page.classList.add('hide');
            });
    
            this.page.appendChild(this.title);
            this.page.appendChild(this.description);
            this.page.appendChild(placeholder);
            this.page.appendChild(close);

            this.container.appendChild(this.page);
        }

        this.page.classList.remove('hide');

        this.title.innerHTML = `<span>${node.title}</span>`;
        this.description.innerText = node.description;

        this.description.style.backgroundColor = `${node.color}50`;

        this.page.style.borderColor = `${node.color}`;        
    }
}