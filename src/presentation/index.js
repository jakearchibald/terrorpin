import Slide from '../slide';
import parse from '../utils/dom/parse.js';
import '../notes';

const styles = require('fs').readFileSync(__dirname + '/index.scss');

class Presentation extends HTMLElement {
  createdCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = styles;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(parse(`
      <div class="stage">
        <div class="slides"></div>
        <slot></slot>
      </div>
      <div class="notes">
        <tpin-notes></tpin-notes>
      </div>
    `));

    this._slideDefs = [];
    this._currentSlideIndex = 0;
    this._currentSlide = null;
    this._listeners = [];
    this._slideContainer = shadowRoot.querySelector('.slides');

    this.transition = true;
    this.notes = shadowRoot.querySelector('tpin-notes');
  }

  attachedCallback() {
    this._addListener(document, 'keydown', event => {
      switch (event.key) {
        case 'ArrowRight':
          this.transition = false;
          this.next();
          break;
        case 'ArrowLeft':
          this.transition = false;
          this.previous();
          break;
        case ' ':
          this.transition = true;
          this.next();
          break;
      }
    });

    this._addListener(window, 'resize', () => this._zoomSlides());
    this._zoomSlides();
  }

  detachedCallback() {
    this._removeAllListeners();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name == 'width' || name == 'height') {
      this.style.setProperty(`--presentation-${name}`, `${newVal}px`);
    }
  }

  addSlide(name, func) {
    this._slideDefs.push({name, func});

    if (this._slideDefs.length == 1) {
      this.goTo(0);
    }
  }

  async goTo(num, state = 0) {
    if (this._currentSlide) {
      this._slideContainer.removeChild(this._currentSlide);
    }
    this._currentSlide = new Slide();
    this._currentSlideIndex = num;
    this._slideContainer.appendChild(this._currentSlide);

    await this._currentSlide.run(this._slideDefs[num].func);

    while (state != 0 && !this._currentSlide.complete) {
      await this._currentSlide.next();
      state--;
    }

    this._setNextText();
  }

  _setNextText() {
    this._currentSlide.nextPhaseName.then(name => {
      if (name === undefined) {
        name = (this._slideDefs[this._currentSlideIndex + 1] || {name: "No more slides"}).name;
      }
      this.notes.setNext(name);
    });
  }

  previous() {
    if (this._currentSlide.state == 0) {
      if (this._slideDefs[this._currentSlideIndex - 1]) {
        this.goTo(this._currentSlideIndex - 1, -1);
      }
      return;
    }
    this.goTo(this._currentSlideIndex, this._currentSlide.state - 1);
  }

  next() {
    if (this._currentSlide.complete) {
      if (this._slideDefs[this._currentSlideIndex + 1]) {
        this.goTo(this._currentSlideIndex + 1);
      }
      return;
    }
    this._currentSlide.next();
    this._setNextText();
  }

  _zoomSlides() {
    this._slideContainer.style.scale = '';
    const rect = this._slideContainer.getBoundingClientRect();
    const parentRect = this._slideContainer.parentNode.getBoundingClientRect();
    this._slideContainer.style.scale = Math.min(parentRect.width / rect.width, parentRect.height / rect.height);
  }

  _addListener(obj, ...listenerArgs) {
    obj.addEventListener(...listenerArgs);
    this._listeners.push([obj, ...listenerArgs]);
  }

  _removeAllListeners() {
    for (const [obj, ...args] of this._listeners) {
      obj.removeEventListener(...args);
    }
  }
}

export default document.registerElement('tpin-presentation', Presentation);
