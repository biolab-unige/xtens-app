var should = chai.should();
var expect = chai.expect;
var Operator = xtens.module("operator");

describe('Operator.Views.Edit',function (){
    beforeEach(function(){
        this.operator = new Operator.Model({firstName:"Marco",lastName:"Rossi",birthDate:new Date(10-10-1956),sex:"M",email:"vdav@fhasgfuy.ijei",login:"dsahfu",password:"xx"});

    });


    describe('#initialize()',function(){
        beforeEach(function(){
            this.view = new Operator.Views.Edit({ĭd:this.operator.id});
            this.view.render(this.operator);

        });

        it('should be an inizialized object',function(){
            this.view.should.be.an('object');
        });

        it('should show properties with the right value',function(){
            var that = this;
            console.log(this.view);
           expect(that.view.$(first).val()).to.equal(that.operator.get("firstName"));

        });
    });

});
