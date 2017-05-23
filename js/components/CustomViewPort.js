import React, { Component } from 'react';
import InViewPort from 'react-native-inviewport'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class CustomViewPort extends React.Component {
    
    componentWillMount() {
        const { navigationState } = this.props;
        console.log('viewport will mount', navigationState)
        this.setState({ route: navigationState.routes[navigationState.routes.length - 1] })
    }

    componentWillReceiveProps(nextProps) {
        const routes = nextProps.navigationState.routes;
        const currentRoute = routes[routes.length - 1];
        const oldVisible = this.state.visible
        const newVisible = this.state.route.key === currentRoute.key
        this.setState({ visible: newVisible })
    }

    _onChange = (visible) => {
        const {onChange} = this.props
        if(onChange) {
            onChange(visible && this.state.visible)
        }
    } 

    render() {
        const { onChange, ...otherProps } = this.props
        // console.log('props', onChange, otherProps)
        return (
            <InViewPort onChange={this._onChange} {...this.otherProps}>
                {this.props.children}
            </InViewPort>
        );
    }

}

function stateToProps(state) {
    let { navigationState } = state

    return { navigationState }
}

// function dispatchToProps(dispatch) {
//     let actions = _.extend({}, networkActions, {fetchContactsToFollow, fetchContactsToInvite, loadDeviceContacts, searchFriends})

//     return bindActionCreators(actions, dispatch)
// }

export default connect(stateToProps)(CustomViewPort)