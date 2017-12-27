'use babel';
/** @jsx h **/

import { h, render } from 'preact';
import SelectModal from './SelectModal';

export default class SelectUi {
  constructor({ callback, ...opts }) {
    this.element = document.createElement('div');
    this.element.classList.add('atom-shide-prompt');

    const options = opts.options.map((x) => {
      if (typeof x === 'string') return { text: x, value: x };
      if (!x.text) return { text: x.value, value: x.value };
      if (!x.value) return { text: x.text, value: x.text };
      return x;
    });

    this.preactRoot = render(
      <SelectModal
        fuzzyType={opts.fuzzyType}
        allowAnyText={!!opts.allowAnyText}
        options={options}
        onSelect={(value) => callback(null, { response: value && value.value })}
        onCancel={() => callback(null, { response: '' })}
      />,
      this.element,
    );
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
    render('', this.element, this.preactRoot);
    this.element.remove();
    clearTimeout(this.timer1);
    clearTimeout(this.timer2);
  }

  getElement() {
    return this.element;
  }
}
