(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var PersonalDetails = xtens.module("personaldetails");
    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;

    Subject.Model = Data.Model.fullExtend({
        urlRoot: '/subjectWithPersonalDetails'
    });

    Subject.List = Backbone.Collection.extend({
        model: Subject.Model,
        url: '/subjectWithPersonalDetails' 
    });

    Subject.Views.Edit = Data.Views.Edit.fullExtend({

        bindings: {

            '#project': {
                observe: 'project',
                selectOptions: {
                    collection: 'this.projects',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: i18n("please-select"),
                        value: null
                    } 
                },
                getVal: function($el, ev, options) {
                    var value = parseInt($el.val());
                    return _.findWhere(options.view.projects, {id: value });
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
            "click #save": "saveSubject",
            "click #add-personal-details": "addPersonalDetailsView"
        },

        saveSubject: function() {
            var metadata = this.schemaView && this.schemaView.serialize();
            this.model.set("metadata", metadata);
            // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            this.model.set("personalInfo", _.clone(this.personalDetailsView.model.attributes));
            this.model.save(null, {
                success: function(subject) {
                    xtens.router.navigate('subjects', {trigger: true});
                },
                error: function(err) {
                    console.log(err);
                }
            });
            return false;
        },

        addPersonalDetailsView: function(ev) {
            var model = new PersonalDetails.Model();
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
                success: function(subject) {
                    that.$el.html(that.template({__: i18n, subject: subject.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        } 
    });

} (xtens, xtens.module("subject")));
