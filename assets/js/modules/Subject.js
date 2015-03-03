/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Subjects 
 */

(function(xtens, Subject) {

    var i18n = xtens.module("i18n").en;
    var Data = xtens.module("data");
    var PersonalDetails = xtens.module("personaldetails");
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var sexOptions = xtens.module("xtensconstants").SexOptions;

    /*
       function initializeProjectsField($el, model, option) {
       var data =
       }*/

    Subject.Model = Data.Model.fullExtend({
        urlRoot: '/subject',

        defaults: {
            defaults: {
                sex: sexOptions.UNKNOWN
            },
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
        },
        
        events: {
            "click #save": "saveData",
            "click #add-personal-details": "addPersonalDetailsView"
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
            var metadata = this.schemaView && this.schemaView.serialize();
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

        addPersonalDetailsView: function(ev) {
            var model = new PersonalDetails.Model(this.model.get("personalInfo"));
            this.personalDetailsView = new PersonalDetails.Views.Edit({model: model});
            var $parent = $(ev.currentTarget).parent();
            $parent.empty();
            $parent.html(this.personalDetailsView.render().el);
        }

    });

    Subject.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'subject',

        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.subjects = options.subjects;
            this.template = JST["views/templates/subject-list.ejs"];
            this.addLinksToModels();
            this.render();
        },

        addLinksToModels: function() {
            _.each(this.subjects.models, function(subject) {
                var type = this.dataTypes.get(subject.get("type").id);
                subject.set("editLink", "#/subjects/edit/" + subject.id);
                if (type.get("children") && type.get("children").length > 0) {
                    var sampleTypeChildren = _.where(type.get("children"), {"classTemplate": Classes.SAMPLE});
                    if (sampleTypeChildren.length) {
                        var sids = _.pluck(sampleTypeChildren, 'id').join();
                        subject.set("newSampleLink", "#/samples/new/0?idDataTypes="+sids+"&donor=" + subject.id);
                    }
                    var dataTypeChildren = _.where(type.get("children"), {"classTemplate": Classes.GENERIC});
                    if (dataTypeChildren.length) {
                        subject.set("newDataLink", "#/data/new/0?parentSubject=" + subject.id);
                    }
                }
            }, this);
        },

        render: function() {
            this.$el.html(this.template({__: i18n, subjects: this.subjects.models}));
            return this;
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
            var subjects = new Subject.List();
            subjects.fetch({
                success: function(subjects) {
                    that.$el.html(that.template({__: i18n, subjects: subjects.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        },

        createGraph : function () {
        var patient = document.getElementById('select').value;

        $.post('/subjectGraph',{
idPatient:patient
},function(err,res,body){


var margin = {top: 40, right: 120, bottom: 40, left: 120},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

var tree = d3.layout.tree()
.size([width, height]);

var diagonal = d3.svg.diagonal()
.projection(function(d) { 
      return [d.x, d.y];
    }
    );

var svg = d3.select("#main").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

for(var i=0;i<links.length;i++){
    if(links[i].source.name === 'Patient'){
        index = i;
    }
}
var nodes = tree.nodes(links[index].source);

console.log(links);

    svg.selectAll(".link")
.data(links.filter(function(d){return d.target.name;}))
    .enter().append("path")
    .attr("class", "link")
    .attr("d",diagonal);

    svg.selectAll(".node")
    .data(nodes.filter(function(d){return d.name;}))
    .enter().append("ellipse")
    .attr("class", "node")
    .attr("rx",70)
    .attr("ry",20)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

     svg.append("g").selectAll("text")
    .data(nodes)
    .enter().append("text")
    .each(function (d) {
        if (d.name === 'Patient')
            {
            d.name = d.name+' #'+patient;
            }
        var arr = d.name.split(" ");
        if (arr !== undefined) {
            for (var i = 0; i < arr.length; i++) {
                d3.select(this).append("tspan")
                    .text(arr[i])
                    .attr("dy", function(d){return d.y -(d.y -15)*i;})
                    .attr("x", function(d){return d.x-25;} )
                    .attr("class", "tspan0");
            }
        }
    });
    /*
    .attr("dx", function(d){return d.x -20;})
    .attr("dy", function(d){return d.y +5 ;})
    .html(function(d) { 
        if(d.name === 'Patient'){
        return d.name+'<br>'+' #'+patient;
        }
        else
        return d.name;
        }
     );*/

    function nodeByName(name) {
        return nodesByName[name] || (nodesByName[name] = {name: name});
    }
}

).fail(function(res){
    alert("Error: " + res.responseJSON.error);
    });

        
        
        }

    
    });

} (xtens, xtens.module("subject")));
