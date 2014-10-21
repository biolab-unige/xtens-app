var expect = chai.expect;
var DataType = xtens.module("datatype");
var Query = xtens.module("query");

describe("Query.Views.Row", function() {
    
    var schema = {
        "header":{
            "schemaName":"STAR",
            "fileUpload":true,
            "description":"Physical description of a star",
            "version":"0.0.1",
            "ontology":""
        },
        "body":[{
            "label":"METADATA GROUP",
            "name":"Basic Properties ",
            "content":[{
                "label":"METADATA FIELD",
                "fieldType":"Text",
                "name":"Name",
                "ontologyUri":null,
                "customValue":null,
                "required":true,
                "sensitive":true,
                "hasRange":false,
                "isList":false,
                "possibleValues":null,
                "hasUnit":false,
                "possibleUnits":null
            },{
                "label":"METADATA FIELD",
                "fieldType":"Integer",
                "name":"Age",
                "ontologyUri":null,
                "customValue":null,
                "required":false,
                "sensitive":false,
                "hasRange":false,
                "isList":false,
                "possibleValues":null,
                "hasUnit":true,
                "possibleUnits":["years"]
            },{
                "label":"METADATA FIELD",
                "fieldType":"Float",
                "name":"Mass",
                "ontologyUri":null,
                "customValue":null,
                "required":true,
                "sensitive":false,
                "hasRange":false,
                "isList":false,
                "possibleValues":null,
                "hasUnit":true,
                "possibleUnits":["M☉","kg"]
            },{
                "label":"METADATA FIELD",
                "fieldType":"Text",
                "name":"Class",
                "ontologyUri":null,
                "customValue":null,
                "required":false,
                "sensitive":false,
                "hasRange":false,
                "isList":true,
                "possibleValues":["hypergiant","supergiant","giant","sub-giant","main-sequqnce star","sub-dwarf","white dwarf","brown dwarf"],
                "hasUnit":false,
                "possibleUnits":null
            }]
        },{
            "label":"METADATA GROUP",
            "name":"Star Details",
            "content":[{
                "label":"METADATA LOOP",
                "name":"Planets",
                "content":[{
                    "label":"METADATA FIELD",
                    "fieldType":"Text",
                    "name":"Planet",
                    "ontologyUri":null,
                    "customValue":"Unnamed",
                    "required":false,
                    "sensitive":false,
                    "hasRange":false,
                    "isList":false,
                    "possibleValues":null,
                    "hasUnit":false,
                    "possibleUnits":null}
                ]},{
                    "label":"METADATA FIELD",
                    "fieldType":"Float",
                    "name":"Declination",
                    "ontologyUri":null,
                    "customValue":0.0,
                    "required":false,
                    "sensitive":false,
                    "hasRange":true,
                    "isList":false,
                    "possibleValues":null,
                    "hasUnit":true,
                    "possibleUnits":["degree", "radians"],
                    "min":"-180.0",
                    "max":"180.0",
                    "step":"0.5"
                }]
        }]
    }; //schema

    
    describe("#generateComparisonItem", function() {

        before(function() {
            this.dataTypeModel = new DataType.Model({name: schema.header.schemaName, schema: schema});
        });

        beforeEach(function() { 
            this.view = new Query.Views.Row({fieldList: this.dataTypeModel.getFlattenedFields, model: new Query.RowModel()});
            this.view.render();
        });
    
        it("adds all the numeric comparison options if field type is an integer", function() {
            var comparisonField = this.view.generateComparisonOperator(this.fieldList[1]);
            var comparisonOpts = $(comparisonField).children();
            expect(comparisonOpts).to.have.length(6);
            expect((comparisonOpts)[0].value).to.equal('=');
            expect((comparisonOpts)[1].value).to.equal('<=');
            expect((comparisonOpts)[2].value).to.equal('>=');
            expect((comparisonOpts)[3].value).to.equal('<');
            expect((comparisonOpts)[4].value).to.equal('>');
            expect((comparisonOpts)[5].value).to.equal('<>');
            expect((comparisonOpts)[0].innerHTML).to.equal('&#61');
            expect((comparisonOpts)[1].innerHTML).to.equal('&#8804');
            expect((comparisonOpts)[2].innerHTML).to.equal('&#8805');
            expect((comparisonOpts)[3].innerHTML).to.equal('&#60');
            expect((comparisonOpts)[4].innerHTML).to.equal('&#62');
            expect((comparisonOpts)[5].innerHTML).to.equal('&#8800');
        });
        
        it("adds all the numeric comparison options if field type is a float", function() {
            var comparisonField = this.view.generateComparisonOperator(this.fieldList[2]);
            var comparisonOpts = $(comparisonField).children();
            expect(comparisonOpts).to.have.length(6);
            expect((comparisonOpts)[0].value).to.equal('=');
            expect((comparisonOpts)[1].value).to.equal('<=');
            expect((comparisonOpts)[2].value).to.equal('>=');
            expect((comparisonOpts)[3].value).to.equal('<');
            expect((comparisonOpts)[4].value).to.equal('>');
            expect((comparisonOpts)[5].value).to.equal('<>');
            expect((comparisonOpts)[0].innerHTML).to.equal('&#61');
            expect((comparisonOpts)[1].innerHTML).to.equal('&#8804');
            expect((comparisonOpts)[2].innerHTML).to.equal('&#8805');
            expect((comparisonOpts)[3].innerHTML).to.equal('&#60');
            expect((comparisonOpts)[4].innerHTML).to.equal('&#62');
            expect((comparisonOpts)[5].innerHTML).to.equal('&#8800');
        });
        
        it("adds only equality/inequality comparison options if field type is a text", function() {
            var comparisonField = this.view.generateComparisonOperator(this.fieldList[2]);
            var comparisonOpts = $(comparisonField).children();
            expect(comparisonOpts).to.have.length(2);
            expect((comparisonOpts)[0].value).to.equal('=');
            expect((comparisonOpts)[1].value).to.equal('<>');
            expect((comparisonOpts)[0].innerHTML).to.equal('&#61');
            expect((comparisonOpts)[1].innerHTML).to.equal('&#8800');
        });

    });

});
