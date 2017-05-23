import React, { Component } from 'react';
import  {
        Navigator
} from 'react-native'

import IntroVideo from './IntroNav/IntroVideo'
import Login from './IntroNav/Login'
import LegalWebView from './IntroNav/LegalWebView'
import EditProfileContainer from '../containers/EditProfileContainer'
import ClapitCamera from './ClapitCamera'
import IntroCarousel from './IntroCarousel'

let BaseConfig = Navigator.SceneConfigs.HorizontalSwipeJump
let CustomSceneConfig = Object.assign({}, BaseConfig, {
    springFriction: 12
})

export default class IntroNav extends Component {
    constructor(props) {
        super(props)

        this._onWillFocus = this._onWillFocus.bind(this)

        this.state = { paused: false }
    }

    _renderScene(route, navigator) {
        let { name, index, ...extraProps } = route
        let { paused } = this.state

        let routeNameArray = name.split('-')
        let routeName = routeNameArray[0]

        if (routeNameArray.length > 1) {
            Object.assign(extraProps, { [routeNameArray[1]]: true })
        }

        switch (routeName) {
            case 'IntroVideo':
                return (<IntroVideo
                  navigator={navigator}
                  parentNavigator={this.props.parentNavigator}
                  paused={paused}
                  muted={false}
                  uri='clapit-intro'
                  rightButtonText='SKIP'
                  rightButtonNavigateTo='IntroCarousel'
                  leftButtonVisible={false}
                  {...extraProps} />)
            case 'Login':
                return (<Login navigator={navigator} parentNavigator={this.props.parentNavigator} {...extraProps} {...this.props} />)
            case 'LegalWebView':
                return (<LegalWebView navigator={navigator} {...extraProps} />)
            case 'EditProfileContainer':
                return (<EditProfileContainer navigator={this.props.parentNavigator} {...extraProps} {...this.props} />)
            case 'ClapitCamera':
                return (<ClapitCamera navigator={navigator} {...extraProps}  />)
            case 'IntroCarousel':
                return (<IntroCarousel navigator={navigator} parentNavigator={this.props.parentNavigator} {...extraProps}  />)
        }
    }

    render() {
        return (
            <Navigator
                initialRoute={{name: this.props.overrideRouteName || 'IntroVideo', index:0}}
                renderScene={this._renderScene.bind(this)}
                configureScene={(route, routeStack) => ({
          ...CustomSceneConfig,
          gestures: false
        })}
                onWillFocus={this._onWillFocus}
            />
        )
    }

    _onWillFocus(route) {
        let { paused } = this.state
        let { name } = route

        if (name == 'IntroVideo') {
            this.setState({ paused: false })
        } else {
            this.setState({ paused: true })
        }
    }
}
