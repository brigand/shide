'use babel';
/** @jsx h **/

import { h, render, Component } from 'preact';
import Input from './Input';
import SelectOptions from './SelectOptions';
import fuzzy from './fuzzyStrategies';

const htmlEscape = str => {
  var n = document.createElement('div');
  n.textContent = str;
  return n.innerHTML;
};

class FilterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { search: '', activeItem: 0 };

    // used for display and fuzzy search
    this.extract = {
      search: x => x.text,
      displayText: x => x.text,
      displayHtml: x => x.html || htmlEscape(x.text),
    };
  }

  filter(search = this.state.search) {
    if (!search) return this.props.options;

    return fuzzy.normal(search, this.props.options, this.extract.search);
  }

  filterCap(search) {
    return this.filter(search).slice(0, 100);
  }

  clipActiveItem(_index, xs = this.filterCap()) {
    let index = _index;
    const len = xs.length;

    if (index < 0) {
      index = len + index;
    }
    if (index >= len) {
      index = index % len;
    }

    if (index >= 0 && index < len) return index;
    return 0;
  }

  render() {
    const filtered = this.filterCap();

    return (
      <div>
        <Input
          autoFocus
          value={this.state.search}
          onChange={search => {
            let activeItem = this.state.activeItem;
            activeItem = this.clipActiveItem(this.state.activateItem, this.filterCap(activeItem));
            this.setState({ search, activeItem });
          }}
          onSubmit={() => {
            const item = filtered[this.state.activeItem];
            this.props.onSelect(item);
          }}
          onCancel={this.props.onCancel}
          onDirectional={(direction) => {
            if (direction === 'Up') {
              const activeItem = this.clipActiveItem(this.state.activeItem - 1, filtered);
              this.setState({ activeItem });
            }
            if (direction === 'Down') {
              const activeItem = this.clipActiveItem(this.state.activeItem + 1, filtered);
              this.setState({ activeItem });
            }
          }}
          onBlur={() => {
            this.props.onCancel();
          }}
        />
        <SelectOptions
          activeItem={this.state.activeItem}
          options={this.filterCap()}
          extract={this.extract}
          // Handle the items being clicked
          onSelect={(item) => {
            this.props.onSelect(item);
          }}
        />
      </div>
    );
  }
}

export default FilterSelect;
