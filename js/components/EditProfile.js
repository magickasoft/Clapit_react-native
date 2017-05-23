import React, { Component } from 'react';
import ReactNative, {
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Keyboard,
    Dimensions,
    Alert,
    NativeModules,
    AlertIOS
} from 'react-native'
import _ from 'lodash'
import SimpleTabs from './SimpleTabs'
import { uploadToCloudinary, createMedia } from '../actions/api'
import Video from './VideoPatchIos10'

import ClapitLoading from './ClapitLoading'
import NavigationBar from 'react-native-navbar'
import NavTitle from './IntroNav/NavTitle'
import ForwardButton from './IntroNav/ForwardButton'
import {Colors} from '../themes'
import { Crashlytics } from 'react-native-fabric'
import {PROFILE_PHOTO, COVER_PHOTO} from '../constants/Constants'

let { CameraManager, AppHubManager, SharedStorageManager, RNMixpanel:Mixpanel } = NativeModules
let { width, height } = Dimensions.get('window')

const DESCRIPTION_MAX_LENGTH = 150

export default class EditProfile extends Component {
    constructor(props) {
        super(props)

        let { clapitAccountData: { username, description, Media, fullName, school, website, CoverMedia }, tabName } = props
        let length = (description) ? description.length : 0
        let descriptionCharsRemaining = DESCRIPTION_MAX_LENGTH - length
        let uploadImagePath = '' 
        let mediaId
        let uploadCoverImagePath = ' ' 
        let coverMediaId

        if (Media){
            uploadImagePath = Media.mediumURL
            mediaId = Media.id
        }
        if (CoverMedia){
            uploadCoverImagePath = CoverMedia.mediumURL
            coverMediaId = CoverMedia.id
        }

        this.state = {
            username,
            description,
            fullName,
            school,
            website,
            descriptionCharsRemaining,
            uploadImagePath,
            uploadedImageUrl: null,
            uploadCoverImagePath,
            uploadedCoverImageUrl: null,
            mediaId,
            coverMediaId,
            cameraAuthorized: false,
            tabName: tabName || PROFILE_PHOTO,
            contentOffset: 0,
            profilePhotoUpdated: false,
            coverPhotoUpdated: false
        }
    }

    _title() {
        return (
            <NavTitle>EDIT PROFILE</NavTitle>
        )
    }

    _onChangeTab(tabName) {
        this.setState({
            tabName
        })
        Mixpanel.trackWithProperties("Change Tab on Edit Profile", { name: tabName});
    }


    componentWillReceiveProps(){
        let { clapitAccountData: { Media, CoverMedia } } = this.props
        let uploadImagePath = ' ', uploadCoverImagePath = ' '
        if (Media){
            uploadImagePath = Media.mediumURL
        }
        if (CoverMedia){
            uploadCoverImagePath = CoverMedia.mediumURL
        }
        this.setState({
            uploadImagePath,
            uploadCoverImagePath
        })
    }

    componentDidMount() {
        // Thought is to save memory here...
        // let { navigator } = this.props
        //
        // navigator.immediatelyResetRouteStack({name: ' EditProfileContainer' })
        Keyboard.addListener('keyboardWillShow', this._keyboardWillShow)

        Keyboard.addListener('keyboardWillHide', this._keyboardWillHide)

        // set it ahead of time for ClapitCamera
        CameraManager.checkDeviceAuthorizationStatus()
          .then((cameraAuthorized) => {
            this.setState({
                cameraAuthorized
            })
        }).catch((err) => {
            console.log(err)
        })

        let { clapitAccountData: {isNew} } = this.props
        if (isNew) {
            this._loadContacts.bind(this)();
        }
    }

    _loadContacts() {
        let {fetchContactsToFollow, loadDeviceContacts, clapitAccountData} = this.props
        loadDeviceContacts(function(err, contacts){
            if (err && err.type === 'permissionDenied') {
                AlertIOS.alert('Error', 'Clapit requires access to Contact. Please enable access in Settings > Clapit > Contacts');
            } else {
                fetchContactsToFollow(contacts, clapitAccountData.id)
            }
        })
    }

    shouldComponentUpdate(nextProps, nextState) {

        let { clapitAccountData:oldClapitAccountData } = this.props
        let { clapitAccountData } = nextProps


        if (_.isEqual(oldClapitAccountData.modified, clapitAccountData.modified) == false) {
            let { navigator } = nextProps

            SharedStorageManager.synchronize(() => {
                AppHubManager.hasNewVersion((err, newVersionAvailable) => {
                    if (newVersionAvailable) {
                        setTimeout(() => {
                            AppHubManager.reloadBridge()
                        }, 500)
                    }
                })
            })
        }

        return true
    }

    _saveProfile() {
        let { clapitSaveProfile, navigator, clapitAccountData } = this.props
        let { username, description, mediaId, fullName, school, website, coverMediaId } = this.state

        Mixpanel.track("Save Profile");

        clapitSaveProfile(username, description, mediaId, fullName, school, website, coverMediaId, null, (err, data) => {
            let { fetchProfileData, contacts } = this.props

            if (err){
                let msg = "Problem occurred when saving your profile. Please try again."
                if (err.status === 422){
                    msg = `Username ${username} is already taken.`
                }
                Alert.alert('Error saving profile', msg, [
                    { text: 'OK' }
                ])

                Mixpanel.trackWithProperties("Error", { error: err });

                Crashlytics.log('upload profile error' + err)
                Crashlytics.recordError(err)

                this.setState({showLoading:false})
                return
            }
            fetchProfileData(clapitAccountData.id)

            if (clapitAccountData.isNew && contacts.followItems.length) {
                navigator.push({ name: 'FollowContacts', resourceId: clapitAccountData.id })
            } else {
                navigator.pop()
            }
        })


    }

    render() {
        let { username,
          description, school, website, fullName, descriptionCharsRemaining,
          uploadImagePath, uploadCoverImagePath, showLoading, tabName, contentOffset } = this.state
        const {clapitAccountData: { Media, CoverMedia }} = this.props

        let coverIsVideo = (uploadCoverImagePath && uploadCoverImagePath.trim() &&! /^.*(gif|jpg|jpeg|png)$/.test(uploadCoverImagePath))
        return (
            <View style={[styles.view, (contentOffset > 0)? {position:'absolute', bottom: contentOffset} : {position:'relative'}]}>
                <NavigationBar title={this._title()} rightButton={this._rightButton()} style={styles.navBar}/>
                <View style={styles.bodyView}>
                    <ScrollView ref='scrollView' style={styles.scrollView} >
                        <SimpleTabs
                          style={styles.tabs} selected={tabName}
                          underlineColor='#B289FC' onSelect={el => this._onChangeTab(el.props.name)}>
                            <Text style={styles.tabItem} selectedStyle={styles.tabSelected} name={PROFILE_PHOTO}>Profile Photo</Text>
                            <Text style={styles.tabItem} selectedStyle={styles.tabSelected} name={COVER_PHOTO}>Cover Photo</Text>
                        </SimpleTabs>
                        {(tabName === PROFILE_PHOTO) ?
                          <View style={styles.profileImageView}>
                              <TouchableOpacity onPress={this._onPressImageView.bind(this, PROFILE_PHOTO)}>
                                  <Image ref="profileImg" style={styles.profileImage} source={{uri: uploadImagePath || ' '}} />
                                  <View style={styles.profileEditView}>
                                    <Text allowFontScaling={false}>Edit Photo</Text>
                                  </View>
                              </TouchableOpacity>
                              {
                                  this.state.profilePhotoUpdated &&
                                   <TouchableOpacity style={[styles.profileEditView,{left: 5}]} 
                                        onPress={()=>{this.setState({
                                            uploadImagePath: Media.mediumURL,
                                            mediaId: Media.id,
                                            profilePhotoUpdated: false
                                        })}}> 
                                    <View >
                                        <Text allowFontScaling={false}>Cancel</Text>
                                    </View>
                                   </TouchableOpacity>
                                }
                          </View>
                        :
                          <View style={styles.profileImageView}>
                              <TouchableOpacity onPress={this._onPressImageView.bind(this, COVER_PHOTO)}>
                                  {(uploadCoverImagePath && uploadCoverImagePath.trim()) ?
                                    <View>
                                        {(coverIsVideo) ?
                                          <Video resizeMode="cover"
                                                 source={{uri: uploadCoverImagePath}}
                                                 rate={1.0}
                                                 muted={false}
                                                 repeat={true}
                                                 ref="video"
                                                 visibleParent={true}
                                                 style={{width, height: 0.75 * width}}/>
                                          :
                                          <Image ref="coverImg" style={styles.coverImage}
                                                 source={{uri: uploadCoverImagePath || ' '}}/>
                                        }
                                    </View>
                                    :
                                    <View style={[styles.coverImage, {backgroundColor:'lightgrey', justifyContent: 'center', alignItems: 'center'}]}>
                                        <Text style={{color: Colors.purple}}>Upload a Cover picture or video</Text>
                                    </View>
                                  }                                  

                                  <View style={styles.profileEditViewOpacity}>
                                      <Text allowFontScaling={false}>Edit {coverIsVideo ? 'Video' : 'Photo'}</Text>
                                  </View>
                              </TouchableOpacity>
                                {
                                  this.state.coverPhotoUpdated &&
                                   <TouchableOpacity style={[styles.profileEditViewOpacity,{left: 0}]} 
                                        onPress={()=>{this.setState({
                                            uploadCoverImagePath: CoverMedia.mediumURL,
                                            coverMediaId: CoverMedia.id,
                                            coverPhotoUpdated: false
                                        })}}> 
                                    <View >
                                        <Text allowFontScaling={false}>Cancel</Text>
                                    </View>
                                    </TouchableOpacity>
                                }
                          </View>
                        }
                        <View style={styles.inputView}>
                            <Text style={styles.inputHeaderText}>Username</Text>
                            <View style={styles.separator} />
                            <TextInput
                                onChange={this._usernameChange.bind(this)}
                                onSubmitEditing={this._onSubmitTextInput.bind(this, 'username')}
                                style={styles.textInput}
                                value={username}
                                blurOnSubmit={false}
                                ref='usernameTextInput'
                                placeholder="Enter your username"
                            ></TextInput>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={styles.inputHeaderText}>Full Name</Text>
                            <View style={styles.separator} />
                            <TextInput
                              onChange={this._fullNameChange.bind(this)}
                              onSubmitEditing={this._onSubmitTextInput.bind(this, 'fullName')}
                              style={styles.textInput}
                              value={fullName}
                              blurOnSubmit={false}
                              ref='fullNameTextInput'
                              placeholder="Enter your full name"
                            ></TextInput>
                        </View>
                        <View style={styles.aboutView}>
                            <Text style={styles.inputHeaderText}>Bio</Text>
                            <Text style={styles.aboutTextRemaining}>{descriptionCharsRemaining}</Text>
                            <View style={styles.separator} />
                            <TextInput
                                onChange={this._descriptionChange.bind(this)}
                                onSubmitEditing={this._onSubmitTextInput.bind(this, 'about')}
                                style={styles.aboutTextInput}
                                blurOnSubmit={true}
                                multiline={true}
                                maxLength={150}
                                value={description}
                                ref='aboutTextInput'
                                placeholder="What are your favourite talents? i.e. music, film, dance, art, design, comedy, sport, surfing, skating, snow, yoga..."
                            ></TextInput>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={styles.inputHeaderText}>College/University/School</Text>
                            <View style={styles.separator} />
                            <TextInput
                              onChange={this._schoolChange.bind(this)}
                              onSubmitEditing={this._onSubmitTextInput.bind(this, 'school')}
                              style={styles.textInput}
                              value={school}
                              blurOnSubmit={false}
                              ref='schoolTextInput'
                              placeholder="Enter your College/University/School"
                            ></TextInput>
                        </View>
                        <View style={styles.inputView}>
                            <Text style={styles.inputHeaderText}>Website</Text>
                            <View style={styles.separator} />
                            <TextInput
                              onChange={this._websiteChange.bind(this)}
                              onSubmitEditing={this._onSubmitTextInput.bind(this, 'website')}
                              style={styles.textInput}
                              value={website}
                              blurOnSubmit={false}
                              ref='websiteTextInput'
                              placeholder="Enter your website"
                            ></TextInput>
                        </View>
                    </ScrollView>
                    { showLoading ? (
                        <ClapitLoading />
                    ) : null }
                </View>
            </View>

        )
    }

    _rightButton() {
        return (
            <ForwardButton text="Save" onPress={this._onPressForwardButton.bind(this)} disabled={this.state.showLoading}/>
        )
    }

    _onPressForwardButton() {
        let { username } = this.state

        if (_.trim(username).length < 2) {
            Alert.alert('Username', "Please type a username with at least 2 letters", [
                { text: 'OK', onPress: () => this.refs.usernameTextInput.focus() }
            ])

            return
        }

        this.refs.usernameTextInput.blur()
        this.refs.aboutTextInput.blur()
        this.setState({
            showLoading: true
        })
        this._saveProfile()

    }

    _onPressImageView(photoType) {
        let { navigator } = this.props
        let { cameraAuthorized } = this.state
        navigator.push({
            name: 'ClapitCamera',
            index: 2,
            photoSelect: true,
            embedded: true,
            displayGifCamSwitch: photoType === PROFILE_PHOTO,
            displayCoverSwitch: photoType === COVER_PHOTO,
            photoOnlySelect: photoType === PROFILE_PHOTO,
            callback: this._imageSelected.bind(this), cameraAuthorized })
    }

    _imageSelected(image, video) {
        const path = image.indexOf('file://') === 0 ? image.substring('file://'.length) : image
        const isCoverPhoto = this.state.tabName === COVER_PHOTO

        if (isCoverPhoto){
            this.setState({
                uploadCoverImagePath: path,
                showLoading: true
            })
        } else {
            this.setState({
                uploadImagePath: path,
                showLoading: true
            })
        }

        uploadToCloudinary(video ? 'video' : 'image', `file://${path}`, (err, res) => {
            if (err || res.status != 200) {
                Alert.alert('Upload', 'We were unable to upload your image just now.  Would you like to try again?', [
                    {
                        text: 'No', onPress: () => {
                        if (isCoverPhoto){
                            this.setState({ uploadCoverImageUrl: null })
                        } else {
                            this.setState({ uploadImageUrl: null })
                        }
                    }, style: 'cancel'
                    },
                    {
                        text: 'Yes', onPress: () => {
                        this._imageSelected(path, video);
                    }
                    }
                ])
                return
            }

            let { data } = res
            data = JSON.parse(data)
            let { url } = data
            createMedia(url)
              .then(data => {
                  if (data.error) {
                      this.setState({
                          showLoading:false
                      })
                      Alert.alert('Upload', 'We were unable to upload your image just now. Please try again', [
                          {
                              text: 'OK', onPress: () => {}
                          }
                      ])
                      return;
                  }
                  if (isCoverPhoto){
                      this.setState({
                          coverMediaId:data.id,
                          showLoading:false,
                          uploadedCoverImageUrl: url,
                          coverPhotoUpdated: true
                      })
                  } else {
                      this.setState({
                          mediaId:data.id,
                          showLoading:false,
                          uploadedImageUrl: url,
                          profilePhotoUpdated: true
                      })
                  }
              })
        })
    }

    _usernameChange(e) {
        let { text:username } = e.nativeEvent
        this.setState({ username })
    }

    _fullNameChange(e) {
        let { text:fullName } = e.nativeEvent
        this.setState({ fullName })
    }

    _schoolChange(e) {
        let { text:school } = e.nativeEvent
        this.setState({ school })
    }

    _websiteChange(e) {
        let { text:website } = e.nativeEvent
        this.setState({ website })
    }

    _descriptionChange(e) {
        let { text:description } = e.nativeEvent
        let descriptionCharsRemaining = DESCRIPTION_MAX_LENGTH - description.length

        if (descriptionCharsRemaining >= 0) {
            this.setState({ description, descriptionCharsRemaining })

            return true
        }

        return false
    }

    _onSubmitTextInput(textInputName) {
        if (textInputName == 'username') {
            this.refs.aboutTextInput.focus()
        }
    }

    _keyboardWillShow = (e) => {
        this.setState({
            contentOffset: e.endCoordinates.height
        })
    }

    _keyboardWillHide = (e) => {
        this.setState({
            contentOffset: 0
        })
    }
}

const styles = {
    view: {
        backgroundColor: 'white',
        height,
        width,
    },
    navBar: {
        backgroundColor: 'white'
    },
    bodyView: {
        marginTop: 7,
        borderTopWidth: 1,
        borderTopColor: 'lightgray',
        flex: 1
    },
    scrollView: {},
    profileImageView: {
        alignItems: 'center'
    },
    profileImage: {
        marginTop: 10,
        width: 300,
        height: 300,
        borderRadius: 150
    },
    coverImage: {
        marginTop: 10,
        width: width,
        height: 300
    },
    profileEditView: {
        width: 70,
        height: 18,
        position: 'absolute',
        right: 0,
        bottom: 0
    },
    profileEditViewOpacity: {
        width: 80,
        height: 30,
        backgroundColor:'white',
        opacity: 0.8,
        alignItems:'center',
        justifyContent:'center',
        position: 'absolute',
        right: 0,
        bottom: 0
    },
    separator: {
        height: 1,
        backgroundColor: 'lightgray'
    },
    inputView: {
        marginTop: 10,
        height: 60,
        paddingTop: 5,
        paddingLeft: 5,
        paddingRight: 5,
    },
    aboutView: {
        marginTop: 10,
        height: 90,
        paddingTop: 5,
        paddingLeft: 5,
        paddingRight: 5,
    },
    inputHeaderText: {
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        color: 'gray',
        fontSize: 15
    },
    aboutTextInput: {
        marginTop:5,
        flex: 1,
        color: 'gray',
        fontSize: 15
    },
    aboutTextRemaining: {
        fontSize: 12,
        position: 'absolute',
        color: Colors.purple,
        right: 5,
        top: 5
    },
    tabs: {
        height: 40,
        marginLeft: 0,
        marginRight: 0
    },
    tabItem: {
        height: 25,
    },
    tabSelected: {
    },
}
