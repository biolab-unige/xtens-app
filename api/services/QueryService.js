/**
 *  @author Massimiliano Izzo
 */

var QueryService = {

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
        var where = req.allParams().where;

        // If `where` parameter is a string, try to interpret it as JSON
        if (_.isString(where)) {
            where = DataService.tryToParseJSON(where);
        }

        // If `where` has not been specified, but other unbound parameter variables
        // **ARE** specified, build the `where` option using them.
        if (!where) {
            where = req.allParams();

            // Omit built-in runtime config (like query modifiers)
            where = _.omit(where, ['limit', 'skip', 'sort', 'populate']);

            // Omit any params w/ undefined values
            where = _.omit(where, function (p){ if (_.isUndefined(p)) return true; });
        }

        return where;
    },

    /**
     * @method
     * @name parseLimit
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseLimit: function(req) {
        var DEFAULT_LIMIT = sails.config.blueprints.defaultLimit || 30;
        var limit = req.param('limit') || DEFAULT_LIMIT;
        if (limit) { limit = +limit; }
        return limit;
    },

    /**
     * @method
     * @name parseSkip
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    parseSkip: function (req) {
        var DEFAULT_SKIP = 0;
        var skip = req.param('skip') || DEFAULT_SKIP;
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
        return req.param('sort') || undefined;
    },

    dataSearch: function(queryParams) {
        var queryBuilder = sails.config.xtens.queryBuilder;
        var query = queryBuilder.compose(queryParams);
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
      TODO test this tomorrow with DataType (by Massi)
     * Given a Waterline query, populate the appropriate/specified
     * association attributes and return it so it can be chained
     * further ( i.e. so you can .exec() it )
     *
     * @param  {Query} query         [waterline query object]
     * @param  {Request} req
     * @return {Query}
     * mutuated by: https://github.com/balderdashy/sails/blob/master/lib/hooks/blueprints/actionUtil.js
     */
    populateEach: function(query, req) {
        var DEFAULT_POPULATE_LIMIT = sails.config.blueprints.defaultLimit || 30;
        var _options = req.options;
        var aliasFilter = req.param('populate');
        var shouldPopulate = _options.populate;

        // Convert the string representation of the filter list to an Array. We
        // need this to provide flexibility in the request param. This way both
        // list string representations are supported:
        //   /model?populate=alias1,alias2,alias3
        //   /model?populate=[alias1,alias2,alias3]
        if (typeof aliasFilter === 'string') {
            aliasFilter = aliasFilter.replace(/\[|\]/g, '');
            aliasFilter = (aliasFilter) ? aliasFilter.split(',') : [];
        }

        return _(_options.associations).reduce(function populateEachAssociation (query, association) {

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
                var populationLimit =
                    _options['populate_'+association.alias+'_limit'] ||
                    _options.populate_limit ||
                    _options.limit ||
                    DEFAULT_POPULATE_LIMIT;

                return query.populate(association.alias, {limit: populationLimit});
            }
            else return query;
        }, query);
    }

};

module.exports = QueryService;
