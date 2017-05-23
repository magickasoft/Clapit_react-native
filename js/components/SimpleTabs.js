import React, { Component } from 'react';
import  {
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native'

export default class SimpleTabs extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            componentWidth: 0
        }
    }

    onSelect(el){
        if (el.props.onSelect) {
            el.props.onSelect(el);
        } else if (this.props.onSelect) {
            this.props.onSelect(el);
        }
    }

    _onLayout(event) {
        var {x, y, width, height} = event.nativeEvent.layout;
        this.setState({componentWidth: width});
    }

    render() {
        let selected = this.props.selected
        let pos = 0;
        if (!selected){
            React.Children.forEach(this.props.children, el=>{
                if (!selected || el.props.initial){
                    selected = el.props.name;
                }
            });
        }
        else {
            let i = 0;
            React.Children.forEach(this.props.children, el=>{
                if(selected == el.props.name) {
                    pos = i;
                }
                i++;
            });
        }

        let numberOfTabs = this.props.children.length;
        let tabWidth = this.state.componentWidth / numberOfTabs;
        let tabPosition = tabWidth * pos;

        return(
            <View style={{...this.props.style, ...styles.container}} onLayout={(event) => this._onLayout(event)}>
                <View style={styles.buttons}>
                    {React.Children.map(this.props.children,(el)=>
                        <TouchableOpacity key={el.props.name+"touch"}
                           style={[styles.button, this.props.iconStyle, el.props.name == selected ? this.props.selectedIconStyle || el.props.selectedIconStyle || {} : {} ]}
                           onPress={()=>!this.props.locked && this.onSelect(el)}
                           onLongPress={()=>this.props.locked && this.onSelect(el)}>
                           {selected == el.props.name ? React.cloneElement(el, {selected: true, style: [el.props.style, this.props.selectedStyle, el.props.selectedStyle]}) : el}
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{...styles.underline, width: tabWidth, left: tabPosition, backgroundColor: this.props.underlineColor}} />
            </View>
        )
    }
}

const styles = {
    container: {
        flexDirection: 'row',
        right:0,
        left:0
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
    },
    button: {
        flex: 0.5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    underline: {
        position: 'absolute',
        flex: 1,
        height: 2,
        width: 100,
        left: 0,
        bottom: 0
    }
}
