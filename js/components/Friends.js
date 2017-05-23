import React, { Component } from 'react';
import  {
    View,
    Text,
    ListView,
    Dimensions,
    RefreshControl,
    Image,
    Animated,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    AlertIOS,
    NativeModules,
    LayoutAnimation,
    StatusBar
} from 'react-native'

let {RNMixpanel:Mixpanel } = NativeModules

import FeedItem from './Feed/FeedItem'
import ReactionItem from './Friends/ReactionItem'
import NetworkItem from './Network/NetworkItem'
import _ from 'lodash'
import { distanceFromEnd } from '../lib/scrollUtils'
import SGListView from 'react-native-sglistview'
import ClapitLoading from './ClapitLoading'
import {respPixels, RESP_RATIO} from '../lib/responsiveUtils'
import ClapitSearchBar from './ClapitSearchBar'
import {SEARCHBOX_HEIGHT, TOPBAR_HEIGHT} from '../constants/Size'

import { Colors } from '../themes'

const TOGGLE_FRIENDS_LABEL = 'Friends'
const TOGGLE_NEW_LABEL = 'New'

let { width, height } = Dimensions.get('window')

export default class Friends extends React.Component {

    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: this._rowHasChanged.bind(this)
        })

        let datasourcefeed = this._getDataSourceFeed(props);

        this.state = {
            dataSourceFeed: ds.cloneWithRows(datasourcefeed),
            dataSourceSearch: ds.cloneWithRows([]),
            searchResults: [],
            scroll: new Animated.Value(0),
            searching: false,
            canLoadNextPage: true,
            showLoading: true,
            dataType: props.friends.dataType,
            modalVisible: false,
            inviteItems:[],
            toggleFeed: TOGGLE_NEW_LABEL,
            searchBarHeight: SEARCHBOX_HEIGHT
        }

    }

    componentWillReceiveProps(nextProps) {

        let datasourcefeed = this._getDataSourceFeed(nextProps)

        let {clapitAccountData, loadDeviceContacts, fetchContactsToInvite} = nextProps;
        //console.log('visible tab changes', nextProps.visibleTab, this.props.visibleTab, nextProps)
        
        switch (nextProps.friends.dataType) {
            //hack to fix the auto play after visited the top10 feed, because the dataType didn't change
            case 'hash-tags-search': 
            case 'friends-data':
            {
                // load contacts only once, if they were not loaded as user wasn't logged in.
                if (! this.contactsLoaded && !_.isEmpty(clapitAccountData)){
                    this.contactsLoaded = true
                    setTimeout(() =>{
                        loadDeviceContacts(function(err, contacts){
                            if (err && err.type === 'permissionDenied') {
                                AlertIOS.alert('Error', 'Clapit requires access to Contact. Please enable access in Settings > Clapit > Contacts');
                            } else {
                                fetchContactsToInvite(contacts, clapitAccountData.id)

                            }
                        })
                    },100);
                }
                this.itemsChanged = {}

                let { itemsById:oldItemsById } = this.props.friends
                let { itemsById } = nextProps.friends
                
                for (var itemId in oldItemsById) {
                    if (itemsById[itemId]) {
                        let { clapCount:oldClapCount } = oldItemsById[itemId].post
                        let { clapCount } = itemsById[itemId].post

                        if (oldClapCount != clapCount || nextProps.visibleTab !== this.props.visibleTab) {
                            this.itemsChanged[itemId] = true
                        }
                    }
                }

                // ensure can load more
                let { page:oldPage, items:oldItems } = this.props.friends
                let { page, items } = nextProps.friends

                if (page > oldPage && items.length == oldItems.length) { // done for now
                    this.setState({ canLoadNextPage: false })
                    // re-enable after 10 seconds
                    setTimeout(()=> {
                        this.setState({ canLoadNextPage: true })
                    }, 10 * 1000)
                }
                if (nextProps.contacts.inviteItems.length) {
                    let items = _.uniqBy(nextProps.contacts.inviteItems, 'id')
                    items = items.slice(0, 3);
                    this.setState({inviteItems: items});
                    setTimeout(()=>{
                        let modalVisible = !!(!nextProps.friends.inviteModalDismissed && nextProps.inviteModalVisible);
                        this.setState({modalVisible});
                    }, 100);
                }


                this.setState({
                    searchResults: [],
                    dataSourceFeed: this.state.dataSourceFeed.cloneWithRows(datasourcefeed),
                    dataType: nextProps.friends.dataType,
                    showLoading: false
                })
            }
                break


            default:
            {
                // datasourcefeed = []
                this.setState({
                    searchResults: [],
                    dataSourceFeed: this.state.dataSourceFeed.cloneWithRows(datasourcefeed)
                })
            }

        }

    }

    componentWillUnmount() {

    }

    _onProfilePressed(item) {
        let { navigator, clapitAccountData, unauthenticatedAction } = this.props

        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        let {
            Account: {
                Media,
                CoverMedia,
                id: accountId,
                username
            }
        } = item.post
        let image = (Media) ? Media.mediumURL :  ' '
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL :  ' '

        navigator.push({ name: 'ProfileContainer', image, coverImage,  accountId, username, trackingSource: 'Friends' })
    }

    _onFollowPressed(itemId) {
        let { clapitAccountData } = this.props
        let { searchResults:items } = this.state
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

        items[itemIndex] = item

        this.setState({
            searchResults: items,
            dataSourceSearch: this.state.dataSourceSearch.cloneWithRows(items)
        })
    }

    _rowHasChanged(r1, r2) {
        return r1 != r2 || this.itemsChanged[r1]
    }

    _renderFeedRow(itemId, section, row) {
        const { width } = Dimensions.get('window')
        const { friends: { items, itemsById }, visibleTab } = this.props
        const item = itemsById[itemId]

        let { navigator, unauthenticatedAction, searchFriends } = this.props
        
        // if (this.hideLoadingTimer) {
        //     clearTimeout(this.hideLoadingTimer)
        // }
        // this.hideLoadingTimer = setTimeout(() => {
        //     this.setState({ showLoading: false })
        // }, 100)
        //console.log('friend visible tab', visibleTab)
        if (item.reaction) {
            return (
                <ReactionItem
                    key={item.reaction.id}
                    item={item.reaction}
                    style={{...styles.reactionItem}}
                    width={width}
                    searchFriends={searchFriends}
                    onReactionPressed={() => {
                        let { navigator, clapitAccountData, unauthenticatedAction } = this.props
                        if (_.isEmpty(clapitAccountData)) {
                            unauthenticatedAction && unauthenticatedAction();
                            return;
                        }
                        navigator.push({ name: 'PostDetails', post: item.post })
                }}/>
            )
        } else {
            return (
                <FeedItem
                    key={item.post.id}
                    item={item.post}
                    style={{...styles.friendsItem}}
                    width={width}
                    searchFriends={searchFriends}
                    navigator={navigator}
                    unauthenticatedAction={unauthenticatedAction}
                    onProfilePressed={this._onProfilePressed.bind(this, item)}
                    onMainImagePressed={this._onMainImagePressed}
                    visibleParent={visibleTab}
                    trackingSource="Friends"
                />
            )
        }
    }

    _onReactionsPressed(item) {
        let { navigator } = this.props
        navigator.push({ name: 'ReactionList', post: item.post })
    }

    _onMainImagePressed = (item) => {
        let { navigator, clapitAccountData, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post: item, trackingSource: 'Friends' })
    }

    _refreshFeed() {
        let { clapitAccountData } = this.props
        this.props.reloadData(clapitAccountData.id)
        this.props.reloadRecentData(clapitAccountData.id)
    }

    _onStartSearch(text) {
        let searchTerm = text.trim();
        if (searchTerm.length > 0) {
            // perform search
            this.setState({
                searchTerm: searchTerm
            })
            this.props.searchFriends(text, 0)
            this.props.navigator.push({ name: 'SearchResults', trackingSource: 'Friends', searchTerm, unauthenticatedAction:this.props.unauthenticatedAction})
            Mixpanel.trackWithProperties("Search Friend", { trackingSource: 'Friends', text })
        }
    }

    _onCancelSearch() {
        Mixpanel.trackWithProperties("Cancel Search", { trackingSource: 'Friends'})
        this.setState({ searching: false })
    }

    _onScroll(e) {
        let { canLoadNextPage } = this.state

        if (canLoadNextPage && distanceFromEnd(e) < 2000 && !this.loadingNextPage) {
            let { friends: { page }, clapitAccountData, fetchFriendsData, fetchRecentData } = this.props

            this.loadingNextPage = true

            const fetchData = this.state.toggleFeed === TOGGLE_NEW_LABEL ? fetchRecentData : fetchFriendsData;

            fetchData(clapitAccountData.id, page + 1).then(() => {
                this.loadingNextPage = false
            })


            setTimeout(() => {
                this.loadingNextPage = false
            }, 5000)  // try again after 5s

        }
    }

    _getDataSourceFeed(props) {

        let result = props.friends.items

        return result
    }

    componentDidMount() {
        let { clapitAccountData, fetchFriendsData, fetchRecentData, fetchContactsToInvite, loadDeviceContacts } = this.props
        LayoutAnimation.easeInEaseOut()
        const fetchData = this.state.toggleFeed === TOGGLE_NEW_LABEL ? fetchRecentData : fetchFriendsData
        fetchData(clapitAccountData.id, 0)
        //don't fetch device contacts until user is logged in
        if (_.isEmpty(clapitAccountData)) return;
        this.contactsLoaded = true;
        loadDeviceContacts(function(err, contacts){
            if (err && err.type === 'permissionDenied') {
                AlertIOS.alert('Error', 'Clapit requires access to Contact. Please enable access in Settings > Clapit > Contacts');
            } else {
                fetchContactsToInvite(contacts, clapitAccountData.id)
            }
        })

    }

    _replaceItem(item){
        item.skipped = true

        let updatedItems = this.props.contacts.inviteItems.filter(item => {
            return (!item.skipped && !item.invited)
        }).slice(0, 3)
        this.setState({inviteItems:updatedItems})
    }

    _onSkipClick(item){
        this.props.fetchSkipContact(item.id)
        this._replaceItem.bind(this, item)()
        Mixpanel.trackWithProperties("Skip Invite", { trackingSource: 'Friends' })
    }

    _onInviteClick(item){
        this.props.fetchInviteContact(item.id)
        this._replaceItem.bind(this, item)()
        Mixpanel.track("Invite friend")
    }

    _onInviteAllClick(){
        this.props.fetchInviteAllContacts(this.props.clapitAccountData.id, function(data){
            Mixpanel.trackWithProperties("Invite all friends", {invitesSent: data.invitesSent})
        })
        this.setState({modalVisible:false})
    }

    _renderInviteItem(item){
        let inviteButton = (
          <TouchableOpacity style={styles.inviteButton} onPress={this._onInviteClick.bind(this, item)}>
              <Image style={styles.inviteImage}
                     source={require('image!ico_invite_arrow')} />
          </TouchableOpacity>
        )
        let skipButton = (
          <TouchableOpacity style={styles.inviteButton} onPress={this._onSkipClick.bind(this, item)}>
              <Image style={styles.inviteImage}
                     source={require('image!ico_invite_skip')} />
          </TouchableOpacity>
        )
        let friendPluralized = (item.numberOfFriends > 1)? 'friends' : 'friend'
        let friendsInfo = (<Text style={styles.subtleText}>
            has {item.numberOfFriends} {friendPluralized} on clapit
        </Text>)

        return (
          <View style={styles.inviteItem} key={item.id}>
              <View style={styles.itemText}>
                  <Text style={styles.username}>{item.name}</Text>
                  {friendsInfo}
              </View>
              <View style={styles.buttonsContainer}>
                  {skipButton}
                  {inviteButton}
              </View>

          </View>
        )
    }

    _dismissModal(){
        this.props.dismissFriendsInviteModal()
        this.setState({modalVisible:false})
    }


    feedToggle = (selectedLabel) => {

        const style= {
            container: {
                height: 40,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-around'
            },
            label: { width: width/2},
            textWrapper: {height:38, justifyContent: 'center', alignItems: 'center'},
            text: {fontSize: 18 * RESP_RATIO, textAlign: 'center' },
            underline: { height: 2, width: width/2 }
        }

        const { clapitAccountData, reloadData, reloadRecentData, unauthenticatedAction } = this.props

        const toggle = toggleFeed => () => {

            if (toggleFeed === TOGGLE_FRIENDS_LABEL){
                if (_.isEmpty(clapitAccountData)) {
                    unauthenticatedAction && unauthenticatedAction();
                    return;
                }
            }
            if(toggleFeed !== this.state.toggleFeed) {
                // console.log('toggle', toggleFeed, this.state.toggleFeed)
                this.setState({ toggleFeed, showLoading: true })
                // console.log('listview', listView)
                //scroll to top to see the reload spinner
                //need to use refs to get the getScrollResponder method to work
                this.refs.friendsView.getScrollResponder().scrollTo({y: 0})
                const reload = toggleFeed === TOGGLE_NEW_LABEL ? reloadRecentData : reloadData
                reload(clapitAccountData.id)
            }
        }

        const labels = [TOGGLE_FRIENDS_LABEL, TOGGLE_NEW_LABEL];

        return (
          <View style={style.container}>
              {
                  labels.map(label =>
                    <TouchableOpacity onPress={toggle(label)} key={label}>
                        <View style={style.label}>
                            <View style={style.textWrapper}>
                                <Text style={style.text}> {label} </Text>
                            </View>
                            <View style={[style.underline, {
                          backgroundColor: selectedLabel === label? Colors.purple: 'white'
                      }]}/>
                        </View>
                    </TouchableOpacity>)
              }
          </View>
        )
    }

    render() {
        const refreshControl =
            <RefreshControl onRefresh={() => this._refreshFeed()}
                            refreshing={this.props.friends.reloading && this.props.friends.fetchingRemoteData}/>

        const { dataType, showLoading } = this.state
        let listView = <ListView
            removeClippedSubviews={false}
            dataSource={this.state.dataSourceFeed}
            renderRow={this._renderFeedRow.bind(this)}
            refreshControl={refreshControl}
            style={styles.list}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: this.state.scroll}}}],
              {listener: this._onScroll.bind(this)}
            )}
            scrollEventThrottle={5}
            enableEmptySections={true}
            premptiveLoading={5}
            scrollRenderAheadDistance={2000}
            stickyHeaderIndices={[]}
            initialListSize={3}
            pageSize={3}
            onEndReachedThreshold={50}
            ref="friendsView">
        </ListView>

        let topOffset = 60;

        return (
            <View style={styles.container}>
                <View style={{ height: 20, backgroundColor: 'white'}}>
                    <StatusBar barStyle="default"/>
                </View>

                { this.feedToggle(this.state.toggleFeed) }

                <Animated.View style={{
                    backgroundColor:'white',
                    height: this.state.scroll.interpolate({inputRange: [0, SEARCHBOX_HEIGHT * 2], outputRange: [SEARCHBOX_HEIGHT, 0], extrapolate: 'clamp'})
                }}/>

                { listView }

                <ClapitSearchBar
                  scroll={this.state.scroll}
                  onSearch={this._onStartSearch.bind(this)}
                  topOffset={topOffset}
                  unauthenticatedAction={this.props.unauthenticatedAction}
                  clapitAccountData={this.props.clapitAccountData}

                />

                { showLoading ? <ClapitLoading skipLayout={true}/> : null }

                <Modal
                  animationType={"fade"}
                  transparent={true}
                  visible={this.state.modalVisible}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.opaqueModal}>
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity style={styles.closeButton} onPress={this._dismissModal.bind(this)}>
                                    <Image source={require('image!btn_close')}/>
                                </TouchableOpacity>
                                <View style={styles.inviteHeader}>
                                    <Text style={styles.inviteHeaderText}>Invite your friends</Text>
                                </View>

                            </View>

                            <View style={styles.innerBox}>
                                {this.state.inviteItems.map(item => {return this._renderInviteItem(item)})}
                            </View>
                            <TouchableOpacity onPress={this._onInviteAllClick.bind(this)} style={[styles.inviteAllButton]}>
                                <View>
                                    <Text style={styles.inviteAllButtonText}>Invite all contacts with friends on clapit</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        marginBottom: 50,
        // backgroundColor: 'green',
        // marginTop: 2
    },
    reactionItem: {
        // alignSelf: 'stretch',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        // marginBottom: 10,
        // backgroundColor: 'red'
    },
    friendsItem: {
        flex: 1,
        alignSelf: 'stretch',
        // marginBottom: 20,
        // backgroundColor:'blue'
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
    },
    opaqueModal: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignSelf: 'stretch',
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius:20
    },
    modalContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        marginLeft: 30 * RESP_RATIO,
        marginRight: 30 * RESP_RATIO,
        marginBottom: 70 * RESP_RATIO
    },
    innerBox: {
        marginLeft: 25 * RESP_RATIO,
        marginRight: 25 * RESP_RATIO
    },
    inviteItem: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 5,
        paddingLeft: 10,
        marginBottom: 5,
        justifyContent: 'space-between'
    },
    closeButton: {
        width: 50 * RESP_RATIO,
        height: 50 * RESP_RATIO,
        paddingLeft: 10 * RESP_RATIO,
        paddingTop: 10 * RESP_RATIO,
        flex: 0.2
    },
    inviteAllButton: {
        alignSelf: 'stretch',
        marginLeft: respPixels(25),
        marginRight: respPixels(25),
        marginBottom: respPixels(20),
        marginTop: respPixels(20),
        borderRadius: 5,
        padding: respPixels(10),
        backgroundColor: '#BC90FF',
        borderColor: 'black',
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inviteAllButtonText: {
        color: 'white',
        fontSize: 11 * RESP_RATIO,
        fontWeight: 'bold'
    },
    inviteImage: {
        width:respPixels(50),
        height:respPixels(50)
    },
    subtleText : {
        fontSize: 10 * RESP_RATIO,
        color: '#888',
    },
    buttonsContainer:{
        position: 'relative',
        top: -10,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    username:{
    },
    itemText:{
        width: respPixels(160)
    },
    inviteHeader:{
        flex: 0.8,
        marginTop: 20
    },
    inviteHeaderText:{
        fontSize: 18 * RESP_RATIO,
        color: Colors.purple,
        left: - 20
    }
}
