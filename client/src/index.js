import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './store';

ReactDOM.render(<Provider store={store}>
    <Router basename='app' >
        <div>
            <Route exact path='/' component={null} />
            <Route exact path='/login' component={null} />
        </div>
    </Router>
</Provider>, document.getElementById('reactCnt'));
