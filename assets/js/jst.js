this["JST"] = this["JST"] || {};

this["JST"]["views/templates/association.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="adminAssociation">\n    <style>\n#associated {width:400px;height:300px;padding:10px;border:5px solid #aaaaaa;border-radius:10px;}\n#noassociated {width:400px;height:300px;padding:15px;border:5px solid #aaaaaa;border-radius:10px;}\ndiv.nondominant {width:200px;height:40px;padding:5px;border:3px solid #aaaaaa;border-radius:10px;text-align: center;line-height:25px;}\n#label {text-align:center;\n    vertical-align:middle; \n    display:block;\n    top:120px;}\n    </style>\n        <form name = "Myform" class="form-horizontal association-form" role="form">\n\n        <h2 class="legend" align="center">' +
((__t = ( dominant.urlRoot.slice(1).charAt(0).toUpperCase()+dominant.urlRoot.slice(1).slice(1)+" "+dominant.get('name').charAt(0).toUpperCase()+dominant.get('name').slice(1) )) == null ? '' : __t) +
'</h2> \n\n\n        <div class="form-group row" >\n\n            <p> <label for="associated" class="col-md-3 control-label" id="label">' +
((__t = ( __("associated")+" "+nondominantName.charAt(0).toUpperCase()+nondominantName.slice(1) )) == null ? '' : __t) +
'</label></p>\n\n            <div id="associated" class="col-md-6 Table" >\n                <div id="lista" class="col-md-6">\n                    ';
 if (dominant.get(nondominantName).length !=0) {;
__p += ' \n                    ';
 var a = new Array();
                    var dati = new Array(); 
                    for(var g = 0;g<dominant.get(nondominantName).length;g++){
                        a[g]=dominant.get(nondominantName)[g][field];
                        }
                        ;
__p += ' \n                        ';
 for(var j =0;j<nondominants.length;j++)  { 
                        dati[j]= nondominants[j][field];
                        } ;
__p += '\n                        ';
 var c =_.intersection(dati,a) ;
__p += ' \n                        ';
 for (var i=0;i<c.length;i++) { ;
__p += ' \n                        ';
 for(var l=0;l<nondominants.length;l++){ ;
__p += '\n                        ';
 if (c[i]==nondominants[l][field]) {;
__p += '\n\n                        <div class="form-group row">\n                            <div class="nondominant" draggable="true" id="' +
((__t = ( (nondominants[l].id) )) == null ? '' : __t) +
'" value ="' +
((__t = ( c[i] )) == null ? '' : __t) +
'">' +
((__t = ( c[i] )) == null ? '' : __t) +
'</div>\n                        </div>\n                        ';
 } ;
__p += '\n                        ';
 } ;
__p += '\n                        ';
 } ;
__p += '                \n                        ';
 } ;
__p += '\n                    </div>\n                </div>\n            </div>\n            <div class="form-group row">\n\n                <p> <label for="noassociated" id="label" class="col-md-3 control-label">' +
((__t = ( __("no-associated")+" "+nondominantName.charAt(0).toUpperCase()+nondominantName.slice(1) )) == null ? '' : __t) +
'</label></p>\n\n                <div id="noassociated" class=" col-md-6 Table">\n                    <div id="noass" class="col-md-6">\n                        ';
 if (dominant.get(nondominantName).length ==0) {;
__p += ' \n                        ';
 var a = new Array();}
                        else{ var a = new Array();
                        for(var g = 0;g<dominant.get(nondominantName).length;g++){
                            a[g]=dominant.get(nondominantName)[g][field];
                            }
                            } var dati = new Array(); ;
__p += ' \n                            ';
 for(var j =0;j<nondominants.length;j++)  { 
                            dati[j]= nondominants[j][field];
                            } ;
__p += ' \n                            ';
 var b = _.difference(dati,a); ;
__p += '\n                            ';
 for (var i=0;i<b.length;i++) { ;
__p += ' \n                                ';
 for(var l=0;l<nondominants.length;l++){ ;
__p += '\n                                ';
 if (b[i]==nondominants[l][field]) {;
__p += '\n                                <div class="form-group row">\n                                    <div class="nondominant" draggable="true" id="' +
((__t = ( (nondominants[l].id)  )) == null ? '' : __t) +
'" value ="' +
((__t = ( b[i])) == null ? '' : __t) +
'">' +
((__t = ( b[i])) == null ? '' : __t) +
'</div>\n                                </div>\n                                ';
 } ;
__p += '\n                                ';
 } ;
__p += '\n                                ';
 } ;
__p += '\n                            </div>\n                        </div>\n                    </div>\n\n                </form>\n            </div>\n';

}
return __p
};

this["JST"]["views/templates/biobank-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>' +
((__t = ( __("biobank-manager") )) == null ? '' : __t) +
'</h1>\n<h2>' +
((__t = ( biobank.id ? __("update-biobank") : __("create-biobank") )) == null ? '' : __t) +
'</h2>\n\n<div id="content"> \n\n    <form id="biobank-form" class="form-horizontal edit-biobank-form" role="form">\n        <div class="form-group biobankform-group">\n            <label for="biobankID" class="biobank-label">' +
((__t = ( __('biobank-ID') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="biobankID" name="biobankID"></input>\n            </div>\n            <label for="acronym" class="biobank-label">' +
((__t = ( __('biobank-acronym') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="acronym" name="acronym" required></input>\n            </div>\n        </div>\n        <div class="form-group biobankform-group">\n            <label for="name" class="biobank-label">' +
((__t = ( __('biobank-name') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="name" name="name" required></input>\n            </div>\n            <label for="url" class="biobank-label">' +
((__t = ( __('biobank-url') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="url" name="url"></input>\n            </div>\n        </div>\n        <div class="form-group biobankform-group">\n            <label for="juristicPerson" class="biobank-label">' +
((__t = ( __('juristic-person') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="juristicPerson" name="juristicPerson"></input>\n            </div>\n            <label for="country" class="biobank-label">' +
((__t = ( __('country') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-halfinput-div">\n                <input text class="form-control" id="country" name="country" required \n                data-parsley-pattern="[a-zA-Z]+" data-parsley-length="[2,2]"></input>\n            </div>\n        </div>\n        <div class="form-group biobankform-group">\n            <label for="description" class="biobank-label">' +
((__t = ( __('description') )) == null ? '' : __t) +
'</label>\n            <div class="biobank-input-div">\n                <input text class="form-control" id="description" name="description"></input>\n            </div>\n        </div>\n        <div id="contact-information-cnt"></div>\n        <div id="buttonbardiv" class="row text-center">\n            <div class="btn-group btn-group-margin">\n                <input type="submit" class="btn btn-primary" value="' +
((__t = (__('save-biobank') )) == null ? '' : __t) +
'" >\n                ';
 if (biobank.id) { ;
__p += '\n                <input type="hidden" id="id" name="id" value="' +
((__t = ( biobank.id )) == null ? '' : __t) +
'" />\n                <button data-biobank-id="' +
((__t = ( biobank.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">' +
((__t = ( __("delete") )) == null ? '' : __t) +
'</button>\n                ';
} ;
__p += '\n            </div>\n        </div>\n    </form>\n</div> <!-- content -->\n';

}
return __p
};

this["JST"]["views/templates/biobank-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2>' +
((__t = ( __("biobanks") )) == null ? '' : __t) +
'</h2> \n\n<div id="content">\n    <div class="row">\n        <div class="col-sm-12">\n            <div class="table-responsive">\n                <table class="table">\n                    <thead>\n                        <tr>\n                            <th>' +
((__t = ( __("biobank-ID") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("biobank-name") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("biobank-acronym") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("biobank-url") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("juristicPerson") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("country") )) == null ? '' : __t) +
'</th>\n                            <th></th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                    ';
 _.each(biobanks, function(biobank) { ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( biobank.get("biobankID") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( biobank.get("name") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( biobank.get("acronym") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( biobank.get("url") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( biobank.get("juristicPerson") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( biobank.get("country") )) == null ? '' : __t) +
'</td>\n                        <td><a class="btn" href="#/biobanks/edit/' +
((__t = ( biobank.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n                    </tr>\n                    ';
 }) ;
__p += ' \n                    </tbody>\n                </table>\n            </div>\n            <div id="buttonbardiv" class="row text-center">\n                <a href="#/biobanks/new" class="btn btn-primary">' +
((__t = ( __("new-biobank"))) == null ? '' : __t) +
'</a>\n            </div>\n        </div>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/contactinformation-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h3>' +
((__t = ( __('contact-information') )) == null ? '' : __t) +
'</h3>\n<div class="form-group metadataform-group">\n    <label for="givenName" class="biobank-label">' +
((__t = ( __('given-name') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-halfinput-div">\n        <input text class="form-control" id="givenName" name="givenName" required data-parsley-pattern="[a-zA-Z]+"></input>\n    </div>\n    <label for="surname" class="biobank-label">' +
((__t = ( __('surname') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-halfinput-div">\n        <input text class="form-control" id="surname" name="surname" required data-parsley-pattern="[a-zA-Z]+"></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="phone" class="biobank-label">' +
((__t = ( __('phone') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-halfinput-div">\n        <input text class="form-control" id="phone" name="phone" required></input>\n    </div>\n    <label for="email" class="biobank-label">' +
((__t = ( __('email') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-halfinput-div">\n        <input type="email" class="form-control" id="email" name="email" required></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="address" class="biobank-label">' +
((__t = ( __('address') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-input-div">\n        <input text class="form-control" id="address" name="address" required></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="zip" class="biobank-label">' +
((__t = ( __('zip') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-thirdinput-div">\n        <input text class="form-control" id="zip" name="zip" required></input>\n    </div>\n    <label for="city" class="biobank-label">' +
((__t = ( __('city') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-thirdinput-div">\n        <input text class="form-control" id="city" name="city" required data-parsley-pattern="[a-zA-Z]+"></input>\n    </div>\n    <label for="country" class="biobank-label">' +
((__t = ( __('country') )) == null ? '' : __t) +
'</label>\n    <div class="biobank-thirdinput-div">\n        <input text class="form-control" id="country" name="country" required data-parsley-length="[2,2]" data-parsley-pattern="[a-zA-Z]+"></input>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/data-edit-partial.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="metadata-body" class="metadatacomponent-body"></div>\n';

}
return __p
};

this["JST"]["views/templates/data-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>' +
((__t = ( __("data-manager") )) == null ? '' : __t) +
'</h1>\n<h2>' +
((__t = ( data.id ? __("update-data") : __("create-data") )) == null ? '' : __t) +
'</h2>\n<div id="content">\n    <form class="form-horizontal edit-data-form" role="form">\n        <div class="container data-header-cnt">\n            <div id="data-header-row" class="row data-header-row">\n                <div id="data-header" class="data-header-col">\n                    <div class="form-group">\n                        ';
 if (data.get("parentSubject")) {;
__p += '\n                        <label for="parentSubject" class="data-label">' +
((__t = ( __("subject") )) == null ? '' : __t) +
': </label>\n                        <span class="data-span">' +
((__t = ( data.get("parentSubject").code )) == null ? '' : __t) +
'</span>\n                        ';
} ;
__p += '\n                        ';
 if (data.get("parentSample")) {;
__p += '\n                        <label for="parentSample" class="data-label">' +
((__t = ( __("sample") )) == null ? '' : __t) +
': </label>\n                        <span class="data-span">' +
((__t = ( data.get("parentSample").biobankCode )) == null ? '' : __t) +
'</span>\n                        ';
} ;
__p += '\n                    </div>\n                    <div class="form-group">\n                        <label for="dataType" class="data-label">' +
((__t = ( __("select-a-data-type") )) == null ? '' : __t) +
'</label>\n                        <div class="data-input-div">\n                            <select class="form-control" id="dataType" name="dataType" required>\n                            </select>\n                        </div>\n                    </div>\n                    <div class="form-group metadataform-group">\n                        <label for="date" class="data-label">' +
((__t = ( __('date') )) == null ? '' : __t) +
'</label>\n                        <div class="data-input-div">\n                            <input type="date" class="form-control" id="date" name="date"></input>\n                        </div>\n                    </div>\n                    <div class="form-group metadataform-group">\n                        <label for="tags" class="data-label">' +
((__t = ( __('tags') )) == null ? '' : __t) +
'</label>\n                        <div class="data-input-div">\n                            <input type="hidden" class="form-control" id="tags" name="tags"></input>\n                        </div>\n                    </div>\n                    <div class="form-group metadataform-group">\n                        <label for="notes" class="data-label">' +
((__t = ( __('notes') )) == null ? '' : __t) +
'</label>\n                        <div class="data-input-div">\n                            <textarea class="form-control" id="notes" name="notes" rows="4"></textarea>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        <div id="buttonbardiv" class="row text-center">\n            <div class="btn-group btn-group-margin">\n                <input type="submit" id="save" class="btn btn-primary" value="' +
((__t = (__('save') )) == null ? '' : __t) +
'" >\n                ';
 if (data) { ;
__p += '\n                <input type="hidden" id="id" name="id" value="' +
((__t = ( data.id )) == null ? '' : __t) +
'" />\n                <button data-data-id="' +
((__t = ( data.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">' +
((__t = ( __("delete") )) == null ? '' : __t) +
'</button>\n                ';
} ;
__p += '\n            </div>\n        </div>\n    </form>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/data-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2>' +
((__t = ( __("data-list") )) == null ? '' : __t) +
'</h2> \n\n<div id="content">\n    <div class="row">\n        <div class="col-sm-12">\n            <div class="table-responsive">\n                <table class="table">\n                    <thead>\n                        <tr>\n                            <th>' +
((__t = ( __("type") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("date") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("tags") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("metadata") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("notes") )) == null ? '' : __t) +
'</th>\n                            <th></th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                    ';
 _.each(data, function(data) { ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( data.get("type").name )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( data.get("date") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( JSON.stringify(data.get("tags")) )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( JSON.stringify(data.get("metadata")) )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( data.get("notes") )) == null ? '' : __t) +
'</td>\n                        <td>\n                            <a class="btn" href="' +
((__t = ( data.get("editLink") )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a>\n                            ';
 if (data.get("newDataLink") && data.get("newDataLink").length > 0) {;
__p += '\n                            <a class="btn" href="' +
((__t = ( data.get("newDataLink") )) == null ? '' : __t) +
'">' +
((__t = (__("new-data") )) == null ? '' : __t) +
'</a>\n                            ';
} ;
__p += '\n                        </td>\n                    </tr>\n                    ';
 }) ;
__p += ' \n                    </tbody>\n                </table>\n            </div>\n            <div id="buttonbardiv" class="row text-center">\n                <a href="#/data/new" class="btn btn-primary">' +
((__t = ( __("new-data"))) == null ? '' : __t) +
'</a>\n            </div>\n        </div>\n    </div>\n</div>\n\n';

}
return __p
};

this["JST"]["views/templates/data-table.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="table-responsive">\n    <table class="table">\n        <thead>\n            <tr>\n                <th>' +
((__t = ( __("code") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("surname") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("given-name") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("overall-status") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("diagnosis-age") )) == null ? '' : __t) +
'</th>\n                <th>' +
((__t = ( __("diagnosis-age-unit"))) == null ? '' : __t) +
'</th>\n            </tr>\n        </thead>\n        <tbody>\n        ';
 _.each(data, function(datum) {;
__p += '\n        ';
 if (datum.type && datum.type.classTemplate === 'Subject') {;
__p += '\n        <tr>\n            <td>' +
((__t = ( datum.code )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.personalInfo.surname )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.personalInfo.givenName )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.personalInfo.sex )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.metadata["Overall Status"] && datum.metadata["Overall Status"].value[0] )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.metadata["Diagnosis Age"] && datum.metadata["Diagnosis Age"].value[0] )) == null ? '' : __t) +
'</td>\n            <td>' +
((__t = ( datum.metadata["Diagnosis Age"] && datum.metadata["Diagnosis Age"].unit[0] )) == null ? '' : __t) +
'</td>\n        </tr>\n        ';
};
__p += '\n        ';
}) ;
__p += '\n        </tbody>\n    </table>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/datatype-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>' +
((__t = ( __("data-type-manager") )) == null ? '' : __t) +
'</h1>\n<h2>' +
((__t = ( dataType ? __("update-data-type") : __("create-data-type") )) == null ? '' : __t) +
'</h2>\n\n<div id="content"> \n\n    <form class="form-horizontal edit-datatype-form" role="form" data-parsley-validate>\n        <div id="schemaHeader">\n            <div class="form-group row">\n                <label for="schemaName" class="col-md-2 control-label">' +
((__t = ( __("name") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-6">\n                    <input text class="form-control" id="schemaName" name="schemaName" \n                    value="' +
((__t = ( dataType ? dataType.get('name') : '' )) == null ? '' : __t) +
'" placeholder="Data Type Name" required >\n                </div>\n                <label for="fileUpload" class="col-md-2 control-label">' +
((__t = ( __("file-upload") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-2">\n                    <input type="checkbox" id="fileUpload" name="fileUpload" value="fileUpload" \n                    ';
 if(dataType && dataType.get('schema').header.fileUpload) { ;
__p += ' checked="checked" ';
 } ;
__p += ' >\n                </div>\n            </div>\n            <div class="form-group row">\n                <label for="className" class="col-md-2 control-label">' +
((__t = ( __("class-template") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-4">\n                    <select class="form-control" id="classTemplate" name="classTemplate"></select>\n                </div>\n                <label for="parent" class="col-md-2 control-label">' +
((__t = ( __("parent") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-4">\n                    <select multiple class="form-control" id="parents" name="parents"></select>\n                </div>\n            </div>\n            <div class="form-group row">\n                <label for="description" class="col-md-2 control-label">' +
((__t = (__("description") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-10">\n                    <input text class="form-control" id="description" name="description" required \n                    value="' +
((__t = ( dataType ? dataType.get('schema').header.description : '' )) == null ? '' : __t) +
'" placeholder="Brief Description" >\n                </div>\n            </div>\n            <div class="form-group row">\n                <label for="version" class="col-md-2 control-label">' +
((__t = (__("version") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-2">\n                    <input text class="form-control" id="version" name="version" \n                    value="' +
((__t = ( dataType ? dataType.get('schema').header.version : '' )) == null ? '' : __t) +
'" placeholder="0.0.X">\n                </div>\n                <label for="ontology" class="col-md-2 control-label">' +
((__t = (__("ontology") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-6">\n                    <select class="form-control" id="ontology" name="ontology">\n                        <option value="" selected="true">Select an ontology to name metadata fields</option>\n                    </select>\n                </div>\n            </div>\n        </div> <!-- schemaHeader -->\n        <div id="schemaBody"></div>  \n        <div id="buttonbardiv" class="row text-center">\n                <div class="btn-group btn-group-margin">\n                    <input type="button" class="btn btn-info add-metadata-group" value="' +
((__t = (__('add-metadata-group') )) == null ? '' : __t) +
'" >\n                    <input type="submit" class="btn btn-primary" value="' +
((__t = (__('save-data-type') )) == null ? '' : __t) +
'" >\n                    ';
 if (dataType) { ;
__p += '\n                    <input type="hidden" id="id" name="id" value="' +
((__t = ( dataType.id )) == null ? '' : __t) +
'" />\n                    <button data-dataType-id="' +
((__t = ( dataType.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">' +
((__t = ( __("delete") )) == null ? '' : __t) +
'</button>\n                    ';
} ;
__p += '\n                </div>\n        </div>\n    </form>\n\n</div> <!--content -->\n';

}
return __p
};

this["JST"]["views/templates/datatype-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2>' +
((__t = ( __("data-type-list") )) == null ? '' : __t) +
'</h2> \n\n<div id="content">\n    <div class="row">\n        <div class="col-sm-12">\n            <div class="table-responsive">\n                <table class="table">\n                    <thead>\n                        <tr>\n                            <th>' +
((__t = ( __("name") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("class-template") )) == null ? '' : __t) +
'</th>\n                            <!--\n                            <th>' +
((__t = ( __("json-schema") )) == null ? '' : __t) +
'</th>\n                            -->\n                            <th>' +
((__t = ( __("parent") )) == null ? '' : __t) +
'</th>\n                            <th></th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                    ';
 _.each(dataTypes, function(dataType) { ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( dataType.get("name") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( dataType.get("classTemplate") )) == null ? '' : __t) +
'</td>\n                        <!--\n                        <td>' +
((__t = ( JSON.stringify(dataType.get("schema")) )) == null ? '' : __t) +
'</td>\n                        -->\n                        <td>' +
((__t = ( dataType.get("parents").map(function(parent) { return (" " + parent.name); }).toString().trim() )) == null ? '' : __t) +
'</td>\n                        <td><a class="btn" href="#/datatypes/edit/' +
((__t = ( dataType.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n                    </tr>\n                    ';
 }) ;
__p += ' \n                    </tbody>\n                </table>\n            </div>\n            <div id="buttonbardiv" class="row text-center">\n                <a href="#/datatypes/new" class="btn btn-primary">' +
((__t = ( __("new-data-type"))) == null ? '' : __t) +
'</a>\n            </div>\n        </div>\n    </div>\n</div>\n\n';

}
return __p
};

this["JST"]["views/templates/filemanager-dropzone.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="dz-default dz-message text-center">\n    <span>' +
((__t = ( __('drop-files-here') )) == null ? '' : __t) +
'</span>\n</div>\n<div class="fallback">\n    <input name="file" type="file">\n</div>\n';

}
return __p
};

this["JST"]["views/templates/group-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="group">\n   <script>\n        $(document).ready(function() { $("select#association").select2(); });\n        $(document).ready(function() { $("select#dissociation").select2(); });\n        $(document).ready(function() { $("select#associationop").select2(); });\n        $(document).ready(function() { $("select#dissociationop").select2(); });\n\n\n    </script>\n    \n<form name = "Myform" class="form-horizontal edit-group-form" role="form">\n    <legend class="legend"align="center">' +
((__t = ( group ? 'Edit' : 'New' )) == null ? '' : __t) +
' Group</legend>\n    <div class="form-group row">\n        <label  class="col-md-3 control-label">' +
((__t = ( __("name") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6" name="name" id="first" type="text" value="' +
((__t = ( group ? group.get('name') : '' )) == null ? '' : __t) +
'">\n        </div>\n        \n    <hr />\n    <div id="buttonbardiv" class="row text-center">\n         ';
 if(!group) { ;
__p += '\n        <button type="submit" class="btn" >Create Group</button>\n        ';
 } ;
__p += '\n\n        ';
 if(group) { ;
__p += '\n         <button id="update"type="hidden" class="btn update" name="update">Update Group</button>\n        <input type="hidden" name="id" value="' +
((__t = ( group.id )) == null ? '' : __t) +
'" />\n        <button data-group-id="' +
((__t = ( group.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">Delete</button>\n        ';
 }; ;
__p += '\n    </div>\n</form>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/group-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2 class="legend" align="center">' +
((__t = ( __("group-list") )) == null ? '' : __t) +
'</h2> \n<div id="list">\n    <div class="table-responsive">\n        <table class="table striped">\n            <thead> \n               \n                <tr>\n                    <th>' +
((__t = ( __("name") )) == null ? '' : __t) +
'</th>\n                                      <th></th>\n                </tr>\n            </thead>\n            <script type="text/css">\ntbody{\nbackground-color:blue;\n}\n</script>\n\n\n            <tbody>  ';
 _.each(groups, function(group) { ;
__p += ' \n            <tr>\n\n\n                <td class="group_val">' +
((__t = ( group.get("name") )) == null ? '' : __t) +
'</td>\n                               <td><a id="edit" class="btn" href="#/groups/edit/' +
((__t = ( group.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n                               <td><a id="edit" class="btn" href="#/groups/operator/' +
((__t = ( group.id )) == null ? '' : __t) +
'">' +
((__t = (__("member") )) == null ? '' : __t) +
'</a></td>\n                               <td><a id="edit" class="btn" href="#/groups/datatype/' +
((__t = ( group.id )) == null ? '' : __t) +
'">' +
((__t = (__("data-type") )) == null ? '' : __t) +
'</a></td>\n\n\n            </tr>\n            ';
 }) ;
__p += '\n            </tbody>\n        </table>\n    </div>\n    <div id="buttonbardiv" class="row text-center">\n        <a href="#/groups/new" class="btn btn-primary">' +
((__t = ( __("new-group"))) == null ? '' : __t) +
'</a>\n    </div>\n     </div>\n';

}
return __p
};

this["JST"]["views/templates/login.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h2 class="legend" align="center">' +
((__t = ( __("xtens-login") )) == null ? '' : __t) +
'</h2> \n<script>\n    $("#login").click(function(){\n        var username = $("#userName").val();\n        var password = $("#userPass").val();\n    \t var router = xtens.router; \n        \n        if (username && password) {\n           $.post( \'/login\',\n                {login: username, password:password},\n                function () {\n                   router.navigate(\'#/operators\',{trigger: true});            \n    }\n            ).fail(function(res){\n             alert("Error: " + res.responseJSON.error);\n            });\n        } else {\n            alert("A username and password is required");\n        }\n    });\n            </script>\n<form name = "LForm" id="form" class="form-horizontal login-form" role="form">\n\n<div id="log">\n        UserName <input name="user" type="text" id="userName" placeholder="Username"><br /><br />\n          Password : <input type="password" id="userPass" placeholder="Password"><br /><br/>   \n    </div>\n    <div class="row text-center">\n        <a id="login" class="btn btn-primary">' +
((__t = ( __("login"))) == null ? '' : __t) +
'</a>\n    </div>\n</form>\n';

}
return __p
};

this["JST"]["views/templates/metadatafield-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h4>\n    ';
 if (!component.name) {;
__p += '\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ';
} ;
__p += '\n    ' +
((__t = ( __("attribute") )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-third">\n            <label class="control-label">' +
((__t = ( __('type') )) == null ? '' : __t) +
'</label>\n            <select class="form-control input-sm field-type no-edit" name="fieldType">\n            </select>\n        </div>\n        <div class="metadataField-third">\n            <label class="control-label">' +
((__t = ( __('name') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control input-sm no-edit" placeholder="Field Name" name="name" required data-parsley-length="[2, 20]">\n        </div>\n        <div class="metadataField-third">\n            <label class="control-label">' +
((__t = ( __('custom-value') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control input-sm" placeholder="Custom Value" name="customValue">\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-sixth">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="required" value="required" class="no-edit">\n                ' +
((__t = (__('required') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-sixth">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="sensitive" value="sensitive" >\n                ' +
((__t = (__('sensitive') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-sixth">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="hasRange" value="hasRange" >\n                ' +
((__t = (__('hasRange') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-range">\n            <label class="control-label">' +
((__t = ( __('min') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control input-sm" name="min" placeholder="Minimum Value" data-parsley-type="number">\n        </div>\n        <div class="metadataField-range">\n            <label class="control-label">' +
((__t = ( __('max') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control input-sm" name="max" placeholder="Maximum Value" data-parsley-type="number">\n        </div>\n        <div class="metadataField-range">\n            <label class="control-label">' +
((__t = ( __('step') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control input-sm" name="step" placeholder="Step" data-parsley-type="number">\n        </div>\n\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-third">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="isList" value="isList" class="no-edit"> \n                ' +
((__t = (__('is-list') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-third">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="hasUnit" value="hasUnit" class="no-edit">\n                ' +
((__t = (__('has-units') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-third">\n            <label class="checkbox-inline">\n                <input type="checkbox" name="fromDatabaseCollection" value="fromDatabaseCollection" class="no-edit"> ' +
((__t = (__('has-database-connection') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-third">\n            <input type="hidden" name="possibleValues" class="form-control input-sm value-list">\n        </div>\n        <div class="metadataField-third">\n            <input type="hidden" name="possibleUnits" class="form-control input-sm unit-list">\n        </div>\n        <div class="metadataField-third">\n            <select class="form-control input-sm no-edit" name="dbCollection" name="dbCollection">\n            </select>\n        </div>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatafieldcheckbox-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="form-group metadataform-group">\n    <span class="metadata-label">' +
((__t = ( format(component.name) )) == null ? '' : __t) +
'</span>\n    <div class="metadata-value-div">\n        <input type="checkbox" name="fieldValue">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatafieldinput-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="form-group metadataform-group">\n    <span class="metadata-label">' +
((__t = ( format(component.name) )) == null ? '' : __t) +
'</span>\n    <div class="metadata-value-div">\n        <input text name="fieldValue" class="form-control" >\n    </div>\n    ';
 if (component.hasUnit) {;
__p += '\n    <div class="metadata-unit-div">\n        <select name="fieldUnit" class="form-control"></div>\n    </div>\n    ';
};
__p += '\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatafieldrange-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="metadataform-group">\n        <label class="metadata-label">' +
((__t = ( format(component.name) )) == null ? '' : __t) +
'</label>\n        <div class="metadata-value-div">\n            <input type="range" min="' +
((__t = ( component.min )) == null ? '' : __t) +
'" max="' +
((__t = ( component.max )) == null ? '' : __t) +
'" step="' +
((__t = ( component.step )) == null ? '' : __t) +
'" \n            name="fieldValue" class="form-control" >\n        </div>\n        ';
 if (component.hasUnit) {;
__p += '\n            <div class="metadata-unit-div">\n                <select name="fieldUnit" class="form-control"></div>\n            </div>\n        ';
};
__p += '\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatafieldselect-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class="form-group metadataform-group">\n    <label class="metadata-label">' +
((__t = ( format(component.name) )) == null ? '' : __t) +
'</label>\n    <div class="metadata-value-div">\n        <select name="fieldValue" class="form-control" ></select>\n    </div>\n    ';
 if (component.hasUnit) {;
__p += '\n    <div class="metadata-unit-div">\n        <select name="fieldUnit" class="form-control"></div>\n    </div>\n    ';
};
__p += '\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatagroup-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h4>\n    ';
 if (!component.name) {;
__p += '\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ';
} ;
__p += '\n    ' +
((__t = ( __("group") )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="form-group row">\n    <label for="groupName" class="col-xs-3 control-label">' +
((__t = ( __("metadata-group-name") )) == null ? '' : __t) +
'</label>\n    <div class="col-xs-9">\n        <input text class="form-control" name="name" placeholder="Metadata Group Name" required data-parsley-length"[2, 50]">\n    </div>\n</div>\n<div class=\'metadataGroup-body\'></div>\n<div class="row text-center">\n    <div class="btn-group btn-group-margin">\n        <input type="button" class="btn btn-default add-metadata-loop" value="' +
((__t = (__('add-loop') )) == null ? '' : __t) +
'">\n        <input type="button" class="btn btn-info add-metadata-field" value="' +
((__t = (__('add-attribute') )) == null ? '' : __t) +
'">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatagroup-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h4 class="metadatagroup-header">' +
((__t = ( component.name.toUpperCase() )) == null ? '' : __t) +
'</h4>\n<div class="metadatacomponent-body"></div>\n';

}
return __p
};

this["JST"]["views/templates/metadataloop-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h4>\n    ';
 if (!component.name) {;
__p += '\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ';
} ;
__p += '\n    ' +
((__t = ( __("loop") )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="form-group row">\n    <label class="col-xs-3 control-label">' +
((__t = ( __("metadata-loop-name") )) == null ? '' : __t) +
'</label>\n    <div class="col-xs-9">\n        <input text class="form-control" name="name" placeholder="Metadata Loop Name" required data-parsley-length="[2,32]">\n    </div>\n</div>\n<div class="metadataLoop-body"></div>\n<div class="row text-center">\n    <div class="btn-group btn-group-margin">\n        <input type="button" class="btn btn-info add-metadata-field" value="' +
((__t = (__('add-attribute') )) == null ? '' : __t) +
'">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadataloop-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h4 class="metadataloop-header">' +
((__t = ( component.name.toUpperCase() )) == null ? '' : __t) +
'</h4>\n<div class="metadataloop-body"></div>\n<div class="text-center">\n    <div class="btn-group btn-group-margin">\n        <input type="button" class="btn btn-info" value="' +
((__t = (__('add-loop') )) == null ? '' : __t) +
'">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/operator-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div id="operator">\n<script \n<script type = "text/javascript">\n$(\'#form\').parsley();\n</script>\n<script>\nvar picker = new Pikaday({ field: $(\'#datepicker\')[0]});\n</script>\n<form name = "Myform" id="form" class="form-horizontal edit-operator-form" role="form" data-parsley-trim-value ="true">\n    <legend class="legend"align="center">' +
((__t = ( operator ? 'Edit' : 'New' )) == null ? '' : __t) +
' Operator</legend>\n    <div class="form-group row">\n        <label  class="col-md-3 control-label">' +
((__t = ( __("first-name") )) == null ? '' : __t) +
'</label>\n        <input  class = "col-md-6" name="name" id="first" type="text" value="' +
((__t = ( operator ? operator.get('firstName') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("last-name") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6" name="surname" type="text" value="' +
((__t = ( operator ? operator.get('lastName') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("birth-date") )) == null ? '' : __t) +
'</label>\n         <input class = "col-md-6 date" name="date" type="text" id="datepicker" required="required" value="' +
((__t = ( operator ? operator.get('birthDate') :'' )) == null ? '' : __t) +
'">\n\n           </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</label>\n         ';
 if(!operator) { ;
__p += '\n        \n            <select class = "col-md-6" id="sex" name="sex" >\n                <option class="col-md-6" value="M" >' +
((__t = (__("m") )) == null ? '' : __t) +
'</option>\n                <option class="col-md-6" value="F">' +
((__t = (__("f") )) == null ? '' : __t) +
'</option>\n               \n             </select>\n       \n         ';
 } ;
__p += '\n          ';
 if(operator) { ;
__p += '\n        \n            <select class="col-md-6" id="sex" name="sex" >\n                ';
 if(operator.get('sex') == 'M') { ;
__p += '\n                <option class="col-md-6" value="M" selected >' +
((__t = (__("m") )) == null ? '' : __t) +
'</option>\n                <option class="col-md-6"value="F">' +
((__t = (__("f") )) == null ? '' : __t) +
'</option>\n                ';
 } else { ;
__p += '\n                 <option class="col-md-6" value="M" >' +
((__t = (__("m") )) == null ? '' : __t) +
'</option>\n                <option  class="col-md-6"value="F" selected>' +
((__t = (__("f") )) == null ? '' : __t) +
'</option>\n                ';
 } ;
__p += '     \n         </select>\n        \n         ';
 } ;
__p += '\n\n\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("email") )) == null ? '' : __t) +
'</label>\n        <input class ="col-md-6" name="email" type="email" value="' +
((__t = ( operator ? operator.get('email') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("login") )) == null ? '' : __t) +
'</label>\n        <input class="col-md-6" name="login" id="login" type="text" pattern = ".{3,}" value="' +
((__t = ( operator ? operator.get('login') : '' )) == null ? '' : __t) +
'">\n    </div>\n\n      ';
 if(!operator) { ;
__p += '\n         <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("password") )) == null ? '' : __t) +
'</label>\n        <input class="col-md-6" name="password" type="text" />\n    </div>\n     ';
 } ;
__p += '\n\n\n\n    <hr />\n    <div id="buttonbardiv" class="row text-center">\n         ';
 if(!operator) { ;
__p += '\n        <button type="submit" class="btn" >Create Operator</button>\n        ';
 } ;
__p += '\n\n        ';
 if(operator) { ;
__p += '\n         <button type="hidden" class="btn update" name="update">Update Operator</button>\n        <input type="hidden" name="id" value="' +
((__t = ( operator.id )) == null ? '' : __t) +
'" />\n        <button data-operator-id="' +
((__t = ( operator.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">Delete</button>\n        ';
 }; ;
__p += '\n    </div>\n</form>\n</div>\n\n\n\n';

}
return __p
};

this["JST"]["views/templates/operator-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2 class="legend" align="center">' +
((__t = ( __("operator-list") )) == null ? '' : __t) +
'</h2> \n<div id="list">\n    <div class="table-responsive">\n        <table class="table striped">\n            <thead> \n               \n                <tr>\n                    <th>' +
((__t = ( __("first-name") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("last-name") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("birth-date") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("email") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("login") )) == null ? '' : __t) +
'</th>\n                    <th></th>\n                </tr>\n            </thead>\n            <tbody>  ';
 _.each(operators, function(operator) { ;
__p += ' \n            <tr>\n\n\n                <td class="oper_val">' +
((__t = ( operator.get("firstName") )) == null ? '' : __t) +
'</td>\n                <td class="oper_val">' +
((__t = ( operator.get("lastName") )) == null ? '' : __t) +
'</td>  \n                <td class="oper_val">' +
((__t = ( moment(operator.get("birthDate")).format("DD/MM/YYYY") )) == null ? '' : __t) +
'</td>\n                <td class="oper_val">' +
((__t = ( operator.get("sex") )) == null ? '' : __t) +
'</td>\n                <td class="oper_val">' +
((__t = ( operator.get("email") )) == null ? '' : __t) +
'</td>\n                <td class="oper_val">' +
((__t = ( operator.get("login") )) == null ? '' : __t) +
'</td>\n                <td><a id="edit" class="btn" href="#/operators/edit/' +
((__t = ( operator.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n\n            \n          \n\n            </tr>\n            ';
 }) ;
__p += '\n            </tbody>\n        </table>\n    </div>\n    <div id="buttonbardiv" class="row text-center">\n        <a href="#/operators/new" class="btn btn-primary">' +
((__t = ( __("new-operator"))) == null ? '' : __t) +
'</a>\n    </div>\n     </div>\n';

}
return __p
};

this["JST"]["views/templates/personaldetails-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="form-group"></div>\n<div class="form-group metadataform-group">\n    <label for="givenName" class="data-label">' +
((__t = ( __('given-name') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <input text class="form-control" id="givenName" name="givenName"></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="surname" class="data-label">' +
((__t = ( __('surname') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <input text class="form-control" id="surname" name="surname"></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="notes" class="data-label">' +
((__t = ( __('birth-date') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <input type="date" class="form-control" id="birthDate" name="birthDate"></input>\n    </div>\n</div>\n<!--\n<div class="form-group metadataform-group">\n    <label for="notes" class="data-label">' +
((__t = ( __('sex') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <select class="form-control" id="sex" name="sex"></select>\n    </div>\n</div> -->\n';

}
return __p
};

this["JST"]["views/templates/query-builder-loop.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="form-group">\n    <span class="query-label">' +
((__t = ( __("loop-name") )) == null ? '' : __t) +
'</span>\n    <div class="query-field-div">\n        <select name="loop-name" class="form-control"></select>\n    </div>\n</div>\n<div class="query-loop-body"></div>\n';

}
return __p
};

this["JST"]["views/templates/query-builder.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h2>' +
((__t = ( __("query-builder") )) == null ? '' : __t) +
'</h2>\n<div id="content">\n    <form id="query-form" class="form-horizontal query-form" role="form">\n    </form>\n    <div id="buttonbardiv" class="row text-center">\n        <div class="btn-group btn-group-margin">\n            <input type="button" id="search" class="btn btn-primary" value="' +
((__t = (__('search') )) == null ? '' : __t) +
'" >\n        </div>\n    </div>\n    <div id="result-table" class="row"></div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/query-composite.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="form-group query-row">\n    <span class="query-label">' +
((__t = ( __("search-for:") )) == null ? '' : __t) +
'</span>\n    <div class="query-field-div">\n        <select name="pivot-data-type" class="form-control"></select>\n    </div>\n    <span class="query-label">' +
((__t = ( __("matching:"))) == null ? '' : __t) +
'</span>\n    <div class="query-field-div">\n        <select name="junction" class="form-control"></select>\n    </div>\n    <div class="btn-group">\n        <button name="add-field" type="button" class="btn btn-info hidden">' +
((__t = ( __("add-field") )) == null ? '' : __t) +
'</button>\n        <button name="add-loop" type="button" class="btn btn-info hidden">' +
((__t = ( __("add-loop-condition") )) == null ? '' : __t) +
'</button>\n        <button name="add-nested" type="button" class="btn btn-primary hidden">' +
((__t = ( __("add-nested-condition") )) == null ? '' : __t) +
'</button>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/query-generic-row.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span class="query-label">' +
((__t = ( __("field-name") )) == null ? '' : __t) +
'</span>\n<div class="query-field-div">\n    <select name="field-name" class="form-control"></select>\n</div>\n<div class="query-comparator">\n    <input name="comparator" type="hidden" class="form-control">\n</div>\n<div name="query-value-div" class="query-value-div"></div>\n<div class="query-unit-div">\n    <input name="unit" type="hidden" class="form-control">\n</div>\n\n';

}
return __p
};

this["JST"]["views/templates/query-personalinfo-fields.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="query-row form-group">\n    <span class="query-label">' +
((__t = ( __("surname") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="surname-comparator" class="form-control">\n    </div>\n    <div name="query-value-div" class="query-value-div">\n        <input text name="surname" class="form-control">\n    </div>\n    <span class="query-label">' +
((__t = ( __("given-name") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="given-name-comparator" class="form-control">\n    </div>\n    <div name="query-value-div" class="query-value-div">\n        <input text name="given-name" class="form-control">\n    </div>\n</div>\n<div class="query-row form-group">\n    <span class="query-label">' +
((__t = ( __("birth-date") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="birth-date-comparator" class="form-control">\n    </div>\n    <div name="bith-date-div" class="query-value-div">\n        <input text name="birth-date" class="form-control">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/query-sample-fields.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="query-row form-group">\n    <span class="query-label">' +
((__t = ( __("biobank-code") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="biobank-code-comparator" class="form-control">\n    </div>\n    <div name="code-div" class="query-value-div">\n        <input text name="biobank-code" class="form-control">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/query-subject-fields.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="query-row form-group">\n    <span class="query-label">' +
((__t = ( __("subject-code") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="code-comparator" class="form-control">\n    </div>\n    <div name="code-div" class="query-value-div">\n        <input text name="code" class="form-control">\n    </div>\n    <span class="query-label">' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</span>\n    <div class="query-comparator">\n        <input type="hidden" name="sex-comparator" class="form-control">\n    </div>\n    <div name="query-value-div" class="query-value-div">\n        <input type="hidden" name="sex" class="form-control">\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/sample-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>' +
((__t = ( __("sample-manager") )) == null ? '' : __t) +
'</h1>\n<h2>' +
((__t = ( data.id ? __("update-sample") : __("create-sample") )) == null ? '' : __t) +
'</h2>\n<div id="content">\n    <form class="form-horizontal edit-data-form" role="form">\n        <div class="form-group"></div>\n        <!-- Biobank Selection -->\n        <div class="form-group metadataform-group">\n            <label for="type" class="data-label">' +
((__t = ( __('biobank') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <select class="form-control" id="biobank" name="biobank"></select>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="biobank-code" class="data-label">' +
((__t = ( __('biobank-code') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <input text class="form-control" id="biobank-code" name="biobank-code"></input>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="type" class="data-label">' +
((__t = ( __('type') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <select class="form-control" id="type" name="type"></select>\n            </div>\n        </div>\n        ';
 if (data.get("donor")) {;
__p += '\n        <div class="form-group metadataform-group">\n            <label for="donor" class="data-label">' +
((__t = ( __('donor') )) == null ? '' : __t) +
'</label>\n            <span class="data-span">' +
((__t = ( data.get("donor").code )) == null ? '' : __t) +
'</span>\n        </div>\n        ';
} ;
__p += '\n        ';
 if (data.get("parentSample")) {;
__p += '\n        <div class="form-group metadataform-group">\n            <label for="parent-sample" class="data-label">' +
((__t = ( __('parent-sample') )) == null ? '' : __t) +
'</label>\n            <span class="data-span">' +
((__t = ( data.get("parentSample").biobankCode )) == null ? '' : __t) +
'</span>\n        </div>\n        ';
} ;
__p += '\n        <div id="buttonbardiv" class="row text-center">\n            <div class="btn-group btn-group-margin">\n                <input type="submit" id="save" class="btn btn-primary" data-target-route="samples" value="' +
((__t = (__('save') )) == null ? '' : __t) +
'" >\n                ';
 if (data) { ;
__p += '\n                <input type="hidden" id="id" name="id" value="' +
((__t = ( data.id )) == null ? '' : __t) +
'" />\n                <button data-data-id="' +
((__t = ( data.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">' +
((__t = ( __("delete") )) == null ? '' : __t) +
'</button>\n                ';
} ;
__p += '\n            </div>\n        </div>\n    </form>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/sample-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2>' +
((__t = ( __("samples") )) == null ? '' : __t) +
'</h2> \n\n<div id="content">\n    <div class="row">\n        <div class="col-sm-12">\n            <div class="table-responsive">\n                <table class="table">\n                    <thead>\n                        <tr>\n                            <th>' +
((__t = ( __("biobank") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("arrival-code") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("biobank-code") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("type") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("donor") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("diagnosis") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("anatomical-position"))) == null ? '' : __t) +
'</th>\n                            <th></th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                    ';
 _.each(samples, function(sample) { 
                    var metadata = sample.get("metadata") ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( sample.get("biobank") && sample.get("biobank").acronym )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( metadata.arrival_code && metadata.arrival_code.value )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( sample.get("biobankCode") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( sample.get("type").name )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( sample.get("donor") && sample.get("donor").code )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( metadata.diagnosis &&  metadata.diagnosis.value )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( metadata.anatomical_position && metadata.location.value )) == null ? '' : __t) +
'</td>\n                        <td>\n                            <a class="btn" href="' +
((__t = ( sample.get("editLink") )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a>\n                            ';
 if (sample.get("newDerivativeLink") && sample.get("newDerivativeLink").length > 0) {;
__p += '\n                            <a class="btn" href="' +
((__t = ( sample.get("newDerivativeLink") )) == null ? '' : __t) +
'">' +
((__t = (__("new-derivative-sample") )) == null ? '' : __t) +
'</a>\n                            ';
} ;
__p += '\n                            ';
 if (sample.get("newDataLink") && sample.get("newDataLink").length > 0) {;
__p += '\n                            <a class="btn" href="' +
((__t = ( sample.get("newDataLink") )) == null ? '' : __t) +
'">' +
((__t = ( __("new-data") )) == null ? '' : __t) +
'</a>\n                            ';
} ;
__p += '   \n                        </td>\n                    </tr>\n                    ';
 }) ;
__p += ' \n                    </tbody>\n                </table>\n            </div>\n            <div id="buttonbardiv" class="row text-center">\n                <a href="#/samples/new" class="btn btn-primary">' +
((__t = ( __("new-sample"))) == null ? '' : __t) +
'</a>\n            </div>\n        </div>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/subject-edit-partial.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="form-group"></div>\n<div class="form-group metadataform-group">\n    <label for="code" class="data-label">' +
((__t = ( __('code') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <input text class="form-control" id="code" name="code"></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="project" class="data-label">' +
((__t = ( __('project') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <select class="form-control" id="project" name="project"></select>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="tags" class="data-label">' +
((__t = ( __('tags') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <input type="hidden" class="form-control" id="tags" name="tags"></input>\n    </div>\n</div>\n<div class="form-group metadataform-group">\n    <label for="notes" class="data-label">' +
((__t = ( __('notes') )) == null ? '' : __t) +
'</label>\n    <div class="data-input-div">\n        <textarea class="form-control" id="notes" name="notes" rows="4"></textarea>\n    </div>\n</div>\n<div class="metadatacomponent-body"></div>\n';

}
return __p
};

this["JST"]["views/templates/subject-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h1>' +
((__t = ( __("subject-manager") )) == null ? '' : __t) +
'</h1>\n<h2>' +
((__t = ( data.id ? __("update-subject") : __("create-subject") )) == null ? '' : __t) +
'</h2>\n<div id="content">\n    <form class="form-horizontal edit-data-form" role="form">\n        <!--\n        <div class="form-group">\n            <label for="dataType" class="data-label">' +
((__t = ( __("select-a-data-type") )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <select class="form-control" id="dataType" name="dataType">\n                </select>\n            </div>\n        </div>\n        -->\n        <div id="personal-details" class="form-group text-center">\n            <button id="add-personal-details" class="btn btn-info">' +
((__t = ( __('add-personal-details') )) == null ? '' : __t) +
'</button>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="code" class="data-label">' +
((__t = ( __('code') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <input text class="form-control" id="code" name="code"></input>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="sex" class="data-label">' +
((__t = ( __('sex') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <input type="hidden" class="form-control" id="sex" name="sex"></select>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="project" class="data-label">' +
((__t = ( __('project') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <select multiple class="form-control" id="projects" name="projects"></select>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="tags" class="data-label">' +
((__t = ( __('tags') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <input type="hidden" class="form-control" id="tags" name="tags"></input>\n            </div>\n        </div>\n        <div class="form-group metadataform-group">\n            <label for="notes" class="data-label">' +
((__t = ( __('notes') )) == null ? '' : __t) +
'</label>\n            <div class="data-input-div">\n                <textarea class="form-control" id="notes" name="notes" rows="4"></textarea>\n            </div>\n        </div>\n        <div id="buttonbardiv" class="row text-center">\n            <div class="btn-group btn-group-margin">\n                <input type="submit" id="save" class="btn btn-primary" value="' +
((__t = (__('save') )) == null ? '' : __t) +
'" >\n                ';
 if (data) { ;
__p += '\n                <input type="hidden" id="id" name="id" value="' +
((__t = ( data.id )) == null ? '' : __t) +
'" />\n                <button data-data-id="' +
((__t = ( data.id )) == null ? '' : __t) +
'" class="btn btn-danger delete">' +
((__t = ( __("delete") )) == null ? '' : __t) +
'</button>\n                ';
} ;
__p += '\n            </div>\n        </div>\n    </form>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/subject-list.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h2>' +
((__t = ( __("subject-list") )) == null ? '' : __t) +
'</h2> \n\n<div id="content">\n    <div class="row">\n        <div class="col-sm-12">\n            <div class="table-responsive">\n                <table class="table">\n                    <thead>\n                        <tr>\n                            <th>' +
((__t = ( __("code") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("given-name") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("surname") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("birth-date") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</th>\n                            <th>' +
((__t = ( __("project") )) == null ? '' : __t) +
'</th>\n                            <th></th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                    ';
 _.each(subjects, function(subject) { ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( subject.get("code") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( subject.get("personalInfo").givenName )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( subject.get("personalInfo").surname )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( subject.get("personalInfo").birthDate )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( subject.get("sex") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( subject.get("projects").map(function(project) {return (" " + project.name); }).toString().trim() )) == null ? '' : __t) +
'</td>\n                        <td>\n                            <a class="btn" href="' +
((__t = ( subject.get("editLink") )) == null ? '' : __t) +
'" >' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a>\n                            ';
 if (subject.get("newSampleLink") && subject.get("newSampleLink").length) {;
__p += '\n                                <a class="btn" href="' +
((__t = ( subject.get("newSampleLink") )) == null ? '' : __t) +
'">' +
((__t = (__("new-sample") )) == null ? '' : __t) +
'</a>\n                            ';
} ;
__p += '\n                            ';
 if (subject.get("newDataLink") && subject.get("newDataLink").length) {;
__p += '\n                                <a class="btn" href="' +
((__t = ( subject.get("newDataLink") )) == null ? '' : __t) +
'">' +
((__t = (__("new-data") )) == null ? '' : __t) +
'</a>\n                            ';
} ;
__p += '   \n                        </td>\n                    </tr>\n                    ';
 }) ;
__p += ' \n                    </tbody>\n                </table>\n            </div>\n            <div id="buttonbardiv" class="row text-center">\n                <a href="#/subjects/new" class="btn btn-primary">' +
((__t = ( __("new-subject"))) == null ? '' : __t) +
'</a>\n            </div>\n        </div>\n    </div>\n</div>\n\n';

}
return __p
};