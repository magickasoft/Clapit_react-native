'use strict'

import React, { Component } from 'react';
import  {
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Text,
    TextInput,
    Switch,
    Alert,
    StyleSheet,
    NativeModules,
    Dimensions,
    Keyboard,
    WebView,
    TouchableHighlight,
    findNodeHandle
} from 'react-native'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as FacebookActions from './actions/facebook'
import * as TwitterActions from './actions/twitter'
import * as AppActions from './actions/app'
import {cloudinaryUpload} from './actions/fileUpload'
import ClapitButtonContainer from './containers/ClapitButtonContainer'
import {createMedia, createPost } from './actions/api'
import ClapitLoading from './components/ClapitLoading'
import _ from 'lodash'
import { Surface } from 'gl-react-native'
import GL from 'gl-react'
import filters from './filters'
import {scrapeWebsite} from './lib/scrapeUtils'
import Video from 'react-native-video'
import NotificationsController, {scanAndSubmitEvent} from './NotificationsController'
import TagAutocompleteInputContainer from './containers/TagAutocompleteInputContainer'
import {Colors} from './themes'
const { RNMixpanel:Mixpanel } = NativeModules

const MIXPANEL_TOKEN = process.env.NODE_ENV === 'dev' ? "23e6d9f0bf35e1f4308927110dbfc498" : "a6052cd4d26b0d8b8ccc0609efe815d2";

Mixpanel.sharedInstanceWithToken(MIXPANEL_TOKEN)
Mixpanel.track("Share Extension Started")

let { ExtensionManager, AssetHelperManager } = NativeModules
import RNViewShot from "react-native-view-shot";
let { width, height } = Dimensions.get('window')
let deviceWidth = width < height ? width : height
let deviceHeight = width < height ? height : width


class Extension extends React.Component {
    constructor(props) {
        super(props)

        this._keyboardWillShow = this._keyboardWillShow.bind(this)
        this._keyboardWillHide = this._keyboardWillHide.bind(this)

        this.state = {
            visibleHeight: Dimensions.get('window').height,
            imageWidth: 0, imageHeight: 0,
            shareOnFb: false,
            shareOnTwitter: false,
            postInProgress: false,
            title: '',
            cropImage: '',
            potentialCropImages: [],
            hasCropImages: true, // default as we are loading HTML
            readyToClap: false,
            filter: 'NONE',
            cropAreaHeight: 0,
            cropAreaWidth: 0
        }

    }

    _getCropImage() {
        let promise = new Promise((resolve, reject) => {
            let { shareType, data } = this.props
            let cropImage = null
            if (shareType == 'url') {
                let { url } = data
                scrapeWebsite(url).then(({title, images}) => {
                    this.setState({
                        title,
                        potentialCropImages:images,
                        hasCropImages: images.length > 0,
                        readyToClap: true
                    });
                    let topImage = images[0];
                    if (topImage.substr(0,2) === '//'){
                        topImage = 'https:' + topImage;
                    }
                    resolve(topImage)
                }).catch(err => {
                    console.log(err)
                })
            } else if (shareType == 'image') {
                ({ image: cropImage } = data)
                resolve(cropImage)
            } else if (shareType == 'video') {
                ({ image: cropImage } = data)
                resolve(cropImage)
            } else if (shareType == 'gif') {
                ({ image: cropImage } = data)
                resolve(cropImage)
            }
        })
        return promise
    }

    _assignCropImage() {
        let { shareType, data } = this.props
        if (shareType === 'video'){
            this.setState({ cropImage:null,
                imageWidth: deviceWidth,
                imageHeight: deviceWidth,
                readyToClap: true
            });
            return;
        }
        if (shareType === 'gif'){
            this.setState({ cropImage: data.image,
                imageWidth: deviceWidth,
                imageHeight: deviceWidth,
                readyToClap: true
            });
            return;
        }
        this._getCropImage().then(cropImage => {            
            if (cropImage) {
                this.setState({ cropImage })                
                this._findSizeOfCropImage()                
                if (shareType == 'image') {                    
                    this.setState({
                        thumbnail: cropImage
                    })
                }
            }
        })
    }

    _findSizeOfCropImage() {
        let { cropImage } = this.state
        let { shareType, data, isExtension } = this.props

        Image.getSize(cropImage, (width, height) => {
            if (!isExtension && shareType == 'image' && data.image.indexOf('assets-library') == 0) {
                AssetHelperManager.getAssetLibraryOrientation(data.image, (err, orientation) => {
                    if (orientation == 'portrait') { // flipped ??
                        this._assignImageWidthHeight(height, width)
                    } else {
                        this._assignImageWidthHeight(width, height)
                    }
                })
            } else {  // TODO: check image orientation with isExtension
                this._assignImageWidthHeight(width, height)
            }
        })

    }

    _assignImageWidthHeight(width, height) {
        if (width > height) {
            let realRatio = height/width
            let ratio = deviceWidth / height;
            let newImageWidth = ratio * width

            if (newImageWidth > deviceWidth)
            {
                let imageWidth = deviceWidth
                let imageHeight = deviceWidth*realRatio
                this.setState({
                    imageWidth: imageWidth,
                    imageHeight: imageHeight,
                    readyToClap: true
                })
            }
            else
            {
                this.setState({
                    imageWidth: newImageWidth,
                    imageHeight: deviceWidth,
                    readyToClap: true
                })
            }
        } else {
            let realRatio = width/height
            let ratio = deviceWidth / width;

            let newImageHeight = ratio * height

            if (newImageHeight > deviceWidth)
            {
                let imageHeight = deviceHeight
                let imageWidth = deviceHeight*realRatio
                this.setState({
                    imageWidth: imageWidth,
                    imageHeight: imageHeight,
                    readyToClap: true
                })
            }
            else
            {
                this.setState({
                    imageWidth: deviceWidth,
                    imageHeight: newImageHeight,
                    readyToClap: true
                })
            }
        }
    }

    _keyboardWillShow(e) {
        if (!this.refs.scrollView) {
            return;
        }

        let newVisibleHeight = Dimensions.get('window').height - e.endCoordinates.height;
        let { visibleHeight:oldVisibleHeight } = this.state
        this.setState({ visibleHeight: newVisibleHeight });

        // scrollTo -- not sure how to best handle but works for now
        if (Dimensions.get('window').height == 480) {
            this.refs.scrollView.scrollTo({ y: 230 })
        } else {
            this.refs.scrollView.scrollTo({ y: 130 })
        }
    }

    _keyboardWillHide(e) {
        if (!this.refs.scrollView) {
            return;
        }

        this.setState({ visibleHeight: Dimensions.get('window').height });

//      this.refs.scrollView.scrollTo({y:0})
    }

    componentWillReceiveProps(nextProps) {
        this._assignCropImage()

        let { hasFacebook = false, hasTwitter = false } = nextProps
        this.setState({ shareOnFb: hasFacebook, shareOnTwitter: hasTwitter })
    }

    componentDidMount() {

        this._assignCropImage()

        let { hasFacebook = false, hasTwitter = false } = this.props
        this.setState({ shareOnFb: hasFacebook, shareOnTwitter: hasTwitter })

        Keyboard.addListener('keyboardWillShow', this._keyboardWillShow)

        Keyboard.addListener('keyboardWillHide', this._keyboardWillHide)
        
    }

    _renderThumb(image, filter) {
        return (
            <View style={{justifyContent: 'center', flex: 1, marginBottom: 0}} key={filter}>
                {image}
                <Text style={{color: '#AAA', textAlign: 'center', width: 105, fontSize: 10, marginTop: 2}}>{filter}</Text>
            </View>
        )
    }

    _renderImage(image, width, height, filter) {
        const shaders = GL.Shaders.create(filters);

        const shader = filters[filter]
        if (!shader) {
            throw new Error('Could not find image filter: ' + filter)
        }

        const Shader = GL.createComponent(({ inputImageTexture, inputImageTexture2, inputImageTexture3 }) => {
                return (
                    <GL.Node
                        shader={shaders[filter]}
                        uniforms={{inputImageTexture, inputImageTexture2, inputImageTexture3}}
                    />
                )
            },
            { displayName: 'Filters' }
        )
        return (
            <Surface width={width} height={height}>
                <Shader inputImageTexture={image}  {...shader.textures}/>
            </Surface>
        )
    }

    _renderFilters() {
        const { imageWidth, imageHeight, thumbnail } = this.state
        const { shareType, isExtension = false } = this.props

        if (!thumbnail || imageWidth === 0 || imageHeight === 0 || shareType !== 'image' || isExtension) {
            return null
        }

        let thumbnailHeight = 75;
        let thumbnailWidth = 100;
        if (imageHeight > imageWidth) {
            thumbnailWidth = imageWidth * (thumbnailHeight/imageHeight)
        } else {
            thumbnailHeight = imageHeight * (thumbnailWidth/imageWidth)
        }

        const filters = ['NONE', 'ALTAIR', 'POLARIS', 'VEGA', 'SIRIUS']
        return (
            <ScrollView horizontal={true} style={{backgroundColor: 'transparent', marginTop: 5, marginBottom: 5, paddingBottom:5, width: deviceWidth}}>
                {filters.map(filter => {
                        return this._renderThumb(
                            <TouchableHighlight onPress={() => this.setState({filter})} style={{marginLeft: 5}}>
                                <View style={{borderWidth:1, borderColor:'#AAA', alignItems: 'center'}}>
                                    { this._renderImage.bind(this)(thumbnail, thumbnailWidth, thumbnailHeight, filter) }
                                </View>
                            </TouchableHighlight>, filter
                        )
                    }
                )}
            </ScrollView>
        )
    }

    _fbShareView() {
        let { isExtension = false, hasFacebook } = this.props
        let { shareOnFb } = this.state

        if (!isExtension || hasFacebook) {
            return (
                <View style={styles.shareView}>
                    <Image source={require('image!settingsFbIcon')} style={styles.shareImage}/>
                    <Text style={styles.shareViewText}>Share on Facebook</Text>
                    <Switch style={styles.shareViewSwitch} value={shareOnFb} onValueChange={this._onValueChange.bind(this, 'facebook')}/>
                </View>
            )
        }

        return null
    }

    _twitterShareView() {
        let { isExtension = false, hasTwitter } = this.props
        let { shareOnTwitter } = this.state

        if (!isExtension || hasTwitter) {
            return (
                <View style={styles.shareView}>
                    <Image source={require('image!settingsTwitterIcon')} style={styles.shareImage}/>
                    <Text style={styles.shareViewText}>Share on Twitter</Text>
                    <Switch style={styles.shareViewSwitch} value={shareOnTwitter} onValueChange={this._onValueChange.bind(this, 'twitter')}/>
                </View>
            )
        }

        return null
    }

    _measureCropAreaLayout = (e) => {
        const {nativeEvent: { layout: {x, y, width, height}}} = e
        this.setState({cropAreaWidth: width, cropAreaHeight: height })
    }

    render() {
        let { shareType, autoRehydrated, clapitAccountData, isExtension = false } = this.props

        if (!autoRehydrated) {
            return (<View></View>)
        }

        if (_.isEmpty(clapitAccountData)) {
            ExtensionManager.showLoginNeeded()
        }

        let {
            visibleHeight,
            cropImage,
            potentialCropImages,
            hasCropImages,
            title,
            imageWidth, imageHeight,
            shareOnFb, shareOnTwitter,
            postInProgress,
            readyToClap
        } = this.state

        let cropContentContainerStyle = {
            width: imageWidth, height: imageHeight
        }
        let cropScrollEnabled = true

        if (shareType == 'url' && !hasCropImages) {
            cropContentContainerStyle = {
                width: deviceWidth - 10,
                height: deviceWidth - 10
            }

            cropScrollEnabled = false
        }
        var width = deviceWidth
        const minZoom = deviceWidth / imageWidth
        const startZoom = this.state.cropAreaWidth > 0 ? Math.max(this.state.cropAreaWidth / imageWidth, this.state.cropAreaHeight/imageHeight) : 1 

        return (
            <View style={[styles.containerView, {alignItems: 'stretch', height: visibleHeight}]}>
                <NotificationsController/>
                <View style={styles.backgroundView}></View>

                <View style={{alignItems:'center', justifyContent: 'center'}}>
                    <View style={[styles.headerView, {width:deviceWidth - 20}]}>
                        <View style={{flex:0.8}}>
                            <TouchableOpacity style={styles.touchableClose} onPress={this._closeExtension.bind(this)}>
                                <Text style={styles.arrow}>&lsaquo;</Text>
                            </TouchableOpacity>

                        </View>

                        <ClapitButtonContainer
                            disabled={!readyToClap}
                            postType='feed'
                            style={{width: 50, height: 50, borderRadius: 25}}
                            pressInScale={1.5}
                            showClapCount={false}
                            onClap={this._onClap.bind(this)}
                        />

                    </View>
                </View>

                <ScrollView
                    ref="scrollView"
                    style={styles.scrollView}
                    contentContainerStyle={{alignItems: 'center', paddingBottom:125}}>
                    <View style={styles.bodyView}>
                        <View style={styles.cropScrollViewContainer}>

                            <View ref="cropScrollView" onLayout={this._measureCropAreaLayout} style={styles.cropScrollViewContainer2}>
                                { cropContentContainerStyle.width > 0 && cropContentContainerStyle.height > 0 ? (
                                    <ScrollView
                                        scrollEnabled={cropScrollEnabled}
                                        style={[styles.cropScrollView, {borderTopWidth:1, borderBottomWidth:1, borderColor: Colors.grey}]}
                                        contentContainerStyle={cropContentContainerStyle}
                                        minimumZoomScale={cropScrollEnabled ? minZoom : 1.0}
                                        maximumZoomScale={cropScrollEnabled ? 2.0 : 2.0}
                                        zoomScale={startZoom}
                                        ref="cropScrollView2"                                        
                                        onScroll={this._onScrollCropScrollView.bind(this)}
                                        scrollEventThrottle={16}>
                                        { (shareType === 'video')?
                                          <View>
                                              <Video resizeMode="cover"
                                                     source={{uri: this.props.data.video}}
                                                     rate={1.0}
                                                     volume={0.0}
                                                     muted={true}
                                                     repeat={true}
                                                     paused={false}
                                                     style={{width: width , height: width}} />
                                          </View>
                                          : shareType != 'url' || (shareType == 'url' && hasCropImages) ?
                                            !isExtension && shareType === 'image' ?
                                                (this._renderImage.bind(this)(cropImage, imageWidth, imageHeight, this.state.filter)) :
                                                (<Image
                                                    source={{uri:cropImage}}
                                                    style={{resizeMode: 'contain'}}
                                                    width={imageWidth}
                                                    height={imageHeight}/>)
                                            : (
                                            <WebView source={{uri: this.props.data.url}} style={{width:deviceWidth - 10, height: deviceWidth - 10}}/>
                                        )}
                                    </ScrollView>
                                ) : null }
                            </View>
                        </View>
                        <View style={styles.userBar}>
                            <TagAutocompleteInputContainer
                              ref="tagsAutocomplete"
                              value="#singit "
                              onChange={this._titleChange.bind(this)}
                              style={styles.textInput}
                              containerStyle={styles.descriptionView}
                              placeholder="Enter description"
                            />
                        </View>
                        <View style={styles.itemSeparator}/>

                    </View>
                    { potentialCropImages.length > 0 ? (
                        <ScrollView
                            style={[styles.potentialScrollView, {width: deviceWidth - 10 }]}
                            horizontal={true}
                        >
                            { potentialCropImages.map((imageUrl, index) => {
                                let selected = imageUrl == cropImage

                                let imageStyle = {}

                                if (selected) {
                                    imageStyle.opacity = 0.7
                                }

                                return (
                                    <TouchableOpacity key={index} onPress={this._changeCropImage.bind(this, imageUrl)}>
                                        <Image
                                            style={[styles.potentialCropImage, imageStyle]}
                                            source={{uri: imageUrl}}
                                        />
                                    </TouchableOpacity>
                                )
                            }) }
                        </ScrollView>
                    ) : null }
                    { this._renderFilters.bind(this)()}
                    <View style={[styles.footerView, {width:deviceWidth}]}>
                        {this._fbShareView()}
                        {this._twitterShareView()}
                    </View>
                </ScrollView>

                { postInProgress ? <ClapitLoading /> : null }
            </View>
        )
    }

    _onScrollCropScrollView(evt) {
        let { nativeEvent, nativeEvent: { contentOffset, contentSize, zoomScale } } = evt

    }

    _closeExtension() {
        let { isExtension = false, navigator } = this.props

        if (isExtension) {
            ExtensionManager.closeExtension()
            return;
        }

        // navigator.popN(2)
        navigator.pop()
        navigator.pop()
        setTimeout(() => {
            navigator.pop();
        },10)
    }

    _titleChange(evt) {
        let { text:title } = evt.nativeEvent

        this.setState({ title })
    }

    _changeCropImage(cropImage) {
        if (this.refs.cropScrollView2) {
            this.refs.cropScrollView2.setNativeProps({ zoomScale: 1.0 })
        }
        this.setState({ cropImage })

        this._findSizeOfCropImage()
    }

    _onValueChange(socialNetwork, value) {
        let { hasFacebook, hasTwitter, fbLogin, twitterLogin } = this.props

        // this handles it if they're already logged in with the socialNetwork
        if (hasFacebook && socialNetwork == 'facebook') {
            this.setState({ shareOnFb: value })
        } else if (hasTwitter && socialNetwork == 'twitter') {
            this.setState({ shareOnTwitter: value })
        }

        // this handles if they're not logged in with the socialNetwork
        // this will NOT happen if isExtension, as they will be hidden
        if (!hasFacebook && socialNetwork == 'facebook' && value == true) {
            fbLogin()
        } else if (!hasTwitter && socialNetwork == 'twitter' && value == true) {
            twitterLogin()
        }
    }

    _handlePostError(err, status) {
        console.log('Could not upload file: ', err, status)
        let { isExtension } = this.props

        if (isExtension) {
            ExtensionManager.showUploadError()

            this.setState({ postInProgress: false })
        } else {
            Alert.alert('Upload', 'We were having trouble reaching the server just now.  Would you like to try again?', [
                {
                    text: 'No', onPress: () => {
                    this.setState({ postInProgress: false })
                }, style: 'cancel'
                },
                {
                    text: 'Yes', onPress: () => {
                    this._onClap()
                }
                }  // it will restart
            ])
        }
    }

    _onClap() {
        let {shareType, data, cloudinaryUpload, isExtension} = this.props
        this.setState({ postInProgress: true })
        if (shareType === 'gif'){
            let localPath = (data.image.indexOf('assets-library') === 0) ? data.image : 'file://' + data.image;
            cloudinaryUpload('image', localPath, (err, res) => {
                console.log(err)
                if (err || res.status != 200) {
                    this._handlePostError(err, res.status)
                    return
                }
                let { data } = res
                data = JSON.parse(data)
                let { url } = data
                this._createMedia(url)
            })
            if (! isExtension){
                this._closeExtension.bind(this)();
            }
        } else if (shareType === 'video'){
            this._createMedia(' ')
            if (! isExtension){
                this._closeExtension.bind(this)();
            }
        } else {
            RNViewShot.takeSnapshot(this.refs.cropScrollView, {format: "jpeg"}).then( path => {
                cloudinaryUpload('image', `file://${path}`, (err, res) => {
                    if (err || res.status != 200) {
                        this._handlePostError(err, res.status)
                        return
                    }

                    let { data } = res
                    data = JSON.parse(data)
                    let { url } = data

                    this._createMedia(url)
                })
                if (! isExtension){
                    this._closeExtension.bind(this)();
                }
            })
        }
    }

    _createMedia(url) {
        createMedia(url)
            .then(data => {

                if (data.error) {
                    this._handlePostError(data.error)
                    return
                }

                let { id:mediaId } = data

                this._createPost(mediaId, url)
            })
    }

    _createPost(mediaId, url) {
        let { title, shareOnFb, shareOnTwitter } = this.state

        if(title) scanAndSubmitEvent(title)

        let postData = {
            isPublish: true,
            fbShare: shareOnFb,
            twShare: shareOnTwitter,
            igShare: false,
            data: {
                title, mediaId, url
            }
        }

        let { shareType, data, clapitAccountData: { id:userId }, reloadUserPosts, cloudinaryUpload } = this.props

        Mixpanel.trackWithProperties('Create Post', { type: shareType })
        switch (shareType) {
            case 'image':
                createPost(postData)
                    .then(res => {
                        if (reloadUserPosts) {
                            reloadUserPosts(userId)
                        }
                        this._closeExtension()
                    })
                break
            case 'gif':
                createPost(postData)
                    .then(res => {
                        if (reloadUserPosts) {
                            reloadUserPosts(userId)
                        }
                        this._closeExtension()
                    })
                break
            case 'url':
                postData.data.url = data.url  // copy from props

                createPost(postData)
                    .then(res => {
                        if (reloadUserPosts) {
                            reloadUserPosts(userId)
                        }
                        this._closeExtension()
                    })
                break
            case 'video':
                let { video } = data
                // upload original URL
                cloudinaryUpload('video', video, (err, res) => {
                    if (err || res.status != 200) {
                        this._handlePostError(err, res.status)
                        return
                    }
                    let { data } = res
                    data = JSON.parse(data)
                    let { url } = data

                    postData.data.url = url  // original video URL

                    createPost(postData)
                        .then(res => {
                            if (reloadUserPosts) {
                                reloadUserPosts(userId)
                            }
                            this._closeExtension()
                        })

                })

                break
        }

    }
}

const styles = StyleSheet.create({
    containerView: {
        flex: 1,
        alignItems: 'center'
    },
    backgroundView: {
        position: 'absolute',
        top: 0, left: 0, bottom: 0, right: 0,
        backgroundColor: 'white'
    },
    scrollView: {
        flex: 1
    },
    headerView: {
        marginTop: 20,
        height: 50,
        flexDirection: 'row'
    },
    touchableClose: {
        top: -15,
        width: 50
    },
    bodyView: {
        paddingTop: 1,
        width: deviceWidth,
        height: 0.75 * deviceWidth + 50
    },
    descriptionView:{
        height: 30,
        paddingLeft: 0,
        flex: 1,
        backgroundColor: 'white'
    },
    cropScrollViewContainer: {
        overflow: 'hidden',
        flex: 1,
        backgroundColor: 'white'
    },
    cropScrollViewContainer2: {
        overflow: 'hidden',
        flex: 1,
        backgroundColor: 'white'
        
    },
    cropScrollView: {
        backgroundColor: 'white'
    },
    userBar: {
        borderTopWidth: 0,
        alignSelf:'flex-end',

        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center'
    },
    userImage: {
        width: 33,
        height: 33,
        borderRadius: 17,
        marginLeft: 5
    },
    userText: {
        fontWeight: 'bold',
        fontSize: 11,
        marginLeft: 15,
        flex: 0.15
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10
    },
    potentialScrollView: {
        marginLeft: 10,
        marginTop: 10,
        height: 60
    },
    potentialCropImage: {
        marginRight: 10,
        width: 50,
        height: 50
    },
    footerView: {

    },
    shareView: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        height: 50
    },
    shareImage: {
        width: 30,
        height: 30,
        marginLeft: 15
    },
    shareViewText: {
        marginLeft: 10,
        fontSize: 17
    },
    shareViewSwitch: {
        position: 'absolute',
        top: 15,
        right: 15
    },
    clapButton: {
        position: 'absolute',
        top: 30,
        right: 15
    },
    thumbStyle: {
        marginLeft: 5,
        marginRight: 5,
        flex: 1,
    },
    itemSeparator: {
        marginTop: 5,
        height: 1,
        backgroundColor: Colors.grey
    },
    arrow: {
        backgroundColor: 'white',
        color: '#B385FF',
        fontFamily: 'AvenirNextRoundedStd-Med',
        textAlign: 'center',
        fontSize: 55
    }
})

const stateToProps = (state) => {
    let { clapitAccountData, autoRehydrated } = state

    let hasFacebook = false, hasTwitter = false

    if (!_.isEmpty(clapitAccountData)) {
        let { facebookId, twitterId } = clapitAccountData

        hasFacebook = !_.isEmpty(facebookId)
        hasTwitter = !_.isEmpty(twitterId)
    }
    return { autoRehydrated, clapitAccountData, hasFacebook, hasTwitter }
}

const dispatchToProps = (dispatch, ownProps) => {
    let { isExtension = false } = ownProps

    if (!isExtension) {
        let actions = Object.assign({cloudinaryUpload}, FacebookActions, TwitterActions, AppActions)
        return bindActionCreators(actions, dispatch)
    }
    return bindActionCreators({cloudinaryUpload}, dispatch)
}

export default connect(stateToProps, dispatchToProps)(Extension)
