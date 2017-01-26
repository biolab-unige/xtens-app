# XTENS 2

[![Build Status](https://travis-ci.org/biolab-unige/xtens-app.svg?branch=master)](https://travis-ci.org/biolab-unige/xtens-app)
[![Coverage Status](https://coveralls.io/repos/github/biolab-unige/xtens-app/badge.svg?branch=master&etc=1)](https://coveralls.io/github/biolab-unige/xtens-app?branch=master)

a digital repository for heterogeneous data in life science. 

##Dependencies:

* <a href="https://nodejs.org"><img src="https://cloud.githubusercontent.com/assets/14332186/22329480/bf0228ec-e3c1-11e6-9d8b-7840838e177e.png" width="100"></a>   [Node.js 4.1+](http://nodejs.org/);

* <a href="https://sailsjs.com"><img src="https://cloud.githubusercontent.com/assets/14332186/22330446/8e8e29a4-e3c6-11e6-9e97-bb246d4c8049.png" width="100"></a>   [Sails.js 0.11+](http://sailjs.com);

* <a href="https://http://www.postgresql.org/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330451/97bdbe0e-e3c6-11e6-979b-7549abe0e57c.png" width="60"></a>   [PostgreSQL 9.4+](http://www.postgresql.org/);

* <a href="http://bower.io/"><img src="https://cloud.githubusercontent.com/assets/14332186/22330443/8bda895a-e3c6-11e6-9809-2d0e50c537b6.png" width="30"></a>   [Bower](http://bower.io/).

##Download:

Two methods:

* Download the file .zip;

* Clone the repository:

        git clone https://github.com/biolab-unige/xtens-app.git

## To Start:

Go into the xtens-app directory:

        cd xtens-app/

Install the npm (node.js) packages:

        npm install
        npm install sails

Install bower packages:

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

You need to be in xtens-app directory:

        cd xtens-app

You need to start sails (and the application):

        sails lift

Now you can go to the application page http://host:port/#/. (the host is the ip address that you set in local.js and port is the "port: process.env.PORT || #port;" that you set in local.js).








