import React, { Component } from 'react';
import  {
    View,
    Image,
    TouchableHighlight
} from 'react-native'

import Video from 'react-native-video'

export default class MediaItem extends React.Component {
    render() {
        let media = null
        if(this.props.media.type == 'ALAssetTypeVideo') {
            media = <Video resizeMode="cover" source={{uri: this.props.media.uri}}
                       rate={1.0} muted={true} repeat={false} paused={false}
                       style={{width: this.props.style.width, height: this.props.style.width }} />
        }
        else {
            media = <Image resizeMode="cover" source={{uri: this.props.media.uri}}
                        style={{width: this.props.style.width, height: this.props.style.width}}/>
        }

        return(
            <View style={{...this.props.style, ...styles.container}}>
                <TouchableHighlight onPress={()=>this.props.onMediaSelected(this.props.media.uri)}>
                    {media}
                </TouchableHighlight>
            </View>
        )
    }
}

const styles = {
    container: {
        borderWidth: 0,
        overflow: 'hidden'
    }
}
