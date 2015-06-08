/**
 * Operator.js
 */
var bcrypt = require('bcrypt');

var Operator = {
    tableName: 'operator',
    schema:true,
  
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
            type: 'datetime',
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

        /* moved to the Passport 
        password: {
            type: 'string',
            required: true
        }, */
       
        passports: {
            collection: 'passport',
            via: 'user'
        },

        createdAt: {
            type:'datetime',
            columnName: 'created_at'
        },

        updatedAt: { 
            type:'datetime',
            columnName: 'updated_at'
        },
        groups:{
            collection:'group',
            via:'members'
        }, 

        // Override toJSON instance method
        // to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }

        
    }
    
    /*,
    // Lifecycle Callbacks
    beforeCreate: function(values, next) {
        bcrypt.hash(values.password, 10, function(err, hash) {
            if(err) return next(err);
            values.password = hash;
            next();
        });
    } */

};

module.exports = Operator;
