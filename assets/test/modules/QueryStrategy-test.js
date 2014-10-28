var expect = chai.expect;
var QueryStrategy = xtens.module("querystrategy");

describe("QueryStrategy.PostgresJSON", function() {
    
    var criteriaObj = {
        pivotDataType: { id: 1, name: 'Star', schema: {} },
        content: [
        {
            fieldName: "constellation",
            fieldType: "text",
            comparator: "=",
            fieldValue: "cepheus",
            isList: false
        },
        {
            fieldName: "type", // the stellar type
            fieldType: "text",
            comparator: "IN",
            fieldValue: "hypergiant,supergiant",
            isList: true
        },
        {
            fieldName: "mass",
            fieldType: "float",
            comparator: ">=",
            fieldValue: "1.5",
            fieldUnit: "M☉"
        },
        {
            comparator: ">",
            fieldName: "distance",
            fieldType: "integer",
            fieldUnit: "pc",
            fieldValue: "50"
        }
        ]
    };

    describe("#compose", function() {

        before(function() {
            this.strategy = new QueryStrategy.PostgresJSON();
        });
        /*
        it("compose a query from a criteria object", function() {
            var parameteredQuery = this.strategy.compose(criteriaObj);
            var statement = "SELECT * FROM data WHERE type = $1 AND (" +
                "(metadata->$2->'value'->>0)::text = $3 AND " +
                "(metadata->$5->'value'->>0)::text IN ($6) AND " +
                "(metadata->$8->'value'->>0)::float >= $9 AND " + "(metadata->$8->'unit'->>0)::text = $10 AND " +
                "(metadata->$11->'value'->>0)::integer > $12 AND " + "(metadata->$11->'unit'->>0)::text = $13" +
                ");";
            var parameters = [ criteriaObj.pivotDataType.id, 
                criteriaObj.content[0].fieldName, criteriaObj.content[0].fieldValue, criteriaObj.content[0].fieldUnit,
                criteriaObj.content[1].fieldName, criteriaObj.content[1].fieldValue, criteriaObj.content[1].fieldUnit, 
                criteriaObj.content[2].fieldName, criteriaObj.content[2].fieldValue, criteriaObj.content[2].fieldUnit,
                criteriaObj.content[3].fieldName, criteriaObj.content[3].fieldValue, criteriaObj.content[3].fieldUnit ];
            expect(parameteredQuery).to.have.property('query');
            expect(parameteredQuery).to.have.property('parameters');
            expect(parameteredQuery.statement).to.equal(statement);
            expect(parameteredQuery.parameters).to.eql(parameters);
        });
        */
    });

});
