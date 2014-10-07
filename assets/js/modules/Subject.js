(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
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
        urlRoot: '/subject'
    });

    Subject.Views.Edit = Data.Views.Edit.fullExtend({

        tagName: 'div',
        className: 'subject',

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes ? _.where(options.dataTypes, {classTemplate: SUBJECT}) : []; 
            this.template = JST["views/templates/data-edit.ejs"];
            this.schemaTemplate = JST["views/templates/subject-edit-partial.ejs"];
            this.schemaView = null;
            this.render(options);
        },

        events: {
            "click #save": "saveData"
        },

        saveData: function() {
            var json = this.schemaView && this.schemaView.serialize();
            this.model.set("code", json.code);
            this.model.set("notes", json.notes);
            this.model.set("tags", json.tags);
            this.model.set("metadata", json.metadata);
            this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            this.model.save({
                success: function(subject) {
                    xtens.router.navigate('subjects', {trigger: true});
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }

    });

} (xtens, xtens.module("subject")));
