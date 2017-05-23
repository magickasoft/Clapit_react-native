import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import IntroNav from '../components/IntroNav'
import * as FacebookActions from '../actions/facebook'
import * as TwitterActions from '../actions/twitter'
import * as InstagramActions from '../actions/instagram'
import * as EmailActions from '../actions/emailAuth'
import * as ProfileActions from '../actions/profile'
import { clearApiError } from '../actions/clapit'
import _ from 'lodash'

function stateToProps(state) {
  let { loggingIn, apiError, clapitAccountData, emailLoginError } = state

  return { loggingIn, apiError, clapitAccountData, emailLoginError }
}

function dispatchToProps(dispatch) {
  let actions = _.extend({}, FacebookActions, TwitterActions, InstagramActions, ProfileActions, EmailActions, { clearApiError })

  return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(IntroNav)
