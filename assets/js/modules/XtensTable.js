/**
 * @author Massimiliano Izzo
 * 
 */
(function(xtens, XtensTable) {

    var i18n = xtens.module("i18n").en;
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

        initialize: function(options) {
            /*
               this.prepareDataForRendering(options.data);
               this.render(); */
        },

        render: function() {
            this.$el.DataTable(this.tableOpts);
            return this;
        },

        prepareDataForRendering: function(data, headers) {
            var columns = [], datum = data[0];
            if (datum.metadata) {
                _.each(datum.metadata, function(value, key) {
                    if (!value.loop) { // this field does not belong to a loop
                        var colTitle = replaceUnderscoreAndCapitalize(key);
                        columns.push({
                            "title": colTitle,
                            "data": "metadata." + key + ".value.0"
                        });
                        if (datum.metadata[key].unit) {
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

    });

} (xtens, xtens.module("xtenstable")));
