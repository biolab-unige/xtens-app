/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!documentation/
 */


module.exports.policies = {

  // Default policy for all controllers and actions
  // (`true` allows public access)
  // TODO change Passport policy for authentication

    '*': 'bearerAuth',

    'main':{
        '*': true
    },

    'auth': {
        '*': true
    },

    GroupController: {
        '*': ['bearerAuth', 'isWheel'],
        find: ['bearerAuth', 'isAdmin'],
        findOne: ['bearerAuth', 'isAdmin']
    },

    ProjectController: {
        '*': ['bearerAuth', 'isWheel']
    },

    OperatorController: {
        '*': ['bearerAuth', 'isWheel'],
        find: 'bearerAuth',
        'patchPassword': 'bearerAuth'
    },

    DataTypePrivilegesController: {
        '*': ['bearerAuth', 'isWheel'],
        findOne: ['bearerAuth', 'isAdmin'],
        'edit': ['bearerAuth', 'isAdmin'],
        create: ['bearerAuth', 'isAdmin'],
        find: 'bearerAuth'
    },

    DataTypeController: {
        '*':  ['bearerAuth', 'isAdmin'],
        find: 'bearerAuth',
        'edit':  ['bearerAuth', 'isAdmin']
    },

    BiobankController: {
        '*':  ['bearerAuth', 'isAdmin'],
        find: 'bearerAuth'
    },

    ContactInformationController: {
        '*': ['bearerAuth', 'isAdmin']
    },

    PersonalDetailsController: {
        '*':  ['bearerAuth', 'canAccessPersonalData']
    }


	// Here's an example of mapping some policies to run before
  // a controller and its actions
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
