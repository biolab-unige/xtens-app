/**
 * @author Massimiliano Izzo
 * 
 */
(function(xtens, XtensTable) {

    var i18n = xtens.module("i18n").en;
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
    var DataTypeModel = xtens.module("datatype").Model;

    XtensTable.Views.HtmlTable = Backbone.View.extend({

        tagName: 'div',
        className: 'col-sm-12',

        initialize: function(options) {
            this.data = options.data;
            this.template = JST["views/templates/data-table.ejs"];
            this.render(); 
        },

        render: function() {
            this.$el.html(this.template({__:i18n, data: this.data}));
            return this; 
        }

    });

    XtensTable.Views.DataTable = Backbone.View.extend({

        tagName: 'table',
        className: 'data-table',

        initialize: function(options) {
            if (options.data) {
                this.prepareDataForRendering(options.data);
            }
            // this.render();
        },

        render: function() {
            this.$el.DataTable(this.tableOpts);
            return this;
        },

        prepareDataForRendering: function(data, headers) {
            var dataType = data[0] && data[0].type;
            dataType = new DataTypeModel(dataType);
            var fieldsToShow = dataType.getFlattenedFields(true); // get the names of all the madatafields but those within loops;
            var columns = this.insertClassTemplateSpecificColumns(dataType.get("classTemplate"), true);  // TODO manage permission for personalDetails
                _.each(fieldsToShow, function(field) {
                        var colTitle = replaceUnderscoreAndCapitalize(field.name);
                        columns.push({
                            "title": colTitle,
                            "data": "metadata." + field.name + ".value.0"
                        });
                        if (field.hasUnit) {
                            columns.push({
                                "title": colTitle + " Unit",
                                "data": "metadata." + field.name + ".unit.0"
                            });
                        }
                });
            this.tableOpts = {
                data: data,
                columns: columns
            };
        },

        insertClassTemplateSpecificColumns: function(classTemplate, canViewPersonalInfo) {
            var cols = [];
            switch(classTemplate) {
                case Classes.SUBJECT:
                    if (canViewPersonalInfo) { // if you are allowed to see the Personal Details
                        cols = cols.concat(this.insertPersonalDetailsColumns());
                    }
                    cols = cols.concat(this.insertSubjectColumns());
                    break;
                case Classes.SAMPLE:
                    cols = cols.concat(this.insertSampleColumns());
                    break;
            }
            return cols;
        },

        insertPersonalDetailsColumns: function() {
            return [
                {"title": i18n("surname"), "data": "personalInfo.surname"},
                {"title": i18n("given-name"), "data": "personalInfo.givenName"},
                {"title": i18n("birth-date"), "data": "personalInfo.birthDate"}
            ];
        },

        insertSubjectColumns: function() {
            return [
                {"title": i18n("code"),"data": "code"},
                {"title": i18n("sex"),"data": "sex"}
            ];        
        },

        insertSampleColumns: function() {
            return [{
                "title": i18n("biobankCode"),
                "data": "biobankCode"
            }];
        }

    });

} (xtens, xtens.module("xtenstable")));
