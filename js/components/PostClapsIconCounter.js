import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import React, { Component } from 'react';
import  {
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    NativeModules
} from 'react-native'

import * as clapActions from '../actions/claps'
import ClapitButtonContainer from '../containers/ClapitButtonContainer'
const { RNMixpanel:Mixpanel } = NativeModules

/**
 * Component for Showing Clap icon and Clap count (using Post data)
 *
 * Receiving via Component Properties:
 * 1) navigator
 * 2) post
 *
 * Using REDUX for state management
 *
 */
export class PostClapsIconCounter extends React.Component {

    constructor(props) {
        super(props)
    }

    _getClapsCount() {
        let { post } = this.props

        return post.clapCount || 0;
    }

    _onClapsCounterPressed() {
        let { navigator, post, trackingSource, appState : { clapitAccountData }, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        Mixpanel.trackWithProperties("Clap Counter Button", { trackingSource });
        navigator.push({ name: 'Claps', resourceId: post.id })
    }

    _isClapped() {
        let { post, appState: { claps: { myClaps }} } = this.props

        return myClaps.indexOf(post.id) > -1
    }

    _onClapsIconPressed() {
        let { post, trackingSource, appState : { clapitAccountData }, unauthenticatedAction, onClap } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }

        onClap && onClap();
        Mixpanel.trackWithProperties("Clap Button", { trackingSource});
        // if the post is not clapped
        if (!this._isClapped()) {
            post.clapCount += 1
            this.setState({})
        }
    }

    render() {
        let { post, unauthenticatedAction } = this.props

        return (
            <View style={styles.clapsCount}>
                <View style={styles.clapButton}>
                    <ClapitButtonContainer
                        postType={'friends-data'}
                        postItem={post}
                        style={{width: 40, height: 40, borderRadius: 20}}
                        pressInScale={1.5}
                        showClapCount={false}
                        unauthenticatedAction={unauthenticatedAction}
                        onClap={() => {this._onClapsIconPressed()}}
                    />
                </View>
                <TouchableOpacity style={styles.counterButton} onPress={this._onClapsCounterPressed.bind(this)}>
                    <Text style={styles.clapsCountText}>{this._getClapsCount()}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = {
    clapsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8
    },
    clapsCountText: {
        color: '#B385FF',
        fontSize: 14,
        marginLeft: 10,
        fontWeight: '500',
        backgroundColor: 'transparent'
    },
    clapImage: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    counterButton: {
        minWidth: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    }
}

// REDUX START
function stateToProps(appState) {
    // have access to full app state
    return { appState }
}

function dispatchToProps(dispatch) {
    let actions = Object.assign({}, clapActions)

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(PostClapsIconCounter)

// REDUX STOP


