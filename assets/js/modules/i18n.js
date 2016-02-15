(function(xtens, i18n) {

    var en = {
        "welcome": "Welcome",
        // menu
        "data-types": "Data Types",
        "data": "Data",
        "customised-data": "Customised Data",
        "subjects": "Subjects",
        "samples": "Samples",
        // views/templates/datatype-list.ejs
        "id":"ID",
        // views/templates/datatype-edit.ejs
        "please-select": "Please Select",
        "data-type-manager": "Data Type Manager",
        "create-data-type": "Create data type",
        "update-data-type": "Update data type",
        "data-type": "Data Type",
        "name": "Name",
        "file-upload": "File Upload",
        "yes": "YES",
        "no": "NO",
        "model": "Model",
        "class-template": "Class Template", //TODO
        "parent": "Parent",
        "description": "Description",
        "version": "Version",
        "ontology": "Ontology",
        "select-an-ontology-to-name-metadata-fields": "Select an ontology to name metadata fields",
        "add-metadata-group": "Add Metadata Group",
        "save-data-type": "Save Data Type",
        "delete": "Delete",
        "metadata-group-name": "Metadata Group Name",
        "metadata-loop-name": "Metadata Loop Name",
        // assets/js/modules/DataType.js --> DataType.Model
        "please-add-at-least-a-metadata-group": "Please add at least a Metadata Group",
        "please-add-at-least-a-metadata-field": "Please add at least a Metadata Field",
        "data-type-has-the-following-duplicate-names": "Datatype has the following duplicate names",
        // views/templates/metadatafield-edit.ejs
        "type": "Type",
        "required": "Required",
        "visible": "Visible",
        "case-insensitive": "Case Insensitive",
        "display-name": "Display Name",
        "sensitive": "Sensitive",
        "hasRange": "Has Range",
        "custom-value": "Custom Value",
        "is-list": "Is List",
        "has-units": "Has Units",
        "add-value": "Add Value",
        "add-unit": "Add Unit",
        "has-database-connection": "Has Controlled Terminology",
        "db-table": "DB Table",
        "min": "Min",
        "max": "Max",
        "step": "Step",
        "schema": "Schema",
        "json-schema": "JSON Schema",
        "new-data-type": "New Data Type",
        "edit": "Edit",
        "group": "Group",
        "loop": "Loop",
        "add-attribute": "Add Attribute",
        "add-loop": "Add Loop",
        "attribute": "Attribute",
        "new-operator" : "New Operator",
        "first-name" : "First Name",
        "last-name": "Last Name",
        "birth-date": "Birth Date",
        "sex" : "Sex",
        "email" : "Email",
        "login" : "Login",
        "password" : "Password",
        "operator-list" : "Operator List",
        "create-a-new-operator" : "Create a New Operator",
        "save-operator" : "Save Operator",
        "m" : "M",
        "f" : "F",
        "group-list": "Group List",
        "new-group": "New Group",
        "xtens-login":"XTENS Login",
        /* views/templates/login.ejs */
        "username": "Username",
        "sign-in": "Sign in",
        "wrong-username-and-or-password!": "Wrong username and/or password!",
        /* view/templates/menu-bar.ejs */
        "admin-management": "Admin Management",
        "groups": "Groups",
        "operators": "Operators",
        "data-management": "Data Management",
        "search": "Search",
        "advanced-search": "Advanced Search",
        "logout": "Logout",
        /* views/templates/data-edit.ejs */
        "data-manager": "Data Manager",
        "select-a-data-type": "Select a Data Type",
        "create-data": "Create Data",
        "update-data": "Update Data",
        "subject": "Subject",
        "sample": "Sample",
        /* views/templates/data-edit-partial.ejs */
        "date": "Date",
        "tags": "Tags/Keywords",
        "notes": "Notes",
        "save": "Save",
        /* views/templates/... */
        "associate-datatype":"Associate a Datatype",
        "dissociate-datatype":"Dissociate a Datatype",
        /* views/templates/group-list.ejs */
	"member":"Member",
        /* views/templates/group-edit.ejs */
        "privilege-level": "Privilege Level",
        "can-access-personal-data": "Can Access Personal Data",
        "can-access-sensitive-data": "Can Access Sensitive Data",
        "save-group": "Save Group",
        /*views/templates/association.ejs */
        "associated":"Associated",
        "no-associated":"Not Associated",
        /* views/templates/data-list.ejs */
        "data-list": "Data List",
        "data-details": "Data Details",
        "missing-value": "Missing Value",
        "metadata": "Metadata",
        "new-data": "New Data",
        /* views/templates/personal-details-edit.ejs */
        "given-name": "Name",
        "surname": "Surname",
        /* views/templates/subject-list */
        "subject-list": "Subject List",
        "new-subject": "New Subject",
        /* views/templates/subject-edit.ejs */
        "subject-manager": "Subject Manager",
        "create-subject": "Create Subject",
        "update-subject": "Update Subject",
        "add-personal-details": "Add Personal Details",
        /* views/templates/subject-edit-partial.ejs */
        "code": "Code",
        "project": "Project",
        /* views/templates/sample-edit.ejs */
        "sample-manager": "Sample Manager",
        "create-sample": "Create Sample",
        "update-sample": "Update Sample",
        "biobank": "Biobank",
        "biobank-code": "Biobank Code",
        "material-type": "Material Type",
        "donor": "Donor",
        "parent-sample": "Parent Sample",
        /* views/templates/sample-list */
        "new-sample": "New Sample",
        "diagnosis": "Diagnosis",
        "arrival-code": "Arrival Code",
        "anatomical-position": "Anatomical Position",
        "new-derivative-sample": "New Derivative Sample",
        /* view/templates/biobank-edit */
        "biobanks": "Biobanks",
        "new-biobank": "New Biobank",
        /* view/templates/biobank-edit */
        "biobank-manager": "Biobank Manager",
        "create-biobank": "Create Biobank",
        "update-biobank": "Update Biobank",
        "delete-biobank": "Delete Biobank",
        "biobank-ID": "Biobank ID",
        "biobank-name": "Biobank Name",
        "biobank-acronym": "Biobank Acronym",
        "biobank-url": "Biobank URL",
        "juristic-person": "Juristic Person",
        "save-biobank": "Save Biobank",
        /* view/templates/contactinformation-edit.js */
        "contact-information": "Contact Information",
        "phone": "Phone",
        "address": "Address",
        "zip": "ZIP Code",
        "city": "City",
        "country": "Country",
        /* views/templates/query.ejs */
        "query-builder": "Query Builder",
        "search-for:": "Search for:",
        "matching:": "Matching:",
        "all-conditions": "All Conditions",
        "any-of-the-conditions": "Any of the Conditions",
        "field-name": "Field Name",
        "loop-name": "Loop Name",
        "add-field": "Add Field",
        "add-loop-condition": "Add Loop Condition",
        "add-nested-condition": "Add Nested Condition",
        /* views/templates/data-table.ejs */
	"overall-status": "Overall Status",
        "diagnosis-age": "Diagnosis Age",
        "diagnosis-age-unit": "D.A. Unit",
        /* views/templates/query-subject-fields.ejs */
        "subject-code": "Subject Code",
        /* views/templates/filemanager-dropzone.ejs */
        "drop-files-here": "Drop files here",
        /* views/templates/dialog-bootstrap.ejs */
        "close": "Close",
        "default-title": "Default Title",
        "default-body": "Default Body",
        /* assets/js/modules/Query.js */
        "no-result-found": "No Result Found",
        "no-data-was-found-to-match-your-search-options": "No data was found to match your search options.",
        "please-try-again-with-different-parameters": "Please try again with different parameters",
        "please-wait-for-query-to-complete": "Please wait for query to complete",
        "the-query-is-not-correctly-composed": "The query is not correctly composed.",
        "please-check-it-and-submit-it-again": "Please check it and submit it again.",
        /* views/templates/xtenstable-buttongroup.ejs  */
        "files": "Files",
        "derived-samples": "Derived Samples",
        "derived-data": "Derived Data",
        "view-parameters":"View Parameters",
        /* assets/js/modules/XtensTable.js */
        "actions": "Actions",
        /* assets/js/modules/FileManager.js */
        "file-successfully-uploaded": "File Successfully Uploaded!",
        "the-file": "The file",
        "has-been-successfully-uploaded": "has beeen successfully uploaded.",
        /* views/templates/datafile-list.ejs */
        "file-list" : "File List",
        "download": "Download",
        /* assets/js/modules/DataFile.js */
        "could-not-download-file": "Could Not Download File",
        /* views/templates/datatypeprivileges-list.ejs */
        "data-type-name": "Data Type Name",
        "new-data-type-privilege": "New Data Type Privilege",
        /* views/templates/data-list.ejs */
        "details": "Details",
        /* views/templates/dedicated-data-management */
        "customised-data-management": "Customised Data Management",
        /* assets/js/modules/Data.js */
        "ok": "OK",
        "data-correctly-stored-on-server": "Data correctly stored on server",
        "please-wait-for-data-registration-to-complete": "Please wait for data registration to complete"
    };

    var it = {

    };

    i18n.en = function(key) {
        return en[key];
    };

} (xtens, xtens.module("i18n")));
