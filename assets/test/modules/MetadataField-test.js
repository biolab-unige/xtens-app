var should = chai.should();
var MetadataField = xtens.module("metadatafield");

describe('MetadataField.Views.Edit', function() {
    beforeEach(function() {
        this.view = new MetadataField.Views.Edit();
    });

    describe('#initialize()', function() {
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
            this.view.$el.find('select:first option').should.have.length(4);
        });
    });

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
    
    });
    
});
