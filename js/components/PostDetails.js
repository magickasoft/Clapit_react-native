import React, { Component } from 'react';
import  {
    View,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    Text,
    ListView,
    StatusBar,
    Dimensions,
    ScrollView,
    Keyboard,
    DeviceEventEmitter,
    WebView,
    Linking,
    Alert,
    ActionSheetIOS,
    NativeModules,
    Modal,
    Animated
} from 'react-native'
import Video from 'react-native-video'

import { uploadToCloudinary, createMedia, updatePost } from '../actions/api'

import PostProfile from './Post/PostProfile'
import PostReaction from './PostReaction'
import PostClapsIconCounter from './PostClapsIconCounter'
import PostCommentsIconCounter from './PostCommentsIconCounter'
import ReactionItem from '../containers/ReactionItemContainer'
import ClapitLoading from './ClapitLoading'
import TagAutocompleteInputContainer from '../containers/TagAutocompleteInputContainer'

import ParsedText from 'react-native-parsed-text'
import dismissKeyboard from 'react-native-dismiss-keyboard'
import Camera from 'react-native-camera'

let { RNMixpanel:Mixpanel } = NativeModules

let { width, height } = Dimensions.get('window')
import { ShareButton } from '../lib/utils'
import { Colors, Images } from '../themes'

export default class PostDetails extends React.Component {
    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        })

        const reactions = props.reactions.reactionsByPostId[props.post.id] || []
        const userFollowing = props.friendship.items.indexOf(props.post.Account.id)

        let following = (userFollowing > -1 ? true : false)

        this.state = {
            dataSource: ds.cloneWithRows([{}, ...reactions]),
            contentOffset: 0,
            uploadImagePath: null,
            uploadedImageUrl: null,
            uploadInProgress: false,
            saveWhenDoneUploading: false,
            mediaId: null,
            following,
            cameraAuthorized: false,
            showLoading: false,
            pausedVideo: false,
            repeatVideo: true,
            contentHeight: 0,
            editModalVisible: false,
            editTitleValue: '',
            anim : new Animated.Value(0),
            showFlashOverlay: false
        }
    }

    componentWillReceiveProps(nextProps) {
        let { post } = this.props

        const reactions = nextProps.reactions.reactionsByPostId[post.id] || []
        const following = nextProps.friendship.items.indexOf(post.Account.id) > -1
        const ownPost = nextProps.profile.id === post.Account.id

        this.setState({
            dataSource: this.state.dataSource.cloneWithRows([{}, ...reactions]),
            following,
            ownPost
        })

        if (nextProps.reactions.reactionCreated) {
            this.props.fetchItemReactions(post.id)
            this.setState({ showLoading: false, uploadImagePath: null, mediaId: null, uploadedImageUrl: null })
            dismissKeyboard()
        }

        const routes = nextProps.navigationState.routes;
        const postInNavigation = routes[routes.length-1].post;
        this.setState({ pausedVideo: !postInNavigation || nextProps.post.id !== postInNavigation.id })
    }

    componentDidMount() {
        this.setState({
            postStartTime: Date.now()
        })

        let { post } = this.props
        this.props.fetchItemReactions(post.id)

        Keyboard.addListener('keyboardWillShow', this._keyboardWillShow)
        Keyboard.addListener('keyboardWillHide', this._keyboardWillHide)

        if (! post.videoURL) {
            Image.getSize(post.Media && post.Media.mediumURL || ' ', (w, h) => {
                this.setState({contentHeight: h / w * width})
            })
        }
    }

    componentWillUnmount() {

        // Date.now is in milis
        if (Date.now() - this.state.postStartTime > 2000) {
            Mixpanel.track("Viewing Post");
        }

        DeviceEventEmitter.removeAllListeners()
    }

    _keyboardWillShow = (e) => {
        this.setState({
            contentOffset: e.endCoordinates.height
        })
    }

    _keyboardWillHide = (e) => {
      console.log('keyboard hiding', e)
        this.setState({
            contentOffset: 0
        })
    }

    _imageSelected = (image, video, textComment) => {
        const path = image.indexOf('file://') === 0 ? image.substring('file://'.length) : image
        // upload!
        this.setState({
            uploadImagePath: path,
            uploadInProgress: true
        })

        uploadToCloudinary('image', `file://${path}`, (err, res) => {
            if (err || res.status != 200) {
                Alert.alert(
                    'Upload', 'We were unable to upload your image just now.  Would you like to try again?',
                    [
                        {
                            text: 'No',
                            onPress: () => {
                                this.setState({ uploadInProgress: false, uploadImageUrl: null })
                            },
                            style: 'cancel'
                        },
                        {
                            text: 'Yes', onPress: () => {
                            this._imageSelected(path);
                        }
                        }
                    ]
                )
                return
            }

            let { data } = res
            data = JSON.parse(data)
            let { url } = data

            // console.log(`url: ${url}`)

            this.setState({
                uploadInProgress: false,
                uploadedImageUrl: url
            })
            this._onPostReaction({comment: textComment || '', imageUrl: url});
        })
    }

    _getCommentCount() {
        let { post } = this.props
        return post.commentCount || 0;
    }

    _onTakeReactionPhoto() {
        let { navigator } = this.props
        let { cameraAuthorized } = this.state
        Mixpanel.track("Reaction Selfie");
        navigator.push({
            name: 'ClapitCamera',
            photoSelect: true,
            photoOnlySelect: true,
            cameraType: Camera.constants.Type.front,
            displayGifCamSwitch: true,
            displayComment:true,
            displaySelfieOverlay:true,
            callback: this._imageSelected.bind(this),
            cameraAuthorized
        })
    }

    _onPostReaction = ({comment, imageUrl, reaction}) => {
        let { createItemReaction, updateItemReaction, post, profile } = this.props
        let { mediaId, uploadedImageUrl } = this.state
        uploadedImageUrl = uploadedImageUrl || imageUrl;

        this.setState({ showLoading: true })

        if (reaction) { //updating existing reaction
            updateItemReaction(post.id, reaction.id, comment)
            this.setState({reaction: null})
        } else if (uploadedImageUrl) { // new image
            createMedia(uploadedImageUrl)
                .then(data => {
                    if (data.error) { // TODO
                        this.setState({ saveWhenDoneUploading: false })
                        return;
                    }

                    ({ id: mediaId } = data)

                    this.setState({ mediaId })
                    createItemReaction(post.id, profile.id, mediaId, comment)
                    Mixpanel.track("Comment");
                })
        } else {
            createItemReaction(post.id, profile.id, mediaId, comment)
            Mixpanel.track("Comment");
        }
    }

    _onDeletePostOptionPressed() {
        const { post, navigator, deleteItem } = this.props
        deleteItem(post)
        navigator.pop()
    }

    _onReportPostOptionPressed() {
        const { post, navigator, reportInappropriateItem } = this.props
        reportInappropriateItem(post)
        navigator.pop()
    }

    _onShowPostOptionsPressed() {
        const { post } = this.props;
        if (post.Account.id === this.props.profile.id) {
            ActionSheetIOS.showActionSheetWithOptions({
                    options: ['Delete', 'Edit', 'Cancel'],
                    cancelButtonIndex: 2,
                    destructiveButtonIndex: 0
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        Alert.alert('Delete', 'Are you sure you want to delete your post?', [
                            {
                                text: 'Cancel', onPress: () => {
                            }, style: 'cancel'
                            },
                            { text: 'Delete', onPress: this._onDeletePostOptionPressed.bind(this) }
                        ])
                    } else if(buttonIndex === 1) {
                        // console.log('post', post, this)
                        this.setState({editModalVisible: true})
                    }
                });
        } else {
            ActionSheetIOS.showActionSheetWithOptions({
                    options: ['Report Inappropriate Content', 'Cancel'],
                    cancelButtonIndex: 1,
                    destructiveButtonIndex: 0
                },
                (buttonIndex) => {
                    if (buttonIndex === 0) {
                        Alert.alert('Report Inappropriate Content', 'Are you sure you want to report this content?', [
                            {
                                text: 'Cancel',
                                onPress: () => {
                                },
                                style: 'cancel'
                            },
                            {
                                text: 'Report Inappropriate Content',
                                onPress: this._onReportPostOptionPressed.bind(this)
                            }
                        ])
                    }
                });
        }
    }

    _onImagePress() {
        const { post, navigator, searchFriends } = this.props
        const { url, title } = post
        navigator.push({ name: 'PostWebBrowser', title, url, searchFriends })
    }

    _renderContents() {
        const { post } = this.props
        
        if (post.urlType === 'video' && post.videoURL) {
            if (post.videoURL.includes('youtu')) {
                let src = `
                 <!DOCTYPE html>\n
                 <html>
                 <head>
                 <meta name="viewport" content="width=device-width, initial-scale=1">
                 </head>
                 <body style="margin: 0">
                 <embed src="${post.videoURL}" width="${width}" height="${0.75 * width}"></embed>
                 </body>
                 `
                 return <WebView
                     source={{html: src}}
                     style={{width , height: width }}
                     scrollEnable={false}
                     />
            } else {
                const imgSource = this.state.pausedVideo ? Images.ico_mute : Images.ico_unmute;
                const muteButtonStyle= {
                    muteButton: {
                        width: 20,
                        height: 20,
                        position: 'absolute',
                        bottom: 20,
                        left: 20
                    }
                }
                return (
                  <View style={{width, height: this.state.contentHeight || 0.75 * width, justifyContent:'center'}}>
                      <TouchableOpacity style={styles.fullScreen} onPress={this._replayVideo.bind(this)}>
                          <Video resizeMode="cover"
                                 source={{uri: post.videoURL}}
                                 rate={1.0}
                                 muted={false}
                                 repeat={this.state.repeatVideo}
                                 paused={this.state.pausedVideo}
                                 onEnd={this._onVideoEnd.bind(this)}
                                 onLoad={this._onVideoLoad.bind(this)}
                                 style={{ height: this.state.contentHeight || 0.75 * width}} />
                      </TouchableOpacity>
                      <Image source={imgSource} style={muteButtonStyle.muteButton}/>                     
                  </View>
                )
            }
        } else {
            return (
                <TouchableHighlight onPress={this._onImagePress.bind(this)}>
                    <Image source={{uri: post.Media && post.Media.mediumURL || ' '}} style={{width, height: this.state.contentHeight || 0.75 * width}}/>
                </TouchableHighlight>
            )
        }
    }

    _replayVideo(){
        this.setState({pausedVideo: !this.state.pausedVideo})

    }
    _onVideoEnd(){

    }
    _onVideoLoad(data){
        // console.log('onload ')
        if (data && data.naturalSize && data.naturalSize.height > 0){
            this.setState({contentHeight: data.naturalSize.height / data.naturalSize.width * width})
        }

    }

    _onEditReaction = (reaction) => {
        // this.setState({ reaction })
        // console.log('set reaction', reaction)
        this.refs.postReaction.setReaction(reaction)
    }

    _renderRow(reaction, section, row) {

        let { post, profile, navigator } = this.props

        return (
            !reaction.id
              ?  <View>
                    <PostProfile
                      post={post}
                      profile={post.Account}
                      publishTime={post.publishTime}
                      navigator={navigator}
                      trackingSource="Post"
                    />
                    <View style={{ marginTop: 5, height: 1, backgroundColor: '#F0F0F0'}} />
                    <View style={{width}}>
                      {this._renderContents()}
                      {(this.state.showFlashOverlay) ?
                        <Animated.View style={{backgroundColor:this._getBackgroundColor(post.clapCount),
                          width, height: this.state.contentHeight || 0.75 * width, position:'absolute', top: 0, left:0, opacity: this.state.anim,
                          justifyContent: 'center', alignItems: 'center'}}>
                            <Animated.Image source={Images.clap_flash} style={{width: 200, height: 200, opacity: this.state.anim}} />

                        </Animated.View>
                        : null}
                    </View>

                    <TouchableOpacity style={[styles.postOptions, {top:(this.state.contentHeight)? this.state.contentHeight + 10 : 0.75 * width + 10}]} onPress={this._onShowPostOptionsPressed.bind(this)}>
                        <Text style={styles.postOptionsText}>...</Text>
                    </TouchableOpacity>
                    <View style={styles.postInfoContainer}>

                        {(! post.featured) ?
                          <PostClapsIconCounter
                            post={post}
                            onClap={this._onClap}
                            navigator={navigator}
                            trackingSource="Post"
                          />
                          : null}

                        {(! post.featured) ?
                            <PostCommentsIconCounter
                                post={post}
                                disableCounterPress
                                navigator={navigator}
                                trackingSource="Post"
                            />
                        : null}

                        <View style={{width: 40, height: 40}}/>
                        <ShareButton post={post} style={styles.shareButton} />

                    </View>
                    <ParsedText style={styles.postText} parse={[
                        {pattern: /#(\w+)/, renderText: this._renderHashTag.bind(this)},
                        {pattern: /@(\w+)/, renderText: this._renderUserTag.bind(this)}
                    ]}>
                        {this.state.editTitleValue || post.title}
                    </ParsedText>
                    <Text style={styles.commentsCountText}>{this._getCommentCount()} reactions</Text>
                </View>
              :
              <ReactionItem
                width={width}
                reaction={reaction}
                onEditReaction={this._onEditReaction}
                post={post}
                profile={profile}
                navigator={navigator}
              />
        )
    }

    _renderUserTag(match, matches) {
        // matches[1] contains tag without @ at the beginning
        const username = matches[1];
        var isExistingUser = this.props.post.UserTags.find(userTag => userTag.Account.username === username);
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

    _onTagPress(tag, type) {
        const { navigator, searchFriends } = this.props;
        searchFriends(tag, 0)
        navigator.push({ name: 'SearchResults', searchTerm: tag, type: type, trackingSource: 'PostDetails' })
    }

    _onClosePress() {
        this.props.navigator.pop()
    }

    _onFollowPress() {
        const { post, profile: { id:userId } } = this.props
        if (this.state.following) {
            this.props.unfollow(post.Account.id, userId)
            this.setState({ following: false })
        } else {
            this.props.follow(post.Account.id, userId)
            this.setState({ following: true })
        }
        Mixpanel.trackWithProperties("Toggle Follow", { trackingSource: 'Post', following: this.state.following});
    }

    _onEditTitleValueChange = (e) => {
        const { text:value } = e.nativeEvent
        this.setState({editTitleValue: value})
    }

      _onClap = () => {
        this.setState({showFlashOverlay: true});
        setTimeout(() => {
          this.setState({showFlashOverlay: false});
        },1000);
        var timing = Animated.timing;
        Animated.sequence([ // One after the other
          timing(this.state.anim, {
            toValue: 1,
            duration: 150,
          }),
          timing(this.state.anim, {
            toValue: 0,
            duration: 800,
          })]).start();
      }

      _getBackgroundColor(clapCount) {
        if (clapCount >= 50) {
          return Colors.purple
        } else if (clapCount >= 10) {
          return Colors.aqua
        } else {
          return Colors.blue
        }
      }
    _onEditTitleSubmit = () => {
        const { post, navigationState } = this.props;
        this.setState({editModalVisible: false })
                                    
        updatePost(post.id, {title: this.state.editTitleValue})
            .then(res=>{                                        
                navigationState.routes[navigationState.routes.length-1].refreshProfile()
            }).catch(err=>{
                console.log('err', err)
            });
    }

    render() {
        let { post, profile, navigator, reloadUserPosts, navigationState } = this.props
        let { showLoading } = this.state

        return (
            <View style={styles.container}>
                <View style={[styles.topBar, {width}]}>
                    <TouchableOpacity style={styles.closeButton} onPress={this._onClosePress.bind(this)}>
                        <Image source={require('image!btn_close')}/>
                    </TouchableOpacity>

                    <View style={styles.spacer}></View>

                    { !this.state.ownPost ?
                      (
                        <TouchableOpacity style={[styles.followButton]} onPress={this._onFollowPress.bind(this)}>
                            <Image source={this.state.following ? require('image!btn_following') : require('image!btn_follow') }/>
                        </TouchableOpacity>
                      )
                      :
                      null
                    }
                </View>
                <ListView
                    style={{ marginBottom: 40}}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    removeClippedSubviews={false}
                    contentOffset={{x: 0, y: this.state.contentOffset}}
                    contentInset={{bottom: this.state.contentOffset}}
                    enableEmptySections={true}
                    keyboardShouldPersistTaps={true}
                />
                {(! post.featured) ?
                <PostReaction
                    profile={profile}
                    reactionImage={this.state.uploadImagePath}
                    style={{height: 60, marginTop: 10, marginBottom: 10}}
                    contentOffset={this.state.contentOffset}
                    onTakeReactionPhoto={this._onTakeReactionPhoto.bind(this)}
                    onPostReaction={this._onPostReaction}
                    ref="postReaction"
                />
                : null}

                { showLoading ? <ClapitLoading /> : null }

                <Modal
                    ref="editModal"
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.editModalVisible}
                    onRequestClose={() => {alert("Modal has been closed.")}}                    
                    >
                    <View style={{ flex: 1, marginTop: 20, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                        <View style={{ backgroundColor: 'white', marginTop: height/5}}>
                            <Text style={{ textAlign: 'center', fontSize: 18, borderBottomWidth: 1, marginTop: 5 }}>
                                Edit Description
                            </Text>
                            
                            <TagAutocompleteInputContainer
                                value={post.title}  
                                onChange={this._onEditTitleValueChange}
                                onSubmit={this._onEditTitleSubmit}
                                placeholder="Enter description"
                            />

                            <View style={{flex: 1, paddingTop: 5, paddingBottom: 15, flexDirection: 'row', borderTopWidth: 1}}>
                                <TouchableHighlight style={{flex: 0.5}} onPress={() => {                                    
                                    this.setState({editTitleValue: '', editModalVisible: !this.state.editModalVisible })
                                }}>
                                    <Text style={{textAlign: 'center'}}>Cancel</Text>                            
                                </TouchableHighlight>
                                
                                <TouchableHighlight style={{flex: 0.5}} onPress={() => {
                                    this._onEditTitleSubmit()
                                }}>
                                    <Text style={{textAlign: 'center'}}>Update</Text>                            
                                </TouchableHighlight>
                            </View>

                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    postContainer: {
        flexDirection: 'column'
    },
    topBar: {
        flexDirection: 'row',
        height: 38,
        marginTop: 20,
        marginBottom: 10

    },
    closeButton: {
        paddingLeft: 10,
        paddingTop: 5,
        flex: 0.2
    },
    spacer: {
        flex: 0.2
    },
    followButton: {
        paddingRight: 0,
        paddingTop: 5,
        flex: 0.6,
        position: 'absolute',
        right: 10
    },
    followText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    postInfoContainer: {
        flexDirection: 'row',
        marginRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0'
    },
    commentsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    commentsCountText: {
        color: '#AAA',
        fontSize: 14,
        marginTop: 5,
        marginLeft: 15
    },
    postText: {
        marginLeft: 15,
        marginRight: 15,
        marginTop: 2,
        fontSize: 14,
        paddingBottom:5
    },
    avatarContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#AAA'
    },
    avatarInfo: {
        flex: 0.5,
        flexDirection: 'column',
        paddingLeft: 5,
        paddingRight: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 40
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14
    },
    daysAgo: {
        color: '#AAA',
        fontSize: 12
    },
    tag: {
        color: '#B385FF'
    },
    postOptions: {
        position: 'absolute',
        right: 10,
        borderRadius: 50,
        backgroundColor: '#ffffff'
    },
    postOptionsText: {
        color: '#B385FF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width: 30,
        height: 30
    },
    shareButton: {
        position:'absolute',
        right: 10
    }
}
