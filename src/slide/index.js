import parse from '../utils/dom/parse';

const styles = require('fs').readFileSync(__dirname + '/index.scss');

class Slide extends HTMLElement {
  createdCallback() {
    this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(parse(`
      <slot></slot>
    `));

    this.complete = false;
    this._stateContinuer = null;
    this._phaseResolver = () => {};
    this.state = 0;
  }

  attachedCallback() {
  }

  detachedCallback() {
  }

  run(func) {
    const phasePromise = this._nextPhaseDone();

    Promise.resolve(func(this)).then(() => {
      this.complete = true;
      this._phaseResolver();
    });

    return phasePromise;
  }

  _nextPhaseDone() {
    return new Promise(resolve => {
      this._phaseResolver = resolve;
    });
  }

  addState() {
    this._phaseResolver();
    return new Promise(resolve => {
      this._stateContinuer = resolve;
    });
  }

  next() {
    if (this._stateContinuer) {
      const phasePromise = this._nextPhaseDone();
      this.state++;
      this._stateContinuer();
      return phasePromise;
    }
  }

  add(content) {
    if (typeof content == 'string') {
      let nodes = parse(content);
      this.appendChild(nodes);
      return nodes.firstElementChild;
    }
    this.appendChild(content);
    return content;
  }
}

export default document.registerElement('tpin-slide', Slide);
