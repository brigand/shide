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
    const html = this.props.extract.displayHtml(x);

    let className = `ShideSelectOptions__Item`;
    if (i === this.props.activeItem) className = `${className} ShideSelectOptions__Item--active`;

    return (
      <div class={className} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
}

export default SelectOptions;
