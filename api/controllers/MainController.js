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

const path = require('path');
const ControllerOut = require("xtens-utils").ControllerOut;
const DEFAULT_LOCAL_STORAGE = sails.config.xtens.constants.DEFAULT_LOCAL_STORAGE;

const MainController = {

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
     * @name getAppUI
     * @description ships the index.html file
     */
    getAppUI: function(req, res) {
        return res.sendfile(path.resolve(__dirname, '..' , '..', 'assets', 'bundles', 'index.html'));
    },

    /**
     * @method
     * @name excuteCustomDataMangement
     */
    executeCustomDataManagement: function(req, res) {
        let error="";
        let co = new ControllerOut(res);
        let key = req.param('dataType');
        sails.log("MainController.executeCustomDataManagement - executing customised function");
        const ps = require("child_process").spawn(sails.config.xtens.customisedDataMap.get(key), {});
        ps.stdout.on('data', (data) => {
            console.log(data.toString());
          
            sails.log(`stdout: ${data}`);
        });

        ps.stderr.on('data', (data) => {
            sails.log(`stderr: ${data}`);
            console.log(data.toString());
            error += data.toString();
        });

        ps.on('close', (code) => {
            sails.log(`child process exited with code ${code}`);

            let cmd = 'rm ' + DEFAULT_LOCAL_STORAGE + '/tmp/*';
            require("child_process").exec(cmd, function(err, stdout, stderr) {
                sails.log('stdout: ' + stdout);
                sails.log('stderr: ' + stderr);
                if ((code !== 0 && error)) {
                    return co.error(error);
                }
                sails.log("MainController.executeCustomDataManagement - all went fine!");
                return res.ok();
            });
        });

    }

};

module.exports = MainController;
