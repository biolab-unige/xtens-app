/**
 *  @author Massimiliano Izzo
 */
/* jshint node: true */
/* jshint esnext: true */
/* globals _, sails, Data, DataService */
"use strict";

const DEFAULT_SORT = 'id DESC';

let QueryService = {

    /**
     * @method
     * @name tryToParseJSON
     * @param {string} json - the string to parse as JSON
     * @return {JSON} if the string can be parsed, a valid JSON
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    tryToParseJSON: function(json) {
        if (!_.isString(json)) return null;
        try {
            return JSON.parse(json);
        }
        catch (e) {
            return e;
        }
    },

    /**
     * @method
     * @name parseCriteria
     * @param {Request} - req
     * @return {Object} - the criteria Object
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseCriteria: function(req) {

        // Look for explicitly specified `where` parameter.
        let where = req.allParams().where;

        // If `where` parameter is a string, try to interpret it as JSON
        if (_.isString(where)) {
            where = QueryService.tryToParseJSON(where);
        }

        // If `where` has not been specified, but other unbound parameter variables
        // **ARE** specified, build the `where` option using them.
        if (!where) {
            where = req.allParams();

            // Omit built-in runtime config (like query modifiers)
            where = _.omit(where, ['limit', 'skip', 'sort', 'populate']);

            // Omit any params w/ undefined values
            where = _.omit(where, p => { if (_.isUndefined(p)) return true; });
        }

        return where;
    },

    /**
     * @method
     * @name parseLimit
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseLimit: function(req) {
        let DEFAULT_LIMIT = sails.config.blueprints.defaultLimit || 100;
        let limit = req.param('limit') || DEFAULT_LIMIT;
        if (limit) { limit = +limit; }
        return limit;
    },

    /**
     * @method
     * @name parseSkip
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseSkip: function (req) {
        let DEFAULT_SKIP = 0;
        let skip = req.param('skip') || DEFAULT_SKIP;
        if (skip) { skip = +skip; }
        return skip;
    },

    /**
     * @method
     * @name parseSort
     * @param  {Request} req
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseSort: function (req) {
        return req.param('sort') || DEFAULT_SORT;
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
             console.log(select);
             return {
                 'select': select
             };
         }
         catch(err) {
             console.log(err.message);
             return null;
         }
     },

    dataSearch: function(queryParams) {
        let queryBuilder = sails.config.xtens.queryBuilder;
        let query = queryBuilder.compose(queryParams);
        console.log(query.statement);
        console.log(query.parameters);
        // Using prepared statements as an additional protection against SQL injection
        Data.query({
            text: query.statement,
            values: query.parameters
        }, function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result.rows);
            }
        });
    },

    /**
     * Given a Waterline query and an express request, populate
     * the appropriate/specified association attributes and
     * return it so it can be chained further ( i.e. so you can
     * .exec() it )
     *
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     *
     * @param  {Query} query         [waterline query object]
     * @param  {Request} req
     * @param {Object} options, it may contain:
     *                 - blacklist{Array}: a list of items that must not be populated
     * @return {Query}
     */
    populateRequest: function(query, req, options) {
        let DEFAULT_POPULATE_LIMIT = req._sails.config.blueprints.defaultLimit || 100;
        let _options = req.options;
        let aliasFilter = req.param('populate');
        let shouldPopulate = _options.populate;

        // Convert the string representation of the filter list to an Array. We
        // need this to provide flexibility in the request param. This way both
        // list string representations are supported:
        //   /model?populate=alias1,alias2,alias3
        //   /model?populate=[alias1,alias2,alias3]
        if (typeof aliasFilter === 'string') {
            aliasFilter = aliasFilter.replace(/\[|\]/g, '');
            aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
        }

        let associations = [];

        _.each(_options.associations, association => {
            // If an alias filter was provided, override the blueprint config.
            if (aliasFilter) {
                shouldPopulate = _.contains(aliasFilter, association.alias);
            }

            // Only populate associations if a population filter has been supplied
            // with the request or if `populate` is set within the blueprint config.
            // Population filters will override any value stored in the config.
            //
            // Additionally, allow an object to be specified, where the key is the
            // name of the association attribute, and value is true/false
            // (true to populate, false to not)
            if (shouldPopulate) {
                let populationLimit =
                    _options['populate_' + association.alias + '_limit'] ||
                    _options.populate_limit ||
                    _options.limit ||
                    DEFAULT_POPULATE_LIMIT;

                associations.push({
                    alias: association.alias,
                    limit: populationLimit
                });
            }
        });

        // omit blacklisted populated items (added by Massi)
        if (options && _.isArray(options.blacklist)) {
            associations = _.remove(associations, association => {
                return options.blacklist.indexOf(association.alias) < 0;
            });
        }

        return QueryService.populateQuery(query, associations, req._sails);
    },

    /**
     * Given a Waterline query, populate the appropriate/specified
     * association attributes and return it so it can be chained
     * further ( i.e. so you can .exec() it )
     *
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     *
     * @param  {Query} query         [waterline query object]
     * @param  {Array} associations  [array of objects with an alias
     *                                and (optional) limit key]
     * @return {Query}
     */
    populateQuery: function(query, associations, sails) {
        let DEFAULT_POPULATE_LIMIT = (sails && sails.config.blueprints.defaultLimit) || 100;

        return _.reduce(associations, (query, association) => {
            return query.populate(association.alias, {
                limit: association.limit || DEFAULT_POPULATE_LIMIT
            });
        }, query);
    },

};

module.exports = QueryService;
