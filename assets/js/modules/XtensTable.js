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
          if (type === 'display' || type === 'filter' || type === 'export') {
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
      var DataType = xtens.module("datatype");
      var Data = xtens.module("data");
      var SuperType = xtens.module("supertype");
      var Sample = xtens.module("sample");
      var DataFile = xtens.module("datafile");
      var Operator = xtens.module("operator");
      var VIEW_OVERVIEW = Privileges.VIEW_OVERVIEW;
      var VIEW_DETAILS = Privileges.VIEW_DETAILS;
      var EDIT = Privileges.EDIT;
      var DOWNLOAD = Privileges.DOWNLOAD;
      var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

    /**
     * @class
     * @name Views.Datatable
     */
      XtensTable.Views.DataTable = Backbone.View.extend({

          events: {
              "click .xtenstable-details": "showDetailsView",
              "click .xtenstable-edit": "showEditView",
              "mouseover .xtenstable-files": "showFileList",
              "click .xtenstable-derivedsamples": "showDerivedSampleList",
              "click .xtenstable-deriveddata": "showDerivedDataList",
              "click .xtenstable-subjectgraph": "showSubjectGraph",
              "mouseover td.project-owner": "showTooltipOwner",
              "click td.project-owner": "showPopoverOwner"

          },

          tagName: 'table',
          className: 'query-table',

          initialize: function(options) {
              // var that = this;
              if (!options || !options.result.dataTypes) {
                  throw new Error("Missing required options: dataTypes");
              }
              // this.multiProject = _.isArray(options.result.dataTypes) ? true : false;
              this.multiProject = options.multiProject;
              this.dataTypes = _.isArray(options.result.dataTypes) ? new DataType.List(options.result.dataTypes) : new DataType.Model(options.result.dataTypes);
              this.dataTypePrivileges = options.result.dataTypePrivileges;
            // console.log(options.result.data);
              this.isLeafSearch = options.leafSearch.isLeafSearch;
              this.leafInfo = options.leafSearch.info;
              this.queryArgs = options.queryArgs;

              var results = this.getCurrentTypeAndPrivileges(options.queryArgs.dataType);
              this.rootDataType = results.dt;

              this.data = options.result.data;
              this.$modal = $(".query-modal");
              this.prepareDataForRenderingJSON(results.dtps, results.dts, this.queryArgs);
            // this.render();
          },

          getCurrentTypeAndPrivileges: function (dataType) {
              var currentDT = this.isLeafSearch || this.multiProject ? _.find(this.dataTypes.models, function (dt) {
                  return dt.id === dataType;
              }) : this.dataTypes;
              var currentMDT = this.isLeafSearch || this.multiProject ? _.filter(this.dataTypes.models, function (dt) {
                  return dt.get('superType').id === currentDT.get('superType').id;
              }) : this.dataTypes;
              var idDts = _.map(currentMDT,'id');
              // var currentMDTP = [];
              var currentMDTP = this.isLeafSearch || this.multiProject ? this.dataTypePrivileges.filter(function(dtp) {
                  return idDts.indexOf(dtp.dataType) != -1;
              }) : this.dataTypePrivileges;
              return {dt: currentDT, dts: currentMDT, dtps: currentMDTP};
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
         * @name addRowsDataTable
         */
          addRowsDataTable: function(data) {
              if (data) {
                  this.data = this.data.concat(data);
                  this.addLinks(this.optLinks);
                  // TODO: disabilitare le actions per i multi projects
                  this.table.rows.add(data);
                  var currentPage = this.table.page();
                  this.table.page(currentPage).draw(false);
              }
          },

          showTooltipOwner: function (ev) {
              ev.stopPropagation();
              $(ev.currentTarget).tooltip({
                  position: {
                      my: 'right center',
                      at: 'left-10 center'
                  },
                  container: 'body',
                  title: i18n("click-to-show-owner-contacts")
              }).tooltip('show');
          },

          showPopoverOwner: function (ev) {
              ev.stopPropagation();
              var that = this;
              var data = this.table.row( $(ev.currentTarget).parents('tr') ).data();
              var projects = xtens.session.get("projects");
              var project = _.find(projects,function (pr) {
                  var dt = that.multiProject ? _.find(that.dataTypes.models, {'id': data.type}) : that.dataTypes;
                  return pr.id === dt.get('project');
              });

              var owner = new Operator.Model({id: data.owner});
              var ownerDeferred = owner.fetch({
                  data: $.param({populate:['addressInformation']})
              });

              $.when(ownerDeferred).then(function(ownerRes) {
                  if (that.modal) {
                      that.modal.hide();
                  }
                  var modal = new ModalDialog({
                      template: JST["views/templates/address-modal.ejs"],
                      data: { __: i18n, project: project, data: data, owner: ownerRes, address: ownerRes.addressInformation }
                  });

                  that.$modal.append(modal.render().el);
                  modal.show();

                  that.$('.query-modal').on('hidden.bs.modal', function (e) {
                      modal.remove();
                      $('.modal-backdrop').remove();
                  });
              });
          },

        /**
         * @method
         * @name displayDataTable
         * @description show the datatable given the option object
         */
          displayDataTable: function() {

              this.tableOpts = {
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

              if (this.tableOpts && !_.isEmpty(this.tableOpts.data)) {
                  this.table = this.$el.DataTable(this.tableOpts);

                  if (this.tableOpts.columns.length>9){
                      new $.fn.dataTable.FixedColumns(this.table, {
                          leftColumns:this.numLeft,
                          rightColumns: this.multiProject ? 0 : 1 //for multiProject search no available actions
                      });
                  }
                  else{
                      this.tableOpts.fixedColumns=false;
                  }
                  var buttons = [
                      {
                          extend: 'colvis',
                          postfixButtons: [ 'colvisRestore' ]
                      },
                      {
                          extend: 'copyHtml5',
                          exportOptions: {
                              orthogonal: 'export', // to export source data and not rendered data
                              columns:  ':visible:not(.actions)' //to not export actions column
                          }
                      },
                      {
                          extend: 'excelHtml5',
                          exportOptions: {
                              orthogonal: 'export', // to export source data and not rendered data
                              columns:  ':visible:not(.actions)' //to not export actions column
                          }
                      }
                  ];
                //TODO CREAZIONE BOTTONI SULLA BASE DI LEAF SEARCH
                  this.colvisButtons.push(buttons);
                  this.colvisButtons = _.flatten(this.colvisButtons);
                  new $.fn.dataTable.Buttons(this.table, {
                      buttons: this.colvisButtons
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
          prepareDataForRenderingJSON: function(dataTypePrivileges, dataTypes, queryArgs) {
              var that = this;
              this.colvisButtons = [];

              var model = this.multiProject || this.isLeafSearch ? dataTypes[0].get("model") : dataTypes.get("model");
              this.columns = this.insertModelSpecificColumns(model, xtens.session.get('canAccessPersonalData'));
              if (this.multiProject) {
                  this.columns.push({"title": i18n("project-owner"), "data": function (data) {
                      var projects = xtens.session.get("projects");
                      var project = _.filter(projects,function (pr) {
                          var dt = that.multiProject || that.isLeafSearch ? _.find(that.dataTypes.models, {'id': data.type}) : that.dataTypes;
                          return pr.id === dt.get('project');
                      });
                      return project.length > 0 ? project[0].name : "No project";
                  }, "className": "project-owner"});
              }
              this.numLeft=this.columns.length;

              var fileUpload =  !this.multiProject ? this.isLeafSearch ? dataTypes[0].get("superType").schema.header.fileUpload : dataTypes.get("superType").schema.header.fileUpload : false;
              var hasDataChildren = false, hasSampleChildren = false;
              var dataTypeChildren = !this.multiProject ?  _.where( this.isLeafSearch ? dataTypes[0].get("children") : dataTypes.get("children"), {"model": Classes.DATA}) : [];
              var sampleTypeChildren = !this.multiProject ?  _.where( this.isLeafSearch ? dataTypes[0].get("children") : dataTypes.get("children"), {"model": Classes.SAMPLE}) : [];
              if (dataTypeChildren.length > 0) {
                  hasDataChildren = true;
              }
              if (sampleTypeChildren.length > 0) {
                  hasSampleChildren = true;
              }
              this.optLinks = {dataTypes: dataTypes, dataTypePrivileges: dataTypePrivileges, hasDataSensitive : false, fileUpload : fileUpload, hasDataChildren : hasDataChildren, hasSampleChildren : hasSampleChildren};

              this.prepareDataForRenderingJSONLeaf(dataTypePrivileges, dataTypes, queryArgs, queryArgs.dataType);

              if (!this.multiProject) {
                  this.addLinks(this.optLinks);
              }
          },

          /**
           * @method
           * @name prepareDataForRenderingJSONLeaf
           * @description Format the data according to the dataType schema and prepare data for visualization through DataTables
           */
          prepareDataForRenderingJSONLeaf: function (dataTypePrivileges, dataTypes, queryArgs, idDataType) {
              var that = this;
              if(queryArgs.getMetadata || idDataType) {
                  var fieldsToShow = [];

                  var selectedSuperType = new SuperType.Model(this.multiProject || this.isLeafSearch ? dataTypes[0].get("superType") : dataTypes.get("superType"));
                  var flattenedFields = selectedSuperType.getFlattenedFields(); // get the names of all the madatafields but those within loops;

                  var dtpOverview = this.multiProject || this.isLeafSearch ? _.filter(dataTypePrivileges, function (dtp) { return dtp.privilegeLevel === VIEW_OVERVIEW;}) : dataTypePrivileges && dataTypePrivileges.privilegeLevel === VIEW_OVERVIEW ? true : false;
                  if(!dtpOverview || !dtpOverview.length || (this.multiProject && dtpOverview.length !== dataTypePrivileges.length)){
                      flattenedFields.forEach(function(field) {
                          if (field.sensitive && idDataType) { that.optLinks.hasDataSensitive = true; }
                          if (!field.sensitive || xtens.session.get('canAccessSensitiveData') ) {
                              fieldsToShow.push(field);
                          }});
                  }
                  var className = "deafult-label";
                  className = idDataType ? this.rootDataType.get('name').toLowerCase().replace(/[||\-*/,=<>~!^()\ ]/g,"_") : queryArgs.label;

                  //set up colvis buttons for any leafs
                  if (this.isLeafSearch) {
                      var colvisButton = {
                          extend: 'colvisGroup',
                          text : 'Show only '
                      };
                      colvisButton.text =+ idDataType ? this.rootDataType.get('name') : queryArgs.title;
                      colvisButton.show = '.' + className; //not(.actions)
                      colvisButton.hide = ':not(.' + className + '):not(.header):not(.actions):not(.project-owner)';
                      this.colvisButtons.push(colvisButton);
                  }

                  _.each(fieldsToShow, function(field) {
                      var colTitle = field.name;
                      var fieldName = useFormattedNames ? field.formattedName : field.name;
                      var columnOpts = {
                          "title": colTitle,
                          "data": idDataType ? "metadata." + fieldName + ".value" : queryArgs.label + "." + fieldName + ".value",
                          "visible": field.visible,
                          "defaultContent": "",
                          "className": className
                      };
                      // if field is loop retrieve multiple values
                      if (field._loop) {
                          columnOpts.data = idDataType ? "metadata." + fieldName + ".values" : queryArgs.label + "." + fieldName + ".values";
                          columnOpts.render = function (data, type, row) {
                              var priv = this.multiProject || this.isLeafSearch ? _.findWhere(dataTypePrivileges, {'dataType': row.type}) : dataTypePrivileges;
                              if (priv && priv.privilegeLevel !== VIEW_OVERVIEW) {
                                  return data && type === 'export' ? data.join() : data ? data.length > 2 ? '<span>List on Details button</span>' : data.join() : null;
                              }
                              else {
                                  return null;
                              }
                          };
                      }
                      else {
                          switch(field.fieldType) {
                              case "Date":    // if the column has dates render them in the desired format
                                  columnOpts.render = function (data,  type, row ) {
                                      var priv = this.multiProject || this.isLeafSearch ? _.findWhere(dataTypePrivileges, {'dataType': row.type}) : dataTypePrivileges;
                                      if (priv && priv.privilegeLevel !== VIEW_OVERVIEW) {

                                          return renderDatatablesDate(data, type);
                                      }
                                      else {
                                          return null;
                                      }
                                  };
                                  break;
                              case "Boolean":    // if the column has booleans render them in the desired format
                                  columnOpts.render = function ( data,  type, row ) {
                                      var priv = this.multiProject || this.isLeafSearch ? _.findWhere(dataTypePrivileges, {'dataType': row.type}) : dataTypePrivileges;
                                      if (priv && priv.privilegeLevel !== VIEW_OVERVIEW) {
                                          return renderDatatablesBoolean(data);
                                      }
                                      else {
                                          return null;
                                      }
                                  };
                                  break;
                              case "Link":    // if the column has links render them in the desired format
                                  columnOpts.render = function ( data, type, row ) {
                                      var priv = this.multiProject || this.isLeafSearch ? _.findWhere(dataTypePrivileges, {'dataType': row.type}) : dataTypePrivileges;
                                      if (priv && priv.privilegeLevel !== VIEW_OVERVIEW) {
                                          return  data = '<a href="' + data + '" target="_blank">' + data + '</a>';
                                      }
                                      else {
                                          return null;
                                      }
                                  };
                                  break;
                              default:      // if the column has numbers, texts, floats render them in the default format
                                  columnOpts.render = function ( data, type, row ) {
                                      var priv = this.multiProject || this.isLeafSearch ? _.findWhere(dataTypePrivileges, {'dataType': row.type}) : dataTypePrivileges;
                                      if (priv && priv.privilegeLevel !== VIEW_OVERVIEW) {
                                          return  data;
                                      }
                                      else {
                                          return null;
                                      }
                                  };
                                  break;
                          }
                      }

                      this.columns.push(columnOpts);

                      if (field.hasUnit) {
                          columnOpts = {
                              "title": colTitle + " Unit",
                              "data": idDataType ? "metadata." + fieldName + ".unit" : queryArgs.label + "." + fieldName + ".unit",
                              "visible": field.visible,
                              "defaultContent": "",
                              "className": className
                          };

                          // if field is loop retrieve multiple units
                          if (field._loop) {
                              columnOpts.data = idDataType ? "metadata." + fieldName + ".units" : queryArgs.label + "." + fieldName + ".units";
                          }
                          this.columns.push(columnOpts);
                      }

                  }, this);



              }
              else {
                  this.setLeafIdColumns(queryArgs);
              }
              // handle leafs
              if (this.isLeafSearch){
                  var contents = queryArgs.content ? queryArgs.content : [];
                  _.forEach( contents, function (content) {
                      if (content.dataType) {
                        // get right dataTypes and privileges of nested content
                          var results = that.getCurrentTypeAndPrivileges(content.dataType);
                          that.prepareDataForRenderingJSONLeaf(results.dtps, results.dts, content);
                      }
                  });
              }

          },

          setLeafIdColumns: function (content) {
              var columnOpts = {
                  "title": content.title,
                  "data": content.label + "_id",
                  "visible": true,
                  "defaultContent": "",
                  "className": content.label
              };
              this.columns.push(columnOpts);
          },

        /**
         * @method
         * @name prepareDataForRenderingHTML
         * @description Format the data according to the dataType schema and prepare data for visualization through DataTables
         */

          // prepareDataForRenderingHtml: function(data, dataType, headers) {
          //     if (!dataType) {
          //         return;
          //     }
          //     dataType = new DataType.Model(dataType);
          //     var fields = dataType.getFlattenedFields(true);
          //     var columns = this.insertModelSpecificColumns(dataType.get("model"), xtens.session.get('canAccessPersonalData'));
          //
          //     var i, j, row = "<thead><tr>", value, unit;
          //
          //     for (i=0; i<fields.length; i++) {
          //         if (fields[i].visible) {
          //             row += "<th>" + fields[i].name + "</th>";
          //
          //             if (fields[i].hasUnit) {
          //                 row += "<th>" + fields[i].name + " Unit</th>";
          //             }
          //         }
          //     }
          //
          //     row += "</tr></thead>";
          //     this.$el.append(row);
          //
          //     for (i=0; i<data.length; i++) {
          //         row = "<tr>";
          //         for (j=0; j<fields.length; j++) {
          //
          //             if (fields[j].visible) {
          //                 value = data[i].metadata[fields[j].name] && data[i].metadata[fields[j].name].value;
          //                 row += "<td>" + (value || "") + "</td>";
          //
          //                 if (fields[j].hasUnit) {
          //                     unit = data[i].metadata[fields[j].name] && data[i].metadata[fields[j].name].unit;
          //                     row += "<td>" + (unit || "") + "</td>";
          //                 }
          //             }
          //
          //         }
          //         row += "</tr>";
          //         this.$el.append(row);
          //     }
          //
          // },

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
                {"title": i18n("surname"),
                "data": function ( data ) {
                    return  data.surname ? data.surname : "";
                },"className": "header"},
                {"title": i18n("given-name"), "data": function ( data ) {
                    return  data.given_name ? data.given_name : "";
                },"className": "header"},
                {"title": i18n("birth-date"), "data": "birth_date", "render": renderDatatablesDate,"className": "header"}
              ];
          },

          insertSubjectColumns: function() {
              return [
                {"title": i18n("code"),"data": "code","className": "header"},
                {"title": i18n("sex"),"data": "sex",
              "className": "header"}
              ];
          },

          insertSampleColumns: function() {
              return [
                {"title": i18n("biobank"), "data": "biobank_acronym","className": "header"},
                {"title": i18n("biobank-code"), "data": "biobank_code","className": "header"}
              ];
          },

        /**
         * @method
         * @name addLinks
         * @description add the proper links to each row in the table given the dataType Model
         */
          addLinks: function(options) {

              var btnGroupTemplate = JST["views/templates/xtenstable-buttongroup.ejs"];
              var that = this;
              _.each(this.data, function(datum) {
                  var privilege = that.multiProject || that.isLeafSearch ? _.find(options.dataTypePrivileges, {dataType: datum.type}) : options.dataTypePrivileges;
                  datum._links = btnGroupTemplate({
                      __:i18n,
                      dataTypeModel: that.multiProject || that.isLeafSearch ? options.dataTypes[0].get("model") : options.dataTypes.get("model"),
                      privilegeLevel : privilege ? privilege.privilegeLevel : undefined,
                      hasDataSensitive: options.hasDataSensitive,
                      fileUpload: options.fileUpload,
                      hasDataChildren: options.hasDataChildren,
                      hasSampleChildren: options.hasSampleChildren
                  });
              });

              this.columns.push({
                  "data": "_links",
                  "title": i18n("actions"),
                  "className": "actions"
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
              var model = this.multiProject || this.isLeafSearch ? _.find(this.dataTypes.models, {'id': data.type }).get("model") : this.dataTypes.get("model");
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
              var model = this.multiProject || this.isLeafSearch ? _.find(this.dataTypes.models, {'id': data.type }).get("model") : this.dataTypes.get("model");
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
              var dataType = this.multiProject || this.isLeafSearch ? _.find(this.dataTypes.models, {'id': data.type }) : this.dataTypes;
              var model = dataType.get("model");
              var parentProperty = model === Classes.SUBJECT ? 'parentSubject' : model === Classes.SAMPLE ? 'parentSample' : 'parentData';
              var path = "data?" + parentProperty + "=" + data.id;

            // TODO change "code" to "subjectCode" for sake of clarity
              path += data.code ? "&parentSubjectCode=" + data.code : '';
              path += "&parentDataType=" + dataType.id;

              xtens.router.navigate(path, {trigger: true});
              return false;
          },

          /**
           * @method
           * @name showSubjectGraph
           * @param{Object} ev - the current event
           * @description returns a graph of the subject selected
           */
          showSubjectGraph: function(ev) {
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var data = currRow.data();
              var path = "subjects/graph?idPatient=" + data.id;

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
              var dataType = this.multiProject || this.isLeafSearch ? _.find(this.dataTypes.models, {'id': data.type }) : this.dataTypes;
              var model = dataType && dataType.get("model");
            // DATA cannot have sample child
              if (model === Classes.DATA)
                  return false;

              var parentProperty = model === Classes.SUBJECT ? 'donor' : 'parentSample';
              var path = "samples?" + parentProperty + "=" + data.id;

            // TODO change "code" to "subjectCode" for sake of clarity
              path += data.code ? "&donorCode=" + data.code : '';
              path += "&parentDataType=" + dataType.id;

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
            // if there is any open popover destroy it
              var that = this;
              var currRow = this.table.row($(ev.currentTarget).parents('tr'));
              var id = currRow.data().id;
              var model = this.multiProject || this.isLeafSearch ? this.dataTypes.models[0].get("model") : this.dataTypes.get("model");
              if (!this[id]){
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

                          $(ev.currentTarget).popover({
                              trigger:'manual',
                              container: '.query',
                              html: true,
                              content: view.render().el,
                              placement: 'auto left'
                          }).on("mouseenter", function () {
                              var _this = this;
                              $(this).popover("show");
                          }).on("mouseleave", function () {
                              var _this = this;
                              if (!$(".popover:hover").length && !$(".xtenstable-files:hover").length) {
                                  $(_this).popover("hide");
                              }
                          }).popover('show');

                          $(".popover").on("mouseleave", function () {
                              if (!$(".xtenstable-files:hover").length) {
                                  $(ev.currentTarget).popover("hide");
                              }
                          });
                          // that.listenTo(view, 'closeMe', that.removeChild);
                          // that.childrenViews.push(view);
                      },
                      error: function(model, err) {
                        // console.log(err);
                      }
                  });
                  this[id] = true;
              }
              // else {
              //     $(this).popover("show");
              // }
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
