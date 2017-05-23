import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableWithoutFeedback,
    Dimensions,
    NativeModules
} from 'react-native'

import PostGallery from '../containers/PostGalleryContainer'
import ClapitCamera from './ClapitCamera'
import SimpleTabs from './SimpleTabs'

const { RNMixpanel:Mixpanel } = NativeModules


export const POST_MEDIA = 'POST_MEDIA'
export const POST_CAPTURE = 'POST_CAPTURE'
export const POST_CAPTURE_VIDEO = 'POST_CAPTURE_VIDEO'
export const POST_CAPTURE_GIF = 'POST_CAPTURE_GIF'

export default class Post extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedTab: this.props.defaultTab || 'captureVideo',
            willFocusTab: this.props.defaultTab || 'captureVideo',
            cameraOn: false
        }
    }

    componentDidMount() {

    }

    _renderScene(key) {
        let { willFocusTab } = this.state

        switch (key) {
            case 'gallery':
                return willFocusTab == 'gallery' ?
                    (<PostGallery style={styles.tabContent}
                                  callback={this._onContentSelected.bind(this, POST_MEDIA)}
                                  navigator={this.props.parentNavigator}/>) :
                    (<View></View>)
            case 'capture':
                return willFocusTab == 'capture' ?
                    (<ClapitCamera style={styles.tabContent}
                                   embedded={true}
                                   callback={this._onContentSelected.bind(this, POST_CAPTURE)}
                                   showCancel={false}
                                   navigator={this.props.parentNavigator}/>) :
                    (<View></View>)
            case 'captureVideo':
                return willFocusTab == 'captureVideo' ?
                  (<ClapitCamera style={styles.tabContent}
                                 embedded={true}
                                 captureVideo={true}
                                 callback={this._onContentSelected.bind(this, POST_CAPTURE_VIDEO)}
                                 showCancel={false}
                                 navigator={this.props.parentNavigator}/>) :
                  (<View></View>)
            case 'captureGif':
                return willFocusTab == 'captureGif' ?
                  (<ClapitCamera style={styles.tabContent}
                                 embedded={true}
                                 captureGif={true}
                                 callback={this._onContentSelected.bind(this, POST_CAPTURE_GIF)}
                                 showCancel={false}
                                 navigator={this.props.parentNavigator}/>) :
                  (<View></View>)
        }
    }


    _onContentSelected(type, content, video) {
        this.props.onContentSelected(type, content, video)
    }


    _onChangeTab(tabName) {
        Mixpanel.trackWithProperties("Select Post Type", { type: tabName});
        this.setState({
            selectedTab: tabName
        })
        setTimeout(() => {
            this.setState({ willFocusTab: tabName })
        },50);
    }

    _onCancelPressed() {
        this.props.parentNavigator.pop()
    }

    render() {
        return (
            <View style={styles.container}>
                {this._renderScene.bind(this)(this.state.selectedTab)}

                <TouchableWithoutFeedback onPress={this._onCancelPressed.bind(this)}>
                    <Image style={{position: 'absolute', top: 20, left: 20}} source={require('image!btn_close')}/>
                </TouchableWithoutFeedback>
                <SimpleTabs style={styles.tabBar} selected={this.state.selectedTab}
                            underlineColor='#B289FC' onSelect={el => this._onChangeTab(el.props.name)}>
                    <View style={styles.tabItem} selectedStyle={styles.tabSelected} name="captureVideo">
                        <Image style={{width:28,height:22}}
                               source={this.state.selectedTab == "captureVideo" ? require('image!ico_violet_web') : require('image!ico_grey_web')}/>
                    </View>
                    <View style={styles.tabItem} selectedStyle={styles.tabSelected} name="captureGif">
                        <Image style={{width:30,height:30}}
                               source={this.state.selectedTab == "captureGif" ? require('image!ico_violet_podcast') : require('image!ico_grey_podcast')}/>
                    </View>
                    <View style={styles.tabItem} selectedStyle={styles.tabSelected} name="capture">
                        <Image style={{width:35,height:32}}
                               source={this.state.selectedTab == "capture" ? require('image!ico_violet_camera') : require('image!ico_grey_camera')}/>
                    </View>
                    <View style={styles.tabItem} selectedStyle={styles.tabSelected} name="gallery">
                        <Image style={{width:30,height:30, resizeMode: 'contain'}}
                            source={this.state.selectedTab == "gallery" ? require('image!ico_violet_image') : require('image!ico_grey_image')}/>
                    </View>
                </SimpleTabs>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: '#FFF',
        height: 60,
        bottom: 0
    },
    tabItem: {
        alignSelf: 'stretch',
        alignItems: 'center',
        padding:10
    },
    tabSelected: {},
    tabContent: {
        marginBottom: 60
    }
}
