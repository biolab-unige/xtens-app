// TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway

(function(xtens, XtensConstants) {

    XtensConstants.Constants = {
        DATA: 'DATA',
        DATA_TYPE: 'DATA TYPE',
        METADATA_FIELD: 'METADATA FIELD',
        METADATA_LOOP: 'METADATA LOOP',
        METADATA_GROUP: 'METADATA GROUP',
        STRING: 'string',
        PERSONAL_DETAILS: 'Personal Details',
        SUBJECT_PROPERTIES: ['code', 'sex'],
        SAMPLE_PROPERTIES: ['biobank', 'biobankCode'],
        PATH_SEPARATOR: '/'  // path separator for Unix-like systems
    };

    XtensConstants.DataTypeClasses = {
        SUBJECT: 'Subject',
        SAMPLE: 'Sample',
        GENERIC: 'Data',
        DATA: 'Data'
    };

    XtensConstants.FieldTypes = {
        TEXT: 'Text',
        INTEGER: 'Integer',
        FLOAT: 'Float',
        BOOLEAN: 'Boolean',
        DATE: 'Date'
    };
    
    XtensConstants.SexOptions = {
        MALE: 'M',
        FEMALE: 'F',
        UNKNOWN: 'N.D.' /*,
        UNDIFFERENTIATED: 'UNDIFFERENTIATED' */
    };

    /**
     * @description available Group privilege statuses
     */
    XtensConstants.GroupPrivilegeLevels = {
        WHEEL: 'wheel', // superusers
        MANAGER: 'manager', // can edit DataTypes/Biobanks and so on
        STANDARD: 'standard' 
    };

    XtensConstants.DataTypePrivilegeLevels = {
        VIEW_OVERVIEW: 'view_overview', // level 0
        VIEW_DETAILS: 'view_details', // level 1
        DOWNLOAD: 'download', // level 2
        EDIT: 'edit', // level 3
    };

    XtensConstants.useFormattedMetadataFieldNames = true; 

} (xtens, xtens.module("xtensconstants")));
