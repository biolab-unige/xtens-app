(function(xtens, Operator) {


    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var Group = xtens.module("group");
    var GroupsOperator =xtens.module("groupsOperator"); 
    
    var parsleyOpts = {
        priorityEnabled: false,
        // excluded: "select[name='fieldUnit']",
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block'></span>",
        errorTemplate: "<span></span>"
    };

    // define an Operator
    Operator.Model = Backbone.Model.extend({
        urlRoot: '/operator',
    });

    Operator.List = Backbone.Collection.extend({
        url: '/operator',
        model: Operator.Model,
    });


    Operator.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'operator',

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/operator-edit.ejs"]; 
            this.render(options);
        },

        render: function(options)  {
            var that = this;
            if(options.id) {
                this.operator = new Operator.Model({id: options.id});
                this.operator.fetch({
                    success: function (operator) {
                        that.$el.html(that.template({__: i18n, operator: operator}));
                        return that;
                    },
                    error: function(operator,res){xtens.error(res); },                 
                });
            } else {
                this.$el.html(that.template({__: i18n,operator:null}));
                return this;
            }
        },

        events: {
            'submit .edit-operator-form': 'saveOperator',
            'click .delete': 'deleteOperator',
            'click .update':'updateOperator',
        },

        saveOperator: function(ev) {

            var operatorDetails = $(ev.currentTarget).serializeObject();

            operatorDetails = {
                firstName: operatorDetails.name,
                lastName: operatorDetails.surname,
                birthDate: operatorDetails.date,
                sex: operatorDetails.sex,
                email: operatorDetails.email,
                login: operatorDetails.login,
                password: operatorDetails.password
            };

            var operator = new Operator.Model();

            operator.save(operatorDetails, {
                patch:true,	
                success: function(operator) {
                    router.navigate('operators', {trigger: true});
                },
                error: function() {
                    console.log("Error saving the Operator");
                }
            });
            return false;
        },

        updateOperator: function(ev) {

            this.operator.set({
                firstName: document.Myform.name.value,
                lastName: document.Myform.surname.value,
                birthDate: document.Myform.date.value,
                sex: document.Myform.sex.value,
                email: document.Myform.email.value,
                login: document.Myform.login.value
            });

            this.operator.save(); // SBAGLIATO!!!!!!!!!!!!!!!!!!
            router.navigate('operators', {trigger:true});
            window.location.reload();
            return false;

        },

        deleteOperator: function (ev) {
            var that = this;
            var rif_id = that.operator.id;
            var rif_name =new Array(1);
            rif_name[0] = that.operator.attributes.login;
            that.operator.destroy({
                success: function () {
                    a = that.GroupOP.where({id_operator:rif_id});
                    for(var i =0;i<a.length;i++)
                    { 
                        id_gr = a[i].attributes.id_group;
                        b = that.gr.where({id:id_gr})[0];
                        c = b.attributes.operator.split(",");
                        d = _.difference(c,rif_name);
                        b.set({operator:d});
                        b.save();
                        a[i].destroy();
                    }
                    console.log('destroyed');
                    router.navigate('operators', {trigger:true});
                }
            });
            return false;
        }

    });

    Operator.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'operator',


        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/operator-list.ejs"];
            this.render();
        },

        render: function(options) {

            var self = this;
            var operators= new Operator.List();
            operators.fetch({
                
                success: function(operators) {
                    self.$el.html(self.template({__: i18n, operators: operators.models}));
                    return self;
                },

                error:function(operators, res) { 
                    xtens.error(res);
                }

            });

        }
    });

    Operator.Views.Login = Backbone.View.extend({

        tagName:'div',
        className:'operator',

        initialize:function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/login.ejs"];
            this.render();          
        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            this.$("form").parsley(parsleyOpts);
            return this;
        },

        events: {
            'click #login': 'logIn'
        },

        logIn: function() {
            var username = this.$("#username").val();
            var password = this.$("#password").val();

            if (this.$('form').parsley().validate()) {
                $.post('/login', {
                    identifier: username,
                    password: password
                }, function(data, status, jqxhr) {
                    xtens.session.load(data);
                    router.navigate("#/homepage", {trigger: true});
                })
                .fail(function(jqxhr) {
                    // alert("Error: " + res.responseJSON.error);
                    console.log("Operator.Views.Login.logIn() - error logging in.");                
                });
            }
            return false;
        }

    });
    
    /**
     * @class
     * @name Homepage
     * @description personalised homepage for the operator
     */
    Operator.Views.Homepage = Backbone.View.extend({

     tagName:'div',
        className:'operator',


        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/homepage.ejs"];
            this.render();
        },

        render: function(options) {
            /*
            var self = this;
            var operators= new Operator.List();
            operators.fetch({
                success: function(operators) {
                    self.$el.html(self.template({__: i18n, operators: operators.models}));
                    return self;
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });
            */
           this.$el.html(this.template({__: i18n, login: xtens.session.get("login")}));
        }

    });

} (xtens, xtens.module("operator")));
