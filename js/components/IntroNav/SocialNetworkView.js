import React, { Component } from 'react';
import  {
    StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native'

export default class SocialNetworkView extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { name, onPress } = this.props

    return (
      <TouchableOpacity onPress={onPress} style={styles.touchableOpacity}>
        <Image
          source={{uri: name}}
          style={styles.image}
          resizeMode="contain" />
      </TouchableOpacity>
    )
  }

}

const styles = StyleSheet.create({
  touchableOpacity: {
    paddingLeft: 5,
    paddingRight: 5,
    height: 75
  },
  image: {
    width: 75,
    height:75
  },
  text: {
    color: '#008AE1'
  }
})
