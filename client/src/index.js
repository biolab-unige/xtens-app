import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './store';

import LoginContainer from './components/containers/LoginContainer';

ReactDOM.render(<Provider store={store}>
    <Router basename='app' >
        <div>
            <Route exact path='/' component={LoginContainer} />
            <Route exact path='/login' component={LoginContainer} />
        </div>
    </Router>
</Provider>, document.getElementById('reactCnt'));
