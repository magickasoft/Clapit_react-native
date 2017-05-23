import React, { Component } from 'react';
import  {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  NativeModules,
  Alert,
  ActionSheetIOS,
  CameraRoll,
  TextInput,
  Keyboard,
  StatusBar
} from 'react-native'
import Camera from 'react-native-camera'
import PhotoSelect from './ClapitCamera/PhotoSelect'
import {STATUS_BAR_HEIGHT} from '../constants/Size'
import TagAutocompleteInputContainer from '../containers/TagAutocompleteInputContainer'
import {MAX_VIDEO_DURATION} from '../constants/Size'
import {Images} from '../themes'

const DURATION_MS = MAX_VIDEO_DURATION * 1000;
const UPDATE_INTERVAL = 100;
const { CameraManager, AssetHelperManager } = NativeModules
const { width, height } = Dimensions.get('window')
const { RNMixpanel:Mixpanel } = NativeModules



export default class ClapitCamera extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      cameraAuthorized: props.cameraAuthorized ? props.cameraAuthorized : false,  // allow parent to set value
      cameraType: (props.captureGif) ? Camera.constants.Type.front : Camera.constants.Type.back,
      previewPath: null,
      videoPath: null,
      showCancel: props.showCancel === undefined ? true : props.showCancel,
      captureMode: props.captureVideo || props.displayCoverSwitch ? Camera.constants.CaptureMode.video : Camera.constants.CaptureMode.still,
      showApproveDeny: false,
      videoRecording:false,
      gifRecording:false,
      gifShots:[],
      videoRecordingTimer:null,
      selfieGifMode:false,
      textComment: '',
      coverMode:'video',
    }
  }
  componentDidMount() {
    Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this))
    Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this))

    CameraManager.checkDeviceAuthorizationStatus()
      .then((cameraAuthorized) => {
        this.setState({
          cameraAuthorized
        });
        this.resetTriggerIcon();
        if(!cameraAuthorized) {
          Alert.alert('Camera', 'Please go into Settings -> clapit and flip the Camera switch to use camera', [
            { text: 'OK' }
          ])
        }
      }).catch((err) => {
      console.log(err)
    })
  }

  componentWillMount() {
    if(this.props.cameraType && this.props.cameraType !== this.state.cameraType) {
      this._switchCamera()
    }
  }

  _keyboardWillShow(e) {

    this.setState({
      contentOffset: e.endCoordinates.height
    })
  }

  _keyboardWillHide(e) {
    this.setState({
      contentOffset: 0
    })
  }

  _handlePhotoSelect(content, video) {
    const {embedded, navigator} = this.props
    let approve = this._onPressApprove.bind(this)
    if(content.toLowerCase().indexOf('jpg') > -1 || content.toLowerCase().indexOf('png') > -1) {
      content = content.replace('file://', '')
    }

    this.setState({
      previewPath: content,
      videoPath: video,
      showApproveDeny: !embedded
    });
    if (embedded){
      approve();
    }
  }

  resetTriggerIcon() {
    let icon;
    if (this.props.captureVideo
        || this.props.displayCoverSwitch && this.state.coverMode === 'video'){
      if (this.state.videoRecording){
        icon = require('image!cameraTriggerVideoStop');
      } else {
        icon = require('image!cameraTriggerVideo');
      }
    } else if (this.props.captureGif
        || this.props.displayGifCamSwitch && this.state.selfieGifMode
        || this.props.displayCoverSwitch && this.state.coverMode === 'gif') {
      icon = require('image!camera_trigger_gif');
    } else {
      icon = require('image!cameraTrigger');
    }
    this.setState({
      triggerIcon:icon
    })
  }

  _commentChange(evt) {
    let { text } = evt.nativeEvent
    this.setState({ textComment : text })
  }

  render() {
    let { previewPath, showApproveDeny, showCancel, selfieGifMode, contentOffset, videoRecording } = this.state
    const { photoSelect = false, photoOnlySelect = false, displayGifCamSwitch, displayComment, displayCoverSwitch, displaySelfieOverlay } = this.props

    return (
      <View style={[this.props.style, styles.container]}>
        <View style={{ height: STATUS_BAR_HEIGHT, backgroundColor: 'white'}}>
            <StatusBar barStyle="default"/>
        </View>
        
        { previewPath || ! showCancel ? null : (
          <TouchableOpacity style={styles.cancelButton} onPress={this._cancelCamera.bind(this)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        { previewPath ? null : (
          <TouchableOpacity style={styles.switchButton} onPress={this._switchCamera.bind(this)}>
            <Image source={require('image!cameraFlipButton')} resizeMode="contain" width={30} height={30} />
          </TouchableOpacity>
        )}
        <View style={[styles.cameraView, (contentOffset > 0) ? {position:'absolute', top:0} : {position:'relative'} ]}>
          {previewPath ? (
            <Image style={styles.camera} source={{uri: previewPath}} />
          ) : (
            this._renderCamera()
          )}
          {(displaySelfieOverlay) ?
            <Image
              style={{ position: 'absolute', width: width, height: width, top: 0 }}
              source={Images.ico_selfie_overlay_black} />
          : null}
        </View>
        { previewPath ? null : (
          <View style={{flexDirection:'row'}}>
            <Text style={{color:'white', position:'absolute', left: -60, top: 45 }}>{this.state.videoTimeRemainingText}</Text>
            <TouchableOpacity style={styles.touchableTrigger} onPress={this._onTriggerPress.bind(this)}>
              <Image source={this.state.triggerIcon} width={70} height={70} />
            </TouchableOpacity>
          </View>
        )}
        { !photoSelect || previewPath || videoRecording? null : (
          <PhotoSelect photoOnlySelect={photoOnlySelect} onSelected={this._handlePhotoSelect.bind(this)}/>
        )}
        { showApproveDeny ? (
          <View style={[styles.approveDenyView, (contentOffset > 0)? {position:'absolute', bottom: contentOffset} : {position:'relative'}]}>
            <View style={styles.approveDenyButtons}>
              <TouchableOpacity style={styles.denyButton} onPress={this._onPressDeny.bind(this)}>
                <Text style={styles.denyText}>&times;</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveButton} onPress={this._onPressApprove.bind(this)}>
                <Image style={styles.approveImage} source={require('image!clapButtonForTint')} width={70} height={70} />
              </TouchableOpacity>
            </View>
            {
              (displayComment)? (
                <View>
                  <TagAutocompleteInputContainer
                    ref="tagsAutocomplete"
                    onChange={this._commentChange.bind(this)}
                  />

                </View>
              ): null
            }
          </View>
        ) : null }
        { displayGifCamSwitch && ! showApproveDeny ? (
          <View style={styles.switchToGifView}>
            <TouchableOpacity style={styles.switchToGifButton} onPress={this._switchGifAndCam.bind(this)}>
              {(!selfieGifMode)?
                <Image source={require('image!camera_switch_to_gif')} style={styles.switchToGifImage} />:
                <Image source={require('image!camera_switch_to_cam')} style={styles.switchToGifImage} />
              }
            </TouchableOpacity>
          </View>
        ) : null }
        { displayCoverSwitch && ! showApproveDeny ? (
          <View style={styles.switchToGifView}>
            <TouchableOpacity onPress={this._switchCoverMode.bind(this)}>
              {this._renderCoverSwitch()}
            </TouchableOpacity>
          </View>
        ) : null }
      </View>
    );
  }

  _renderCoverSwitch(){
    if (this.state.coverMode === 'video'){
      return <Image source={require('image!camera_switch_to_cam')} style={styles.switchToGifImage} />
    } else  if (this.state.coverMode === 'image'){
      return <Image source={require('image!camera_switch_to_gif')} style={styles.switchToGifImage} />
    } else if (this.state.coverMode === 'gif'){
      return <Image source={Images.video_switch} resizeMode={'contain'} style={styles.switchToGifImage} />
    }
  }

  _renderCamera() {
    let { cameraAuthorized, cameraType, captureMode} = this.state
    let captureQuality = (this.props.captureGif) ? 'medium' : 'high';
    if(cameraAuthorized) {
      return (
        <Camera
          ref="cam"
          style={styles.camera}
          type={cameraType}
          captureMode={captureMode}
          captureAudio={captureMode === Camera.constants.CaptureMode.video}
          captureTarget={Camera.constants.CaptureTarget.disk}
          captureQuality={captureQuality}
        >
        </Camera>
      )
    }

    return null
  }
  _cancelCamera() {
    let { navigator } = this.props
    Mixpanel.track('Cancel Camera')
    navigator.pop()
  }
  _switchCamera() {
    let { cameraAuthorized, cameraType } = this.state
    //if(!cameraAuthorized) { return; }

    // TODO: what if no cam on front??
    if(cameraType == Camera.constants.Type.back) {
      cameraType = Camera.constants.Type.front
    } else {
      cameraType = Camera.constants.Type.back
    }

    Mixpanel.trackWithProperties('Switch camera type', { cameraType: cameraType === Camera.constants.Type.front? 'front': 'back' })
    this.setState({cameraType});
  }


  _switchCoverMode() {
    let coverMode;
    if (this.state.coverMode === 'video'){
      coverMode = 'image';
    } else  if (this.state.coverMode === 'image'){
      coverMode = 'gif';
    } else if (this.state.coverMode === 'gif'){
      coverMode = 'video';
    }
    this.setState({
      coverMode,
      captureMode: (coverMode === 'video') ? Camera.constants.CaptureMode.video : Camera.constants.CaptureMode.still
    });
    setTimeout(()=> {
      this.resetTriggerIcon();
    },100);

    Mixpanel.trackWithProperties('Switch GifCam', { selfieGifMode: this.state.selfieGifMode })
  }

  _switchGifAndCam() {
    this.setState({
      selfieGifMode: ! this.state.selfieGifMode
    });
    setTimeout(()=> {
      this.resetTriggerIcon();
    },100);

    Mixpanel.trackWithProperties('Switch GifCam', { selfieGifMode: this.state.selfieGifMode })
  }

  _takePicture() {
    if (! this.refs.cam) return;
    let {embedded} = this.props
    let approve = this._onPressApprove.bind(this)
    this.refs.cam.capture().then((data) => {
      // NOTE: setting state twice, first time is for quick UX.
      this.setState({
        previewPath: data.path,
        showApproveDeny: !embedded
      })
      if (embedded){
        approve();
      }

    }).catch((err) =>{
        console.log(err);
    });

  }

  durationToText(ms){
    let min = Math.floor(ms / 60000)
    let sec = Math.floor((ms / 1000) % 60)
    let millis = Math.floor((ms % 1000) / 100 )
    return min + ':' + sec + ':' + millis
  }

  _takeVideo() {
    if (! this.refs.cam) return;
    let approve = this._onPressApprove.bind(this)
    let cam = this.refs.cam;
    if (this.state.videoRecording){
      clearTimeout(this.state.videoRecordingTimer)
      this.setState({
        videoRecording: false,
        videoRecordingTimer: null
      })
      cam.stopCapture();
      setTimeout(this.resetTriggerIcon.bind(this),0);
      return;
    }
    let timer = setTimeout(() => {
      cam.stopCapture();
    }, DURATION_MS)
    this.setState({
      videoRecordingTimer: timer,
      videoRecording: true,
      videoTimeRemainingText: this.durationToText(DURATION_MS),
    });
    setTimeout(this.resetTriggerIcon.bind(this),0);
    let startTime = new Date().getTime();
    let interval = setInterval(() => {
      let videoTimeRemaining = DURATION_MS + startTime - (new Date().getTime())
      if (videoTimeRemaining < 0) videoTimeRemaining = 0;
      this.setState({
        videoTimeRemainingText: this.durationToText(videoTimeRemaining),
      });

    }, UPDATE_INTERVAL);
    cam.capture().then((data) => {
      clearTimeout(timer);
      clearInterval(interval);
      this.setState({
        previewPath: data.path,
        videoPath: data.path,
        showApproveDeny: false,
        videoRecording: false,
        videoTimeRemainingText: null
      });
      this.resetTriggerIcon();
      approve();

    }).catch((err) =>{
      console.log(err);
    });
  }

  _takeGif() {
    if (! this.refs.cam) return;
    if (this.state.gifRecording) return;

    let cam = this.refs.cam;
    let approve = this._onPressApprove.bind(this);

    this.setState({
      gifRecording: true,
      gifShots:[]
    });

    function takeShot(number, callback){
      cam.capture().then((data) => {
        this.setState({
          gifShots: this.state.gifShots.concat(data.path)
        });
        if (number < 5){
          setTimeout(() => {
            takeShot(number + 1, callback)
          },400)
        } else {
          callback();
        }
      }).catch((err) =>{
        console.log(err);
      });
    }
    takeShot = takeShot.bind(this);

    takeShot(1, () => {
      let {gifShots } = this.state
      let {embedded, navigator } = this.props
      AssetHelperManager.createGif(gifShots[0], gifShots[1], gifShots[2], gifShots[3], gifShots[4], (err, res) => {
        if (err) {
          console.log(err);
        }
        this.setState({
          gifRecording: false,
          previewPath: res.image,
          showApproveDeny: !embedded
        });
        if (embedded){
          approve();
        }
      })

    })
  }

  _onTriggerPress(){
    if (this.props.captureVideo
        || this.props.displayCoverSwitch && this.state.coverMode === 'video') {
      this._takeVideo.bind(this)();
    } else if (this.props.captureGif
        || this.props.displayGifCamSwitch && this.state.selfieGifMode
        || this.props.displayCoverSwitch && this.state.coverMode === 'gif') {
      this._takeGif.bind(this)();
    } else {
      this._takePicture.bind(this)();
    }
  }

  _onPressDeny() {
    this.setState({
      previewPath: null,
      videoPath: null,
      showApproveDeny: false
    })
  }
  _onPressApprove() {
    let { navigator, callback, embedded = false } = this.props
    let { previewPath, videoPath, textComment } = this.state

    if(!embedded) {
      navigator.pop()
      callback(previewPath, videoPath, textComment)
    } else {
      this.setState({
        previewPath: null,
        videoPath: null,
        showApproveDeny: false
      }, () =>{
        navigator.pop()
        callback(previewPath, videoPath, textComment)
      })
    }
  }

}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  cancelButton: {
    position: 'absolute',
    top: 30,
    left: 10
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18
  },
  switchButton: {
    position: 'absolute',
    top: 20,
    right: 20
  },
  cameraView: {
    width,
    height: width
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  touchableTrigger: {
    marginTop: 20
  },
  approveDenyView: {
    flexDirection: 'column',
    width,
  },
  approveDenyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  denyButton: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  denyText: {
    color: '#ff5555',
    fontSize: 70
  },
  approveButton: {
    top: 10
  },
  approveImage: {
    tintColor: 'lightgreen'
  },
  switchToGifView: {
    marginTop: -63,
    marginLeft: 210
  },
  switchToGifImage: {
    width:68,
    height:68
  },
  textInput: {
    fontSize: 15,
    color: '#AAA',
    flex: 1,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 5,
    backgroundColor:'white',
    height:30,
    paddingLeft: 15,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  }
});
