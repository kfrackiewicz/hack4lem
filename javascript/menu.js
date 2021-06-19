export class Menu {
    constructor(data, container, onPick) {
        this.data = data;
        this.container = container;
        this.onPick = onPick;

        this.hidePosition = {};

        this.radius = 100;
        this.pathAnimationTime = 200;
        this.onTouchMoveBind = this.onTouchMove.bind(this);

        this.title = document.createElement('menuTitle');
        this.container.appendChild(this.title);

        this.defaultTitle = `Przesuń do środka aby aktywować menu`;
        this.title.innerHTML = this.defaultTitle;

        this.freezeData(this.data);
    }

    freezeData(data) {
        Object.freeze(data);
        (data.children || []).forEach(this.freezeData.bind(this));
    }

    deepGet(id, node) {
        if (node.id === id) {
            return node;
        } else if (node.children) {
            for (const child of node.children) {
                const find = this.deepGet(id, child);
                if (find) {
                    return find;
                }
            }
        }

        return false;
    }

    hide() {
        if (this.svg && this.svg.parentElement === this.container) {
            this.container.removeChild(this.svg);
            this.svg = undefined;
        }

        if (this.currentHover && !this.currentHover.item.children) {
            const pick = this.currentHover.item;
            this.currentHover = undefined;

            this.onPick(this.deepGet(pick.id, this.data));

            return void 0;
        }

        this.container.removeEventListener('touchmove', this.onTouchMoveBind);
        this.currentHover = undefined;

        this.title.innerHTML = this.defaultTitle;
        this.title.style.borderColor = '';
        this.title.style.backgroundColor = '';
        document.body.style = this.previousBodyStyle;
    }

    onTouchMove(event) {        
        const { clientX, clientY } = event.touches[0];
        const element = document.elementFromPoint(clientX, clientY);

        if (!element) {
            return void 0;
        }

        if (element.tagName.toLowerCase() !== 'path' && this.currentHover) {
            if (this.currentHover.item.children) {
                const nextLevel = this.currentHover.item;

                this.hide();
                this.show(nextLevel);
            } else {
                this.hide();
            }
        }
        const item = this.paths.get(element);

        if (item && (this.currentHover || {}).item !== item) {
            if (this.currentHover) {
                this.currentHover.element.classList.remove('hover');
            }
            this.currentHover = { element, item };
            element.classList.add('hover');

            this.title.innerHTML = `<span>${item.title}</span>${item.description}`;
            this.title.style.borderColor = item.color;
            this.title.style.backgroundColor = `${item.color}50`;

            this.container.style.backgroundColor = item.color;
        }
    }

    getPoint(x, y, angle, radius) {
        const radians = (angle - 90) * Math.PI / 180.0;

        if (radius === undefined) {
            radius = this.radius;
        }

        return {
                x: x + (radius * Math.cos(radians)),
                y: y + (radius * Math.sin(radians))
            };
    }

    setPath(path, startAngle, endAngle) {
        let start;

        if (startAngle === 0 && endAngle === 360) {
            endAngle -= 0.1;
        }

        const step = (timestamp) => {
            let progress = 0;
            if (!start) {
                start = timestamp;
            } else {
                progress = (timestamp - start) / this.pathAnimationTime;
            }

            if (progress > 1) {
                this.animate(path, startAngle, endAngle);
            } else {
                const endAngleStep = startAngle + ((endAngle - startAngle) * progress);
                this.animate(path, startAngle, endAngleStep);
                window.requestAnimationFrame(step);
            }
          }
          
          window.requestAnimationFrame(step);
    }

    setIcons(icon, startAngle, endAngle) {
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        const halfRadius = (this.radius / 2);
        const halfAngle = startAngle + ((endAngle - startAngle) / 2);

        const position = this.getPoint(halfRadius, halfRadius, halfAngle, halfRadius);
        const imageSize = 40;
        const positionCorrection = halfRadius - (imageSize / 2); 

        image.setAttribute('href', `./images/icons/${icon}.png`);
        image.setAttribute('height', imageSize);
        image.setAttribute('width', imageSize);
        image.style.transform = `translate3d(${position.x + positionCorrection}px, ${position.y + positionCorrection}px, 0)`;

        this.svg.appendChild(image);
    }
    animate(path, startAngle, endAngle) {
        const start = this.getPoint(this.radius, this.radius, startAngle);
        const end = this.getPoint(this.radius, this.radius, endAngle);
        
        const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

        const cmd = [
            'M', start.x, start.y,
            'A', this.radius, this.radius, 0, largeArc, 1, end.x, end.y,
            'L', this.radius, this.radius,
            'Z'
          ];

        path.setAttribute('d', cmd.join(' '));
    }

    hasVisibleChildren(children) {
        return children.some(child => 
            !this.hidePosition[child.id] && (
                !child.children 
                || (
                    child.children 
                    && this.hasVisibleChildren(child.children)
                )
            )
        );
    }

    getChildren(node) {
        const children = this.getVisibleChildren(node.children || []);

        if (children.length === 1) {
            return this.getChildren(children[0]);
        }

        return children;
    }

    mergeWithChild(data) {
        if (!data.children) {
            return data;
        }

        
        if (data.children.length === 1 && data.children[0].children) {
            data.children[0].children.map(child => child.title = `${data.children[0].title} > ${child.title}`);
            data.children = data.children[0].children;
        }

        return data;
    }

    getVisibleData(data) {
        if (!data) {
            data = Object.assign({}, this.data);
        }

        if (data.children) {
            data = Object.assign({}, data, { children: data.children.slice(0) });
        }

        for (let i = 0; i < (data.children || []).length; i += 1) {
            const child = data.children[i];

            if (this.hidePosition[child.id] || (child.children && !this.hasVisibleChildren(child.children))) {
                data.children.splice(i, 1);
                i -= 1;
            } else {
                data.children[i] = Object.assign({}, this.getVisibleData(child));
            }
        }

        return data;
    }

    flatSingleChild(node) {
        if (!node.children) {
            return node;
        }

        node = Object.assign({}, node);
        node.children = node.children.slice(0);

        for (let i = 0; i < node.children.length; i += 1) {
            const child = this.flatSingleChild(node.children[i]);

            if (child.children && child.children.length === 1) {
                const subchild = child.children[0];

                node.children[i] = Object.assign({}, subchild, { 
                    title: `<main>${child.title}</main>${subchild.title}`,
                    description: `${child.description}. ${subchild.description}`
                });

            }
        }

        return node;
    }

    show(node) {
        if (node === undefined) {
            node = this.getVisibleData();
        }

        node = this.flatSingleChild(node);

        this.paths = new WeakMap();

        this.title.innerHTML = `Jeśteś w menu <span>${node.title}</span>`;
        this.title.style.borderColor = node.color;
        this.title.style.backgroundColor = `${node.color}50`;

        this.previousBodyStyle = document.body.style;

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', `0 0 ${this.radius * 2} ${this.radius * 2}`);
        this.container.appendChild(this.svg);

        const radiusStep = Math.floor(360 / node.children.length) ;
        let radiusStart = 0;

        for (const item of node.children) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            this.paths.set(path, item);
            this.svg.appendChild(path);

            path.setAttribute('stroke', item.color);
            path.setAttribute('stroke-miterlimit', 2);
            path.setAttribute('fill', item.color);
            
            this.setPath(path, radiusStart, radiusStart + radiusStep);
            this.setIcons(item.icon, radiusStart, radiusStart + radiusStep);

            radiusStart += radiusStep;
        }

        setTimeout(() => {
            this.container.addEventListener('touchmove', this.onTouchMoveBind);
        }, this.pathAnimationTime)
    }

    getTree(data) {
        const tree = document.createElement('tree');

        if (data.id !== 'root') {
            const label = document.createElement('label');
            const span = document.createElement('span');
            
            span.innerText = data.title;

            if (!data.children) {
                const checkbox = document.createElement('input');

                checkbox.setAttribute('type', 'checkbox');
                if (!this.hidePosition[data.id]) {
                    checkbox.setAttribute('checked', 'checked');
                }
                label.appendChild(checkbox);

                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        delete this.hidePosition[data.id];
                    } else {
                        this.hidePosition[data.id] = true;
                    }
                })
            } else {
                label.classList.add('group');
            }

            label.appendChild(span);
            tree.appendChild(label);
        }

        for (const child of data.children || []) {
            tree.appendChild(this.getTree(child));
        }
        
        return tree;
    }
    openSettings() {
        if (this.settings) {
            this.settings.classList.remove('hide');
            return void 0;
        }

        this.settings = document.createElement('settings');

        const title = document.createElement('hello');
        const tree = document.createElement('tree');
        const close = document.createElement('close');

        title.innerHTML = `Ustawienia widoczności <span>Menu</span>`;
        tree.appendChild(this.getTree(this.data));
        close.innerHTML = `wyjdź`;

        close.addEventListener('click', () => {
            this.settings.classList.add('hide');
        });

        this.settings.appendChild(title);
        this.settings.appendChild(tree);
        this.settings.appendChild(close);

        this.container.appendChild(this.settings);
    }
}