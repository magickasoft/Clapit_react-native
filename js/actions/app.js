import { reloadFeedData } from './feed'
import { fetchProfilePopularPosts, fetchProfileRecentPosts, reloadProfileData } from './profile'
import { reloadFriendsData, reloadRecentData } from './friends'
import { reloadNotificationsData } from './notifications'

export function reloadUserPosts(userId) {
  return dispatch => {
    reloadFeedData()(dispatch)
    fetchProfilePopularPosts(userId)(dispatch)
    fetchProfileRecentPosts(userId)(dispatch)
    reloadFriendsData(userId)(dispatch)
    reloadRecentData(userId)(dispatch)
    reloadNotificationsData(userId)(dispatch)
    reloadProfileData(userId)(dispatch)
  }
}
