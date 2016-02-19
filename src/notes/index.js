import parse from '../utils/dom/parse.js';

const styles = require('fs').readFileSync(__dirname + '/index.scss');

class Notes extends HTMLElement {
  createdCallback() {
    const shadowRoot = this.attachShadow({mode: 'open'});
    const style = document.createElement('style');
    style.textContent = styles;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(parse(`
      <div class="meta">
        <div class="time"></div>
        <div class="next"></div>
      </div>
      <div class="notes">
        <ol></ol>
      </div>
    `));

    this._startTime = 0;
    this._notesList = shadowRoot.querySelector('.notes ol');
    this._next = shadowRoot.querySelector('.next');
    this._time = shadowRoot.querySelector('.time');
    this._timeInterval = 0;
  }

  set(...notes) {
    notes = notes.reduce((all, note) => {
      all.push(...note.split(/\n/g).filter(s => s.trim()));
      return all;
    },[]);

    this._notesList.innerHTML = '';

    for (const note of notes) {
      const li = document.createElement('li');
      li.textContent = note;
      this._notesList.appendChild(li);
    }
  }

  setNext(next) {
    this._next.textContent = next;
  }

  startTimer() {
    this._startTime = Date.now();
    clearInterval(this._timeInterval);

    this._timeInterval = setInterval(() => {
      requestAnimationFrame(() => this._updateTime());
    }, 1000);
    this._updateTime();
  }

  _updateTime() {
    const duration = Date.now() - this._startTime;
		const hours    = Math.floor(duration / (1000 * 60 * 60));
		const minutes  = Math.floor(duration / (1000 * 60)) - hours * 60;
		const seconds  = Math.floor(duration / 1000) - hours * 60 * 60 - minutes * 60;
		const timeParts = [
			hours,
			minutes,
			seconds
		].map(part => (part < 10 ? '0' : '') + part);

		this._time.textContent = timeParts.join(':');
  }
}

export default document.registerElement('tpin-notes', Notes);
