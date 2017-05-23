//todo remove this component after upgrading to RN 0.33+ - it fixes the problem why this Custom component was used - https://github.com/facebook/react-native/releases/tag/v0.33.0
'use strict';

const Animated = require('Animated');
const NavigationCardStackPanResponder = require('NavigationCardStackPanResponder');
const NavigationCardStackStyleInterpolator = require('NavigationCardStackStyleInterpolator');
const NavigationPagerPanResponder = require('NavigationPagerPanResponder');
const NavigationPagerStyleInterpolator = require('NavigationPagerStyleInterpolator');
const NavigationPointerEventsContainer = require('NavigationPointerEventsContainer');
const NavigationPropTypes = require('NavigationPropTypes');
const React = require('React');
const ReactComponentWithPureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
const StyleSheet = require('StyleSheet');
const View = require('View');



const {PropTypes} = React;

class SceneView extends React.Component {

  static propTypes = {
    sceneRenderer: PropTypes.func.isRequired,
    sceneRendererProps: NavigationPropTypes.SceneRenderer,
  };

  shouldComponentUpdate(nextProps, nextState) {
    //this is the only difference from original NavigationCard, it was never re-rendering scene after first render
    //
    /*return (
      nextProps.sceneRendererProps.scene.route !==
      this.props.sceneRendererProps.scene.route
    );*/
    return true;
  }

  render(){
    return this.props.sceneRenderer(this.props.sceneRendererProps);
  }
}

/**
 * Component that renders the scene as card for the <NavigationCardStack />.
 */
class NavigationCard extends React.Component {
  props;

  static propTypes = {
    ...NavigationPropTypes.SceneRendererProps,
    onComponentRef: PropTypes.func.isRequired,
    onNavigateBack: PropTypes.func,
    panHandlers: NavigationPropTypes.panHandlers,
    pointerEvents: PropTypes.string.isRequired,
    renderScene: PropTypes.func.isRequired,
    style: PropTypes.any,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return ReactComponentWithPureRenderMixin.shouldComponentUpdate.call(
      this,
      nextProps,
      nextState
    );
  }

  render(){
    const {
      panHandlers,
      pointerEvents,
      renderScene,
      style,
      ...props, /* NavigationSceneRendererProps */
    } = this.props;

    const viewStyle = style === undefined ?
      NavigationCardStackStyleInterpolator.forHorizontal(props) :
      style;

    const viewPanHandlers = panHandlers === undefined ?
      NavigationCardStackPanResponder.forHorizontal({
        ...props,
        onNavigateBack: this.props.onNavigateBack,
      }) :
      panHandlers;

    return (
      <Animated.View
        {...viewPanHandlers}
        pointerEvents={pointerEvents}
        ref={this.props.onComponentRef}
        style={[styles.main, viewStyle]}>
        <SceneView
          sceneRenderer={renderScene}
          sceneRendererProps={props}
        />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#E9E9EF',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    top: 0,
  },
});

NavigationCard = NavigationPointerEventsContainer.create(NavigationCard);

NavigationCard.CardStackPanResponder = NavigationCardStackPanResponder;
NavigationCard.CardStackStyleInterpolator = NavigationCardStackStyleInterpolator;
NavigationCard.PagerPanResponder = NavigationPagerPanResponder;
NavigationCard.PagerStyleInterpolator = NavigationPagerStyleInterpolator;

module.exports = NavigationCard;
