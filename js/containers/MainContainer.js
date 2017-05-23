import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import MainTabBar from '../components/MainTabBar'
import * as feedActions from '../actions/feed'
import * as friendsActions from '../actions/friends'
import * as feedItemActions from '../actions/feedItem'
import * as profileActions from '../actions/profile'
import * as notificationsActions from '../actions/notifications'
import * as tagsActions from '../actions/tags'
import * as friendshipActions from '../actions/friendship'
import * as networkActions from '../actions/network'
import { setPreferences} from '../actions/preferences'
import { clapitLogout, verifyDeviceToken } from '../actions/clapit'
import {fileUploadReset } from '../actions/fileUpload'

function stateToProps(state) {
    //TODO
    return state
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, feedActions, friendsActions, feedItemActions, profileActions,
      networkActions , friendshipActions, notificationsActions, tagsActions, { clapitLogout, verifyDeviceToken, fileUploadReset, setPreferences })

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(MainTabBar)
