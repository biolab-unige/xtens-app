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
    }
    


};

module.exports = QueryService;
