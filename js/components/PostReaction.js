import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TextInput,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Dimensions,
    NativeModules
} from 'react-native'
import dismissKeyboard from 'react-native-dismiss-keyboard'
import TagAutocompleteInputContainer from '../containers/TagAutocompleteInputContainer'
import { Images } from '../themes'
let { width, height } = Dimensions.get('window')
let { RNMixpanel:Mixpanel } = NativeModules

export default class PostReaction extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            comment: '',
            reaction: null
        }
    }

    _onTakePhoto() {
        dismissKeyboard()
        Mixpanel.track("Reaction Selfie");
        this.props.onTakeReactionPhoto()
    }

    _onPostReaction() {
        dismissKeyboard();
        //don't submit empty comment
        if (!this.state.comment || !this.state.comment.trim()){
            return;
        }

        this.props.onPostReaction({comment: this.state.comment, reaction: this.state.reaction})
        this.setState({ comment: '', reaction: null })
        this.refs.tagsAutocomplete.getWrappedInstance().clear();
    }

    _onCommentChange(e) {
        let { text:comment } = e.nativeEvent
        this.setState({ comment: comment })
    }

    setReaction(reaction) {
        if(typeof reaction !== 'object' && !reaction.comment) return;

        this.setState({
            reaction,
            comment: reaction.comment
        })

        this.refs.tagsAutocomplete.refs.wrappedInstance.setComment(reaction.comment)
    }

    render() {
        let { reactionImage, tags, fetchHashtags } = this.props

        return (

            <View style={[styles.container, { bottom: this.props.contentOffset }]} onLayout={this.props.onLayout}>

                <TagAutocompleteInputContainer
                  ref="tagsAutocomplete"
                  onChange={this._onCommentChange.bind(this)}
                />
                <View style={styles.buttonsContainer}>
                    <TouchableWithoutFeedback onPress={this._onPostReaction.bind(this)}>
                        <View><Text style={styles.postButtonText}>Post</Text></View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this._onTakePhoto.bind(this)}>
                        {
                            reactionImage ?
                                <Image source={{ uri: reactionImage }} style={styles.reactionImage}/>
                                :
                                <Image source={Images.reaction_smiley} style={styles.reactionImage}/>
                        }
                    </TouchableWithoutFeedback>
                </View>
            </View>
        )
    }
}

const styles = {
    container: {
        // Works with keyboard layout
        position: 'absolute',
        left: 0,
        width: (width),

        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderTopWidth: 0.5,
        borderTopColor: '#F0F0F0',
        backgroundColor: 'white'
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        paddingRight: 15,
        backgroundColor: 'white'
    },
    postButtonText: {
        flex: 0.2,
        fontSize: 15,
        color: '#B385FF',
        marginLeft: 10,
        marginRight: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 20
    },
    reactionImage: {
        flex: 0.2,
        width: 32,
        height: 34,
        marginLeft: 15
    }
}
