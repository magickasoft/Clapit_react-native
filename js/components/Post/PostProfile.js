import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import React, { Component } from 'react';
import  {
    View,
    TouchableWithoutFeedback,
    Image,
    Text,
    ListView,
    StatusBar,
    Dimensions,
    ScrollView,
    Keyboard,
    Alert,
    ActionSheetIOS,
    NativeModules,
    TouchableOpacity
} from 'react-native'

import moment from 'moment'
const { RNMixpanel:Mixpanel } = NativeModules


export class PostProfile extends React.Component {

    _onProfilePressed() {
        let { navigator, profile, trackingSource, appState: {clapitAccountData}, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        Mixpanel.trackWithProperties("Open Profile", { trackingSource });
        let { Media, CoverMedia, id: accountId, username } = profile
        let image = (Media) ? Media.mediumURL :  ' '
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username, trackingSource })
    }

    render() {
        let profilePicture = this.props.profile.Media && this.props.profile.Media.mediumURL || ' ';
        return (
            <TouchableWithoutFeedback style={styles.avatarContainer} onPress={this._onProfilePressed.bind(this)}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: profilePicture }} style={styles.avatar}/>
                    <View style={styles.avatarInfo}>
                        <Text style={styles.username}>{this.props.profile.username}</Text>
                        <Text style={styles.daysAgo}>{moment(this.props.publishTime).fromNow()}</Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}

const styles = {
    avatarContainer: {

        flexDirection: 'row',
        paddingLeft: 10
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
        height: 40
    },
    username: {
        fontWeight: '500',
        fontSize: 14
    },
    daysAgo: {
        color: '#AAA',
        fontSize: 12
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

export default connect(stateToProps, dispatchToProps)(PostProfile)

// REDUX STOP
