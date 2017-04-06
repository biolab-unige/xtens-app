import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Route } from 'react-router';
import { Provider } from 'react-redux';

import store from './store';

ReactDOM.render(<Provider store={store}>
    <Router basename='app' >
        <Route exact path='/' component={null} />
        <Route exact path='/login' component={null} />
    </Router>
</Provider>, document.getElementById('reactCnt'));
