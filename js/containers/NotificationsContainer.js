import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Notifications from '../components/Notifications'
import * as notificationsActions from '../actions/notifications'
import { follow, unfollow } from '../actions/network'

function stateToProps(state) {
    let { notifications, newNotifications, clapitAccountData } = state

    // mark items as highlighted
    let { items = {} } = notifications
    let { itemIds = [] } = newNotifications
    let currentUserFriendship = state.friendship;

    if(items.length) {
        items = items.slice()

        items = items.map(item => {
            if (itemIds.indexOf(item.id) > -1) {
                return { ...item, isHighlighted: true }
            }
            return item
        })
    }

    return { items, notifications, newNotifications, clapitAccountData, currentUserFriendship }
}

function dispatchToProps(dispatch) {
    let actions = Object.assign({}, { ...notificationsActions, follow, unfollow })

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Notifications)
