import React, { Component } from 'react'
import { NativeModules, View, Image, TouchableOpacity } from 'react-native'
import Video from 'react-native-video'
import InViewPort from 'react-native-inviewport'
import { Images, Styles } from '../themes'
import { CloudinaryVideoThumbnail } from '../lib/utils'

const { RNMixpanel:Mixpanel } = NativeModules

const END_TIME = 9999999

//todo check and remove "seek to end and replay" after fix exists for:
// - https://github.com/react-native-community/react-native-video/issues/330
// this component also uses InviewPort to make sure video autoplays only when visible.

export default class VideoPatch extends Component {
  constructor(props) {
    super(props)

    //ios 10 scaling bug - we need to start autoplaying, then seek to and and replay from beginning
    // to avoid scaling issue mentioned above
    this.state = {
      paused: false,
      visible: false,
      showVideo: false,
      muted:props.muted
    }

    this.passedProps = {}
    // Starts 1 because we're immediately going to skip to second play
    this.playCount = 1
  }

  componentWillMount() {
    // Store passed props that we're overriding
    this.passedProps = {
      repeat: this.props.repeat,
      muted: this.props.muted,
      onEnd: this.props.onEnd,
      onLoad: this.props.onLoad
    }
  }

  componentWillReceiveProps(newProps) {
    const { repeat, onEnd, onLoad, muted } = newProps

    // Updated passed props that we're overriding if they change
    if (repeat || onEnd || onLoad || muted) {
      this.passedProps = {
        repeat: repeat || this.passedProps.repeat,
        muted: muted || this.passedProps.muted,
        onEnd: this.props.onEnd || this.passedProps.onEnd,
        onLoad: this.props.onLoad || this.passedProps.onLoad
      }
    }

  }

  /**
   * Cb on video end that handles when to end the video
   */
  onEnd = () => {
    if (this.passedProps.repeat) {
      // If the video should repeat, emit onEnd immediately
      this.passedProps.onEnd && this.passedProps.onEnd()
    } else {
      // If the video should not repeat, only emit onEnd after it's finished its second play
      if (this.playCount === 2) {
        this.setState({ paused: true })
        this.passedProps.onEnd && this.passedProps.onEnd()
      } else {
        this.playCount++
      }
    }
  }

  /**
   * Cb on video load
   */
  onLoad = (data) => {
    // This fixes video resize by seeking to end of the video
    // Because the video resizes when it finishes the first time
    // console.log('onload data', data, this.props.source.uri)

    this.refs.video.seek(END_TIME)
    this.passedProps.onLoad && this.passedProps.onLoad()

    if (data.playableDuration === 0) { //somehow can't play
      this.retry()
    }
    // else {
         // this.setState({ showVideo: true })
    // }
  }

  retry = () => {
    this.setState({ showVideo: false, visible: false })
    setTimeout(()=> {
      this.setState({ visible: true })
    }, 100)
  }

  videoError = (err) => {
    const { source } = this.props
    console.log('video error', source, err)
    Mixpanel.trackWithProperties("Error", { error: err, source });
    //retry
    this.retry()
  }

  checkVisible = (visible) => {
    // console.log('check visible', visible, this.state.visible, this.props.source.uri)
    if (visible !== this.state.visible) {
      const update = { visible }
      if (!visible) update.showVideo = false
      this.setState(update)

      // console.log('set visible', update, this.props.source.uri)
    }
  }

  videoPlaying = (data) => {
    const { source } = this.props
    if (data.currentTime > 0 && !this.state.showVideo) {
      this.setState({ showVideo: true })
    }
    // console.log('progress', source.uri, data, this.state.showVideo, this.state.visible)
  }
  //
  // stalled = (data) => {
  //   console.log('stalled', this.props.source.uri, data, this.state.showVideo)
  // }
  // ready = (data) => {
  //   console.log('ready', this.props.source.uri, data, this.state.showVideo)
  // }

  // onLoadStart = () => {
    // setTimeout(()=> {
    //   this.setState({ showVideo: true })
    // }, 1000)
  // }

  preview = () => {
    const { source, style, previewImage } = this.props
    const { visible, showVideo, paused } = this.state

    const previewImgUrl = CloudinaryVideoThumbnail(source.uri)

    const otherStyle = {
      position: 'absolute',
      top: 0
    };

    let preview =  (
      <Image source={previewImage || {uri: previewImgUrl }} style={[style, otherStyle]}>
        <Image
          source={Images.ico_video_loading}
          style={Styles.videoIcon}/>
      </Image>
    )

    // console.log('render', visible, showVideo, preview)
    return preview
  }

  muteVideo = () => {
    this.setState({muted: true})
  }

  _toggleMute = () => {
    this.setState({muted: !this.state.muted})
  }

  _renderVideo = () => {
    const { source, style, visibleParent, hideMuteToggle } = this.props
    const { visible, showVideo, paused } = this.state

    const opts = { ...this.props }
    opts.style = [opts.style, { backgroundColor: 'transparent' }]
    const imgSource = this.state.muted ? Images.ico_mute : Images.ico_unmute;

    return visible?
      <View style={{opacity: showVideo ? 1 : 0}}>
        <Video
          ref='video'
          {...opts}
          muted={this.state.muted}
          paused={paused || !visibleParent}
          playInBackground={false}
          onEnd={this.onEnd}
          onLoad={this.onLoad}
          onProgress={this.videoPlaying}
          onError={this.videoError}
        />
        {hideMuteToggle? null :
          <TouchableOpacity style={styles.muteButtonContainer} onPress={this._toggleMute}>
            <Image source={imgSource} style={styles.muteButton}/>
          </TouchableOpacity>
        }

      </View>
      : <View style={style} />
  }

  render() {
    const { source, style } = this.props
    const { visible, showVideo, paused } = this.state

    return <InViewPort onChange={this.checkVisible}>
      {this.preview()}
      {this._renderVideo()}
    </InViewPort>
  }
}

let styles = {
  muteButton: {
    width: 20,
    height: 20,

  },
  muteButtonContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems:'center',
    justifyContent: 'center',
    bottom: 0,
    left: 0
  }
}