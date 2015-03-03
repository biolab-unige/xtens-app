(function(xtens,FileManager) {
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;
    
    // TODO: move this to server side config
    // var baseUri = "http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/xtensdevel";
    var landingRepo = "landing";
    Dropzone.autoDiscover = false;
    
    FileManager.Model = Backbone.Model.extend({
        urlRoot: '/file'
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

        dropzoneOpts: {
            url: null,
            paramName: "uploadFile",
            maxFileSize: 2048, // max 2 GiB
            uploadMultiple: false,
            method: "POST",
            // withCredentials: true
        },

        initialize: function(options) {
            this.template = JST['views/templates/filemanager-dropzone.ejs'];
            this.fileList = new FileManager.List();
            this.fileSystem = options.fileSystem;
            this.dropzoneOpts.url = this.computeFileUploadUrl();
        },

        computeFileUploadUrl: function() {
            var fs = this.fileSystem, url;

            // set the upload URL based on the Distributed FileSystem adopted
            switch(fs.type) {
                case "irods-rest":
                    url = "http://" + fs.restURL.hostname + ':' + fs.restURL.port + fs.restURL.path + '/fileContents' + fs.irodsHome;
                    break;
                default:
                    url = null;                    
            }
            return url;
        },

        render: function() {
            this.$el.html(this.template({__:i18n}));
            return this;
        },

        initializeDropzone: function(files) {
            var _this = this;
            console.log("DROPZONE opts: " + this.dropzoneOpts);
            this.dropzone = new Dropzone(this.el, this.dropzoneOpts);
            if (files) {
                var fileClones = _.cloneDeep(files);
                _.each(fileClones, function(file) {
                    file.name = _.last(file.uri.split("/"));
                    this.dropzone.emit("addedfile", file);
                }, this);
                this.dropzone.disable();
            }

            this.dropzone.on("processing", function(file) {
                this.options.url = _this.dropzoneOpts.url + "/" + landingRepo + "/" + file.name;
            });

            this.dropzone.on("sending", function(file, xhr, formData) {
               xhr.setRequestHeader("Authorization", "Basic " + btoa(_this.fileSystem.username + ":" + _this.fileSystem.password));
            });

            this.dropzone.on("success", function(file, xhr, formData) {
                var name = _.last(this.options.url.split("/"));
                _this.fileList.add(new FileManager.Model({name: name}));
            });
            
            //TODO: error handling on upload 
            this.dropzone.on("error", function() {});
        }
    
    });

FileManager.Views.Download = Backbone.View.extend({
 	
	tagName: 'div',
        className: 'download',

	initialize: function(options) {
	    $("#main").html(this.el);
            this.template = JST["views/templates/DownloadFileIrods.ejs"];
            this.render();
	},
	
	render: function() {
            this.$el.html(this.template({__:i18n}));
            return this;
        }
});

}(xtens,xtens.module("filemanager")));

