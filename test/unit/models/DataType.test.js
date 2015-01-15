var expect = require("chai").expect;

describe('DataType', function() {

    describe('#DataType', function() {

        it("should return an item", function(done) {
            Data.find({}).exec(function(err, data) {
                console.log(data);
                expect(data.length).to.equals(fixtures.data.length);

                done();
            });
        });

        it('should return an item', function(done) {
            DataType.find({}).exec(function(err, dataTypes) {
                console.log(dataTypes);
                expect(dataTypes.length).to.equals(fixtures.datatype.length);

                done();
            });
        });

    });

});

