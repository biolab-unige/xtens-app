(function(xtens, Group) {




    // dependencies
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    var Datatype = xtens.module("datatype");
    var GroupsDataType = xtens.module("groupsDataType"); 
    var Operator = xtens.module("operator");
    var GroupsOperator = xtens.module("groupsOperator");

    Group.Model = Backbone.Model.extend({

        urlRoot: '/group',

    });

    Group.List = Backbone.Collection.extend({
        url: '/group',
        model: Group.Model
    });



    Group.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/group-edit.ejs"]; 
            this.render(options);
        },

     render: function(options)  {
            var self = this;
            self.datatype = new Datatype.List();
            self.datatype.fetch();
            self.operator = new Operator.List();
            self.operator.fetch();
            self.groupsOP = new GroupsOperator.List();
            self.groupsOP.fetch();
            self.groupsDT= new GroupsDataType.List();
            self.groupsDT.fetch();
            if(options.id) {
                self.group = new Group.Model({id: options.id});
                self.group.fetch({
                    success: function (group) {
                        self.$el.html(self.template({__: i18n, group: group,datatypes:self.datatype.models,operators:self.operator.models}));
                        return self;

                    }
                });
            } else {
                self.$el.html(self.template({__: i18n,group:null,datatypes:self.datatype.models,operators:self.operator.models}));
                return self;
            }},

            events: {
                'submit .edit-group-form': 'saveGroup',
                'click .delete': 'deleteGroup',
                'click .update':'updateGroup'
            },

            saveGroup: function(ev) {

                var groupDetails = $(ev.currentTarget).serializeObject();
                groupDetails = {name: groupDetails.name};
                var group = new Group.Model();

                group.save(groupDetails, {
                    patch:true,	
                    success: function(group) {
                        router.navigate('groups', {trigger: true});
                    },
                    error: function() {
                        console.log("Error saving the Group");
                    }
                });
                return false;
            },
            updateGroup: function(ev) {
                var that = this;
                that.groupsDataType = new GroupsDataType.Model();
                that.groupsOperator = new GroupsOperator.Model();
                datat = new Array();
                diss = new Array();
                var f=0;
                for (var i = 0;i<document.Myform.association.options.length;i++)
                {
                    if(document.Myform.association[i].selected)
                        {
                            datat[f]=document.Myform.association[i].value;
                            f++;
                        }
                }

                var a = datat.length;
                var v = 0;
                var z = 0;
                for(var l=0;l<document.Myform.dissociation.options.length;l++)
                {
                    if(document.Myform.dissociation[l].selected===true)
                        {
                            datat[a + v]=document.Myform.dissociation[l].value;
                            v++;
                        }
                        else
                            {
                                diss[z]=document.Myform.dissociation[l].value;
                                z++;
                            }
                }

                op = new Array();
                dissop = new Array();
                var c=0;
                for (var i = 0;i<document.Myform.associationop.options.length;i++)
                {
                    if(document.Myform.associationop[i].selected)
                        {
                            op[c]=document.Myform.associationop[i].value;
                            c++;
                        }
                }

                var b = op.length;
                var q=0;
                var r=0;
                for(var l=0;l<document.Myform.dissociationop.options.length;l++)
                {
                    if(document.Myform.dissociationop[l].selected===true)
                        {
                            op[b + q]=document.Myform.dissociationop[l].value;
                            q++;
                        }
                        else
                            {
                                dissop[r]=document.Myform.dissociationop[l].value;
                                r++;
                            }
                }


                that.group.set({name: document.Myform.name.value,data_type:datat,operator:op});


                for(var j = 0;j<a;j++)
                {

                    that.groupsDataType.save({ id_group : that.group.id ,id_datatype :document.Myform.association.selectedOptions[j].id});
                }

                if((datat.length -a)!==0){

                    for(var g=0;g<(datat.length -a);g++)
                    {
                        that.groupsDataType.save({ id_group : that.group.id,id_datatype:document.Myform.dissociation.selectedOptions[g].id});
                    }
                }
                if (diss.length!==0)
                    {
                        for(var h=0;h<diss.length;h++)
                        {
                            for(var p=0;p<document.Myform.dissociation.length;p++){
                                if(diss[h]==document.Myform.dissociation[p].value){
                                    console.log(that.groupsDT);
                                    m = that.groupsDT.where({id_group: that.group.id,id_datatype:parseInt(document.Myform.dissociation[p].id)})[0];
                                    console.log(m);
                                    m.destroy();
                                }
                            }
                        }
                    }


               
               

                for(var j = 0;j<b;j++)
                {

                    that.groupsOperator.save({ id_group : that.group.id ,id_operator :document.Myform.associationop.selectedOptions[j].id});
                }

                if((op.length -b)!==0){

                    for(var g=0;g<(op.length -b);g++)
                    {
                        that.groupsOperator.save({ id_group : that.group.id,id_operator:document.Myform.dissociationop.selectedOptions[g].id});
                    }
                }
                if (dissop.length!==0)
                    {
                        for(var h=0;h<dissop.length;h++)
                        {
                            for(var p=0;p<document.Myform.dissociationop.length;p++){
                                if(dissop[h]==document.Myform.dissociationop[p].value){
                                  
                                    n = that.groupsOP.where({id_group: that.group.id,id_operator:parseInt(document.Myform.dissociationop[p].id)})[0];
                                    console.log(n);
                                    n.destroy();
                                }
                            }
                        }
                    }



                    that.group.save();


                    router.navigate('groups', {trigger:true});
                    window.location.reload();

                    return false;

            },
            deleteGroup: function (ev) {
                var that = this;
                var rif_id = that.group.id;
                that.group.destroy({
                    success: function () {
                        a = that.groupsDT.where({id_group:rif_id});
                        for (var i=0;i<a.length;i++)
                        {
                            a[i].destroy();
                        }
                        b = that.groupsOP.where({ id_group:rif_id});
                        for (var j=0;j<b.length;j++)
                        {
                        b[j].destroy();
                        }
                        console.log('destroyed');
                        router.navigate('groups', {trigger:true});
                    }
                });
                return false;
            }
    });

    Group.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'group',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/group-list.ejs"];
            this.render();
        },

        render: function(options) {

            var self = this;
            var groups= new Group.List();
            groups.fetch({
                success: function(groups) {
                    self.$el.html(self.template({__: i18n, groups: groups.models}));
                    return self;
                },
                error: function() {
                    self.$el.html(self.template({__: i18n}));
                    return self;    
                }

            });

        }
    });

} (xtens, xtens.module("group")));
