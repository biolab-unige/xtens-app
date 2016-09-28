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
        "datatype-deleted": "Datatype Deleted",
        "datatype-will-be-permanently-deleted-are-you-sure": "Datatype will be permanently deleted. Are you sure?",
        'datatype-correctly-stored-on-server': "Datatype correctly stored on server",
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
        "management": "Management",
        "super-user": "Super User",
        "manager":"Manager",
        "standard":"Standard",
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
        /* views/templates/operator-edit.ejs */
        "operator-manager": "Operator Manager",
        "create-operator": "Create Operator",
        "save-operator" : "Save Operator",
        "update-operator" : "Update Operator",
        "operator-deleted": "Operator Deleted",
        "operator-will-be-permanently-deleted-are-you-sure": "Operator will be permanently deleted. Are you sure?",
        'operator-correctly-stored-on-server': "Operator correctly stored on server",
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
        "group-deleted": "Group Deleted",
        "group-will-be-permanently-deleted-are-you-sure": "Group will be permanently deleted. Are you sure?",
        'group-correctly-stored-on-server': "Group correctly stored on server",
        /*views/templates/association.ejs */
        "associated":"Associated",
        "no-associated":"Not Associated",
        /* views/templates/data-list.ejs */
        "data-list": "Data List",
        "data-details": "Data Details",
        "missing-value": "Missing Value",
        "metadata": "Metadata",
        "new-data": "New Data",
        "datatype-graph": "DataType Graph",
        /* views/templates/personal-details-edit.ejs */
        "given-name": "Name",
        "surname": "Surname",
        /* views/templates/subject-details */
        "subject-details":"Subject Details",
        /* views/templates/subject-list */
        "subject-list": "Subject List",
        "new-subject": "New Subject",
        "more-data": "More Data",
        /* views/templates/subject-edit.ejs */
        "subject-manager": "Subject Manager",
        "create-subject": "Create Subject",
        "update-subject": "Update Subject",
        "add-personal-details": "Add Personal Details",
        "subject-deleted": "Subject Deleted",
        "subject-will-be-permanently-deleted-are-you-sure": "Subject will be permanently deleted. Are you sure?",
        "subject-correctly-stored-on-server": "Subject correctly stored on server",
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
        "edit-donor": "Edit Donor",
        "parent-sample": "Parent Sample",
        "sample-deleted": "Sample Deleted",
        'sample-correctly-stored-on-server': "Sample correctly stored on server",
        "sample-will-be-permanently-deleted-are-you-sure": "Sample will be permanently deleted. Are you sure?",
        /* views/templates/sample-list */
        "new-sample": "New Sample",
        "diagnosis": "Diagnosis",
        "arrival-code": "Arrival Code",
        "anatomical-position": "Anatomical Position",
        "new-derivative-sample": "New Derivative Sample",
        /* view/templates/biobank-edit */
        "biobanks": "Biobanks",
        "new-biobank": "New Biobank",
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
        "biobank-deleted": "Biobank Deleted",
        "biobank-will-be-permanently-deleted-are-you-sure": "Biobank will be permanently deleted. Are you sure?",
        'biobank-correctly-stored-on-server': "Biobank correctly stored on server",
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
        /* views/templates/datatypeprivileges-edit.ejs */
        "privilege-deleted": "Privilege Deleted",
        "privilege-will-be-permanently-deleted-are-you-sure": "Privilege will be permanently deleted. Are you sure?",
        'privilege-correctly-stored-on-server': "Privilege correctly stored on server",
        /* views/templates/data-list.ejs */
        "details": "Details",
        /* views/templates/dedicated-data-management */
        "customised-data-management": "Customised Data Management",
        /* assets/js/modules/Data.js */
        "ok": "OK",
        "confirm-deletion": "CONFIRM DELETION",
        "data-deleted": "Data Deleted",
        "data-will-be-permanently-deleted-are-you-sure": "Data will be permanently deleted. Are you sure?",
        "data-correctly-stored-on-server": "Data correctly stored on server",
        "please-wait-for-data-registration-to-complete": "Please wait for data registration to complete",
        /* views/templates/update-password.ejs */
        "update-password" : "Update Password",
        "old-password": "Old Password",
        "new-password-at-least": "New Password (At Least 8 Characters)",
        "cnew-password": "Confirm New Password",
        "change-password": "Change Password",
        "password-correctly-changed-on-server": "Password correctly changed on server"


    };

    var it = {};

    i18n.en = function(key) {
        return en[key];
    };

} (xtens, xtens.module("i18n")));
