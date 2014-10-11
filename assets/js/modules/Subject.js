(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var PersonalDetails = xtens.module("personaldetails");
    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;

    Subject.Views.MetadataSchema = Data.Views.MetadataSchema.fullExtend({
        
        initialize: function(options) {
            this.template = options.template;
            this.component = options.component;
            this.projects = options.projects;
            this.nestedViews = [];
        },

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

        }
    });

    Subject.Model = Data.Model.fullExtend({
        urlRoot: '/subjectWithPersonalDetails'
    });

    Subject.List = Backbone.Collection.extend({
        model: Subject.Model,
        url: '/subjectWithPersonalDetails' 
    });

    Subject.Views.Edit = Backbone.View.extend({

        tagName: 'div',
        className: 'data',

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.dataTypes = null;
            this.projects = options.projects; 
            this.template = JST["views/templates/subject-edit.ejs"];
            this.personalDetailsView = null;
            this.schemaTemplate = JST["views/templates/subject-edit-partial.ejs"];
            this.schemaView = null;
            this.render(options);
            this.renderDataTypeSchema();
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
            }
            return this;
        },
        
        fetchSuccess:function(subject) {
            this.$el.html(this.template({__: i18n, data: data}));
            this.stickit();
            this.renderDataTypeSchema(subject);
        },

        events: {
            "click #save": "saveSubject",
            "click #add-personal-details": "addPersonalDetailsView"
        },

        saveSubject: function() {
            var json = this.schemaView && this.schemaView.serialize();
            this.model.set("code", json.code);
            this.model.set("notes", json.notes);
            this.model.set("tags", json.tags);
            this.model.set("metadata", json.metadata);
            this.model.set("project", json.project);
            // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            this.model.set("personalInfo", _.clone(this.personalDetailsView.model.attributes));
            this.model.save({
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
        },

        renderDataTypeSchema: function(data) {
            if (this.schemaView) {
                if (!this.schemaView.removeMe()) {
                    return;
                }
            }
            var $metadataSchema = this.$("#metadata-schema");
            var type = this.model.get('type');
            if (type) {
                var schema = type.schema;
                var schemaModel = new Data.MetadataSchemaModel(null, {data: data});
                this.schemaView = new Subject.Views.MetadataSchema({template: this.schemaTemplate, 
                                                                   component: schema,
                                                                   model: schemaModel,
                                                                   projects: this.projects
                });
                $metadataSchema.append(this.schemaView.render().el);
                this.$('#tags').select2({tags: []});
            }
            else {
                $metadataSchema.html('');
            }
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
