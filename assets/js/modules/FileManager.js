(function(xtens,FileManager){
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;

    function IrodsFileManager(uri){
        this.basePath = uri;

    }

    IrodsFileManager.prototype.upload = function(fileUpload) {

        var body = new FormData();
        body.append("uploadFile",fileUpload);
        $.ajax({
            type: "POST",

            url:this.basePath+fileUpload.name,
            beforeSend: function (xhr) {

                xhr.setRequestHeader("Authorization", "Basic " + btoa("superbiorods" + ":" + "superbio05!"));
                xhr.setRequestHeader("Access-Control-Allow-Origin","*");
            },

            xhrFields: { withCredentials: true },
            acceptEncoding:'multipart/form-data',
            crossDomain: true,
            processData:false,
            contentType:false,
            data:body

        }).done(function(data) {
            console.log(data);
        });

    };

    IrodsFileManager.prototype.download= function(destination){
        $.ajax({
            type: "GET",

            url: this.basePath + destination,
            beforeSend: function (xhr) {
                xhr.withCredentials = true;
                xhr.setRequestHeader("Authorization", "Basic " + btoa("biolab" + ":" + "superbio05!"));
            },

            xhrFields: { withCredentials: true },
            crossDomain: true,

            headers: { 'Authorization': "Basic " + btoa("biolab" + ":" + "superbio05!") },
            processData:false,
            contentType:false,

        });

    };

    IrodsFileManager.prototype.delete = function(){
        throw new Error("not implemented yet");
    };


    function FileSystemFileManager(){
    }

    FileSystemFileManager.prototype.upload = function(){
    };

    FileSystemFileManager.prototype.download = function(){

    };

    FileSystemFileManager.prototype.delete = function(){

    };


    FileManager.Views.Upload = Backbone.View.extend({
        tagName:'div',
        className:'fileManager',


        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/upload-file-server.ejs"];
            this.render();
        },
        render: function(options) {

            var self = this;

            self.$el.html(self.template({__: i18n}));
            return self;    
        }

    });

    FileManager.Views.UploadIrods = Backbone.View.extend({
        tagName:'div',
        className:'fileManager',
        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/upload-file-irods.ejs"];
            this.render();
        },
        render: function(options) {

            var self = this;

            self.$el.html(self.template({__: i18n}));
            return self;    
        },
        events:{
            'click #upload' :'uploadFile',
            'dragover #filedrag' :'enableDrop',
            'drop #filedrag':'dropUploadFile'
        },

        enableDrop:function(ev){
            ev.preventDefault();
        },

        dropUploadFile :function(ev){

            ev.preventDefault();
            var obj = document.getElementById('filedrag');
            var fileUpload = ev.originalEvent.dataTransfer.files[0];
            var newFile       = document.createElement('div');
            newFile.innerHTML = 'Loaded : '+fileUpload.name+' size '+fileUpload.size+' B';
            obj.appendChild(newFile);
            var irodsDestination = new IrodsFileManager("http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/superbiorods/");
            irodsDestination.upload(fileUpload);



        },


        uploadFile: function(){

            var irodsDestination = new IrodsFileManager("http://130.251.10.60:8080/irods-rest-4.0.2.1-SNAPSHOT/rest/fileContents/biolabZone/home/superbiorods/");
            var fileUpload = document.getElementsByName('datafile')[0].files[0];
            irodsDestination.upload(fileUpload);



        }

    });

    FileManager.Views.Download = Backbone.View.extend({
        tagName:'div',
        className:'fileManager',


        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/FileIrods.ejs"];
            this.render();
        },
        render: function(options) {

            var self = this;

            self.$el.html(self.template({__: i18n}));
            return self;    
        }

    });





    FileManager.Irods = IrodsFileManager;

}(xtens,xtens.module("FileManager")));

