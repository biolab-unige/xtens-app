var expect = require("chai").expect;

describe('DataType', function() {

    it("should return an item", function(done) {
        Data.find({}).exec(function(err, data) {
            console.log(data);
            expect(data.length).to.equals(fixtures.data.length);

            done();
            return;
        });
    });

    it('should return an item', function(done) {
        DataType.find({}).exec(function(err, dataTypes) {
            console.log(dataTypes.length,fixtures.datatype.length);
            expect(dataTypes.length).to.equals(fixtures.datatype.length);

            done();
            return;
        });
    });

});
