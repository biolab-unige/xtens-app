(function(xtens, Operator) {


    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var Group = xtens.module("group");
   var GroupsOperator =xtens.module("groupsOperator"); 
    // define an Operator
    Operator.Model = Backbone.Model.extend({

        urlRoot: '/operator',

    });

    Operator.List = Backbone.Collection.extend({
        url: '/operator',
        model: Operator.Model
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
            
            that.gr = new Group.List();
            that.gr.fetch();
            if(options.id) {

                that.operator = new Operator.Model({id: options.id});

               
                that.operator.fetch({
                    success: function (operator) {
                    that.$el.html(that.template({__: i18n, operator: operator}));
                        return that;


                    }
                });




            } else {
                 
            that.$el.html(that.template({__: i18n,operator:null}));
                        return that;
                               }
        },

        events: {
            'submit .edit-operator-form': 'saveOperator',
            'click .delete': 'deleteOperator',
            'click .update':'updateOperator',
        },

        saveOperator: function(ev) {

            var operatorDetails = $(ev.currentTarget).serializeObject();

            operatorDetails = {firstName: operatorDetails.name,lastName:operatorDetails.surname,birthDate:operatorDetails.date,sex:operatorDetails.sex,email:operatorDetails.email,login:operatorDetails.login,password:operatorDetails.password};
            operatorDetails.birthDate = new Date(operatorDetails.birthDate);

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
            var that = this;

                      that.operator.set({firstName: document.Myform.name.value,lastName:document.Myform.surname.value,birthDate:document.Myform.date.value,sex:document.Myform.sex.value,email:document.Myform.email.value,login:document.Myform.login.value});



                      that.operator.save();
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
        },

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
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }
    });

    Operator.Views.Login = Backbone.View.extend({
        tagName:'div',
        className:'operator',

      
        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/login.ejs"];
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
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }

        
    });
} (xtens, xtens.module("operator")));
