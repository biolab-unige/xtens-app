/**
 *  @author Massimiliano Izzo
 */
/* jshint node: true */
/* jshint esnext: true */
/* globals _, sails*/
"use strict";

const crudManager = sails.hooks.persistence.crudManager;
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const querystring = require('querystring');

const QueryService = {

    /**
     * @method
     * @name composeFind
     * @param{Request}  req
     * @param{Object} populateOpts
        - contains the property 'blacklisted' {array} - optional list of blackListed fields
     * @return{Promise}
     */
    composeFind: function(req, populateOpts, privileges) {

        const Model = actionUtil.parseModel(req);
        const whereParams = QueryService.parseParams(req,privileges);
        const queryFind = Model.find(QueryService.parseSelect(req))
          .where(whereParams)
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
    composeHeaderInfo: function(req, params) {
        const Model = actionUtil.parseModel(req);
        // sails.log.verbose('QueryService.composeHeaderInfo - Model is:');
        // sails.log.verbose(Model);

        // const params = QueryService.parseParams(req,privileges);

        return crudManager.countData(params)

          .then(count => {
              const pageSize = actionUtil.parseLimit(req), skip = actionUtil.parseSkip(req),
                  numPages = Math.ceil(count/pageSize),
                  currPage = Math.ceil(skip/pageSize), params = req.allParams();
              let queryNext, queryPrevious, queryLast, queryFirst;


              if (currPage < numPages - 1) {
                  queryNext = querystring.stringify(Object.assign(params, { limit: pageSize, skip: pageSize + skip }));
                  queryLast = querystring.stringify(Object.assign(params, { limit: pageSize, skip: (numPages-1)*pageSize }));
              }
              if (currPage > 0) {
                  queryPrevious = querystring.stringify(Object.assign(params, { limit: pageSize, skip: skip - pageSize }));
                  queryFirst = querystring.stringify(Object.assign(params, { limit: pageSize, skip: undefined }));
              }

              return {
                  count: count,
                  pageSize: pageSize,
                  numPages: numPages,
                  currPage: currPage,
                  links: [
                    { value: queryNext ? `${req.baseUrl}${req.path}?${queryNext}` : null, rel: 'next' },
                    { value: queryPrevious ? `${req.baseUrl}${req.path}?${queryPrevious}` : null, rel: 'previous'},
                    { value: queryFirst ? `${req.baseUrl}${req.path}?${queryFirst}` : null, rel: 'first' },
                    { value: queryLast ? `${req.baseUrl}${req.path}?${queryLast}` : null, rel: 'last'}
                  ]
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

    /**
     * @method
     * @name
     * @param {Request} req
     */
    parseParams: function(req,privileges) {
        let params = actionUtil.parseCriteria(req);

        if (!privileges || _.isEmpty(privileges)) {
            return params;
        }
        if(!params.type){
            const arrPrivileges = _.isArray(privileges) ? privileges : [privileges];
            let arrDtPrivId = arrPrivileges.map(el => el.dataType);
            params.type = arrDtPrivId;
        }
        return params;
    }

};

module.exports = QueryService;
