/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Subjects
 */

(function(xtens, Subject) {

    // TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway
    var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames;

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var DataTypeModel = xtens.module("datatype").Model;
    var PersonalDetails = xtens.module("personaldetails");
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var sexOptions = xtens.module("xtensconstants").SexOptions;

    var MISSING_VALUE_ALERT = true;
    /*
       function initializeProjectsField($el, model, option) {
       var data =
       }*/

    Subject.Model = Data.Model.fullExtend({
        urlRoot: '/subject',

        defaults: {
            sex: sexOptions.UNKNOWN,
            projects: []
        }
    });

    Subject.List = Backbone.Collection.extend({
        model: Subject.Model,
        url: '/subject'
    });

    Subject.Views.Edit = Data.Views.Edit.fullExtend({

        bindings: {

            '#projects': {
                observe: 'projects',
                initialize: function($el, model, option) {
                    $el.select2({ placeholder: i18n("please-select") });
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
                getVal: function($el, ev, options) {
                    return $el.val().map(function(value) {
                        // return _.findWhere(options.view.projects, {id: parseInt(value)});
                        return _.parseInt(value);
                    });
                },
                onGet: function(vals, options) {
                    return (vals && vals.map(function(val){return val.id; }));
                }
            },

            '#code': {
                observe: 'code'
            },

            '#sex': {
                observe: 'sex',
                initialize: function($el) {
                    var data = [];
                    _.each(sexOptions, function(sexOption) {
                        data.push({id: sexOption, text: sexOption});
                    });
                    $el.select2({
                        placeholder: i18n("please-select"),
                        data: data
                    });
                }
            },

            '#tags': {
                observe: 'tags',
                getVal: function($el, ev, option) {
                    return $el.val().split(",");
                }

            },

            '#notes': {
                observe: 'notes'
            }

        },

        initialize: function(options) {
            // _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.dataTypes = options.dataTypes;
            this.template = JST["views/templates/subject-edit.ejs"];
            this.personalDetailsView = null;
            this.schemaView = null;
            this.projects = options.projects;
            if (options.subject) {
                this.model = new Subject.Model(options.subject);
            }
            else {
                this.model = new Subject.Model({type: _.last(this.dataTypes).id});
            }
            this.render();
            if (xtens.session.get('canAccessPersonalData')) {
                this.addPersonalDetailsView();
            }
        },

        events: {
            "click #save": "saveData"
            // "click #add-personal-details": "addPersonalDetailsView"
        },

        /**
         * @method
         * @name saveData
         * @description retrieve all the Subject properties from the form (the metadata value(s)-unit(s) pairs, the files' paths, etc...)
         *              and save the Subject model on the server
         * @param {event} - the form submission event
         * @return {false} - to suppress the HTML form submission
         * @override
         */
        saveData: function() {
            var metadata = this.schemaView && this.schemaView.serialize(useFormattedNames);
            this.model.set("metadata", metadata);
            // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
            if (this.personalDetailsView && this.personalDetailsView.model) {
                this.model.set("personalInfo", _.clone(this.personalDetailsView.model.attributes));
            }
            this.model.save(null, {
                success: function(subject) {
                    xtens.router.navigate('subjects', {trigger: true});
                },
                error: function(model, res) {
                    xtens.error(res);
                }
            });
            return false;
        },

        addPersonalDetailsView: function() {
            var model = new PersonalDetails.Model(this.model.get("personalInfo"));
            this.personalDetailsView = new PersonalDetails.Views.Edit({model: model});
            // var $parent = $(ev.currentTarget).parent();
            this.$('#personal-details').empty();
            this.$('#personal-details').html(this.personalDetailsView.render().el);
        }

    });

    /**
     * @class
     * @name Subject.Views.Details
     * @extends Data.Views.Details
     * @description view containing the details (metadata and files) of a Subject (Subject.Model) instance
     */
    Subject.Views.Details = Data.Views.Details.fullExtend({

        /**
         * @method
         * @name initialize
         */
        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/subject-details.ejs"];
            this.render();
            if (xtens.session.get('canAccessPersonalData')) {
                this.addPersonalDetailsParam();
            }
        },
        render: function() {
            var dataType = new DataTypeModel(this.model.get("type"));
            var fields = dataType.getFlattenedFields();

            this.$el.html(this.template({
                __: i18n,
                data: this.model,
                fields: fields
            }));

            if (MISSING_VALUE_ALERT) {
                this.$('div[name="metadata-value"]').filter(function() {
                    return $(this).text().trim() === '';
                }).addClass("text-warning").html(i18n("missing-value"));
            }
        },
        addPersonalDetailsParam: function() {
            var model = new PersonalDetails.Model(this.model.get("personalInfo"));
            this.personalDetailsView = new PersonalDetails.Views.Details({model: model});
            this.$('#personal-details').empty();
            this.$('#personal-details').html(this.personalDetailsView.render().el);

        }

    });


    Subject.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'subject',

        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.subjects = options.subjects;
            this.dataTypePrivileges = options.dataTypePrivileges.models;
            this.template = JST["views/templates/subject-list.ejs"];
            this.addLinksToModels();
            this.render();
        },

        addLinksToModels: function() {
            _.each(this.subjects.models, function(subject) {
                var privilege = _.find(this.dataTypePrivileges, function(model){ return model.get('dataType') === subject.get("type").id;});
                if(privilege.get('privilegeLevel') === "edit" ){
                    subject.set("editLink", "#/subject/edit/" + subject.id);}
                var type = this.dataTypes.get(subject.get("type").id);
                if (type.get("children") && type.get("children").length > 0) {
                    var sampleTypeChildren = _.where(type.get("children"), {"model": Classes.SAMPLE});
                    if (sampleTypeChildren.length) {
                        var sids = _.pluck(sampleTypeChildren, 'id').join();
                        subject.set("newSampleLink", "#/samples/new/0?idDataTypes="+sids+"&donor=" + subject.id);
                    }
                    var dataTypeChildren = _.where(type.get("children"), {"model": Classes.DATA});
                    if (dataTypeChildren.length) {
                        subject.set("newDataLink", "#/data/new/0?parentSubject=" + subject.id);
                    }
                }
            }, this);
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n, subjects: this.subjects.models, dataTypePrivileges: this.dataTypePrivileges}));
            this.table = this.$('.table').DataTable();
            if(options && options.pageActive){
                this.table.page( options.pageActive.page ).draw('page');
            }
            return this;
        },

        loadResults: function (ev) {
            ev.preventDefault();
            var that = this;
            that.subjects.fetch({
                data: $.param({ populate: ['children','type'],
                limit: 30,
                skip: that.subjects.length
              }),
                remove: false,
                success: function (results) {
                    that.addLinksToModels();
                    var pageActive= that.table.page.info();
                    that.render({pageActive:pageActive});
                }
            });
        },

        events: {
            'click #moreData':'loadResults'
        }
    });

    Subject.Views.Graph = Backbone.View.extend({

        tagName: 'div',
        className: 'subject',

        events: {

            'click #graph': 'createGraph'
        },

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/subject-graph.ejs"];
            this.render();
        },

        render: function(options) {
            var that = this;
            that.$el.html(that.template({__: i18n}));
            return this;
        },

        createGraph : function () {
            var patient = document.getElementById('select').value;

            // retrieve all the descendant samples and data for the given patient
            $.post('/subjectGraph',{
                idPatient:patient
            },function(err,res,body){

                // clean the previous graph if present
                d3.select("#subject-graph").remove();

                // set margins, width and height of the svg container
                var margin = {top: 40, right: 120, bottom: 40, left: 120},
                    width = 1000 - margin.left - margin.right,
                    height = 800 - margin.top - margin.bottom;

                var color = d3.scale.category20();

                // show tooltip with metadata details
                // TODO:CHANGE MODIFY THIS PART TO MODULARIZE IT!!
                var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    if(d.metadata!==undefined){
                        var dato = (JSON.stringify(d.metadata)).replace(/,/g,"<br />");
                        return d.name+"<br />" +dato;
                    }
                    else
                        return 'Patient'+" " +patient;
                });

                // generate a data hierarchy tree
                var tree = d3.layout.tree()
                .size([width, height])
                // decrease the separation among nodes dividing the distance by a factor 2 for each level
                .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

                //function to draw the slanted arcs
                var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x*1.3-120, d.y/2];
                });

                // x and y required by d3.tip() function
                var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.1);

                var y = d3.scale.linear()
                .range([height, 0]);

                // create the svg container
                var svg = d3.select("#main").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", "subject-graph")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // execute the tip method
                svg.call(tip);

                var graph = body.responseJSON;

                var links = graph.links;
                var nodesByName = {};

                // Create nodes for each unique source and target.
                links.forEach(function(link) {
                    var parent = link.source = nodeByName(link.source),
                        child = link.target = nodeByName(link.target);
                    if (parent.children) parent.children.push(child);
                    else parent.children = [child];
                });

                var index;

                // find the root node (Patient)
                for(var i=0;i<links.length;i++){
                    if(links[i].source.name === 'Patient'){
                        index = i;
                    }
                }

                //generate the tree
                var nodes = tree.nodes(links[index].source);

                //add to each node its type and the metadata
                nodes.forEach(function(node){
                    for(var i=0;i<links.length;i++){
                        if(node.name===links[i].target.name){
                            node.type = links[i].type;
                            node.metadata = links[i].metadata;
                        }
                    }
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

                // draw the links
                svg.selectAll(".link")
                .data(links.filter(function(d){ return d.target.name;}))
                .enter().append("path")
                .attr("class", "link")
                .attr("marker-end","url(#arrowhead)")
                .attr("d",diagonal);

                // draw the nodes
                svg.selectAll(".node")
                .data(nodes.filter(function(d){ return d.name;}))
                .enter().append("circle")
                .attr("class", "node")
                .attr("r",function(d){
                    if (d.metadata === undefined){
                        return 10; // for the subject use double node size
                    }
                    else{
                        return 5;
                    }
                })
                // set the x coordinate of the node centre
                .attr("cx", function(d) {
                    return d.x*1.3-120;
                })
                // set the y
                .attr("cy", function(d) {
                    return d.y/2;
                })
                // set the color
                .style("fill", function(d) {
                    if(d.type){
                        return color(d.type);
                    }
                    else{
                        return "blue"; // if subject colour it with blue
                    }
                })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

                // add the colour legend
                var legend = svg.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(80," + i * 20 + ")"; });

                legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

                legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });


                function nodeByName(name) {
                    return nodesByName[name] || (nodesByName[name] = {name: name});
                }
            })

            .fail(function(res){
                alert("Error: " + res.responseJSON.error);
            });

        }


    });

} (xtens, xtens.module("subject")));
