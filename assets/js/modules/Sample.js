/**
 * @author  Massimiliano Izzo
 * @description This file conatins all the Backbone classes for handling Samples
 */
(function(xtens, Sample) {
    var useFormattedNames = xtens.module("xtensconstants").useFormattedMetadataFieldNames;
    var Constants = xtens.module("xtensconstants").Constants;
    var i18n = xtens.module("i18n").en;
    var DataType = xtens.module("datatype");
    var DataTypeModel = xtens.module("datatype").Model;
    var Data = xtens.module("data");
    var Subject = xtens.module("subject");
    var Classes = xtens.module("xtensconstants").DataTypeClasses;
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;

    var MISSING_VALUE_ALERT = true;

    var biobankCodeMap = {
        RNA: '01',
        DNA: '02',
        Fluid: '03'
    };


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
                    return _.isNaN(value) ? null : value;
                    // return _.findWhere(options.view.dataTypes, {id: value });
                },
                onGet: function(val, options) {
                    // if you get the whole DataType object you must retrieve the ID
                    if (_.isObject(val)) {
                        return (val && val.id);
                    }
                    // otherwise you've already the ID
                    else {
                        return val;
                    }
                }
            },

            '#biobank': {
                observe: 'biobank',
                selectOptions: {
                    collection: 'this.biobanks',
                    labelPath: 'acronym',
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
                    return _.findWhere(options.view.biobanks, {id: value });
                },
                onGet: function(val, options) {
                    return (val && val.id);
                }
            },

            /*
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
            }, */

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
            _.bindAll(this, 'fetchDonorsOnSuccess');
            $('#main').html(this.el);
            this.template = JST["views/templates/sample-edit.ejs"];
            this.schemaView = null;
            this.dataTypes = options.dataTypes || [];
            this.biobanks = options.biobanks || [];
            this.subjects = options.subjects || [];
            if (options.sample) {
                this.model = new Sample.Model(options.sample);
            }
            else {
                this.model = new Sample.Model({
                    biobank: this.biobanks[0]
                });
            }
            _.each(["donor","parentSample"], function(parent) {
                if(options[parent]) {
                    this.model.set(parent, options[parent]);
                }
            }, this);
            this.render();
        },

        events: {
            'click #editDonor': 'editDonor',
            "submit .edit-sample-form": "saveSample",
            "click button.delete": "deleteSample"
        },

        /**
         * @method
         * @name saveData
         * @description retrieve all the Sample properties from the form (the metadata value(s)-unit(s) pairs, the files' paths, etc...)
         *              and save the Sample model on the server
         * @param {event} - the form submission event
         * @return {false} - to suppress the HTML form submission
         */
        saveSample: function(ev) {
            var targetRoute = $(ev.currentTarget).data('targetRoute') || 'samples';
            if (this.schemaView && this.schemaView.serialize) {
                var that = this;
                this.$modal = this.$(".sample-modal");
                var metadata = this.schemaView.serialize(useFormattedNames);
                this.model.set("metadata", metadata);
                // this.model.set("type", this.model.get("type").id); // trying to send only the id to permorf POST or PUT
                this.retrieveAndSetFiles();
                // console.log(this.model);
                this.model.save(null, {
                    success: function(data) {

                        if (that.modal) {
                            that.modal.hide();
                        }
                        var modal = new ModalDialog({
                            title: i18n('ok'),
                            body: i18n('sample-correctly-stored-on-server')
                        });
                        that.$modal.append(modal.render().el);
                        $('.modal-header').addClass('alert-success');
                        modal.show();

                        setTimeout(function(){ modal.hide(); }, 1200);
                        that.$('.sample-modal').on('hidden.bs.modal', function (e) {
                            modal.remove();
                            xtens.router.navigate(targetRoute, {trigger: true});
                        });

                    },
                    error: function(model, res) {
                        xtens.error(res);
                    }
                });
            }
            return false;
        },

        deleteSample: function(ev) {
            ev.preventDefault();
            var that = this;
            this.$modal = this.$(".sample-modal");
            if (this.modal) {
                this.modal.hide();
            }

            var modal = new ModalDialog({
                template: JST["views/templates/confirm-dialog-bootstrap.ejs"],
                title: i18n('confirm-deletion'),
                body: i18n('sample-will-be-permanently-deleted-are-you-sure')
            });

            this.$modal.append(modal.render().el);
            modal.show();

            this.$('#confirm-delete').click( function (e) {
                modal.hide();
                var targetRoute = $(ev.currentTarget).data('targetRoute') || 'samples';

                that.model.destroy({
                    success: function(model, res) {
                        modal.template= JST["views/templates/dialog-bootstrap.ejs"];
                        modal.title= i18n('ok');
                        modal.body= i18n('sample-deleted');
                        that.$modal.append(modal.render().el);
                        $('.modal-header').addClass('alert-success');
                        modal.show();
                        setTimeout(function(){ modal.hide(); }, 1200);
                        that.$modal.on('hidden.bs.modal', function (e) {
                            modal.remove();
                            xtens.router.navigate(targetRoute, {trigger: true});
                        });
                    },
                    error: function(model, res) {
                        xtens.error(res);
                    }
                });
                return false;
            });

        },

        /**
         * @method
         * @name dataTypeOnChange
         */
        // TODO check this one!!
        dataTypeOnChange: function() {
            Data.Views.Edit.prototype.dataTypeOnChange.call(this);
            var typeName = this.$('#type :selected').text(), parentSample = this.model.get("parentSample");

            if (parentSample && parentSample.biobankCode) {
                this.model.set('biobankCode', biobankCodeMap[typeName] + parentSample.biobankCode);
            }

        },

        /**
         * @method
         * @name editDonor
         *
         */
        editDonor: function(ev) {
            var donors = new Subject.List(), that = this;
            donors.fetch({
                data: $.param({
                    select: JSON.stringify(["id", "code", "personalInfo", "type"]),
                    limit: 2000
                }),
                success: function(donors) {
                    that.fetchDonorsOnSuccess(donors, ev.target);
                },
                error: xtens.error
            });
            return false;
        },

        fetchDonorsOnSuccess: function(donors, targetElem) {
            console.log(donors.length);
            this.subjects = donors.toJSON();

            var $div = $('<div>').addClass('data-input-div');
            var $select = $('<select>').addClass('form-control').attr({
                'id': 'donor',
                'name': 'donor'
            });

            var parent = targetElem.parentNode;

             // remove all subelements but the label
            while (parent.children.length > 1) {
                parent.removeChild(parent.lastChild);
            }

            $div.append($select);

            $(parent).append($div);

            this.addBinding(null, '#donor', {
                observe: 'donor',
                selectOptions: {
                    collection: function() {
                        return this.subjects.map(function(subj) {
                            var label = subj.personalInfo ? subj.code + ": " + subj.personalInfo.surname +
                                " " + subj.personalInfo.givenName : subj.code;
                            return {
                                label: label,
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
            });
            return false;
        }

    });

    /**
     * @class
     * @name Sample.Views.Details
     * @extends Data.Views.Details
     * @description view containing the details (metadata and files) of a Sample (Sample.Model) instance
     */
    Sample.Views.Details = Data.Views.Details.fullExtend({

        /**
         * @method
         * @name initialize
         */
        initialize: function(options) {
            $("#main").html(this.el);
            this.template = JST["views/templates/sample-details.ejs"];
            this.render();
        },

        render: function() {
            var dataType = new DataTypeModel(this.model.get("type"));
            var fields = dataType.getFlattenedFields();

            this.$el.html(this.template({
                __: i18n,
                data: this.model,
                fields: fields,
                PATH_SEPARATOR: Constants.PATH_SEPARATOR || '/'
            }));

            if (MISSING_VALUE_ALERT) {
                this.$('div[name="metadata-value"]').filter(function() {
                    return $(this).text().trim() === '';
                }).addClass("text-warning").html(i18n("missing-value"));
            }
        }

    });

    Sample.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'sample',

        initialize: function(options) {
            $("#main").html(this.el);
            this.dataTypes = options.dataTypes;
            this.samples = options.samples;
            this.dataTypePrivileges = options.dataTypePrivileges.models;
            this.template = JST["views/templates/sample-list.ejs"];
            this.addLinksToModels();
            this.params = options.params;
            this.donor = options.params && options.params.donor;
            this.donorCode = options.params && options.params.donorCode;
            this.parentSample = options.params && options.params.parentSample;
            this.parentDataType = options.params && options.params.parentDataType;
            this.render();
        },

        addLinksToModels: function() {
            _.each(this.samples.models, function(sample) {
                var privilege = _.find(this.dataTypePrivileges, function(model){ return model.get('dataType') === sample.get("type").id;});
                if(privilege.get('privilegeLevel') === "edit" ){
                    sample.set("editLink", "#/samples/edit/" + sample.id);}
                var typeId = sample.get("type").id;
                var type = this.dataTypes.get(typeId);
                if (type.get("children") && type.get("children").length > 0) {
                    var sampleTypeChildren = _.where(type.get("children"), {"model": Classes.SAMPLE});
                    if (sampleTypeChildren.length > 0) {
                        var sids = _.pluck(sampleTypeChildren, 'id').join();
                        sample.set("newDerivativeLink", "#/samples/new/0?idDataTypes="+sids+"&parentSample="+sample.id+"&donor="+sample.get("donor").id);
                    }
                    var dataTypeChildren = _.where(type.get("children"), {"model": Classes.DATA});
                    if (dataTypeChildren.length > 0) {
                        var dids = _.pluck(dataTypeChildren, 'id').join();
                        sample.set("newDataLink", "#/data/new/0?idDataTypes="+dids+"&parentSample="+sample.id);
                    }
                }
            }, this);
        },

        render: function(options) {
            this.$el.html(this.template({__: i18n, samples: this.samples.models, dataTypePrivileges: this.dataTypePrivileges}));
            this.table = this.$('.table').DataTable();
            if(options && options.pageActive){
                this.table.page( options.pageActive.page ).draw('page');
            }
            return this;
        },

        loadResults: function (ev) {
            ev.preventDefault();
            var that = this;
            that.samples.fetch({
                data: $.param(_.assign(_.omit(that.params, ['parentDataType','donorCode']), {      // omit "donorCode" as param in server-side GET request
                    populate: ['type', 'biobank', 'donor'],
                    limit: 30,
                    skip: that.samples.length,
                    sort: 'created_at DESC'
                })),
                remove: false,
                success: function (results) {
                    that.addLinksToModels();
                    var pageActive= that.table.page.info();
                    that.render({pageActive:pageActive});
                }
            });
        },

        events: {
            'click #moreData':'loadResults',
            'click #newSample': 'openNewSampleView'
        },

        openNewSampleView: function(ev) {
            ev.preventDefault();
            var donorQuery = this.donor ? 'donor=' + this.donor : '';
            var donorCodeQuery = this.donorCode ? 'donorCode=' + this.donorCode : '';
            var parentSampleQuery = this.parentSample ? 'parentSample=' + this.parentSample : '';
            var parentDataTypeQuery = this.parentDataType ? 'parentDataType=' + this.parentDataType : '';
            // var queryString = _.trim([donorQuery, donorCodeQuery, parentSampleQuery].join('&'), '&');
            var queryString = _.compact([donorQuery, donorCodeQuery, parentSampleQuery, parentDataTypeQuery]).join('&');
            var route = _.trim(['/samples/new', queryString].join('/0?'), '/0?');
            xtens.router.navigate(route, {trigger: true});
            return false;
        }
    });


} (xtens, xtens.module("sample")));
