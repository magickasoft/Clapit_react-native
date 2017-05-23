import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    StatusBar
} from 'react-native'
import {STATUS_BAR_HEIGHT} from '../constants/Size'

import {Colors, Images} from '../themes'
import Video from './VideoPatchIos10'
import BackButton from './IntroNav/BackButton'
import NavigationBar from 'react-native-navbar'
import NavTitle from './IntroNav/NavTitle'

let { width, height } = Dimensions.get('window')
const POPUP_AUTOSHOW_POSTFIX = 'PopupShouldAutoShow';
export default class Profile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            TheoOn: '0', // default to false until fetch from Mixpanel
            items : [
                {
                    hashtag:'danceit',
                    live:true,
                    bubbleText: 'Live',
                    title: "#danceit Open Call",
                    infoText: 'Enter the #danceit open call for your chance to win a trip to NYC to shoot your professional dance reel! Just upload a 20 second video of your best moves to clapit with #danceit and get your friends to clap you to the top! Most claps wins.'
                },{
                    hashtag:'makemeamuse',
                    bubbleText: 'Winner: emscrib',
                    title: '#makemeamuse',
                    infoText: 'Thousands entered the #makemeamuse open call, uploading a selfie to show how they embraced their own kind of beauty. @emscrib was the winner - she won a trip to NYC, a 3-year contract with Muse Models NYC and is now the face of clapit!'
                }
            ],
            isScreenVisible:true
        }
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
      const routes = nextProps.navigationState.routes;
      const isScreenVisible = routes[routes.length-1].name === 'OpenCalls';
      this.setState({isScreenVisible});
    }


    _navigateToTrending(hashtag, infoText, title){
        const ht = hashtag.slice(1) + POPUP_AUTOSHOW_POSTFIX;
        this.props.navigator.push({name:'Best-' + hashtag, showInfoModal: this.props.preferences[ht], hashtag, title, infoText, ...this.props});
        this.props.setPreferences({[ht]: false})
    }

    _navigateToOpenCall(hashtag, infoText, title){
      const ht = hashtag.slice(1) + POPUP_AUTOSHOW_POSTFIX;
      this.props.searchFriends(hashtag, 0)
        this.props.navigator.push({name:'SearchResults', searchTerm:hashtag, showInfoModal: this.props.preferences[ht], infoText, title, hideSearchBar:true, topLimit: 10, ...this.props});
        this.props.setPreferences({[ht]: false})
    }

      _back() {
        this.props.navigator.pop()
      }

      _theoVideo = () => {        
        return <Video resizeMode="cover"
                source={{uri: 'Theo_clapit'}}
                rate={1.0}
                muted={false}
                paused={false}
                repeat={true}
                visibleParent={this.state.isScreenVisible}
                ref="video"
                previewImage={Images.theo_video_preview}
                style={{width , height: width}} />
      }

    render() {
      const singitInfoText = 'Enter the #singit open call for your chance to win a trip to NYC or LA and spend a day in the recording studio with Theophilus London! Just upload a 20 second video of you singing to clapit with #singit and get your friends to clap you to the top! Most claps wins.'
      let leftButton = <BackButton onPress={this._back.bind(this)}/>
      let title = <NavTitle>Select Open Call</NavTitle>

      return (
            <View style={{flex:1}}>
                <View>
                    <NavigationBar leftButton={leftButton} title={title} style={styles.navBar}/>
                </View>
                <ScrollView style={styles.container} scrollEventThrottle={50}>
                    <TouchableOpacity style={styles.topItem} onPress={this._navigateToTrending.bind(this, '#singit', singitInfoText, "#singit Open Call")}>
      
                      {this._theoVideo()}

                        <Text style={styles.hashtagText}>#singit Theophilus London</Text>
                        <View style={styles.statusBubble}>
                            <Text style={{color:Colors.purple, fontWeight:'bold', fontSize:14}}>Live</Text>
                        </View>


                    </TouchableOpacity>
                    {this.state.items.map(item =>
                      <TouchableOpacity
                        key={item.hashtag}
                        style={styles.item}
                        onPress={(item.live) ? this._navigateToTrending.bind(this, '#' + item.hashtag, item.infoText, item.title) : this._navigateToOpenCall.bind(this, '#' + item.hashtag, item.infoText, item.title)}>
                          <Image source={Images[item.hashtag]} style={styles.item}>
                              <Text style={styles.hashtagText}>#{item.hashtag}</Text>
                              <View style={styles.statusBubble}>
                                  <Text style={(item.live)?{color:Colors.purple, fontWeight:'bold', fontSize:14} : {color:'grey', fontWeight:'bold', fontSize:14}}>{item.bubbleText}</Text>
                              </View>
                          </Image>
                      </TouchableOpacity>
                    )}

                </ScrollView>
            </View>
        )
    }
}

const styles = {
    container: {
        flex: 1
    },
    topItem: {
        width: width,
        height: width,
        alignItems:'center',
        justifyContent: 'center'
    },
    item: {
        width: width,
        height: 1/2 * width,
        alignItems:'center',
        justifyContent: 'center'
    },
    hashtagText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textShadowColor:'black',
        textShadowOffset: {width:1,height:1},
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 35,
        left: 10
    },
    itemFooter: {
        opacity:0.6,
        backgroundColor: 'black',
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 60,
        width
    },
    statusBubble: {
        backgroundColor: 'white',
        opacity:0.8,
        position: 'absolute',
        bottom: 5,
        right: 10,
        width: 0.5 * width,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center'
    }
}
