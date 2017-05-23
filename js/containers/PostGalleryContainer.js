import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PostGallery from '../components/Post/PostGallery'
import * as PostActions from '../actions/post'

function stateToProps(state) {
    let { post } = state

    return { post }
}

function dispatchToProps(dispatch) {
    let actions = _.extend({}, PostActions )

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(PostGallery)
