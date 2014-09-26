var expect = chai.expect;
var DataType = xtens.module("datatype");
var Data = xtens.module("data");

describe('Data.Views.Edit', function() {

    before(function() {
        this.dataTypes = [{id:1, name: 'Patient'}, {id:2, name: 'Cell Line'}, {id:3, name: 'Sample'}, {id:4, name: 'Clinical Info'}];
    });

    beforeEach(function() {
        this.model = new Data.Model();
    });

    describe('#initialize()', function() {
        it('should have a select field with 5 options', function() {
            this.model.set({});
            this.view = new Data.Views.Edit({model: this.model, dataTypes: this.dataTypes});
            expect(this.view.$('#dataType').children()).to.have.length(5);
        });
    });

    describe('#dataTypeOnChange', function() {

        beforeEach(function() {
            this.model.set({});
            this.view = new Data.Views.Edit({model: this.model, dataTypes: this.dataTypes});
        });

        it("should have the partial view loaded if a data type has been selected", function() {
            this.model.set("type", 1);
            expect(this.view.$('#metadata-header').children().length).to.be.above(0);          
        });
    });

    describe('#createMetadataForm', function() {

        beforeEach(function() {
            this.model.set({});
            this.view = new Data.Views.Edit({model: this.model, dataTypes: this.dataTypes});
            this.schema = {
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
                            "possibleUnits":null,
                            "min":"-180.0",
                            "max":"180.0",
                            "step":"0.5"
                        }]
                }]
            };    
        }); // beforeEach 

        it('should show each metadata group within a container', function(){
            this.view.createMetadataForm(this.schema);
            var $metadataGroups = this.view.$('#metadata-body').children();
            expect($metadataGroups).to.have.length.above(0);
            $metadataGroups.each(function(index, group) {
                expect($(group).children(':first').html()).to.equal(this.schema.body[index].name);
                expect($(group).children().eq(1).children()).to.be.not.empty;
            });
        });



    }); // createMetadataForm
});
