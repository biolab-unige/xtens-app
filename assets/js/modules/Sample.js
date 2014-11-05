/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Samples
 */
(function(xtens, Sample) {

    var i18n = xtens.module("i18n").en;
    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");
    var Classes = xtens.module("xtensconstants").DataTypeClasses;

    Sample.Model = Backbone.Model.extend({
        urlRoot: '/sample'
    });

    Sample.List = Backbone.Collection.extend({
        model: Sample.Model,
        url: '/sample'
    });

    Sample.Views.Edit = Data.Views.Edit.fullExtend({

        bindings: {

            '#biobank-code': {
                observe: 'biobankCode'
            },

            '#type': {
                observe: 'type',

                selectOptions: {
                    collection: 'this.dataTypes',
                    labelPath: 'name',
                    valuePath: 'id',
                    defaultOption: {
                        label: "",
                        value: null
                    }
                },
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                getVal: function($el, ev, options) {
                    var value = parseInt($el.val());
                    return _.findWhere(options.view.dataTypes, {id: value });
                },
                onGet: function(val, options) {
                    return (val && val.id);
                }
            },

            '#donor': {
                observe: 'donor',

                selectOptions: {
                    collection: function() {
                        return this.subjects.map(function(subj) { 
                            return { 
                                label: subj.personalInfo.surname + " " +  subj.personalInfo.givenName,
                                value: subj.id
                            }; 
                        }); 
                    },
                    defaultOption: {
                        label: "",
                        value: null
                    } 
                },
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                getVal: function($el, ev, options) {
                    var value = parseInt($el.val());
                    return _.findWhere(options.view.subjects, {id: value });
                },
                onGet: function(val, options) {
                    return (val && val.id);
                }
            },

            '#parent-sample': {
                observe: 'parentSample',
                
                selectOptions: {
                    collection: function() {
                        return this.parentSamples.map(function(sample) { 
                            return { 
                                label: sample.biobankCode,
                                value: sample.id
                            }; 
                        });
                    },
                    defaultOption: {
                        label: "",
                        value: null
                    } 
                },
                initialize: function($el) {
                    $el.select2({placeholder: i18n('please-select')});
                },
                getVal: function($el, ev, options) {
                    var value = parseInt($el.val());
                    return _.findWhere(options.view.parentSamples, {id: value });
                },
                onGet: function(val, options) {
                    return (val && val.id);
                }

            }

        },

        initialize: function(options) {
            // _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.template = JST["views/templates/sample-edit.ejs"];
            this.schemaView = null;
            this.dataTypes = options.dataTypes || [];
            // _.extend(this, options);
            if (options.sample) {
                this.model = new Sample.Model(this.options);
            }
            else {
                this.model = new Sample.Model();
            }
            _.each(["donor","parentSample"], function(parent) {
                if(options[parent]) {
                    this.model.set(parent, options[parent]);
                }
            }, this);
            /*
            this.dataTypes = options.dataTypes.toJSON();
            this.subjects = options.subjects.toJSON();
            this.parentSamples = options.samples.toJSON(); */
            this.render();
        },
        /*
        render: function(options) {
            if (options.id) {
                this.model = new Sample.Model({id: options.id});
                this.model.fetch({
                    success: this.fetchSuccess
                });
            }
            else {
                this.$el.html(this.template({__: i18n, data: null}));
                this.stickit();
                this.listenTo(this.model, 'change:type', this.dataTypeOnChange);
            }
            return this;
        }, */

        events: {
            'click #save': 'saveData'
        }

    });

    Sample.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'sample',

        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.samples = options.samples;
            this.template = JST["views/templates/sample-list.ejs"];
            this.addLinksToModels();
            this.render();
        },

        addLinksToModels: function() {
            _.each(this.samples.models, function(sample) {
                var typeId = sample.get("type").id;
                var type = this.dataTypes.get(typeId);
                sample.set("editLink", "#/samples/edit/" + sample.id);
                if (type.get("children") && type.get("children").length > 0) {
                    var sampleTypeChildren = _.where(type.get("children"), {"classTemplate": Classes.SAMPLE});
                    if (sampleTypeChildren.length > 0) {
                        var sids = _.pluck(sampleTypeChildren, 'id').join();
                        sample.set("newDerivativeLink", "#/samples/new/0?idDataTypes="+sids+"&parentSample="+sample.id+"&donor="+sample.get("donor").id);
                    }
                    var dataTypeChildren = _.where(type.get("children"), {"classTemplate": Classes.GENERIC});
                    if (dataTypeChildren.length > 0) {
                        var dids = _.pluck(dataTypeChildren, 'id').join();
                        sample.set("newDataLink", "#/data/new/0?idDataTypes="+dids+"&parentSample="+sample.id);
                    }
                }
            }, this);
        },

        render: function() {
            this.$el.html(this.template({__: i18n, samples: this.samples.models}));
            return this;
        } 
    });


} (xtens, xtens.module("sample")));
