import 'bootstrap-loader';
import 'font-awesome/scss/font-awesome.scss';


import React from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { getRemoteError } from '../../actions/main-actions';
import { TextInput } from '../views/form';


/**
 * @class
 * @name Login
 * @extends React.Component
 */
export class Login extends React.Component {

    static fields = {
        identifier: {
            name: 'identifier',
            label: 'Login',
            placeholder: 'Login',
            helpText: 'Please insert your username here.'
        },
        password: {
            name: 'password',
            label: 'Password',
            placeholder: 'Password',
            helpText: 'Please insert your password here.'
        }
    }

    static propTypes = {

    }

    render() {
        const { fields } = this.constructor;
        return <div>
            <h3>Login Form</h3>
            <div>
                <div className='container'>
                    <form className='container'>
                        <Row >
                            <TextInput field={fields.identifier} label={fields.identifier.name} helpText={fields.identifier.helpText} />
                        </Row>
                        <Row >
                            <TextInput field={fields.password} label={fields.password.name} helpText={fields.password.helpText} />
                        </Row>
                    </form>
                </div>
            </div>
        </div>;
    }

}

const LoginContainer = reduxForm({
    form: 'login'
})(Login);

const mapStateToProps = function(store) {
    const { loginState } = store;
    return {
        initialValues: loginState.login,
        error: loginState.error
    };
};

const mapDispatchToProps = function(dispatch) {
    return {
        handleError: err => {
            dispatch(getRemoteError(err));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer);
