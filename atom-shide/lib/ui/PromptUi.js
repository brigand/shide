'use babel';

export default class PromptUi {
  constructor({ message, callback }) {
    // Create root element
    this.message = message;
    this.callback = callback;

    this.element = document.createElement('div');
    this.element.classList.add('atom-shide-prompt');
    this.element.appendChild(this.makeMessageEl());
    this.element.appendChild(this.makeInputEl());
  }

  makeMessageEl() {
    const el = document.createElement('div');
    el.textContent = this.message;
    el.classList.add('message');
    // el.addEventListener('click', () => {
    //   this.callback(null, { response: 'Clicked' });
    // });
    return el;
  }

  makeInputEl() {
    const el = document.createElement('input');
    el.type = 'text';
    el.classList.add('input');
    el.classList.add('native-key-bindings');
    el.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        this.callback(null, { response: el.value });
      }
      if (event.key === 'Escape') {
        this.callback(null, { response: '' });
      }
    });
    el.focus();
    this.timer1 = setTimeout(() => {
      el.focus();
    }, 25);
    this.timer2 = setTimeout(() => {
      el.focus();
    }, 150);
    return el;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
  }

  getElement() {
    return this.element;
  }
}
