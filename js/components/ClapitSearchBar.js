import React, { Component } from 'react';
import  {
  Dimensions,
  View,
  Text,
  Animated,
  LayoutAnimation
} from 'react-native'


import TagAutocompleteInputContainer from '../containers/TagAutocompleteInputContainer'
import dismissKeyboard from 'react-native-dismiss-keyboard'
let { width, height } = Dimensions.get('window')

import { SEARCHBOX_HEIGHT } from '../constants/Size'

export default class ClapitSearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      scroll: props.scroll,
      scrollDiff: new Animated.Value(SEARCHBOX_HEIGHT),
      overflow: 'visible'
    }
    this.prevScroll = 0
    this.currentScroll = 0
    this.accumulatedScroll = -SEARCHBOX_HEIGHT
  }

  componentDidMount() {
    this.setState({ scroll: this.props.scroll })
    this.props.scroll.addListener((value) => {
      this.prevScroll = this.currentScroll;
      this.currentScroll = value.value;
      //this is to avoid bouncing - it creates temporary negative scroll value
      if (this.currentScroll < 0) {
        this.currentScroll = 0;
      }
      let diff = this.currentScroll - this.prevScroll;
      this.accumulatedScroll += diff;
      if (this.accumulatedScroll > 0){
        this.accumulatedScroll = 0
      }
      if (this.accumulatedScroll <= -SEARCHBOX_HEIGHT){
        this.accumulatedScroll = -SEARCHBOX_HEIGHT
        if (this.state.overflow === 'hidden'){
          this.setState({overflow:'visible'})
        }
      } else {
        if (this.state.overflow === 'visible'){
          this.setState({overflow:'hidden'})
          dismissKeyboard()
        }
      }
      this.state.scrollDiff.setValue( -this.accumulatedScroll)
    });

  }

  componentWillReceiveProps(newProps) {
    if (newProps.scroll !== this.props.scroll) {
      this.setState({ scroll: newProps.scroll });
    }
  }

  render() {

    let {topOffset, topOffsetMin = 0, topOffsetMax = 0 } = this.props;
    let {overflow} = this.state
    return (
      <Animated.View style={[styles.searchBar, {
        overflow,
        top: (topOffset) ? topOffset :
          this.state.scroll.interpolate({
            inputRange: [0, topOffsetMax * 4],
            outputRange: [topOffsetMax + topOffsetMin, topOffsetMin],
            extrapolate: 'clamp'
          }),
        height: this.state.scrollDiff
      }]}>
        <View style={{backgroundColor: 'white'}}>
          <TagAutocompleteInputContainer
            ref="tagsAutocomplete"
            placeholder="Search"
            displaySearch={true}
            containerStyle={styles.searchContainer}
            scroll={this.state.scroll}
            autocompleteBoxStyle={styles.autocompleteBoxStyle}
            style={styles.textInput}
            unauthenticatedAction={this.props.unauthenticatedAction}
            clapitAccountData={this.props.clapitAccountData}
            onSearch={this.props.onSearch}
            value={this.props.searchTerm}
          />
        </View>
      </Animated.View>
    );
  }
}


const styles = {
  searchBar: {
    position: 'absolute',
    left: 0,
    width,
    backgroundColor: 'white'
  },
  searchContainer: {
    height: SEARCHBOX_HEIGHT - 4,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CCC',
    marginTop: 2,
    marginBottom: 2,
    flexDirection: 'row'
  },
  textInput: {
    flex: 0.6,
    fontSize: 15,
    color: '#AAA',
    marginLeft: 0,
  },
  autocompleteBoxStyle: {
    position: 'absolute',
    top: SEARCHBOX_HEIGHT - 10,
    left: 20,
    width: width - 40,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: 'white'
  }
}
