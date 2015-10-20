/**
 * @author  Massimiliano Izzo
 * @description This file contains the Backbone classes for handling DataType
 *              models, collections and views  
 */
(function(xtens, DataFile) {

    var i18n = xtens.module("i18n").en;
    var ModalDialog = xtens.module("xtensbootstrap").Views.ModalDialog;
    /**
     * @class 
     * @name DataFile.Model
     *
     */
    DataFile.Model = Backbone.Model.extend({
        
        urlRoot: '/dataFile'

    });
    
    /**
     * @class
     * @name DataFile.List
     */
    DataFile.List = Backbone.Collection.extend({
    
        url: '/dataFile'

    });
    
    /**
     * @class
     * @name DataFile.Views.List
     */
    DataFile.Views.List = Backbone.View.extend({

        tagName: 'div',
        className: 'dataFile',

        events: {
            'click .remove-me': 'closeMe',
            'click a.download-file-content': 'downloadFileContentOnClick'
        },
        
        initialize: function() {
            this.template = JST["views/templates/datafile-list.ejs"];
        },

        render: function() {
            this.$el.html(this.template({__:i18n, dataFiles: this.collection.models}));
            this.$queryModal = this.$(".query-modal");
            return this;
        },
        
        /**
         * @method
         * @name closeMe
         * @description trigger a 'closeMe' for the parent view to get it and close this child
         */
        closeMe: function(ev) {
            this.trigger("closeMe", this);
        },


        /**
         * @method
         * @name downloadFileContentOnClick
         * @param{} ev
         */
        downloadFileContentOnClick: function(ev) {
            ev.preventDefault();
            var idFile = $(ev.target).data('id');
            console.log("FileManager.Views.Download.downloadFileContent: " + idFile);
            this.downloadFileContent(_.parseInt(idFile));
            return false;
        },

        /**
         * @method
         * @name downloadFileContent
         * @param{Integer} id - the ID of the dataFile on XTENS
         * @description download a file from the remote file storage given its XTENS ID
         * @link http://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
         */
        downloadFileContent: function(idFile) {
            
            var that = this;
            var xhr = new XMLHttpRequest();
            var url = 'fileContent?id=' + idFile;
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';

            xhr.onload = function() {
                var fileName = "", disposition, fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/, matches, type, blob, windowURL, downloadURL, a;
                // response is OK
                if (this.status === 200) {
                    fileName = "";
                    disposition = xhr.getResponseHeader('Content-Disposition');
                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        matches = fileNameRegex.exec(disposition);
                        if (matches != null && matches[1]) {
                            fileName = matches[1].replace(/['"]/g, '');
                        }  
                    }
                    type = xhr.getResponseHeader('Content-Type');
                    blob = new Blob([this.response], {type: type});

                    if (typeof window.navigator.msSaveBlob !== 'undefined') {
                        // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
                        // These URLs will no longer resolve as the data backing the URL has been freed."
                        window.navigator.msSaveBlob(blob, fileName);
                    }
                    else {
                        windowURL = window.URL || window.webkitURL;
                        downloadURL = windowURL.createObjectURL(blob);

                        if (fileName) {
                            // use HTML5 a[download] attribute to specify filename
                            a = document.createElement("a");
                            if (typeof a.download === 'undefined') {
                                window.location = downloadURL;
                            }
                            else {
                                a.href = downloadURL;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                            }
                        }

                        else {
                            window.location = downloadURL;
                        }
                        setTimeout(function () { windowURL.revokeObjectURL(downloadURL); }, 100); // cleanup
                    }
                }
                // response is serverError
                else {
                    console.log("DataFile.Views.List - downloadFileContent: could not download file");
                    that.modal = new ModalDialog({
                        title: i18n('could-not-download-file'),
                        body: xhr.statusText
                    });
                    that.$queryModal.append(that.modal.render().el);
                    that.modal.show();
                }
            };

            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Authorization', 'Bearer ' + xtens.session.get("accessToken"));
            xhr.send();
        }


    });

} (xtens, xtens.module("datafile")));
