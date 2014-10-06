/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://links.sailsjs.org/docs/config/bootstrap
 */

module.exports.bootstrap = function(cb) {




  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};

/*
module.exports.bootstrap = function (cb) {

// After we create our users, we will store them here to associate with our pets
var storeGroups = []; 

var groups = [{name:'Mikedisajfi'}];
var operators = [{sex: 'M',
   email: 'nhjfhry@t5rjyi.girtj',
   login: 'tryjrtyh',
   password: '$2a$10$3pOYcOpWWcU868LBB0Gki./n9nrooXyDqSNYz1NJCkvQ480KT5uxO',
   id: 149,
   firstName: 'erierdfsuifh8',
   lastName: 'gdfgji',
   birthDate: 'Thu Sep 23 2014 00:00:00 GMT+0200 (CEST)'}]

// This does the actual associating.
// It takes one Pet then iterates through the array of newly created Users, adding each one to it's join table
var associate = function(oneOper,cb){
  var thisOper = oneOper;
  var callback = cb;

  storeGroups.forEach(function(thisGroup,index){
    console.log('Associating ',thisGroup.name,'with',thisOper.login);
    thisGroup.operators.add(thisOper.id);
    thisGroup.save(console.log);

    if (index === storeGroups.length-1)
      return callback(thisOper.login);
  })
};


// This callback is run after all of the Pets are created.
// It sends each new pet to 'associate' with our Users  
var afterOper= function(err,newOperators){

  while (newOperators.length){
    var thisOper = newOperators.pop();
    var callback = function(operID){
      console.log('Done with oper ',operID)
    }
    associate(thisOper,callback)
  }
  console.log('Everyone belongs to everyone!! Exiting.');

  // This callback lets us leave bootstrap.js and continue lifting our app!
  return cb()
};

// This callback is run after all of our Users are created.
// It takes the returned User and stores it in our storeUsers array for later.
var afterGroup = function(err,newGroups){
  while (newGroups.length)
    storeGroups.push(newGroups.pop())
 
  Operator.create(operators).exec(afterOper)
};


Group.create(groups).exec(afterGroup)

}; */
