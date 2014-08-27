/**
 * Operator.js
 */
var bcrypt = require('bcrypt');

var Operator = {
    attributes: {
        firstName: {
            type: 'STRING',
            required: true,
            max: 64
        },
        lastName: {
            type: 'STRING',
            required: true,
            max: 64
        },
        birthDate: {
            type: 'DATE'
        },
        sex: {
            type: 'STRING',
            enum: ['M', 'F', 'N.A.']
        },
        email: {
            type: 'email',
            required: true
        },
        login: {
            type: 'STRING',
            required: true,
            max: 64
        },
        password: {
            type: 'STRING'
        },

        // Override toJSON instance method
        // to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        },

        // Lifecycle Callbacks
        beforeCreate: function(values, next) {
            bcrypt.hash(values.password, 10, function(err, hash) {
                if(err) return next(err);
                values.password = hash;
                next();
            });
        }
    }	
};

module.exports = Operator
