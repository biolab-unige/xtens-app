/**
 *  @author Massimiliano Izzo
 */
/* jshint node: true */
/* jshint esnext: true */
/* globals _, sails, */
"use strict";

const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

const QueryService = {

    /**
     * @method
     * @name composeFind
     * @param{Request}  req
     * @param{Object} populateOpts
        - contains the property 'blacklisted' {array} - optional list of blackListed fields
     * @return{Promise}
     */
    composeFind: function(req, populateOpts) {
        const Model = actionUtil.parseModel(req);
        let query = Model.find(QueryService.parseSelect(req))
            .where(actionUtil.parseCriteria(req))
            .limit(actionUtil.parseLimit(req))
            .skip(actionUtil.parseSkip(req))
            .sort(actionUtil.parseSort(req));

        return actionUtil.populateRequest(query, req, populateOpts);
    },

    /**
     * @method
     * @name
     * @param {Request} req
     */
    parseSelect: function(req) {
        let select = req.param('select');
        try {
            select = JSON.parse(select);
            if (_.isEmpty(select)) {
                return null;
            }
            select = _.isArray(select) ? select : null;
            sails.log.debug(select);
            return {
                'select': select
            };
        }
        catch(err) {
            sails.log.error(err.message);
            return null;
        }
    },

};

module.exports = QueryService;
