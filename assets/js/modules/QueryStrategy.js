(function(xtens, QueryStrategy) {

    QueryStrategy.PostgresJSON = function() {

        function getSubqueryRow(element, index) {
            var nameParam = '$'+(index*3+2), valueParam = '$'+(index*3+3), unitParam = '$'+(index*3+4);
            var fieldValueOpener = element.isList ? " (" : " ";
            var fieldValueCloser = element.isList ? ")" : "";
            var subquery = "(metadata->" + nameParam + "->'value'->>0)::" + element.fieldType.toLowerCase()  + 
                " " + element.comparator + fieldValueOpener + valueParam + fieldValueCloser;
            if (element.fieldUnit) {
                subquery += " AND ";
                subquery += "(metadata->" + nameParam + "->'unit'->>0)::text = " + unitParam;
            }
            return subquery;
        }

        this.compose = function(serializedCriteria) {
            var query = "SELECT * FROM data WHERE type = $1 AND (";
            var parameters = [ serializedCriteria.pivotDataType.id ];
            if (serializedCriteria.content) {
                var len = serializedCriteria.content.length;
                for (var i=0; i<len; i++) {
                    var element = serializedCriteria.content[i];
                    query += getSubqueryRow(element, i);
                    parameters.push(element.fieldName, element.fieldValue, element.fieldUnit);
                    if (i < len-1) {
                        query += " AND ";
                    }
                }
            }
            query += ");";
            console.log(query);
            return {statement: query, parameters: parameters}; 
        }; 
    };

} (xtens, xtens.module("querystrategy")));
