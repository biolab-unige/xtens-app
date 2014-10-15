/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Samples
 */
(function(xtens, Sample) {

    var i18n = xtens.module("i18n").en;
    var DataType = xtens.module("datatype");
    var Data = xtens.module("data");

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
                                label: subj.code,  //subj.personalInfo.surname + " " +  subj.personalInfo.givenName,
                                value: subj.id
                            }; 
                        });
                    },
                        /*'this.subjects',
                    labelPath: 'personalInfo.surname',
                    valuePath: 'id', */
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

            '#parentSample': {
                observe: 'parentSample',

                selectOptions: {
                    collection: [],
                    label: '',
                    value: '',
                    defaultOption: {
                        label: i18n('please-select'),
                        value: null
                    }
                }
            }

        },

        initialize: function(options) {
            _.bindAll(this, 'fetchSuccess');
            $('#main').html(this.el);
            this.template = JST["views/templates/sample-edit.ejs"];
            this.dataTypes = options.dataTypes;
            this.subjects = options.subjects;
            this.render(options);
        },

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
        },

        events: {
            'click #save': 'saveData'
        }

    });

    Sample.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'sample',

        initialize: function() {
            $("#main").html(this.el);
            this.template = JST["views/templates/sample-list.ejs"];
            this.render();
        },

        render: function(options) {
            var that = this;
            var sample = new Sample.List();
            sample.fetch({
                success: function(samples) {
                    that.$el.html(that.template({__: i18n, samples: samples.models}));
                },
                error: function() {
                    that.$el.html(that.template({__: i18n}));
                }
            });
            return this;
        } 
    });


} (xtens, xtens.module("sample")));
