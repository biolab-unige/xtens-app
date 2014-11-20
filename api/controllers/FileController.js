/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
 var fs = require('fs');

module.exports = {

 upload: function  (req, res) {

    req.file('file').upload(function (err, files) {
      if (err)
        return res.serverError(err);

      return res.json({
        message: files.length + ' file(s) uploaded successfully!',
        files: files
      });
    });
	
},

 download: function (req,res){
        var namefile = ".tmp/uploads/form.html";
        var filestream = fs.createReadStream(namefile,{autoClose: true});
       
  	filestream.pipe(res);
	
        console.log(filestream);
 	return filestream;

 }

};
