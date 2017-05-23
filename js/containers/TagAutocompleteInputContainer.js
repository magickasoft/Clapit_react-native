import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TagAutocompleteInput from '../components/TagAutocompleteInput'
import { fetchHashtags } from '../actions/tags'

function stateToProps(state) {

    let {tags } = state

    return { tags}
}

function dispatchToProps(dispatch) {
    
    let actions = Object.assign({}, { fetchHashtags })

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps, null, {withRef: true})(TagAutocompleteInput)
