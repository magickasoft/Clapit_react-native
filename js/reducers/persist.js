import { assignAccessToken } from '../actions/api'

export function autoRehydrated(state=false, action) {
  let { type, payload } = action

  switch(type) {
    case 'persist/REHYDRATE':
      let { clapitAccountData = {} } = payload
      let { accessToken = null } = clapitAccountData

      assignAccessToken(accessToken)

      return true
  }

  return state
}
