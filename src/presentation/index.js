import Slide from '../slide';
import parse from '../utils/dom/parse.js';
import '../notes';
import {create as createPopup, exists as popupExists} from '../notes/popup.js';

const styles = require('gulp-preprocess').inlineSass(__dirname + '/index.scss');

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
        <button class="pop-out"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"><path d="M9 0v2h3L7 7l2 2 5-5v3h2V0H9zm5 14H2V2h4V0H0v16h16v-6h-2v4z"/></svg></button>
      </div>
    `));

    this._slideDefs = [];
    this._currentSlideIndex = 0;
    this._currentSlide = null;
    this._listeners = [];
    this._slideContainer = shadowRoot.querySelector('.slides');
    this._popOutBtn = shadowRoot.querySelector('.pop-out');

    this.transition = true;
    this.notes = shadowRoot.querySelector('tpin-notes');

    this._popOutBtn.addEventListener('click', () => this._createPopup());
    popupExists.then(alreadyExists => {
      if (alreadyExists) this._createPopup();
    });
  }

  attachedCallback() {
    this._addExternalListener(document, 'keydown', event => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          this.transition = false;
          this.next();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.transition = false;
          this.previous();
          break;
        case ' ':
          event.preventDefault();
          this.transition = true;
          this.next();
          break;
      }
    });

    this._addExternalListener(window, 'resize', () => this._zoomSlides());
    this._zoomSlides();
  }

  detachedCallback() {
    this._removeAllExternalListeners();
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

  _createPopup() {
    createPopup(this.notes);
    this._popOutBtn.style.display = 'none';
    this._zoomSlides();
  }

  _setNextText() {
    this._currentSlide.nextPhaseName.then(name => {
      if (name === undefined) {
        name = (this._slideDefs[this._currentSlideIndex + 1] || {name: "No more slides"}).name;
      }
      this.notes.setNext(name);
    });
  }

  _zoomSlides() {
    this._slideContainer.style.scale = '';
    const rect = this._slideContainer.getBoundingClientRect();
    const parentRect = this._slideContainer.parentNode.getBoundingClientRect();
    this._slideContainer.style.scale = Math.min(parentRect.width / rect.width, parentRect.height / rect.height);
  }

  _addExternalListener(obj, ...listenerArgs) {
    obj.addEventListener(...listenerArgs);
    this._listeners.push([obj, ...listenerArgs]);
  }

  _removeAllExternalListeners() {
    for (const [obj, ...args] of this._listeners) {
      obj.removeEventListener(...args);
    }
  }
}

export default document.registerElement('tpin-presentation', Presentation);
