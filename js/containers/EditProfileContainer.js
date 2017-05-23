import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import EditProfile from '../components/EditProfile'
import { clapitSaveProfile, clearApiError } from '../actions/clapit'
import { fetchProfileData, fetchProfileRecentPosts, fetchProfilePopularPosts } from '../actions/profile'
import {fetchContactsToFollow, loadDeviceContacts} from '../actions/contacts'
import _ from 'lodash'

function stateToProps(state) {
  let { apiError, clapitAccountData, contacts } = state
  return { apiError, clapitAccountData, contacts }
}

function dispatchToProps(dispatch) {
  let actions = _.extend({}, { clapitSaveProfile, clearApiError, fetchProfileData, fetchProfileRecentPosts,
    fetchProfilePopularPosts, fetchContactsToFollow, loadDeviceContacts })

  return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(EditProfile)
