/**
 * @author Massimiliano Izzo
 * 
 */
function renderDatatablesDate(data, type) {
    
    function pad(s) { return (s < 10) ? '0' + s : s; }

    if (!_.isEmpty(data)) {
        var d = new Date(data);
        if (type === 'display' || type === 'filter') {
            return pad(d.getDate()) + "/" + pad(d.getMonth()+1) + "/" + d.getFullYear();
        }
        else return new Date(data);
    }
    return "";
}

(function(xtens, XtensTable) {

    var i18n = xtens.module("i18n").en;
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
    var DataTypeModel = xtens.module("datatype").Model;
    
    /**
     * @class Views.Datatable
     */
    XtensTable.Views.DataTable = Backbone.View.extend({

        tagName: 'table',
        className: 'query-table',

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
        
        /**
         * @method
         * @name prepareDataForRendering
         * @description Format the data according to the dataType schema and prepare data for visualization through DataTables
         */
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
                        
                        var columnOpts = {
                            "title": colTitle,
                            "data": "metadata." + field.name + ".value",
                            "visible": field.visible,
                            "defaultContent": ""
                        };
                        
                        switch(field.fieldType) {
                            case "Date":    // if the column has dates render them in the desired format
                                columnOpts.render = renderDatatablesDate;
                                break;
                        }

                        columns.push(columnOpts);

                        if (field.hasUnit) {
                            columns.push({
                                "title": colTitle + " Unit",
                                "data": "metadata." + field.name + ".unit",
                                "visible": field.visible,
                                "defaultContent": ""
                            });
                        }

                });
            this.tableOpts = {
                data: data,
                columns: columns,
                "pagingType": "full_numbers", // DOES NOT WORK!!
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
                "title": i18n("biobank-code"),
                "data": "biobank_code"
            }];
        }

    });

} (xtens, xtens.module("xtenstable")));
