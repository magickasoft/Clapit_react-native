import React, { Component, PropTypes } from 'react';
import  {
  View,
  Text,
  Image,
  SwitchIOS,
  TouchableOpacity,
  Alert
} from 'react-native'

export default class LinkedAccountItem extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      active: props.isActive
    }
  }

  _onValueChange(value) {
    let { onLinkStatusChange, name, activeCount } = this.props

    if(value == false && activeCount <= 1) {
      Alert.alert('Accounts', 'There must be at least one account linked with your clapit account for things to work')
      return
    }
    this.setState({active: value})
    onLinkStatusChange(name, value)
  }

  componentWillReceiveProps(nextProps) {
    let { isActive } = nextProps
    this.setState({ active: isActive })
  }

  render () {
    return (
      <View style={styles.container}>
        <Image style={styles.icon} source={this.props.icon} />
        <Text style={styles.label}>{this.props.label}</Text>
        <SwitchIOS
          style={styles.switch}
          onValueChange={this._onValueChange.bind(this)}
          value={this.state.active} />
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
  switch: {
    marginRight: 10
  },
  icon: {
    marginLeft: 10,
    height: 20,
    width: 20
  }
}
