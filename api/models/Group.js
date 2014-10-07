var Group = {
    connection:'postgresql',
    tableName: 'xtens_group',
    schema:true,
    attributes: {
        name: {
            type: 'string',
            required: true,
            unique:true,
            columnName: 'name'
        },
        createdAt: {
            type:'datetime',
            columnName: 'created_at'
        },
        updatedAt: {
            type:'datetime',
            columnName: 'updated_at'
        },
        members: {
            collection:'operator',
            via:'groups'
        },  
        dataTypes: {
            collection: 'dataType',
            via: 'groups',
            dominant: true
        }
    }
};
module.exports = Group;
