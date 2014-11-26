(function(xtens,FileManager){
    var i18n = xtens.module("i18n").en;    
    var router = xtens.router;

    function IrodsFileManager(uri){
        this.basePath = uri;

    }

    IrodsFileManager.prototype.upload = function(source,destination) {
        var fd = new FormData();
        fd.append('uploadFile',source);
        var deferred = $.ajax({
            type: "POST",

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
            data:fd
        });

        return deferred;

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
            this.template = JST["views/templates/uploadFile.ejs"];
            this.render();
        },
        render: function(options) {

            var self = this;

            self.$el.html(self.template({__: i18n}));
            return self;    
        }

    });

    FileManager.Views.Download = Backbone.View.extend({
        tagName:'div',
        className:'fileManager',


        initialize:function(){
            $("#main").html(this.el);
            this.template = JST["views/templates/DownloadFileIrods.ejs"];
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

