import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'
import moment from 'moment'

export default class NetworkItem extends React.Component {

  _onAvatarPress() {

  }

  _onFollowPress(item) {
      this.props.onFollowPressed(item)
  }

  _onProfilePress(item) {
    this.props.onProfilePressed(item)
  }

  render () {

    let avatar = null
    if(this.props.item.Media) {
      avatar = (
        <TouchableOpacity onPress={this._onAvatarPress.bind(this)}>
          <Image source={{uri: this.props.item.Media && this.props.item.Media.mediumURL || ' '}} style={styles.avatar}/>
        </TouchableOpacity>
      )
    }

    let followButton = null
    if(this.props.allowFollow) {
      followButton = (
        <TouchableOpacity style={styles.followButton} onPress={this._onFollowPress.bind(this, this.props.item)}>
          <Image style={styles.followImage}
            source={! this.props.item.following ? require('image!profileFollow') : require('image!profileFollowing')} />
        </TouchableOpacity>
      )
    }

    let feedItemInfo

    if (this.props.item.friendCount) {
      feedItemInfo = (<View style={styles.feedItemInfo}>
        <TouchableOpacity style={styles.clapLabel}>
          <Text>
            <Text style={styles.clapCount}>{this.props.item.friendCount}</Text>
            <Text style={styles.clapText}> Friends on Clapit</Text>
          </Text>
        </TouchableOpacity>
      </View>)
    } else {
      feedItemInfo = (<View style={styles.feedItemInfo}>
        <TouchableOpacity style={styles.clapLabel}>
          <Text>
            <Text style={styles.clapCount}>{this.props.item.clapCount}</Text>
            <Text style={styles.clapText}> Claps</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactLabel}>
          <Text>
            <Text style={styles.reactCount}>{this.props.item.commentCount}</Text>
            <Text style={styles.reactText}> Reactions</Text>
          </Text>
        </TouchableOpacity>
      </View>)
    }

    return(
        <TouchableOpacity style={{...this.props.style, ...styles.container}} onPress={this._onProfilePress.bind(this, this.props.item)}>
          {avatar}
          <View style={styles.avatarInfo}>
            <Text style={styles.username}>{this.props.item.username}</Text>
            {feedItemInfo}
          </View>
          {followButton}
        </TouchableOpacity>
    )
  }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 5,
        paddingLeft: 10,
        marginBottom: 5
    },
    avatar: {
        borderRadius: 25,
        width: 50,
        height: 50,
        borderWidth: 1.5,
        borderColor: '#AAA'
    },
    avatarInfo: {
        flex: 0.8,
        flexDirection: 'column',
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 50
    },
    username: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingBottom: 2
    },
    feedItemInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingRight: 10,
        paddingTop: 2
    },
    clapLabel: {

    },
    clapText : {
        fontSize: 12,
        color: '#AAA',
        textAlign: 'right'
    },
    clapCount : {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#000',
        textAlign: 'right'
    },
    reactLabel : {
        paddingLeft: 10
    },
    reactText : {
        fontSize: 12,
        color: '#AAA',
        textAlign: 'right'
    },
    reactCount : {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#000',
        textAlign: 'right'
    },
    followButton: {
        paddingRight: 5
    },
    followImage: {
        height: 50,
        width: 50
    }
}
