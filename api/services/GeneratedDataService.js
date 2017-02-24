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
var fileGene = sails.config.pathGeneFile;
var BluebirdPromise = require('bluebird');


var GERMLINE_SIZE = 19500;
var SOMATIC_SIZE = 500;

var instrumentation = {
    'Illumina Genome Analyzer II': [70,75],
    'Illumina HiSeq 1000': [90,100],
    'Illumina HiSeq 2000': [90,100],
    'Illumina HiSeq 2500': [140,150],
    'Illumina HiSeq 3000': [140,150],
    'AB Solid System': [35,35],
    'AB 5500 Genetic Analyzer': [75,75],
    '454 GS': [400,400],
    '454 GS FLX+': [400,400],
    'Ion Torrent': 0
};

var healthy = {
    topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/119353001', name:'Lymphocyte'}
};

var diseases = [
    {
        topography: {icd_o: 'COO', name: 'lip'},
        morphology:{icd_o:'8050/0', name:'papilloma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/48477009', name:'Lip'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/447990008', name:'Papilloma of Lip'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/400207007', name: "Benign epithelial neoplasm - category"},
        benign: true
    },
    {
        topography:{icd_o: 'CO1', name: 'base of tongue'},
        morphology:{icd_o:'8070/3', name:'squamous cell carcinoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/47975008', name:'Structure of root of tongue'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/402815007', name:'Squamous cell carcinoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/400155002', name: "Squamous cell carcinoma - category"}
    },
    {
        topography:{icd_o: 'CO3', name: 'gum'},
        morphology:{icd_o:'8050/0', name:'papilloma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/113279002', name:'Gingival structure'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/92126004', name:'Benign neoplasm of gum'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/3898006', name: "Neoplasm, benign"},
        benign: true
    },
    {
        topography:{icd_o: 'CO3', name: 'gum'},
        morphology:{icd_o:'9140/3', name:'kaposi sarcoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/113279002', name:'Gingival structure'},
        disease_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/109385007', name: "Kaposi's sarcoma"},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/49937004', name: "Kaposi's sarcoma"}
    },
    {
        topography:{icd_o: 'CO4', name: 'floor of mouth'},
        morphology:{icd_o:'8070/3', name:'squamous cell carcinoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/', name:''},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/402815007', name:'Squamous cell carcinoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/400155002', name: "Squamous cell carcinoma - category"}

    },
    {
        topography:{icd_o: 'CO5', name: 'palate'},
        morphology:{icd_o:'9687/3', name:'burkitt lymphoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/72914001', name:'Palate'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/118617000', name:"Burkitt's lymphoma"},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/77381001', name: "Burkitt lymphoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'CO7', name: 'parotid gland'},
        morphology:{icd_o:'8561/0', name:'adenolymphoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/45289007', name:'Parotid gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/422470007', name:'Adenolymphoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/20776008', name: "Adenolymphoma"},
        benign: true
    },
    {
        topography:{icd_o: 'CO9', name: 'tonsil'},
        morphology:{icd_o:'9673/3', name:'mantle cell lymphoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/75573002', name:'Tonsil'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/443487006', name:'Mantle cell lymphoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/', name: "Mantle cell lymphoma"}
    },
    {
        topography:{icd_o: 'C10', name: 'oropharynx'},
        morphology:{icd_o:'9140/3', name:'kaposi sarcoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/31389004', name:'Oropharynx'},
        disease_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/109385007', name: "Kaposi's sarcoma"},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/49937004', name: "Kaposi's sarcoma"}
    },
    {
        topography:{icd_o: 'C11', name: 'nasopharynx'},
        morphology:{icd_o:'8082/3', name:'lymphoepithelial carcinoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/71836000', name:'Nasopharynx'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/449248000', name:'Nasopharyngeal carcinoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/7300000', name: "Lymphoepithelial carcinoma"}
    },
    {
        topography:{icd_o: 'C12', name: 'pyriform sinus'},
        morphology:{icd_o:'8850/3', name:'lipoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/6217003', name:'Piriform sinus'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/93163002', name:'Lipoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/46720004', name: "Lipoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C13', name: 'hypopharynx'},
        morphology:{icd_o:'8240/3', name:'carcinoid tumor, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/81502006', name:'Hypopharynx'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/448665005', name:'Carcinoma of hypopharynx'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/68453008', name: "Carcinoma"}
    },
    {
        topography:{icd_o: 'C13', name: 'hypopharynx'},
        morphology:{icd_o:'8810/3', name:'fibrosarcoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/81502006', name:'Hypopharynx'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/403996004', name:'Infantile fibrosarcoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53654007', name: "Fibrosarcoma"}
    },
    {
        topography:{icd_o: 'C15', name: 'esophagus'},
        morphology:{icd_o:'8000/0', name:'neoplasm, benign'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/32849002', name:'Oesophagus'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/126817006', name:'Neoplasm of oesophagus'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/3898006', name: "Benign neoplasm"},
        benign: true
    },
    {
        topography:{icd_o: 'C16', name: 'stomach'},
        morphology:{icd_o:'8145/3', name:'carcinoma, diffuse type'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/69695003', name:'Stomach'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/372143007', name:'Gastric carcinoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/24505004', name: "Carcinoma, diffuse type"}
    },
    {
        topography:{icd_o: 'C17', name: 'small intestine'},
        morphology:{icd_o:'9200/0', name:'osteoblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/30315005', name:'Small intestine'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/448664009', name:'Carcinoma of small intestine'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/68453008', name: "Carcinoma"}
    },
    {
        topography:{icd_o: 'C18', name: 'colon'},
        morphology:{icd_o:'9490/0', name:'ganglioneuroma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/113345001', name:'Abdomen'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/426134002', name:'Benign ganglioneuroma of abdomen'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53801007', name: "Ganglioneuroma"},
        benign: true,
        paediatric: true
    },
    {
        topography:{icd_o: 'C18', name: 'colon'},
        morphology:{icd_o:'8213/0', name:'serrated adenoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/71854001', name:'Colon'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/92065004', name:'Benign neoplasm of colon'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/128653004', name: "Serrated adenoma"},
        benign:true
    },
    {
        topography:{icd_o: 'C20', name: 'rectum'},
        morphology:{icd_o:'8140/0', name:'adenoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/34402009', name:'Rectum'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/399730005', name:'Adenoma of rectum'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/32048006', name: "Adenoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C22', name: 'liver'},
        morphology:{icd_o:'8170/3', name:'hepatocellular carcinoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/10200004', name:'Liver'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/109841003', name:'Liver carcinoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/25370001', name: "Hepatocellular carcinoma"}
    },
    {
        topography:{icd_o: 'C22', name: 'liver'},
        morphology:{icd_o:'9071/3', name:'yolk sac tumour'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/10200004', name:'Liver'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/115233005', name:'Germ cell neoplasm'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/404081005', name: "Yolk sac tumour"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C23', name: 'gallbladder'},
        morphology:{icd_o:'8240/3', name:'carcinoid tumor, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/28231008', name:'Gallbladder'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/92599005', name:'Carcinoma in situ of gallbladder'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/68453008', name: "Carcinoma"}
    },
    {
        topography:{icd_o: 'C25', name: 'pancreas'},
        morphology:{icd_o:'8971/3', name:'pancreatoblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/15776009', name:'Pancreas'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/363418001', name:'Malignant tumour of pancreas'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53618008', name: "Pancreatoblastoma"}
    },
    {
        topography:{icd_o: 'C25', name: 'pancreas'},
        morphology:{icd_o:'8150/3', name:'islet cell carcinoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/15776009', name:'Pancreas'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/363418001', name:'Malignant tumour of pancreas'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/60346004', name: "Islet cell carcinoma"}
    },
    {
        topography:{icd_o: 'C25', name: 'pancreas'},
        morphology:{icd_o:'8151/0', name:'insulinoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/15776009', name:'Pancreas'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/92264007', name:'Benign tumour of pancreas'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/25324008', name: "Insulinoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C30', name: 'nasal cavity'},
        morphology:{icd_o:'9522/3', name:'olfactory neuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/279549004', name:'Nasal cavity'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/422886007', name:'Olfactory neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/76060004', name: "Esthesioneuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C31', name: 'accessory sinuses'},
        morphology:{icd_o:'8121/0', name:'scheneiderian papilloma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/2095001', name:'Nasal sinus'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/104081000119103', name:'Inverted papilloma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/50894008', name: "Schneiderian papilloma"},
        benign: true
    },
    {
        topography:{icd_o: 'C32', name: 'larynx'},
        morphology:{icd_o:'8810/3', name:'fibrosarcoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/4596009', name:'Larynx'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/403996004', name:'Infantile fibrosarcoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53654007', name: "Fibrosarcoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C33', name: 'trachea'},
        morphology:{icd_o:'8810/3', name:'fibrosarcoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/44567001', name:'Trachea'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/403996004', name:'Infantile fibrosarcoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53654007', name: "Fibrosarcoma"},
        paediatric: true

    },
    {
        topography:{icd_o: 'C37', name: 'thymus'},
        morphology:{icd_o:'8580/1', name:'thymoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/9875009', name:'Thymus'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/444231005', name:'Thymoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/', name: "Thymoma, type A"}
    },
    {
        topography:{icd_o: 'C37', name: 'thymus'},
        morphology:{icd_o:'8580/1', name:'thymoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/9875009', name:'Thymus'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/444231005', name:'Thymoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/', name: "Thymoma, type AB"}
    },
    {
        topography:{icd_o: 'C38', name: 'heart'},
        morphology:{icd_o:'8810/0', name:'fibroma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/80891009', name:'Heart'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/424568000', name:'Fibroma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/112682009', name: "Fibroma"},
        benign: true
    },
    {
        topography:{icd_o: 'C40', name: 'bones - limb'},
        morphology:{icd_o:'9200/0', name:'osteoblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/272673000', name:'Bone structure'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/307605009', name:'Osteoblastoma of bone'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/55333008', name: "Osteoblastoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C40', name: 'bones - limb'},
        morphology:{icd_o:'9180/0', name:'osteoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/272673000', name:'Bone structure'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/302858007', name:'Osteoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/83612000', name: "Osteoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C41', name: 'bones - other'},
        morphology:{icd_o:'9200/0', name:'osteoblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/61496007', name:'Cartilage'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/86049000', name:'Malignant neoplasm'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/9001003', name: "Chondroblastoma"}
    },
    {
        topography:{icd_o: 'C44', name: 'skin'},
        morphology:{icd_o:'8720/0', name:'melanoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/39937001', name:'Skin'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/126488004', name:'Skin tumour'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/77986002', name: "Melanoma in situ"}
    },
    {
        topography:{icd_o: 'C47', name: 'peripheral nerves'},
        morphology:{icd_o:'8000/3', name:'neoplasm, malignant'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/84782009', name:'Peripheral nerve'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/126980002', name:'Neoplasm of peripheral nerve'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/86049000', name: "Malignant neoplasm"}
    },
    {
        topography:{icd_o: 'C47', name: 'periferal nerves'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/84782009', name:'Peripheral nerve'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C47', name: 'periferal nerves'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/84782009', name:'Peripheral nerve'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C47', name: 'periferal nerves'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/84782009', name:'Peripheral nerve'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C49', name: 'connective tissue'},
        morphology:{icd_o:'9044/7', name:'clear cell sarcoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/21793004', name:'Connective tissue'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/402561003', name:'Clear cell sarcoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/271944004', name: "Clear cell sarcoma"}
    },
    {
        topography:{icd_o: 'C50', name: 'breast'},
        morphology:{icd_o:'9016/0', name:'giant fibroadenoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/76752008', name:'Breast'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/254847007', name:'Juvenile fibroadenoma of breast'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/46212000', name: "Juvenile fibroadenoma"},
        paediatric: true,
        benign: true
    },
    {
        topography:{icd_o: 'C64', name: 'kidney'},
        morphology:{icd_o:'8960/3', name:'nephroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/64033007', name:'Kidney'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/302849000', name:'Nephroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/25081006', name: "Nephroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C64', name: 'kidney'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/64033007', name:'Kidney'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C65', name: 'renal pelvis'},
        morphology:{icd_o:'8683/0', name:'gangliocytic paraganglioma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/25990002', name:'Renal pelvis'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/253029009', name:'Gangliocytic paraganglioma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/72787006', name: "Gangliocytic paraganglioma"},
        benign: true
    },
    {
        topography:{icd_o: 'C65', name: 'renal pelvis'},
        morphology:{icd_o:'8683/0', name:'gangliocytic paraganglioma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/25990002', name:'Renal pelvis'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/253029009', name:'Gangliocytic paraganglioma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/72787006', name: "Gangliocytic paraganglioma"},
        benign: false
    },
    {
        topography:{icd_o: 'C66', name: 'ureter'},
        morphology:{icd_o:'8240/3', name:'carcinoid tumor, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/87953007', name:'Ureter'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/448864006', name:'Carcinoma of ureter'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/68453008', name: "Carcinoma"}
    },
    {
        topography:{icd_o: 'C67', name: 'bladder'},
        morphology:{icd_o:'8240/3', name:'carcinoid tumor, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/89837001', name:'Urinary bladder'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/255108000', name:'Carcinoma of bladder'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/68453008', name: "Carcinoma"}
    },
    {
        topography:{icd_o: 'C69', name: 'eye'},
        morphology:{icd_o:'9510/0', name:'retinocytoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/81745001', name:'Eye'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/416864007', name:'Retinocytoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/128913004', name: "Retinocytoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C69', name: 'eye'},
        morphology:{icd_o:'9510/3', name:'retinoblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/81745001', name:'Eye'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/370967009', name:'Retinoblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/19906005', name: "Retinoblastoma"}
    },
    {
        topography:{icd_o: 'C70', name: 'meninges'},
        morphology:{icd_o:'9490/3', name:'ganglioneuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/81745001', name:'Meninges'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/109915008', name:'Primary malignant neoplasm of meninges'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/69515008', name: "Ganglioneuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9490/3', name:'ganglioneuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/12738006', name:'Brain'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/281560004', name:'Neuroblastoma of brain'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/69515008', name: "Ganglioneuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9440/3', name:'glioblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/12738006', name:'Brain'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/276828006', name:'Glioblastoma multiforme of brain'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/63634009', name: "Glioblastoma"}
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9440/3', name:'glioblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/12738006', name:'Brain'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/276828006', name:'Glioblastoma multiforme of brain'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/63634009', name: "Glioblastoma"}
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9470/3', name:'medulloblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/113305005', name:'Cerebellum'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/277505007', name:'Medulloblastoma of cerebellum'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/83217000', name: "Medulloblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9470/3', name:'medulloblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/12738006', name:'Brain'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/699704002', name:'Classic medulloblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/699703008', name: "Classic medulloblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C71', name: 'brain'},
        morphology:{icd_o:'9470/3', name:'medulloblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/113305005', name:'Cerebellum'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/277505007', name:'Medulloblastoma of cerebellum'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/83217000', name: "Medulloblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C72', name: 'spinal cord'},
        morphology:{icd_o:'9560/0', name:'neurilemmoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/2748008', name:'Spinal cord'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/426510004', name:'Schwannoma of spinal cord'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/985004', name: "Neurilemoma"}
    },
    {
        topography:{icd_o: 'C72', name: 'spinal cord'},
        morphology:{icd_o:'9490/3', name:'ganglioneuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/2748008', name:'Spinal cord'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/126962006', name:'Neoplasm of spinal cord'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/69515008', name: "Ganglioneuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C72', name: 'spinal cord'},
        morphology:{icd_o:'9470/3', name:'medulloblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/2748008', name:'Spinal cord'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/443333004', name:'Medulloblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/83217000', name: "Medulloblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C72', name: 'spinal cord'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/2748008', name:'Spinal cord'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C73', name: 'thyroid gland'},
        morphology:{icd_o:'8330/0', name:'follicular adenoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/69748006', name:'Thyroid gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/255034006', name:'Thyroid follicular adenoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/55021007', name: "Follicular adenoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C73', name: 'thyroid gland'},
        morphology:{icd_o:'8334/0', name:'macrofollicular adenoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/69748006', name:'Thyroid gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/255033000', name:'Thyroid adenoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/26545006', name: "Macrofollicular adenoma"},
        benign: true
    },
    {
        topography:{icd_o: 'C74', name: 'adrenal gland'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/12003004', name:'Left adrenal gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C74', name: 'adrenal gland'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/29392005', name:'Right adrenal gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C74', name: 'adrenal gland'},
        morphology:{icd_o:'9500/3', name:'neuroblastoma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/23451007', name:'Adrenal gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/432328008', name:'Neuroblastoma'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/87364003', name: "Neuroblastoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C74', name: 'adrenal gland'},
        morphology:{icd_o:'9490/0', name:'ganglioneuroma'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/23451007', name:'Adrenal gland'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/91967007', name:'Benign tumour of adrenal gland'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/53801007', name: "Ganglioneuroma"},
        paediatric: true,
        benign: true
    },
    {
        topography:{icd_o: 'C77', name: 'lymph nodes'},
        morphology:{icd_o:'9590/3', name:'malignant lymphoma, nos'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/59441001', name:'Lymph node'},
        disease_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/118617000', name:"Burkitt's lymphoma"},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/77381001', name: "Burkitt lymphoma"},
        paediatric: true
    },
    {
        topography:{icd_o: 'C80', name: 'unknown'},
        morphology:{icd_o:'8000/3', name:'neoplasm, malignant'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/87100004', name:'Topography unknown'},
        disease_snomedct: {iri:undefined, name: undefined},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/3898006', name: "Benign neoplasm"}
    },
    {
        topography:{icd_o: 'C80', name: 'unknown'},
        morphology:{icd_o:'8000/3', name:'neoplasm, malignant'},
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/21229009', name:'Topography not assigned'},
        disease_snomedct: {iri:undefined, name: undefined},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/3898006', name: "Benign neoplasm"}
    },
    {
        topography_snomedct: {iri:'http://purl.bioontology.org/ontology/SNOMEDCT/55460000', name:'Fetal structure'},
        disease_snomedct: {iri:"http://purl.bioontology.org/ontology/SNOMEDCT/4752007", name: 'Fetal sacral teratoma causing disproportion'},
        morphology_snomedct: {iri: 'http://purl.bioontology.org/ontology/SNOMEDCT/55818009', name: "Teratoma"},
        fetal: true,
        benign: true
    }
];

console.log("Diseases Length is:" + diseases.length);

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

var GeneratedDataService = {

    generateAll: function(n) {
        return BluebirdPromise.delay(50).then(function() {
            return [DataType.find(), Biobank.find()];
        })

        .spread(function(dataTypes, biobanks) {
            console.log(dataTypes);
            console.log(biobanks);
            var biobankIds = _.map(biobanks, 'id');

            return BluebirdPromise.map(new Array(n), function() {

                return GeneratedDataService.generateCompleteSubject(dataTypes, biobankIds);

            }, {concurrency: 20});

        })

        .catch(function(err) {
            throw new Error(err.message || err.details);
        });

    },

    generateCompleteSubject: function(dataTypes, biobankIds) {

        var idSubject;

        // let's pick up a random disease and a biobank
        var disease = diseases[Math.floor(Math.random()*diseases.length)];
        var biobankTis = biobankIds[Math.floor(Math.random()*biobankIds.length)];
        var biobankFluid = biobankIds[Math.floor(Math.random()*biobankIds.length)];

        return GeneratedDataService.generateSubject(_.find(dataTypes, {name:'Patient'}))

        .then(function(patient) {
            idSubject = _.parseInt(patient.id);
            return [
                GeneratedDataService.generateTissue(_.find(dataTypes, {name:'Tissue'}), idSubject, disease, biobankTis),
                GeneratedDataService.generateFluid(_.find(dataTypes, {name:'Fluid'}), idSubject, biobankFluid),
                GeneratedDataService.generateClinicalSituation(_.find(dataTypes, {name:'Clinical Situation'}), idSubject, disease)
            ];

        })

        .spread(function(createdTissue, createdFluid, createdClinicalSituation) {
            // console.log("GeneratedDataService.generateCompleteSubject - created new ClinicalSituation with id: " + createdClinicalSituation.id);
            return [
                GeneratedDataService.generateDerivative(_.find(dataTypes, {name:'DNA'}), createdTissue),
                GeneratedDataService.generateDerivative(_.find(dataTypes, {name:'RNA'}), createdTissue)
            ];

        })

        .spread(function(createdDNA, createdRNA) {
            // console.log("GeneratedDataService.generateCompleteSubject - created new RNA with id: " + createdRNA.id);
            return [
                GeneratedDataService.generateCGHReport(_.find(dataTypes, {name:'CGH Array Report'}), idSubject, createdDNA.id, disease),
                GeneratedDataService.generateNGS(_.find(dataTypes, {name:'Whole Genome Sequencing'}), idSubject, createdDNA.id)
            ];

        })

        .spread(function(createdCGH, createdNGS) {
            // console.log("GeneratedDataService.generateCompleteSubject - created new NGS with id: " + createdNGS.id);
            // console.log("GeneratedDataService.generateCompleteSubject - patient data successfully generated! " + idSubject);
            return idSubject;
        })

        .catch(function(error) {
            throw new Error(error.message || error.details);
        });



    },

    /**
     * @method
     * @name generateSubject
     * @param {int} - patientType, the ID of 'Patient' in the "data_type" table
     * @description generate a subject with quasi-random metadata parameters
     * @return {Object} - Subject
     */
    generateSubject: function(patientType) {
        var subject = PopulateService.generateData(patientType);
        var sexList = Object.keys(SexList);
        var len = sexList.length;
        var indexSex = Math.floor(Math.random()*len);
        var randomSex = sexList[indexSex];
        subject.code = guid();
        subject.sex = SexList[randomSex];
        return Subject.create(subject);
    },

    /**
     * @method
     * @name generateTissue
     * @param {int} - tissueType, the ID of 'Tissue' in the "data_type" table
     * @param {int} - idSubj - ID of the donor ("parent" Subject")
     * @param {Object} - details - object containing morphology and topography information
     * @param {int} - biobank - ID of the biobank in the "biobank" table
     * @description generate a tissue sample with quasi-randomly selected metadata parameters
     * @return {Object} - Tissue sample
     */
    generateTissue: function(tissueType, idSubj, details, biobank) {
        var tissue = PopulateService.generateData(tissueType, ['tumour', 'topography', 'morphology']);
        tissue.metadata.volume.value = parseFloat(getRandomArbitrary(0.0, 25.0).toFixed(2));
        tissue.tumour = {value: true};
        tissue.metadata.topography = { value: details.topography_snomedct.name, iri: details.topography_snomedct.iri };
        tissue.metadata.morphology = { value: details.morphology_snomedct.name, iri: details.morphology_snomedct.iri };
        tissue.biobankCode = guid();
        tissue.biobank = biobank;
        tissue.donor = idSubj;
        return Sample.create(tissue);
    },

    /**
     * @method
     * @name generateFluid
     * @param {int} - fluidType, the ID of 'Fluid' in the "data_type" table
     * @param {int} - idSubj - ID of the donor ("parent" Subject")
     * @param {int} - biobank - ID of the biobank in the "biobank" table
     * @description generate a fluid sample with quasi-randomly selected metadata parameters
     * @return {Object} - Fluid sample
     */
    generateFluid: function(fluidType, idSubj, biobank) {
        var fluid = PopulateService.generateData(fluidType);
        fluid.metadata.volume.value = parseFloat(getRandomArbitrary(0.0, 10.0).toFixed(2));
        fluid.biobankCode = guid();
        fluid.biobank = biobank;
        fluid.donor = idSubj;
        return Sample.create(fluid);
    },

    /**
     * @method
     * @name generateClinicalSituation
     * @param {int} - csType
     * @param {int} - idSubj  - ID of the biobank in the "biobank" table
     * @param {Object} - details - object containing clinical info
     * @description generate a fluid sample with quasi-randomly selected metadata parameters
     * @return {Object} - clinical situation data
     */
    generateClinicalSituation: function(csType, idSubj, details) {
        var clinSit = PopulateService.generateData(csType, ['disease', 'is_benign']);
        clinSit.metadata.disease = { value: details.disease_snomedct.name, iri: details.disease_snomedct.iri};
        if (details.fetal) {
            clinSit.metadata.diagnosis_age.value = 0;
            clinSit.metadata.diagnosis_age.unit = "day";
        }
        if (details.paediatric) {
            clinSit.metadata.diagnosis_age.unit = "month";
        }
        else {
            clinSit.metadata.diagnosis_age.unit = "year";
        }
        clinSit.metadata.is_benign = {
            value: details.benign ? true : false
        };
        if (clinSit.metadata.is_benign.value) {
            if (getRandomArbitrary(0,1) < 0.9 ) {
                clinSit.metadata.current_status.value = 'alive - complete remission';
            }
            else {
                clinSit.metadata.current_status.value = 'alive - other disease';
            }
        }
        clinSit.parentSubject = idSubj;
        return Data.create(clinSit);
    },

    /**
     * @method
     * @name generateDerivative
     * @param {int} - derivativeType - the ID of the derivative type in the 'data_type' table
     * @param {Object} parentSample - the parent Sample (DNA/RNA)
     * @return {Object} - the generated derivative sample
     */
    generateDerivative: function(derivativeType, parentSample) {
        var derivative = PopulateService.generateData(derivativeType);
        derivative.metadata.quantity.value = parseFloat(getRandomArbitrary(0.0, 10.0).toFixed(2));
        derivative.metadata.concentration.value = parseFloat(getRandomArbitrary(0.0, 100.0).toFixed(2));
        derivative.metadata.sampling_date = PopulateService.generateDateField(null, parentSample.metadata.sampling_date.value);
        derivative.donor = parentSample.donor;
        derivative.parentSample = parentSample.id;
        derivative.biobankCode = guid();
        derivative.biobank = parentSample.biobank;
        console.log("DERIVATIVE sampling_date: ");
        console.log(derivative.metadata.sampling_date);
        return Sample.create(derivative);
    },

    /**
     * @method
     * @name generateCGHReport
     * @param {int} cghType - the ID of 'CGH Report' in the 'data_type' table
     * @param {int} idSubj - the ID of the 'parent' Subject
     * @param {int} idParentSample - the ID of the 'parent' Sample
     * @param {Object} details - the object containing metadata info
     * @return {Object} cghReport
     */
    generateCGHReport: function(cghType, idSubj, idParentSample, details) {
        // console.log("GeneratedDataService.generateCGHReport - here we are");
        var cgh = PopulateService.generateData(cghType);
        if (details.benign) {
            cgh.metadata.prognostic_profile.value = 'NO RESULT profile';
        }
        else if (cgh.metadata.structural_abnormalities.value) {
            cgh.metadata.prognostic_profile.value = 'SCA profile';
        }
        else if (cgh.metadata.numerical_abnormalities.value) {
            cgh.metadata.prognostic_profile.value = 'NCA profile';
        }
        else {
            cgh.metadata.prognostic_profile.value = 'NO RESULT profile';
        }
        cgh.parentSubject = idSubj;
        cgh.parentSample = idParentSample;
        // console.log("GeneratedDataService.generateReport - ready to create CGH: " + cgh);
        return Data.create(cgh);
    },

    /**
     * @method
     * @name generateNGS
     * @param {int} ngsType - the
     * @param {int} idSubj - the ID of the 'parent' Subject
     * @param {int} idParentSample - the ID of the 'parent' Sample
     */
    generateNGS: function(ngsType, idSubj, idParentSample) {
        if (Math.random() >= 0.5) {
            return;
        }

        // console.log("GeneratedDataService.generateNGS - here we are");
        var ngs = PopulateService.generateData(ngsType, ['read_length']);
        ngs.metadata.read_length = {};
        ngs.metadata.read_length.value = Math.ceil(getRandomArbitrary(instrumentation[ngs.metadata.instrument_model.value][0], instrumentation[ngs.metadata.instrument_model.value][0] ));
        ngs.metadata.read_length.unit = 'bp';
        switch (ngs.metadata.instrument_model) {
            case "Illumina HiSeq 2000":
                ngs.metadata.total_reads.value = Math.floor(getRandomArbitrary(500000000,800000000));
                ngs.metadata.high_quality_reads.value = Math.floor(getRandomArbitrary(0.78,0.85)*ngs.metadata.total_reads.value);
                break;
            case "Illumina HiSeq 2500":
                ngs.metadata.total_reads.value = Math.floor(getRandomArbitrary(600000000,800000000));
                ngs.metadata.high_quality_reads.value = Math.floor(getRandomArbitrary(0.78,0.88)*ngs.metadata.total_reads.value);
                break;
            case "Illumina HiSeq 3000":
                ngs.metadata.total_reads.value = Math.floor(getRandomArbitrary(600000000,1000000000));
                ngs.metadata.high_quality_reads.value = Math.floor(getRandomArbitrary(0.80,0.88)*ngs.metadata.total_reads.value);
                break;
            default:
                ngs.metadata.total_reads.value = Math.floor(getRandomArbitrary(350000000,550000000));
                ngs.metadata.high_quality_reads.value = Math.floor(getRandomArbitrary(0.70,0.80)*ngs.metadata.total_reads.value);
        }
        ngs.metadata.reference_genome.value = 'hg19';
        ngs.parentSubject = idSubj;
        ngs.parentSample = idParentSample;
        // console.log("GeneratedDataService.generateReport - ready to create NGS: " + ngs);
        return Data.create(ngs);
    },

    /**
     * @method
     * @name populateVariants
     * @description retrieve all the 'Whole Genome Sequencing' data and for each of those populate with variants
     * @return {Promise} a bluebird promise
     */
    populateVariants: function() {

        var query = BluebirdPromise.promisify(Data.query, Data);

        return BluebirdPromise.delay(20).then(function() {

            return [
                query(["SELECT d.id, d.parent_subject, d.parent_data FROM data d",
                      " INNER JOIN data_type dt ON dt.id = d.type",
                      " WHERE dt.name = 'Whole Genome Sequencing' AND ",
                      "(SELECT count(*) FROM data cd WHERE cd.parent_data = d.id) = 0;"].join("")),
                query("SELECT id FROM data_type WHERE name = 'Human Variant';"),
                query("SELECT count(*) FROM germline_variant;"),
                query("SELECT count(*) FROM somatic_variant;")
            ];

        })

        .spread(function(ngsDataRes, varTypeRes, germlineCountRes, somaticCountRes) {
            console.log("GeneratedDataService.populateVariants - germline count is: " + germlineCountRes.rows[0].count);
            console.log(germlineCountRes.rows[0]);
            console.log("GeneratedDataService.populateVariants - somatic count is: " + somaticCountRes.rows[0]);
            console.log("GeneratedDataService.populateVariants - first NGS is: " + ngsDataRes.rows[0]);
            console.log("GeneratedDataService.populateVariants - NGS array length is: " + (ngsDataRes.rows && ngsDataRes.rows.length));
            return BluebirdPromise.map(ngsDataRes.rows, function(ngsDatum) {

                return GeneratedDataService.populateExome(germlineCountRes.rows[0].count, somaticCountRes.rows[0].count, varTypeRes.rows[0].id, ngsDatum);

            }, {concurrency: 1});

        })

        .then(function(results) {
            console.log("GeneratedDataService.populateVariants - done");
            return results;
        });

    },

    /**
     * @method
     * @name populateExome
     * @description populate a Sequencing datum with GERMLINE_SIZE new germinal variants and SOMATIC_SIZE new somatic variants
     */
    populateExome: function(germVarCount, somVarCount, varTypeId, ngsDatum) {
        var varId, note = "automatically generated";
        var germlines = [], somatics = [];
        var query = BluebirdPromise.promisify(Data.query, Data);

        console.log("GeneratedDataService.populateExome: creating germline variants");
        return BluebirdPromise.map(new Array(GERMLINE_SIZE), function() {
            do {
                varId = Math.ceil(germVarCount*Math.random());
            } while(germlines.indexOf(varId) > 0);
            germlines.push(varId);
            return query({
                name: "creategermline",
                text: [
                    "INSERT INTO data (type, parent_subject, parent_data, metadata, notes, created_at, updated_at)",
                    "VALUES ($1, $2, $3, (SELECT metadata FROM germline_variant WHERE id = $4), $5, current_timestamp, current_timestamp)",
                    "RETURNING id;"
                ].join(" "),
                values: [varTypeId, ngsDatum.parent_subject, ngsDatum.id, varId, note]
            });
        }, {concurrency: 60})

        .then(function(result) {

            console.log("GeneratedDataService.populateExome: created " + result.length + " germline variants");
            console.log("GeneratedDataService.populateExome: creating somatic variants");
            return BluebirdPromise.map(new Array(SOMATIC_SIZE), function() {
                do {
                    varId = Math.ceil(somVarCount*Math.random());
                } while (somatics.indexOf(varId) > 0);
                somatics.push(varId);

                return query({
                    name: "createsomatic",
                    text: [
                        "INSERT INTO data (type, parent_subject, parent_data, metadata, notes, created_at, updated_at)",
                        "VALUES ($1, $2, $3, (SELECT metadata FROM somatic_variant WHERE id = $4), $5, current_timestamp, current_timestamp)",
                        "RETURNING id;"
                    ].join(" "),
                    values: [varTypeId, ngsDatum.parent_subject, ngsDatum.id, varId, note]
                });

            });

        })

        .then(function(result) {
            console.log("GeneratedDataService.populateExome: created " + result.length + " somatic variants");
            return {
                germlines: germlines,
                somatics: somatics
            };
        });

    }

};

module.exports = GeneratedDataService;
