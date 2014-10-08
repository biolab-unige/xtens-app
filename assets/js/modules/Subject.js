(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var PersonalDetails = xtens.module("personaldetails");
    var SUBJECT = xtens.module("xtensconstants").DataTypeClasses.SUBJECT;

    Subject.Views.MetadataSchema = Data.Views.MetadataSchema.fullExtend({

        bindings: {

            '#code': {
                observe: 'code'
            },
            '#tags': {
                observe: 'tags',
                getVal: this.getTagsValue
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
            this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            this.model.set("personalDetails", _.clone(this.personalDetailsView.model.attributes));
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
                                                                model: schemaModel
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
