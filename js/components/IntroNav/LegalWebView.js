import React, { Component } from 'react';
import  {
    StyleSheet,
  Text,
  View,
  WebView
} from 'react-native'

import NavigationBar from 'react-native-navbar'
import BackButton from './BackButton'
import NavTitle from './NavTitle'

export default class LegalWebView extends Component {
  render() {
    let { privacy } = this.props
    let uri = 'https://content.clapit.com/public/terms-and-privacy/mobile/terms.html';

    if(privacy) {
      uri = 'https://content.clapit.com/public/terms-and-privacy/mobile/privacy.html'
    }
    return (
      <View style={styles.view}>
        <NavigationBar leftButton={this._leftButton()} title={this._title()} style={styles.navBar} />
        <View style={styles.bodyView}>
          <WebView source={{uri}} style={styles.webView} />
        </View>
      </View>
    )
  }
  _leftButton() {
    return (
      <BackButton onPress={this._onPressBack.bind(this)} />
    )
  }
  _title() {
    let { privacy } = this.props
    let title = 'TERMS OF USE'
    if(privacy) {
      title = 'PRIVACY POLICY'
    }

    return (
      <NavTitle>{title}</NavTitle>
    )
  }
  _onPressBack() {
    let { navigator } = this.props

    navigator.pop()
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white'
  },
  navBar: {
    backgroundColor: 'white'
  },
  bodyView: {
    marginTop: 7,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
    flex: 1
  },
  webView: {
    flex: 1
  }
})
