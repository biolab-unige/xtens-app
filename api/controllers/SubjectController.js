/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;
var BluebirdPromise = require('bluebird');
var SUBJECT = sails.config.xtens.constants.DataTypeClasses.SUBJECT;

module.exports = {

    /**
     *  @method
     *  @name create
     *  @description: POST /subject: create a new subject; transaction-safe implementation
     */
    create: function(req, res) {
        var subject = req.body;
        DataType.findOne(subject.type)
        .then(function(subjectType) {
            var validationRes = SubjectService.validate(subject, true, dataType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                var subjectTypeName = subjectType && subjectType.name;
                return transactionHandler.createSubject(subject, subjectTypeName);
            }
            else {
                throw new Error(validationRes.error);
            }
        })
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return res.serverError(error.message);
        });
    },

    /**
     * @method
     * @name update
     * @description PUT /subject/:ID - update an existing subject.
     *              Transaction-safe implementation
     */
    update: function(req, res) {
        var subject = req.body;
        SubjectService.simplify(subject);

        DataType.findOne(subject.type).then(function(dataType) {
            var validationRes = SubjectService.validate(subject, true, dataType);
            if (validationRes.error === null) {
                subject = validationRes.value;
                return transactionHandler.updateSubject(subject);
            }
            else {
                throw new Error(validationRes.error);
            }
        })
        .then(function(idSubject) {
            console.log(idSubject);
            return Subject.findOne(idSubject).populateAll();
        })
        .then(function(result) {
            return res.json(result);
        })
        .catch(function(error) {
            console.log(error.message);
            return res.serverError(error.message);
        });
    },

    /**
     * @method
     * @name edit
     * @description retrieve all required models for editing/creating a Subject via client web-form
     */
    edit: function(req, res) {

        var id = req.param("id");
        // var idOperator = req.session.operator && req.session.operator.id;
        var idOperator = TokenService.getToken(req);
        console.log("SubjectController.edit - Decoded ID is: " + idOperator);  

        async.parallel({

            projects: function(callback) {
                Project.find().exec(callback);
            },

            dataTypes: function(callback) {
                // DataTypeService.get(callback, { classTemplate: 'Subject'});
                DataTypeService.getByOperator(idOperator, {model: SUBJECT}, callback);
            },

            subject: function(callback) {
                SubjectService.getOne(id, callback);
            }

        }, function(err, results) {
            if (err) {
                return res.serverError(err);
            }
            return res.json(results);

        });

    },

    /**
     * @method
     * @name createGraph
     * @description generate and visualize the (nested/multi level) data graph for a given subject. 
     *              Note: The current limit for the number of instances is 100.
     */
    createGraph:function(req,res){

        var idPatient = req.param("idPatient");

        Subject.query('SELECT concat(\'s_\',s.id) AS id , dt.name as type , s.metadata, CASE WHEN s.parent_sample > 0 THEN concat(\'s_\',s.parent_sample) ELSE NULL END AS parent_sample, NULL AS parent_data FROM sample s  inner join data_type dt on s.type =dt.id  WHERE s.parent_subject=$1UNION ALL SELECT concat(\'d_\',d.id) AS id,dt.name as type, d.metadata, CASE WHEN d.parent_sample > 0 THEN concat(\'s_\',d.parent_sample) ELSE NULL END AS parent_sample, CASE WHEN d.parent_data > 0 THEN concat(\'d_\',d.parent_data) ELSE NULL END AS parent_data FROM data d inner join data_type dt on d.type =dt.id WHERE d.parent_subject=$1  LIMIT 100;',[idPatient], function(err,resp){

            if(err){
                console.log(err);
            }
            else{
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

                }).then(function(link){

                    console.log(link);
                    links = link;
                    var json = {'links':links};
                    return res.json(json);


                }).catch(function(err){
                    console.log(err);

                });
            }
        });

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


        var idPatient = req.param("idPatient");
        console.log(idPatient);

        Subject.query('select data_type.id from data_type inner join sample on data_type.id = sample.type where parent_subject ='+idPatient+' union select data_type.id from data_type inner join data on data_type.id = data.type where parent_subject =' + idPatient + ';', function(err,resp) {

            //Subject.query('select s.metadata,d.name from sample s inner join data_type d on d.id = s.type where parent_subject ='+idPatient+';',function(err,resp){

            var children = [];

            var child;

            var links = [];
            console.log("qui");
            console.log(resp);

            if(resp.rows.length === 0) {
                links = [{'source':'Patient','target':null}];
                var json = {'links':links};
                return res.json(json);
            }

            for(var i = 0;i<resp.rows.length;i++) {
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

            }).then(function(link){
                console.log(link);
                links = link;
                var json = {'links':links};
                console.log(json);
                return res.json(json);

            }).catch(function(err){
                console.log(err);
            });

        });
    }
};

