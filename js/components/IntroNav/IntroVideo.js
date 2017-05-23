import React, { Component } from 'react';
import  {
  AppRegistry,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  View,
  TouchableOpacity
} from 'react-native'
import { Images } from '../../themes'
import Video from 'react-native-video'
let { width } = Dimensions.get('window')

export default class IntroVideo extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let { paused, uri, text, rightButtonNavigateTo, rightButtonText, leftButtonVisible, muted, highlightedText} = this.props

    let opacity = (rightButtonText) ? {opacity:1}: {}
    return (
      <View style={styles.view}>
        <Video source={{uri}}
               resizeMode="cover"
               rate={1.0}
               muted={muted}
               style={styles.video}
               repeat={true}
               paused={paused} />
        <View style={styles.blankView}>
          {text ? <Image source={Images.purple_box_tutorial} style={styles.textBubble}>
            <Text style={styles.textBubbleText}>{text}
              {(highlightedText)? <Text style={[styles.textBubbleText, {fontStyle: 'italic'}]}>{highlightedText}</Text> : null }
            </Text>

          </Image>
          : null }

        </View>
        <View style={styles.buttonView}>
          {leftButtonVisible ? <View style={styles.buttonSignIn}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={this._onPressLogin.bind(this, 'signIn')}>
              <Text style={styles.buttonText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
            : null}
          <View style={styles.buttonSignUp}>
            <TouchableOpacity style={[styles.touchableOpacity, opacity]} onPress={this._onPressLogin.bind(this, 'signUp', rightButtonNavigateTo)}>
              <Text style={styles.buttonText}>{rightButtonText ? rightButtonText : 'SIGN UP'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  _onPressLogin(signInOrSignUp, rightButtonNavigateTo) {
    let { navigator, parentNavigator } = this.props

    let name = `Login-${signInOrSignUp}`
    if (signInOrSignUp === 'signUp' && rightButtonNavigateTo){
      if (rightButtonNavigateTo === 'pop'){
        setTimeout(()=>{
          parentNavigator.pop();
        },100)
        return;

      }
      name = rightButtonNavigateTo;
    }

    navigator.push({
      name,
      index: 1
    })
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  video: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  blankView: {
    flex: 0.91,
    alignItems: 'flex-end',
    flexDirection: 'row'
  },
  buttonView: {
    flex: 0.09,
    flexDirection: 'row',
    opacity: 0.8
  },
  button: {
  },
  buttonSignIn: {
    flex: 0.5,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6
  },
  buttonSignUp: {
    flex: 0.5,
    backgroundColor: '#777',
    opacity: 0.6
  },
  touchableOpacity: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 21,
    opacity:1
  },
  textBubble: {
    opacity : 0.8,
    height: 100,
    margin: 10,
    padding: 10,
    width: width - 20,
    justifyContent: 'center'
  },
  textBubbleText: {
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign:'center',
    opacity:1
  }
})
