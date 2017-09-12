/**
* @module
* @author Massimiliano Izzo
* @author Valentina Tedone
*/

var MAX = sails.config.xtens.constants.TEST_MAX;
var MIN = sails.config.xtens.constants.TEST_MIN;
var FieldTypes = sails.config.xtens.constants.FieldTypes;
var SexList = sails.config.xtens.constants.SexOptions;
var DataTypeClasses = sails.config.xtens.constants.DataTypeClasses;
var fs = require('fs');
var BluebirdPromise = require('bluebird');
/**
* @name getRandomArbitrary
* @param {Integer} min - the min number of the range
* @param {Integer} max - the max number of the range
* @return {float} - a random number between a range
*/
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
* @name randomDate
* @param {Date} start - the first possible date of the range
* @param {Date} end - the last possible date of the range
* @return {Date} - a random date between the start and the end date
*/
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}

function pseudoRandom() {
    return Math.random()*Math.random();
}

var PopulateService = {

    /**
    * @name generateData
    * @param {DataType} dataType - a DataType model
    * @param {Array} blacklist - an array with the names of the metadata fields to skip
    * @return {Data} data - a new Data instance
    */
    generateData: function(dataType, blacklist) {

        if (!dataType.superType.schema) {
            throw new Error("missing metadata schema");
        }

        var data = {
            type:dataType.id,
            date:new Date(),
            notes:"automatically generated"
        };

        // skipping the loop fields getRandomArbitrary(min, max
        return DataTypeService.getFlattenedFields(dataType, false).then(function (fields) {
            var metadata = {};
            fields.forEach(function(field){

            // skip field if its name is in blacklist
                if (blacklist && blacklist.indexOf(field.name) > 0) {
                    return true;
                }

                switch(field.fieldType){
                    case FieldTypes.TEXT:
                        metadata[field.name] = PopulateService.generateTextField(field);
                        break;
                    case FieldTypes.FLOAT:
                        metadata[field.name] = PopulateService.generateFloatField(field);
                        break;
                    case FieldTypes.INTEGER:
                        metadata[field.name] = PopulateService.generateIntegerField(field);
                        break;
                    case FieldTypes.BOOLEAN:
                        metadata[field.name] = PopulateService.generateBooleanField();
                        break;
                    case FieldTypes.DATE:
                        metadata[field.name] = PopulateService.generateDateField();
                        break;
                }

            });
            data.metadata = metadata;
            return data;
        });
    },

    /**
    * @name generateFloatField
    * @param {Object} field - the field that it should be filled
    * @return {Object} - the metadata field with a float value, if the field has a unit, its unit can be set to the first element of the possibleUnits array
    */
    generateFloatField: function(field) {

        var min = field.min || MIN;
        var max = field.max || MAX;
        var res = {
            "value": parseFloat(parseFloat(getRandomArbitrary(min,max)).toFixed(3)),
            "unit": (field.hasUnit) ? field.possibleUnits[0] : undefined
        };
        return res;

    },

    /**
    * @name generateTextField
    * @param {Object} field - the field that it should be filled
    * @return {Object} - the metadata field with a text value, it can be filled with a random text or, if the field is a list, its value can be filled with an element of th   e possibleValues array
    */
    generateTextField: function(field) {
        var res = {};
        if(!field.isList) {
            res = { "value": Math.random().toString(36)};
        }
        else {
            var len = field.possibleValues.length;
            var randomIndex = Math.floor(Math.random()*(len));
            res = {"value": field.possibleValues[randomIndex]};
        }
        return res;
    },

    /**
    * @name generateIntegerField
    * @param {Object} field - the field that it should be filled
    * @return {Object} - the metadata field with an integer value, if the field has a unit, its unit can be set to the first element of the possibleUnits array
    */
    generateIntegerField: function(field) {

        var min = field.min || MIN;
        var max = field.max || MAX;

        var res = { "value": Math.floor(getRandomArbitrary(min,max)),
        "unit": (field.hasUnit) ? field.possibleUnits[0] : undefined};

        return res;
    },


    /**
    * @name generateBooleanField
    * @param {Object} field - the field that it should be filled
    * @return {Object} - the metadata field with a boolean value
    */
    generateBooleanField: function() {

        var min = 0;
        var max = 2;
        var value;

        if (Math.floor(getRandomArbitrary(min,max))===0){
            value = true;
        }
        else {
            value = false;
        }
        var res = {"value":value};
        return res;
    },

    /**
    * @name generateDateField
    * @param {Object} field - the field that it should be filled
    * @param {String} args[1] - start date in ISO8601
    * @param {string} args[2] - end date in ISO8601
    * @return {Object} - the metadata field with a date value
    */
    generateDateField : function() {

        var start, end;

        if (arguments[1] && arguments[1].match(/(\d{4})-(\d{2})-(\d{2})/)) {
            start = new Date(arguments[1]);
        }
        else {
            start = new Date("2000-01-01");
        }

        if (arguments[2]) {
            end = new Date(arguments[2]);
        }
        else {
            end = new Date();
        }

        var res = { "value":randomDate(start, end)};
        return res;

    },

    /**
    * @name generateSubjectSampleData
    * @description this function allows to create different type of random data. There are three different cases, in fact in the case that the class_template of the datatype is Subject, it creates the subject and the related (sons) data. In the other two cases it creates only one data for the datatype.
    * @param {Datatype} dataType - a DataType model
    * @param {Array} childrenDataTypes - an array where there are the children(of the datatype in the argument[0]) generic datatypes schemas
    * @param {Array} childrenSampleTypes -an array where there are the children(of the datatype in the argument[0]) sample datatypes schemas
    * @param {INTEGER} NumVariants - the number of the variants sample that it will create
    * @return
    */
    generateSubjectSampleData: function(dataType, childrenDataTypes, childrenSampleTypes, numVariants) {

        var data = {};
        var dataAssoc =  {};
        var typeTissue;

        return PopulateService.returnIdTissue()

        // create the new Data depending on its type
        .then(function(res){
            typeTissue = res;

            data = PopulateService.generateData(dataType);
            switch(dataType.model) {

                case DataTypeClasses.SUBJECT:
                    var sexList = Object.keys(SexList);
                    var len = sexList.length;
                    var indexSex = Math.floor(Math.random()*len);
                    var randomSex = sexList[indexSex];
                    data.code = guid();
                    data.sex = SexList[randomSex];
                    break;
                case DataTypeClasses.SAMPLE:
                    data.biobankCode = guid();
                    data.biobank = 1;
                    break;
                case DataTypeClasses.DATA:
                    break;
            }

            var modelName = dataType.model;
            console.log("PopulateService.generateSubjectSampleData - creating the new Data!");
            return global[modelName].create(data);

        })

        // if DataType is SUBJECT create all the children and
        .then(function(created) {
            if (dataType.model === DataTypeClasses.SUBJECT) {
                return PopulateService.generateSubjectChildren(created, childrenDataTypes, childrenSampleTypes, typeTissue, numVariants);
            }
        })

        .catch(function(error) {
            console.log(error.stack);
            throw new Error("Data and its children were not correctly created");
            //TODO handle exception
        });

    },

    /**
    * @name generateSubjectChildren
    * @description create all the Sample and Data children of a Subject
    * @param {Subject} subject - the subject that we consider
    * @param {Array} childrenDataTypes - an array where there are the children (of the datatype subject) generic datatypes schemas
    * @param {Array} childrenSampleTypes - an array where there are the children (of the datatype subject) sample datatypes schemas
    * @param {INTEGER} idTissue - id number of the type 'Tissue'
    * @param {INTEGER} numVariants - number of the variant that it will create
    */
    generateSubjectChildren: function(subject, childrenDataTypes, childrenSampleTypes, idTissue, numVariants) {
        console.log(subject.id);

        return BluebirdPromise.map(childrenSampleTypes, function(sampleType) {
            var child = PopulateService.generateData(sampleType);
            child.biobankCode = guid();
            child.biobank = 1;
            child.donor = subject.id;
            return Sample.create(child);
        })

        .then(function(createdSamples) {
            console.log("PopulateService.generateSubjectChildren - all children data were correctly created");
            return BluebirdPromise.map(createdSamples, function(sample) {
                if (sample.type === idTissue) {
                    return PopulateService.generateDNA(sample);
                }
            });
        })

        .then(function(createdDNAs) {
            return BluebirdPromise.map(createdDNAs, function(dna) {
                return PopulateService.generateVariants(numVariants, dna);
            });
        })

        .then(function() {
            return BluebirdPromise.map(childrenDataTypes, function(dataType) {
                var child = PopulateService.generateData(dataType);
                child.parentSubject = subject.id;
                return Data.create(child);
            });
        })

        .then(function(createdData) {
            console.log("PopulateService.generateSubjectChildren - all children data were correctly created");
        });

    },

    /**
    * @name returnIdTissue
    * @description this function returns the id of the datatype named "Tissue"
    *
    */

    returnIdTissue: function() {

        var idTissue;

        return DataType.find({name:'Tissue'}).populate('superType').then(function(tissue){
            idTissue = tissue[0].id;
            return idTissue;
        }).catch(function(e){
            console.log(err);
        });
    },

    /**
    * @name returnDNA
    * @description this function returns the schema of the datatype named "DNA"
    *
    */

    returnDNA : function() {

        return DataType.find({name:'DNA'}).populate('superType').then(function(dna){
            return dna[0];
        }).catch(function(e){
            console.log(err);
        });
    },
    /**
    * @name generateDNA
    * @description
    * @param {Sample} sample - an instance of a sample data
    *
    */
    generateDNA: function(sample){

        var DNADataType;

        return PopulateService.returnDNA()

        .then(function(dna){
            DNADataType = dna;
            var DNA = {};
            DNA = PopulateService.generateData(DNADataType);
            DNA.donor = sample.donor;   //devo metterlo??
            DNA.parentSample = sample.id;
            DNA.biobankCode = guid();
            DNA.biobank = 1;
            //console.log(DNA);
            return Sample.create(DNA);

        });


    },




    /**
    * @name generateVariantData
    * @description It populates the fields of the variant datatype
    * @param {Object} fields - it has two couples key-value, the first represents the flattened fields of variant datatype and the other represent the id of the variant datatype
    * @param {boolean} useFormattedMetadataNames - if true use "formattedName", otherwise use "name"
    * @return {Object} variant - the populated variant data
    */
    generateVariantData : function(fields, useFormattedMetadataNames) {

        var variant = {};

        variant = {type:fields.id,date:new Date(),notes:"generated by PopulateService.generateData"};
        var metadata = {};
        (fields.fields).forEach(function(field){
            var fieldName = useFormattedMetadataNames ? field.formattedName : field.name;

            switch(fieldName){

                case 'chromosome':
                case 'ref':
                    metadata[fieldName] = PopulateService.generateTextField(field);
                    break;

                case 'pos':
                case 'qual':
                case 'dp':
                case 'ns':
                    metadata[fieldName] = PopulateService.generateIntegerField(field);
                    break;

                case 'id':
                    metadata[fieldName] = {"value":guid()};
                    break;

                case 'alt':
                    var index;
                    var values = [];
                    var len = field.possibleValues.length;
                    var numValues = Math.floor(getRandomArbitrary(0,len));
                    for (var i = 0;i < numValues+1;i++){
                        index = Math.floor(getRandomArbitrary(0,len));
                        values[i]=field.possibleValues[index];
                    }
                    metadata[fieldName] = {"values":values};
                    break;

                case 'filter':
                    if (metadata.qual.value > 10) {
                        metadata[fieldName] = {"value":'pass'};
                    }
                    else {
                        var list = field.possibleValues;
                        var pos = list.indexOf('pass');
                        pos > -1 && list.splice( pos, 1 );
                        var lent = list.length;
                        var value = list[Math.floor(getRandomArbitrary(0,lent))];
                        metadata[fieldName] = {"value":value};
                    }
                    break;

                case 'af':
                    metadata[fieldName] = {"value":getRandomArbitrary(0,1).toFixed(3)};
                    break;

                case 'validated':
                case 'somatic':
                    metadata[fieldName] = PopulateService.generateBooleanField(field);
                    break;

                case 'acquisition_date':
                    metadata[fieldName] = {"value" : new Date()};
                    break;

            }

        });

        variant.metadata = metadata;
        return variant;


    },

    /**
    * @name generateVariantAnnotationData
    * @description create the variant annotation data
    * @param {Object} fields -  it has two couples key-value, the first represents the flattened fields of variant annotation datatype and the other represent the id of the variant annotation datatype
    * @param {boolean} useFormattedMetadataNames - if true use "formattedName", otherwise use "name"
    * @return {Object} annotation - the populated variant annotation data
    */

    generateVariantAnnotationData : function (fields, useFormattedMetadataNames) {
        var fileGene = sails.config.pathGeneFile;

        sails.log.info(`Gene file path is: ${fileGene}`);
        var geneIndex, metadata = {}, annotation = {
                type:fields.id,
                date:new Date(),
                notes:"generated by PopulateService.generateData"
            };

        (fields.fields).forEach(function(field){

            var fieldName = useFormattedMetadataNames ? field.formattedName : field.name;

            switch(fieldName) {

                case 'gene_name':
                case 'gene_id':
                    var file = fs.readFileSync(fileGene, "utf-8");
                    file = file.toString();

                    var len = file.split('\n').length;
                    var randomIndex = Math.floor(getRandomArbitrary(0, len-1));
                    var geneInfo = file.split('\n')[randomIndex].split(',');

                    metadata.gene_name = {"value": geneInfo[3]};
                    metadata.gene_id = {"value": geneInfo[4]};

                    break;

                case 'deleteriousness':
                    metadata[fieldName] = {"value":pseudoRandom()};
                    break;

                case 'quality_prediction':
                    if (metadata.deleteriousness.value < 0.9) {
                        metadata.quality_prediction = {"value":"Benign"};
                    }
                    else if(metadata.deleteriousness.value >= 0.9 && metadata.deleteriousness.value < 0.99) {
                        metadata.quality_prediction = {"value":"Possibly Damaging"};
                    }
                    else if(metadata.deleteriousness.value >= 0.99) {
                        metadata.quality_prediction = {"value":"Probably damaging"};
                    }
                    break;

            }

        });

        annotation.metadata = metadata;
        return annotation;
    },

    /*
    * @name Variant
    * @description the function checks the id of variant datatype and flattens its fields. It "inserts" this object as input of generateVariant function.
    * @param {INTEGER} N - number of variant samples that it will create.
    * @param {Object} dnaData - the parent DNA sample
    *
    Variant:function(N,dnaData){

    var fields = {};

    return DataType.find({name:'Variant'}).then(function(dataType){
    fields.fields = DataTypeService.getFlattenedFields(dataType[0],false);
    fields.id = dataType[0].id;
    return PopulateService.generateVariant(fields,N,dnaData);
});
},
*/

/**
* @name generateVariants
* @description it will create N variant sample
* @param {INTEGER} N - the Number of the variant sample that it will create
* @param {Object} DNAdata - the parent DNA sample
*/

    generateVariants: function(N, DNAdata) {

        var variantFields = {}, annotationFields = {}, variant ={};

        return DataType.find({name:'Variant'}).populate('superType')

    // flatten Variant type fields
    .then(function(dataType) {
        console.log("PopulateService.generateVariant - variant type retrieved");
        variantFields.id = dataType[0].id;
        return DataTypeService.getFlattenedFields(dataType[0],false);

    })
    .then(function (fields) {
        variantFields.fields = fields;

        // find the variant annotation DataType
        console.log("PopulateService.generateVariant - trying to retrieve annotation");
        return DataType.findOne({name: 'Variant Annotation'}).populate('superType');
    })

    .then(function(annotationType) {
        console.log("PopulateService.generateVariant - annotation type retrieved");
        annotationFields.id = annotationType.id;
        return DataTypeService.getFlattenedFields(annotationType);

    })
    .then(function (fields) {
        annotationFields.fields = fields;
        // create all the Variants

        console.log("PopulateService.generateVariant - creating all the variants");
        var array = new Array(N);
        return BluebirdPromise.map(array, function() {
            variant = PopulateService.generateVariantData(variantFields);
            variant.parentSubject = DNAdata.donor;
            variant.parentSample = DNAdata.id;
            return Data.create(variant);
        },{concurrency:5});

    })
    // create the associated annotations for each created variant
    .then(function(createdVariants) {
        console.log("PopulateService.generateVariant - creating all the associated variants");
        return BluebirdPromise.map(createdVariants, function(createdVariant) {
            var annotation = PopulateService.generateVariantAnnotation(annotationFields,createdVariant);

            return Data.create(annotation);
        },{concurrency:5});
    });

    },
/*
generateAnnotation: function(sample) {

var fields = {};

return DataType.find({name:'Variant Annotation'}).then(function(dataType){
fields.fields = DataTypeService.getFlattenedFields(dataType[0]);
fields.id = dataType[0].id;
return PopulateService.generateVariantAnnotation(fields,sample);
}).catch(function(e){
console.log(e);
});
}, */

/**
* @name generateVariantAnnotation
* @description generate a variant annotation data related to a variant data
* @param {Object} fields - it has two couples key-value, the first represents the flattened fields of variant annotation datatype and the other represent the id of the variant annotation datatype
* @param {Data} sample - the father variant data
* @return {Object} annotation - the annotation data related to the sample in input
*/

    generateVariantAnnotation : function(fields,sample) {

        var annotation = PopulateService.generateVariantAnnotationData(fields);

        annotation.parentSample = sample.parentSample;
        annotation.parentSubject = sample.parentSubject;
        annotation.parentData = sample.id;
        return annotation;
    },

/**
*@name Main
*@description it is the main function that creates a number of patients and their data
*@param {INTEGER} numPatient - number of the patients that it will create
*@param {INTEGER} numVariants - numeber of the variants data that it will create for each patient
*/

    Main: function(numPatient,numVariants){

        var subject;
        var sampleChildren = [];
        var dataChildren = [];

        DataType.findOne({name:'Patient'}).populate('superType').then(function(patient){

            subject = patient;
        })
    .then(function(){

        return DataType.find().populate('superType').then( function(dataTypes){

            return BluebirdPromise.map(dataTypes,function(dataType){

                if(dataType.superType.schema.header.parents && (dataType.superType.schema.header.parents).indexOf(subject.id) > -1) {
                    if(dataType.model === DataTypeClasses.SAMPLE){
                        sampleChildren.push(dataType);
                    }
                    else if(dataType.model === DataTypeClasses.DATA){
                        dataChildren.push(dataType);
                    }
                }

            });

        }).then (function () {

            return BluebirdPromise.map(new Array(numPatient),function (){

                return PopulateService.generateSubjectSampleData(subject,dataChildren,sampleChildren,numVariants);

            },{concurrency:1});


        });

    }).catch(function(err)
    {
        console.log(err);
    });




    }

};

module.exports = PopulateService;
