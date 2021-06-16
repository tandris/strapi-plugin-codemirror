/**
 *
 * CodeMirrorEditor
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import cm from 'codemirror';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/lib/codemirror.css';

import {isEmpty, trimStart} from 'lodash';
import jsonlint from './jsonlint';
import Wrapper from './components';

const WAIT = 600;
const stringify = JSON.stringify;
const DEFAULT_THEME = 'material';

const loadMode = (mode) => {
  if (mode === 'json') {
    require('codemirror/mode/javascript/javascript');
  } else {
    // FIXME use switch case for each type
    require(`codemirror/mode/${mode}/${mode}`);
  }
  if (mode === 'javascript') {
    require('codemirror/addon/lint/javascript-lint');
  } else if (mode === 'coffeescript') {
    require('codemirror/addon/lint/coffeescript-lint');
  } else if (mode === 'css') {
    require('codemirror/addon/lint/css-lint');
  } else if (mode === 'json') {
    require('codemirror/addon/lint/json-lint');
  } else if (mode === 'yaml') {
    require('codemirror/addon/lint/yaml-lint');
  }
};

const loadTheme = (theme) => {
  // FIXME switch case to load the given theme
  require('codemirror/theme/material.css');
};

class CodeMirrorEditor extends React.Component {
  timer = null;
  mode = 'json';
  theme = DEFAULT_THEME;

  constructor(props) {
    super(props);
    this.mode = props.attribute ? props.attribute.mode || this.mode : this.mode;
    this.theme = props.attribute ? props.attribute.theme || this.theme : this.theme;
    loadMode(this.mode);
    loadTheme(this.theme);
    this.editor = React.createRef();
    this.state = {error: false, markedText: null};
  }

  componentDidMount() {
    // Init codemirror component
    this.codeMirror = cm.fromTextArea(this.editor.current, {
      autoCloseBrackets: true,
      lineNumbers: true,
      matchBrackets: true,
      mode: this.mode,
      readOnly: this.props.disabled,
      smartIndent: true,
      styleSelectedText: true,
      tabSize: 4,
      theme: this.theme,
      fontSize: '13px',
      indentUnit: 4
    });
    this.codeMirror.on('change', this.handleChange);
    this.codeMirror.on('blur', this.handleBlur);

    this.setSize();
    this.setInitValue();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && !this.codeMirror.state.focused) {
      this.setInitValue();
    }
  }

  setInitValue = () => {
    const {value} = this.props;
    try {
      if (value === null) return this.codeMirror.setValue('');

      const nextValue = typeof value !== 'string' ? stringify(value, null, 2) : value;

      return this.codeMirror.setValue(nextValue);
    } catch (err) {
      return this.setState({ error: true });
    }
  };

  setSize = () => this.codeMirror.setSize('100%', '600px');

  getContentAtLine = line => this.codeMirror.getLine(line);

  getEditorOption = opt => this.codeMirror.getOption(opt);

  getValue = () => this.codeMirror.getValue();

  markSelection = ({message}) => {
    let line = parseInt(message.split(':')[0].split('line ')[1], 10) - 1;
    let content = this.getContentAtLine(line);

    if (content === '{') {
      line += 1;
      content = this.getContentAtLine(line);
    }
    const chEnd = content.length;
    const chStart = chEnd - trimStart(content, ' ').length;
    const markedText = this.codeMirror.markText(
      {line, ch: chStart},
      {line, ch: chEnd},
      {className: 'colored'}
    );
    this.setState({markedText});
  };

  handleBlur = ({target}) => {
    const {name, onBlur} = this.props;

    if (target === undefined && onBlur) {
      // codemirror catches multiple events
      onBlur({
        target: {
          name,
          type: 'json',
          value: this.getValue(),
        },
      });
    }
  };

  handleChange = () => {
    const {hasInitValue} = this.state;
    const {name, onChange} = this.props;
    let value = this.codeMirror.getValue();

    if (!hasInitValue) {
      this.setState({hasInitValue: true});

      // Fix for the input firing on onChange event on mount
      return;
    }

    if (value === '') {
      value = null;
    }

    // Update the parent
    onChange({
      target: {
        name,
        value,
        type: 'json',
      },
    });

    // Remove higlight error
    if (this.state.markedText) {
      this.state.markedText.clear();
      this.setState({markedText: null, error: null});
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.testJSON(this.codeMirror.getValue()), WAIT);
  };

  testJSON = value => {
    if (this.mode === 'application/json') {
      try {
        jsonlint.parse(value);
      } catch (err) {
        this.markSelection(err);
      }
    }
  };

  render() {
    if (this.state.error) {
      return <div>error json</div>;
    }

    return (
      <Wrapper disabled={this.props.disabled}>
        <textarea ref={this.editor} autoComplete="off" id={this.props.name} defaultValue=""/>
      </Wrapper>
    );
  }
}

CodeMirrorEditor.defaultProps = {
  disabled: false,
  onBlur: () => {
  },
  onChange: () => {
  },
  value: null,
};

CodeMirrorEditor.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.any,
};

export default CodeMirrorEditor;
