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

    Subject.Views.Edit = Data.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'data',

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes ? _.where(options.dataTypes, {classTemplate: SUBJECT}) : [];
            this.projects = options.projects; 
            this.template = JST["views/templates/subject-edit.ejs"];
            this.personalDetailsView = null;
            this.schemaTemplate = JST["views/templates/subject-edit-partial.ejs"];
            this.schemaView = null;
            this.render(options);
        },

        events: {
            "click #save": "saveData",
            "click #add-personal-details": "addPersonalDetailsView"
        },

        saveData: function() {
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

} (xtens, xtens.module("subject")));
