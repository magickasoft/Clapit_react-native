import { NAVIGATION_PUSH, NAVIGATION_POP, NAVIGATION_REPLACE } from '../constants/ActionTypes'
import * as NavigationStateUtils from 'NavigationStateUtils'

const initialNavState = {
    key: 'MainNavigation',
    index: 0,
    routes: [
        { key: 'MainContainer', index: 0 }
    ]
}

function equal(a, b, excludeKeys) {
    if (Object.keys(a).length !== Object.keys(b).length) return false;

    for (var key in a) {
        if (excludeKeys && key in excludeKeys) continue;
        if (!(key in b)) return false;

        if (typeof a[key] === 'object' && typeof b[key] === 'object') {
            return equal(a[key], b[key]);
        } else if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

export function navigationState(state = initialNavState, action) {
    let { routes, index } = state

    switch (action.type) {
        //note: not a straight up PUSH, 
        //if a matching route is found, jumpTo that route instead of stacking
        case NAVIGATION_PUSH:
            {
                //console.log('push reducer', state, action)

                for (let i = 0; i < state.routes.length; i++) {
                    const route = state.routes[i];
                    if (action.payload.name !== route.name) continue;
                    // console.log('exists', equal(action.payload, route, { key: 1 }))

                    const alreadyInStack =
                        route.name === 'ProfileContainer' && action.payload.username === route.username ||
                        route.name === 'PostDetails' && action.payload.post.id === route.post.id;

                    if (alreadyInStack) {
                        //in post detail, you can't go to the same post detail page. you can only go to profile
                        //so we clear the top of the stack
                        const reverseState = NavigationStateUtils.pop(state)
                        return NavigationStateUtils.jumpTo(reverseState, route.key)
                    }
                }

                return NavigationStateUtils.push(state, action.payload)
            }
        case NAVIGATION_POP:
            {
                return NavigationStateUtils.pop(state)
            }
        case NAVIGATION_REPLACE:
            {
                let { routes } = state
                let lastKey = routes[routes.length - 1].key

                if (routes && action.payload) {
                    if (routes[index].key === action.payload.key) {
                        return state
                    }
                }

                return NavigationStateUtils.push(state, action.payload)
            }
        case NAVIGATION_POP:
            {
                if (routes && (index === 0 || routes.length === 1)) {
                    return state
                }

                return NavigationStateUtils.pop(state)
            }
        case NAVIGATION_REPLACE:
            {
                let {routes} = state
                let lastKey = routes[routes.length - 1].key

                return NavigationStateUtils.replaceAt(state, lastKey, action.payload)
            }
    }

    return state
}
