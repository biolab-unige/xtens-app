/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var MainController = {
    login:function(req,res){
    var login = req.param("login");
    var password = req.param("password");

  Operator.findOneByLogin(login).exec(function(err, op) {
        if (err) {
            res.status(500).send({ error: "DB Error" });
        } else {
            if (op) {
               
                var bcrypt = require("bcrypt");
                bcrypt.compare(password,op.password,function(err,risp){
                    
                if(risp===false)
                    {
                  res.status(400).json({error:"Wrong Password"});
                                                  }
                    else{
                    req.session.operator = op;
                    res.send(op);
                    }
                });
   }else
       {res.status(400).send({error:"Operator not found"});
       }
                 
        } 
        });
  }

};

module.exports = MainController;

