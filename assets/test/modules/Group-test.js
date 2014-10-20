
var should = chai.should();
var expect = chai.expect;
var Group = xtens.module("group");

describe('Group.Views.Edit',function (){
     beforeEach(function(){
        this.group = new Group.Model({name:"pippo"});
      

     });

     describe('#initialize()',function(){
     beforeEach(function(){
         this.view= new Group.Views.Edit({id:this.group.id});
         this.view.render(this.view);
     });
 
     it('should be an initialized object', function() {
            this.view.should.be.an('object');
        });
    
     
     });

});
