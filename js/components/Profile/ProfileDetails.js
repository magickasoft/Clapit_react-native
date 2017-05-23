import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    NativeModules
} from 'react-native'

import {Images} from '../../themes'
let { RNMixpanel:Mixpanel, AppHubManager } = NativeModules

export default class ProfileDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            debugCount: 1,
            isDebugMode: false
        }
    }

    componentWillMount() {
        AppHubManager.isDebugMode((err, isDebugMode) => {
            this.setState({ isDebugMode })
        })
    }

    checkDebugBuild = () => {
        // AppHubManager.setDebugMode(true)
        const {debugCount, isDebugMode} = this.state
        if (debugCount > 7) {
            AppHubManager.setDebugMode(!isDebugMode)
            this.setState({ debugCount: 1, isDebugMode: !isDebugMode })
            console.log('debug count', debugCount)
        } else {
            this.setState({ debugCount: debugCount + 1 })
        }

    }

    render() {
        let { profile, username, showSettingsButton, clapitAccountData, isMyProfile } = this.props
        if (!profile) {
            profile = {
                description: '',
                clapCount: '',
                followingCount: '',
                followerCount: '',
                school: '',
            }
        }
        let description = profile.description
        let school = profile.school
        if (isMyProfile){
            username = clapitAccountData.username
            description = clapitAccountData.description

            Mixpanel.createAlias(clapitAccountData.email)
        }

        const debugLabel = this.state.isDebugMode? '[debugMode]':''
        const isDemoAccount = profile.username === 'Clarissa'

        const clapCount = (isDemoAccount) ? 821 : profile.clapCount
        const followingCount = (isDemoAccount) ? 1241 : profile.followingCount
        const followerCount = (isDemoAccount) ? 24830 : profile.followerCount

        return (
            <View>
                <View style={styles.userContainer}>
                    {showSettingsButton ?
                      (
                        <TouchableWithoutFeedback onPress={()=>this.props.onSettingsPressed()}>
                            <Image style={styles.settingsImage} source={Images.ico_settings_cog}/>
                        </TouchableWithoutFeedback>
                      )
                      :
                      null
                    }
                    <Text onPress={this.checkDebugBuild} style={[styles.username, showSettingsButton? {paddingLeft: 5} : {}]}>{username + debugLabel}</Text>
                </View>
                <Text style={styles.description}>{description}</Text>
                {(school)? <Text style={styles.school}>{school}</Text> : null}

                <View style={styles.statsContainer}>
                    <View style={styles.clapInfo}>
                        <Text style={styles.clapsNumber}>{clapCount}</Text>
                        <Image style={{width:20, height:20}} source={Images.ico_clap_bw}/>
                    </View>
                    <TouchableOpacity style={styles.followingInfo} onPress={()=>this.props.onFollowingPressed()}>
                        <Text style={styles.followingNumber}>{followingCount}</Text>
                        <Text style={styles.followingText}> FOLLOWING</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.followersInfo} onPress={()=>this.props.onFollowersPressed()}>
                        <Text style={styles.followersNumber}>{followerCount}</Text>
                        <Text style={styles.followersText}> FOLLOWERS</Text>
                    </TouchableOpacity>
                    <View style={styles.actionInfo}>

                    </View>
                </View>
            </View>
        )
    }
}

const styles = {
    container: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#AAA',
        borderRadius: 5,
        overflow: 'hidden'
    },
    userContainer: {
        marginTop: 10,
        flex: 1,
        flexDirection: 'row'
    },

    settingsImage: {
        width: 30,
        height: 30,
        marginLeft: 10,
        marginTop: -5,
        borderRadius: 15
    },
    username: {
        flex: 1,
        fontWeight: 'bold',
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 18
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10
    },
    line: {
        backgroundColor: '#D0D0D0',
        marginLeft: 10,
        marginRight: 10,
        height: 1
    },
    description: {
        marginTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 7,
        fontSize: 11
    },
    school: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 7,
        fontSize: 10,
    },
    followingInfo: {
        flex: 0.3,
        flexDirection: 'row',
        paddingLeft: 5,
        paddingRight: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 20
    },
    followingNumber: {
        fontWeight: 'bold',
        fontSize: 12
    },
    followingText: {
        fontSize: 10
    },
    followersInfo: {
        flexDirection: 'row',
        flex: 0.3,
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 20,
        paddingRight: 10
    },
    followersNumber: {
        fontWeight: 'bold',
        fontSize: 12
    },
    followersText: {
        fontSize: 10
    },
    clapInfo: {
        flex: 0.2,
        flexDirection: 'row',
        height: 20,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    clapsNumber: {
        fontWeight: 'bold',
        fontSize: 12
    },
    clapsText: {
        fontSize: 10
    },
    actionInfo: {
        flex: 0.2,
        justifyContent: 'center',
        height: 30,
        paddingRight: 5
    },
    postButton: {
        backgroundColor: '#B289FC',
        height: 30,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#B289FC',
        borderRadius: 2
    },
    postText: {
        color: '#FFF',
        // fontFamily: 'AvenirNextRoundedStd-Med',
        textAlign: 'center',
        fontSize: 20
    }
}
