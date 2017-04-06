// /* globals, sails, TokenService, DataTypePrivileges, Group */
// "use strict";
// /**
//  * isWheel
//  *
//  * @module      :: Policy
//  * @description :: Allow any user to manage PersonalData
//  *
//  * @docs        :: http://sailsjs.org/#!documentation/policies
//  *
//  */
// module.exports = function(req, res, next) {
//
//     var payload= TokenService.getToken(req);
//     var params = req.allParams(), dtPrivilege;
//     params.dataType ? dtPrivilege = params : dtPrivilege = {};
//     console.log("Called canManagePrivileges Policy", payload);
//     // User is allowed, proceed to the next policy,
//     // or if this is the last policy, the controller
//     if (payload.isWheel){
//         return next();
//     }
//     if(payload.isAdmin && req.method === "GET" && !params.id){
//         return next();
//     }
//     if (payload.isAdmin && payload.adminGroups.length > 0) {
//         if(req.method === "DELETE" || req.method === "GET" ){
//             DataTypePrivileges.findOne({id: _.parseInt(params.id)}).then( dtprivilege => {
//                 if (!dtprivilege) {
//                     return res.forbidden();
//                 }
//                 dtPrivilege = dtprivilege;
//             });
//         }
//         return Group.find({id: payload.adminGroups}).populate('dataTypes').then(groups => {
//             let groupsDatatypes = _.map(groups, function (g) { return _.map(g.dataTypes,'id'); });
//             groupsDatatypes = _.uniq(_.flatten(groupsDatatypes));
//
//             if (_.indexOf(groupsDatatypes, dtPrivilege.dataType) >= 0){
//
//                 console.log(params, payload);
//                 return next();
//             }
//             else {
//                 return res.forbidden();
//             }
//         });
//     }
//
//     // User is not allowed
//     // (default res.forbidden() behavior can be overridden in `config/403.js`)
//
//     // return next();
//     return res.forbidden();
//
// };
