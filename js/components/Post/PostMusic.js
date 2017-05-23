import React, { Component } from 'react';
import  {
    View,
    Text,
    Dimensions
} from 'react-native'

import WebBrowser from '../WebBrowser'

export default class PostMusic extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            currentUrl: undefined
        }
    }

    componentDidMount() {

    }

    _onNavigate(url) {
        this.setState({
            currentUrl: url
        })
    }

    _onClap(url) {
      let { parentNavigator } = this.props

      parentNavigator.push({
        name: 'Share',
        shareType: 'url',
        data: {
          url
        }
      }, true)
    }

    render() {

        return (
            <WebBrowser
                defaultUrl="https://soundcloud.com"
                onNavigate={this._onNavigate.bind(this)}
                style={styles.container}
                showClap={true}
                onClap={this._onClap.bind(this)}
            />
        )
    }
}

const styles = {
    container: {
        flex: 1,
        marginTop: 20,
        flexDirection: 'column'
    }
}
