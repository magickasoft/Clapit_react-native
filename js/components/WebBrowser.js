import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    WebView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Keyboard,
    Dimensions,
    NativeModules,
    requireNativeComponent
} from 'react-native'

import ClapitButtonContainer from '../containers/ClapitButtonContainer'

let { RNMixpanel:Mixpanel } = NativeModules

export default class WebBrowser extends React.Component {
    constructor(props) {
        super(props)

        let defaultUrl = undefined
        if (props.defaultUrl)
            defaultUrl = props.defaultUrl

        this.state = {
            backButtonEnabled: false,
            forwardButtonEnabled: false,
            addressInput: defaultUrl,
            url: defaultUrl
        }
        this._onNavigationStateChange = this._onNavigationStateChange.bind(this)
        this._renderTopBar = this._renderTopBar.bind(this)
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    _addressChange(e) {
        let { text:url } = e.nativeEvent
        this.setState({ addressInput: url })
    }

    _onNavigationStateChange(navState) {
        const { canGoBack, canGoForward, url, type } = navState

        if (type !== 'error') {
            this.setState({
                backButtonEnabled: canGoBack,
                forwardButtonEnabled: canGoForward,
                addressInput: url,
                url
            })
        }
    }

    _goBack() {
        if (this.state.backButtonEnabled) {
            this.refs.webView.goBack()
        }
    }

    _goFoward() {
        if (this.state.forwardButtonEnabled) {
            this.refs.webView.goForward()
        }
    }

    _onSubmitTextInput() {
        let { addressInput:url } = this.state
        if (!/^[a-zA-Z-_]+:/.test(url)) {
            url = 'http://' + url
        }
        this.setState({ url })
        if (this.props.onNavigate) {
            this.props.onNavigate(url)
        }
    }

    _renderTopBar() {
        if (this.props.hideTopBar) {
            return null
        }
        else {
            return (
                <View style={styles.topbar}>
                    <Image
                        style={styles.logo}
                        resizeMode={Image.resizeMode.contain}
                        source={require('image!clapitLogo')}/>
                    <TextInput
                        autoCapitalize='none'
                        keyboardType='url'
                        selectTextOnFocus={true}
                        onChange={this._addressChange.bind(this)}
                        onSubmitEditing={this._onSubmitTextInput.bind(this)}
                        style={styles.urlTextInput}
                        value={this.state.addressInput}
                        blurOnSubmit={true}
                        ref='urlTextInput'
                        placeholder="Enter an url"/>
                </View>
            )
        }
    }

    _doClap() {
        let { onClap } = this.props
        let { url } = this.state
        Mixpanel.track("Clap");
        onClap(url)
    }

    render() {
        let screenHeight = Dimensions.get('window').height
        let { showClap } = this.props

        return (
            <View style={styles.container}>
                {this._renderTopBar()}
                <WebView ref="webView"
                           automaticallyAdjustContentInsets={false}
                           style={[styles.webView, {height: screenHeight - 120}]}
                           source={{uri: this.state.url}}
                           onNavigationStateChange={this._onNavigationStateChange}
                />
                { showClap ? (
                    <View style={styles.clapButton}>
                        <ClapitButtonContainer
                            style={{width: 50, height: 50, borderRadius: 25}}
                            pressInScale={1.5}
                            onClap={this._doClap.bind(this)}
                            showClapCount={false}
                        />
                    </View>
                ) : null }
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    webView: {
        flex: 0.6
    },
    topbar: {
        flex: 0.20,
        height: 50,
        flexDirection: 'column',
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logo: {
        marginTop: 20,
        flex: 0.60,
        width: 120,
        height: 32,
        tintColor: '#B289FC'
    },
    urlTextInput: {
        flex: 0.3,
        color: '#000',
        backgroundColor: '#E4E5E6',
        borderRadius: 5,
        fontSize: 16,
        fontWeight: 'bold',
        padding: 10,
        margin: 10
    },
    navButton: {
        flex: 0.25,
        height: 40,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    clapButton: {
        position: 'absolute',
        width: 50, height: 50, top: 20, right: 10
    }
}
