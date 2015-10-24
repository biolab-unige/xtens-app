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
        SAMPLE_PROPERTIES: ['biobankCode']
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

    XtensConstants.useFormattedMetadataFieldNames = true; 

} (xtens, xtens.module("xtensconstants")));
