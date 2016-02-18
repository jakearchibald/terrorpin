class Presentation extends HTMLElement {
  attachedCallback() {
    console.log('ATTACHED');
  }
}

export default document.registerElement('terrorpin-presentation', Presentation);
