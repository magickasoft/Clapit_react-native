import React, { Component, PropTypes } from 'react';
import  {
  View,
  Text
} from 'react-native'

export default class SectionItem extends React.Component {

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{this.props.label}</Text>
      </View>
    )
  }
}

const styles = {

  container: {
    backgroundColor: '#F0EFF5',
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  label: {
    color: '#828187',
    paddingLeft: 10,
    paddingBottom: 5
  }
}
