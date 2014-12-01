(function(xtens, i18n) {

    var en = {
        "welcome": "Welcome",
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
        "class-template": "Class Template",
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
        // views/templates/metadatafield-edit.ejs
        "type": "Type",
        "required": "Required",
        "sensitive": "Sensitive",
        "hasRange": "Has Range",
        "custom-value": "Custom Value",
        "is-list": "Is List",
        "has-units": "Has Units",
        "add-value": "Add Value",
        "add-unit": "Add Unit",
        "has-database-connection": "Has Database Connection",
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
        /*views/templates/group-list.ejs */
	"member":"Member",
        /*views/templates/association.ejs */
        "associated":"Associated",
        "no-associated":"Not Associated",
        /* views/templates/data-list.ejs */
        "data-list": "Data List",
        "metadata": "Metadata",
        "new-data": "New Data",
        /* views/templates/personal-details-edit.ejs */
        "given-name": "Given Name",
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
        "biobank-code": "Biobank Code",
        "material-type": "Material Type",
        "donor": "Donor",
        "parent-sample": "Parent Sample",
        /* views/templates/sample-list */
        "samples": "Samples",
        "new-sample": "New Sample",
        "diagnosis": "Diagnosis",
        "arrival-code": "Arrival Code",
        "anatomical-position": "Anatomical Position",
        "new-derivative-sample": "New Derivative Sample",
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
        "search": "Search",
        /* views/templates/data-table.ejs */
	"overall-status": "Overall Status",
        "diagnosis-age": "Diagnosis Age",
        "diagnosis-age-unit": "D.A. Unit",
        /* views/templates/query-subject-fields.ejs */
        "subject-code": "Subject Code",
        /* views/templates/filemanager-dropzone.ejs */
        "drop-files-here": "Drop files here"
    };

    var it = {

    };

    i18n.en = function(key) {
        return en[key];
    };

} (xtens, xtens.module("i18n")));
