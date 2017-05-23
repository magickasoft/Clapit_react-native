import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Profile from '../components/Profile'
import { fetchProfileData, fetchProfileRecentPosts, fetchProfilePopularPosts } from '../actions/profile'
import { clapitLogout } from '../actions/clapit'
import { follow, unfollow } from '../actions/network'

function stateToProps(state, ownProps) {
    let fetchingData = false  // For now
    let { accountId } = ownProps

    let profile = state.profiles[accountId]
    let recentPosts = state.recentPosts[accountId]
    let popularPosts = state.popularPosts[accountId]
    let currentUserFriendship = state.friendship;

    const { navigationState } = state

    return { clapitAccountData:state.clapitAccountData, profile, recentPosts, popularPosts, currentUserFriendship, navigationState }
}

function dispatchToProps(dispatch) {
    let actions = Object.assign({}, { clapitLogout, fetchProfileData, fetchProfileRecentPosts, fetchProfilePopularPosts, follow, unfollow })

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Profile)
