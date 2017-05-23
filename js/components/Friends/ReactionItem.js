import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'

import moment from 'moment'
import { Images, Styles } from '../../themes'
import { GetPreviewImageUrl } from '../../lib/utils'

export default class ReactionItem extends React.Component {

  _onReactionPress() {
      this.props.onReactionPressed()
  }

  render () {
    const reactionImageWidth = this.props.width * 0.5
    const { item } = this.props
    // console.log('reaction', this.props)

    return (
      <TouchableOpacity
        style={{...this.props.style}}
        onPress={this._onReactionPress.bind(this)}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.username}>{item.Account.username.trim() + '\'s reaction'}</Text>

              <Image source={require('image!ico_grey_timestamp')} />
              <Text style={styles.daysAgo}>{moment(item.created).fromNow()}</Text>

          </View>
          <View style={styles.content}>
            <View style={styles.reactionInfo}>
              <View style={{width: reactionImageWidth, height: reactionImageWidth}}>
                <Image style={{...styles.reactionImage, width: reactionImageWidth, height: reactionImageWidth}}
                  source={{uri: GetPreviewImageUrl(item)}} />
                <Image style={{...styles.reactionOverlay, width: reactionImageWidth, height: reactionImageWidth}}
                  source={require('image!ico_avatar_overlay')} />
              </View>
            </View>
            <View style={styles.postInfo}>
              <Image style={styles.postImage} source={{uri: GetPreviewImageUrl(item.Post, 'gif')}} >
                { item.Post.videoURL && <Image source={Images.ico_video} style={Styles.videoIcon} />}
              </Image>
              <Text style={styles.comment}>{item.comment}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = {
    container: {
        flexDirection: 'column',
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#AAA',
        borderRadius: 5,
        overflow: 'hidden',
        paddingTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    username: {
      flex: 0.7,
      fontWeight: 'bold',
      fontSize: 14
    },
    daysAgo: {
      paddingLeft: 2,
      color: '#AAA',
      fontWeight: 'bold',
      fontSize: 11
    },
    timeInfo: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    },
    content: {
      flexDirection: 'row',
      paddingTop: 10
    },
    reactionInfo: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    reactionImage: {
      position: 'absolute',
    },
    reactionOverlay: {
      position: 'absolute'
    },
    postInfo: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 0.6,
      flexDirection: 'column'
    },
    postImage: {
      width: 100,
      height: 100,
      justifyContent: 'center',
      alignItems: 'center'
    },
    comment: {
      width: 100,
      paddingTop: 2,
      fontSize: 11
    }
}
