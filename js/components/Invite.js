import React, { Component, PropTypes } from 'react';
import  {
    View,
    Text,
    Image,
    NativeModules,
    AlertIOS,
    TouchableOpacity
} from 'react-native'

import {
    FBSDKAppInviteDialog,
    FBSDKAppInviteContent
} from 'react-native-fbsdkshare'

import NavigationBar from 'react-native-navbar'
import BackButton from './IntroNav/BackButton'
import NavTitle from './IntroNav/NavTitle'

let { RNMail:Mailer, RNMessageComposer:Messenger, Contacts } = NativeModules

export default class Invite extends React.Component {

    constructor(props) {
        super(props)

    }

    _onPressBack() {
        let { navigator } = this.props
        navigator.pop()
    }

    _title() {
        return (
            <NavTitle>{this.props.title}</NavTitle>
        )
    }

    _leftButton() {
        return (
            <BackButton onPress={this._onPressBack.bind(this)}/>
        )
    }

    _onInviteFacebookPress() {
        var inviteContent = new FBSDKAppInviteContent('https://fb.me/614057172080065')
        FBSDKAppInviteDialog.setContent(inviteContent)
        FBSDKAppInviteDialog.show((error, result) => {
            console.log(error)
            console.log(result)
        })
    }

    _onInviteSmsPress() {

        let recipients = []

        // https://github.com/rt2zz/react-native-contacts
        Contacts.getAll((err, contacts) => {
            if (err && err.type === 'permissionDenied') {
                AlertIOS.alert('Error', 'Clapit requires access to Contact. Please enable access in Settings > Clapit > Contacts');
            } else {
                // collect contact mobile phones
                contacts.forEach(contact => {
                    if (contact.phoneNumbers) {
                        contact.phoneNumbers.forEach(item => {
                            if (item.label === 'mobile') {
                                recipients.push(item.number);
                            }
                        })
                    }
                })

                // Limit the number of recipients
                if (recipients.length > 100) recipients = recipients.splice(0, 100)

                // Create a message with all numbers
                Messenger.composeMessageWithArgs(
                    {
                        'subject': 'clapit invitation',
                        'messageText': 'Download the clapit app here: https://itunes.apple.com/app/apple-store/id1062124740?pt=117955591&ct=app&mt=8',
                        'recipients': recipients
                    },
                    (result) => {
                        switch (result) {
                            case Messenger.Sent:
                                console.log('the message has been sent')
                                break
                            case Messenger.Cancelled:
                                console.log('user cancelled sending the message')
                                break
                            case Messenger.Failed:
                                console.log('failed to send the message')
                                break
                            case Messenger.NotSupported:
                                console.log('this device does not support sending texts')
                                break
                            default:
                                console.log('something unexpected happened')
                                break
                        }
                    }
                )
            }
        })

    }

    _onInviteEmailPress() {
        // let clapit_banner = require('image!clapit_banner')
        //
        Mailer.mail({
            subject: 'clapit invitation',
            body: 'You are invited to download the <a href="http://clapit.com/">clapit</a> app.'
        }, (error, event) => {
            if (error) {
                AlertIOS.alert('Error', 'Could not send mail. Please send a mail to support@clapit.com');
            }
        });
    }

    render() {

        return (
            <View style={styles.container}>
                <NavigationBar leftButton={this._leftButton()} title={this._title()} style={styles.navBar}/>
                <View style={styles.content}>
                    <Image style={styles.logo} source={require('image!clapitLogoBlack')}/>
                    <Text style={styles.text}>clapit is more fun when you have more friends on clapit!</Text>
                    <TouchableOpacity onPress={this._onInviteFacebookPress.bind(this)} style={[styles.inviteButton, styles.inviteFacebookButton]}>
                        <View style={styles.buttonContent}>
                            <Image source={require('image!invite_friends_fb')}/>
                            <Text style={styles.buttonLabel}>INVITE FACEBOOK FRIENDS</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this._onInviteSmsPress.bind(this)} style={[styles.inviteButton, styles.inviteSmsButton]}>
                        <View style={styles.buttonContent}>
                            <Image source={require('image!invite_friends_sms')}/>
                            <Text style={styles.buttonLabel}>INVITE FRIENDS BY SMS</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this._onInviteEmailPress.bind(this)} style={[styles.inviteButton, styles.inviteEmailButton]}>
                        <View style={styles.buttonContent}>
                            <Image source={require('image!invite_friends_email')}/>
                            <Text style={styles.buttonLabel}>INVITE FRIENDS BY EMAIL</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    navBar: {
        backgroundColor: 'white'
    },
    logo: {},
    text: {
        margin: 20,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    inviteButton: {
        alignSelf: 'stretch',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 5,
        borderRadius: 5
    },
    inviteFacebookButton: {
        backgroundColor: '#395996'
    },
    inviteSmsButton: {
        backgroundColor: '#1FBF45'
    },
    inviteEmailButton: {
        backgroundColor: '#0BA3D5'
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginTop: 10,
        marginBottom: 10
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 16,
        paddingLeft: 10
    }
}
