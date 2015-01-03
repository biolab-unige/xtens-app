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
    }

};

module.exports = MainController;

