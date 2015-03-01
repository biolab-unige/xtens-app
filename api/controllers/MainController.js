/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var MainController = {

    /**
     * @method
     * @name login
     * @description authenticate a user against a password stored on the database
     */
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
    },

    /**
     * @method
     * @name getFileSystemManager
     * @description retrieve the FileSystem coordinates for the client
     */
    getFileSystemStrategy: function(req, res) {
        var conn = sails.config.xtens.fileSystemConnection;
        return res.json(conn);
    },

    upload: function(req, res) {
        req.file('uploadFile').upload(function (err, files) {
            if (err)
                return res.serverError(err);
            console.log(err);

            return res.json({
                message: files.length + ' file(s) uploaded successfully!',
            });
        });
    },

    /*
     * @method
     * @test
     * TODO remove this one! Only for testing EAV catalogue
     *
populateEAV: function(req, res) {
var idData = _.parseInt(req.param("idData"));
console.log("MainController.populateEav - idData = " + idData);
DataService.storeMetadataIntoEAV(idData)

.then(function(res) {
console.log(res);
return res.json(res);
})

.catch(function(err) {
console.log("MainController.populateEav - error caught: " + err);
});
} */

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
    }

};

module.exports = MainController;

