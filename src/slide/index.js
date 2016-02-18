class Slide extends HTMLElement {
  createdCallback() {
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
}

export default document.registerElement('terrorpin-slide', Slide);
