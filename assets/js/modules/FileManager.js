(function(xtens,FileManager) {
    var i18n = xtens.module("i18n").en;
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;    
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
     * @class 
     * @name FileManager.Views.Dropzone
     * @description Backbone view for the Dropzone element
     */

    FileManager.Views.Dropzone = Backbone.View.extend({

        tagName: 'div',
        className: 'filemanager',

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
            this.$queryModal = this.$(".query-modal");  // the modal dialog HTML element
            this.dropzoneDiv = this.$(".dropzone")[0];       // the dropzone HTML element
            return this;
        },

        /**
         * @method
         * @name initializeDropzone
         * @param {Array} - files: the list of files already uploaded on associated data
         * @description initialize a Dropzone area creating the icons of files, if already uploaded/stored. 
         *              Set event listeners and related functions 
         */
        initializeDropzone: function(files) {
            var _this = this;
            console.log("DROPZONE opts: " + this.dropzoneOpts);
            this.dropzone = new Dropzone(this.dropzoneDiv, this.dropzoneOpts);
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
                _this.modal = new ModalDialog({
                    title: i18n('file-successfully-uploaded'),
                    body: i18n('the-file') + ' ' + name + ' ' + i18n('has-been-successfully-uploaded')
                });
                _this.$queryModal.append(_this.modal.render().el);
                _this.modal.show();
            });

            //TODO: error handling on upload 
            this.dropzone.on("error", function() {});
        }

    });
    
    /**
     * @class
     * @name FileManager.Views.Download
     * @description TODO
     */
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

