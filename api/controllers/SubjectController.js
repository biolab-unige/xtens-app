/**
 * SubjectController
 * @author      :: Massimiliano Izzo
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    createWithPersonalDetails: function(req, res) {
        var body = req.body;
        console.log(body);
        SubjectService.createWithPersonalDetails(subjectObj);
    }
    
};

