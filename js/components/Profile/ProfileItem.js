import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'

import InViewPort from 'react-native-inviewport'

import Flag from './Flag'
import Video from '../VideoPatchIos10'
import {Colors, Images, Styles} from '../../themes'
import { GetPreviewImageUrl } from '../../lib/utils'

export default class ProfileItem extends React.Component {

    constructor(props){
        super(props)
    }

    _renderMedal() {
        const { medal, item } = this.props

        if (medal == 0) {
            return (
                <Flag style={{position: 'absolute', right: 5}}>
                    <View style={{flexDirection: 'row', marginLeft: 10, marginTop: 9}}>
                        <Image source={require('image!smallWhiteClap')} style={{...styles.medal}}/>
                        <Text style={styles.medalText}>{this.props.item.clapCount}</Text>
                    </View>
                </Flag>
            )
        } else if (medal > 0 && medal < 3) {
            return (
                <View style={styles.medalContainer}>
                    <Image source={require('image!smallWhiteClap')} style={{...styles.medal}}/>
                    <Text style={styles.medalText}>{this.props.item.clapCount}</Text>
                </View>
            )
        }
        else {
            return null
        }
    }

    render() {
        let {isOddItem, item, medal} = this.props
        if (medal > -1) isOddItem = !isOddItem;
        let {width, height} = this.props.style

        const imageUrl = GetPreviewImageUrl(item, 'gif');
        let content = <Image source={{uri: imageUrl }} style={{width, height}}>
            {this._renderMedal()}
            {item.videoURL && <Image source={Images.ico_video} style={Styles.videoIcon} />}
        </Image>


        let marginLeft = (isOddItem) ? 0 : 0.5;
        let marginRight = (!isOddItem) ? 0 : 0.5;

        return (
            <View style={{...this.props.style, ...styles.container, marginLeft, marginRight}}>
                <TouchableOpacity onPress={this.props.onPress}>
                    {content}
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = {
    container: {
        backgroundColor: '#FFF',
        marginBottom: 1,
        overflow: 'hidden',
        //borderWidth:1,
        //borderColor: Colors.grey
    },
    medalContainer: {
        flexDirection: 'row',
        position: 'absolute',
        right: 10,
        top: 10,
        backgroundColor: '#569ee8',
        paddingLeft: 7,
        paddingRight: 7,
        paddingTop: 4,
        paddingBottom: 4,
        borderRadius: 45
    },
    medal: {
        width: 15,
        height: 14
    },
    medalText: {
        backgroundColor: 'transparent',
        color: '#ffffff',
        marginLeft: 4,
        fontWeight: 'bold',
        fontSize: 11
    }
}
