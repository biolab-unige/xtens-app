(function(xtens, XtensConstants) {
    XtensConstants.Constants = {
        DATA: 'DATA',
        DATA_TYPE: 'DATA TYPE',
        METADATA_FIELD: 'METADATA FIELD',
        METADATA_LOOP: 'METADATA LOOP',
        METADATA_GROUP: 'METADATA GROUP',
        STRING: 'string'
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
        MALE: 'MALE',
        FEMALE: 'FEMALE',
        UNKNOWN: 'UNKNOWN',
        UNDIFFERENTIATED: 'UNDIFFERENTIATED'
    };

} (xtens, xtens.module("xtensconstants")));
