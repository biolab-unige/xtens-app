this["JST"] = this["JST"] || {};

this["JST"]["views/templates/datatype-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h2>' +
((__t = ( __("create-a-new-data-type") )) == null ? '' : __t) +
'</h2>\n\n<div id="content"> \n\n    <form class="form-horizontal edit-datatype-form" role="form">\n        <div class="form-group" id="schemaContainer">\n            <div class="form-group row">\n                <label for="schemaName" class="col-md-2 control-label">' +
((__t = ( __("name") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-6">\n                    <input text class="form-control" id="schemaName" name="schemaName" placeholder="Data Type Name">\n                </div>\n                <label for="fileUpload" class="col-md-2 control-label">' +
((__t = ( __("file-upload") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-2">\n                    <select class="form-control" id="fileUpload" name="fileUpload">\n                        <option value="Y" selected="true">' +
((__t = (__("yes") )) == null ? '' : __t) +
'</option>\n                        <option value="N">' +
((__t = (__("no") )) == null ? '' : __t) +
'</option>\n                    </select>\n                </div>\n            </div>\n            <div class="form-group row">\n                <label for="description" class="col-md-2 control-label">' +
((__t = (__("description") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-10">\n                    <input text class="form-control" id="description" name="description" placeholder="Brief Description">\n                </div>\n            </div>\n            <div class="form-group row">\n                <label for="version" class="col-md-2 control-label">' +
((__t = (__("version") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-2">\n                    <input text class="form-control" id="version" name="version" placeholder="0.0.X">\n                </div>\n                <label for="ontology" class="col-md-2 control-label">' +
((__t = (__("ontology") )) == null ? '' : __t) +
'</label>\n                <div class="col-md-6">\n                    <select class="form-control" id="ontology" name="ontology">\n                        <option value="" selected="true">Select an ontology to name metadata fields</option>\n                    </select>\n                </div>\n            </div>\n        </div> <!-- schemaContainer -->  \n        <div id="buttonbardiv" class="row text-center">\n            <input type="button" class="btn btn-default add-metadata-group" value="' +
((__t = (__('add-metadata-group') )) == null ? '' : __t) +
'" >\n            <input type="submit" class="btn btn-primary" value="' +
((__t = (__('save-data-type') )) == null ? '' : __t) +
'" >\n        </div>\n    </form>\n\n</div> <!--content -->\n';

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
'</h2> \n\n<div id="content">\n    <div class="table-responsive">\n        <table class="table striped">\n            <thead>\n                <tr>\n                    <th>' +
((__t = ( __("name") )) == null ? '' : __t) +
'</th>\n                    <th>' +
((__t = ( __("json-schema") )) == null ? '' : __t) +
'</th>\n                    <th></th>\n                </tr>\n            </thead>\n            <tbody>\n                ';
 _.each(dataTypes, function(dataType) { ;
__p += ' \n                    <tr>\n                        <td>' +
((__t = ( dataType.get("name") )) == null ? '' : __t) +
'</td>\n                        <td>' +
((__t = ( JSON.stringify(dataType.get("schema")) )) == null ? '' : __t) +
'</td>\n                        <td><a class="btn" href="#/datatypes/edit/' +
((__t = ( dataType.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n                    </tr>\n                ';
 }) ;
__p += ' \n            </tbody>\n        </table>\n    </div>\n    <div id="buttonbardiv" class="row text-center">\n        <a href="#/datatypes/new" class="btn btn-primary">' +
((__t = ( __("new-data-type"))) == null ? '' : __t) +
'</a>\n    </div>\n</div>\n\n';

}
return __p
};

this["JST"]["views/templates/group-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '\n<div id="group"> \n<form name = "Myform" class="form-horizontal edit-group-form" role="form">\n    <legend class="legend"align="center">' +
((__t = ( group ? 'Edit' : 'New' )) == null ? '' : __t) +
' Group</legend>\n    <div class="form-group row">\n        <label  class="col-md-3 control-label">' +
((__t = ( __("name") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6" name="name" id="first" type="text" value="' +
((__t = ( group ? group.get('name') : '' )) == null ? '' : __t) +
'">\n    </div>\n   \n    <hr />\n    <div id="buttonbardiv" class="row text-center">\n         ';
 if(!group) { ;
__p += '\n        <button type="submit" class="btn" >Create Group</button>\n        ';
 } ;
__p += '\n\n        ';
 if(group) { ;
__p += '\n         <button type="hidden" class="btn update" name="update">Update Group</button>\n        <input type="hidden" name="id" value="' +
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
'</h2> \n\n<div id="list">\n    <div class="table-responsive">\n        <table class="table striped">\n            <thead> \n               \n                <tr>\n                    <th>' +
((__t = ( __("name") )) == null ? '' : __t) +
'</th>\n                                      <th></th>\n                </tr>\n            </thead>\n            <tbody>  ';
 _.each(groups, function(group) { ;
__p += ' \n            <tr>\n\n\n                <td class="group_val">' +
((__t = ( group.get("name") )) == null ? '' : __t) +
'</td>\n                               <td><a id="edit" class="btn" href="#/groups/edit/' +
((__t = ( group.id )) == null ? '' : __t) +
'">' +
((__t = (__("edit") )) == null ? '' : __t) +
'</a></td>\n            </tr>\n            ';
 }) ;
__p += '\n            </tbody>\n        </table>\n    </div>\n    <div id="buttonbardiv" class="row text-center">\n        <a href="#/groups/new" class="btn btn-primary">' +
((__t = ( __("new-group"))) == null ? '' : __t) +
'</a>\n    </div>\n     </div>\n';

}
return __p
};

this["JST"]["views/templates/metadatafield-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<h4>\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ' +
((__t = ( __("attribute") )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-half">\n            <label class="control-label">' +
((__t = ( __('type') )) == null ? '' : __t) +
'</label>\n            <select class="form-control field-type">\n                ';
 _.each(fieldTypes, function(fieldType) {
                ;
__p += '\n                <option value="';
 fieldType ;
__p += '">' +
((__t = ( fieldType.toUpperCase() )) == null ? '' : __t) +
'</option>\n                ';

                }) ;
__p += '\n            </select>\n        </div>\n\n        <div class="metadataField-half">\n            <label class="control-label">' +
((__t = ( __('name') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control" placeholder="Field Name" value="">\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-half">\n            <label class="control-label">' +
((__t = ( __('custom-value') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control" placeholder="Custom Value" value="">\n        </div>\n        <div class="metadataField-half">\n            <label class="checkbox-inline">\n                <input type="checkbox" value="required">' +
((__t = (__('required') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-half">\n            <label class="checkbox-inline">\n                <input type="checkbox" value="isList">' +
((__t = (__('is-list') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="metadataField-half">\n            <label class="checkbox-inline">\n                <input type="checkbox" value="hasUnit">' +
((__t = (__('has-units') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n    </div>\n</div>\n\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="col-md-3 col-md-offset-1">\n            <div class="text-center">\n                <input text class="form-control value-to-add" placeholder="" value="">\n            </div>\n        </div>\n        <div class="col-md-2">\n            <div class="text-center">\n                <button type="button" class="btn btn-primary btn-sm add-value-to-list">' +
((__t = (__('add-value') )) == null ? '' : __t) +
'</button>\n            </div>\n        </div>\n\n        <div class="col-md-3 col-md-offset-1">\n            <div class="text-center">\n                <input text class="form-control unit-to-add" placeholder="" value="">\n            </div>\n        </div>\n        <div class="col-md-2">\n            <div class="text-center">\n                <button type="button" class="btn btn-primary btn-sm add-unit-to-list">' +
((__t = (__('add-unit') )) == null ? '' : __t) +
'</button>\n            </div>\n        </div> \n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="col-md-3 col-md-offset-1">\n            <select multiple class="form-control value-list"></select>\n        </div>\n        <div class="col-md-3 col-md-offset-3">\n            <select multiple class="form-control unit-list"></select>\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="col-md-4 col-md-offset-1">\n            <label class="checkbox-inline">\n                <input type="checkbox" value="hasDbTableConnection">' +
((__t = (__('has-database-connection') )) == null ? '' : __t) +
'\n            </label>\n        </div>\n        <div class="col-md-4 col-md-offset-2">\n            <label class="control-label">' +
((__t = (__('db-table') )) == null ? '' : __t) +
'</label>\n            <select class="form-control">\n                <option selected value="">' +
((__t = ( __('please-select') )) == null ? '' : __t) +
'</opt>\n            </select>\n        </div>\n    </div>\n</div>\n<div class="metadataField-formgroup">\n    <div class="metadataField-row">\n        <div class="metadataField-half">\n            <label class="control-label">' +
((__t = ( __('min') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control" placeholder="Minimum Value" value="">\n        </div>\n        <div class="metadataField-half">\n            <label class="control-label">' +
((__t = ( __('max') )) == null ? '' : __t) +
'</label>\n            <input text class="form-control" placeholder="Maximum Value" value="">\n        </div>\n    </div>\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadatagroup-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h4>\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ' +
((__t = ( __("group") + " " + id )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="form-group row">\n    <label for="groupName" class="col-xs-3 control-label">' +
((__t = ( __("metadata-group-name") )) == null ? '' : __t) +
'</label>\n    <div class="col-xs-9">\n        <input text class="form-control" id="groupName" name="groupName" placeholder="Metadata Group Name">\n    </div>\n</div>\n<div class=\'metadataGroup-body\'></div>\n<div class="row text-center">\n    <input type="button" class="btn btn-default add-metadata-loop" value="' +
((__t = (__('add-loop') )) == null ? '' : __t) +
'">\n    <input type="button" class="btn btn-default add-metadata-field" value="' +
((__t = (__('add-attribute') )) == null ? '' : __t) +
'">\n</div>\n';

}
return __p
};

this["JST"]["views/templates/metadataloop-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h4>\n    <a class="remove-me">\n        <span class="fa fa-times-circle"></span>\n    </a>\n    ' +
((__t = ( __("loop") )) == null ? '' : __t) +
'\n    </br>\n</h4>\n<div class="metadataLoop-body"></div>\n<div class="row text-center">\n    <input type="button" class="btn btn-default add-metadata-field" value="' +
((__t = (__('add-attribute') )) == null ? '' : __t) +
'">\n</div>\n';

}
return __p
};

this["JST"]["views/templates/operator-edit.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '\n<div id="operator"> \n<form name = "Myform" class="form-horizontal edit-operator-form" role="form">\n    <legend class="legend"align="center">' +
((__t = ( operator ? 'Edit' : 'New' )) == null ? '' : __t) +
' Operator</legend>\n    <div class="form-group row">\n        <label  class="col-md-3 control-label">' +
((__t = ( __("first-name") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6" name="name" id="first" type="text" value="' +
((__t = ( operator ? operator.get('firstName') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("last-name") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6" name="surname" type="text" value="' +
((__t = ( operator ? operator.get('lastName') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("birth-date") )) == null ? '' : __t) +
'</label>\n        <input class = "col-md-6 date" name="date" type="date" required="required" value="' +
((__t = ( operator ? operator.get("birthDate").slice(0,9) +  (parseInt(operator.get("birthDate").slice(9,10))+1): '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("sex") )) == null ? '' : __t) +
'</label>\n         ';
 if(!operator) { ;
__p += '\n        \n            <select class="col-md-6" id="sex" name="sex" >\n                <option class="col-md-6" value="M" >' +
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
'</label>\n        <input class="col-md-6" name="login" type="text" value="' +
((__t = ( operator ? operator.get('login') : '' )) == null ? '' : __t) +
'">\n    </div>\n    <div class="form-group row">\n        <label class="col-md-3 control-label">' +
((__t = ( __("group") )) == null ? '' : __t) +
'</label>\n            <input class="col-md-6" name="group" type="text" value="' +
((__t = ( operator ? operator.get('groups') : '' )) == null ? '' : __t) +
'">\n            </div>\n            \n    ';
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
__p += '\n    </div>\n</form>\n</div>\n\n';

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
'</h2> \n\n<div id="list">\n    <div class="table-responsive">\n        <table class="table striped">\n            <thead> \n               \n                <tr>\n                    <th>' +
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
'</td>\n                <td class="oper_val">' +
((__t = ( operator.get("birthDate").slice(0,9) +  (parseInt(operator.get("birthDate").slice(9,10))+1))) == null ? '' : __t) +
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
'</a></td>\n\n\n\n\n            </tr>\n            ';
 }) ;
__p += '\n            </tbody>\n        </table>\n    </div>\n    <div id="buttonbardiv" class="row text-center">\n        <a href="#/operators/new" class="btn btn-primary">' +
((__t = ( __("new-operator"))) == null ? '' : __t) +
'</a>\n    </div>\n     </div>\n';

}
return __p
};