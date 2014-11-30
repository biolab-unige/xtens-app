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
        GENERIC: 'Generic'
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

} (xtens, xtens.module("xtensconstants")));
