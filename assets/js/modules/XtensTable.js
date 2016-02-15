/**
 * @module
 * @author Massimiliano Izzo
 *
 */
  function renderDatatablesBoolean( data ) {
      if (data) {
          return 'true';
      }
      return 'false';
  }

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
      var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames;
      var Classes = xtens.module("xtensconstants").DataTypeClasses;
      var Privileges = xtens.module("xtensconstants").DataTypePrivilegeLevels;
      var replaceUnderscoreAndCapitalize = xtens.module("utils").replaceUnderscoreAndCapitalize;
      var DataTypeModel = xtens.module("datatype").Model;
      var Data = xtens.module("data");
      var Sample = xtens.module("sample");
      var DataFile = xtens.module("datafile");
      var VIEW_OVERVIEW = Privileges.VIEW_OVERVIEW;

    /**
     * @class
     * @name Views.Datatable
     */
      XtensTable.Views.DataTable = Backbone.View.extend({

          events: {
              "click .xtenstable-details": "showDetailsView",
              "click .xtenstable-edit": "showEditView",
              "click .xtenstable-files": "showFileList",
              "click .xtenstable-derivedsamples": "showDerivedSampleList",
              "click .xtenstable-deriveddata": "showDerivedDataList",
              "click .xtenstable-parameters": "showVideoParameters"
          },

          tagName: 'table',
          className: 'query-table',

          initialize: function(options) {
              if (!options || !options.dataType) {
                  throw new Error("Missing required options: dataType");
              }
              this.dataType = new DataTypeModel(options.dataType);
            // console.log(options.data);
              this.data = options.data;
              this.dataTypePrivilege = options.dataTypePrivilege;
              this.childrenViews = [];
              this.prepareDataForRenderingJSON(this.dataTypePrivilege);
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
                  this.table = null;
                  this.$el.empty();
              }
          // Remove view from DOM
              this.remove();
          },

        /**
         * @method
         * @name addRowDataTable
         */
          addRowDataTable: function(data) {
              if (data) {
                  this.data = this.data.concat(data);
                  this.addLinks(this.optLinks);
                  this.table.rows.add(data);
                  var currentPage = this.table.page();
                  this.table.page(currentPage).draw(false);
              }
          },

        /**
         * @method
         * @name displayDataTable
         * @description show the datatable given the option object
         */

          displayDataTable: function() {

              if (this.tableOpts && !_.isEmpty(this.tableOpts.data)) {
                  this.table = this.$el.DataTable(this.tableOpts);

                  if (this.tableOpts.columns.length>9){
                      new $.fn.dataTable.FixedColumns(this.table, {
                          leftColumns:this.numLeft,
                          rightColumns:1
                      });
                  }
                  else{
                      this.tableOpts.fixedColumns=false;
                  }

                // display the buttons option
                  new $.fn.dataTable.Buttons(this.table, {
                      buttons: [
                          'copy', 'excel'
                      ]
                  });
                  this.table.buttons().container().appendTo($('.col-sm-6:eq(0)', this.table.table().container()));

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
          prepareDataForRenderingJSON: function(dataTypePrivilege) {
            /*
            if (!this.dataType) {
                return; //TODO add alert box
            } */

              var fileUpload = this.dataType.get("schema").header.fileUpload;
              var hasDataSensitive = false;
              this.fieldsToShow = [];
              var that = this;
              var hasDataChildren = false, hasSampleChildren = false;
              var dataTypeChildren = _.where(this.dataType.get("children"), {"model": Classes.DATA});
              var sampleTypeChildren = _.where(this.dataType.get("children"), {"model": Classes.SAMPLE});
              if (dataTypeChildren.length > 0) {
                  hasDataChildren = true;
              }
              if (sampleTypeChildren.length > 0) {
                  hasSampleChildren = true;
              }
              var flattenedFields = this.dataType.getFlattenedFields(); // get the names of all the madatafields but those within loops;
              this.columns = this.insertModelSpecificColumns(this.dataType.get("model"), xtens.session.get('canAccessPersonalData'));  // TODO manage permission for personalDetails
              this.numLeft=this.columns.length;

              if(dataTypePrivilege && dataTypePrivilege.privilegeLevel !== VIEW_OVERVIEW){
                  flattenedFields.forEach(function(field) {
                      if (field.sensitive) { hasDataSensitive = true; }
                      if ( !field.sensitive || xtens.session.get('canAccessSensitiveData') ) {
                          that.fieldsToShow.push(field);
                      }});
              }

              this.optLinks = {dataTypePrivilege: dataTypePrivilege, hasDataSensitive : hasDataSensitive, fileUpload : fileUpload, hasDataChildren : hasDataChildren, hasSampleChildren : hasSampleChildren};

              _.each(this.fieldsToShow, function(field) {
                  var colTitle = field.name;

                  var fieldName = useFormattedNames ? field.formattedName : field.name;

                  var columnOpts = {
                      "title": colTitle,
                      "data": "metadata." + fieldName + ".value",
                      "visible": field.visible,
                      "defaultContent": ""
                  };

                        // if field is loop retrieve multiple values
                  if (field._loop) {
                      columnOpts.data = "metadata." + fieldName + ".values";
                      var data = columnOpts.data;
                      columnOpts.render = function ( data ) {
                          return  data && data.length > 2 ? '<span>List on Details button</span>' : data.join();
                      };

                  }

                  switch(field.fieldType) {
                      case "Date":    // if the column has dates render them in the desired format
                          columnOpts.render = renderDatatablesDate;
                          break;
                      case "Boolean":    // if the column has dates render them in the desired format
                          columnOpts.render = function ( data ) {
                              return  renderDatatablesBoolean(data);
                          };
                          break;
                  }

                  this.columns.push(columnOpts);

                  if (field.hasUnit) {

                      columnOpts = {
                          "title": colTitle + " Unit",
                          "data": "metadata." + fieldName + ".unit",
                          "visible": field.visible,
                          "defaultContent": ""
                      };

                            // if field is loop retrieve multiple units
                      if (field._loop) {
                          columnOpts.data = "metadata." + fieldName + ".units";
                      }

                      this.columns.push(columnOpts);
                  }

              }, this);

            // add links
              this.addLinks(this.optLinks);

              this.tableOpts = {
                // processing:     true,
                  data:           this.data,
                  columns:        this.columns,
                  info:           true,
                  scrollX:        true,
                  scrollY:        "500px",
                  scrollCollapse: true,
                  paging:         true,
                  autoWidth:      false,
                  deferRender:    true,
                  columnDefs: [
                  {"className": "dt-center", "targets": "_all"}
                  ],
                  pagingType: "full_numbers" // DOES NOT WORK!!
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
              var columns = this.insertModelSpecificColumns(dataType.get("model"), xtens.session.get('canAccessPersonalData'));

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
              if (canViewPersonalInfo) { // if you are allowed to see the Personal Details
                  cols = cols.concat(this.insertPersonalDetailsColumns());
              }
              switch(model) {
                  case Classes.SUBJECT || Classes.DATA:
                      cols = cols.concat(this.insertSubjectColumns());
                      break;
                  case Classes.DATA:
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
                {"title": i18n("surname"), "data": "surname"},
                {"title": i18n("given-name"), "data": "given_name"},
                {"title": i18n("birth-date"), "data": "birth_date", "render": renderDatatablesDate}
              ];
          },

          insertSubjectColumns: function() {
              return [
                {"title": i18n("code"),"data": "code"},
                {"title": i18n("sex"),"data": "sex"}
              ];
          },

          insertSampleColumns: function() {
              return [
                {"title": i18n("biobank"), "data": "biobank_acronym"},
                {"title": i18n("biobank-code"), "data": "biobank_code"}
              ];
          },

        /**
         * @method
         * @name addLinks
         * @description add the proper links to each row in the table given the dataType Model
         */

          addLinks: function(options) {

              var btnGroupTemplate = JST["views/templates/xtenstable-buttongroup.ejs"];

              _.each(this.data, function(datum) {
                  datum._links = btnGroupTemplate({
                      __:i18n,
                      privilegeLevel : options.dataTypePrivilege.privilegeLevel,
                      hasDataSensitive: options.hasDataSensitive,
                      fileUpload: options.fileUpload,
                      hasDataChildren: options.hasDataChildren,
                      hasSampleChildren: options.hasSampleChildren
                  });
              });

            _.each(this.data, function(datum) {
                datum._links = btnGroupTemplate({__:i18n,id:id});
            });

            this.columns.push({
                "data": "_links",
                "title": i18n("actions")
            });

        },


        /**
         * @method
         * @name showDetailsView
         * @param{Object} ev - the current event
         * @description returns the details view associated to the current item
         */
          showDetailsView: function(ev) {
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var data = currRow.data();

            // model here is the ENTITY model (a.k.a. the server-side resource)
              var model = this.dataType.get("model");
              var path = model === Classes.DATA ? model.toLowerCase() : model.toLowerCase() + 's';
              path += "/details/" + data.id;
              xtens.router.navigate(path, {trigger: true});
              return false;
          },

        /**
         * @method
         * @name showEditView
         * @param{Object} ev - the current event
         * @description returns the details view associated to the current item
         */
          showEditView: function(ev) {
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var data = currRow.data();

            // model here is the ENTITY model (a.k.a. the server-side resource)

              var model = this.dataType.get("model");
              var path = model === Classes.DATA ? model.toLowerCase() : model.toLowerCase() + 's';
              path += "/edit/" + data.id;
              xtens.router.navigate(path, {trigger: true});
              return false;
          },


        /**
         * @method
         * @name showDerivedDataList
         * @param{Object} ev - the current event
         * @description returns a list of the data stored as children of the given data instance
         */

          showDerivedDataList: function(ev) {
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var data = currRow.data();
              var childrenData = new Data.List();
              var model = this.dataType.get("model");
              var parentProperty = model === Classes.SUBJECT ? 'parentSubject' : model === Classes.SAMPLE ? 'parentSample' : 'parentData';
              var path = "data?" + parentProperty + "=" + data.id;

            // TODO change "code" to "subjectCode" for sake of clarity
              path += data.code ? "&parentSubjectCode=" + data.code : '';
              path += "&parentDataType=" + this.dataType.id;

              xtens.router.navigate(path, {trigger: true});
              return false;
          },

        /**
         * @method
         * @name showDerivedSampleList
         * @param{Object} ev - the current event
         * @description returns a list of the samples stored as children of the given data instance
         *
         */

          showDerivedSampleList: function(ev) {
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var data = currRow.data();
              var childrenSample = new Sample.List();
              var model = this.dataType.get("model");

            // DATA cannot have sample child
              if (model === Classes.DATA)
                  return false;

              var parentProperty = model === Classes.SUBJECT ? 'donor' : 'parentSample';
              var path = "samples?" + parentProperty + "=" + data.id;

            // TODO change "code" to "subjectCode" for sake of clarity
              path += data.code ? "&donorCode=" + data.code : '';
              path += "&parentDataType=" + this.dataType.id;

              xtens.router.navigate(path, {trigger: true});
              return false;
          },

        /**
         * @method
         * @name showFileList
         * @param{Object} ev- the current event
         * @description returns the list of files associated to the current data instance
         */

          showFileList: function(ev) {
              var that = this;
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var id = currRow.data().id;
              var model = this.dataType.get("model");

            // subject has no associated files (at the moment)
              if (model === Classes.SUBJECT)
                  return false;

              var data = model === Classes.SAMPLE ? new Sample.Model() : new Data.Model();

              data.set("id", currRow.data().id);
              data.fetch({
                  data: $.param({populate: ['files']}),
                  success: function(result) {
                      var files = result.get("files");
                      var dataFiles = new DataFile.List(files);
                      var view = new DataFile.Views.List({collection: dataFiles});
                      console.log(dataFiles);

                    // if there is any open popover destroy it
                      $('[data-original-title]').popover('destroy');

                      $(ev.currentTarget).popover({
                          html: true,
                          content: view.render().el,
                          placement: 'auto right'
                      }).popover('show');
                      that.listenTo(view, 'closeMe', that.removeChild);
                      that.childrenViews.push(view);
                  },
                  error: function(model, err) {
                      console.log(err);
                  }
              });
          },

        /**
         * @method
         * @name removeChild
         * @param{Backbone.View} - the child view to be removed
         * @description safely remove a child view (such as a popover) from the table
         */
          removeChild: function(child) {
              for (var i=0, len = this.childrenViews.length; i<len; i++) {
                  if (_.isEqual(this.childrenViews[i], child)) {
                      this.stopListening(child);
                      child.remove();
                    // if contained within a popover remove it
                      $('[data-original-title]').popover('destroy');
                      this.childrenViews.splice(i, 1);
                  }
              }
          }

      });

  } (xtens, xtens.module("xtenstable")));
