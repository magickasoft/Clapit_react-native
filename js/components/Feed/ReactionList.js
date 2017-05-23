import React, { Component } from 'react';
import  {
    View,
    Text,
    ListView,
    TouchableOpacity,
    Image,
    Dimensions,
    Keyboard,
    DeviceEventEmitter,
    NativeModules
} from 'react-native'

import { uploadToCloudinary, createMedia } from '../../actions/api'

import ReactionItem from '../../containers/ReactionItemContainer'
import PostReaction from '../PostReaction'

let { RNMixpanel:Mixpanel } = NativeModules

let { width } = Dimensions.get('window')

export default class ReactionList extends React.Component {
    constructor(props) {
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        })

        let reactions = props.reactions.reactionsByPostId[props.post.id] || []

        this.state = {
            dataSource: ds.cloneWithRows(reactions),
            bottomMargin: 0,
            uploadImagePath: null,
            uploadedImageUrl: null,
            uploadInProgress: false,
            saveWhenDoneUploading: false,
            mediaId: null,
            cameraAuthorized: false
        }
    }

    componentWillReceiveProps(nextProps) {
        let reactions = nextProps.reactions.reactionsByPostId[this.props.post.id] || []

        if (nextProps.reactions.reactionCreated) {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(reactions),
                mediaId: null
            })
            this.props.fetchItemReactions(this.props.post.id)
        }
        else {
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(reactions)
            })
        }
    }

    componentDidMount() {
        this.props.fetchItemReactions(this.props.post.id)

        Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this))
        Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this))
    }

    componentWillUnmount() {
      DeviceEventEmitter.removeAllListeners()
    }

    _keyboardWillShow(e) {
        this.setState({
            bottomMargin: e.endCoordinates.height
        })
    }

    _keyboardWillHide(e) {
        this.setState({
            bottomMargin: 0
        })
    }

    _renderRow(reaction, section, row) {
        const { profile } = this.props
        return (
            <ReactionItem width={width} reaction={reaction} profile={profile}/>
        )
    }

    _onClosePress() {
        let { navigator } = this.props
        navigator.pop()
    }

    _imageSelected(path, video, textComment) {
        // upload!
        this.setState({
            uploadImagePath: path,
            uploadInProgress: true
        })

        uploadToCloudinary('image', `file://${path}`, (err, res) => {
            if (err || res.status != 200) {
                Alert.alert('Upload', 'We were unable to upload your image just now.  Would you like to try again?', [
                    {
                        text: 'No', onPress: () => {
                        this.setState({ uploadInProgress: false, uploadImageUrl: null })
                    }, style: 'cancel'
                    },
                    {
                        text: 'Yes', onPress: () => {
                        this._imageSelected(path);
                    }
                    }
                ])
                return
            }

            let { data } = res
            data = JSON.parse(data)
            let { url } = data

            this.setState({
                uploadInProgress: false,
                uploadedImageUrl: url
            })
            this._onPostReaction.bind(this)(textComment || '', url);
        })
    }

    _onTakeReactionPhoto() {
        let { navigator } = this.props
        let { cameraAuthorized } = this.state
        Mixpanel.track("Reaction Selfie");
        navigator.push({ name: 'ClapitCamera',
            callback: this._imageSelected.bind(this),
            cameraAuthorized,
            displayComment:true,
            displaySelfieOverlay: true
        })
    }

    _onPostReaction(comment, imageUrl) {
        let { createItemReaction, post, profile } = this.props
        let { mediaId, uploadedImageUrl } = this.state
        uploadedImageUrl = uploadedImageUrl || imageUrl;

        if (uploadedImageUrl) { // new image
            createMedia(uploadedImageUrl)
                .then(data => {
                    if (data.error) { // TODO
                        this.setState({ saveWhenDoneUploading: false })
                        return;
                    }

                    ({ id: mediaId } = data)

                    this.setState({
                        mediaId
                    })
                    createItemReaction(post.id, profile.id, mediaId, comment)
                    Mixpanel.track("Comment");
                })
        } else {
            createItemReaction(post.id, profile.id, mediaId, comment)
            Mixpanel.track("Comment");
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={this._onClosePress.bind(this)}>
                        <Image source={require('image!btn_close')}/>
                    </TouchableOpacity>
                    <Image source={require('image!ico_comments')}/>
                    <Text style={styles.headerText}>{this.props.reactions.length}</Text>
                </View>
                <ListView
                    removeClippedSubviews={false}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    enableEmptySections={true}
                    style={styles.list}>
                </ListView>
                <PostReaction
                    profile={this.props.profile}
                    style={[styles.postBar, {marginBottom: this.state.bottomMargin}]}
                    onTakeReactionPhoto={this._onTakeReactionPhoto.bind(this)}
                    onPostReaction={this._onPostReaction.bind(this)}/>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    list: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        paddingTop: 10
    },
    header: {
        height: 74,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20
    },
    headerText: {
        color: '#4CD6D0',
        marginLeft: 5,
        fontSize: 20
    },
    closeButton: {
        position: 'absolute',
        top: 29,
        left: 10,
        paddingLeft: 5,
        paddingTop: 5,
        paddingRight: 5,
        paddingBottom: 5
    },
    postBar: {
        height: 60
    }
}
