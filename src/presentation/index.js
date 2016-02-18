import Slide from './slide.js';

class Presentation extends HTMLElement {
  createdCallback() {
    this._slideDefs = [];
    this._currentSlideIndex = 0;
    this._currentSlide = null;
    this._listeners = [];
    this.transition = true;
  }

  attachedCallback() {
    this._addListener(document, 'keydown', event => {
      switch (event.key) {
        case 'ArrowRight':
          this.next();
          break;
        case 'ArrowLeft':
          this.previous();
          break;
      }
    });
  }

  detachedCallback() {
    this._removeAllListeners();
  }

  addSlide(name, func) {
    this._slideDefs.push({name, func});

    if (this._slideDefs.length == 1) {
      this.goTo(0);
    }
  }

  async goTo(num, state = 0) {
    if (this._currentSlide) {
      this.removeChild(this._currentSlide);
    }
    this._currentSlide = new Slide();
    this._currentSlideIndex = num;
    this.appendChild(this._currentSlide);
    await this._currentSlide.run(this._slideDefs[num].func);

    while (state != 0 && !this._currentSlide.complete) {
      await this._currentSlide.next();
      state--;
    }
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
  }

  _addListener(obj, ...listenerArgs) {
    obj.addEventListener(...listenerArgs);
    this._listeners.push([obj, ...listenerArgs]);
  }

  _removeAllListeners() {
    for (const [obj, ...args] of this._listeners) {
      obj.removeEventListern(...args);
    }
  }
}

export default document.registerElement('terrorpin-presentation', Presentation);
