import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Settings from '../components/Settings'
import * as clapitActions from '../actions/clapit'
import * as twitterActions from '../actions/twitter'
import * as facebookActions from '../actions/facebook'
import * as instagramActions from '../actions/instagram'
import * as emailAuth from '../actions/emailAuth'

function stateToProps(state) {
  let { settings, clapitAccountData, facebookLoggingIn } = state

  let hasFacebook = false, hasTwitter = false

  if(!_.isEmpty(clapitAccountData)) {
    let { facebookId, twitterId, instagramId } = clapitAccountData

    hasFacebook = !_.isEmpty(facebookId)
    hasTwitter = !_.isEmpty(twitterId)
    hasInstagram = !_.isEmpty(instagramId)
  }

  return { settings, clapitAccountData, hasFacebook, hasTwitter, hasInstagram, facebookLoggingIn }
}

function dispatchToProps(dispatch) {
  let actions = _.extend({}, clapitActions, twitterActions, facebookActions, instagramActions, emailAuth )
  return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Settings)
