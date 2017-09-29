/**
 * Operator.js
 */

var constants = sails.config.xtens.constants;

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

        passports: {
            collection: 'passport',
            via: 'user'
        },

        addressInformation: {
            columnName: 'address_information',
            model: 'addressInformation'
        },

        createdAt: {
            type:'datetime',
            columnName: 'created_at'
        },

        updatedAt: {
            type:'datetime',
            columnName: 'updated_at'
        },
        groups: {
            collection:'group',
            via:'members'
        },

        // Override toJSON instance method
        // to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        },

        /**
         * @method
         * @name formatForTokenPayload
         * @description remove personal details from operator entity and set privilege levels.
         *              The result will be used as the payload for the Json Web Token
         * @return{Object} - formatted operator with the following properties:
         *                      1) id - primary key
         *                      2) login[string]
         *                      3) groups [array]
         *                      4) isWheel [boolean]
         *                      5) isAdmin [boolean]
         *                      6) canAccessPersonalData [boolean]
         *                      7) canAccessSensitiveData [boolean]
         */
        formatForTokenPayload: function() {
            var operator = _.pick(this.toObject(), ['id', 'groups']);
            var privilegesArray = _.map(operator.groups, 'privilegeLevel');
            operator.isWheel = privilegesArray.indexOf(constants.GroupPrivilegeLevels.WHEEL) > -1;
            operator.isAdmin = operator.isWheel || privilegesArray.indexOf(constants.GroupPrivilegeLevels.ADMIN) > -1;
            operator.adminGroups =  [];
            if (operator.isAdmin) {
                var adminGroups = _.where(operator.groups, {privilegeLevel: constants.GroupPrivilegeLevels.ADMIN});
                operator.adminGroups = !_.isEmpty(adminGroups) ? _.isArray(adminGroups) ? _.map(adminGroups,'id') : [adminGroups.id] : [];
            }
            operator.canAccessPersonalData = _.map(operator.groups, 'canAccessPersonalData').indexOf(true) > -1;
            operator.canAccessSensitiveData = _.map(operator.groups, 'canAccessSensitiveData').indexOf(true) > -1;
            operator.groups = _.map(operator.groups, 'id');
            return operator;
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
