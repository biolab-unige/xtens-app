/*t
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var transactionHandler = sails.config.xtens.transactionHandler;
var BluebirdPromise = require('bluebird');


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
            var subjectTypeName = subjectType && subjectType.name;
            return transactionHandler.createSubject(subject, subjectTypeName);
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
        transactionHandler.updateSubject(subject)
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
        var idOperator = req.session.operator && req.session.operator.id;

        async.parallel({
            
            projects: function(callback) {
                Project.find().exec(callback);
            },

            dataTypes: function(callback) {
                // DataTypeService.get(callback, { classTemplate: 'Subject'});
                DataTypeService.getByOperator(idOperator, {classTemplate: 'Subject'}, callback);
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

    createGraph: function(req,res){
        
        
        var idPatient = req.param("idPatient");

     Subject.query('select data_type.id from data_type inner join sample on data_type.id = sample.type where parent_subject ='+idPatient+' union select data_type.id from data_type inner join data on data_type.id = data.type where parent_subject ='+idPatient+';',function(err,resp){
       
        var children = [];

        var child;

        var links = [];
        
        if(resp.rows.length === 0){
        
         links = [{'source':'Patient','target':null}];
         return res.json({'links':links});
        }
        

        for(var i = 0;i<resp.rows.length;i++)
        {
          children.push(resp.rows[i].id);
        }
       
    

        BluebirdPromise.map(children,function(child){
       
 
        var childName;
     return DataType.findOne(child).then(function(dataType){
        childName = dataType.name;
        var parents = dataType.schema.header.parents;
        
      return DataType.findOne(parents).then(function(source){
        
            return {'source':source.name,'target':childName};

        }); 
        });
        }).then(function(link){
        console.log(link);
        links = link;
         var json = {'links':links};
            console.log(json);
            return res.json(json);


        });
        
        
        });      
        

          
    
    }
    

};

