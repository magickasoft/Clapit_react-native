import React, { Component } from 'react';
import  {
  View
}from 'react-native'

export default class Flag extends React.Component {

  render() {
    return (
      <View style={{...styles.flag, ...this.props.style}}>
        <View style={styles.flagMain}>
          {this.props.children}
        </View>
        <View style={[styles.flagTriangle, styles.flagTopLeft]} />
        <View style={[styles.flagTriangle, styles.flagTopRight]} />
        <View style={[styles.flagTriangle, styles.flagBottomLeft]} />
        <View style={[styles.flagTriangle, styles.flagBottomRight]} />
      </View>
    )
  }

}

const styles = {
  flag: {
    width: 50,
    height: 25
  },
  flagMain: {
    width: 50,
    height: 25,
    backgroundColor: '#569ee8'
  },
  flagTriangle: {
    backgroundColor: 'transparent',
    borderTopWidth: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 50,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: '#569ee8'
  },
  flagTopLeft: {
    position: 'absolute',
    top: -20,
    left: 0
  },
  flagTopRight: {
    position: 'absolute',
    top: -20,
    right: 0,
    transform: [
      {scaleX: -1}
    ]
  },
  flagBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    transform: [
      {scaleY: -1 }
    ]
  },
  flagBottomRight: {
    position: 'absolute',
    bottom: -20,
    right: 0,
    transform: [
      {scale: -1}
    ]
  }
}