import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActionSheetIOS,
    Alert
} from 'react-native'
import _ from 'lodash'
import ParsedText from 'react-native-parsed-text'

const ReactionType = {
    TEXT_ONLY: 1,
    IMAGE_ONLY: 2,
    TEXT_AND_IMAGE: 3
}

export default class ReactionItem extends React.Component {
    constructor(props) {
        super(props)
        this._getType = this._getType.bind(this)
        this._renderItem = this._renderItem.bind(this)
        this._renderContentImage = this._renderContentImage.bind(this)
        this._onItemPressed = this._onItemPressed.bind(this)
    }

    _getType() {
        const { reaction: { mediaId, comment } } = this.props
        return mediaId !== null ?
            (_.isEmpty(comment) == false ? ReactionType.TEXT_AND_IMAGE : ReactionType.IMAGE_ONLY) :
            ReactionType.TEXT_ONLY
    }

    _getReactionAuthorAvatar() {
        let { reaction } = this.props

        //return post.topReaction.Account && post.topReaction.Account.Media && post.topReaction.Account.Media.mediumURL;
        return reaction.Account && reaction.Account.Media && reaction.Account.Media.mediumURL || ' ';
    }

    _getReactionAuthorUsername() {
        let { reaction } = this.props

        return reaction.Account && reaction.Account.username
    }

    _getReactionComment() {
        let { reaction } = this.props

        return reaction.comment
    }

    _onDeleteItemOptionPressed() {
      const { post: { Account: { id: postUserId } }, reaction, profile: { id:userId }, deleteReaction } = this.props
      deleteReaction(reaction, userId === postUserId)
    }

    _onReportPostOptionPressed() {
        const { post, navigator, reportInappropriateItem } = this.props
        reportInappropriateItem(post)
        navigator.pop()
    }

  _onEditReactionPressed() {
    const { reaction, onEditReaction } = this.props
    onEditReaction(reaction)
  }

  _onItemPressed = () => {
    const { post: { Account: { id: postUserId } }, reaction: { Account: { id:reactionUserId } }, profile: { id:userId } } = this.props

    const access = {
      owner: ['Delete', 'Edit', 'Cancel'],
      user: ['Report Inappropriate Content', 'Cancel'],
      postOwner: ['Delete', 'Cancel']
    }

    const doNothing = ()=>{};

    const actions = {
      'Delete': () => {
        const msg = userId === postUserId
          ? 'Are you sure you want to remove this comment?'
          : 'Are you sure you want to delete your reaction?';
        Alert.alert('Delete', msg, [
          {
            text: 'Cancel', onPress: doNothing, style: 'cancel'
          },
          { text: 'Delete', onPress: this._onDeleteItemOptionPressed.bind(this) }
        ])
      },
      'Edit': () => {
        this._onEditReactionPressed()
      },
      'Report Inappropriate Content': () => {

      },
      'Cancel': doNothing
    }

    console.log('post reaction props', this.props)
    const options = userId === reactionUserId ? access.owner
      : userId === postUserId ? access.postOwner
      : access.user

    ActionSheetIOS.showActionSheetWithOptions({
        options,
        cancelButtonIndex: options.indexOf('Cancel'),
        destructiveButtonIndex: options.indexOf('Delete')
      },
      (buttonIndex) => {
        actions[options[buttonIndex]]()
      });

  }

    _onAuthorPressed() {
        let { navigator, reaction } = this.props

        let image = reaction.Account.Media && reaction.Account.Media.mediumURL || ' ';
        let coverImage = reaction.Account.CoverMedia && reaction.Account.CoverMedia.mediumURL || ' ';
        let username = reaction.Account.username;
        let accountId = reaction.Account.id

        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username })
    }

    _onTagPress(tag, type) {
        const { navigator, searchFriends } = this.props;
        searchFriends(tag, 0)
        navigator.push({ name: 'SearchResults', searchTerm: tag, type: type, trackingSource: 'ReactionItem' })
    }

    _renderContentImage(type) {
        const { reaction: { mediaId } } = this.props

        if (!mediaId) {
            return null
        }

        //const contentImageWidth = type == ReactionType.TEXT_AND_IMAGE ? this.props.width * 0.4 : this.props.width * 0.7
        const contentImageWidth = this.props.width * 0.4;
        let imageUrl = this.props.reaction.Media && this.props.reaction.Media.mediumURL;

        return (
            <View style={{ width: contentImageWidth, height: contentImageWidth, alignSelf: 'center' }}>
                <Image
                    style={{ ...styles.reactionImage, width: contentImageWidth, height: contentImageWidth }}
                    source={{ uri: imageUrl }}
                />
                <Image
                    style={{ ...styles.reactionOverlay, width: contentImageWidth, height: contentImageWidth }}
                    source={require('image!ico_avatar_overlay')}
                />
            </View>
        )
    }

    _renderHashTag(match, matches) {
        // matches[1] contains tag without hash at the beginning
        let hash = matches[1];
        hash = '#' + hash
        return (<Text style={styles.tag} onPress={this._onTagPress.bind(this, hash, 'hash')}>{hash}</Text>);
    }

    _renderItem() {
        const type = this._getType()
        let authorUrl = this._getReactionAuthorAvatar();
        return (
            <View style={styles.container}>
                <View style={styles.reactionContainer}>
                    <View style={styles.reactionContent}>
                        <TouchableWithoutFeedback onPress={this._onAuthorPressed.bind(this)}>
                            {(authorUrl) ? <Image source={{ uri: authorUrl }} style={styles.avatar}/> : null}
                        </TouchableWithoutFeedback>
                        <View style={[{ flex: 1 }]}>
                            <TouchableWithoutFeedback onPress={this._onAuthorPressed.bind(this)}>
                                <View><Text style={styles.username}>{this._getReactionAuthorUsername()}</Text></View>
                            </TouchableWithoutFeedback>
                            <ParsedText
                                style={[styles.contentText, { flex: type == ReactionType.IMAGE_ONLY ? 0.15 : 0.7 }]}
                                parse={[{ pattern: /#(\w+)/, renderText: this._renderHashTag.bind(this) }]}>
                                {this._getReactionComment()}
                            </ParsedText>
                        </View>
                    </View>
                    {this._renderContentImage(type)}
                </View>
                <TouchableOpacity stlye={{ height: 45, width:45 }} onPress={this._onItemPressed}>
                  <Text style={styles.commentOptions}>...</Text>
                </TouchableOpacity>
            </View>
        )
    }


    render() {
      console.log('props', this.props)
        const { reaction: { Account: { id:reactionUserId } }, profile: { id:userId } } = this.props

        // if (userId === reactionUserId) {
            return (
              this._renderItem()
            )
        // }
        return this._renderItem()
    }
}

const styles = {
    container: {
        flexDirection: 'row',
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        paddingTop: 10,
        paddingBottom: 10,
        overflow: 'hidden',
        backgroundColor: 'white',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0'
    },
    profileContainer: {
        flex: 0.25,
        flexDirection: 'column',
        alignItems: 'center'
    },
    reactionContainer: {
        flex: 0.75,
        flexDirection: 'column',
        paddingLeft: 10
    },
    reactionHeader: {
        flex: 1,
        flexDirection: 'row',
        height: 25
    },
    reactionContent: {
        flexDirection: 'row'
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    profileText: {
        marginTop: 10,
        width: 50
    },
    reactionTitle: {
        flex: 0.3,
        borderBottomWidth: 2,
        borderBottomColor: '#B385FF'
    },
    reactionTime: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    reactionTitleText: {
        color: '#B385FF'
    },
    reactionTimeText: {
        color: '#8E8E8E',
        marginLeft: 5,
        fontSize: 12
    },
    reactionImage: {
        position: 'absolute'
    },
    reactionOverlay: {
        position: 'absolute'
    },
    contentImage: {
        borderColor: '#B385FF',
        flex: 0.3,
        resizeMode: 'contain',
        borderWidth: 2
    },
    contentText: {
        color: '#AAA',
        fontSize: 14,
        marginLeft: 5,
        marginRight: 5
    },
    tag: {
        color: '#B385FF'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#AAA'
    },
    username: {
        fontSize: 14,
        marginLeft: 5
    },
    commentOptions: {
      color: '#B385FF',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      height: 30,
      width: 30
    }
}
