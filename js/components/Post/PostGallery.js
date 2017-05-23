import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    ListView,
    ScrollView,
    CameraRoll,
    Dimensions,
    NativeModules,
    Alert,
    TouchableHighlight,
    ActionSheetIOS,
    TouchableOpacity
} from 'react-native'

import MediaItem from './MediaItem'
import {Colors, Images} from '../../themes'
const {ImagePickerManager, AssetHelperManager, RNMixpanel:Mixpanel} = NativeModules

import ImagePicker from 'react-native-image-crop-picker';

let { width, height } = Dimensions.get('window')

let MEDIAS_COUNT_BY_FETCH = 21;

export default class PostGallery extends React.Component {
    constructor(props){
        super(props)

        var ds = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 != r2
        })

        this.lastMediaFetched = undefined; // Using `null` would crash ReactNative CameraRoll on iOS.
        this.state = {
            dataSource: ds,
            isLoadingMore: false,
            medias: []
        }
    }

    componentDidMount() {
      this._fetchMedias()
    }

    componentWillReceiveProps(nextProps) {

        if(! nextProps.post.fetchingMedias) {
            if(nextProps.post.medias) {
                const newMedias = this._getPhotosFromCameraRollData(nextProps.post.medias);

                let { medias:currentMedias } = this.state
                let medias = currentMedias.concat(newMedias)

                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(medias),
                    newMedias,
                    isLoadingMore: false
                })

                if (medias.length)
                    this.lastMediaFetched = medias[medias.length - 1].uri;
            }
        }
    }

    _getPhotosFromCameraRollData(data) {
        return data.edges.map((asset) => {
          return {
              uri: asset.node.image.uri,
              type: asset.node.type
          }
        });
    }

    _fetchMedias(count = MEDIAS_COUNT_BY_FETCH, after) {
        if(!this.props.post.fetchingMedias) {
            this.props.fetchMedias(count, after)
        }
    }

    _onMediaSelected(uri) {
      this.props.callback(uri)
    }

    _handleImagePickerResponse(response) {
        const {navigator} = this.props
        //we use 2 different pickers with different responses for video and images
        let content = response.path || response.uri
        if (!content){
            Mixpanel.trackWithProperties("Error", { error: 'image picker: no content' });
            return;
        }

        if (content.toLowerCase().indexOf('jpg') > -1 || content.toLowerCase().indexOf('png') > -1) {
            AssetHelperManager.saveTmpImage(content, (err, res) => {
                let { image, orientation } = res
                navigator.replace({ name: 'Share', shareType: 'image', data: { image: content, orientation } })
            })
        } else if (content.toLowerCase().indexOf('gif') > -1) {
            navigator.replace({ name: 'Share', shareType: 'gif', data: { image: content, orientation: 'portrait' } })
        } else { // video
            navigator.replace({ name: 'Share', shareType: 'video', data: { video: content, image:'', orientation: 'portrait' } })

        }
    }

    _onPressMore(mediaType) {
        let options;
        if (mediaType === 'video'){
            //using react-native-image-crop-picker as it handles video compression more reliably on different devices
            options = {
                compressVideo: true,
                smartAlbums: ['Videos']
            }
            ImagePicker.openPicker(options).then(this._handleImagePickerResponse.bind(this)).catch((err) => {
                console.log(err)
                Mixpanel.trackWithProperties("Error", { error: 'image picker did not return ' + mediaType, data: err, mediaType });
            });
        } else {
            //using react-native-image-picker as it passes through gifs and doesn't convert them to jpegs
            options = {
                mediaType,
                noData: true,
                storageOptions: {
                    skipBackup: true,
                    path: 'content'
                }
            }
            ImagePickerManager.launchImageLibrary(options, this._handleImagePickerResponse.bind(this))
        }
    }

    _renderRow(media) {
        const width = Dimensions.get('window').width

        const itemSize = (width / 3)

        return(
            <MediaItem media={media}
                onMediaSelected={this._onMediaSelected.bind(this)}
                style={{...styles.mediaItem, width: itemSize, height: itemSize}} />
        )
    }

    render() {
        return (
          <View style={styles.container}>
              <TouchableOpacity style={[styles.chooseButton, {marginTop: 50}]} onPress={this._onPressMore.bind(this, 'video')}>
                  <Image source={Images.choose_video} style={styles.chooseImage}></Image>
                  <Text style={styles.chooseText}>Share your best videos under 20 seconds</Text>
              </TouchableOpacity>
              <View style={styles.buttonSeparator}/>
              <TouchableOpacity style={styles.chooseButton} onPress={this._onPressMore.bind(this, 'photo')}>
                  <Image source={Images.choose_photo} style={styles.chooseImage}></Image>
              </TouchableOpacity>
          </View>

        )
    }
}

const styles = {
    error: {
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorText: {
      fontSize: 16,
      paddingLeft: 50,
      paddingRight: 50,
      paddingBottom: 20,
      textAlign: 'center'
    },
    container: {
        flex:1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'white'
    },
    chooseText: {
        textAlign: 'center',
        color: Colors.purple,
        fontSize: 12
    },
    chooseImage: {
        width: 120,
        height: 120
    },
    chooseButton: {
        flex:0.45,
        width: width - 30,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20
    },
    buttonSeparator: {
        height: 1,
        width: width - 30,
        backgroundColor: Colors.purple
    },

}
