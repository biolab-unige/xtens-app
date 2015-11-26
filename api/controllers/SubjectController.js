/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var ControllerOut = require("xtens-utils").ControllerOut;
var crudManager = sails.config.xtens.crudManager;
var BluebirdPromise = require('bluebird');
var SUBJECT = sails.config.xtens.constants.DataTypeClasses.SUBJECT;

module.exports = {

    /**
     *  @method
     *  @name create
     *  @description: POST /subject: create a new subject; transaction-safe implementation
     */
    create: function(req, res) {
        var co = new ControllerOut(res);
        var subject = req.body;
        DataType.findOne(subject.type)
        .then(function(subjectType) {
            var validationRes = SubjectService.validate(subject, true, subjectType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                var subjectTypeName = subjectType && subjectType.name;
                return crudManager.createSubject(subject, subjectTypeName);
            }
            else {
                throw new Error(validationRes.error);
            }
        })
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populate('personalInfo');
        })
        .then(function(result) {
            return res.json(201, result);
        })
        .catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });
    },

    /**
     * @method
     * @name findOne
     * @description GET /subject/:id - retrieve an existing subject
     */
    findOne: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        var query = Subject.findOne(id);
        
        query = QueryService.populateEach(query, req);
        
        // TODO replace true in IF condition with check on getting personal details
        if (true) {
            query.populate('personalInfo');
        }

        query.then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            return co.error(error);
        });

    },

    /**
     * @method
     * @name update
     * @description PUT /subject/:id - update an existing subject.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        var co = new ControllerOut(res);
        var subject = req.body;
        SubjectService.simplify(subject);

        DataType.findOne(subject.type).then(function(dataType) {
            var validationRes = SubjectService.validate(subject, true, dataType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                return crudManager.updateSubject(subject);
            }
            else {
                throw new Error(validationRes.error);
            }
        })
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populate('personalInfo');
        })
        .then(function(result) {
            res.set('Location', req.baseUrl + req.url + '/'  + result.id);
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return co.error(error);
        });
    },

    /**
     * @method
     * @name destroy
     * @description DELETE /subject/:id
     */
    destroy: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param('id');
        var idOperator = TokenService.getToken(req);

        if (!id) {
            return co.badRequest({message: 'Missing subject ID on DELETE request'});
        }

        return BluebirdPromise.props({
            subject: Subject.findOne({id: id}),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: SUBJECT
            })
        })
        .then(function(result) {
            var allowedDataTypes = _.pluck(result.dataTypes, 'id');
            if (allowedDataTypes.indexOf(result.subject.type) > -1) {
                return crudManager.deleteSubject(id);
            }
        })

        .then(function(deleted) {
            if (deleted === undefined) {
                return co.forbidden({message: 'User nor authorized to delete Subject with ID: ' + id});
            }
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
     * @description retrieve all required models for editing/creating a Subject via client web-form
     */
    edit: function(req, res) {
        var co = new ControllerOut(res);
        var id = req.param("id");
        var idOperator = TokenService.getToken(req);
        
        console.log("SubjectController.edit - Decoded ID is: " + idOperator);  

        return BluebirdPromise.props({
            projects: Project.find(),
            subject: SubjectService.getOneAsync(id),
            dataTypes: crudManager.getDataTypesByRolePrivileges({
                idOperator: idOperator,
                model: SUBJECT
            }),
        })
        .then(function(results) {
            return res.json(results);
        })
        .catch(function(err) {
            return co.error(err); 
        });
        
    },

    /**
     * @method
     * @name createGraph
     * @description generate and visualize the (nested/multi level) data graph for a given subject. 
     *              Note: The current limit for the number of instances is 100.
     */
    createGraph:function(req,res){
        var co = new ControllerOut(res);
        var idSubject = req.param("idPatient");
        var fetchSubjectDataTree = sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTree;

        function subjectTreeCb(err, resp) {
            
            if (err){
                console.log(err);
            }
            
            else {
                console.log(resp.rows);
                var links = [];
                BluebirdPromise.map(resp.rows, function(row) {

                    if (row.parent_data !== null) {
                        return {'source':row.parent_data,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }
                    else if(row.parent_sample !== null) {
                        return {'source':row.parent_sample,'target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }
                    else {
                        return {'source':'Patient','target':row.id,'name':row.id,'type':row.type,'metadata':row.metadata};
                    }

                })
                .then(function(link){

                    console.log(link);
                    links = link;
                    var json = {'links':links};
                    return res.json(json);


                })
                .catch(function(err){
                    console.log(err);
                    return co.error(err);
                });
            }
        }

        fetchSubjectDataTree(idSubject, subjectTreeCb);

    },
    /**
     * @method
     * @name createGraphSimple
     * @description generate and visualize the patient's data graph. All the descendant data are shown as children. 
     *              Only one data instance per datatype is shown.
     * @deprecated
     *
     */
    createGraphSimple: function(req,res){
        var co = new ControllerOut(res);
        var fetchSubjectDataTreeSimple = sails.config.xtens.databaseManager.recursiveQueries.fetchSubjectDataTreeSimple;
        var idSubject = req.param("idPatient");
        console.log(idSubject);
        
        function subjectTreeSimpleCb(err,resp) {

            var children = [], child, links = [];
            
            console.log(resp);

            if (resp.rows.length === 0) {
                links = [{
                    'source': 'Patient', 
                    'target': null
                }];
                // var json = {'links':links};
                return res.json({links: links});
            }

            for(var i = 0; i<resp.rows.length; i++) {
                children.push(resp.rows[i].id);
            }

            console.log(children); 

            BluebirdPromise.map(children,function(child){

                var childName;
                return DataType.findOne(child).then(function(dataType){
                    childName = dataType.name;
                    console.log(childName);
                    return {'source':'Patient','target':childName};
                });

            })
            
            .then(function(link){
                console.log(link);
                links = link;
                var json = {'links':links};
                console.log(json);
                return res.json(json);

            })
            
            .catch(function(err){
                return co.error(err);
            });

        }

        fetchSubjectDataTreeSimple(idSubject, subjectTreeSimpleCb);
    }
};

