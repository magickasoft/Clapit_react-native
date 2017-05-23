/**
 * @flow
 */

'use strict';

var React = require('react');
var AppState = require('AppState');
var Platform = require('Platform');
var PushNotificationIOS = require('PushNotificationIOS');

// $FlowIssue
//var PushNotification = require('react-native-push-notification');
import _ from 'lodash'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
// var {
//   storeDeviceToken,
//   receivePushNotification,
//   //updateInstallation,
//   // markAllNotificationsAsSeen,
// } = require('./actions');

import { assignDeviceToken } from './actions/clapit';

import FCM from 'react-native-fcm';
import { NativeModules } from 'react-native'
const { RNMixpanel:Mixpanel } = NativeModules

import type { Dispatch } from './actions/types';

const PARSE_CLOUD_GCD_SENDER_ID = '1076345567071';

class AppBadgeController extends React.Component {
    props:{
        tab: string;
        enabled: boolean;
        badge: number;
        dispatch: Dispatch;
    };

    constructor() {
        super();

        (this: any).handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    handleAppStateChange(appState) {
        if (appState === 'active') {
            // this.updateAppBadge();
            // if (this.props.tab === 'notifications') {
            //   this.eventuallyMarkNotificationsAsSeen();
            // }
        }
    }

    componentWillMount() {
        const { assignDeviceToken } = this.props;

        FCM.requestPermissions();
        FCM.getFCMToken().then(token => {
            console.log('token3', token);
            // store fcm token in your server
            assignDeviceToken(token);
        });
        this.notificationUnsubscribe = FCM.on('notification', (notif) => {
            console.log('notif', notif);
            // there are two parts of notif. notif.notification contains the notification payload, notif.data contains data payload
        });
        this.refreshUnsubscribe = FCM.on('refreshToken', (token) => {
            console.log('refresh', token);
            // fcm token may not be available on first load, catch it here
            assignDeviceToken(token);
        });

        // FCM.subscribeToTopic('/topics/foo-bar');
        // FCM.unsubscribeFromTopic('/topics/foo-bar');
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);

        // const {dispatch} = this.props;
        // PushNotification.configure({
        //   onRegister: ({token}) => dispatch(storeDeviceToken(token)),
        //   onNotification: (notif) => dispatch(receivePushNotification(notif)),
        //   senderID: PARSE_CLOUD_GCD_SENDER_ID,
        //   requestPermissions: this.props.enabled,
        // });
        //
        // this.updateAppBadge();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);

        // prevent leak
        this.refreshUnsubscribe();
        this.notificationUnsubscribe();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.enabled && this.props.enabled) {
            PushNotification.requestPermissions();
        }
        if (this.props.badge !== prevProps.badge) {
            this.updateAppBadge();
        }
        if (this.props.tab === 'notifications' && prevProps.tab !== 'notifications') {
            this.eventuallyMarkNotificationsAsSeen();
        }
    }

    updateAppBadge() {
        if (this.props.enabled && Platform.OS === 'ios') {
            PushNotificationIOS.setApplicationIconBadgeNumber(this.props.badge);
            //updateInstallation({badge: this.props.badge});
        }
    }

    // eventuallyMarkNotificationsAsSeen() {
    //   const {dispatch} = this.props;
    //   setTimeout(() => dispatch(markAllNotificationsAsSeen()), 1000);
    // }

    render() {
        return null;
    }
}

function select(store) {
    return {
        enabled: store.notifications.enabled === true,
        badge: unseenNotificationsCount(store) + store.surveys.length,
        tab: store.navigation.tab,
    };
}

function stateToProps(state) {
  let { apiError, clapitAccountData } = state
  return { apiError, clapitAccountData }
}

const dispatchToProps = (dispatch) => {
    return bindActionCreators({
        assignDeviceToken
    }, dispatch)
}

// module.exportss = (AppBadgeController);
export default connect(stateToProps, dispatchToProps)(AppBadgeController);

//utils
//look for hashtag in the text and subscribe to that topic
export function scanAndSubHashtagTopic(text) {
    const hashtags = _.filter(text.split(' '), t => t.indexOf('#') === 0);
    _.forEach(hashtags, tag => {
        FCM.subscribeToTopic('/topics/' + tag.substr(1));
    });
}

export function scanAndSubmitEvent(text) {
    const hashtags = _.filter(text.split(' '), t => t.indexOf('#') === 0);
    _.forEach(hashtags, hashtag => {
        Mixpanel.trackWithProperties('Post hashtag', { hashtag })
        FCM.subscribeToTopic('/topics/' + hashtag.substr(1));
    });
}