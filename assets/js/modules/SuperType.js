/**
 * @author  Nicolò Zanardi
 * @description This file contains the Backbone classes for handling SuperType
 *              models, collections and views according to the MIABIS standard
 */
(function(xtens, SuperType) {
    // dependencies
    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;


    // XTENS router alias
    var router = xtens.router;

    SuperType.Model = Backbone.Model.extend({
        urlRoot: '/superType',

        /**
         * @description flattens the metadata schema returning a 1D array containing all the metadata fields
         * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
         */
        getFlattenedFields: function(skipFieldsWithinLoops) {
            var flattened = [], groupName, groupContent, loopContent;
            var body = this.get("schema") && this.get("schema").body;
            if (!body) return flattened;
            for (var i=0, len=body.length; i<len; i++) {
                groupName = body[i].name;
                groupContent = body[i] && body[i].content;
                for (var j=0, l=groupContent.length; j<l; j++) {
                    if (groupContent[j].label === Constants.METADATA_FIELD) {
                        flattened.push(_.extend(groupContent[j], {_group: groupName}));
                    }
                    else if (groupContent[j].label === Constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                        loopContent = groupContent[j] && groupContent[j].content;
                        for (var k=0; k<loopContent.length; k++) {
                            if (loopContent[k].label === Constants.METADATA_FIELD) {

                                // add to the field a private flag that specifies its belonging to a loop
                                flattened.push(_.extend(loopContent[k], {
                                    _group: groupName,
                                    _loop: true
                                }));
                            }
                        }
                    }

                }
            }
            return flattened;
        },

        /**
         * @description checks whether the DataType contains at least a loop
         * @return{boolean} - true if the DataType contains at least a loop, false otherwise
         */
        hasLoops: function() {
            var body = this.get("schema") && this.get("schema").body;
            for (var i=0, len=body.length; i<len; i++){
                var groupContent = body[i] && body[i].content;
                if (_.where(groupContent, {label: Constants.METADATA_LOOP}).length > 0) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @method
         * @name getLoops
         * @description returns a list of the metadata loops contained in the current DataType
         * @return{Array} - an array containing all the Metadata loops
         */
        getLoops: function() {
            var body = this.get("schema") && this.get("schema").body;
            var res = [];
            for (var i=0, len=body.length; i<len; i++) {
                var groupContent = body[i] && body[i].content;
                res.push(_.where(groupContent, {label: Constants.METADATA_LOOP}));
            }
            return _.flatten(res, true);
        },

        /**
         * @method
         * @name validate
         * @description customized client-side validation for DataType Model
         */
        validate: function(attrs, opts) {
            var errors = [];

            if (!attrs.schema.body || !attrs.schema.body.length) {
                // errors.push({name:'groups', message: i18n("please-add-at-least-a-metadata-group")});
                return false;
            }
            // create a temporary DataType.Model to check the fields
            var tempModel = new SuperType.Model(attrs);
            var flattened = tempModel.getFlattenedFields();
            if (!flattened.length) {
                errors.push({name:'attributes', message: i18n("please-add-at-least-a-metadata-field")});
            }
            // check that there are no fields with more than one occurrence
            var occurrences = {}, duplicates = [];
            _.each(_.map(flattened, 'name'), function(fieldName) {
                if (!occurrences[fieldName]) {
                    occurrences[fieldName] = 1;
                }
                else {
                    occurrences[fieldName]++;
                    duplicates.push(fieldName);
                }
            });
            if (!_.isEmpty(duplicates)) {
                errors.push({name: 'duplicates', message: i18n("data-type-has-the-following-duplicate-names") + ": " + duplicates.join(", ") });
            }
            return errors.length > 0 ? errors : false;
        }

    });

    SuperType.List = Backbone.Collection.extend({
        url: '/superType',
        model: SuperType.Model
    });

    SuperType.Views.Edit = Backbone.View.extend({

        initialize: function() {
            this.template = JST["views/templates/supertype-edit.ejs"];
        },

        bindings: {
            '#st-name': 'name',
            '#uri': 'uri'
        },

        render: function() {
            this.$el.html(this.template({__: i18n}));
            this.stickit();
            return this;
        }

    });

    SuperType.Views.List = Backbone.View.extend({
        //TODO
    });

} (xtens, xtens.module("supertype")));
