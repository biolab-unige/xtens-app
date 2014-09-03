/**
 * Operator.js
 */
var bcrypt = require('bcrypt');

var Operator = {
    connection:'postgresqlMaffo',
    tableName: 'operator'
    attributes: {

        firstName: {
            type: 'string',
            required: true,
            max: 64
        },
        lastName: {
            type: 'string',
            required: true,
            max: 64
        },
        birthDate: {
            type: 'date'
        },
        sex: {
            type: 'string',
            enum: ['M', 'F', 'N.A.']
        },
        email: {
            type: 'email',
            required: true
        },
        login: {
            type: 'string',
            required: true,
            max: 64
        },
        password: {
            type: 'string',
            required: true
        },

        createdAt: {
            type: 'datetime',
            defaultsTo: function (){ return new Date(); }
        },

        updatedAt: { type: 'datetime', 
            defaultsTo: function (){ return new Date(); } 
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
