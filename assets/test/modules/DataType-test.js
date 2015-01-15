var expect = chai.expect;
var should = chai.should();
var i18n = xtens.module("i18n").en;
var DataType = xtens.module("datatype");
var Constants = xtens.module("xtensconstants").Constants;

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


    describe('#getFlattenedFields', function() {

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

    describe('#hasLoops', function() {

        it('returns true if the DataType schema contains at least one loop', function() {
            var model = new DataType.Model({schema: schema});
            var hasLoop = model.hasLoops();
            expect(hasLoop).to.be.true;
        });

        it('returns false if the DataType schema does not contain loops', function() {
            var schemaNoLoop = _.cloneDeep(schema);
            schemaNoLoop.body[1].content.splice(0,1); // remove the loop item from the schema
            var model = new DataType.Model({schema: schemaNoLoop});
            expect(model.hasLoops()).to.be.false;
        });

    });

    describe('#getLoops', function() {
        it('returns the loop contained in the schema', function() {
            var model = new DataType.Model({schema: schema});
            var loops = model.getLoops();
            expect(loops).to.be.instanceof(Array);
            expect(loops).to.have.length(1);
            expect(loops[0].label).to.eql(Constants.METADATA_LOOP);
            expect(loops[0].content[0].label).to.eql(Constants.METADATA_FIELD);
            expect(loops[0].content[0].name).to.equal(schema.body[1].content[0].content[0].name);
        });
    });

    describe("#validate", function() {

        var emptySchema = {
            "header":{
                "schemaName":"STAR",
                "fileUpload":true,
                "description":"Physical description of a star",
                "version":"0.0.1",
                "ontology":""
            },
            "body":[]
        };

        var fieldlessSchema = {
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
                "content":[]
            },{
                "label":"METADATA GROUP",
                "name":"Star Details",
                "content":[{
                    "label":"METADATA LOOP",
                    "name":"Planets",
                    "content":[]
                }]
            }]
        };

        var duplicateFieldsSchema = {
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
                    "name":"name",
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
                    "name":"distance",
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
                    "name":"mass",
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
                    "name":"name",
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
                        "fieldType":"Float",
                        "name":"distance",
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
                        "name":"declination",
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
        };


        it("should return an error for missing group", function() {
            var model = new DataType.Model({name: emptySchema.schemaName, schema: emptySchema});
            var errs = model.validate(model.attributes);
            expect(errs).to.have.length(1);
            expect(errs[0].message).to.equal(i18n("please-add-at-least-a-metadata-group"));
        });

        it("should return an error for missing field", function() {
            var model = new DataType.Model({name: fieldlessSchema.schemaName, schema: fieldlessSchema});
            var errs = model.validate(model.attributes);
            expect(errs).to.have.length(1);
            expect(errs[0].message).to.equal(i18n("please-add-at-least-a-metadata-field"));
        });

        it("should return an error for duplicate fields", function() {
            var model = new DataType.Model({name: fieldlessSchema.schemaName, schema: duplicateFieldsSchema});
            var errs = model.validate(model.attributes);
            expect(errs).to.have.length(1);
            var message = i18n("data-type-has-the-following-duplicate-names") + ": name, distance";
            expect(errs[0].name).to.equal("duplicates");
            expect(errs[0].message).to.equal(message);

        });

    });

});


