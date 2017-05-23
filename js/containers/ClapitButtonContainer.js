import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ClapitButton from '../components/ClapitButton'
import { clapPost, sharePost } from '../actions/claps'

function stateToProps(state) {

    let { clapitAccountData, claps } = state

    return { clapitAccountData, ...claps }
}

function dispatchToProps(dispatch) {
    
    let actions = Object.assign({}, { clapPost, sharePost })

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(ClapitButton)
