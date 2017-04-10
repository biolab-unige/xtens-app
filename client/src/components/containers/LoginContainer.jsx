import React from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';


export class Login extends React.Component {

}

const LoginContainer = reduxForm({
    form: 'login'
});

const mapStateToProps = function(store) {
    return {};
};

const mapDispatchToProps = function(dispatch) {

};

export default connect(mapDispatchToProps, mapDispatchToProps)(LoginContainer);
