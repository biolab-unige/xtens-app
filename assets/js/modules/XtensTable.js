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
            if (!options || !options.dataType) {
                throw new Error("Missing required options: dataType");
            }
            this.dataType = new DataTypeModel(options.dataType);
            this.prepareDataForRenderingJSON(options.data);
            // this.render();
        },
        
        /**
         * @method
         * @name render
         */
        render: function() {
            return this;
        },

        /**
         * @method
         * @name destroy
         */
        destroy: function() {
             if (this.table) { 
                 this.table.destroy(true);
                 this.$el.empty();
             }
             this.remove();
        },

        /**
         * @method
         * @name displayDataTable
         * @description show the datatable given the option object
         */
        displayDataTable: function() {
            if (this.tableOpts && !_.isEmpty(this.tableOpts.data)) {
                this.table = this.$el.DataTable(this.tableOpts);
            }

            // the returned dataset is empty
            else {
                this.remove();
            }
        },
        
        /**
         * @method
         * @name prepareDataForRenderingJSON
         * @description Format the data according to the dataType schema and prepare data for visualization through DataTables
         */
        prepareDataForRenderingJSON: function(data, headers) {
            /*
            if (!this.dataType) {
                return; //TODO add alert box
            } */
            // var dataType = new DataTypeModel(this.dataType);
            var fieldsToShow = this.dataType.getFlattenedFields(true); // get the names of all the madatafields but those within loops;
            var columns = this.insertModelSpecificColumns(this.dataType.get("model"), true);  // TODO manage permission for personalDetails
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
                "paging": true,
                "info": true,
                "pagingType": "full_numbers" // DOES NOT WORK!!
            };
        },

        /**
         * @method
         * @name prepareDataForRenderingJSON
         * @description Format the data according to the dataType schema and prepare data for visualization through DataTables
         */
        prepareDataForRenderingHtml: function(data, dataType, headers) {
            if (!dataType) {
                return;
            }
            dataType = new DataTypeModel(dataType);
            var fields = dataType.getFlattenedFields(true);
            var columns = this.insertModelSpecificColumns(dataType.get("model"), true);  // TODO manage permission for personalDetails
            
            var i, j, row = "<thead><tr>", value, unit;
            
            for (i=0; i<fields.length; i++) {
                if (fields[i].visible) {
                    row += "<th>" + fields[i].name + "</th>";

                    if (fields[i].hasUnit) {
                        row += "<th>" + fields[i].name + " Unit</th>";
                    }
                }
            }

            row += "</tr></thead>";
            this.$el.append(row);
            
            for (i=0; i<data.length; i++) {
                row = "<tr>";
                for (j=0; j<fields.length; j++) {

                    if (fields[j].visible) {
                        value = data[i].metadata[fields[j].name] && data[i].metadata[fields[j].name].value;
                        row += "<td>" + (value || "") + "</td>";

                        if (fields[j].hasUnit) {
                            unit = data[i].metadata[fields[j].name] && data[i].metadata[fields[j].name].unit;
                            row += "<td>" + (unit || "") + "</td>";
                        }
                    }

                }
                row += "</tr>";
                this.$el.append(row);
            }
            
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
        },

        /**
         * @method
         * @name addLinks
         * @description add the proper links to each row in the table given the dataType Model
         */
        addLinks: function() {
            switch(this.dataType.get("model")) {} // TODO
        }

    });

} (xtens, xtens.module("xtenstable")));
