/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Subjects 
 */

(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var PersonalDetails = xtens.module("personaldetails");
    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;
    
    /*
    function initializeProjectsField($el, model, option) {
        var data =
    }*/

    Subject.Model = Data.Model.fullExtend({
        urlRoot: '/subject',
        
        defaults: {
            projects: []
        }
    });

    Subject.List = Backbone.Collection.extend({
        model: Subject.Model,
        url: '/subject' 
    });

    Subject.Views.Edit = Data.Views.Edit.fullExtend({

        bindings: {

            '#projects': {
                observe: 'projects',
                initialize: function($el, model, option) {
                    $el.select2({ placeholder: i18n("please-select") });
                },
                selectOptions: {
                    collection: 'this.projects',
                    labelPath: 'name',
                    valuePath: 'id',
                   defaultOption: {
                       label: "",
                       value: null
                   } 
                }, 
                getVal: function($el, ev, options) {
                    return $el.val().map(function(value) {
                        return _.findWhere(options.view.projects, {id: parseInt(value)});
                    });
                    /*
                    var value = parseInt($el.val());
                    return _.findWhere(options.view.projects, {id: value }); */
                },
                onGet: function(vals, options) {
                    return (vals && vals.map(function(val){return val.id; }));
                }
            },

            '#code': {
                observe: 'code'
            },

            '#tags': {
                observe: 'tags',
                getVal: function($el, ev, option) {
                    return $el.val().split(",");
                }

            },

            '#notes': {
                observe: 'notes'
            }

        },

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.dataTypes = null;
            this.projects = options.projects; 
            this.template = JST["views/templates/subject-edit.ejs"];
            this.personalDetailsView = null;
            this.schemaView = null;
            this.render(options);
        },

        render: function(options) {
            if (options.id) {
                this.model = new Subject.Model({id: options.id});
                this.model.fetch({
                    success: this.fetchSuccess
                });
            }
            else {
                this.$el.html(this.template({__: i18n, data: null}));
                this.stickit();
                this.$('#tags').select2({tags: []});
                this.renderDataTypeSchema();
            }
            return this;
        },
        
        /*
        fetchSuccess:function(subject) {
            this.$el.html(this.template({__: i18n, data: subject}));
            this.stickit();
            this.renderDataTypeSchema(subject);
        }, */

        events: {
            "click #save": "saveData",
            "click #add-personal-details": "addPersonalDetailsView"
        },

        saveData: function() {
            var metadata = this.schemaView && this.schemaView.serialize();
            this.model.set("metadata", metadata);
            // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            this.model.set("personalInfo", _.clone(this.personalDetailsView.model.attributes));
            this.model.save(null, {
                success: function(subject) {
                    xtens.router.navigate('subjects', {trigger: true});
                },
                error: function(err) {
                    alert(err);
                }
            });
            return false;
        },

        addPersonalDetailsView: function(ev) {
            var model = new PersonalDetails.Model(this.model.get("personalInfo"));
            this.personalDetailsView = new PersonalDetails.Views.Edit({model: model});
            var $parent = $(ev.currentTarget).parent();
            $parent.empty();
            $parent.html(this.personalDetailsView.render().el);
        }

    });

    Subject.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'subject',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/subject-list.ejs"];
            this.render();
        },

        render: function(options) {
            var that = this;
            var subjects = new Subject.List();
            subjects.fetch({
                success: function(subjects) {
                    that.$el.html(that.template({__: i18n, subjects: subjects.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        } 
    });

} (xtens, xtens.module("subject")));
