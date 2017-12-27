'use babel';
/** @jsx h **/

import { h, render, Component } from 'preact';

export default class Input extends Component {
  componentDidMount() {
    if (this.props.autoFocus) {
      this.autoFocus();
    }
  }
  autoFocus() {
    const { el } = this;
    el.focus();
    this.timer1 = setTimeout(() => {
      el.focus();
    }, 25);
    this.timer2 = setTimeout(() => {
      el.focus();
    }, 150);
  }
  render() {
    return (
      <input
        ref={(el) => { this.el = el }}
        class="input native-key-bindings"
        value={this.props.value}
        onInput={(event) => {
          this.props.onChange(event.target.value);
        }}
        onKeyUp={(event) => {
          if (event.key === 'Enter') {
            if (this.props.onSubmit) {
              this.props.onSubmit(this.props.value);
            }
          }
          if (event.key === 'Escape') {
            if (this.props.onCancel) {
              this.props.onCancel();
            }
          }
          if (event.key === 'ArrowUp') {
            this.props.onDirectional('Up');
          }
          if (event.key === 'ArrowDown') {
            this.props.onDirectional('Down');
          }
        }}
        onBlur={this.props.onBlur}
      />
    )
  }
}
