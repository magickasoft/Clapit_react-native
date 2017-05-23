import React, { Component } from 'react';
import  {
    StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'

export default class BackButton extends Component {
  render() {
    let { onPress } = this.props
    
    return (
      <TouchableOpacity style={styles.touchableOpacity} onPress={onPress}>
        <Text style={styles.arrow}>&lsaquo;</Text>        
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  touchableOpacity: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  arrow: {
    paddingLeft: 15,
    color: '#B385FF',
    fontFamily: 'AvenirNextRoundedStd-Med',    
    fontSize: 45
  },
  backText: {
    paddingTop: 10,
    paddingLeft: 10,
    textAlign: 'center',
  }
})
