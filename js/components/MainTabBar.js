'use strict'

import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    NavigationExperimental,
    NativeModules,
    Animated,
    Dimensions,
    TouchableOpacity
} from 'react-native'
import _ from 'lodash'
import { Images } from '../themes'

const {
    StateUtils: NavigationStateUtils
} = NavigationExperimental

import {
    NETWORK_FOLLOWING
} from '../constants/NetworkTypes'


import Tabs from 'react-native-tabs'

import NotificationsContainer from '../containers/NotificationsContainer'
import FriendsContainer from '../containers/FriendsContainer'
import FeedContainer from '../containers/FeedContainer'

import OpenCalls from './OpenCalls'
import ProfileContainer from '../containers/ProfileContainer'
import { Colors } from '../themes'

import NotificationsController from '../NotificationsController';
import CustomNavigationCardStack from './CustomNavigationCardStack';

let { AssetHelperManager, RNMixpanel: Mixpanel } = NativeModules
let { width } = Dimensions.get('window')

const BEST_TAB = 'best'
const NOTIFICATION_TAB = 'notifications'
const POST_TAB = 'Post'
const NEW_TAB = 'new'
const ME_TAB = 'me'
const SIGNUP_TAB = 'signup'

export default class MainTabBar extends React.Component {
    constructor(props) {
        super(props);

        this.routes = [
            { key: BEST_TAB, index: 0 },
            { key: NOTIFICATION_TAB, index: 1 },
            { key: NEW_TAB, index: 2 },
            { key: ME_TAB, index: 3 }
        ]
        this.navState = {
            index: 0,
            key: BEST_TAB,
            routes: this.routes
        }

        this.state = {
            selectedTab: this.props.defaultTab || BEST_TAB,
            notificationDotVisible: false,
            inviteModalVisible: false,
            signupPopupVisible: false,
            navState: this.navState,
            signupPopupFadeVal: new Animated.Value(0),
            animationDuration: 0 //hack rerender to get video to stop playing
        }
    }

    componentDidMount() {
        let { clapitAccountData, friendshipsWithAccountId, fetchNetwork, parentNavigator } = this.props

        if (!_.isEmpty(clapitAccountData)) {
            friendshipsWithAccountId(clapitAccountData.id)
            fetchNetwork(clapitAccountData.id, NETWORK_FOLLOWING)

            //in case user closed the app and didn't finish profile setup
            if (!clapitAccountData.username) {
                return parentNavigator.push({ name: 'EditProfileContainer', index: 1 })
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let { clapitAccountData, verifyDeviceToken } = this.props
        /* uncomment to navigate to new tab after log in
        if (_.isEmpty(clapitAccountData)) {
            let selectedTab = 'new';
            this.navState = NavigationStateUtils.jumpTo(this.navState, selectedTab)
            this.setState({
                selectedTab,
                navState: this.navState
            })
        }
        */
        verifyDeviceToken()

        //hack to force re-render
        const route = nextProps.navigationState.routes[nextProps.navigationState.routes.length - 1];
        const newAnimationDuration = route.key !== 'MainContainer' ? 1 : 0;
        if (this.state.animationDuration !== newAnimationDuration) {
            this.setState({ animationDuration: route.key !== 'MainContainer' ? 1 : 0 })
        }
    }

    _displaySignupPopup() {
        this.setState({ signupPopupVisible: true });
        Animated.timing(
            this.state.signupPopupFadeVal,
            { toValue: 1 }
        ).start();
    }

    _closeSignupModal() {
        Animated.timing(
            this.state.signupPopupFadeVal,
            { toValue: 0 }
        ).start();
        setTimeout(() => {
            this.setState({ signupPopupVisible: false });
        }, 500);
    }


    _onChangeTab(tabName) {
        const {clapitAccountData, fileUpload, parentNavigator } = this.props
        if (_.isEmpty(clapitAccountData)) {
            if (tabName !== BEST_TAB && tabName !== NEW_TAB && tabName !== SIGNUP_TAB) {
                this._displaySignupPopup.bind(this)();
                return;
            }
        }
        Mixpanel.trackWithProperties('Change Tab', { name: tabName })
        if (tabName == POST_TAB) {
            if (fileUpload.inProgress) {
                return;
            }
            parentNavigator.push({ name: POST_TAB, callback: this._onContentSelected.bind(this) }, true)
        } else if (tabName == SIGNUP_TAB) {
            parentNavigator.push({ name: 'IntroNavContainer', overrideRouteName: 'Login-signUp', parentPop: true }, true)
        } else {
            //let tabIndex = _.find(this.routes, { key: tabName }).index;
            let { notificationDotVisible } = this.state;

            if (tabName == NOTIFICATION_TAB) {
                notificationDotVisible = false
            }
            let inviteModalVisible = false;
            if (tabName == NEW_TAB) {
                inviteModalVisible = (!this.props.friends.inviteModalDismissed)
            }

            this.navState = NavigationStateUtils.jumpTo(this.navState, tabName)

            this.setState({
                selectedTab: tabName,
                notificationDotVisible,
                inviteModalVisible,
                navState: this.navState
            })
        }
    }

    _onContentSelected(type, content, video) {
        Mixpanel.trackWithProperties('Choose Post Type', { type: type })

        let { parentNavigator } = this.props

        if (type == 'POST_MEDIA') {
            if (content.toLowerCase().indexOf('jpg') > -1 || content.toLowerCase().indexOf('png') > -1) {
                AssetHelperManager.saveTmpImage(content, (err, res) => {
                    let { image, orientation } = res
                    parentNavigator.replace({ name: 'Share', shareType: 'image', data: { image: content, orientation } })
                })
            } else if (content.toLowerCase().indexOf('gif') > -1) {
                parentNavigator.replace({ name: 'Share', shareType: 'gif', data: { image: content, orientation: 'portrait' } })
            } else { // video
                parentNavigator.replace({ name: 'Share', shareType: 'video', data: { video: content, image: '', orientation: 'portrait' } })

            }
        } else if (type == 'POST_CAPTURE') {
            Image.getSize(content, (width, height) => {
                let orientation = 'portrait'

                if (width > height) {
                    orientation = 'landscape'
                }

                parentNavigator.replace({ name: 'Share', shareType: 'image', data: { image: content, orientation } })
            })
        } else if (type == 'POST_CAPTURE_VIDEO' && video) {
            AssetHelperManager.getThumbnailImageForVideo(video, (err, res) => {
                let { image, orientation } = res
                parentNavigator.replace({ name: 'Share', shareType: 'video', data: { video: video, image: image, orientation } })
            })
        } else if (type == 'POST_CAPTURE_GIF') {
            parentNavigator.replace({ name: 'Share', shareType: 'gif', data: { image: content, orientation: 'portrait' } })
        }
    }

    _renderScene = (props) => {
        const visible = this.state.animationDuration === 0        
        let {scene: {route: {key}}} = props
        switch (key) {
            case BEST_TAB:
                return (
                    <FeedContainer
                      account={this.props.clapitAccountData}
                      fetchNetwork={this.props.fetchNetwork}
                      fetchFeedData={this.props.fetchFeedData}
                      reloadFeedData={this.props.reloadFeedData}
                      visibleTab={this.state.selectedTab === BEST_TAB && visible}
                      unauthenticatedAction={this._displaySignupPopup.bind(this)}
                      isMainFeed={true}
                      navigator={this.props.parentNavigator}
                      preferences={this.props.preferences}
                      setPreferences={this.props.setPreferences}
                      />
                )
            case NOTIFICATION_TAB:
                return (
                    <NotificationsContainer
                        reloadData={this.props.reloadNotificationsData}
                        navigator={this.props.parentNavigator}
                        visibleTab={this.state.selectedTab === NOTIFICATION_TAB && visible}
                        showNotificationDot={this._showNotificationDot.bind(this)}
                        />
                )
            case NEW_TAB:
                return (
                    <FriendsContainer
                        reloadData={this.props.reloadFriendsData}
                        reloadRecentData={this.props.reloadRecentData}
                        navigator={this.props.parentNavigator}
                        unauthenticatedAction={this._displaySignupPopup.bind(this)}
                        visibleTab={this.state.selectedTab === NEW_TAB && visible}
                        inviteModalVisible={this.state.inviteModalVisible} />
                )
            case ME_TAB:
                let url = this.props.clapitAccountData.Media && this.props.clapitAccountData.Media.mediumURL || ' ';
                let coverImage = this.props.clapitAccountData.CoverMedia && this.props.clapitAccountData.CoverMedia.mediumURL || ' ';
                return (
                    <ProfileContainer
                        showSettingsButton={true}
                        isMyProfile={true}
                        image={url}
                        coverImage={coverImage}
                        username={this.props.clapitAccountData.username}
                        accountId={this.props.clapitAccountData.id}
                        visibleTab={this.state.selectedTab === ME_TAB && visible}
                        navigator={this.props.parentNavigator} />
                )
        }
    }

    _renderFlashMessage() {
        let {fileUpload, fileUploadReset} = this.props
        if (!fileUpload.inProgress && !fileUpload.success && !fileUpload.error) return null;
        if (fileUpload.success || fileUpload.error) {
            setTimeout(() => {
                fileUploadReset();
            }, 2500)
        }
        let backgroundColor = '#AAA'
        if (fileUpload.success) {
            backgroundColor = Colors.purple
        } else if (fileUpload.error) {
            backgroundColor = 'red'
        }

        return <View style={[styles.flashMessage, { backgroundColor }]}>
            {(this.props.fileUpload.progress > 0) ?
                <View style={[styles.progressUploadBar, { width: (width - 60) * (this.props.fileUpload.progress / 100) }]} />
                : null}
            <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Text style={{ color: 'white', marginLeft: 10, fontSize: 12 }}>{fileUpload.message}</Text>
            </View>
        </View>
    }

    _showNotificationDot() {
        let { selectedTab } = this.state

        if (selectedTab != 'notifications') {
            this.setState({
                notificationDotVisible: true
            })
        }
    }

    render() {
        let { clapitAccountData } = this.props
        let { signupPopupVisible } = this.state
        let isLoggedIn = !_.isEmpty(clapitAccountData)

        let middleTab = (isLoggedIn)
            ? {
                name: POST_TAB,
                imageBtn: {
                    true: Images.ico_post,
                    false: Images.ico_post
                },
                label: null,
                badge: null,
                height: 45
            }
            : {
                name: SIGNUP_TAB,
                imageBtn: {
                    true: Images.ico_main_signup,
                    false: Images.ico_main_signup
                },
                label: null,
                badge: null,
                height: 45
            }
        const tabData = [
            {
                name: BEST_TAB,
                imageBtn: {
                    true: Images.ico_best_on,
                    false: Images.ico_best_off
                },
                label: BEST_TAB,
                badge: null
            },
            {
                name: NOTIFICATION_TAB,
                imageBtn: {
                    true: Images.ico_alert_on,
                    false: Images.ico_alert_off
                },
                label: 'alerts',
                badge: this.state.notificationDotVisible ? <View style={styles.notificationDot} /> : null
            },
            middleTab,
            {
                name: NEW_TAB,
                imageBtn: {
                    true: Images.ico_new_on,
                    false: Images.ico_new_off
                },
                label: NEW_TAB,
                badge: null
            },
            {
                name: ME_TAB,
                imageBtn: {
                    true: Images.ico_me_on,
                    false: Images.ico_me_off
                },
                label: ME_TAB,
                badge: null
            }
        ]

        return (
            <View style={styles.container}>
                <NotificationsController />
                <CustomNavigationCardStack
                    navigationState={this.state.navState || this.navState}
                    animation_duration={this.state.animationDuration}
                    renderScene={this._renderScene}
                    />
                <Tabs style={styles.tabBar} selected={this.state.selectedTab} onSelect={el => this._onChangeTab(el.props.name)}>
                    {
                        tabData.map(tab =>
                            <View style={styles.tabItem} selectedStyle={styles.tabSelected} name={tab.name} key={tab.name}>
                                <View style={{height: tab.height || 45, width:45, overflow:'hidden'}}>
                                    <Image style={{ height: 45, width: 45 }} source={tab.imageBtn[this.state.selectedTab === tab.name]} />
                                </View>
                                {tab.badge}
                            </View>
                        )
                    }
                </Tabs>
                {signupPopupVisible ? <Animated.View style={[styles.signupPopup, { opacity: this.state.signupPopupFadeVal }]}>
                    <Image source={Images.signup_popup} style={styles.signupPopupImage}>
                        <TouchableOpacity onPress={this._closeSignupModal.bind(this)}>
                            <Image source={require('image!xButton')} style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20 }} />
                        </TouchableOpacity>
                        <Text style={styles.signupPopupText}>Sign Up to enjoy full functionality</Text>
                    </Image>
                </Animated.View> : null}
                {this._renderFlashMessage.bind(this)()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabBar: {
        height: 50,
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    tabItem: {
        // borderTopWidth: 1,
        // borderTopColor: 'gray',
        height: 50,
        flexDirection: 'column',
        alignSelf: 'stretch',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabLabel: {
        color: '#fff',
        alignItems: 'flex-end',
        fontSize: 12
    },
    tabSelected: {
        // backgroundColor: 'black'
    },
    postText: {
        marginTop: 17,
        fontSize: 18,
        textAlign: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    notificationDot: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4DD6CF'
    },
    signupPopup: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 55,
        width: width
    },
    signupPopupImage: {
        width: 150,
        height: 130,
        resizeMode: 'contain',
        opacity: 0.8
    },
    signupPopupText: {
        marginTop: 30,
        color: 'white',
        backgroundColor: 'transparent',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 1
    },
    flashMessage: {
        opacity: 0.7,
        left: 20,
        width: width - 40,
        position: 'absolute',
        top: 35,
        height: 50,
        borderRadius: 3
    },
    progressUploadBar: {
        margin: 10,
        height: 5,
        borderRadius: 3,
        backgroundColor: Colors.purple,
    }
})
