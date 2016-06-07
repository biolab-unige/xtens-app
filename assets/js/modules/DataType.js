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

        urlRoot: '/dataType',

        defaults: {
            model: DataTypeClasses.DATA
        },

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
            _.each(_.pluck(flattened, 'name'), function(fieldName) {
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

        tagName: 'div',
        className: 'dataType',

        initialize: function(options) {
            // _.bindAll(this, 'fetchSuccess');
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-edit.ejs"];
            this.nestedViews = [];
            this.existingDataTypes = options.dataTypes;
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
                    return $el.val().map(function(value) {
                        return _.findWhere(options.view.existingDataTypes, {id: parseInt(value)});
                        // return _.parseInt(value);
                    });
                },
                onGet: function(vals, options) {
                    return (vals && vals.map(function(val) {return val.id; }));
                }
            }
        },

        render: function() {
            if (this.model.id){
                this.$el.html(this.template({__: i18n, dataType: this.model}));
            }
            else {
                this.$el.html(this.template({__: i18n, dataType: null}));
            }
            this.stickit();
            this.$form = this.$("form");
            this.$form.parsley(parsleyOpts);
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

        events: {
            'submit .edit-datatype-form': 'saveDataType',
            'click .add-metadata-group': 'addMetadataGroupOnClick'    // not used yet
        },

        serialize: function() {
            var metadataBody = [];
            for (var i=0, len=this.nestedViews.length; i<len; i++) {
                metadataBody.push(this.nestedViews[i].serialize());
            }
            return metadataBody;
        },


        saveDataType: function(ev) {
            var id = $('#id').val();
            var header = this.$("#schemaHeader").find("select, input, textarea").serializeObject();
            header.fileUpload = header.fileUpload ? true : false;
            var body = this.serialize();
            var dataTypeDetails = {
                id: id,
                name: header.name,
                schema: {
                    header: _.omit(header, ['parents']), // parent-child many-to-many associations are not currently saved in the JSON schema
                    body: body
                }
            };

            this.model.set("parents", _.pluck(this.model.get("parents"),'id'));

            this.model.save(dataTypeDetails, {
                //  patch: true,
                success: function(dataType) {
                    console.log(dataType);
                    router.navigate('datatypes', {trigger: true});
                },
                error: xtens.error
            });
            return false;
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
        tagName: 'div',
        className: 'dataTypes',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/datatype-list.ejs"];
            this.render();
        },

        render: function(options) {
            var that = this;
            var dataTypes = new DataType.List();
            dataTypes.fetch({
                success: function(dataTypes) {
                    that.$el.html(that.template({__: i18n, dataTypes: dataTypes.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
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
            var nameDatatype = document.getElementById('select1').value;

            // retrieve all the descendant samples and data for the given datatype

            $.ajax({
                type: 'POST',
                url: '/graph',
                headers: {
                    'Authorization': 'Bearer ' + xtens.session.get("accessToken")
                },
                data: {idDataType: nameDatatype},

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
