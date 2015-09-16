var should = chai.should();
var expect = chai.expect;
var MetadataField = xtens.module("metadatafield");
var Constants = xtens.module("xtensconstants").Constants;
var FieldTypes = xtens.module("xtensconstants").FieldTypes;

describe("MetadataField.Model", function() {
    
    describe('#formatName', function() {
        
        beforeEach(function() {
            this.model = new MetadataField.Model();
        });

        it('formats correctly a single word name', function() {
            this.model.set("name", "test");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("test");
        });

        it('formats correctly whitespaces and capitals', function() {
            this.model.set("name", "Test name");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("test_name");
        });


        it('formats correctly a name with parentheses and whitespaces', function() {
            this.model.set("name", "test name (with parentheses)");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("test_name__with_parentheses_");
        });

        it('formats correctly a name with numbers', function() {
            this.model.set("name", "2force80");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("$2force80");
        });

        it('formats correctly a name with numbers and slashes and tabs', function() {
            this.model.set("name", "280/230 test");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("$280_230_test");
        });
        
        it('formats correctly a name with capital letters', function() {
            this.model.set("name", "Capitalized Name CN");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("capitalized_name_cn");
        });

        it("formats correctly a name with dots", function() {
            this.model.set("name", "Dotted Name S.P.E.C.T.R.E.");
            this.model.formatName();
            expect(this.model.get("formattedName")).to.equal("dotted_name_s_p_e_c_t_r_e_");
        });
    });

});

describe('MetadataField.Views.Edit', function() {
    beforeEach(function() {
        this.model = new MetadataField.Model({
            name: "prova",
            customValue: "testValue",
            required: true,
            isList: true,
            possibleValues: ["value_1", "value_2", "value_3"],
            hasUnit: true,
            possibleUnits: ["m"]
        });
    });

    describe('#initialize()', function() {
        beforeEach(function() {
            this.view = new MetadataField.Views.Edit({model: this.model});
        });

        it('should be an initialized object', function() {
            this.view.should.be.an('object');
        });
    });

    describe('#render()', function() {
        beforeEach(function() {
            this.view.render();
        });
        it('should not have a remove-me icon, since the model is not empty', function() {
            this.view.$el.find("a.remove-me").should.have.length(0);
        });
        it('should contain first a HTML select with all the fields types', function() {
            this.view.$el.find('select:first option').should.have.length(5);
        });
        
        it('should show each property with the right value', function() {
            var that = this;
            _.each(this.view.bindings, function(value, key) {
                if (typeof value === 'string'){
                    if (val) {
                        expect(that.view.$(key).val()).to.equal(that.view.model.get(value));
                    }
                }
                else {
                    var property = value.observe;
                    var val = value.getVal ? value.getVal(that.view.$(key)) : that.view.$(key).val();
                    if (val) {
                        expect(that.view.model.get(property)).to.eql(val);
                    }

                }
            });
        });
    });

    /*
       describe('#addvalueToList', function() {
       beforeEach(function() {
       this.view.render();
       });

       it('should add the written value to the list', function() {
       var testString = "test string value";
       this.view.$("input.value-to-add").val(testString);
       this.view.addValueToList();
       var $valueSel = this.view.$("select.value-list");
       $valueSel.children("option").should.have.length(1);
       $valueSel.children("option:first").html().should.equal(testString);
       });

       it('should clean the value-to-add textbox after adding', function() {
       var testString = "test string value"; 
       this.view.$("input.value-to-add").val(testString);
       this.view.addValueToList();
       var value = this.view.$("input.value-to-add").val();
       value.should.be.empty;
       });

       it('should not add a value that already exists', function() {
       var testString = "test string value";
       var theSameString = "test string value";
       var anotherTestString = "another one!";
       this.view.$("input.value-to-add").val(testString);
       this.view.addValueToList();
       this.view.$("input.value-to-add").val(theSameString);
       this.view.addValueToList();
       var $valueSel = this.view.$("select.value-list");
       $valueSel.children("option").should.have.length(1);
       this.view.$("input.value-to-add").val(anotherTestString);
       this.view.addValueToList();
       $valueSel.children("option").should.have.length(2);
       this.view.$("input.value-to-add").val(theSameString);
       this.view.addValueToList();
       $valueSel.children("option").should.have.length(2);
       $valueSel.children("option:first").val().should.equal(testString);
       $valueSel.children("option:first").html().should.equal(testString);
       $valueSel.children("option").eq(1).val().should.equal(anotherTestString);
       $valueSel.children("option").eq(1).html().should.equal(anotherTestString);
       });

       }); 

       describe('#addUnitToList', function() {

       }); */

    describe('#render()', function() {

        beforeEach(function() {
            this.metadataFieldJson = {label: Constants.METADATA_FIELD };
            this.metadataFieldJson.fieldType = FieldTypes.TEXT;
            this.metadataFieldJson.name = "test_metadata_field";
            this.metadataFieldJson.required = true;
            this.metadataFieldJson.isList = true;
            this.metadataFieldJson.hasUnit = true;
            this.metadataFieldJson.possibleValues = ["firstValue", "secondValue", "thirdValue"];
            this.metadataFieldJson.possibleUnits = ["metre", "second", "candela"];
            this.metadataFieldJson.fromDatabaseCollection = false;
            this.metadataFieldJson.customValue = '';
            this.model.set(this.metadataFieldJson);
            this.view = new MetadataField.Views.Edit({model: this.model});
        });

        it('should populate the template with the values contained in the MetadataField JSON object', function() {
            this.view.render();
            this.view.$('.field-type option:selected').val().should.equal(this.metadataFieldJson.fieldType);
            this.view.$('input[name="name"]').val().should.equal(this.metadataFieldJson.name.replace("_"," "));
            this.view.$('input[type="checkbox"][name="isList"]').prop('checked').should.be.true;
            var values =  this.view.$('input[type="hidden"].value-list').val().split(",");
            expect(values).to.have.length(3);
            for (var i=0, len=values.length; i<len; i++) {
                values[i].should.equal(this.metadataFieldJson.possibleValues[i]);
            } 
        });

    });

    describe('#serialize()', function() {
        beforeEach(function() {
            this.metadataFieldJson = {label: Constants.METADATA_FIELD };
            this.metadataFieldJson.fieldType = FieldTypes.TEXT;
            this.metadataFieldJson.name = "Test MetadataField";
            this.metadataFieldJson.required = true;
            this.metadataFieldJson.isList = true;
            this.metadataFieldJson.hasUnit = true;
            this.metadataFieldJson.possibleValues = ["firstValue", "secondValue", "thirdValue"];
            this.metadataFieldJson.possibleUnits = ["metre", "second", "candela"];
            this.metadataFieldJson.fromDatabaseCollection = false;
            this.metadataFieldJson.customValue = '';
            this.metadataFieldJson.ontologyUri = 'http://no-uri#no';
            this.model.set(this.metadataFieldJson);
            this.view = new MetadataField.Views.Edit({model: this.model});
        });

        it('should give you back the json you initially set', function() {
            this.view.render();
            var serialized = this.view.serialize();
            _.each(serialized,  function(value, key) {
                expect(this.metadataFieldJson[key]).to.equal.value;
            }, this);
            // _.isEqual(this.metadataFieldJson, serialized).should.be.true;
        });
    });

    afterEach(function() {
        this.view.remove();
    });

});
