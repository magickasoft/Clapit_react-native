import React, { Component, PropTypes } from 'react';
import  {
  View,
  Text,
  TouchableOpacity
} from 'react-native'

export default class StandardItem extends React.Component {

  _onPress() {
    this.props.onPress(this.props.name)
  }

  render () {
    return (
      <TouchableOpacity onPress={this._onPress.bind(this)} style={styles.container}>
        <Text style={styles.label}>{this.props.label}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = {

  container: {
    backgroundColor: '#FFF',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    marginLeft: 10,
    color: '#000',
    fontSize: 16
  }
}
