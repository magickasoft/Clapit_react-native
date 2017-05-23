import React, { Component } from 'react';
import  {
        StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    LayoutAnimation,
    NativeModules
} from 'react-native'

let { ClapSoundManager, RNMixpanel:Mixpanel } = NativeModules

// taken from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16)
            .slice(1);
}

export default class ClapitButton extends Component {

    constructor(props) {
        super(props)

        this.state = {
            scale: new Animated.Value(1),
            shareButtonPositions: [new Animated.Value(0), new Animated.Value(0)]
        }
        this._renderClapCount = this._renderClapCount.bind(this)
        this._getClaps = this._getClaps.bind(this)
        this._isClapped = this._isClapped.bind(this)
    }

    _getBackgroundColor(clapCount, clapped) {
        if (clapCount >= 50) {
            return clapped ? '#b385ff' : shadeColor2('#b385ff', 0.5)
        }
        if (clapCount >= 10) {
            return clapped ? '#4cd5ce' : shadeColor2('#4cd5ce', 0.5)
        }
        return clapped ? '#579fe7' : shadeColor2('#579fe7', 0.5)
    }

    _onPressIn() {
        let { pressInScale = 1.5, onClap, disabled = false } = this.props
        if (disabled) {
            return
        }

        ClapSoundManager.playClap()

        Animated.timing(this.state.scale, {
            toValue: pressInScale,
            duration: 50
        }).start(() => {
            if (onClap) {
                onClap()
            }
            this._doClap()
        })
    }

    _onPressOut() {
        let { disabled = false } = this.props
        if (disabled) {
            return
        }
        Animated.spring(this.state.scale, {
            toValue: 1.0,
            friction: 4
        }).start()
    }

    _doClap() {
        let { postItem, clapPost,  clapitAccountData, unauthenticatedAction } = this.props
        if (_.isEmpty(clapitAccountData)) {
            unauthenticatedAction && unauthenticatedAction();
            return;
        }

        if (postItem) {
            // if the post is not clapped
            if (!this._isClapped()) {

                Mixpanel.trackWithProperties("Clap", { postId: postItem.id });

                // for hash tag search update clap count
                if (this.props.postType === 'hash-tag') {
                    this.props.postItem.clapCount += 1
                    this.forceUpdate()
                }
                // perform clap post action
                clapPost(postItem.id, this._isClapped())
            }else {
                Mixpanel.trackWithProperties("Unclap", { postId: postItem.id });
            }
        }
    }

    _getClaps() {
        let result = 0

        switch (this.props.postType) {
            case 'hash-tag':
                result = this.props.postItem.clapCount
                break
            default:
                if (this.props.postItem) {
                    result = this.props.claps[this.props.postItem.id] || 0
                }
        }

        return result
    }

    _isClapped() {
        return this.props.postItem && this.props.myClaps.indexOf(this.props.postItem.id) > -1
    }

    _renderClapCount() {
        if (this.props.showClapCount) {
            return (<Text style={styles.clapsText}>{this._getClaps()}</Text>)
        } else {
            return null
        }
    }

    render() {

        let { style } = this.props
        let clapped = this._isClapped()
        let clapCount = this._getClaps()
        let { borderRadius, ...mainStyle } = style
        let backgroundColor = this._getBackgroundColor(clapCount, clapped)

        return (
            <View style={styles.clapInfo}>
                <View style={[styles.view, mainStyle]}>
                    <View style={styles.innerView}>
                        <Animated.Image
                            source={require('image!clapButtonForTint')}
                            style={[styles.backgroundImage, mainStyle, { backgroundColor, borderRadius, transform: [{scale: this.state.scale}]}]}
                        />
                        <TouchableWithoutFeedback
                            style={styles.touchableForegroundImage}
                            onPressIn={this._onPressIn.bind(this)}
                            onPressOut={this._onPressOut.bind(this)}
                            delayLongPress={200}>
                            <Animated.Image
                                source={require('image!clapBlackOutline')}
                                style={[styles.foregroundImage, mainStyle, {borderRadius, transform: [{scale: this.state.scale }]}]}
                            />
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                {this._renderClapCount()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {},
    innerView: {
        position: 'absolute'
    },
    backgroundImage: {},
    touchableForegroundImage: {
        position: 'absolute',
        top: 0
    },
    foregroundImage: {
        position: 'absolute',
        top: 0
    },
    clapsText: {
        color: '#4DD6CF',
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 10,
        backgroundColor: 'transparent'
    },
    clapInfo: {
        alignItems: 'center'
    }
})
