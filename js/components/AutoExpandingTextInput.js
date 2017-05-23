import React, { Component } from 'react';
import  {
  TextInput
} from 'react-native'

export default class AutoExpandingTextInput extends React.Component {
  constructor(props) {
    super(props);

    let { value:text = '' } = props

    this.state = {text, height: 0};
  }
  focus() {
    this.refs.textInput.focus()
  }
  blur() {
    this.refs.textInput.blur()
  }
  render() {
    let { style, blurOnSubmit = false, onChange } = this.props

    return (
      <TextInput
        {...this.props}
        ref='textInput'
        multiline={true}
        onChange={(event) => {
          if(onChange(event)) { // ensure parent onChange succeeds
            this.setState({
              text: event.nativeEvent.text,
              height: event.nativeEvent.contentSize.height,
            });
          }
        }}
        blurOnSubmit={blurOnSubmit}
        style={[style,{height: Math.max(70, this.state.height)}]}
        value={this.state.text}
      />
    );
  }
}
