import { NAVIGATION_PUSH, NAVIGATION_POP, NAVIGATION_REPLACE } from '../constants/ActionTypes'
import { NavigationExperimental } from 'react-native'
const {
	AnimatedView: NavigationAnimatedView,
	Card: NavigationCard,
	Header: NavigationHeader,
	RootContainer: NavigationRootContainer
} = NavigationExperimental

// The following action creators were derived from NavigationStackReducer
export function navigationPush(state) {
  state = typeof state === 'string' ? { key: state, title: state } : state
	return {
		type: NAVIGATION_PUSH,
		payload: state
	}
}

export function navigationPop() {
  return {
    type: NAVIGATION_POP
  }
}

export function navigationReplace(state) {
	return {
		type: NAVIGATION_REPLACE,
		payload: state
	}
}

export function onNavigate(action) {
  let { type } = action

  if (action.type && (
    action.type === NavigationRootContainer.getBackAction().type ||
    action.type === NavigationCard.CardStackPanResponder.Actions.BACK.type)
  ) {
    return navigationPop()
  } else {
    return navigationPush(action)
  }
}
