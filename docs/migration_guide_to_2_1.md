# Migration guide from XTENS 2.0 TO 2.1

 
* Download the release 2.1 and extract files

* Run all preliminar commands to install dependencies and packages [link](https://github.com/biolab-unige/xtens-app#installation-ubuntu-server)


### Database Istructions

- Login with postgres user:

        sudo su postgres
     
- Create a backup of existing xtens db:

        pg_dump xtensdb > /path/xtens_db_backup.sql 
    
- Create a new db: 

        createdb xtensdb-2-1 -O xtensuser
        
- Import the backup into new db :

        psql xtensdb-2-1 < /path/xtens_db_backup.sql
        
- Edit file ```db_migration_from 2_0_to_2_1.sql``` located in ```scripts/migration/``` to set the id of default project (last line): 

        SELECT * FROM main_migration(id_project); -- set the id of default project
            
- Run the script to execute the migration: 

        psql xtensdb-2-1 < /path/xtens/2.1/scripts/migration/db_migration_from 2_0_to_2_1.sql
 
- Copy from old xtens folder, ```config/local.js``` file and modify the db configuration with new db name (e. from xtensdb to xtensdb-2-1):
        
        ...
        connections: {

            'default': 'postgresql',            //your default database connection

            postgresql: {                       //your database connection

                adapter: 'sails-postgresql',           
                host: '127.0.0.1',                       
                port: '5432',                  
                user: 'user',                   
                password: 'password',           
                database: 'NEW_xtensdatabase_2_1',      //NEW DB NAME 
                schema: true
            },
        },
        ...

- Last set your connection in ```config/models.js``` file

          module.exports.models = {

              migrate: 'safe',      
              connection: 'postgresql'  // your db connection name

          };
          
          
- Start the application: 
          
          NODE_ENV=production forever start app.js
