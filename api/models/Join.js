/**
* Join.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
   
    connection:'postgresql',
    tableName: 'group_operators__operator_groups',
    schema:true,
    attributes: {
     
        group:{
          type:'int',
          columnName:'group_operators'},     

        operator:
            {
            
           type:'int',
          columnName:'operator_groups'
  
  
}

  }
};

