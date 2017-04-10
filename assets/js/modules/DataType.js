/**
 * @author  Massimiliano Izzo
 * @description This file contains the Backbone classes for handling DataType
 *              models, collections and views
 */
(function(xtens, DataType) {

    // dependencies
    var i18n = xtens.module("i18n").en;
    var Constants = xtens.module("xtensconstants").Constants;
    var DataTypeClasses = xtens.module("xtensconstants").DataTypeClasses;
    var MetadataComponent = xtens.module("metadatacomponent");
    var MetadataGroup = xtens.module("metadatagroup");
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

    // XTENS router alias
    var router = xtens.router;

    // options object for Parsley Validation
    var parsleyOpts = {
        priorityEnabled: false,
        successClass: "has-success",
        errorClass: "has-error",
        classHandler: function(el) {
            return el.$element.parent();
        },
        errorsWrapper: "<span class='help-block'></span>",
        errorTemplate: "<span></span>"
    };

    /**
     * @class
     * @name DataType.Model
     *  define a DataType model
     */
    DataType.Model = Backbone.Model.extend({

        defaults: {
            model: DataTypeClasses.DATA
        },

        urlRoot: '/dataType',

        /**
         * @description flattens the metadata schema returning a 1D array containing all the metadata fields
         * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
         */
        getFlattenedFields: function(skipFieldsWithinLoops) {
            var flattened = [], groupName, groupContent, loopContent;
            var body = this.get("schema") && this.get("schema").body;
            if (!body) return flattened;
            for (var i=0, len=body.length; i<len; i++) {
                groupName = body[i].name;
                groupContent = body[i] && body[i].content;
                for (var j=0, l=groupContent.length; j<l; j++) {
                    if (groupContent[j].label === Constants.METADATA_FIELD) {
                        flattened.push(_.extend(groupContent[j], {_group: groupName}));
                    }
                    else if (groupContent[j].label === Constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                        loopContent = groupContent[j] && groupContent[j].content;
                        for (var k=0; k<loopContent.length; k++) {
                            if (loopContent[k].label === Constants.METADATA_FIELD) {

                                // add to the field a private flag that specifies its belonging to a loop
                                flattened.push(_.extend(loopContent[k], {
                                    _group: groupName,
                                    _loop: true
                                }));
                            }
                        }
                    }

                }
            }
            return flattened;
        },

        /**
         * @description checks whether the DataType contains at least a loop
         * @return{boolean} - true if the DataType contains at least a loop, false otherwise
         */
        hasLoops: function() {
            var body = this.get("schema") && this.get("schema").body;
            for (var i=0, len=body.length; i<len; i++){
                var groupContent = body[i] && body[i].content;
                if (_.where(groupContent, {label: Constants.METADATA_LOOP}).length > 0) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @method
         * @name getLoops
         * @description returns a list of the metadata loops contained in the current DataType
         * @return{Array} - an array containing all the Metadata loops
         */
        getLoops: function() {
            var body = this.get("schema") && this.get("schema").body;
            var res = [];
            for (var i=0, len=body.length; i<len; i++) {
                var groupContent = body[i] && body[i].content;
                res.push(_.where(groupContent, {label: Constants.METADATA_LOOP}));
            }
            return _.flatten(res, true);
        },

        /**
         * @method
         * @name validate
         * @description customized client-side validation for DataType Model
         */
        validate: function(attrs, opts) {
            var errors = [];

            if (!attrs.schema.body || !attrs.schema.body.length) {
                // errors.push({name:'groups', message: i18n("please-add-at-least-a-metadata-group")});
                return false;
            }
            // create a temporary DataType.Model to check the fields
            var tempModel = new DataType.Model(attrs);
            var flattened = tempModel.getFlattenedFields();
            if (!flattened.length) {
                errors.push({name:'attributes', message: i18n("please-add-at-least-a-metadata-field")});
            }
            // check that there are no fields with more than one occurrence
            var occurrences = {}, duplicates = [];
            _.each(_.map(flattened, 'name'), function(fieldName) {
                if (!occurrences[fieldName]) {
                    occurrences[fieldName] = 1;
                }
                else {
                    occurrences[fieldName]++;
                    duplicates.push(fieldName);
                }
            });
            if (!_.isEmpty(duplicates)) {
                errors.push({name: 'duplicates', message: i18n("data-type-has-the-following-duplicate-names") + ": " + duplicates.join(", ") });
            }
            return errors.length > 0 ? errors : false;
        }

    });

    DataType.List = Backbone.Collection.extend({
        url: '/dataType',
        model: DataType.Model
    });

    /**
     * This is the view to create/edit the DataType
     */

    DataType.Views.Edit = MetadataComponent.Views.Edit.fullExtend({
        events: {
            'submit .edit-datatype-form': 'saveDataType',
            'click .add-metadata-group': 'addMetadataGroupOnClick',  // not used yet
            'click button.delete': 'deleteDataType',
            'change select#project': 'getProjectParents'
        },

        tagName: 'div',
        className: 'dataType',

        initialize: function(options) {
            // _.bindAll(this, 'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-edit.ejs"];
            this.nestedViews = [];
            this.idDataType = parseInt(options.params.id);
            this.existingDataTypes = options.dataTypes;
            this.projects = options.projects;
            this.isCreation = true;
            if (this.idDataType) {
                var that =this;
                this.model = new DataType.Model(_.find(this.existingDataTypes, function(dt){ return dt.id === that.idDataType; }));
            }
            else {
                this.model = new DataType.Model();
            }
            this.render();
            this.listenTo(this.model, 'invalid', this.handleValidationErrors);
        },

        bindings: {
            '#name': {
                observe: 'name'
            },
            '#model': {
                observe: 'model',
                selectOptions: {
                    collection: function() {
                        var coll = [];
                        _.each(DataTypeClasses, function(value){
                            coll.push({label: value.toUpperCase(), value: value});
                        });
                        return coll;
                    }
                }
            },
            '#project': {
                observe: 'project',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select") });
                },
                selectOptions: {
                    collection: 'this.projects',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                },
                onGet: function(val) {
                    return val && val.id;
                }
            },
            '#parents': {
                observe: 'parents',
                initialize: function($el) {
                    $el.select2({placeholder: i18n("please-select") });
                },
                selectOptions: {
                    collection: 'this.existingDataTypes',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                },
                getVal: function($el, ev, options) {
                    return $el.val() && $el.val().map(function(value) {
                        return _.findWhere(options.view.existingDataTypes, {id: parseInt(value)});
                    });
                },
                onGet: function(vals, options) {
                    return (vals && vals.map(function(val) {return val.id; }));
                }
            }
        },

        getProjectParents: function (ev) {
            var selProject = ev ? _.parseInt(ev.target.value) : _.parseInt($('#project').val());
            var filteredValues  = [], newColl = [];

            this.existingDataTypes.forEach(function (dt) {
                if (dt.project.id === selProject){
                    newColl.push({label:dt.name,value:dt.id});
                }
            });
            newColl.forEach(function (dt) {
                _.find($('#parents').val(),function (val) {
                    if(dt.value === _.parseInt(val)){
                        filteredValues.push(val);
                    }
                });
            });
            var options = {selectOptions:{collection:newColl}};
            Backbone.Stickit.getConfiguration($('#parents')).update($('#parents'),filteredValues,{},options);
            $('#parents').val(filteredValues).trigger("change");
        },

        render: function() {

            this.$el.html(this.template({__: i18n, dataType: this.model}));
            this.$form = this.$("form");
            this.$form.parsley(parsleyOpts);
            this.$modal = this.$(".datatype-modal");
            this.stickit();
            if (this.idDataType) {
                this.getProjectParents();
                $('#project').prop('disabled', true);
                this.isCreation = false;
            }
            if (this.model.get("schema") && _.isArray(this.model.get('schema').body)) {
                var body = this.model.get('schema').body;
                for (var i=0, len=body.length; i<len; i++) {
                    this.add(body[i]);
                }
            }
            return this;
        },

        /**
         * @description show a list of the validation errors. So far it just alert the first error
         */
        handleValidationErrors: function() {
            alert(this.model.validationError[0].message);
        },


        serialize: function() {
            var metadataBody = [];
            for (var i=0, len=this.nestedViews.length; i<len; i++) {
                metadataBody.push(this.nestedViews[i].serialize());
            }
            return metadataBody;
        },


        saveDataType: function(ev) {
            ev.preventDefault();
            var id = $('#id').val();
            var header = this.$("#schemaHeader").find("select, input, textarea").serializeObject();
            header.fileUpload = header.fileUpload ? true : false;
            header.project = this.model.get("project").id;

            var that = this;
            var body = this.serialize();
            var dataTypeDetails = {
                id: id,
                name: header.name,
                schema: {
                    header: _.omit(header, ['parents']), // parent-child many-to-many associations are not currently saved in the JSON schema
                    body: body
                }
            };

            this.model.set("project", this.model.get("project").id);
            this.model.set("parents", _.map(this.model.get("parents"),'id'));

            this.model.save(dataTypeDetails, {
                //  patch: true,
                success: function(dataType) {
                    if (that.modal) {
                        that.modal.hide();
                    }
                    var modal = new ModalDialog({
                        title: i18n('ok'),
                        body: i18n('datatype-correctly-stored-on-server')
                    });
                    that.$modal.append(modal.render().el);
                    $('.modal-header').addClass('alert-success');
                    modal.show();

                    setTimeout(function(){ modal.hide(); }, 1200);
                    that.$('.datatype-modal').on('hidden.bs.modal', function (e) {
                        modal.remove();
                        if (xtens.session.get("isWheel") || !this.isCreation) {
                            router.navigate('datatypes', {trigger: true});
                        }else {
                            router.navigate('datatypeprivileges/new/0?dataTypeId=' + dataType.get("id"), {trigger: true});
                        }
                    });

                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
            return false;
        },

        deleteDataType: function(ev) {
            ev.preventDefault();
            var that = this;
            if (this.modal) {
                this.modal.hide();
            }

            var modal = new ModalDialog({
                template: JST["views/templates/confirm-dialog-bootstrap.ejs"],
                title: i18n('confirm-deletion'),
                body: i18n('datatype-will-be-permanently-deleted-are-you-sure')
            });

            this.$modal.append(modal.render().el);
            modal.show();

            this.$('#confirm-delete').click( function (e) {
                modal.hide();

                that.model.destroy({
                    success: function(model, res) {
                        that.$modal.one('hidden.bs.modal', function (e) {
                            modal.template= JST["views/templates/dialog-bootstrap.ejs"];
                            modal.title= i18n('ok');
                            modal.body= i18n('datatype-deleted');
                            that.$modal.append(modal.render().el);
                            $('.modal-header').addClass('alert-success');
                            modal.show();
                            setTimeout(function(){ modal.hide(); }, 1200);
                            that.$modal.on('hidden.bs.modal', function (e) {
                                modal.remove();
                                xtens.router.navigate('datatypes', {trigger: true});
                            });
                        });
                    },
                    error: function(model, res) {
                        xtens.error(res);
                    }
                });
                return false;
            });

        },

        addMetadataGroupOnClick: function(ev) {
            this.add({label: Constants.METADATA_GROUP});
            ev.stopPropagation();
        },

        add: function(group) {
            var model = new MetadataGroup.Model();
            model.set(group);
            var view = new MetadataGroup.Views.Edit({model: model});
            this.$("#schemaBody").append(view.render().el);
            this.listenTo(view, 'closeMe', this.removeChild);
            this.nestedViews.push(view);
        }

    });

    /**
     *  This is the view to show in a table the full list of existing datatypes
     */
    DataType.Views.List = Backbone.View.extend({
        events: {
            'change #projectSelector':'filterDataTypes'
        },
        tagName: 'div',
        className: 'dataTypes',

        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-list.ejs"];
            this.render(options);
        },

        render: function(options) {

            this.$el.html(this.template({__: i18n, dataTypes: options.dataTypes, projects:options.projects}));

            $('.selectpicker').selectpicker();
            if (options.paramProject) {
                $('.selectpicker').selectpicker('val', options.paramProject.name);
            }
            $('.selectpicker').selectpicker('refresh');
            this.filterDataTypes();

            return this;
        },

        filterDataTypes: function(){

            var rex = new RegExp($('#projectSelector').val());

            if(rex =="/all/"){this.clearFilter();}else{
                $('.content').hide();
                $('.content').filter(function() {
                    return rex.test($(this).text());
                }).show();
            }
        },

        clearFilter: function(){
            $('.projectSelector').val('');
            $('.content').show();
        }
    });

    DataType.Views.Graph = Backbone.View.extend({

        tagName:'div',
        className:'dataTypes',

        events: {
            'click #graph':'createGraph'
        },

        initialize: function() {

            $('#main').html(this.el);
            this.template = JST["views/templates/datatype-graph.ejs"];
            this.render();
        },

        render : function () {

            var that = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({

                success : function(dataTypes) {
                    that.$el.html(that.template({ __: i18n, dataTypes : dataTypes.models}));
                },
                error: function() {
                    that.$el.html(that.template({ __: i18n}));
                }
            });
            return this;
        },

        createGraph: function() {
            var selectedDatatype = document.getElementById('select1').value.split('-@#@-');
            var idDatatype = selectedDatatype[0];
            var nameDatatype = selectedDatatype[1];
            // retrieve all the descendant samples and data for the given datatype

            $.ajax({
                type: 'POST',
                url: '/graph',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: {idDataType: idDatatype},

                success: function (res, textStatus, jqXHR) {
                    //Get parentWidth
                    var parentWidth=d3.select('#main');
                    // clean the previous graph if present
                    d3.select("#data-type-graph")
                    .remove();
                    var graph = jqXHR.responseJSON;

                    var links = graph.links;

                    var maxDepth;
                    function findMaxDepth(arr){
                        var temp = 0;
                        for(var i = 0, len = arr.length; i < len; i++) {
                            if(arr[i].depth > temp){
                                temp = arr[i].depth;
                            }
                        }
                        return temp+0.5;
                    }
                    maxDepth=findMaxDepth(links);
                    // set margins, dynamic width and height of the svg container
                    var margin = {top: 40, right: 120, bottom: 40, left: 120},
                        width = parentWidth[0][0].offsetWidth - margin.left - margin.right,
                        height = (180*maxDepth) - margin.top - margin.bottom;

                    // generate a data hierarchy tree
                    var tree = d3.layout.tree()
                    .size([height, width]);

                    //function to draw the slanted arcs
                    var diagonal = d3.svg.diagonal()
                    .projection(function(d) {
                        return [d.x, d.y-39];
                    }
                               );

                               // create the svg container
                    var svg = d3.select("#main").append("svg")
                               .attr("id","data-type-graph")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.top + margin.bottom)
                               .attr("overflow-y","auto")
                               .append("g")
                               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



                    var nodesByName = {};

                    console.log(links);

                               // Create nodes for each unique source and target.
                    links.forEach(function(link) {
                        var parent,child;
                        if (link.target !== null){
                            parent = link.source = nodeByName(link.source.toUpperCase() +' '+ link.source_template.toLowerCase() );
                            child = link.target = nodeByName(link.target.toUpperCase()+' '+link.target_template.toLowerCase());
                        }
                        else{
                            parent = link.source = nodeByName(link.source.toUpperCase() +' '+ link.source_template.toLowerCase() );
                            child = link.target = nodeByName(link.target);
                        }
                        if (parent.children) parent.children.push(child);
                        else parent.children = [child];



                    }
                                            );
                                            //Define countDepth to count nodes for every depth
                    var index,i1;
                    var countDepth = new Array(links.length);


                                            // find the root node
                    for(var i=0;i<links.length;i++){
                        if(links[i].source.name === nameDatatype ){
                            index = i;
                        }
                        i1=links[i].depth;
                        countDepth[i]=0;
                    }

                                            //generate the tree
                    var nodes = tree.nodes(links[0].source);
                    nodes =_.uniq(nodes,'name');
                    console.log(nodes);


                                            //Count nodes/depth
                    nodes.forEach(function(d){
                        countDepth[d.depth] = countDepth[d.depth] + 1;
                    });

                    var c= new Array(links.length);
                                            // for each node define its position dynamically
                    nodes.forEach(function(d){

                        d.y= d.depth*150;
                        if (d.depth === 0){d.x = width / 2;}
                        if ( !isNaN(countDepth[d.depth]) && countDepth[d.depth] !== 1 ) {
                            if( isNaN(c[d.depth]) ){ c[d.depth]=0; }
                            c[d.depth] = c[d.depth] + 1 ;
                            d.x= (( c[d.depth] / countDepth[d.depth] ) * width - ( 1 / countDepth[d.depth ]) * width / 2 );
                        }



                                                          // if(d.x>1000 && d.x<100000){
                                                          //     d.x=d.x/80 -100;
                                                          // }
                                                          // else if(d.x>=100000 && d.x<1000000000){
                                                          //     d.x=d.x/200000 - 120;
                                                          // }
                                                          // else if(d.x >=1000000000){
                                                          //     d.x=d.x/200000000000 -40;
                                                          // }
                                                          // else if(d.x>500 && d.x <1000){
                                                          //     d.x=(d.x/1.5)*3 -750;
                                                          // }
                    });

                                            // define the links format/appereance
                    svg.append("svg:defs").selectAll("marker")
                                            .data(links)
                                            .enter().append("svg:marker")
                                            .attr("id","arrowhead")
                                            .attr("viewBox", "0 -5 10 10")
                                            .attr("refX",10)
                                            .attr("refY",1.5)
                                            .attr("markerWidth", 5)
                                            .attr("markerHeight", 5)
                                            .attr("orient","auto")
                                            .attr("stroke","grey")
                                            .attr("stroke-width",10)
                                            .append("path")
                                            .attr("d","M0,0L100,100,200,200");

                                            //draw the links
                    svg.selectAll(".link")
                                            .data(links.filter(function(d){return d.target.name;}))
                                            .enter().append("path")
                                            .attr("class", "link")
                                            .attr("marker-end","url(#arrowhead)")
                                            .attr("d",diagonal);

                                            // draw the nodes
                    svg.selectAll(".node")
                                            .data(nodes.filter(function(d){return d.name;}))
                                            .enter().append("ellipse")
                                            .attr("id",function(d){
                                                var arr = d.name.split(" ");
                                                return arr[arr.length-1];
                                            })
                                            .attr("class", "node")
                                            .attr("rx",54)
                                            .attr("ry",39)
                                            .attr("cx", function(d) { return d.x; })
                                            .attr("cy", function(d) { return d.y; });

                                            //append the title on the nodes
                    svg.append("g").selectAll("text")
                                            .data(nodes)
                                            .enter().append("text")
                                            .each(function (d) {
                                                if(d.name !== null){
                                                    var arr = d.name.split(" ");
                                                    if (arr !== undefined) {
                                                        for (var i = 0; i < arr.length; i++) {
                                                            d3.select(this).append("tspan")
                                                            .text(arr[i])
                                                            .attr("y", function(d){
                                                                if(i === arr.length -123942){
                                                                    return d.y -6*(arr.length-1) +(12)*i+6;

                                                                }
                                                                return d.y -6*(arr.length-1) +(12)*i+3;})
                                                                .attr("x", function(d){
                                                                    return d.x;
                                                                })
                                                                .attr("id",function(d){
                                                                    if( i=== arr.length-1){
                                                                        return arr[i];
                                                                    }
                                                                })
                                                                .style("font-size","12px")
                                                                .style("font-weight",function(){

                                                                    if(i!== arr.length-1){
                                                                        return "bold";
                                                                    }
                                                                })
                                                                .attr("text-anchor","middle")
                                                                .attr("class", "tspan"+i);
                                                        }
                                                    }
                                                }
                                            });


                    function nodeByName(name) {
                        return nodesByName[name] || (nodesByName[name] = {name: name});
                    }


                }, /* success */

                error: function(jqXHR, textStatus, err) {
                    alert(err);
                }
            });
            /*
                   .fail(function(res){
                   alert("Error: " + res.responseJSON.error);
                   }); */

        }
    });

} (xtens, xtens.module("datatype")));
