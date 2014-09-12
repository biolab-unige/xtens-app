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
            this.view.$el.find();
        });


    });

    describe('#addUnitToList', function() {
    
    });
    
});
