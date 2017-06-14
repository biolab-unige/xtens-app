# Guide to migrate from XTENS 2.0 TO 2.1

## System Prerequisites:
The following software packages are required to be installed on your system:

* <a href="https://nodejs.org"><img src="https://cloud.githubusercontent.com/assets/14332186/22329480/bf0228ec-e3c1-11e6-9d8b-7840838e177e.png" width="100"></a>   [Node.js v6+](http://nodejs.org/);

* <a href="https://sailsjs.com"><img src="https://cloud.githubusercontent.com/assets/14332186/22330446/8e8e29a4-e3c6-11e6-9e97-bb246d4c8049.png" width="100"></a>   [Sails.js 0.11+](http://sailjs.com);

* <a href="https://www.postgresql.org/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330780/2e1b4b4a-e3c8-11e6-84f0-6cf256719e01.png" width="60"></a>   [PostgreSQL 9.5+](http://www.postgresql.org/) (be sure that postgresql version is >= 9.5. Migration script will fail with previous versions);

* <a href="http://bower.io/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330443/8bda895a-e3c6-11e6-9809-2d0e50c537b6.png" width="50"></a>   [Bower](http://bower.io/). 

* <a href="https://gruntjs.com/"><img src="https://cloud.githubusercontent.com/assets/14332186/23852502/76eeb570-07e8-11e7-9643-fc6ee8f58a84.png" width="50"></a>   [Grunt](https://gruntjs.com/). 
 
 ## Installation (ubuntu server):

* [Download](https://github.com/biolab-unige/xtens-app/releases/tag/2.1.0) the release 2.1


* Move into xtens-app directory:

        cd xtens-app
        
* Install npm packages:
        
        npm install && npm install sails
        
* Install bower packages:

        bower install
        
* Load the bower packages:

        grunt bower
        
* Create logs folder

        mkdir logs

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
