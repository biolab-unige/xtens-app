# Guide to migrate from XTENS 2.0 TO 2.1

 
* Download the release 2.1 and extract the files

* Run all preliminar commands to install dependencies and packages [link](https://github.com/biolab-unige/xtens-app#installation-ubuntu-server)


### Istructions for Database 

- Login with ```postgres``` user:

        sudo su postgres
     
- Create a backup of existing XTENS database:

        pg_dump xtensdb > /path/xtens_db_backup.sql 
    
- Create a new database: 

        createdb xtensdb-2-1 -O xtensuser
        
- Import the backup into new database:

        psql xtensdb-2-1 < /path/xtens_db_backup.sql
        
- Edit the file ```db_migration_from 2_0_to_2_1.sql``` located in ```scripts/migration/``` to set the id of the default project (last line): 

        SELECT * FROM main_migration(id_project); -- set the id of the default project
            
- Run the script to execute migration: 

        psql xtensdb-2-1 < /path/xtens/2.1/scripts/migration/db_migration_from 2_0_to_2_1.sql
 
- Copy from old XTENS folder, ```config/local.js``` file and modify the database configuration with the new database name (e. from xtensdb to xtensdb-2-1):
        
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

- Finally, set your connection in the ```config/models.js``` file

          module.exports.models = {

              migrate: 'safe',      
              connection: 'postgresql'  // your db connection name

          };
          
          
- Start the application: 
          
          NODE_ENV=production forever start app.js
