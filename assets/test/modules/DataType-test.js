var expect = chai.expect;
var should = chai.should();
var DataType = xtens.module("datatype");

describe('DataType', function() {

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
                "fieldType":"Float",
                "name":"Distance",
                "ontologyUri":null,
                "customValue":null,
                "required":false,
                "sensitive":false,
                "hasRange":false,
                "isList":false,
                "possibleValues":null,
                "hasUnit":true,
                "possibleUnits":["ly","pc","km"]
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


    describe('#getFields', function() {

        it('returns a 1-d array with all the metadata fields', function() {
            var model = new DataType.Model({schema: schema});
            var flattened = model.getFlattenedFields() || [];
            expect(flattened).to.have.length(6);
            flattened.forEach(function(field){
                expect(field.label).to.equal("METADATA FIELD");
            });
            expect(flattened[0].name).to.equal('Name');
            expect(flattened[1].name).to.equal('Distance');
            expect(flattened[2].name).to.equal('Mass');
            expect(flattened[3].name).to.equal('Class');
            expect(flattened[4].name).to.equal('Planet');
            expect(flattened[5].name).to.equal('Declination');



        });

    });

});


