var should = chai.should();
var expect = chai.expect;
var MetadataField = xtens.module("metadatafield");
var Constants = xtens.module("xtensconstants").Constants;
var FieldTypes = xtens.module("xtensconstants").FieldTypes;

describe('MetadataField.Views.Edit', function() {
    beforeEach(function() {
        this.model = new MetadataField.Model();
    });

    describe('#initialize()', function() {
        beforeEach(function() {
            this.model.set({label: Constants.METADATA_FIELD});
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
        it('should have a remove-me icon', function() {
            this.view.$el.find("a.remove-me").should.have.length(1);
        });
        it('should contain first a HTML select with all the fields types', function() {
            this.view.$el.find('select:first option').should.have.length(5);
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
            this.metadataFieldJson.name = "Test MetadataField";
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
            this.view.$('input[name="name"]').val().should.equal(this.metadataFieldJson.name);
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
