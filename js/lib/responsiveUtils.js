// breakpoints taken from https://medium.com/@elieslama/responsive-design-in-react-native-876ea9cd72a8#.v3jp0zdgf

import {Dimensions} from "react-native";

const x = Dimensions.get('window').width;
const y = Dimensions.get('window').height;

// Calculating ratio from iPhone breakpoints
const ratioX = x < 375 ? (x < 320 ? 0.75 : 0.875) : 1 ;
const ratioY = y < 568 ? (y < 480 ? 0.75 : 0.875) : 1 ;

// We set our base font size value
const base_unit = 16;

// We're simulating EM by changing font size according to Ratio
const unit = base_unit * ratioX;

// We add an em() shortcut function
export function em(value) {
  return unit * value;
}

export function respPixels(value) {
  return ratioX * value;
}

export const RESP_RATIO = ratioX