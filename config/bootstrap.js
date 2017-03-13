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
/* jshint node: true */
/* globals sails, PassportService, Operator, Group */
"use strict";

var BluebirdPromise = require("bluebird");

module.exports.bootstrap = function(cb) {
    // loading passport strategies (local, bearer, ...)
    PassportService.loadStrategies();

    // create default operators if no operator is available
    if (sails.config.models.connection !== 'test') {
        sails.on('lifted', function() {

            Group.count().then(function(count) {
                if (count) {
                    return [];
                }
                else {
                    return BluebirdPromise.map(sails.config.defaultGroups, function(group) {
                        return Group.create(group);
                    });
                }
            })
            .then(function(createdGroups) {
                if (!createdGroups) {
                    return [];
                }
                sails.log.verbose(createdGroups);

                Operator.count().then(function(count) {
                    if (count) {
                        return [];
                    }
                    else {
                        let createUser = BluebirdPromise.promisify(PassportService.protocols.local.createUser);
                        return BluebirdPromise.map(sails.config.defaultOperators, function(operator) {
                            return createUser(operator);
                        });
                    }
                })
                .then(function(createdOperators) {
                    sails.log.verbose(createdOperators);
                });
            });
        });

    }
    // It's very important to trigger this callack method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();

};

/*module.exports.bootstrap = function (cb) {

// After we create our users, we will store them here to associate with our pets
var storeGroups = [];

var groups = [{name:'fi'}];
var operators = [{sex: 'M',
email: 'nhjfhry@t5rjyi.girtj',
login: 'fh',
password: '$2a$10$3pOYcOpWWcU868LBB0Gki./n9nrooXyDqSNYz1NJCkvQ480KT5uxO',
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
};*/

/*module.exports.bootstrap = function (cb) {

// After we create our users, we will store them here to associate with our pets
var storeUsers = [];

var users = [{name:'Mike',age:'16'},{name:'Cody',age:'25'},{name:'Gabe',age:'107'}];
var ponys = [{ name: 'Pinkie Pie', color: 'pink'},{ name: 'Rainbow Dash',color: 'blue'},{ name: 'Applejack', color: 'orange'}]

// This does the actual associating.
// It takes one Pet then iterates through the array of newly created Users, adding each one to it's join table
var associate = function(onePony,cb){
var thisPony = onePony;
var callback = cb;

storeUsers.forEach(function(thisUser,index){
console.log('Associating ',thisPony.name,'with',thisUser.name);
thisUser.pets.add(thisPony.id);
thisUser.save(console.log);

if (index === storeUsers.length-1)
return callback(thisPony.name);
})
};


// This callback is run after all of the Pets are created.
// It sends each new pet to 'associate' with our Users
var afterPony = function(err,newPonys){
while (newPonys.length){
var thisPony = newPonys.pop();
var callback = function(ponyID){
console.log('Done with pony ',ponyID)
}
associate(thisPony,callback)
}
console.log('Everyone belongs to everyone!! Exiting.');

// This callback lets us leave bootstrap.js and continue lifting our app!
return cb()
};

// This callback is run after all of our Users are created.
// It takes the returned User and stores it in our storeUsers array for later.
var afterUser = function(err,newUsers){
while (newUsers.length)
storeUsers.push(newUsers.pop())

Pet.create(ponys).exec(afterPony)
};


User.create(users).exec(afterUser)

};
*/
