import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as feedItemActions from '../actions/feedItem'

import React, { Component } from 'react';
import  {
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    NativeModules
} from 'react-native'

import { uploadToCloudinary, createMedia } from '../actions/api'
import Camera from 'react-native-camera'

import {Images} from '../themes'

let { RNMixpanel:Mixpanel } = NativeModules

/**
 * Component for Showing Comment icon and Comment count (using Post data)
 *
 * Receiving via Component Properties:
 * 1) navigator
 * 2) post
 *
 * Using REDUX for state management
 *
 */
export class PostCommentsIconCounter extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            showLoading: false,
            cameraAuthorized: false
        }
    }

    componentWillReceiveProps(nextProps) {

        this.setState({ cameraAuthorized: false })
    }

    _getCommentCount() {
        let { post } = this.props

        return post.commentCount || 0;
    }

    _onCommentCounterPressed() {        
        let { navigator, post, appState : { clapitAccountData }, trackingSource, unauthenticatedAction, disableCounterPress } = this.props        
        if(disableCounterPress) return

        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        Mixpanel.trackWithProperties('Comment Counter Button', { trackingSource })
        navigator.push({ name: 'PostDetails', post, clapitAccountData })
    }

    _onCommentIconPressed() {
        let { navigator, post, appState : { clapitAccountData }, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }
        navigator.push({ name: 'PostDetails', post, clapitAccountData })
    }

    _imageSelected(image, video, textComment) {
        let { post } = this.props
        let { createItemReaction } = this.props

        const path = image.indexOf('file://') === 0 ? image.substring('file://'.length) : image
        // upload!
        this.setState({
            uploadImagePath: path,
            uploadInProgress: true,
            showLoading: true
        })

        uploadToCloudinary('image', `file://${path}`, (err, res) => {
            if (err || res.status != 200) {
                Alert.alert(
                    'Upload', 'We were unable to upload your image just now.  Would you like to try again?',
                    [
                        {
                            text: 'No',
                            onPress: () => {
                                this.setState({ uploadInProgress: false, uploadImageUrl: null })
                            },
                            style: 'cancel'
                        },
                        {
                            text: 'Yes',
                            onPress: () => {
                                this._imageSelected(path)
                            }
                        }
                    ]
                )
                return
            }

            let { data } = res
            data = JSON.parse(data)
            let { url } = data

            this.setState({
                uploadInProgress: false,
                uploadedImageUrl: url
            })

            if (url) { // new image
                createMedia(url)
                    .then(data => {
                        if (data.error) { // TODO
                            this.setState({ saveWhenDoneUploading: false })
                            return;
                        }

                        ({ id: mediaId } = data)

                        this.setState({ mediaId })
                        createItemReaction(post.id, post.Account.id, mediaId, textComment || '')
                        Mixpanel.track("Selfie Comment");
                    })
                    .then(() => {
                        post.commentCount += 1
                        this.setState({ showLoading: false })
                    })
            } else {
                createItemReaction(post.id, post.Account.id, null, textComment || '')
                    .then(() => {
                        this.setState({ showLoading: false })
                    })
                Mixpanel.trackWithProperties("Selfie Comment", { note: 'existing image'});
            }

        })
    }

    _onTakeReactionPhoto() {
        let { cameraAuthorized } = this.state
        let { navigator, trackingSource, appState : { clapitAccountData }, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }

        Mixpanel.trackWithProperties('Selfie Reaction Button', {trackingSource})

        navigator.push({
            name: 'ClapitCamera',
            photoSelect: true,
            photoOnlySelect: true,
            cameraType: Camera.constants.Type.front,
            displayGifCamSwitch: true,
            displayComment: true,
            displaySelfieOverlay: true,
            callback: this._imageSelected.bind(this),
            cameraAuthorized,
            trackingSource
        })
    }

    render() {
        let { showLoading } = this.state

        return (
            <View style={styles.commentsCount}>

                <TouchableWithoutFeedback onPress={this._onTakeReactionPhoto.bind(this)}>
                    <Image source={Images.reaction_smiley} style={styles.commentCountImage}/>
                </TouchableWithoutFeedback>

                <TouchableOpacity style={styles.counterButton} onPress={this._onCommentCounterPressed.bind(this)}>
                    <View><Text style={styles.commentsCountText}>{this._getCommentCount()}</Text></View>
                </TouchableOpacity>

            </View>
        )
    }
}

const styles = {
    commentsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8
    },
    commentsCountText: {
        color: '#B385FF',
        fontSize: 14,
        marginLeft: 10,
        marginRight: 8,
        fontWeight: '500'
    },
    commentCountImage: {
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
    let actions = Object.assign({}, feedItemActions)

    return bindActionCreators(actions, dispatch)
}

export default connect(stateToProps, dispatchToProps)(PostCommentsIconCounter)

// REDUX STOP


