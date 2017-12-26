'use babel';
/** @jsx h **/

import { h, Component } from 'preact';
import FilterSelect from './FilterSelect';

class SelectModal extends Component {
  render() {
    return (
      <div class="atom-shide-prompt">
        <FilterSelect
          fuzzyType={this.props.fuzzyType}
          options={this.props.options}
          allowAnyText={this.props.allowAnyText}
          onCancel={this.props.onCancel}
          onSelect={this.props.onSelect}
        />
      </div>
    );
  }
}

export default SelectModal;
