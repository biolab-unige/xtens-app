/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
/* jshint esnext: true */
/* jshint node: true */
/* globals _, sails */
"use strict";

let ControllerOut = require("xtens-utils").ControllerOut;
let DEFAULT_LOCAL_STORAGE = sails.config.xtens.constants.DEFAULT_LOCAL_STORAGE;

let MainController = {

    /**
     * @method
     * @name getFileSystemManager
     * @description retrieve the FileSystem coordinates for the client
     */
    getFileSystemStrategy: function(req, res) {
        let conn = sails.hooks['persistence'].getFileSystem().defaultConnection;
        return res.json(conn);
    },

    /**
     * @method
     * @name excuteCustomDataMangement
     */
    executeCustomDataManagement: function(req, res) {
        let error="";
        let co = new ControllerOut(res);
        let key = req.param('dataType');
        console.log("MainController.executeCustomDataManagement - executing customised function");
        const ps = require("child_process").spawn(sails.config.xtens.customisedDataMap.get(key), {});
        ps.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ps.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
            error += data.toString();
        });

        ps.on('close', (code) => {
            console.log(`child process exited with code ${code}`);

            let cmd = 'rm ' + DEFAULT_LOCAL_STORAGE + '/tmp/*';
            require("child_process").exec(cmd, function(err, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if ((code !== 0 && error)) {
                    return co.error(error);
                }
                console.log("MainController.executeCustomDataManagement - all went fine!");
                return res.ok();
            });
        });

    }

};

module.exports = MainController;
