import React, { Component, PropTypes } from 'react';
import  {
  View,
  Text,
  Image,
  TouchableOpacity
} from 'react-native'

export default class LoggedAccountItem extends React.Component {

  _onLogoutPress() {
    this.props.onLogoutPress()
  }

  render () {
    return (
      <View style={styles.container}>
        <Image style={styles.icon} source={this.props.icon} />
        <Text style={styles.label}>{this.props.label}</Text>
        <Text style={styles.signout} onPress={this._onLogoutPress.bind(this)}>SIGN OUT</Text>
      </View>
    )
  }
}

const styles = {

  container: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center'
  },
  label: {
    flex: 0.8,
    fontSize: 16,
    paddingLeft: 20
  },
  signout: {
    color: '#4C9EF1',
    paddingRight: 10
  },
  icon: {
    marginLeft: 10,
    height: 20,
    width: 20
  }
}
