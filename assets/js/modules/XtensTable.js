/**
 * @author Massimiliano Izzo
 * 
 */
(function(xtens, XtensTable) {

    var i18n = xtens.module("i18n").en;
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;

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
            var datum = data[0];
            var columns = this.insertClassTemplateSpecificColumns(datum);
            if (datum.metadata) {
                _.each(datum.metadata, function(value, key) {
                    if (!value.loop) { // this field does not belong to a loop
                        var colTitle = replaceUnderscoreAndCapitalize(key);
                        columns.push({
                            "title": colTitle,
                            "data": "metadata." + key + ".value.0"
                        });
                        if (datum.metadata[key].unit && datum.metadata[key].unit[0]) {
                            columns.push({
                                "title": colTitle + " Unit",
                                "data": "metadata." + key + ".unit.0"
                            });
                        }
                    }
                });
            }
            this.tableOpts = {
                data: data,
                columns: columns
            };
        },

        insertClassTemplateSpecificColumns: function(datum) {
            var cols = [];
            switch(datum.type.classTemplate) {
                case Classes.SUBJECT:
                    if (datum.personalInfo) { // if you are allowed to see the Personal Details
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
                {"title": i18n("birth-date"), "data": "personalInfo.birthDate"},
                {"title": i18n("sex"), "data": "personalInfo.sex"}
            ];
        },

        insertSubjectColumns: function() {
            return [{
                "title": i18n("code"),
                "data": "code"
            }];        
        },

        insertSampleColumns: function() {
            return [{
                "title": i18n("biobankCode"),
                "data": "biobankCode"
            }];
        }

    });

} (xtens, xtens.module("xtenstable")));
