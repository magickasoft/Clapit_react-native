import React, { Component } from 'react';
import  {
    StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'

export default class NavTitle extends Component {
  render() {
    let { onPress } = this.props

    return (
      <Text allowFontScaling={false} style={styles.title}>{this.props.children}</Text>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    color: '#B385FF',
    fontSize: 20
  }
})
