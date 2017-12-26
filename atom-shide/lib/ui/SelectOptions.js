'use babel';
/** @jsx h **/

import { h, render, Component } from 'preact';

class SelectOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div class="ShideSelectOptions">
        {this.props.options.map((x, i) => this.renderItem(x, i))}
      </div>
    );
  }

  renderItem(x, i) {
    const text = this.props.extract(x);

    let className = `ShideSelectOptions__Item`;
    if (i === this.props.activeItem) className = `${className} ShideSelectOptions__Item--active`;

    return (
      <div class={className}>
        {text}
      </div>
    );
  }
}

export default SelectOptions;
