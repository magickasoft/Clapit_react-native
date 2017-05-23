import {
    INIT_FRIENDSHIPS
} from '../constants/ActionTypes'

export function friendshipsWithAccountId(id) {
    return dispatch => {

        dispatch(
          {
              type: INIT_FRIENDSHIPS,
              payload: {
                  accountId: id
              }
          }
        )
    }
}
