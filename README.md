#xtensjs

a [Sails](http://sailsjs.org) application

##Dependencies:

* [Node.js](http://nodejs.org/);
* [Sails.js](http://sailjs.org);
* [Bower](http://bower.io/);
* [PostgreSQL](http://www.postgresql.org/).

##Download:

Two methods:

* Download the file .zip;

* Clone the repository:

        git clone https://github.com/biolab-unige/xtens-app.git

## To Start:

You need to install the npm (node.js) packages:

    npm install

and then you need to install bower packages:

    bower install

To load the bower packages:

    grunt bower

##Database Configuration:

You must create the local.js file in xtens-app/config/. This config file should include any settings specifically for your development computer (db passwords, etc.)

e.g:

        module.exports {
        
            port: process.env.PORT || #port;
        
            environment: process.env.NODE_ENV || 'development',

            connections: {

                'default': 'postgresql',                //your default database connection

                postgresql: {                           //your database connection
                
                    adapter: 'sails-postgresql',        //sails adapter
                    host: '127.0.0.1'                   //ip host
                    port: '0000'                        //port
                    user: 'user',                       //db user
                    password: 'password',               //db user password
                    database: 'xtens',                  //db name
                    schema: true 
                },

            }

        };

##Starting Application:








