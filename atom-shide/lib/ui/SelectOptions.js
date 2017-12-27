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
      <div class="ShideSelectOptions" ref={(el) => { this.el = el; }}>
        {this.props.options.map((x, i) => this.renderItem(x, i))}
      </div>
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeItem) this.scrollIntoView();
  }

  scrollIntoView() {
    const active = this.el.querySelector('.ShideSelectOptions__Item--active');
    if (!active) return;

    // Find the scroll container
    let scrollCont = active.parentNode;
    while (scrollCont && scrollCont.clientHeight >= scrollCont.scrollHeight) {
      scrollCont = scrollCont.parentNode;
    }

    if (!scrollCont) return;
    if (scrollCont.tagName !== 'DIV') return;

    const ib = active.getBoundingClientRect();
    const cb = scrollCont.getBoundingClientRect();
    let ctop = scrollCont.scrollTop;

    if (ib.top < cb.top) {
      ctop += ib.top - cb.top - ib.height;
    }
    else if (ib.bottom > cb.bottom) {
      ctop += ib.bottom - cb.bottom;
    }

    scrollCont.scrollTop = ctop;
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
