/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails, Data, DataFile, DataService, DataTypeService, SubjectService, SampleService, QueryService, TokenService, MigrateService, GeneratedDataService */
"use strict";



// lib/hooks/myhook.js
module.exports = function filecontent(sails){
 // private methods and variables
    let BluebirdPromise = require("bluebird");
    let path = require("path");
    let ControllerOut = require("xtens-utils").ControllerOut;
    const xtensConf = global.sails.config.xtens;
    const PrivilegesError = require('xtens-utils').Errors.PrivilegesError;
    let DEFAULT_LOCAL_STORAGE = xtensConf.constants.DEFAULT_LOCAL_STORAGE;
    const DOWNLOAD = xtensConf.constants.DataTypePrivilegeLevels.DOWNLOAD;
    const EDIT = xtensConf.constants.DataTypePrivilegeLevels.EDIT;

    return {
        defaults:{

        },

        fileSystem : null,

        upload : null,

        downlaod : null,

        configure: function() {

            this.download = function downloadFileContent(req, res) {
                let dataFile;
                let co = new ControllerOut(res);
                let fileId = _.parseInt(req.param('id'));
                let fileSystem = BluebirdPromise.promisifyAll(sails.hooks['persistence'].getFileSystem().manager);
                const operator = TokenService.getToken(req);

                DataFile.findOne(fileId).populate('data').then(result => {

                    dataFile = result;
                    return DataTypeService.getDataTypePrivilegeLevel(operator.id, dataFile.data[0].type);
                })
                  .then(dataTypePrivilege => {

                      if(!dataTypePrivilege || (dataTypePrivilege.privilegeLevel !== DOWNLOAD && dataTypePrivilege.privilegeLevel !== EDIT)){
                          throw new PrivilegesError(`Authenticated user does not have download privileges on the data type ${dataFile.data.id}`);
                      }

                      console.log("downloadFileContent - dataFile");
                      console.log(dataFile);

                      let pathFrags = dataFile.uri.split("/");
                      let fileName = pathFrags[pathFrags.length-1];

                      // set response headers for file download
                      res.setHeader('Content-Disposition', 'attachment;filename='+fileName);

                      return fileSystem.downloadFileContentAsync(dataFile.uri, res);
                  })
                 .then(result => {
                     return res.ok(); // res.json() ??
                 })
                 .catch(function(err) {
                     return co.error(err);
                 });

            };

            this.upload = function uploadFileContent(req, res) {

                let dirName, fileName, fsPath = sails.config.xtens.fileSystemConnection.path,
                    landingDir = sails.config.xtens.fileSystemConnection.landingDirectory;
                  // if the local-fs strategy is not in use, don't allow local file upload
                // if (this.fileSystemManager.type && this.fileSystemManager.type !== 'local-fs') {
                //     return res.badRequest('Files cannot be uploaded on server local file system.');
                // }

              // if path exists use local fs connection, otherwise use default local storage connection
                dirName = fsPath ? path.resolve(fsPath, landingDir) : path.resolve(DEFAULT_LOCAL_STORAGE, 'tmp');

              // fileName = req.param("fileName") || req.param('filename') || 'uploaded-file';
                console.log("MainController.uploadFileContent - dirname: " + dirName);
                // console.log("MainController.uploadFileContent - filename: " + fileName);
                req.file('uploadFile').upload({
                    dirname: dirName,
                    saveAs: function (__newFileStream, cb) {
                        console.log(__newFileStream);
                        console.log(__newFileStream.filename);
                        cb(null, path.basename(__newFileStream.filename));
                    }
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


            };
        },

  //  optional route: attribute to set functionality
  //  before and after controller action
        // route: {
        //     before: {
        //         '/routeA': function(req,res,next) {
        //  // execute for route /route BEFORE
        //  // executing the controller action
        //         }
        //     },
        //     after: {
        //         '/*': function(req, res, next) {
        //  // execute for ALL routes AFTER
        //  // executing the controller action
        //  // e.g. set some 'res' parameters
        //         }
        //     }
        // },

   // initialize is not required, but if included
   // it must return cb();
        initialize: function(cb) {

            let upload =this.upload;
            let download =this.download;
            let routePath = '/fileContent';

            sails.after('hook:persistence:loaded', function() {
                let fileSystem = BluebirdPromise.promisifyAll(sails.hooks['persistence'].getFileSystem());
                // console.log(fileSystem.defaultConnection.type);

                // if (fileSystem.manager.type && this.fileSystem.manager.type !== 'local-fs') {
                if(fileSystem.defaultConnection.type && fileSystem.defaultConnection.type === 'local-fs'){
                    return cb();
                }
                sails.on('router:before', function () {
                    
                    sails.router.bind(routePath, upload, 'POST',{});
                    sails.router.bind(routePath, download, 'GET',{});

                    sails.emit('hook:filecontent:done');
                });
            });
            return cb();
        }
    };
};
