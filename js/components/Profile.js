import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    ListView,
    ScrollView,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
    ActionSheetIOS,
    NativeModules
} from 'react-native'

import {
    PROFILE_POSTS_RECENT,
    PROFILE_POSTS_POPULAR
} from '../constants/PostsTypes'
import {PROFILE_PHOTO, COVER_PHOTO} from '../constants/Constants'

const { RNMixpanel:Mixpanel } = NativeModules
import ProfileDetails from './Profile/ProfileDetails'
import ProfileItem from './Profile/ProfileItem'

import SimpleTabs from './SimpleTabs'
import { distanceFromEnd } from '../lib/scrollUtils'
import _ from 'lodash'
import SGListView from 'react-native-sglistview'
import {respPixels, RESP_RATIO} from '../lib/responsiveUtils'
import ClapitLoading from './ClapitLoading'
import {Colors, Images} from '../themes'
import Video from './VideoPatchIos10'

let { width, height } = Dimensions.get('window')

export default class Profile extends React.Component {
    constructor(props) {
        super(props)

        let { accountId, recentPosts = { items: [], page: 0 }, currentUserFriendship } = props

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        })

        const userFollowing = props.currentUserFriendship.items.indexOf(accountId)
        let following = (userFollowing > -1 ? true : false)

        this.state = {
            dataSource: ds.cloneWithRows(recentPosts.items),
            reloading: false,
            following,
            tabSelected: PROFILE_POSTS_RECENT
        }
    }

    componentWillMount() {
        const { navigationState } = this.props;
        console.log('will mount', navigationState)
        this.setState({route: navigationState.routes[navigationState.routes.length-1] })
    }

    componentDidMount() {
        let {
            profile,
            recentPosts,
            popularPosts,
            accountId,
            fetchProfileData,
            fetchProfileRecentPosts,
            fetchProfilePopularPosts
        } = this.props

        if (!profile) {
            fetchProfileData(accountId)
        }

        if (!recentPosts) {
            fetchProfileRecentPosts(accountId)
        }

        if (!popularPosts) {
            fetchProfilePopularPosts(accountId)
        }
    }

    componentWillReceiveProps(nextProps) {
        let {
          accountId,
          clapitAccountData,
          profile,
          recentPosts = {},
          popularPosts = {},
          fetchProfileData,
          fetchProfileRecentPosts,
          fetchProfilePopularPosts } = nextProps
        let { reloading } = this.state

        const routes = nextProps.navigationState.routes;
        const currentRoute = routes[routes.length-1];        
        const oldVisible = this.state.visible
        const newVisible = this.state.route.key === currentRoute.key
        this.setState({ visible: newVisible })

        if (_.isEmpty(profile)) {
            fetchProfileData(accountId)
        }

        if (_.isEmpty(recentPosts)) {
            fetchProfileRecentPosts(accountId)
        }

        if (_.isEmpty(popularPosts)) {
            fetchProfilePopularPosts(accountId)
        }
        const ownPost = accountId === clapitAccountData.id

        this.setState({ ownPost})

        if (profile && reloading) {
            this.setState({ reloading: false })
        }

        // check to see if loaded next page
        // TODO: refactor into one method
        if (!_.isEmpty(recentPosts)) {
            let { page } = recentPosts

            if (page == 0 || (this.props.recentPosts && page > this.props.recentPosts.page)) {
                this.loadingNextPage = false
            }
        }
        if (!_.isEmpty(popularPosts)) {
            let { page } = popularPosts

            if (page == 0 || (this.props.popularPosts && page > this.props.popularPosts.page)) {
                this.loadingNextPage = false
            }
        }

        this._updateDataSource(this.state.tabSelected, recentPosts, popularPosts)
    }

    // called when componentWillReceiveProps (like additional pages), and when
    // user changes tabs
    _updateDataSource(tabSelected, recentPosts, popularPosts) {
        let items = tabSelected == PROFILE_POSTS_RECENT && recentPosts && recentPosts.items ? recentPosts.items
          : popularPosts && popularPosts.items ? popularPosts.items
          : []

        this.setState({
            tabSelected,
            dataSource: this.state.dataSource.cloneWithRows(items)
        })
    }

    _onFollowersPressed() {
        let { profile, navigator, trackingSource } = this.props
        if (!profile || !profile.id){
            return console.warn('profile not defined');
        }
        navigator.push({ name: 'Followers', resourceId: profile.id })
        Mixpanel.trackWithProperties("Followers Button on Profile", { trackingSource });
    }

    _onFollowingPressed() {
        let { profile, navigator, trackingSource } = this.props
        if (!profile || !profile.id){
            return console.warn('profile not defined');
        }
        navigator.push({ name: 'Following', resourceId: profile.id })
        Mixpanel.trackWithProperties("Following Button on Profile", { trackingSource });
    }

    _onSettingsPressed() {
        let { navigator } = this.props
        navigator.push({ name: 'Settings' })
    }

    _onScroll(e) {
        // note here using this.loadingNextPage as setState has latency
        if (distanceFromEnd(e) < 200 && !this.loadingNextPage) {

            let { recentPosts, popularPosts } = this.props
            let { tabSelected } = this.state

            if (tabSelected == PROFILE_POSTS_RECENT && recentPosts) {
                let { items, page } = recentPosts
                this._loadNextPage('recent', items, page + 1)
            } else if (tabSelected == PROFILE_POSTS_POPULAR && popularPosts) {
                let { items, page } = popularPosts
                this._loadNextPage('popular', items, page + 1)
            }
        }
    }

    _loadNextPage(type, items, nextPage) {
        if (items && items.length % 20 == 0) { // potentially a next page
            let { accountId, fetchProfileRecentPosts, fetchProfilePopularPosts } = this.props

            this.loadingNextPage = true

            if (type == 'recent') {
                fetchProfileRecentPosts(accountId, nextPage)
            } else if (type == 'popular') {
                fetchProfilePopularPosts(accountId, nextPage)
            }
        }
    }

    _renderRow(item, otherParams, index) {
        let { tabSelected } = this.state
        let { navigator } = this.props
        const width = Dimensions.get('window').width
        let itemWidth = (width / 2) - (styles.detailsContainer.marginLeft + styles.detailsContainer.marginRight) - 0.5
        let itemHeight = 0.75 * itemWidth - 1

        const firstPopularPost = index == 0 && tabSelected == PROFILE_POSTS_POPULAR
        if (firstPopularPost) {
            itemWidth = width - (styles.detailsContainer.marginLeft + styles.detailsContainer.marginRight) * 2
            itemHeight = 200
        }

        let medal = tabSelected == PROFILE_POSTS_POPULAR ? index : -1

        return (
            <ProfileItem
                key={item.id}
                item={item}
                style={{...styles.profileItem, width: itemWidth, height: itemHeight}}
                medal={medal}
                isOddItem={index % 2 === 0}
                onPress={() => {
                    let { clapitAccountData, unauthenticatedAction } = this.props
                    if (_.isEmpty(clapitAccountData)) {
                        unauthenticatedAction && unauthenticatedAction();
                        return;
                    }
                    navigator.push({ name: 'PostDetails', post: item, refreshProfile: this._refreshProfile })
                }}
            />
        )
    }

    _refreshProfile = () => {
        this.setState({ reloading: true })
        let { accountId, fetchProfileData, fetchProfileRecentPosts, fetchProfilePopularPosts } = this.props

        fetchProfileData(accountId)
        fetchProfileRecentPosts(accountId)
        fetchProfilePopularPosts(accountId)
    }

    _onChangeTab(tabName) {
        let { recentPosts, popularPosts, trackingSource } = this.props

        this._updateDataSource(tabName, recentPosts, popularPosts)
        Mixpanel.trackWithProperties("Change Tab on Profile", { name: tabName, trackingSource});
    }

    _editImage(tabName) {
        let { navigator } = this.props
        navigator.push({ name: 'EditProfileContainer', tabName })
    }

    _onClosePress() {
        let { navigator } = this.props
        navigator.pop()
    }

    _onFollowPress() {
        const { clapitAccountData, profile: { id:profileUserId }, trackingSource } = this.props
        if (this.state.following) {
            this.props.unfollow(profileUserId, clapitAccountData.id)
            this.setState({ following: false })
        } else {
            this.props.follow(profileUserId, clapitAccountData.id)
            this.setState({ following: true })
        }
        Mixpanel.trackWithProperties("Toggle Follow", { trackingSource, following: !this.state.following});
    }

    render() {
        let {
            image,
            coverImage,
            username,
            profile = {},
            showCloseButton = false,
            showSettingsButton,
            isMyProfile
        } = this.props

        let { tabSelected, reloading } = this.state
        let coverIsVideo = (! /^.*(gif|jpg|jpeg|png)$/.test(coverImage))

        const refreshControl = <RefreshControl onRefresh={this._refreshProfile} refreshing={reloading}/>
        
        const coverMedia = coverIsVideo 
        ? <Video resizeMode="cover"
                source={{uri: coverImage}}
                rate={1.0}
                muted={true}
                repeat={true}
                visibleParent={this.state.visible}
                ref="video"
                style={{width , height: 0.6 * width}} />
        : <Image source={{uri: coverImage}} style={styles.coverImage}/>

        return (
            <View style={{flex:1}}>
                <ScrollView
                    style={styles.container}
                    scrollEventThrottle={50}
                    onScroll={this._onScroll.bind(this)}
                    refreshControl={refreshControl}>
                    {(coverImage && coverImage.trim()) ?
                      (isMyProfile) ?
                        <TouchableOpacity
                          style={styles.coverImage}
                          onPress={this._editImage.bind(this, COVER_PHOTO)}>
                            {coverMedia}
                        </TouchableOpacity>
                        : coverMedia
                      :
                      (isMyProfile) ?
                          <TouchableOpacity
                            style={styles.coverImage}
                             onPress={this._editImage.bind(this, COVER_PHOTO)}>
                            <Text style={{color: Colors.purple}}>Upload a Cover picture or video</Text>
                          </TouchableOpacity>
                        :
                        <Image source={Images.default_cover_image} style={styles.coverImage}/>
                    }
                    <View style={styles.detailsContainer}>
                        <ProfileDetails
                            profile={profile}
                            username={username}
                            showSettingsButton={showSettingsButton}
                            clapitAccountData={this.props.clapitAccountData}
                            isMyProfile={this.props.isMyProfile}
                            onFollowingPressed={() => this._onFollowingPressed()}
                            onFollowersPressed={() => this._onFollowersPressed()}
                            onSettingsPressed={() => this._onSettingsPressed()}
                            onPostPressed={() => this._onPostPressed()}/>
                        <SimpleTabs
                            style={styles.tabs} selected={tabSelected}
                            underlineColor='#B289FC' onSelect={el => this._onChangeTab(el.props.name)}>
                            <Text style={styles.tabItem} selectedStyle={styles.tabSelected} name={PROFILE_POSTS_RECENT}>Recent</Text>
                            <Text style={styles.tabItem} selectedStyle={styles.tabSelected} name={PROFILE_POSTS_POPULAR}>Popular</Text>
                        </SimpleTabs>
                        <SGListView
                            style={styles.grid}
                            stickyHeaderIndices={[]}
                            initialListSize={20}
                            pageSize={20}
                            onEndReachedThreshold={50}
                            contentContainerStyle={styles.gridContent}
                            removeClippedSubviews={false}
                            dataSource={this.state.dataSource}
                            renderRow={this._renderRow.bind(this)}
                            enableEmptySections={true}
                            scrollRenderAheadDistance={2000}
                            scrollEnabled={false}>
                        </SGListView>
                    </View>
                    {(isMyProfile) ?
                        <TouchableOpacity
                          style={styles.profileImageContainer}
                          onPress={this._editImage.bind(this, PROFILE_PHOTO)}>
                            <Image source={{uri: image}} style={styles.profileImage}/>
                        </TouchableOpacity>
                        :
                        <Image source={{uri: image}} style={[styles.profileImage, styles.profileImageContainer]}/>
                    }

                </ScrollView>
                <View style={[styles.topBar, {width}]}>
                    { showCloseButton ?
                        (
                            <TouchableOpacity style={styles.closeButton} onPress={this._onClosePress.bind(this)}>
                                <Image source={require('image!btn_close')}/>
                            </TouchableOpacity>
                        )
                        :
                        null
                    }
                    <View style={styles.spacer}></View>
                    { !this.state.ownPost ?
                        (
                            <TouchableOpacity style={styles.followButton} onPress={this._onFollowPress.bind(this)}>
                                <Image source={this.state.following ? require('image!btn_following') : require('image!btn_follow') }/>
                            </TouchableOpacity>
                        )
                        :
                        null
                    }
                </View>
                { this.props.profile && this.props.profile.isLoading ? <ClapitLoading skipLayout={true}/> : null }
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1
    },
    topBar: {
        flexDirection: 'row',
        flex: 1,
        height: 38,
        width: (width - 10),
        position: 'absolute',
        top: 20,
        left: 0
    },
    closeButton: {
        paddingLeft: 10,
        paddingTop: 5,
        flex: 0.2
    },
    spacer: {
        flex: 0.2
    },
    followButton: {
        paddingRight: 0,
        paddingTop: 5,
        flex: 0.6,
        position: 'absolute',
        right: 10
    },
    detailsContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFF',
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0
    },
    tabs: {
        height: 30,
        marginLeft: 0,
        marginRight: 0
    },
    grid: {
        marginBottom: 50
    },
    tabItem: {
        // fontWeight: 'bold',
        fontSize: 16 * RESP_RATIO,
        height: 25,
        color: '#000'
    },
    tabSelected: {
        // fontWeight: 'bold',
        // fontSize: 18 * RESP_RATIO,
        // color: '#B289FC',
    },
    gridContent: {
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        marginTop: 5
    },
    profileItem: {

    },
    profileImageContainer: {
        position: 'absolute',
        width: 0.34 * width,
        height: 0.34 * width,
        right: 15,
        top: 0.3 * width
    },
    profileImage: {
        width: 0.34 * width,
        height: 0.34 * width,
        borderRadius: 0.17 * width
    },
    coverImage: {
        backgroundColor:'lightgray',
        width: width,
        height: 0.6 * width,
        alignItems:'center',
        justifyContent: 'center'
    }
}
