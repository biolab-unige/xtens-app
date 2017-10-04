// TODO: retrieve this info FROM DATABASE ideally or from the server-side anyway

(function(xtens, XtensConstants) {
    XtensConstants.DefaultLimit = 10;

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
        // GENERIC: 'Data',
        DATA: 'Data'
    };

    XtensConstants.Procedures = [
        {label:'CGH', value:'CGH', superType: 8},
        {label:'NB Clinical information', value:'CBINFO', superType: 16},
        {label:'VCF', value:'VCF', superType: 112}
    ];

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
        UNKNOWN: 'N.A.' /*,
        UNDIFFERENTIATED: 'UNDIFFERENTIATED' */
    };
    XtensConstants.SexOptions = {
        MALE: 'M',
        FEMALE: 'F',
        UNKNOWN: 'N.A.' /*,
        UNDIFFERENTIATED: 'UNDIFFERENTIATED' */
    };
    /**
     * @description available Group privilege statuses
     */
    XtensConstants.GroupPrivilegeLevels = {
        WHEEL: 'wheel', // superusers
        ADMIN: 'admin', // can edit DataTypes/Biobanks and so on
        STANDARD: 'standard'
    };

    XtensConstants.DataTypePrivilegeLevels = {
        VIEW_OVERVIEW: 'view_overview', // level 0
        VIEW_DETAILS: 'view_details', // level 1
        DOWNLOAD: 'download', // level 2
        EDIT: 'edit' // level 3
    };

    XtensConstants.useFormattedMetadataFieldNames = true;

} (xtens, xtens.module("xtensconstants")));
