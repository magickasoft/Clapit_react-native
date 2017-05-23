import React, { Component, PropTypes } from 'react';
import  {
    View,
    Text,
    ListView,
    Dimensions,
    Image,
    NativeModules,
    AlertIOS
} from 'react-native'

import {
    MENU_SECTION,
    MENU_LOGGED_ACCOUNT,
    MENU_LINKED_ACCOUNT,
    MENU_STANDARD
} from '../constants/MenuTypes'

import _ from 'lodash'

import SectionItem from './Settings/SectionItem'
import StandardItem from './Settings/StandardItem'
import LoggedAccountItem from './Settings/LoggedAccountItem'
import LinkedAccountItem from './Settings/LinkedAccountItem'

import NavigationBar from 'react-native-navbar'
import BackButton from './IntroNav/BackButton'
import NavTitle from './IntroNav/NavTitle'

import {
  FBSDKAppInviteDialog,
  FBSDKAppInviteContent
} from 'react-native-fbsdkshare'

let { RNMail: Mailer, RNMixpanel:Mixpanel } = NativeModules

export default class Settings extends React.Component {

    constructor(props) {
        super(props)

        let dataSource = new ListView.DataSource({
            rowHasChanged: this._rowHasChanged
        })

        let menuItems = Object.assign({}, props.settings.menuItems)

        let account = null

        account = _.find(menuItems, { name: "linked_facebook" })
        account.isActive = props.hasFacebook

        account = _.find(menuItems, { name: "linked_twitter" })
        account.isActive = props.hasTwitter


        let activeCount = _.compact([props.hasFacebook, props.hasTwitter]).length

        this.state = {
            menuItems, activeCount,
            dataSource: dataSource.cloneWithRows(menuItems),
        }
    }

    componentWillReceiveProps(nextProps) {

        let menuItems = Object.assign({}, this.state.menuItems)
        account = _.find(menuItems, { name: "linked_facebook" })
        account.isActive = nextProps.hasFacebook

        account = _.find(menuItems, { name: "linked_twitter" })
        account.isActive = nextProps.hasTwitter
        
        let activeCount = _.compact([nextProps.hasFacebook, nextProps.hasTwitter]).length

        this.setState({
            menuItems,
            activeCount,
            dataSource: this.state.dataSource.cloneWithRows(menuItems)
        })
    }

    _onPressBack() {
        let { navigator } = this.props
        navigator.pop()
    }

    fixEventName(name) {
        return name.replace(/_/g,' ').replace(/\b\w/g, l=>l.toUpperCase())
    }

    _onLinkStatusChange(name, value) {

        Mixpanel.trackWithProperties(this.fixEventName(name), { trackingSource: 'Profile Settings', link: !!value })
        if (name == 'linked_facebook') {
            if (value)
                this.props.fbLogin()
            else
                this.props.fbLogout()
        }
        if (name == 'linked_twitter') {
            if (value)
                this.props.twitterLogin()
            else
                this.props.twitterLogout()
        }
    }

    _onMenuPress(name) {
        let { navigator } = this.props

        Mixpanel.trackWithProperties(this.fixEventName(name), { trackingSource: 'Profile Settings'})

        switch (name) {
            case 'invite_facebook_friends':
            {
                var inviteContent = new FBSDKAppInviteContent('https://fb.me/614057172080065')
                FBSDKAppInviteDialog.setContent(inviteContent)
                FBSDKAppInviteDialog.show((error, result) => {
                    console.log(error)
                    console.log(result)
                })

                break
            }
            case 'edit_profile':
            {
                navigator.push({ name: 'EditProfileContainer' })
                break
            }
            case 'feedback':
            {
                this._composeMail()
                break
            }
            case 'privacy_policy':
            {
                navigator.push({ name: 'PrivacyPolicy' })
                break
            }
            case 'terms_of_use':
            {
                navigator.push({ name: 'TermsOfUse' })
                break
            }
            case 'signout':
            {
                this._logout()
                break
            }
        }
    }

    _composeMail() {
        Mailer.mail({
            subject: 'clapit feedback',
            recipients: ['support@clapit.com']
        }, (error, event) => {
            if (error) {
                AlertIOS.alert('Error', 'Could not send mail. Please send a mail to support@example.com');
            }
        });
    }

    _logout() {
        let { navigator } = this.props
        this.props.clapitLogout()
        setTimeout(() => {
            navigator.pop()
            setTimeout(() => {
                navigator.push({name: 'IntroNavContainer'}, true)
            }, 10)
        }, 0)
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

    _renderSeparator(sectionID, rowID) {
        return <View key={`${sectionID}-${rowID}`} style={styles.separator}/>
    }

    _rowHasChanged(r1, r2) {
        return true  // this ensures switches match with redux...
    }

    _renderRow(menuItem) {
        switch (menuItem.type) {
            case MENU_SECTION:
                return (
                    <SectionItem {...menuItem} />
                )
            case MENU_LOGGED_ACCOUNT:
                return (
                    <LoggedAccountItem {...menuItem}
                        onLogoutPress={this._onLogoutPressed.bind(this)}/>
                )
            case MENU_LINKED_ACCOUNT:
                return (
                    <LinkedAccountItem {...menuItem}
                        activeCount={this.state.activeCount}
                        onLinkStatusChange={this._onLinkStatusChange.bind(this)}
                    />
                )
            case MENU_STANDARD:
                return (
                    <StandardItem {...menuItem}
                        onPress={this._onMenuPress.bind(this)}/>
                )
        }
    }

    render() {

        return (
            <View style={styles.container}>
                <NavigationBar leftButton={this._leftButton()} title={this._title()} style={styles.navBar}/>
                <ListView
                    dataSource={this.state.dataSource}
                    renderSeparator={this._renderSeparator.bind(this)}
                    enableEmptySections={true}
                    renderRow={this._renderRow.bind(this)}/>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    navBar: {
        backgroundColor: 'white'
    },
    separator: {
        height: 1,
        backgroundColor: '#CCC'
    }
}
