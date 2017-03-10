/* globals _, sails, fixtures, PassportService, Passport, Operator */
"use strict";
const expect = require('chai').expect, sinon = require('sinon');
const ValidationError = require('xtens-utils').Errors.ValidationError;

describe('PassportService', function() {

    describe('#callback', function() {
        let registerStub, connectStub, disconnectStub, authStub, validateStub, mockReq, mockRes , next;

        beforeEach(() => {
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    provider: 'local',
                    action: undefined,
                    identifier:"username",
                    password:"password"
                },
                param: function(par) {
                    return this.params[par];
                },
                allParams: function(par) {
                    return this.params;
                }}, mockRes = {};

            registerStub = sinon.stub(PassportService.protocols.local, 'register',function (req,res,next) {
                return next();
            });

            connectStub = sinon.stub(PassportService.protocols.local, 'connect',function (req,res,next) {
                return next();
            });

            disconnectStub = sinon.stub(PassportService, 'disconnect',function (req,res,next) {
                return next();
            });

            validateStub = sinon.stub(PassportService, 'validate',function (req) {
                return {};
            });
            // authStub = sinon.stub(PassportService, 'authenticate',function (req,next) {
            //     return next();
            // });

        });

        afterEach(() => {
            registerStub.restore();
            connectStub.restore();
            disconnectStub.restore();
            validateStub.restore();
            // authStub.restore();
        });

        it('should fire the "register" function with the right Args', function(done) {
            mockReq.params.action = 'register';

            PassportService.callback(mockReq,mockRes,function () {
                sinon.assert.calledWith(registerStub,mockReq,mockRes);
                sinon.assert.notCalled(connectStub);
                sinon.assert.notCalled(disconnectStub);
                // sinon.assert.notCalled(authStub);

                done();
                return;
            });
        });

        it('should fire "connect" function with the right Args', function(done) {
            mockReq.params.action = 'connect';
            mockReq.user = _.cloneDeep(fixtures.operator[0]);

            PassportService.callback(mockReq,mockRes,function () {
                sinon.assert.calledWith(connectStub,mockReq,mockRes);
                sinon.assert.notCalled(registerStub);
                sinon.assert.notCalled(disconnectStub);
                // sinon.assert.notCalled(authStub);

                done();
                return;
            });
        });

        it('should fire "disconnectStub" function with the right Args', function(done) {
            mockReq.params.action = 'disconnect';
            mockReq.user = _.cloneDeep(fixtures.operator[0]);

            PassportService.callback(mockReq,mockRes,function () {
                sinon.assert.calledWith(disconnectStub,mockReq,mockRes);
                sinon.assert.notCalled(connectStub);
                sinon.assert.notCalled(registerStub);
                // sinon.assert.notCalled(authStub);

                done();
                return;
            });
        });

        it('should return ERROR - Invalid action', function(done) {
            mockReq.params.action = 'wrongAction';
            let expectedErr = new Error('Invalid action');

            PassportService.callback(mockReq,mockRes,function (err) {

                expect(err).to.be.an('error');
                expect(err).to.eql(expectedErr);
                sinon.assert.notCalled(connectStub);
                sinon.assert.notCalled(disconnectStub);
                sinon.assert.notCalled(registerStub);

                done();
                return;
            });
        });

        it('should fire "disconnectStub" function with the right Args with no "local" provider', function(done) {
            mockReq.params.action = 'disconnect';
            mockReq.params.provider = 'bearer';
            mockReq.user = _.cloneDeep(fixtures.operator[0]);

            PassportService.callback(mockReq,mockRes,function () {
                sinon.assert.calledWith(disconnectStub,mockReq,mockRes);
                sinon.assert.notCalled(connectStub);
                sinon.assert.notCalled(registerStub);
                // sinon.assert.notCalled(authStub);

                done();
                return;
            });
        });

        it('should not fire any function and redirect user to the provider authentication', function(done) {
            mockReq.params.action = undefined;

            PassportService.callback(mockReq,mockRes,function () {
                // sinon.assert.calledWith(authStub, mockReq.params.provider);
                sinon.assert.notCalled(connectStub);
                sinon.assert.notCalled(disconnectStub);
                sinon.assert.notCalled(registerStub);

                done();
                return;
            });
        });

    });

    describe('#connect', function() {
        let mockReq, profile, query, operator;

        beforeEach(() => {
            operator = _.cloneDeep(fixtures.operator[6]);
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                user : operator,
                params: {
                    provider: 'provider',
                    action: undefined
                },
                param: function(par) {
                    return this.params[par];
                }},
            profile = {
                emails: ['email@email.it'],
                username: operator.login,
                provider: 'provider',
                hasOwnProperty: function(par) {
                    return this[par] ? true : false;
                }},
            query = {
                identifier: 'identifier',
                protocol: 'local',
                provider: 'provider',
                tokens: 'sdkjnfdnsalnfalkjdsnfdsaljnls32932jeidwqwio',
                hasOwnProperty: function(par) {
                    return this[par] ? true : false;
                }};
        });


        it('should return the operator correctly connected', function(done) {

            PassportService.connect(mockReq, query, profile, function (err,res) {
                expect(res).to.eql(operator);
                done();
                return;
            });
        });

        it('should return ERROR - Neither a username nor email was available', function(done) {
            profile.emails = undefined;
            profile.username = undefined;
            let expectedErr = new Error('Neither a username nor email was available');
            PassportService.connect(mockReq, query, profile, function (err,res) {
                expect(res).to.be.undefined;
                expect(err).to.be.an('error');
                expect(err).to.eql(expectedErr);
                done();
                return;
            });
        });

        it('should return ERROR - user not found', function(done) {
            query.identifier = "notExistentIdentifier";
            mockReq.user = undefined;
            let expectedErr = 'user not found';
            PassportService.connect(mockReq, query, profile, function (err,res) {
                expect(res).to.be.undefined;
                expect(err).to.eql(expectedErr);
                done();
                return;
            });
        });

        it('should return operator correctly connected, creating a new passport', function(done) {
            query.identifier = "notExistentIdentifier";
            let passportCreateSpy = sinon.spy(Passport, "create");

            PassportService.connect(mockReq, query, profile, function (err,res) {

                sinon.assert.calledWith(passportCreateSpy,query);
                expect(res).to.eql(operator);

                passportCreateSpy.restore();
                done();
                return;
            });
        });

        it('should return operator correctly connected, updating passport', function(done) {
            mockReq.user = undefined;
            let passportUpdateSpy = sinon.spy(Passport, "update");

            PassportService.connect(mockReq, query, profile, function (err,res) {

                sinon.assert.called(passportUpdateSpy);
                expect(res.id).to.eql(operator.id);

                passportUpdateSpy.restore();
                done();
                return;
            });
        });

    });

    describe('#endpoint', function() {
        let mockReq, mockRes, loadStrategiesStub;

        beforeEach(() => {
            loadStrategiesStub = sinon.stub(PassportService, "loadStrategies",function () {
                return;
            });
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    provider: 'provider'
                },
                param: function(par) {
                    return this.params[par];
                },
                next:function () {
                    return;
                }},
                mockRes = {
                    json:function (code,message) {
                        return {code:code, message: message};
                    }
                };


        });

        afterEach(() => {
            PassportService.loadStrategies.restore();
        });

        it('should return Error Unauthorized -  Unknown auth provider', function(done) {
            let expectedRes = {code: 401, message: 'Unknown auth provider'};
            let res = PassportService.endpoint(mockReq, mockRes);
            console.log(res);
            expect(res).to.eql(expectedRes);
            sinon.assert.notCalled(loadStrategiesStub);

            done();
            return;
        });

        it('should fire loadStrategies function', function(done) {
            sails.config.passport['provider'] = {
                scope: 'scope',
                strategy: function () {
                    return {name:"nameStrategy"};
                }
            };

            PassportService.endpoint(mockReq, mockRes);

            sinon.assert.calledWith(loadStrategiesStub, mockReq);

            done();
            return;
        });

    });

    describe('#loadStrategies', function() {


        it('should fire loadStrategies with "oauth2" protocol', function(done) {
            sails.config.passport['provider'] = {
                scope: 'scope',
                protocol: "oauth2",
                callback: undefined,
                strategy: function () {
                    return {name:"nameStrategy"};
                }};

            PassportService.loadStrategies();
            done();
            return;
        });

        it('should fire loadStrategies function with "openid" protocol', function(done) {
            sails.config.passport['provider'] = {
                scope: 'scope',
                protocol: "openid",
                callback: undefined,
                strategy: function () {
                    return {name:"nameStrategy"};
                }};

            PassportService.loadStrategies();
            done();
            return;
        });
    });

    describe('#disconnect', function() {

        let mockReq, mockRes, passportFindOneSpy, passportDestroySpy, operator;

        beforeEach(() => {
            operator = _.cloneDeep(fixtures.operator[6]);
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                user : operator,
                params: {
                    provider: 'provider',
                    action: undefined
                },
                param: function(par) {
                    return this.params[par];
                }},
            mockRes = {
                json:function (code,message) {
                    return {code:code, message: message};
                }
            };

            passportFindOneSpy = sinon.spy(Passport, "findOne");
            passportDestroySpy = sinon.spy(Passport, "destroy");
        });

        it('should return operator correctly disconnected, firing FindOne and Destroy Passport', function(done) {

            PassportService.disconnect(mockReq, mockRes, function (err,res) {

                sinon.assert.called(passportFindOneSpy);
                sinon.assert.called(passportDestroySpy);

                expect(res.id).to.eql(operator.id);

                passportFindOneSpy.restore();
                passportDestroySpy.restore();
                done();
                return;
            });
        });
    });

    describe('#validate', function() {

        let mockReq;

        beforeEach(() => {
            mockReq = {
                baseUrl: 'http:/localhost:80',
                path: '/data',
                params: {
                    identifier:"username",
                    password:"password"
                },
                param: function(par) {
                    return this.params[par];
                },
                allParams: function() {
                    return this.params;
                }};
        });

        it('Should return the validated object without error', function(done) {
            let expectedRes = {
                error: null,
                value: { identifier: 'username', password: 'password' }
            };
            let validationResult = PassportService.validate(mockReq);
            console.log(validationResult);
            expect(validationResult).to.eql(expectedRes);

            done();
        });

        it('Should return an object with a ValidationError', function(done) {
            mockReq.params = {
                wrongAttribute:"username",
                password:"password"
            };
            let expectedRes = {
                error: new ValidationError('ValidationError: child "identifier" fails because ["identifier" is required]'),
                value: { wrongAttribute: 'username', password: 'password' }
            };
            let validationResult = PassportService.validate(mockReq);
            console.log(validationResult);
            expect(validationResult.value).to.eql(expectedRes.value);
            expect(validationResult.error).to.be.an('error');
            done();
        });
    });


    describe('#deserializeUser', function() {

        let operatorFindOneSpy, operator;

        beforeEach(() => {
            operator = _.cloneDeep(fixtures.operator[6]);

            operatorFindOneSpy = sinon.spy(Operator, "findOne");
        });

        it('should fire FindOne Operator with the right Args', function(done) {

            PassportService.deserializeUser(operator.id, function (err,res) {

                sinon.assert.calledWith(operatorFindOneSpy, operator.id);

                operatorFindOneSpy.restore();
                done();
                return;
            });
        });
    });

    describe('#serializeUser', function() {

        it('should return the right user id', function(done) {
            let operator = _.cloneDeep(fixtures.operator[6]);

            PassportService.serializeUser(operator, function (err,res) {

                expect(res).to.eql(operator.id);

                done();
                return;
            });
        });

        it('should return ERROR - Invalid user', function(done) {
            let expectedErr = new Error('Invalid user');

            PassportService.serializeUser(false, function (err,res) {

                expect(err).to.be.an('error');
                expect(err).to.eql(expectedErr);
                expect(res).to.be.null;

                done();
                return;
            });
        });
    });
});
