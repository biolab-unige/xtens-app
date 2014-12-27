(function(xtens,FileManager){
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    
    // TODO: move this to server side config
    var baseUri = "http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/xtensdevel";
    var landingRepo = "landing";
    Dropzone.autoDiscover = false;

    
    /**
     * options for the dropzone plugin
     */
    var dropzoneOpts = {
        url: baseUri,
        paramName: "uploadFile",
        maxFileSize: 2048, // max 2 GiB
        uploadMultiple: false,
        method: "POST",
        // withCredentials: true
    };

    FileManager.Model = Backbone.Model.extend({
        urlRoot: '/file',
    });

    FileManager.List = Backbone.Collection.extend({
        url: '/file'
    });

    /**
     * @description Backbone view for the Dropzone element
     */

    FileManager.Views.Dropzone = Backbone.View.extend({

        tagName: 'div',
        className: 'dropzone',

        initialize: function(options) {
            this.template = JST['views/templates/filemanager-dropzone.ejs'];
            this.fileList = new FileManager.List();
        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            return this;
        },

        initializeDropzone: function(files) {
            var _this = this;
            this.dropzone = new Dropzone(this.el, dropzoneOpts);
            if (files) {
                var fileClones = _.cloneDeep(files);
                _.each(fileClones, function(file) {
                    file.name = _.last(file.uri.split("/"));
                    this.dropzone.emit("addedfile", file);
                }, this);
                this.dropzone.disable();
            }

            this.dropzone.on("processing", function(file) {
                this.options.url = baseUri + "/" + landingRepo + "/" + file.name;
            });
            this.dropzone.on("addedfile", function(file) {
                // TODO create collections on iRODS if necessary
            });
            this.dropzone.on("sending", function(file, xhr, formData) {
               xhr.setRequestHeader("Authorization", "Basic " + btoa("xtensdevel" + ":" + "xtensdevel"));
            });
            this.dropzone.on("success", function(file, xhr, formData) {
                var name = _.last(this.options.url.split("/"));
                _this.fileList.add(new FileManager.Model({name: name}));
            });
        }
    
    });

}(xtens,xtens.module("filemanager")));

