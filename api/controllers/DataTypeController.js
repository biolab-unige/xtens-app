/**
 * DataTypeController
 *
 * @description :: Server-side logic for managing datatypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;

var DataTypeController = {

    /**
     * GET /dataType
     * GET /dataType/find
     *
     * @method
     * @name find
     * @description Find dataTypes based on criteria
     */
    find: function(req, res) {

        console.log("DataType.find - prova");
        
        // the "populate" param is used to send all the associations to be populated
        var populate = _.clone(req.param('populate')) || ['parents'];
        delete res.populate;
        console.log(populate);

        var query = DataType.find()
        .where(QueryService.parseCriteria(req))
        .limit(QueryService.parseLimit(req))
        .skip(QueryService.parseSkip(req))
        .sort(QueryService.parseSort(req));
        
        populate.forEach(function(associationName) {
            console.log("DataTypeController.find - populating " + associationName);
            query.populate(associationName);
        });

        query.then(function(dataTypes) {
            res.json(dataTypes);
        })
        .catch(function(err) {
            return res.serverError(err);
        });
    },

    /**
     * POST /dataType
     * @method
     * @name create
     */
    create: function(req, res) {
        console.log("DataType.create - prova");

        var dataType = req.body;
        if(!dataType.schema) {
            return res.badRequest("a DataType requires at least valid JSON schema");
        }
        if (!dataType.name) dataType.name = dataType.schema.name;
        if (!dataType.model) dataType.model = dataType.schema.model;
        // omit all the properties relative to associations
        // var newDataType = _.omit(req.body, ['parents', 'children', 'datas', 'groups']);
        // var parents = req.param('parents');

        transactionHandler.createDataType(dataType).then(function(idDataType) {
            return DataType.findOne(idDataType).populate('parents');
        })
        .then(function(dataType) {
            return res.json(dataType);
        })
        .catch(function(error) {
            return res.serverError(error.message);
        });

        /*
           DataType.create(newDataType)

        // if the dataType is successfully created, create all the 
        .then(function(dataType) {
        newDataType = dataType;
        return BluebirdPromise.map(parents, function(parent) {
        console.log('Associating new DataType ', dataType.name ,'with Parent ', parent);
        dataType.parents.add(parent);
        return dataType.save();
        });
        })

        .then(function() {
        return DataType.find(newDataType.id).populate('parents');
        })

        .then(function(dataType) {
        return res.json(dataType);
        })

        .catch(function(error) {
        return res.serverError(error);
        }); */

    },

    /**
     * PUT /dataType/:id
     * @method
     * @name update
     */
    update: function(req, res) {
        var dataType = req.body;

        transactionHandler.updateDataType(dataType).then(function(idDataType) {
            return DataType.findOne(idDataType).populate('parents');
        })
        .then(function(dataType) {
            return res.json(dataType);
        })
        .catch(function(error) {
            return res.serverError(error.message);
        });
    },

    buildHierarchy: function(req, res) {
        DataType.find({ parent: null}).populate('children').then(function(roots) {
            DataTypeService.getChildrenRecursive(roots);  
        })
        .then(function(results) {
            console.log(results);
            res.json(results);
        })
        .catch(function(error) {
            if (error) return res.serverError(error);
        });
    }

};

module.exports = DataTypeController;
