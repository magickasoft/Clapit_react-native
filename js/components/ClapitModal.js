import React, { Component } from 'react';
import  {
    View,
    Text,
    Dimensions,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView
} from 'react-native'

import {Images, Colors} from '../themes'
import {respPixels, RESP_RATIO} from '../lib/responsiveUtils'
import ParsedText from 'react-native-parsed-text'

let { width, height } = Dimensions.get('window')

export default class ClapitModal extends React.Component {
    constructor(props) {
        super(props)
    }

    _closeModal = () =>{
        this.props.onClose && this.props.onClose();
    }

  _renderUserTag = (match, matches) => {
    // matches[1] contains tag without @ at the beginning
    const username = matches[1];
    return (<Text style={styles.tag}>@{username}</Text>);
  }

  _renderHashTag = (match, matches) => {
    // matches[1] contains tag without hash at the beginning
    let hash = matches[1];
    hash = '#' + hash
    return (<Text style={styles.tag}>{hash}</Text>);
  }

    render() {
        const { showModal, infoText } = this.props

        return (
            <Modal
              animationType={"fade"}
              transparent={true}
              visible={showModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.opaqueModal}>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity style={styles.closeButton} onPress={this._closeModal}>
                                <Image source={require('image!btn_close')}/>
                            </TouchableOpacity>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalHeaderText}></Text>
                            </View>

                        </View>

                        <ScrollView style={styles.innerBox}>
                          <ParsedText allowFontScaling={false} style={{fontSize: 20 * RESP_RATIO}} parse={[
                            {pattern: /#(\w+)/, renderText: this._renderHashTag},
                            {pattern: /@(\w+)/, renderText: this._renderUserTag}
                          ]}>
                            {infoText}
                          </ParsedText>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        )
    }
}

const styles = {
  opaqueModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius:20
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 100,
    marginLeft: 10 * RESP_RATIO,
    marginRight: 10 * RESP_RATIO,

  },
  innerBox: {
    marginLeft: 25 * RESP_RATIO,
    marginRight: 25 * RESP_RATIO,
    marginBottom: 25 * RESP_RATIO
  },
  closeButton: {
    width: 50 * RESP_RATIO,
    height: 50 * RESP_RATIO,
    paddingLeft: 10 * RESP_RATIO,
    paddingTop: 10 * RESP_RATIO,
    flex: 0.2
  },
  modalHeader:{
    flex: 0.8,
    marginTop: 20
  },
  tag: {
    color: '#B385FF'
  },
}
