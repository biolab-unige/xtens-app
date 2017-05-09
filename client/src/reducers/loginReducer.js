import * as types from '../actions/action-types';

export const initialState = {
    login: null,
    isFetching: false
};

/**
 * @method
 * @name loginReducer
 * @param{Object} state
 * @param{Object} action
 * @return Object - next state
 */
const loginReducer = function(state = initialState, action) {

    switch(action.type) {
        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true
            };
        }
    }

    return state;

};

export default loginReducer;
