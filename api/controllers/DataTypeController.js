/**
 * DataTypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 /* jshint node: true */
 /* globals _, sails, DataType, DataTypeService, QueryService, TokenService */
 "use strict";
 const ControllerOut = require("xtens-utils").ControllerOut;
 const crudManager = sails.hooks.persistence.crudManager;
 const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');


 const DataTypeController = {

    /**
     * GET /dataType
     * GET /dataType/find
     *
     * @method
     * @name find
     * @description Find dataTypes based on criteria
     */
     find: function(req, res) {
         const co = new ControllerOut(res);
         const operator = TokenService.getToken(req);

         let query = DataType.find()
            .where(actionUtil.parseCriteria(req))
            .limit(actionUtil.parseLimit(req))
            .skip(actionUtil.parseSkip(req))
            .sort(actionUtil.parseSort(req));

         if (!req.param('populate')) {
             query.populate('parents');  // by default populate only with 'parents' dataTypes
         }
         else {
             query = actionUtil.populateRequest(query, req);
         }

         query.then(function(dataTypes) {
             DataTypeService.filterDataTypes(operator.id, dataTypes).then(function (dataTypesFiltered) {
                 sails.log(dataTypesFiltered);
                 return res.json(dataTypesFiltered);

             });
         })
        .catch(function(err) {
            return co.error(err);
        });
     },

    /**
     * POST /dataType
     * @method
     * @name create
     */
     create: function(req, res) {
         const co = new ControllerOut(res);
         let dataType = req.allParams();

         if (!dataType.name) dataType.name = dataType.schema && dataType.schema.name;
         if (!dataType.model) dataType.model = dataType.schema && dataType.schema.model;

        // omit all the properties relative to associations
        // var newDataType = _.omit(req.body, ['parents', 'children', 'datas', 'groups']);
        // var parents = req.param('parents');

        // Validate data type (schema included)
         const validationRes = DataTypeService.validate(dataType, true);

         if (validationRes.error) {
             return co.error(validationRes.error);
         }
         else {
             crudManager.createDataType(dataType)
            /*
            .then(function(idDataType) {
                return DataType.findOne(idDataType).populate('parents');
            }) */
            .then(function(dataType) {
                sails.log(dataType);
                res.set('Location', req.baseUrl + req.url + '/'  + dataType.id);
                return res.json(201, dataType);
            })
            .catch(function(error) {
                sails.log(error.message);
                return co.error(error);
            });
         }
     },

    /**
     * PUT /dataType/:id
     * @method
     * @name update
     */
     update: function(req, res) {
         const co = new ControllerOut(res);
         let dataType = req.allParams();

        // Validate data type (schema included)
         const validationRes = DataTypeService.validate(dataType, true);

         if (validationRes.error) {
             return co.error(validationRes.error);
         }
         else {
             crudManager.updateDataType(dataType)
            /*
            .then(function(idDataType) {
                return DataType.findOne(idDataType).populate('parents');
            }) */
            .then(function(dataType) {
                sails.log(dataType);
                return res.json(dataType);
            })
            .catch(function(error) {
                return co.error(error);
            });
         }
     },

    /**
     * @method
     * @name destroy
     * @description DELETE /dataType/:id
     */
     destroy: function(req, res) {
         const co = new ControllerOut(res);
         const id = req.param('id');

         if (!id) {
             return co.badRequest({message: 'Missing dataType ID on DELETE request'});
         }

         return crudManager.deleteDataType(id)

        .then(function(deleted) {
            return res.json({
                deleted: deleted
            });
        })

        .catch(function(err) {
            return co.error(err);
        });

     },

      /**
      * @method
      * @name edit
      * @description return all the info required for a datatype edit
      */
     edit: function(req, res) {
         let co = new ControllerOut(res);
         let params = req.allParams();

         DataType.find()

        .then(function(result) {
            return res.json({params: params, dataTypes: result});
        })

        .catch(function(err) {
            sails.log(err);
            return co.error(err);
        });

     },

    /**
     * @method
     * @name buildGraph
     * @description generate and visualize the datatype graph given a root datatype.
     */

     buildGraph : function(req,res) {

         const name = req.param("idDataType");
         const fetchDataTypeTree = sails.hooks['persistence'].getDatabaseManager().recursiveQueries.fetchDataTypeTree;
         sails.log(req.param("idDataType"));

         return DataType.findOne({name:name})

        .then(function(result) {
            const id = result.id;
            const template = result.model;

            // This query returns the parent-child associations among the datatypes
            function dataTypeTreeCb (err, resp) {

                var links= [],loops = [];

                // if there aren't children do not print any link
                if(resp.rows.length === 0) {
                    links.push({
                        'source': name,
                        'depth': 0,
                        'target': null,
                        'source_template': template,
                        'target_template': null
                    });
                }
                // populate the links array
                for(let i =0; i<resp.rows.length; i++) {

                    if(resp.rows[i].cycle === false){
                        links.push({
                            'source':resp.rows[i].parentname,
                            'target':resp.rows[i].childname,
                            'depth':resp.rows[i].depth,
                            'source_template':resp.rows[i].parenttemplate,
                            'target_template':resp.rows[i].childtemplate,
                            'cycle':resp.rows[i].cycle
                        });
                    }
                    else {
                        loops.push({
                            'source':resp.rows[i].parentname,
                            'target':resp.rows[i].childname,
                            'depth':resp.rows[i].depth,
                            'source_template':resp.rows[i].parenttemplate,
                            'target_template':resp.rows[i].childtemplate,
                            'cycle':resp.rows[i].cycle
                        });
                    }
                }

                const json = {
                    'links': links,
                    'loops': loops
                };
                sails.log(json);
                return res.json(json);
            }

            fetchDataTypeTree(id, dataTypeTreeCb);
        });
     }


 };

 module.exports = DataTypeController;
