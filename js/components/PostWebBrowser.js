import React, { Component } from 'react';
import  {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Text
} from 'react-native'
import ParsedText from 'react-native-parsed-text'

import WebBrowser from './WebBrowser'

export default class PostWebBrowser extends React.Component {

  _onClosePress() {
    this.props.navigator.pop()
  }

  _onTagPress(tag, type) {
    const { navigator, searchFriends } = this.props;
    searchFriends(tag, 0)
    navigator.push({ name: 'SearchResults', searchTerm: tag, type: type, trackingSource: 'PostWebBrowser' })
  }

  _renderUserTag(match, matches) {
    // matches[1] contains tag without @ at the beginning
    const username = matches[1];
    var isExistingUser = this.props.post && this.props.post.UserTags && this.props.post.UserTags.find(userTag => userTag.Account.username === username);
    let props = isExistingUser ? {
      style: styles.tag,
      onPress: this._onTagPress.bind(this, username, 'user')
    } : {};
    return (<Text {...props}>@{username}</Text>);
  }

  _renderHashTag(match, matches) {
    // matches[1] contains tag without hash at the beginning
    let hash = matches[1];
    hash = '#' + hash
    return (<Text style={styles.tag} onPress={this._onTagPress.bind(this, hash, 'hash')}>{hash}</Text>);
  }

  render() {
    const { url, title } = this.props
    return (
      <View style={styles.container}>
        <View style={{...styles.topBar, width: Dimensions.get('window').width}}>
          <TouchableOpacity style={styles.closeButton} onPress={this._onClosePress.bind(this)}>
            <Text style={styles.arrow}>&lsaquo;</Text>
          </TouchableOpacity>
          <Text style={styles.headerText} numberOfLines={1}>{ url }</Text>
        </View>
        <WebBrowser defaultUrl={url} hideTopBar={true} fullScreen={true}/>
        <View style={styles.bottomBar}>
          <ScrollView style={styles.bottomScrollView}>
            <ParsedText style={styles.postText} parse={[
              {pattern: /#(\w+)/, renderText: this._renderHashTag.bind(this)},
              {pattern: /@(\w+)/, renderText: this._renderUserTag.bind(this)}
            ]}>
              {title}
            </ParsedText>
          </ScrollView>
        </View>
      </View>
    )
  }

}

var styles = {
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  list: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F7F7F7',
    paddingTop: 20
  },
  header: {
    backgroundColor: '#B385FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerImage: {
    resizeMode: 'contain',
    marginTop: 24
  },
  closeButton: {
    flex: 0.1
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingTop: 10
  },
  headerText: {
    textAlign: 'center',
    paddingTop: 3,
    borderWidth: 1,
    borderColor: '#AAA',
    flex: 0.8,
    marginRight:10
  },
  arrow: {
    backgroundColor: 'white',
    color: '#B385FF',
    fontFamily: 'AvenirNextRoundedStd-Med',
    textAlign: 'center',
    fontSize: 55,
    lineHeight: 53
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 0,
    flex: 0.2
  },
  bottomScrollView: {
    flex: 1
  },
  tag: {
    color: '#B385FF'
  },
  postText: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 2,
    fontSize: 14,
    paddingBottom:5
  },
}
