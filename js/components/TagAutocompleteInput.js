import React, { Component } from 'react';
import  {
  TextInput,
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated
} from 'react-native'


import MentionCompleter from 'mention-completer'
import ClapitLoading from './ClapitLoading'
import {Images} from '../themes'
import dismissKeyboard from 'react-native-dismiss-keyboard'

import {SEARCHBOX_HEIGHT} from '../constants/Size'
let { width, height } = Dimensions.get('window')

export default class TagAutocompleteInput extends React.Component {
  constructor(props, context) {
    super(props)

    //this.tags = context.store.getState().tags

    this.state = {
      value: props.value || '',
      showAutocomplete: false,
      showHashtagsLoading:false,
      autocompleteContent: null
    }
    this.debounceTimeout = null;
    this.showAutocompleteTimeout = null;
  }

  componentDidMount(){

    function createMatchUI(value, type) {
      if (!componentThis.props.fetchHashtags) return;

      if (type !== 'hashtag' || ! value) {
        componentThis.setState({
          showAutocomplete : false,
          autocompleteContent: null
        });
        return;
      }

      componentThis.props.fetchHashtags(value.substr(1))
      componentThis.setState({
        showAutocomplete:true,
        showHashtagsLoading:true
      })

    }

    let componentThis = this;


    this.completer = new MentionCompleter({
      patterns: {
        username: /(@[\w]+)\b/,
        hashtag: /(#[\w]+)\b/,
      },
      getValue: function (cb) {
        setTimeout(() => {
          cb(null, componentThis.state.value)
        },50)

      },
      setValue: function (value) {},
      getSelectionRange: function (cb) {
        setTimeout(() => {
          cb(null, {
            start: componentThis.state.value.length,
            end: componentThis.state.value.length
          })
        },50)

      },
      setSelectionRange: function (range) {}
    })
      .on('nomatch', createMatchUI)
      .on('match', function (match) {
        createMatchUI(match.value, match.type)
      })
  }

  componentWillReceiveProps(newProps){
    if (! newProps.tags || ! newProps.tags.hashtags || this.props.tags.hashtags === newProps.tags.hashtags){
      return;
    }
    let tagsForAutocomplete = newProps.tags.hashtags.slice(0, 4).map(tag => {return (tag.length > 40)? tag.substr(0, 40 ) + '...': tag});
    let content  = tagsForAutocomplete.map((tag) => {
      return  <TouchableOpacity style={styles.autocompleteItem} key={tag} onPress={this._onMatchSelected.bind(this, tag)}>
        <Text style={styles.autocompleteItemText}>{tag}</Text>
      </TouchableOpacity>
    })

    this.setState({
      showAutocomplete :  this.state.value && tagsForAutocomplete.length,
      autocompleteContent: content,
      showHashtagsLoading:false
    });
    if (this.state.value && tagsForAutocomplete.length){
      //this.refs.commentInput.focus();
    }

    //hide autocomplete when long time without action
    clearTimeout(this.showAutocompleteTimeout);
    this.showAutocompleteTimeout = setTimeout(() =>{
      this.setState({
        showAutocomplete : false
      });
    }, 5000);

  }

  setComment = (value) => {
    if (value) {
      // console.log('set comment', value)
      this.setState({ value })
      this.refs.commentInput.focus()
    }
  }

  clear(){
    this.refs.commentInput.clear();
    this.setState({value: ''})
  }

  _onMatchSelected(match){
    let value = this.state.value;
    let range =this.completer.mostRecentMatch.range
    value = value.substr(0, range.start) + match + value.substr(range.end)
    this.setState({
      value,
      showAutocomplete : false,
      autocompleteContent: null
    })
    if (this.props.onChange){
      this.props.onChange({nativeEvent:{text:value}});
    }

    let {onSearch, clapitAccountData, unauthenticatedAction} = this.props;
    if (onSearch){
      if (_.isEmpty(clapitAccountData)) {
        unauthenticatedAction && unauthenticatedAction();
        return;
      }
      this.props.onSearch(match);
    }
  }

  _onValueChange(e) {
    let { text:value } = e.nativeEvent
    this.setState({ value })
    if (this.props.onChange){
      this.props.onChange(e);
    }
    //debounced async results###
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.completer.checkForMatch.bind(this.completer)()
    }, 500);

  }

  _renderAutocomplete(){
    return (this.state.showAutocomplete) ?
      <View style={this.props.autocompleteBoxStyle ||styles.autocompleteView}>
        {(this.state.showHashtagsLoading) ? <ClapitLoading /> : null}
        {this.state.autocompleteContent}
      </View> : null;
  }

  _onSearch(){
    let {onSearch, clapitAccountData, unauthenticatedAction} = this.props;
    if (_.isEmpty(clapitAccountData)) {
      unauthenticatedAction && unauthenticatedAction();
      return;
    }
    dismissKeyboard()
    this.setState({showAutocomplete: false})
    onSearch(this.state.value);
  }

  _onSubmitEditing = (e) => {
    const { displaySearch, onSubmit } = this.props;
    console.log('text submit', this.props)
    if (displaySearch){
      this._onSearch();
    }
    if(typeof onSubmit === 'function') {
      onSubmit(e);
    }
  }

  render() {
    return (this.props.displaySearch) ?
      <View style={this.props.containerStyle || styles.textInputContainer}>
        {this._renderAutocomplete.bind(this)()}

          <View style={{flexDirection: 'row'}}>
            <Image source={Images.ico_magnifying_glass} style={{
              width: 35,
              height:31,
              marginTop:5
            }}/>
            <View style={styles.searchDivider}/>
            </View>
          <TextInput
            ref="commentInput"
            onChange={this._onValueChange.bind(this)}
            placeholder={this.props.placeholder || "Comment here..."}
            placeholderTextColor="#AAA"
            blurOnSubmit={true}
            returnKeyType={this.props.displaySearch ? 'search' : 'default'}
            onSubmitEditing={this._onSubmitEditing}
            value={this.state.value}
            style={this.props.style || styles.textInput}
          />
          <View>
            <TouchableOpacity onPress={this._onSearch.bind(this)}>
              <Text allowFontScaling={false} style={styles.goText}>go</Text>
            </TouchableOpacity>
          </View>

      </View>
      :
      <View style={this.props.containerStyle || styles.textInputContainer}>
        {this._renderAutocomplete.bind(this)()}
        <TextInput
          ref="commentInput"
          onChange={this._onValueChange.bind(this)}
          placeholder={this.props.placeholder || "Comment here..."}
          placeholderTextColor="#AAA"
          onSubmitEditing={this._onSubmitEditing}
          value={this.state.value}
          style={this.props.style || styles.textInput}
        />
      </View>
  }
}


/*TagAutocompleteInput.contextTypes = {
  store: React.PropTypes.object.isRequired
};*/

const styles = {

  textInputContainer: {
    flex: 0.8,
    height: 50,
    paddingLeft: 15,
    backgroundColor: 'white'
  },

  textInput: {
    flex: 0.6,
    fontSize: 15,
    color: '#AAA'
  },

  autocompleteView: {
    position:'absolute',
    bottom: 50,
    left: 20,
    width: width -40,
    borderWidth:1,
    borderColor:'#CCC',
    backgroundColor: 'white'
  },
  goText:{
    fontSize: 18,
    color: '#B385FF',
    padding: 8,
    fontWeight: 'bold',
  },
  autocompleteItem: {
    borderBottomWidth:1,
    borderBottomColor:'#CCC',
    height:40
  },
  autocompleteItemText: {
    fontSize: 15,
    color: '#B385FF',
    padding: 10,
    overflow: 'hidden'
  },
  searchDivider: {
    borderColor : '#CCC',
    borderWidth: 0,
    height: SEARCHBOX_HEIGHT - 16,
    width:0,
    marginTop: 4,
    marginLeft: 5
  }
}
