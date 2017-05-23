import React, { Component } from 'react';
import  {
        StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Animated,
    LayoutAnimation
} from 'react-native'

export default class ClapitLoading extends Component {
    constructor(props) {
        super(props)
        this.state = { bounceValue: new Animated.Value(0) }
    }

    componentWillMount() {
        let { skipLayout = false } = this.props

        if (!skipLayout) {
            LayoutAnimation.linear()
        }
    }

    render() {
        let { bounceValue } = this.state

        return (
            <View style={[styles.view, {opacity: 1.0}]}>
                <View style={styles.backgroundView}></View>
                <View style={styles.imageContainer}>
                    <Animated.Image
                        source={require('image!ico_clapit_clap')}
                        style={{
              marginTop: -30,
              width: 120,
              height: 120,
              transform: [
                { scale: bounceValue }
              ]
            }}/>
                </View>
            </View>
        )
    }

    componentDidMount() {
        this._startAnimation()
    }

    _startAnimation() {
        this.state.bounceValue.setValue(0.3)

        Animated.timing(this.state.bounceValue, {
            toValue: 0.5
        }).start(data => {
            if (data.finished) {
                Animated.timing(this.state.bounceValue, {
                    toValue: 0.3
                }).start(data => {
                    if (data.finished) {
                        this._startAnimation()
                    }
                })
            }
        })
    }
}

const styles = StyleSheet.create({
    view: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0
    },
    backgroundView: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'lightgray',
        opacity: 0.35,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
