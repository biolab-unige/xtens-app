/**
 *  @module
 *  @name SuperTypeService
 *  @author Nicolò Zanardi
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, DataType*/
"use strict";

var BluebirdPromise = require('bluebird');

const coroutines = {

    /**
     * @method
     * @name isMultiProject
     * @param{Object - Integer} SuperType object or id
     * @return{Boolean}
     * @description coroutine for get DataTypes' privileges
     */
    isMultiProject: BluebirdPromise.coroutine(function *(superType) {
        if (!superType) {
            throw new Error("isMultiProject - Error: No SuperType object");
        }
        const idSuperType = _.isObject(superType) ? superType.id : superType;

        let dataTypes = yield DataType.find({superType: idSuperType});

        // if (dataTypes.length === 0) {
        //   return false;
        // }
        let isMultiProject = dataTypes.length > 1 ? true : false;
        return isMultiProject;
    })
};

var SuperTypeService = BluebirdPromise.promisifyAll({

    isMultiProject: function (dataType, skipFieldsWithinLoops) {

        return coroutines.isMultiProject(dataType, skipFieldsWithinLoops)
        .catch(/* istanbul ignore next */ function(err) {
            sails.log(err);
            return err;
        });
    }

});



module.exports = SuperTypeService;
