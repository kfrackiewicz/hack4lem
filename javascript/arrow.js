export class Arrow {
    constructor() {
        this.prepare();
    }

    prepare() {
        this.arrow = document.createElement('arrow');
    }
    get() {
        return this.arrow;
    }
}