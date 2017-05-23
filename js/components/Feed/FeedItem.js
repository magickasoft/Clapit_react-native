import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    WebView,
    NativeModules,
    Animated
} from 'react-native'

const { RNMixpanel: Mixpanel } = NativeModules

import Video from '../VideoPatchIos10'
//import YouTube from 'react-native-youtube'
import InViewPort from 'react-native-inviewport'

import ParsedText from 'react-native-parsed-text'

import PostProfile from '../Post/PostProfile'
import PostClapsIconCounter from '../PostClapsIconCounter'
import PostCommentsIconCounter from '../PostCommentsIconCounter'
import PostComments from '../PostComments'
import { Colors, Images, Styles } from '../../themes'
import { ShareButton } from '../../lib/utils'

let { width, height } = Dimensions.get('window')
import { GetPreviewImageUrl } from '../../lib/utils'

export default class FeedItem extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            anim : new Animated.Value(0),
            showFlashOverlay: false
        }
    }

    _onImagePress = (item) => () => {
        const { featured, id } = item

        Mixpanel.trackWithProperties('Open Post on Feed', { featured, postId: id })
        this.props.onMainImagePressed(item)
        if (id === this.props.item.id) {
            if (this.refs.video) this.refs.video.muteVideo()
        }
    }

    _onAvatarPress() {
        const { item: { Account } } = this.props
        Mixpanel.trackWithProperties('Open Profile on Feed', { accountId: Account.id })
        this.props.onProfilePressed()
    }

    _renderUserTag(match, matches) {
        // matches[1] contains tag without @ at the beginning
        const username = matches[1];
        var isExistingUser = this.props.item.UserTags
            && this.props.item.UserTags.find(userTag => userTag.Account.username === username);

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

    _onTagPress(tag, type) {
        const { navigator, searchFriends } = this.props;
        searchFriends(tag, 0)
        navigator.push({ name: 'SearchResults', searchTerm: tag, type: type, trackingSource: 'FeedItem' })
    }

    checkVisible = (isVisible) => {
        const { checkVisible } = this.props
        if (checkVisible) {
            checkVisible(isVisible, this.props.item)
        }
    }

    _onProfilePressed = () => {
        let { navigator, item, clapitAccountData, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        const trackingSource = 'profile-feed'
        Mixpanel.trackWithProperties("Open Profile", { trackingSource });
        let { Media, CoverMedia, id: accountId, username } = item.Account
        let image = (Media) ? Media.mediumURL : ' '
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username, trackingSource })
    }

    _renderUserProfile = () => {
        const { recentPosts, item, rank, visibleParent, trackingSource, navigator, unauthenticatedAction } = this.props
        const itemHeight = 0.75 * width
        const hasExtraPosts = recentPosts.length === 2

        const styles = {
            profileImage: {
                position: 'absolute',
                right: 20,
                width: 0.20 * width,
                height: 0.20 * width,
                borderRadius: 0.10 * width
            },
            profile: {
                position: 'absolute',
                width: width - 50,
                top: itemHeight - (0.20 * width * (hasExtraPosts ? 0.8 : 1.2)),
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                marginLeft: 50,
                paddingRight: 20
            },
            profileLabel: {
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: 5,
                color: 'white',
                fontSize: 18,
                width: 200,
                overflow: 'hidden'
            },
            moreTextOverlap: {
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                textShadowColor:'black',
                textShadowOffset: {width:1,height:1},
                position: 'absolute',
                top: 10,
                left: 10,
                backgroundColor: 'transparent'
            }
        }
       
        const otherPosts = recentPosts.map((p, index) => {
            const smallWidth = width / 2;
            const smallHeight = smallWidth * 0.75;
            const style = index === 0 ? { borderRightWidth: 1, borderColor: 'white' } : {}
            return this._renderItem({ item: p, width: smallWidth, height: smallHeight, useGif: true, style })
        })

        const content = this._renderItem({
            item, width, height: itemHeight, visibleParent,
            style: { borderBottomWidth: 1, borderBottomColor: 'white' }
        })
        return (
            <InViewPort onChange={this.checkVisible}>
                <View style={[styles.container, { borderBottomWidth: 2, borderColor: Colors.grey }]}>
                    <View style={{ borderBottomWidth: 1, borderColor: Colors.grey, paddingTop: 5, paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between' }} >                    
                        <PostProfile
                            post={item}
                            profile={item.Account}
                            publishTime={item.publishTime}
                            navigator={navigator}
                            unauthenticatedAction={unauthenticatedAction}
                            trackingSource={trackingSource}
                            />
                        <Image style={{ height: 40, width: 40, marginRight: 8 }} source={Images.gold_hand}>
                            <Text style={{ fontSize: 12, position: 'absolute', bottom: 4, right: 6, backgroundColor: 'transparent' }}>#{rank}</Text>
                        </Image>
                    </View>
                    {content}
                    {hasExtraPosts && <View style={{ flex: 1, flexDirection: 'row' }}>
                        {otherPosts}
                        <Text style={styles.moreTextOverlap}>More from {item.Account.username}...</Text>
                    </View>}

                </View>
            </InViewPort>
        )
    }

    _renderItem = ({item, width, height, visibleParent, useGif, style}) => {
        const youtubeIcon = <Image source={Images.ico_youtube} style={Styles.videoIcon} />
        // console.log('item', item)
        let content =
            (<Image source={{ uri: item.Media && item.Media.mediumURL || ' ' }} style={{ width, height }}>
                {item.videoURL && item.videoURL.includes('youtu') && youtubeIcon}
            </Image>)

        // console.log('props', this.props);
        if (item.videoURL) {
            if (item.videoURL.includes('youtu')) {
                //todo native youtube player
                /*let src = `
                 <!DOCTYPE html>\n
                 <html>
                 <head>
                 <meta name="viewport" content="width=device-width, initial-scale=1">
                 </head>
                 <body style="margin: 0">
                 <embed src="${this.props.item.videoURL}" width="${width}" height="${width}"></embed>
                 </body>
                 `
                 content = <WebView
                 source={{html: src}}
                 style={{width , height: width }}
                 scrollEnable={false}
                 />*/

            } else if (useGif) {
                content =
                    (<Image source={{ uri: GetPreviewImageUrl(item, 'gif') }} style={{ width, height }}>
                        {item.videoURL && item.videoURL.includes('youtu') && youtubeIcon}
                    </Image>)
            } else {
                content =
                    <View style={{ width, justifyContent: 'center' }}>
                        <Video resizeMode="cover"
                            source={{ uri: item.videoURL }}
                            rate={1.0}
                            muted={true}
                            repeat={true}
                            visibleParent={visibleParent}
                            ref="video"
                            style={{ width, height }} />
                    </View>
            }
        }
        // if we want to add border for the content
        // <View style={[{borderColor:Colors.grey, borderBottomWidth:1, borderTopWidth: 1}, style]}>
        return (
            <TouchableWithoutFeedback key={item.id} onPress={this._onImagePress(item)}>
                <View style={style}>
                    {content}
                    {(this.state.showFlashOverlay) ?
                    <Animated.View style={{backgroundColor:this._getBackgroundColor(item.clapCount),
                        width, height, position:'absolute', top: 0, left:0, opacity: this.state.anim,
                        justifyContent: 'center', alignItems: 'center'}}>
                        <Animated.Image source={Images.clap_flash} style={{width: 200, height: 200, opacity: this.state.anim}} />

                    </Animated.View>
                    : null}
                </View>
            </TouchableWithoutFeedback>
        )

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

    _renderPost = () => {
        const { width, navigator, unauthenticatedAction, trackingSource, item, visibleParent } = this.props
        const content = this._renderItem({ item, width, height: 0.75 * width, visibleParent })

        return (
            <InViewPort onChange={this.checkVisible}>
                <View style={(this.props.item.featured) ? styles.featuredContainer : styles.container}>
                    <PostProfile
                        post={this.props.item}
                        profile={this.props.item.Account}
                        publishTime={this.props.item.publishTime}
                        navigator={navigator}
                        unauthenticatedAction={unauthenticatedAction}
                        trackingSource={trackingSource}
                        />
                    <View style={{ marginTop: 5, height: 1 }} />

                    {content}

                    <View style={styles.footerContainer}>
                        {!this.props.item.featured &&
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <PostClapsIconCounter
                                    post={this.props.item}
                                    navigator={navigator}
                                    unauthenticatedAction={unauthenticatedAction}
                                    onClap={this._onClap}
                                    trackingSource={trackingSource}
                                    />

                                <PostCommentsIconCounter
                                    post={this.props.item}
                                    navigator={navigator}
                                    unauthenticatedAction={unauthenticatedAction}
                                    trackingSource={trackingSource}
                                    />
                            </View>
                        }

                        <View style={{ height: 40 }} />
                        <ShareButton post={item} style={styles.shareButton} />
                    </View>
                    <ParsedText
                        style={styles.postText}
                        parse={[
                            { pattern: /#(\w+)/, renderText: this._renderHashTag.bind(this) },
                            { pattern: /@(\w+)/, renderText: this._renderUserTag.bind(this) }
                        ]}>
                        {this.props.item.title}
                    </ParsedText>
                    <PostComments
                        post={this.props.item}
                        navigator={navigator}
                        />
                    <View style={styles.feedItemSeparator} />
                </View>
            </InViewPort>
        )
    }

    render() {
        return this.props.recentPosts ? this._renderUserProfile() : this._renderPost();
    }
}

const styles = {
    container: {
        backgroundColor: 'white',
        overflow: 'hidden',
        // marginBottom: 10
        
    },
    featuredContainer: {
        backgroundColor: '#F0E5FF',
        overflow: 'hidden',
        // marginBottom: 10
    },
    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        paddingLeft: 3,
        // backgroundColor: 'red'
    },
    postInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 2,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
        // backgroundColor: 'blue',
        textAlign: 'right'
    },
    avatarContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#AAA'
    },
    avatarInfo: {
        flex: 0.5,
        flexDirection: 'column',
        paddingLeft: 5,
        paddingRight: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: 30
    },
    username: {
        fontWeight: '500',
        fontSize: 10
    },
    daysAgo: {
        color: '#AAA',
        fontSize: 9
    },
    postText: {
        fontSize: 14,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 2,
        paddingBottom: 5
    },
    feedItemInfo: {
        flex: 1,
        justifyContent: 'center',
        height: 50,
        paddingRight: 10
    },
    title: {
        fontSize: 18,
        textAlign: 'right'
    },
    subtitle: {
        fontSize: 10,
        color: '#AAA',
        textAlign: 'right'
    },
    clapInfo: {
        flex: 0.5,
        alignItems: 'center'
    },
    feedItemSeparator: {
        marginTop: 5,
        height: 1,
        backgroundColor: Colors.grey
    },
    tag: {
        color: '#B385FF'
    },
    shareButton: {
        position: 'absolute',
        right: 10
    }
}
