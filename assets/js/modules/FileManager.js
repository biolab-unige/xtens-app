(function(xtens,FileManager){
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    
    // TODO: move this to server side config
    var baseUri = "http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/superbiorods";
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
        withCredentials: true
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
            // this.baseUri = options.baseUri;
            // var _id = '#' + this.id;
            /*
            this.dropzone = new Dropzone('#xtens-dropzone', dropzoneOpts);
            this.dropzone.on("processing", function(file) {
                this.options.url = options.baseUri + options.dataTypeName + '/' + file.name;
            });
            this.dropzone.on("addedfile", function(file) {
                // TODO create collections on iRODS if necessary
            });
            this.dropzone.on("sending", function(file, xhr, formData) {
               xhr.setRequestHeader("Authorization", "Basic " + btoa("superbiorods" + ":" + "superbio05!"));
            }); */
        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            return this;
        },

        initializeDropzone: function() {
            var _this = this;
            this.dropzone = new Dropzone(this.el, dropzoneOpts);
            this.dropzone.on("processing", function(file) {
                this.options.url = baseUri + "/" + landingRepo + "/" + file.name;
            });
            this.dropzone.on("addedfile", function(file) {
                // TODO create collections on iRODS if necessary
            });
            this.dropzone.on("sending", function(file, xhr, formData) {
               xhr.setRequestHeader("Authorization", "Basic " + btoa("superbiorods" + ":" + "superbio05!"));
            });
            this.dropzone.on("success", function(file, xhr, formData) {
                _this.fileList.add(new FileManager.Model({uri: this.options.url}));
            });
        }
    
    });

}(xtens,xtens.module("filemanager")));

