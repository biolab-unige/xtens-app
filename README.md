# XTENS 2

[![Build Status](https://travis-ci.org/biolab-unige/xtens-app.svg?branch=master)](https://travis-ci.org/biolab-unige/xtens-app)
[![Coverage Status](https://coveralls.io/repos/github/biolab-unige/xtens-app/badge.svg?branch=master&etc=1)](https://coveralls.io/github/biolab-unige/xtens-app?branch=master)


To migrate from XTENS 2.0 to **2.1** follow the link: [guide](https://github.com/biolab-unige/xtens-app/blob/master/docs/migration_guide_to_2_1.md)


XTENS 2 is an open source web-based digital repository for heterogeneous data in life science.

It is designed with the following features:

* Define simply and quickly complex hierarchical structures without any code updating
* _new v2.1_ Handle multiple projects. For each project, you can define a different Data type structure
* Manage heterogenous data (subjects, samples, any type of data)
* Roles and privileges system to handle data access and allowed operations for any authenticated user
* Allows to handle binary data, organizing them in a distributed storage between all different centers of research
* Execute complex query through a simple and intuitive query builder interface ( based hierarchical data structure dynamically) and then export the query results in Excel format
* Provided by a RestFul Api Interface to allow direct communication with third application programs

# Getting Started

## System Prerequisites:
The following software packages are required to be installed on your system:

* <a href="https://nodejs.org"><img src="https://cloud.githubusercontent.com/assets/14332186/22329480/bf0228ec-e3c1-11e6-9d8b-7840838e177e.png" width="100"></a>   [Node.js v6+](http://nodejs.org/);

* <a href="https://sailsjs.com"><img src="https://cloud.githubusercontent.com/assets/14332186/22330446/8e8e29a4-e3c6-11e6-9e97-bb246d4c8049.png" width="100"></a>   [Sails.js 0.11+](http://sailjs.com);

* <a href="https://www.postgresql.org/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330780/2e1b4b4a-e3c8-11e6-84f0-6cf256719e01.png" width="60"></a>   [PostgreSQL 9.5+](http://www.postgresql.org/);

* <a href="http://bower.io/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330443/8bda895a-e3c6-11e6-9809-2d0e50c537b6.png" width="50"></a>   [Bower](http://bower.io/). 

* <a href="https://gruntjs.com/"><img src="https://cloud.githubusercontent.com/assets/14332186/23852502/76eeb570-07e8-11e7-9643-fc6ee8f58a84.png" width="50"></a>   [Grunt](https://gruntjs.com/). 


## Installation (ubuntu server):

* Download the file .zip or Clone the repository:

        git clone https://github.com/biolab-unige/xtens-app.git
        
* Move into xtens-app directory:

        cd xtens-app
        
* Install npm packages:

        npm [sudo] install sails -g
        
        npm install && npm install sails
        
        npm [sudo] install grunt-cli -g
        
        npm [sudo] install bower -g
        
* Install ruby and sass       

        [sudo] apt-get install ruby
        
        [sudo] gem install sass
        
* Install bower packages:

        bower install
        
* Load the bower packages:

        grunt bower
* Create logs folder

        mkdir logs
        
## Database Configuration:

Now configure PostgreSQL:

* Create a PostreSQL user with a password

* Create a database owned by the user just created

* Import the sql-schema located in xtens-app/db-schema/ into database


Then create a file named ```local.js``` in the ```config/``` directory. This config file should include any settings specific of your local system/setup (db passwords, operators etc.). 

In the minimal setup it should contain the following information, including two default users with two user groups (admin and general user).

           module.exports = {

            port: process.env.PORT || #port,

            environment: process.env.NODE_ENV || 'development',

            connections: {

                'default': 'postgresql',            //your default database connection

                postgresql: {                       //your database connection

                    adapter: 'sails-postgresql',    //sails adapter
                    host: '127.0.0.1',              //ip host
                    port: '5432',                   //db port (postgresql default port 5432)
                    user: 'user',                   //db user
                    password: 'password',           //db user password
                    database: 'xtensdatabase',      //db name
                    schema: true
                },
            },

            defaultGroups: [                        //array of default groups
                {
                    name: "admin",
                    privilegeLevel: "wheel",
                    canAccessPersonalData: true,
                    canAccessSensitiveData: true
                }, {
                    name: "public",
                    privilegeLevel: "standard",
                    canAccessPersonalData: false,
                    canAccessSensitiveData: false
                }
            ],

            defaultOperators: [                      //array of default users
                {
                    firstName: 'default administrator',
                    lastName: 'sysadmin',
                    birthDate: '1970-01-01',
                    sex: 'N.A.',
                    email: 'email@domain.com',
                    login: 'defaultAdmin',
                    password: 'password',
                    groups: [1]                      //operator "defaultAdmin" is associated with group "admin"
                }, {
                    firstName: 'default user',
                    lastName: 'demo user',
                    birthDate: '1970-01-01',
                    sex: 'N.A.',
                    email: 'email@domain.com',
                    login: 'demouser',
                    password: 'password',
                    groups: [2]                     //operator "demouser" is associated with group "public"
                }
            ]
    };
    
Last set your connection  in ```config/models.js``` file


    module.exports.models = {
    
        migrate: 'safe',      
        connection: 'postgresql'  // your db connection name

    };
    
    
## FileSystem Configuration:
You can choose among two options to store raw/bulk data files:


First choice:
### Local FileSystem
This solution uses the file system of the local (server) machine. It is raccomended if it is not necessary share data with different centers or distribuite them across machines

* Edit local.js file in xtens-app/config/ with the proper settings

e.g:

    module.exports = {

        port: ..,
        environment: ..,
        connections: {
            'default': 'dbconnection',
            dbconnection: { ... }
        },

        fileSystemConnections: {
    
            'default': 'localConnection',
    
            localConnection: {
                type: 'local',             
                path: '/filesystem/home/path/',   // your fs home path
                repoDirectory: 'xtens-repo',   // default Directory name
                landingDirectory: 'landing',   // landing directory name
            }
        },
        
        defaultOperators: [{    ...    }]
    };
    
Second choice:
### Irods FileSystem
This is the supported solution for distribuited data grid scenarios, using iRODS (https://irods.org/)
Irods File System Prerequisities:
* Irods Data Grid
* Tomcat Server
    * Java 
* Irods Rest Api

#### Irods
Install and configure irods following the official guide at: https://docs.irods.org/4.1.10/
        
#### Tomcat 

Before install tomcat, must be install Java environment
##### Java

- Install JAVA environment:

        sudo apt-get install python-software-properties
        sudo add-apt-repository ppa:webupd8team/java
        sudo apt-get update
        sudo apt-get install oracle-java7-installer
        
- Set env variable $JAVA_HOME in /etc/environment


        sudo update-alternatives --config java      // Display the JAVA_HOME directory to be setted in $JAVA_HOME
        sudo nano /etc/environment
        JAVA_HOME=/usr/lib/jvm/java-7-oracle        // e.g. line to be added
        source /etc/environment
      
Now can install Tomcat Server (7th version): follow any installation guide like [this](https://www.digitalocean.com/community/tutorials/how-to-install-apache-tomcat-7-on-ubuntu-14-04-via-apt-get).

#### Irods Rest Api
* Install maven to build the tomcat package:

        sudo apt-get purge maven maven2 maven3
        sudo apt-add-repository ppa:andrei-pozolotin/maven3 
        sudo apt-get update sudo apt-get install maven3

* Download the zip file or clone the repo:

        git clone https://github.com/DICE-UNC/irods-rest.git
        
* Edit the config file jargon_beans.xml located in /irods-rest/src/main/resources/ with the right settings

        sudo nano /irods-rest/src/main/resources/jargon_beans.xml

For any problem read the documentation at: https://github.com/DICE-UNC/irods-rest/blob/master/docs/iRODS_REST_API_Documentation.pdf

* Built the tomcat package. In /irods-rest directory execute:

        mvn package -Dmaven.test.skip=true

* Load the irods-rest.war package located in /irods-rest/target on tomcat server ( e.g. at http://host:8080 )

* Last Put into local.js file in xtens-app/config/ the file system settings choosed during configuration

e.g:

    module.exports = {

        port: ..,
        environment: ..,
        connections: {
            'default': 'dbconnection',
            dbconnection: { ... }
        },

        fileSystemConnections: {
    
            'default': 'irodRestConn',
    
            irodRestConn: {
                type: 'irods-rest',            
                 restURL: {                     // irods-rest url
                    protocol:'http:',               // protocol
                    hostname: 'host',               // tomcat ip host
                    port: 8080,                     // tomcat port
                    path: '/irods-rest/rest'        // path 
                },
                irodsHome: '/nameZone/home/rods',   // irods home path
                repoCollection: 'xtens-repo',   // irods default Collection name
                landingCollection: 'landing',   // irods landing directory name
                username: 'user',               // irods user
                password: 'password'            // irods user password
            }
        },

    defaultOperators: [{    ...    }]
};

        
## Starting Application:

You need to be in xtens-app directory:

        cd path/xtens-app

To start sails (and the application) in production mode:

        sails lift --prod
or:

        node app.js --prod

To ensure that XTENS 2 will be executed without interrupts, install a simple CLI tool like ForeverJS:

        $ [sudo] npm install forever -g
        
and now you can start your XTENS 2 Platform:

        NODE_ENV=production forever start app.js
        
Now you can go to the application page http://host:port/#/. (the host is the ip address that you set in local.js and port is the "port: process.env.PORT || #port;" that you set in local.js).

To discover XTENS 2 RESTful API follow the link: [RESTful API](http://docs.xtens2.apiary.io)

XTENS 2 is published under the BSD 3-clause License.





