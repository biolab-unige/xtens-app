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
            if (options && options.data) {
                this.prepareDataForRendering(options.data, options.dataType);
            }
            // this.render();
        },

        render: function() {
            if (this.tableOpts) {
                this.$el.DataTable(this.tableOpts);
            }
            else {
                // TODO do something if no result found
            }
            return this;
        },

        prepareDataForRendering: function(data, dataType, headers) {
            // var dataType = data[0] && data[0].type;
            if (!dataType) {
                return; //TODO add alert box
            }
            dataType = new DataTypeModel(dataType);
            var fieldsToShow = dataType.getFlattenedFields(true); // get the names of all the madatafields but those within loops;
            var columns = this.insertModelSpecificColumns(dataType.get("model"), true);  // TODO manage permission for personalDetails
                _.each(fieldsToShow, function(field) {
                        var colTitle = replaceUnderscoreAndCapitalize(field.name);
                        columns.push({
                            "title": colTitle,
                            "data": "metadata." + field.name + ".value"
                        });
                        if (field.hasUnit) {
                            columns.push({
                                "title": colTitle + " Unit",
                                "data": "metadata." + field.name + ".unit"
                            });
                        }
                });
            this.tableOpts = {
                data: data,
                columns: columns
            };
        },

        insertModelSpecificColumns: function(model, canViewPersonalInfo) {
            var cols = [];
            switch(model) {
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
