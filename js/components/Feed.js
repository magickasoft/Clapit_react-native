import React, { Component } from 'react';
import  {
    StatusBar,
    View,
    Text,
    ListView,
    Dimensions,
    RefreshControl,
    Image,
    Animated,
    TouchableOpacity,
    NativeModules,
    AsyncStorage
} from 'react-native'
import { distanceFromEnd } from '../lib/scrollUtils'
const { RNMixpanel:Mixpanel } = NativeModules
import FeedItem from './Feed/FeedItem'
import ClapitLoading from './ClapitLoading'
import {Images, Colors} from '../themes'
import {respPixels, RESP_RATIO} from '../lib/responsiveUtils'
import {SEARCHBOX_HEIGHT, TOPBAR_HEIGHT, STATUS_BAR_HEIGHT} from '../constants/Size'
import BackButton from './IntroNav/BackButton'
import NavigationBar from 'react-native-navbar'
import NavTitle from './IntroNav/NavTitle'
import ClapitModal from './ClapitModal'

const TOGGLE_BEST_LABEL = 'Trending'
const TOGGLE_TOP_10 = 'Top 10'

let { width, height } = Dimensions.get('window')

export default class Feed extends React.Component {
    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: this._rowHasChanged.bind(this)
        })
        let datasourceItems = (props.isMainFeed) ?
            props.items
          : props.friends.results.filter(post => !post.featured && post.Account.id !== 3).slice(0, 10)


        if(datasourceItems.length === 0){
            datasourceItems = [{value: 'empty'}]
        }
        this.state = {
            dataSource: ds.cloneWithRows(datasourceItems),
            scroll: new Animated.Value(0),
            scrollDiff: new Animated.Value(TOPBAR_HEIGHT),
            canLoadNextPage: true,
            showLoading: true,
            selectedTab: TOGGLE_TOP_10,
            showInfoModal:props.showInfoModal,
            route: null,
            visible: true
        }
        this.prevScroll = 0
        this.currentScroll = 0
        this.accumulatedScroll = -TOPBAR_HEIGHT
    }

    _onScroll(e) {
        let { canLoadNextPage } = this.state

        var currentOffset = e.nativeEvent.contentOffset.y;

        //assume 500 per post? is this device dependent?
        const currentPosts = Math.floor(currentOffset/500);
        // console.log('cur', currentOffset)
        if(currentPosts>0 && currentPosts%10 === 0 && (!this.previousScrollPost || this.previousScrollPost < currentPosts)) {
            Mixpanel.trackWithProperties("Scroll Feed", { numOfPosts: currentPosts});
            this.previousScrollPost = currentPosts;
        }

        if (canLoadNextPage && distanceFromEnd(e) < 2000 && !this.loadingNextPage) {
            let { page } = this.props

            let { clapitAccountData, fetchFeedData } = this.props

            this.loadingNextPage = true
            fetchFeedData(page + 1, false, this.props.hashtag).then(() => {
                this.loadingNextPage = false
            })

            setTimeout(() => {
                this.loadingNextPage = false
            }, 5000)  // try again after 5s

        }
        this.prevScroll = this.currentScroll;
        this.currentScroll = currentOffset;
        //this is to avoid bouncing - it creates temporary negative scroll value
        if (this.currentScroll < 0) {
            this.currentScroll = 0;
        }
        let diff = this.currentScroll - this.prevScroll;
        this.accumulatedScroll += diff;
        if (this.accumulatedScroll > 0){
            this.accumulatedScroll = 0
        }
        if (this.accumulatedScroll <= -TOPBAR_HEIGHT * 4){
            this.accumulatedScroll = -TOPBAR_HEIGHT * 4
        }
        this.state.scrollDiff.setValue(-this.accumulatedScroll / 4)

    }

    _renderFeedToggle = () => {
        const style= {
            container: {
                height: 40,
                flexDirection:'row',
                alignItems:'center',
                justifyContent:'space-around'
            },
            label: { width: width / 2},
            textWrapper: {height: 38, justifyContent: 'center', alignItems: 'center'},
            text: {fontSize: 18 * RESP_RATIO, textAlign: 'center' },
            underline: { height: 2, width: width / 2 }
        }

        const labels = [TOGGLE_BEST_LABEL, TOGGLE_TOP_10];

        return (
          <View style={style.container}>
              {
                  labels.map(label =>
                    <TouchableOpacity onPress={this.toggleFeed.bind(this, label)} key={label}>
                        <View style={style.label}>
                            <View style={style.textWrapper}>
                                <Text style={style.text}> {label} </Text>
                            </View>
                            <View style={[style.underline, {
                                backgroundColor: this.state.selectedTab === label? Colors.purple: 'white'
                            }]}/>
                        </View>
                    </TouchableOpacity>)
              }
          </View>
        )
    }

    toggleFeed = (tabName) => {
        const {clapitAccountData, unauthenticatedAction} = this.props;

        if (tabName === TOGGLE_TOP_10){
            if (_.isEmpty(clapitAccountData)) {
                unauthenticatedAction && unauthenticatedAction();
                return;
            }
        }
        if (tabName !== this.state.selectedTab) {
            this.setState({ selectedTab: tabName, showLoading: true })
            if(this.refs.feedView) this.refs.feedView.getScrollResponder().scrollTo({y: 0})
            const reload = tabName === TOGGLE_TOP_10 ? this._refreshTop10Singit : this._refreshFeed
            reload()
        }
    }

    _onStartSearch(text) {
        let searchTerm = text.trim();
        if (searchTerm.length > 0) {
            // perform search
            this.setState({
                searchTerm: searchTerm
            })
            this.props.searchFriends(text, 0)
            this.props.navigator.push({ name: 'SearchResults', trackingSource: 'Best', searchTerm, unauthenticatedAction: this.props.unauthenticatedAction})
            Mixpanel.trackWithProperties("Search Friend", { trackingSource: 'Best', text })
        }
    }

    componentWillMount() {
        const { navigationState } = this.props;
        console.log('will mount', navigationState)
        this.setState({route: navigationState.routes[navigationState.routes.length-1] })
    }

    componentDidMount() {
      if (this.props.isMainFeed){
        this.props.fetchFeedData(0, false, '');
      } else {
        this.props.searchFriends(this.props.hashtag, 0, false, 10);
      }
    }

    componentWillReceiveProps(nextProps) {
        const routes = nextProps.navigationState.routes;
        const currentRoute = routes[routes.length-1];
        
        const oldVisible = this.state.visible
        const newVisible = this.state.route.key === currentRoute.key
        this.setState({ visible: newVisible })
        // console.log('feed', this.state.route, routes, nextProps.visibleTab, newVisible, oldVisible)
        this.updateVisibility = newVisible !== oldVisible

        // go through and see which item (if any) has a changed clapCount -- and update that one
        this.itemsChanged = {}

        let { itemsById:oldItemsById } = this.props
        let { itemsById, friends } = nextProps

        for (var itemId in oldItemsById) {
            if (oldItemsById[itemId] && itemsById[itemId]) {
                let { clapCount:oldClapCount } = oldItemsById[itemId]
                let { clapCount } = itemsById[itemId]

                if (oldClapCount != clapCount || nextProps.visibleTab !== this.props.visibleTab ) {                    
                    this.itemsChanged[itemId] = true
                }
            }
        }

        // ensure can load more
        let { page:oldPage, items:oldItems,  friends:oldFriends, fetchingData:wasFetchingData } = this.props
        let { page, items = [], hashtag, fetchingData, navigationState } = nextProps

        let datasourceItems = items

        if (page > oldPage && items.length == oldItems.length) { // done for now
            this.setState({ canLoadNextPage: false })

            // re-enable after 10 seconds
            setTimeout(()=> {
                this.setState({ canLoadNextPage: true })
            }, 10 * 1000)
        }

        if( !fetchingData && wasFetchingData ||
            !friends.fetchingRemoteData && oldFriends.fetchingRemoteData) {
            this.setState({ showLoading: false })
        }

        let { searchTerm, results  } = friends
        if (hashtag && searchTerm === hashtag.slice(1) && this.state.selectedTab === TOGGLE_TOP_10){
            //filter out featured posts and clapit account posts. show only top 10
            datasourceItems = results.filter(post => !post.featured && post.Account.id !== 3).slice(0, 10);
            
            if(datasourceItems.length === 0){
                datasourceItems = [{value: 'empty'}]
            }
        }
        // console.log('new props', nextProps);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(datasourceItems)
        })

        
    }

    _rowHasChanged(r1, r2) {
        // console.log('row changed', r1, r2, this.updateVisibility)
        return r1 != r2 || this.itemsChanged[r1] || this.updateVisibility
    }

    checkVisible = (isVisible, item) => {
        if(isVisible){
            //seen this post
            // const { item } = this.props;
            // console.log('seen post', item)
            AsyncStorage.setItem('@BestFeed:' + item.id, Date.now().toString())

        }
    }

    _renderRow(itemId, section, row) {
        const { width } = Dimensions.get('window')
        const { clapitAccountData } = this.props

        if(itemId.value === 'empty') {
            return (
                <Text style={{padding: 10}}>
                    Open call started, but we don't have top 10 yet...
                </Text>
            )
        }

        //itemId is the item itself for search friends
        const item = (itemId.id) ? itemId : this.props.itemsById[itemId];
        
        let { navigator, unauthenticatedAction, searchFriends, visibleTab} = this.props

        return (
            <FeedItem
                key={item.id}
                item={item}
                recentPosts={item.Account.Posts}
                rank={parseInt(row)+1}
                clapitAccountData={clapitAccountData}
                style={{...styles.feedItem}}
                width={width}
                navigator={navigator}
                searchFriends={searchFriends}
                onProfilePressed={this._onProfilePressed.bind(this, item)}
                onMainImagePressed={this._onMainImagePressed}
                unauthenticatedAction={unauthenticatedAction}
                checkVisible={this.checkVisible}
                visibleParent={visibleTab && this.state.visible}
                trackingSource="Feed"
            />
        )
    }


    _onProfilePressed(item) {
        let { navigator } = this.props
        let {
            Account: {
                Media,
                CoverMedia,
                id: accountId,
                username
            }
        } = item
        let image = (Media) ? Media.mediumURL : ' '
        let coverImage = (CoverMedia) ? CoverMedia.mediumURL : ' '
        navigator.push({ name: 'ProfileContainer', image, coverImage, accountId, username })
    }

    _onReactionPressed(item) {
        let { navigator } = this.props
        navigator.push({ name: 'ReactionList', post: item })
    }

    _onMainImagePressed = (item) => {        
        let { navigator, clapitAccountData, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post: item })
    }

    _back() {
        this.props.navigator.pop()
    }

    _showInfoModal = () => {
        this.setState({showInfoModal:true})
    }

    _refreshFeed = () => {
        this.props.reloadFeedData(this.props.hashtag)
    }

    _refreshTop10Singit = () => {
        this.props.searchFriends(this.props.hashtag, 0, false, 10);
    }

    _navigateToOpenCalls = () => {
        const {navigator, clapitAccountData, fetchNetwork, fetchFeedData, searchFriends, reloadFeedData, preferences, setPreferences, unauthenticatedAction, visibleTab} = this.props

        navigator.push({name: 'OpenCalls', clapitAccountData, fetchNetwork, fetchFeedData, searchFriends, reloadFeedData, preferences, setPreferences, unauthenticatedAction, visibleTab });
    }

    render() {
        const { showLoading } = this.state
        const { infoText, isMainFeed } = this.props
        const refreshControl = <RefreshControl onRefresh={this._refreshFeed} refreshing={this.props.reloading && this.props.fetchingData}/>
        let leftButton = <BackButton onPress={this._back.bind(this)}/>
        let rightButton = (infoText) ? <TouchableOpacity onPress={this._showInfoModal}>
                <Image source={Images.ico_info} style={{width: 40, height: 40, marginRight:10}}/>
            </TouchableOpacity> : <View/>
        let title = <NavTitle>{this.props.title || this.props.hashtag}</NavTitle>
        
        return (
            <View style={styles.container}>
              {(isMainFeed)?
                <View>
                    <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: 'white'}}>
                        <StatusBar barStyle="default"/>
                    </View>
                    <Animated.View
                      style={{...styles.header, overflow: 'hidden', height: this.state.scrollDiff}}>
                        <Animated.Image
                          source={Images.clapit_top_bar}
                          style={{
                            ...styles.headerImage,
                            height: this.state.scrollDiff,
                            opacity: this.state.scrollDiff.interpolate({inputRange: [0, TOPBAR_HEIGHT], outputRange: [0, 1], extrapolate: 'clamp'})
                          }}/>
                        <TouchableOpacity style={styles.openCallButton} onPress={this._navigateToOpenCalls}>
                            <Animated.Image
                              source={Images.open_calls_logo}
                              style={{
                                ...styles.openCallImage,
                                height: this.state.scrollDiff,
                                opacity: this.state.scrollDiff.interpolate({inputRange: [0, TOPBAR_HEIGHT], outputRange: [0, 1], extrapolate: 'clamp'})
                              }}/>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
              :
                  <View>
                      <NavigationBar leftButton={leftButton} rightButton={rightButton} title={title} style={styles.navBar}/>
                      { this._renderFeedToggle() }
                  </View>
              }

                                    
                <ListView                    
                    removeClippedSubviews={false}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    refreshControl={refreshControl}
                    style={styles.list}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: this.state.scroll}}}],
                        {listener: this._onScroll.bind(this)}
                    )}
                    scrollEventThrottle={5}
                    enableEmptySections={true}
                    premptiveLoading={5}
                    stickyHeaderIndices={[]}
                    initialListSize={3}
                    pageSize={3}
                    onEndReachedThreshold={50}
                    scrollRenderAheadDistance={2000}
                    ref="feedView">
                </ListView>
 
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
        backgroundColor: 'white'
    },
    feedItem: {
        flex: 1,
        alignSelf: 'stretch',
        marginBottom: 20
    },
    header: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerImage: {
        resizeMode: 'contain',
        width:240
    },
    openCallImage: {
        resizeMode: 'contain',
        width:70,
        position: 'absolute',
        right: 10
    },
    openCallButton: {
        width: 100,
        position: 'absolute',
        right: 10
    }
}
