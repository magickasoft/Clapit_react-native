// ========================================================
// CustomNavigationCardStack from https://github.com/tkjone/react-native-examples
// (bundled RN NavigationCardStack can't disable animations (not desired in tabs interface)
// ========================================================

'use strict';

/**
 * A controlled navigation view that renders a stack of cards.
 *
 *     +------------+
 *   +-+            |
 * +-+ |            |
 * | | |            |
 * | | |  Focused   |
 * | | |   Card     |
 * | | |            |
 * +-+ |            |
 *   +-+            |
 *     +------------+
 */

// core
const NavigationTransitioner = require('NavigationTransitioner');
const NavigationCard = require('./CustomNavigationCard');
const NavigationCardStackStyleInterpolator = require('NavigationCardStackStyleInterpolator');
const NavigationCardStackPanResponder = require('NavigationCardStackPanResponder');
const NavigationPropTypes = require('NavigationPropTypes');
const React = require('React');
const ReactComponentWithPureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
const StyleSheet = require('StyleSheet');
const View = require('View');

const {PropTypes} = React;
const {Directions} = NavigationCardStackPanResponder;

// ========================================================
// Component
// ========================================================

class CustomNavigationCardStack extends React.Component {

    constructor(props, context) {
        super(props, context);
    }

    componentWillMount() {
        this._render = this._render.bind(this);
        this._renderScene = this._renderScene.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return ReactComponentWithPureRenderMixin.shouldComponentUpdate.call(
            this,
            nextProps,
            nextState
        );
    }

    render() {

        const configTransition = { duration: this.props.animation_duration };

        return (
            <NavigationTransitioner
                configureTransition={ () => { return configTransition }}
                navigationState={this.props.navigationState}
                render={this._render}
                onTransitionEnd={this.props.onTransitionEnd}
                onTransitionStart={this.props.onTransitionStart}
                style={this.props.style}
            />
        );
    }

    _render(props) {
        const {
            renderOverlay
        } = this.props;

        const overlay = renderOverlay && renderOverlay(props);

        const scenes = props.scenes.map(scene => this._renderScene({
            ...props,
            scene,
        }));

        return (
            <View
                style={styles.container}>
                <View
                    style={styles.scenes}>
                    {scenes}
                </View>
                {overlay}
            </View>
        );
    }

    _renderScene(props) {
        const isVertical = this.props.direction === 'vertical';

        const style = isVertical ?
            NavigationCardStackStyleInterpolator.forVertical(props) :
            NavigationCardStackStyleInterpolator.forHorizontal(props);

        const panHandlersProps = {
            ...props,
            onNavigateBack: this.props.onNavigateBack,
            gestureResponseDistance: this.props.gestureResponseDistance,
        };

        const panHandlers = isVertical ?
            NavigationCardStackPanResponder.forVertical(panHandlersProps) :
            NavigationCardStackPanResponder.forHorizontal(panHandlersProps);

        return (
            <NavigationCard
                {...props}
                key={'card_' + props.scene.key}
                panHandlers={panHandlers}
                renderScene={this.props.renderScene}
                style={[style, this.props.cardStyle]}
            />
        );
    }
}

// ========================================================
// Styles
// ========================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scenes: {
        flex: 1,
    },
});

// ========================================================
// Exports
// ========================================================

module.exports = CustomNavigationCardStack;
