(function(xtens, Operator) {


    // dependencies
    var i18n = xtens.module("i18n").en;
    var router = xtens.router;
    var Group = xtens.module("group");
    var GroupsOperator =xtens.module("groupsOperator");
    var sexOptions = xtens.module("xtensconstants").SexOptions;

    var parsleyOpts = {
        priorityEnabled: false,
        // excluded: "select[name='fieldUnit']",
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block col-sm-4 col-sm-offset-2'></span>",
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

        bindings: {

            '#firstName': {
                observe: 'firstName',
                },

            '#lastName': {
                observe: 'lastName'
            },

            '#sex': {
                observe: 'sex',
                initialize: function($el) {
                    var data = [];
                    _.each(sexOptions, function(sexOption) {
                        data.push({id: sexOption, text: sexOption});
                    });
                    $el.select2({
                        placeholder: i18n("please-select"),
                        data: data
                    });
                }
            },

            '#birthDate': {
                observe: 'birthDate',

                // format date on model as ISO (YYYY-MM-DD)
                onSet: function(val, options) {
                    // var dateArray = val.split("/");
                    var momentDate = moment(val, 'L', 'it');
                    // return new Date(dateArray[2] + '-'+ dateArray[1] + '-' + dateArray[0]);
                    return momentDate.format('YYYY-MM-DD');
                },

                // store data in view (from model) as DD/MM/YYYY (European format)
                onGet: function(value, options) {
                    if (value) {
                        /*
                        var dateArray = value instanceof Date ? value.toISOString().split('-') : moment(value).format('L');
                        var dateArray2 = dateArray[2].split('T');
                        dateArray[2] = dateArray2[0];
                        return dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0]; */
                        return moment(value).lang("it").format('L');
                    }
                },

                // initialize Pikaday + Moment.js
                initialize: function($el, model, options) {
                    var picker = new Pikaday({
                        field: $el[0],
                        // lang: 'it',
                        // format: 'DD/MM/YYYY',
                        format: moment.localeData('it')._longDateFormat.L,
                        minDate: moment('1900-01-01').toDate(),
                        maxDate: new Date()
                    });
                }
            },

            '#email': {
                observe: 'email'
            },

            '#login': 'login'


        },

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/operator-edit.ejs"];
            this.render();
        },

        events: {
            'click #delete': 'deleteOperator',
            'click #save':'saveOperator',
        },

        render: function()  {
            this.$el.html(this.template({__:i18n, data: this.model}));
            this.stickit();
            return this;
        },

        saveOperator: function(ev) {
          if(!this.model.id){
          this.model.set('password',$("input[id=password]").val());}
            this.model.save(null, {
                success: function(operator) {
                    console.log("Operator.Views.Edit.saveOperator - operator correctly inserted/updated!");
                    router.navigate('operators', {trigger: true});
                },
                error: xtens.error,
            });

            return false;
        },

        deleteOperator: function (ev) {
            this.operator.destroy({
                success: function () {
                    console.log('Operator.Views.Edit - operator destroyed');
                    router.navigate('operators', {trigger:true});
                },
                error: xtens.error
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

            var that = this;
            var operators= new Operator.List();
            operators.fetch({

                success: function(operators) {
                    that.$el.html(that.template({__: i18n, operators: operators.models}));
                    return that;
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
            var that = this;
            this.$("#loginFailed").hide();
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
                    that.$("#loginFailed").show();
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
