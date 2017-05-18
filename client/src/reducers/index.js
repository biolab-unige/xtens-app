import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import loginReducer from './loginReducer';

const reducers = combineReducers({
    loginState: loginReducer,
    form: formReducer
});

export default reducers;
