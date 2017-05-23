import React, { Component } from 'react';
import  {
    View,
    Text,
    ListView,
    Dimensions,
    RefreshControl,
    Image,
    Animated,
    NativeModules,
    AlertIOS,
} from 'react-native'

import NavigationBar from 'react-native-navbar'
import NetworkItem from './Network/NetworkItem'
import BackButton from './IntroNav/BackButton'
import ForwardButton from './IntroNav/ForwardButton'
import NavTitle from './IntroNav/NavTitle'
import { NETWORK_FOLLOW_CONTACTS} from '../constants/NetworkTypes'
import ClapitSearchBar from './ClapitSearchBar'

const { RNMixpanel:Mixpanel } = NativeModules
let { Contacts } = NativeModules
import {SEARCHBOX_HEIGHT, TOPBAR_HEIGHT} from '../constants/Size'
let { width, height } = Dimensions.get('window')

export default class Network extends React.Component {

    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        })

        let items = (props.type === NETWORK_FOLLOW_CONTACTS) ? props.contacts.followItems : props.network.items
        this.state = {
            items: items,
            dataSource: ds.cloneWithRows(items),
            scroll: new Animated.Value(0)
        }
    }

    componentDidMount() {
        let { resourceId, type } = this.props
        if (type !== NETWORK_FOLLOW_CONTACTS) {
            this.props.fetchNetwork(resourceId, type, 0)
        }

    }

    componentWillReceiveProps(nextProps) {
        let items = (nextProps.type === NETWORK_FOLLOW_CONTACTS) ? nextProps.contacts.followItems : nextProps.network.items

        this.setState({
            items: items,
            dataSource: this.state.dataSource.cloneWithRows(items)
        })

        if (nextProps.network.statusChanged) {
            this._refreshNotifications()
        }
    }

    _rightButton() {
        let {type } = this.props
        if (type === NETWORK_FOLLOW_CONTACTS) {
            return (
              <ForwardButton text="Next" onPress={this._onPressForwardButton.bind(this)}/>
            )
        }
    }

    _onPressForwardButton() {
        let {navigator} = this.props
        navigator.pop()
        navigator.pop()
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
        let {type } = this.props
        if (type !== NETWORK_FOLLOW_CONTACTS) {
            return (
              <BackButton onPress={this._onPressBack.bind(this)}/>
            )
        }

    }

    _renderSeparator(sectionID, rowID) {
        return <View key={rowID} style={styles.separator}/>
    }

    _renderRow(item, section, row) {
        let { clapitAccountData } = this.props

        return (
            <NetworkItem
                key={item.id}
                item={item}
                style={{...styles.networkItem}}
                allowFollow={(item.id !== clapitAccountData.id)}
                onProfilePressed={(item) => {
                    let { navigator } = this.props
                    let {
                       Media,
                       CoverMedia,
                       id,
                       username
                     } = item
                     let image = Media && Media.mediumURL || ' '
                     let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
                     navigator.push({ name: 'ProfileContainer', image, coverImage, accountId: id, username })
                  }}
                onFollowPressed={this._onFollowPressed.bind(this, item.id)}/>
        )
    }

    _onAvatarPress(item) {

    }

    _onFollowPressed(itemId) {
        let { clapitAccountData } = this.props
        let { items } = this.state
        items = items.slice()

        let itemIndex = _.findIndex(items, { id: itemId })
        let item = Object.assign({}, items[itemIndex])

        if (item.following) {
            this.props.unfollow(item.id, clapitAccountData.id)
            item.following = false
        } else {
            this.props.follow(item.id, clapitAccountData.id)
            item.following = true
        }

        items[itemIndex] = item  // put item back in items

        this.setState({
            items: items,
            dataSource: this.state.dataSource.cloneWithRows(items)
        })

    }
    _refreshNotifications() {
        let { resourceId, type } = this.props
        this.props.reloadNetwork(resourceId, type)
    }

    _onStartSearch (text) {
        let searchTerm = text.trim();
        if (searchTerm.length > 0) {
            // perform search
            this.setState({
                searchTerm: searchTerm
            })
            this.props.searchFriends(text, 0)
            this.props.navigator.push({ name: 'SearchResults', trackingSource: 'Best', searchTerm, unauthenticatedAction:this.props.unauthenticatedAction})
            Mixpanel.trackWithProperties("Search Friend", { trackingSource: 'Best', text })
        }
    }

    render() {
        let topOffset = 66;
        let searchBar = (this.props.type === NETWORK_FOLLOW_CONTACTS) ? null :
          <ClapitSearchBar
            scroll={this.state.scroll}
            onSearch={this._onStartSearch.bind(this)}
            topOffset={topOffset}
            unauthenticatedAction={this.props.unauthenticatedAction}
            clapitAccountData={this.props.clapitAccountData}
          />
        return (
            <View style={styles.container}>
                <NavigationBar leftButton={this._leftButton.bind(this)()} rightButton={this._rightButton.bind(this)()} title={this._title()} style={styles.navBar}/>
                <View style={{
                    top: topOffset,
                    left:0, width,
                    backgroundColor:'white',
                    height: SEARCHBOX_HEIGHT
                }}/>
                <ListView
                    removeClippedSubviews={false}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    renderSeparator={this._renderSeparator.bind(this)}
                    style={styles.list}
                    enableEmptySections={true}
                    ref="notificationsView">
                </ListView>
                {searchBar}
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        marginTop: 100,
    },
    navBar: {
        backgroundColor: 'white'
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        paddingTop: 20
    },
    separator: {
        height: 1,
        backgroundColor: '#CCC',
        marginLeft: 15,
        marginRight: 15
    },
    networkItem: {
        flex: 1,
        alignSelf: 'stretch',
        marginLeft: 10,
        marginRight: 10,
        paddingBottom: 10,
        paddingTop: 10
    },
    header: {
        backgroundColor: '#B385FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerImage: {
        resizeMode: 'contain',
        marginTop: 24
    }
}
