import React, { Component } from 'react';
import  {
    View,
    Text,
    ListView,
    Dimensions,
    RefreshControl,
    Image,
    Animated,
    StatusBar
} from 'react-native'

import ReactMixin from 'react-mixin'
import TimerMixin from 'react-timer-mixin'

import NotificationItem from './Notifications/NotificationItem'
import ClapitLoading from './ClapitLoading'

import {SEARCHBOX_HEIGHT, TOPBAR_HEIGHT} from '../constants/Size'
import {Images, Colors} from '../themes'

const { width } = Dimensions.get('window')

export default class Notifications extends React.Component {

    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: this._rowHasChanged.bind(this)
        })

        this.state = {
            dataSource: ds.cloneWithRows(props.items),
            scroll: new Animated.Value(0),
            showLoading: true,
            follow: props.follow,
            unfollow: props.unfollow,
            currentUserFriendship: props.currentUserFriendship
        }
    }

    componentDidMount() {
        let { clapitAccountData } = this.props
        if (!_.isEmpty(clapitAccountData)) {
            this.props.fetchNotifications(clapitAccountData.id, 0)
        }


        this.setTimeout(
            () => {
                this._refreshAndRestart()
            },
            60000
        )
    }

    componentWillReceiveProps(nextProps) {
        const { items, notifications = {}, newNotifications: { itemIds, lastItemId }, clapitAccountData } = nextProps
        const { fetchingData } = notifications
        this.itemsChanged = (nextProps.currentUserFriendship.items.length !== this.props.currentUserFriendship.items.length)
        this.setState({
            currentUserFriendship: nextProps.currentUserFriendship
        })

        if (items.length > 0) {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(nextProps.items)
            })
        } else if (items.length == 0 && !fetchingData) {
            this.setState({
                showLoading: false
            })
        }
        if (_.isEmpty(this.props.clapitAccountData) && !_.isEmpty(clapitAccountData)) {
            this.props.fetchNotifications(clapitAccountData.id, 0)
        }


        // check if we should show notification dot
        if (this.props.newNotifications.lastItemId !== lastItemId && itemIds.length) {
            this.props.showNotificationDot()
        }
    }

    _rowHasChanged(r1, r2) {
        return r1 != r2 || this.itemsChanged;
    }

    componentWillUnmount() {

    }

    _refreshAndRestart() {
        this._refreshNotifications()

        this.setTimeout(
            () => {
                this._refreshAndRestart()
            },
            60000
        )
    }

    _renderSeparator(sectionID, rowID) {
        return <View key={`${sectionID}-${rowID}`} style={styles.separator}/>
    }

    _renderRow(item, section, row) {
        if (this.hideLoadingTimer) {
            this.clearTimeout(this.hideLoadingTimer)
        }
        this.hideLoadingTimer = this.setTimeout(() => {
            if (this.state.showLoading){
                this.setState({ showLoading: false })
            }
        }, 100)

        return (
            <NotificationItem
                key={item.id}
                item={item}
                currentUserFriendship={this.state.currentUserFriendship}
                notifications={this.state.notifications}
                follow={this.state.follow}
                unfollow={this.state.unfollow}
                onAvatarPress={this._onAvatarPress.bind(this)}
                onUsernamePress={this._onUsernamePress.bind(this)}
                onNotificationPress={this._onNotificationPress.bind(this)}
                width={width}/>
        )
    }

    _onAvatarPress(item) {
        this._showProfile(item)
    }

    _onUsernamePress(item) {
        this._showProfile(item)
    }


    _onNotificationPress(item) {
        let { navigator } = this.props
        let { id:notificationId } = item

        this.props.markNotificationOld(notificationId) // mark as viewed

        if (item.Post) {
            navigator.push({ name: 'PostDetails', post: item.Post })
        } else if (item.Actor) {
            this._onUsernamePress(item.Actor)
        }
    }

    _showProfile(item) {
        let { navigator } = this.props
        let {
            Media,
            CoverMedia,
            id,
            username
        } = item
        let image = (Media) ? Media.mediumURL : null  || ' '
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId: id, username })
    }

    _refreshNotifications() {
        let { clapitAccountData } = this.props
        if (_.isEmpty(clapitAccountData)) {
            return;
        }
        this.props.reloadData(clapitAccountData.id)
    }

    render() {
        const refreshControl = <RefreshControl onRefresh={() => this._refreshFeed()}
                                               refreshing={this.props.notifications.reloading && this.props.notifications.fetchingData}/>
        const { showLoading } = this.state
        const { items } = this.props

        return (
            <View style={styles.container}>
                <View style={{ height: 20, backgroundColor: 'white'}}>
                    <StatusBar barStyle="default"/>
                </View>
                <Animated.View
                    style={{...styles.header, height: this.state.scroll.interpolate({inputRange: [0, TOPBAR_HEIGHT * 4], outputRange: [TOPBAR_HEIGHT, 0], extrapolate: 'clamp'})}}>
                    <Animated.Image
                        source={Images.clapit_top_bar}
                        style={{
                        ...styles.headerImage,
                        height: this.state.scroll.interpolate({inputRange: [0, TOPBAR_HEIGHT * 4], outputRange: [TOPBAR_HEIGHT, 0], extrapolate: 'clamp'}),
                        opacity: this.state.scroll.interpolate({inputRange: [0, TOPBAR_HEIGHT * 4], outputRange: [1, 0], extrapolate: 'clamp'})
                        }}/>
                </Animated.View>

                {(items && items.length) ?
                    <ListView
                      removeClippedSubviews={false}
                      dataSource={this.state.dataSource}
                      renderRow={this._renderRow.bind(this)}
                      renderSeparator={this._renderSeparator.bind(this)}
                      style={styles.list}
                      onScroll={Animated.event([{nativeEvent: {contentOffset: {y: this.state.scroll}}}])}
                      scrollEventThrottle={5}
                      enableEmptySections={true}
                      ref="notificationsView">
                    </ListView>
                 : <View style={[styles.list, {alignItems:'center', justifyContent:'center'}]}><Text style={styles.noAlertsText}>see who's been clapping you</Text></View>}


                { showLoading ? <ClapitLoading skipLayout={true}/> : null }
            </View>
        )
    }
}

ReactMixin(Notifications.prototype, TimerMixin);

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        marginBottom: 50,
        backgroundColor: 'white',
        paddingTop: 0
    },
    separator: {
        height: 1,
        backgroundColor: '#CCC',
        marginLeft: 15,
        marginRight: 15
    },
    header: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerImage: {
        resizeMode: 'contain'
    },
    noAlertsText: {
        fontSize: 24,
        color: Colors.purple,
        textAlign: 'center'
    }
}
