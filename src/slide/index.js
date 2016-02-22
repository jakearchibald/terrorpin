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
    this._phaseNameResolver = () => {};
    this.nextPhaseName = Promise.resolve(undefined);
    this.state = 0;
  }

  attachedCallback() {
  }

  detachedCallback() {
  }

  run(func) {
    this._createPhaseNamePromise();

    Promise.resolve(func(this)).then(() => {
      this.complete = true;
      this._phaseNameResolver(undefined);
    });

    return this.nextPhaseName.then(() => undefined);
  }

  _createPhaseNamePromise() {
    this.nextPhaseName = new Promise(resolve => {
      this._phaseNameResolver = resolve;
    });
  }

  addState(name) {
    return new Promise(resolve => {
      if (this._stateContinuer) throw Error("Cannot add a state while a state is pending");
      if (this.complete) throw Error("Cannot add slide state after slide is complete");

      this._phaseNameResolver(name);
      this._stateContinuer = resolve;
    });
  }

  next() {
    if (this._stateContinuer) {
      this._createPhaseNamePromise();
      this.state++;
      this._stateContinuer();
      this._stateContinuer = null;
      return this.nextPhaseName.then(() => undefined);
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
