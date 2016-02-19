import parse from '../../utils/dom/parse.js';
import transitionToClass from '../../utils/dom/transitionToClass.js';

const styles = require('fs').readFileSync(__dirname + '/index.scss');

class Heading extends HTMLElement {
  createdCallback() {
    this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(parse(`
      <h1><slot></slot></h1>
    `));
  }

  attachedCallback() {
    transitionToClass(this.shadowRoot.querySelector('h1'));
  }
}

export default document.registerElement('tpin-h', Heading);
