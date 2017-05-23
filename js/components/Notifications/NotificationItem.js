import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    NativeModules
} from 'react-native'

import moment from 'moment'
const { RNMixpanel:Mixpanel } = NativeModules
import ParsedText from 'react-native-parsed-text'
import Video from '../VideoPatchIos10'
import {Colors, Images, Styles} from '../../themes'
import { GetPreviewImageUrl } from '../../lib/utils'

export default class NotificationItem extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            following: false
        }
    }

    componentDidMount() {
        let  { item, currentUserFriendship } = this.props
        if (currentUserFriendship) {
            const userFollowing = currentUserFriendship.items.indexOf(item.actorId)
            let following = (userFollowing > -1)
            this.setState({
                following
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        let  { item, currentUserFriendship } = nextProps

        if (currentUserFriendship) {
            const userFollowing = currentUserFriendship.items.indexOf(item.actorId)
            let following = (userFollowing > -1)

            this.setState({
                following
            });
        }
    }

    _onAvatarPress() {
        Mixpanel.trackWithProperties("Open Profile", { trackingSource: 'Notification' });
        this.props.onUsernamePress(this.props.item.Actor)
    }

    _onUsernamePress(user) {
        this.props.onUsernamePress(user)
    }

    _onNotificationPress() {
        this.props.onNotificationPress(this.props.item)
    }

    _renderUserTag(match, matches) {
        // matches[1] contains tag without @ at the beginning
        const username = matches[0]
        let props = {}
        if (this.props.item.Actor) {
            props = {
                style: styles.username,
                onPress: this._onUsernamePress.bind(this, this.props.item.Actor)
            }
        }
        return (<Text {...props}>{username}</Text>)
    }

    _onFollowPress() {

        const { item } = this.props
        if (this.state.following) {
            this.props.unfollow(item.actorId, item.accountId)
            this.setState({ following: false })
        } else {
            this.props.follow(item.actorId, item.accountId)
            this.setState({ following: true })
        }

        Mixpanel.trackWithProperties("Toggle Follow", { trackingSource: 'Notification', following: !this.state.following});
    }

    render() {
        let { width, item } = this.props
        // let notificationWidth = width * 0.65

        let rowImage = null
        if (this.props.item.Post) {
            const imageUrl = GetPreviewImageUrl(item.Post, 'gif');

            rowImage =
              <Image style={styles.notificationImage} source={{uri: imageUrl }}>
                  { item.Post.videoURL && <Image source={Images.ico_video} style={[Styles.videoIcon, { top: 0, left: 0}]} />}
              </Image>

            // console.log('alert image', imageUrl)

        } else if (this.props.item.type === 'follow') {
            rowImage =
            (
                <TouchableOpacity style={[styles.followButton]} onPress={this._onFollowPress.bind(this)}>
                    <Image source={this.state.following ? require('image!btn_notifications_following') : require('image!btn_notifications_follow') }/>
                </TouchableOpacity>
            )
        }

        let imageSource = ''

        let username = ' '
        let actorImage = null

        if (item && item.Actor && item.Actor.Media && item.Actor.Media.mediumURL) {
            username = item.Actor.username

            actorImage = (
                <TouchableOpacity onPress={this._onAvatarPress.bind(this)}>
                    <Image source={{uri: item.Actor.Media.mediumURL || ' '}} style={styles.avatar}/>
                </TouchableOpacity>
            )
        }

        let containerViewStyle = Object.assign({}, styles.container)

        if (item.isHighlighted) {
            containerViewStyle['backgroundColor'] = '#b1f5f1'
        }

        return (
            <TouchableWithoutFeedback onPress={this._onNotificationPress.bind(this)}>
                <View
                    style={containerViewStyle}>
                    {actorImage}
                    <View style={styles.notification}>
                        <ParsedText
                            style={styles.text}
                            parse={[{pattern: new RegExp(username), renderText: this._renderUserTag.bind(this)}]}>
                            {this.props.item.message}
                        </ParsedText>

                        <Text style={styles.daysAgo}>{moment(this.props.item.created).fromNow()}</Text>
                    </View>
                    {rowImage}
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10,
        alignItems: 'center'

    },
    avatar: {
        borderRadius: 25,
        width: 50,
        height: 50,
        borderWidth: 1.5,
        borderColor: '#AAA',
        marginRight: 10
    },
    notification: {
        justifyContent: 'flex-start',
        flex: 0.6
    },
    text: {
        flex: 1,
        fontSize: 18,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.purple
    },
    daysAgo: {
        color: '#AAA',
        fontSize: 10
    },
    notificationImage: {
        height: 37.5,
        width: 50,
        marginRight: 10,
        borderWidth: 2,
        borderColor: Colors.purple
    },
    followButton: {
        paddingTop: 10,
        paddingRight: 15
    }
}
