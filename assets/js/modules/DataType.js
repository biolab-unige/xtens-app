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
     *  define a DataType model
     */
    DataType.Model = Backbone.Model.extend({

        urlRoot: '/dataType',

        defaults: {
            classTemplate: DataTypeClasses.GENERIC
        },

        /**
         * @description flattens the metadata schema returning a 1D array containing all the metadata fields
         * @param {boolean} skipFieldsWithinLoops - if true skips all the metadatafields that are contained within metadata loops
         */
        getFlattenedFields: function(skipFieldsWithinLoops) {
            var flattened = [];
            var body = this.get("schema") && this.get("schema").body;
            if (!body) return flattened;
            for (var i=0, len=body.length; i<len; i++){
                var groupContent = body[i] && body[i].content;
                for (var j=0, l=groupContent.length; j<l; j++) {
                    if (groupContent[j].label === Constants.METADATA_FIELD) {
                        flattened.push(groupContent[j]);
                    }
                    else if (groupContent[j].label === Constants.METADATA_LOOP && !skipFieldsWithinLoops) {
                        var loopContent = groupContent[j] && groupContent[j].content;
                        for (var k=0; k<loopContent.length; k++) {
                            if (loopContent[k].label === Constants.METADATA_FIELD) {
                                flattened.push(loopContent[k]);
                            }
                        }
                    }

                }
            }
            return flattened;
        },

        /**
         * @description returns true if the DataType contains at least a loop
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
         * @description customized client-side validation for DataType Model
         */
        validate: function(attrs, opts) {
            var errors = [];

            if (!attrs.schema.body || !attrs.schema.body.length) {
                errors.push({name:'groups', message: i18n("please-add-at-least-a-metadata-group")});
                return errors;
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
            '#schemaName': {
                observe: 'name'
            },
            '#classTemplate': {
                observe: 'classTemplate',
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
        /*
render: function(options) {
if (options.id) {
this.model = new DataType.Model({id: options.id});
this.model.fetch({
success: this.fetchSuccess,
error: xtens.error
});
} else {
this.$el.html(this.template({__: i18n, dataType: null}));
this.stickit();
}
this.$form = this.$("form");
        // initialize Parsley
        this.$form.parsley(parsleyOpts);
        return this;
        },

        // TODO requires refactoring - move it to the router (?)
fetchSuccess: function(dataType) {
this.$el.html(this.template({__: i18n, dataType: dataType}));
this.stickit();
var body = dataType.get('schema').body;
for (var i=0, len=body.length; i<len; i++) {
this.add(body[i]);
}
this.setValidate(); //TODO
}, */

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
            var dataTypeDetails = { id: id, name: header.schemaName, schema: {header: header, body: body} };
            //var dataType = new DataType.Model();
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
            var idDatatype = document.getElementById('select1').value;

            $.post( '/graph',
                   {idDataType: idDatatype},
                   function (err,res,body) {
                       var graph = body.responseJSON;

                       var links = graph.links;
                       var nodes = {};
                       var force;
                       var width = 960,
                       height = 500;

                       var position = width/2;
                       var depth1;

                       links.forEach(function(link) {

                           link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,template:link.source_template,x:width/2,y:40,fixed:true});

                           if(depth1 === link.depth){
                               position = position+160;
                           }
                           else{
                               position = link.source.x;
                           }

                           link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,template:link.target_template,x:position, y:link.depth*100,fixed:true});

                           depth1 = link.depth;

                       });


                       force = d3.layout.force()
                       .nodes(d3.values(nodes).filter(function(d){ return d.name;}))
                       .links(links)
                       .size([width, height])
                       .linkDistance(120)
                       .charge(-300)
                       .on("tick", tick)
                       .start();

                       var svg = d3.select("#main").append("svg")
                       .attr("width", width)
                       .attr("height", height);

                       svg.append("defs").selectAll("marker")
                       .data(["suit"])
                       .enter().append("marker")
                       .attr("id", function(d) { return d; })
                       .attr("viewBox", "0 -5 10 10")
                       .attr("refX", 15)
                       .attr("refY", -1.5)
                       .attr("markerWidth", 6)
                       .attr("markerHeight",6)
                       .attr("orient", "auto")
                       .append("path")
                       .attr("d", "M0,-5L10,0L0,5");

                       var path = svg.append("g").selectAll("path")
                       .data(force.links())
                       .enter().append("path")
                       .attr("class","link")
                       .attr("marker-end","url(#suit)");

                       var ellipse = svg.append("g").selectAll("ellipse")
                       .data(force.nodes())
                       .enter().append("ellipse")
                       .attr("rx", 70)
                       .attr("ry",20)
                       .call(force.drag);

                       var text1 = svg.append("g").selectAll("text")
                       .data(force.nodes())
                       .enter().append("text")
                       .attr("x", -30)
                       .attr("y", -5)
                       .text(function(d) { return d.name;});

                       var text2 =svg.append("g").selectAll("text").data(force.nodes()).enter().append("text")
                       .attr("x",-30)
                       .attr("y",10)
                       .text(function(d){return d.template;});

                       function tick() {
                           path.attr("d", linkArc);
                           ellipse.attr("transform",transform);
                           text1.attr("transform", transform);
                           text2.attr("transform",transform);
                       }

                       function linkArc(d) {
                           if(d.target.x && d.target.y){
                               var dx = d.target.x - d.source.x,
                               dy = d.target.y - d.source.y,
                               dr = Math.sqrt(dx * dx + dy * dy);
                               return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                           }
                           else {
                               return null;
                           }
                       }

                       function transform(d) {
                           return "translate(" + d.x + "," + d.y + ")";
                       }
                   }
                  ).fail(function(res){
                      alert("Error: " + res.responseJSON.error);
                  });

        }
    });

} (xtens, xtens.module("datatype")));

