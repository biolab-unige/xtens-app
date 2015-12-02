/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var BluebirdPromise = require("bluebird");
var fileSystemManager = BluebirdPromise.promisifyAll(sails.config.xtens.fileSystemManager);
var ControllerOut = require("xtens-utils").ControllerOut;
var MainController = {

    /**
     * @method
     * @name login
     * @deprecated
     * @description authenticate a user against a password stored on the database
     *
    login:function(req, res){
        var login = req.param("login");
        var password = req.param("password");

        Operator.findOneByLogin(login).exec(function(err, op) {
            if (err) {
                res.status(500).send({ error: "DB Error" });
            } 
            else {
                if (op) {

                    var bcrypt = require("bcrypt");
                    bcrypt.compare(password,op.password, function(err,risp) {

                        if (risp === false) {
                            res.status(400).json({error:"Wrong Password"});
                        }
                        else {
                            req.session.operator = op;
                            req.session.authenticated = true;
                            res.send(op);
                        }
                    });
                }
                else {
                    res.status(400).send({error:"Operator not found"});
                }
            } 
        });
    }, */
    
    /**
     * @method
     * @name logout
     * @deprecated
     *   
    logout: function (req,res){
        req.session.destroy();
        res.redirect('#/login');
    }, */

    /**
     * @method
     * @name getFileSystemManager
     * @description retrieve the FileSystem coordinates for the client
     */
    getFileSystemStrategy: function(req, res) {
        var conn = sails.config.xtens.fileSystemConnection;
        return res.json(conn);
    },

    /**
     * @method
     * @name downloadFileContent
     * @description download a file from the remote file system
     * @param{integer} - id: the file unique ID
     * TODO move to another controller (?)
     */
    downloadFileContent: function(req, res) {

        var co = new ControllerOut(res);
        var fileId = _.parseInt(req.param('id'));

        DataFile.findOne(fileId).then(function(dataFile) {

            console.log("downloadFileContent - dataFile");
            console.log(dataFile);
            
            var pathFrags = dataFile.uri.split("/");
            var fileName = pathFrags[pathFrags.length-1];

            // set response headers for file download 
            res.setHeader('Content-Disposition', 'attachment;filename='+fileName);
            
            return fileSystemManager.downloadFileContentAsync(dataFile.uri, res);
        
        })
        .then(function() {
            return res.ok(); // res.json() ??
        })
        .catch(function(err) {
            return co.error(err);
        });
        
    },
    
    /**
     * @method
     * @name uploadFileContent
     * @description upload a file to the local server storage
     * TODO move to another controller (?)
     */
    uploadFileContent: function(req, res) {

        // if the local-fs strategy is not in use, don't allow local file upload
        if (fileSystemManager.type && fileSystemManager.type !== 'local-fs') {
            return res.badRequest('Files cannot be uploaded on server local file system.');
        }
        
        var dirname = require('path').resolve(sails.config.xtens.fileSystemConnection.path, sails.config.xtens.fileSystemConnection.landingDirectory);
        var fileName = req.param("fileName") || 'uploaded-file';
        console.log("MainController.uploadFileContent - dirname: " + dirname);
        console.log("MainController.uploadFileContent - filename: " + fileName);
        req.file('uploadFile').upload({
            dirname: dirname,
            saveAs: fileName
        },function whenDone(err, files) {
            if (err) {
                console.log(err);
                return res.negotiate(err);
            }

            if (files.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            console.log("MainController.uploadFileContent - file uploaded: " + files[0]);

            return res.json({
                name: files[0]
            });
        });
    },

    /**
     * @method
     * @test
     * TODO remove this one! Only for testing data population
     */
    populateDB: function(req,res) {
        var num = _.isNaN(_.parseInt(req.param("num"))) ? 1 : num;
        GeneratedDataService.generateAll(1)
        
        .then(function(result) {
            console.log("MainController.populateDB: created Patients: " + result);
            return res.json(result);
        })
        
        .catch(function(err) {
            console.log("MainController.populateDB - error caught: " + err.message);
            return res.serverError(err.message);
        });
    },

    /**
     * @method
     * @name migrate
     * TODO remove this one! Only for testing data population
     */
    migrate: function(req, res) {
        console.log(req.allParams());
        var subject = _.parseInt(req.param("idSubj"));
        MigrateService.execute(subject)
        .then(function() {
            return res.ok("Done!");
        })
        .catch(function(err) {
            return res.serverError(err.details || err.message);
        });
    },

    /**
     * @method
     * @name migrateCGH
     * TODO remove this one
     */
    migrateCGH: function(req, res) {
        MigrateService.migrateCGHAsync()
        .then(function() {
            return res.ok();
        })
        .catch(function(err) {
            return res.serverError(err.message);
        });
    }

};

module.exports = MainController;

