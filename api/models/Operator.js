/**
 * Operator.js
 */
var bcrypt = require('bcrypt');

var Operator = {
    connection:'postgresql',
    tableName: 'operator',
    attributes: {

        firstName: {
            type: 'string',
            required: true,
            max: 64,
            columnName: 'first_name'
        },
        lastName: {
            type: 'string',
            required: true,
            max: 64,
            columnName: 'last_name'
        },
        birthDate: {
            type: 'date',
            columnName: 'birth_date'
        },
        sex: {
            type: 'string',
            enum: ['M', 'F', 'N.A.'],
            columnName: 'sex'
        },
        email: {
            type: 'email',
            required: true,
            columnName: 'email'
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
            columnName: 'created_at'
        },

        updatedAt: { 
            type: 'datetime', 
            defaultsTo: function (){ return new Date(); },
            columnName: 'updated_at'
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
        },
        groups:{
            collection:'group',
            via:'operators',
            dominant:true
        }
    }	
};

module.exports = Operator;
