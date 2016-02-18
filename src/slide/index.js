class Slide extends HTMLElement {
  attachedCallback() {
    console.log('ATTACHED');
  }
  detachedCallback() {

  }
}

document.registerElement('terrorpin-slide', Slide);
