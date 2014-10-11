/**
 *  @author Massimiliano Izzo
 */
var SubjectService = {

    createWithPersonalDetails: function(subject, res, next) {

    },

    createSubject: function(subjectObj) {
        // Subject.create(subjectObj).
    },

    anonymize: function() {},
    
    /**
     * Terminate a transaction during CRUD operations
     */
    terminateTransaction: function(error, results, res) {
        if (error) {
            Subject.query('ROLLBACK', function(err, rolledback) {
                if (err) {
                    res.send(500, "Tried to rollback, but failed.");
                }
                else {
                    res.send(400, error);
                }
            });
        }
        else {
            Subject.query('COMMIT', function(err, committed) {
                if (err) {
                    res.send(500, "Commit failed.");
                }
                else {
                    res.json(results.subject);
                }
            });
        }
    }

};
module.exports = SubjectService;
