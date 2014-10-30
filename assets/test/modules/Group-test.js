
var should = chai.should();
var expect = chai.expect;
var Group = xtens.module("group");

describe('Group.Views.Edit',function (){
     beforeEach(function(){
        this.group = new Group.Model({name:"pippo",id:15});
      

     });

     describe('#initialize()',function(){
     beforeEach(function(){
         this.view= new Group.Views.Edit({id:this.group.id});
         this.view.render(this.group);
     });
 
     it('should be an initialized object', function() {
            this.view.should.be.an('object');
        });
     
     it('should show name property with the right value',function(){
        var that = this;
        console.log(that.view);
        expect(that.view.$(name).val()).to.equal(that.group.get("name"));
     });
    
     
     });

});
