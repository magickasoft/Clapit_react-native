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
    NativeModules
} from 'react-native'

import SGListView from 'react-native-sglistview'

let {RNMixpanel:Mixpanel } = NativeModules

import FeedItem from './Feed/FeedItem'
import NetworkItem from './Network/NetworkItem'
import _ from 'lodash'
import { distanceFromEnd } from '../lib/scrollUtils'
import ClapitLoading from './ClapitLoading'
import {respPixels, RESP_RATIO} from '../lib/responsiveUtils'
import ClapitSearchBar from './ClapitSearchBar'
import BackButton from './IntroNav/BackButton'
import NavigationBar from 'react-native-navbar'
import NavTitle from './IntroNav/NavTitle'
import ClapitModal from './ClapitModal'
import {Images} from '../themes'

import {SEARCHBOX_HEIGHT, TOPBAR_HEIGHT} from '../constants/Size'
let { width, height } = Dimensions.get('window')

export default class SearchResults extends React.Component {

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
            searchTerm: props.searchTerm || '',
            showInfoModal:props.showInfoModal
        }

        this.typeTimeout = null
    }

    componentWillReceiveProps(nextProps) {

        let datasourcefeed = this._getDataSourceFeed(nextProps)
        // we want to prevent keep firing REST API calls with pagination/scrolling once at the bottom of
        // the screen (ie no more results); we prevent further loading for 1min
        let { page:oldPage, results:oldResults } = this.props.friends
        let { page, results } = nextProps.friends
        // new page request but we already have all of the results; stop asking for more
        if (page > oldPage && results.length == oldResults.length) {
            this.setState({ canLoadNextPage: false })
            // re-enable after 10 seconds
            setTimeout(()=> {
                this.setState({ canLoadNextPage: true })
            }, 10 * 1000)
        }

        this.setState({
            searchResults: nextProps.friends.results,
            dataSourceSearch: this.state.dataSourceSearch.cloneWithRows(datasourcefeed),
            dataType: nextProps.friends.dataType,
            showLoading: nextProps.friends.fetchingRemoteData
        })
        if (this.props.searchTerm !== nextProps.searchTerm){
            this.setState({
                searchTerm : nextProps.searchTerm
            })
        }


    }

    componentWillUnmount() {
        clearTimeout(this.typeTimeout)
        this.typeTimeout = null
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
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '

        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username, trackingSource: 'Friends' })
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
        return r1 != r2
    }

    _renderSearchSeparator(sectionID, rowID) {
        return <View key={`${sectionID}-${rowID}`} style={styles.searchSeparator}/>
    }

    _renderSearchRow(item, section, row) {
        const { width } = Dimensions.get('window')
        let { clapitAccountData, navigator, unauthenticatedAction, searchFriends } = this.props

        const { dataType } = this.state
        
        switch (dataType) {
            case 'friends-search':
            {
                return (
                    <NetworkItem
                        key={item.id}
                        item={item}
                        style={{...styles.searchItem}}
                        navigator={navigator}
                        unauthenticatedAction={unauthenticatedAction}
                        allowFollow={(item.id !== clapitAccountData.id)}
                        onProfilePressed={(item) => {
                            let { navigator } = this.props
                            let { Media, CoverMedia, id, username} = item
                            let image = (Media) ? Media.mediumURL :  ' '
                            let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
                            navigator.push({ name: 'ProfileContainer', image, coverImage,  accountId: id, username })
                        }}
                        onFollowPressed={this._onFollowPressed.bind(this, item.id)}/>
                )
            }
                break

            case 'hash-tags-search':
            {
                return (
                    <FeedItem
                        key={item.id}
                        item={item}
                        recentPosts={item.Account.Posts}
                        rank={parseInt(row)+1}
                        clapitAccountData={clapitAccountData}
                        style={{...styles.friendsItem}}
                        width={width}
                        dataType={dataType}
                        navigator={navigator}
                        searchFriends={searchFriends}
                        unauthenticatedAction={unauthenticatedAction}
                        onProfilePressed={this._onProfilePressed.bind(this, {post: item})}
                        onMainImagePressed={this._onMainImagePressed}
                        trackingSource="Search"
                    />
                )
            }
                break
        }

    }

    _onMainImagePressed = (item) => {
        let { navigator, clapitAccountData, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post: item, trackingSource: 'Friends' })
    }

    _onStartSearch(text) {
        let searchTerm = text.trim();
        if (searchTerm.length > 0) {
            // clear previous timeouts
            clearTimeout(this.typeTimeout);
            // perform search
            this.typeTimeout = setTimeout(() => {
                this.setState({
                    searching: true,
                    showLoading: true,
                    searchTerm: searchTerm
                })
                this.props.searchFriends(text, 0)

                Mixpanel.trackWithProperties("Search Friend", { trackingSource: 'Friends', text })
            }, 700)

        } else {
            this.setState({ showLoading: false, searching: false })
        }
    }

    _onScroll(e) {
        let { canLoadNextPage } = this.state

        if (canLoadNextPage && distanceFromEnd(e) < 2000 && !this.loadingNextPage) {
            let { friends: { page }, searchFriends } = this.props

            this.loadingNextPage = true
            // searchFriends handles both friends and hash tags
            searchFriends(this.state.searchTerm, page + 1).then(() => {
                this.loadingNextPage = false
            })

            setTimeout(() => {
                this.loadingNextPage = false
            }, 5000)  // try again after 5s

        }
    }

    _getDataSourceFeed(props) {
        let {topLimit} = props

        let result = []

        switch (props.friends.dataType) {
            case 'friends-search':
                // results hold filtered friends
                result = props.friends.results
                break
            case 'hash-tags-search':
                // results hold filtered posts with relevant hash tag
                result = props.friends.results && props.friends.results.filter(post => !post.featured)
                if (topLimit && result){
                    result = result.filter(post => post.Account.id !==3).slice(0, topLimit);
                }
                break
        }

        return result
    }

    componentDidMount() {


    }

    _showInfoModal = () => {
        this.setState({showInfoModal:true})
    }


    _onPressBack() {
        let { navigator } = this.props
        navigator.pop()
    }

    render() {
        const { hideSearchBar, infoText } = this.props
        const { showLoading } = this.state

        let listView = <ListView
                removeClippedSubviews={false}
                dataSource={this.state.dataSourceSearch}
                renderRow={this._renderSearchRow.bind(this)}
                style={styles.list}
                onScroll={this._onScroll.bind(this)}
                scrollEventThrottle={5}
                enableEmptySections={true}
                premptiveLoading={5}
                scrollRenderAheadDistance={2000}
                stickyHeaderIndices={[]}
                initialListSize={3}
                pageSize={3}
                onEndReachedThreshold={50}
                ref="searchView">
            </ListView>
        let leftButton = <BackButton onPress={this._onPressBack.bind(this)}/>
        let title = <NavTitle>{this.props.title || this.state.searchTerm}</NavTitle>
        let rightButton = (infoText) ? <TouchableOpacity onPress={this._showInfoModal}>
              <Image source={Images.ico_info} style={{width: 40, height: 40, marginRight:10}}/>
          </TouchableOpacity> : <View/>
        let topOffset = 66;

        return (
            <View style={styles.container}>

                <NavigationBar leftButton={leftButton} rightButton={rightButton} title={title} style={styles.navBar}/>
                {hideSearchBar ? null :
                    <Animated.View style={{
                      top: topOffset,
                      left: 0, width,
                      overflow: 'hidden',
                      backgroundColor: 'white',
                      height: this.state.scroll.interpolate({
                        inputRange: [0, SEARCHBOX_HEIGHT * 2],
                        outputRange: [SEARCHBOX_HEIGHT, 0],
                        extrapolate: 'clamp'
                      })
                    }}/>
                }
                { listView }
                {hideSearchBar ? null :
                  <ClapitSearchBar
                    scroll={this.state.scroll}
                    onSearch={this._onStartSearch.bind(this)}
                    searchTerm={this.state.searchTerm}
                    topOffset={topOffset}
                    unauthenticatedAction={this.props.unauthenticatedAction}
                    clapitAccountData={this.props.clapitAccountData}
                  />
                }
                { showLoading ? <ClapitLoading skipLayout={true}/> : null }
                { this.state.showInfoModal ? <ClapitModal infoText={infoText} showModal={this.state.showInfoModal} onClose={() => this.setState({showInfoModal:false})} />
                    : null}
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
        // marginBottom: 50,
        paddingTop: 20
    },
    searchSeparator: {
        height: 1,
        backgroundColor: '#CCC',
        marginLeft: 15,
        marginRight: 15
    },
    searchItem: {
        flex: 1,
        alignSelf: 'stretch',
        marginLeft: 10,
        marginRight: 10,
        paddingBottom: 10,
        paddingTop: 10
    },
    reactionItem: {
        alignSelf: 'stretch',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
    },
    friendsItem: {
        flex: 1,
        alignSelf: 'stretch',
        marginBottom: 20
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
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5
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
    }
}
