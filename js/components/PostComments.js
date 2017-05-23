import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import React, { Component } from 'react';
import  {
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    NativeModules,
    Dimensions
} from 'react-native'

let { width, height } = Dimensions.get('window')
/**
 * Component for Showing Post Top Comment and a link to All Comments
 *
 * Receiving via Component Properties:
 * 1) navigator
 * 2) post
 *
 * Using REDUX for state management
 *
 */
export class PostComments extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            addedTopReaction: null
        }
    }

    componentWillReceiveProps(nextProps){
        let {appState : { reactions }, post} = nextProps
        if (reactions && reactions.reactionOfPostId && reactions.reactionOfPostId.postId === post.id) {
            this.setState({addedTopReaction: reactions.reactionOfPostId})
        }

    }

    _isTopReactionPresent() {
        let { post } = this.props

        return post.topReactionId || this.state.addedTopReaction
    }

    _getCommentCount() {
        let { post } = this.props

        return post.commentCount || 0;
    }

    _getTopReactionAuthorAvatar() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            let Account = this.state.addedTopReaction.Account
            return Account && Account.Media && Account.Media.mediumURL  || ' '
        }
        return post.topReaction && post.topReaction.Account && post.topReaction.Account.Media && post.topReaction.Account.Media.mediumURL  || ' ';
    }

    _getTopReactionAuthorCoverImage() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            let Account = this.state.addedTopReaction.Account
            return Account && Account.CoverMedia && Account.CoverMedia.mediumURL  || ' '
        }
        return post.topReaction && post.topReaction.Account && post.topReaction.Account.CoverMedia && post.topReaction.Account.CoverMedia.mediumURL  || ' ';
    }

    _getTopReactionAuthorUsername() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            return this.state.addedTopReaction.Account.username
        }
        return post.topReaction && post.topReaction.Account.username
    }

    _getTopReactionComment() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            return this.state.addedTopReaction.comment
        }
        return post.topReaction && post.topReaction.comment
    }

    _getTopReactionSelfie() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            return this.state.addedTopReaction.Media && this.state.addedTopReaction.Media.mediumURL;
        }
        return post.topReaction && post.topReaction.Media && post.topReaction.Media.mediumURL;
    }

    _getTopReactionAccountId() {
        let { post } = this.props
        if (!post.topReaction && post.commentCount > 0 && this.state.addedTopReaction){
            return this.state.addedTopReaction.Account.id
        }
        return post.topReaction && post.topReaction.Account.id
    }

    _onViewAllReactionsPressed() {
        let { navigator, post, appState : { clapitAccountData }, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post, clapitAccountData })
    }

    _onTopReactionPressed() {
        let { navigator, post, appState : { clapitAccountData }, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post, clapitAccountData })
    }

    _onAuthorPressed() {
        let { navigator, post } = this.props

        let image = this._getTopReactionAuthorAvatar();
        let coverImage = this._getTopReactionAuthorCoverImage();
        let username = this._getTopReactionAuthorUsername();
        let accountId = this._getTopReactionAccountId();

        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username })
    }

    _renderViewAllReactions() {
        let count = this._getCommentCount()
        let viewAllMsg = (count === 1)? 'View 1 reaction' : 'View all ' + count + ' reactions'
        return this._isTopReactionPresent() ?
            (
                <View style={styles.container}>
                    <TouchableWithoutFeedback onPress={this._onViewAllReactionsPressed.bind(this)}>
                        <View><Text style={styles.commentsCountText}>{viewAllMsg}</Text></View>
                    </TouchableWithoutFeedback>
                </View>
            )
            :
            null;
    }

    _renderAuthorAvatarAndTopReaction() {
        let authorImage =this._getTopReactionAuthorAvatar();
        const contentImageWidth = width * 0.4;
        let reactionSelfie = this._getTopReactionSelfie.bind(this)();
        return this._isTopReactionPresent() || this._getCommentCount() > 0 ?
            (
                <View style={styles.authorReactionContainer}>
                    <View style={styles.authorContainer}>
                        <TouchableWithoutFeedback onPress={this._onAuthorPressed.bind(this)}>
                            {(authorImage)? <Image source={{ uri: authorImage }} style={styles.avatar}/>:null}
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.reactionContainer}>
                        <View>
                            <TouchableWithoutFeedback onPress={this._onAuthorPressed.bind(this)}>
                                <View style={[{ flex: 1 }]}>
                                    <Text style={styles.username}>{this._getTopReactionAuthorUsername()}</Text>
                                    <Text style={styles.lastComment}>{this._getTopReactionComment()}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View>
                            {reactionSelfie ? (
                              <TouchableWithoutFeedback onPress={this._onViewAllReactionsPressed.bind(this)}>
                                  <View style={{ width: contentImageWidth, height: contentImageWidth, alignSelf: 'center' }}>
                                      <Image
                                        style={{ ...styles.reactionImage, width: contentImageWidth, height: contentImageWidth }}
                                        source={{ uri: reactionSelfie }}
                                      />
                                      <Image
                                        style={{ ...styles.reactionOverlay, width: contentImageWidth, height: contentImageWidth }}
                                        source={require('image!ico_avatar_overlay')}
                                      />
                                  </View>
                              </TouchableWithoutFeedback>
                            ) : null}
                        </View>
                    </View>
                </View>
            )
            :
            null;
    }

    render() {
        let {topReaction} = this.props.post
        let {addedTopReaction} = this.state
        return (topReaction || addedTopReaction) ? (
            <View style={{flexDirection: 'column', marginBottom:10}}>
                {this._renderViewAllReactions()}
                {this._renderAuthorAvatarAndTopReaction()}
            </View>
        ) : null
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    commentsCountText: {
        color: '#AAA',
        fontSize: 14,
        marginTop: 8,
        marginLeft: 5
    },
    authorReactionContainer: {
        flexDirection: 'row',
        // marginTop: 10,
        marginLeft: 10
    },
    authorContainer: {
        marginLeft: 5
    },
    reactionContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: 15,
        marginRight: 5
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
        fontWeight: '500'
    },
    lastComment: {
        fontSize: 14,
        fontWeight: '300'
    },
    reactionImage: {
        position: 'absolute'
    },
    reactionOverlay: {
        position: 'absolute'
    }
}

// REDUX START
function stateToProps(appState) {
    // have access to full app state
    return { appState }
}

function dispatchToProps(dispatch) {
    let actions = Object.assign({})

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(PostComments)

// REDUX STOP


