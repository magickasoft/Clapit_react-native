'use strict'

import React, { Component } from 'react';
import  {
    View,
    Text,
    NativeModules,
    Alert
} from 'react-native'

import {
    NETWORK_FOLLOWERS,
    NETWORK_FOLLOWING,
    NETWORK_CLAPS,
    NETWORK_FOLLOW_CONTACTS
} from './constants/NetworkTypes'

import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'

import IntroNavContainer from './containers/IntroNavContainer'
import MainContainer from './containers/MainContainer'
import ProfileContainer from './containers/ProfileContainer'
import PostDetailsContainer from './containers/PostDetailsContainer'
import NetworkContainer from './containers/NetworkContainer'
import SettingsContainer from './containers/SettingsContainer'
import EditProfileContainer from './containers/EditProfileContainer'
import SearchResultsContainer from './containers/SearchResultsContainer'
import ClapitCamera from './components/ClapitCamera'
import Post from './components/Post'
import Extension from './extension'
import * as feedItemActions from './actions/feedItem'
import * as tagsActions from './actions/tags'
import { navigationPush, navigationPop, navigationReplace, onNavigate } from './actions/navigation'
import PostWebBrowser from './components/PostWebBrowser'
import LegalWebView from './components/IntroNav/LegalWebView'
import Invite from './components/Invite'
import IntroCarousel from './components/IntroCarousel'
import CustomNavigationCardStack from './components/CustomNavigationCardStack'
import FeedContainer from './containers/FeedContainer'
import OpenCalls from './components/OpenCalls'
//import PushNotification from 'react-native-push-notification'

import ReactMixin from 'react-mixin'
import TimerMixin from 'react-timer-mixin'

global._ = _

const NavigationCardStackStyleInterpolator = require('NavigationCardStackStyleInterpolator');


const { CrashlyticsManager, AppHubManager, RNMixpanel:Mixpanel } = NativeModules

// const initialRouteStack = []//[{ name: 'MainContainer', index: 0 }]

const MIXPANEL_TOKEN = process.env.NODE_ENV === 'dev' ? "23e6d9f0bf35e1f4308927110dbfc498" : "a6052cd4d26b0d8b8ccc0609efe815d2";

class App extends React.Component {
    constructor(props) {
        super(props)

        let { navigationPush, navigationPop, navigationReplace } = props
        this.state = {
            permissionsRequested:false
        };

        // for time's sake, converting from navigator.push to navigationPush
        this.navigator = {
            push: (data, staticState = false) => {
                const { name, ...otherData } = data
                const key = name + (staticState ? '' : ('-' + new Date().getTime()))
                navigationPush({ key, name, ...otherData })
            },
            pop: () => {
                navigationPop()
            },
            replace: (data, staticState = false) => {
                let { name, ...otherData } = data
                const key = name + (staticState ? '' : ('-' + new Date().getTime()))
                navigationReplace({ key, ...otherData })
            }
        }

        //this._initializePush()
        this._initializeMixpanel()
    }

    _initializePush() {
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log('~~~~~TOKEN:', token);
            },
            // (required) Called when a remote or local notification is opened or received
            onNotification: function (notification) {
                console.log('~~~~NOTIFICATION:', notification);
            },
            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },
            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,
            /**
             * IOS ONLY: (optional) default: true
             * - Specified if permissions will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             */
            requestPermissions: false
        });
    }

    _initializeMixpanel() {
        Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN);
        Mixpanel.track("App Started");
    }

    componentWillReceiveProps(newProps) {
        let { autoRehydrated:oldAutoRehydrated, clapitAccountData:oldClapitAccountData } = this.props
        let { autoRehydrated, clapitAccountData } = newProps
        let requestPermission = false;
        if (!oldAutoRehydrated && autoRehydrated) { // data just became hydrated
            if (_.isEmpty(clapitAccountData)) {  // new stuff is empty, so show intro
                //this should be a special case, use setTimeout to avoid putting IntroNavContainer on top of the navigation stack
                //when Feed component is initializing                
                setTimeout(()=>{ 
                    this.navigator.push({ name: 'IntroNavContainer' }, true)    
                })                
            } else {
                requestPermission = true;
            }
        }

        if (_.isEmpty(oldClapitAccountData) && !_.isEmpty(clapitAccountData)) { // just logged in
            requestPermission = true;
        }
        if (requestPermission && !this.state.permissionsRequested){
            console.log('~~~ Requsting Permissions ~~~')
            // PushNotification.requestPermissions()
            crashlyticsLogUser(clapitAccountData)
            this.setState({permissionsRequested: true});

            Mixpanel.identify(clapitAccountData.email)
            //console.log('data',clapitAccountData)
            Mixpanel.setOnce({
                '$created': clapitAccountData.created,
                '$email': clapitAccountData.email
            });

            var person = {};
            if(clapitAccountData.gender) person['$gender'] = clapitAccountData.gender
            if(clapitAccountData.locale) person['$locale'] = clapitAccountData.locale
            if(clapitAccountData.timezone) person['$timezone'] = clapitAccountData.timezone
            if(clapitAccountData.username) person['$username'] = clapitAccountData.username
            Mixpanel.set(person)
        }
    }

    _renderScene({ scene }) {
        let { navigationState:completeNavigationState } = this.props // from redux
        let { route } = scene // from scene
        let { clapitAccountData, navigationPush, navigationPop } = this.props
        let { name, post, resourceId, callback, key, unauthenticatedAction, ...extraProps } = route

        key = key.split('-')[0]  // for showing multiple PostDetails...?

        switch (key) {
            case 'MainContainer':
                return (
                    <MainContainer clapitAccountData={clapitAccountData}
                                   completeNavigationState={completeNavigationState} parentNavigator={this.navigator}/>)
            case 'IntroNavContainer':
                return (<IntroNavContainer parentNavigator={this.navigator} {...extraProps} />)
            case 'Post':
                return (<Post
                    onContentSelected={callback}
                    parentNavigator={this.navigator}/>)
            case 'Share':
                let { shareType, data } = route
                return (<Extension
                    shareType={shareType}
                    data={data}
                    navigator={this.navigator}/>)
            case 'ClapitCamera':
                let { photoSelect = false, photoOnlySelect = false, cameraType,
                  displayGifCamSwitch, displayCoverSwitch, displayComment, displaySelfieOverlay, embedded } = route
                return (<ClapitCamera
                    navigator={this.navigator}
                    photoSelect={photoSelect}
                    photoOnlySelect={photoOnlySelect}
                    cameraType={cameraType}
                    displayGifCamSwitch={displayGifCamSwitch}
                    displayCoverSwitch={displayCoverSwitch}
                    displayComment={displayComment}
                    displaySelfieOverlay={displaySelfieOverlay}
                    embedded={embedded}
                    callback={callback}/>)
            // case 'ReactionList':
            //   return <ReactionListContainer
            //            post={post}
            //            profile={clapitAccountData}
            //            navigator={navigator} />
            case 'PostDetails':
                return <PostDetailsContainer
                    post={post}
                    profile={clapitAccountData}
                    navigator={this.navigator}/>
            case 'ProfileContainer':
                let { image, coverImage, username, accountId } = route
                return <ProfileContainer
                    image={image}
                    coverImage={coverImage}
                    username={username}
                    accountId={accountId}
                    navigator={this.navigator}
                    showCloseButton={true}/>
            case 'Followers':
                return <NetworkContainer
                    title='FOLLOWERS'
                    type={NETWORK_FOLLOWERS}
                    resourceId={resourceId}
                    navigator={this.navigator}/>
            case 'Following':
                return <NetworkContainer
                    title='FOLLOWING'
                    type={NETWORK_FOLLOWING}
                    resourceId={resourceId}
                    navigator={this.navigator}/>
            case 'Claps':
                return <NetworkContainer
                    title='CLAPS'
                    type={NETWORK_CLAPS}
                    resourceId={resourceId}
                    navigator={this.navigator}/>
            case 'FollowContacts':
                return <NetworkContainer
                  title='ADD YOUR FRIENDS'
                  type={NETWORK_FOLLOW_CONTACTS}
                  resourceId={resourceId}
                  navigator={this.navigator}/>
            case 'PostWebBrowser':
                const { url, searchFriends } = route
                return <PostWebBrowser
                    url={url}
                    title={route.title}
                    searchFriends={searchFriends}
                    navigator={this.navigator}/>
            case 'Settings':
                return <SettingsContainer
                    title='SETTINGS'
                    navigator={this.navigator}/>
            case 'PrivacyPolicy':
                return (<LegalWebView
                    privacy={true}
                    navigator={this.navigator}/>)
            case 'TermsOfUse':
                return (<LegalWebView
                    terms={true}
                    navigator={this.navigator}/>)
            case 'Invite':
                return <Invite
                    title='INVITE'
                    navigator={this.navigator}/>
            case 'EditProfileContainer':
                return <EditProfileContainer
                    navigator={this.navigator}
                    tabName={route.tabName}/>
            case 'IntroCarousel':
                return <IntroCarousel
                    navigator={this.navigator}/>
            case 'SearchResults':
                const {searchTerm, hideSearchBar, topLimit} = route
                return <SearchResultsContainer
                  navigator={this.navigator}
                  searchTerm={searchTerm}
                  hideSearchBar={hideSearchBar}
                  topLimit={topLimit}
                  unauthenticatedAction={unauthenticatedAction}
                  {...extraProps}
                />
            case 'Best':
                return <FeedContainer
                  navigator={this.navigator}
                  account={clapitAccountData}
                  unauthenticatedAction={unauthenticatedAction}
                  {...extraProps}
                />
            case 'OpenCalls':
                return <OpenCalls
                  navigator={this.navigator}
                  navigationState={this.props.navigationState}
                  account={clapitAccountData}
                  unauthenticatedAction={unauthenticatedAction}
                  {...extraProps}
                />
        }
    }


    componentDidMount() {
        this.ignoreNewBuilds = false

        if (!this.props.debug) {
            this.setInterval(this._checkForNewBuild.bind(this), 1000 * 60)
            this._checkForNewBuild()
        }
    }

    _checkForNewBuild() {
        console.log('Checking for new build')
        AppHubManager.hasNewVersion((err, newVersionAvailable) => {
            if (newVersionAvailable && !this.ignoreNewBuilds) {
                Alert.alert('New Build', 'A new build is available!  Would you like to apply it right now?', [
                    {
                        text: 'No', onPress: () => {
                        this.ignoreNewBuilds = true
                    }, style: 'cancel'
                    },
                    {
                        text: 'Yes', onPress: () => {
                        AppHubManager.reloadBridge()
                    }
                    }
                ])
            }
        })
    }

    render() {
        let {
          autoRehydrated,
          navigationState,
          navigationPush,
          navigationPop,
          navigationReplace,
          onNavigate
        } = this.props

        if (!autoRehydrated) {
            return (<View></View>)
        }
        return (
            <CustomNavigationCardStack
                navigationState={navigationState}
                style={{flex:1}}
                animation_duration={0}
                onNavigate={onNavigate}
                renderScene={this._renderScene.bind(this)}
            />
        )
    }
}

ReactMixin(App.prototype, TimerMixin);

const crashlyticsLogUser = (accountData) => {
    let { id = '', username = '', email = '' } = accountData
    id = id + '' // convert to string for time sake

    CrashlyticsManager.logUser({ id, username, email })
}

const stateToProps = (state) => {
    let { autoRehydrated, navigationState, clapitAccountData } = state

    return { autoRehydrated, navigationState, clapitAccountData }
}

const dispatchToProps = (dispatch) => {
    return bindActionCreators(_.extend({}, feedItemActions, tagsActions, {
        navigationPop, navigationPush, navigationReplace, onNavigate
    }), dispatch)
}

export default connect(stateToProps, dispatchToProps)(App)
