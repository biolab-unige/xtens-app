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
});
