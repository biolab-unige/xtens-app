var expect = require('chai').expect,
sinon = require('sinon');

var callback = sinon.stub();
callback.withArgs(null,null).returns(0);
callback.returns(1);

describe('DataService', function() {



    describe('#getOneAsync', function() {

        var spy;

        beforeEach(function() {
            spy = sinon.spy(Data, "findOne");
        });

        afterEach(function() {
            Data.findOne.restore();
        });

        it("should not fire the Data.findOne method with ", function() {
            DataService.getOneAsync(callback, null);
            DataService.getOneAsync(callback, 0);
            expect(spy.called).to.be.false;
        });

        it("should fire the Data.findOne operation", function() {
            DataService.getOneAsync(callback, 1);
            expect(spy.withArgs(1).calledOnce).to.be.true;
        });

    });

    describe("#queryAndPopulateItemsById", function() {
        
        var dataSpy, subjectSpy, sampleSpy;

        beforeEach(function() {
            this.dataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
            dataSpy = sinon.spy(Data, "find");
            sampleSpy = sinon.spy(Sample, "find");
            subjectSpy = sinon.spy(Subject, "find");
        });

        afterEach(function() {
            Data.find.restore();
            Subject.find.restore();
            Sample.find.restore();
        });

        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var subjParam = [{id: 0}];
            DataService.queryAndPopulateItemsById(callback, subjParam, this.dataTypeClasses.SUBJECT);
            expect(subjectSpy.called).to.be.true;
        });

        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var sampleParam = [{id: 1}];
            DataService.queryAndPopulateItemsById(callback, sampleParam, this.dataTypeClasses.SAMPLE);
            expect(sampleSpy.called).to.be.true;
        });
        
        it("#should fire a the proper Model.find call depending on the classTemplate", function() {
            var dataParam = [{id: 3}];
            DataService.queryAndPopulateItemsById(callback, dataParam, this.dataTypeClasses.GENERIC);
            expect(dataSpy.called).to.be.true;
        });


    });

});
