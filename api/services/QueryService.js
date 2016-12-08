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
        const queryFind = Model.find(QueryService.parseSelect(req))
            .where(actionUtil.parseCriteria(req))
            .limit(actionUtil.parseLimit(req))
            .skip(actionUtil.parseSkip(req))
            .sort(actionUtil.parseSort(req));

        return actionUtil.populateRequest(queryFind, req, populateOpts);
    },

    /**
     * @method
     * @name composeHeaderInfo
     * @param{Request} req
     * @return{Promise/Object} all the info to be shipped as response header
     */
    composeHeaderInfo: function(req) {
        const Model = actionUtil.parseModel(req);
        return Model.count().where(actionUtil.parseCriteria(req))

        .then(count => {
            const pageSize = actionUtil.parseLimit(req), skip = actionUtil.parseSkip(req),
                numPages = Math.ceil(count/pageSize),
                currPage = Math.ceil(skip/pageSize);

            return {
                count: count,
                pageSize: pageSize,
                numPages: numPages,
                currPage: currPage,
                next: '',
                previous: '',
                first: '',
                last: ''
            };
        });
    },

    /**
     * @method
     * @name
     * @param {Request} req
     */
    parseSelect: function(req) {
        let select = req.param('select');
        if (!select) {
            return null;
        }
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
            sails.log.error(err);
            return null;
        }
    },

};

module.exports = QueryService;
