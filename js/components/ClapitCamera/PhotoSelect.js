import React, { Component } from 'react';
import  {
  TouchableOpacity,
  Image,
  NativeModules,
  ActionSheetIOS,
  CameraRoll,
  Dimensions
} from 'react-native'

let { ImagePickerManager, AssetHelperManager } = NativeModules
let { height:deviceHeight } = Dimensions.get('window')
import ImagePicker from 'react-native-image-crop-picker';

export default class PhotoSelect extends React.Component {

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
     CameraRoll.getPhotos({
      first: 1,
      assetType: 'Photos',
      groupTypes: 'SavedPhotos'
    }).then(data => {
      if (data.edges) {
        const asset = data.edges[0]
        this.setState({galleryThumbnail: asset.node.image.uri})
      }
    }).catch(() => {})

  }

  _handleImagePickerResponse(response) {
    if (!response.error && !response.didCancel) {
      const content = response.path || response.uri
      let video = (! /^.*(gif|jpg|jpeg|png)$/.test(content)) ? content : undefined

      this.props.onSelected(content, video)
    }
  }

  _onPhotoSelect() {
    const { photoOnlySelect } = this.props

    let options;
    if (! photoOnlySelect){
      //using react-native-image-crop-picker as it handles video compression more reliably on different devices
      options = {
        compressVideo: true
      }
      ImagePicker.openPicker(options).then(this._handleImagePickerResponse.bind(this)).catch((err) => {
        console.log(err)
      });
    } else {
      //using react-native-image-picker as it passes through gifs and doesn't convert them to jpegs
      options = {
        mediaType:'image',
        noData: true,
        storageOptions: {
          skipBackup: true,
          path: 'content'
        }
      }
      ImagePickerManager.launchImageLibrary(options, this._handleImagePickerResponse.bind(this))
    }
  }

  render() {
    return (
      <TouchableOpacity style={styles.photoSelector} onPress={this._onPhotoSelect.bind(this)}>
        { this.state.galleryThumbnail ? (
          <Image source={{uri: this.state.galleryThumbnail}} resizeMode="cover" style={{width: 56, height: 56}}/>
        ) : null}
      </TouchableOpacity>
    )
  }

}

const styles = {
  photoSelector: {
    marginTop: -63,
    marginRight: 210,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 5,
    width: 60,
    height: 60
  }
}