--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: dom_basicdatatype; Type: DOMAIN; Schema: public; Owner: xtenspg
--

CREATE DOMAIN dom_basicdatatype AS text COLLATE pg_catalog."C.UTF-8"
	CONSTRAINT dom_basicdatatype_check CHECK (((length(VALUE) > 3) AND (length(VALUE) < 32)));


ALTER DOMAIN dom_basicdatatype OWNER TO xtenspg;

--
-- Name: dom_componentdatatypename; Type: DOMAIN; Schema: public; Owner: xtenspg
--

CREATE DOMAIN dom_componentdatatypename AS text
	CONSTRAINT dom_componentdatatypename_check CHECK ((((length(VALUE) > 2) AND (length(VALUE) < 100)) AND (VALUE ~ '^[A-Za-z][A-Za-z0-9]+$'::text)));


ALTER DOMAIN dom_componentdatatypename OWNER TO xtenspg;

--
-- Name: dom_leaftype; Type: DOMAIN; Schema: public; Owner: xtenspg
--

CREATE DOMAIN dom_leaftype AS text NOT NULL
	CONSTRAINT dom_leaftype_check CHECK (((length(VALUE) > 3) AND (length(VALUE) <= 50)));


ALTER DOMAIN dom_leaftype OWNER TO xtenspg;

--
-- Name: dom_nodename; Type: DOMAIN; Schema: public; Owner: xtenspg
--

CREATE DOMAIN dom_nodename AS text COLLATE pg_catalog."C.UTF-8"
	CONSTRAINT dom_nodename_check CHECK (((length(VALUE) > 2) AND (length(VALUE) < 100)));


ALTER DOMAIN dom_nodename OWNER TO xtenspg;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: biobank; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE biobank (
    id integer NOT NULL,
    biobank_id text,
    acronym text,
    name text,
    url text,
    contact_information integer,
    juristic_person text,
    country text,
    description text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE biobank OWNER TO xtenspg;

--
-- Name: biobank_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE biobank_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE biobank_id_seq OWNER TO xtenspg;

--
-- Name: biobank_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE biobank_id_seq OWNED BY biobank.id;


--
-- Name: contact_information; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE contact_information (
    id integer NOT NULL,
    surname text,
    given_name text,
    phone text,
    email text,
    address text,
    zip text,
    city text,
    country text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE contact_information OWNER TO xtenspg;

--
-- Name: contact_information_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE contact_information_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE contact_information_id_seq OWNER TO xtenspg;

--
-- Name: contact_information_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE contact_information_id_seq OWNED BY contact_information.id;


--
-- Name: data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE data (
    id integer NOT NULL,
    type integer,
    parent_subject integer,
    parent_sample integer,
    parent_data integer,
    acquisition_date date,
    metadata jsonb,
    tags jsonb,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE data OWNER TO xtenspg;

--
-- Name: data_file; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE data_file (
    id integer NOT NULL,
    uri text,
    details json,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE data_file OWNER TO xtenspg;

--
-- Name: data_file_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE data_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE data_file_id_seq OWNER TO xtenspg;

--
-- Name: data_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE data_file_id_seq OWNED BY data_file.id;


--
-- Name: data_files__datafile_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE data_files__datafile_data (
    id integer NOT NULL,
    data_files integer,
    datafile_data integer
);


ALTER TABLE data_files__datafile_data OWNER TO xtenspg;

--
-- Name: data_files__datafile_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE data_files__datafile_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE data_files__datafile_data_id_seq OWNER TO xtenspg;

--
-- Name: data_files__datafile_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE data_files__datafile_data_id_seq OWNED BY data_files__datafile_data.id;


--
-- Name: data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE data_id_seq OWNER TO xtenspg;

--
-- Name: data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE data_id_seq OWNED BY data.id;


--
-- Name: data_type; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE data_type (
    id integer NOT NULL,
    name text,
    model text,
    schema jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE data_type OWNER TO xtenspg;

--
-- Name: data_type_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE data_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE data_type_id_seq OWNER TO xtenspg;

--
-- Name: data_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE data_type_id_seq OWNED BY data_type.id;


--
-- Name: datafile_samples__sample_files; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE datafile_samples__sample_files (
    id integer NOT NULL,
    datafile_samples integer,
    sample_files integer
);


ALTER TABLE datafile_samples__sample_files OWNER TO xtenspg;

--
-- Name: datafile_samples__sample_files_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE datafile_samples__sample_files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE datafile_samples__sample_files_id_seq OWNER TO xtenspg;

--
-- Name: datafile_samples__sample_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE datafile_samples__sample_files_id_seq OWNED BY datafile_samples__sample_files.id;


--
-- Name: datatype_children__datatype_parents; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE datatype_children__datatype_parents (
    id integer NOT NULL,
    datatype_parents integer,
    datatype_children integer
);


ALTER TABLE datatype_children__datatype_parents OWNER TO xtenspg;

--
-- Name: datatype_children__datatype_parents_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE datatype_children__datatype_parents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE datatype_children__datatype_parents_id_seq OWNER TO xtenspg;

--
-- Name: datatype_children__datatype_parents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE datatype_children__datatype_parents_id_seq OWNED BY datatype_children__datatype_parents.id;


--
-- Name: datatype_groups__group_datatypes; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE datatype_groups__group_datatypes (
    id integer NOT NULL,
    datatype_groups integer,
    "group_dataTypes" integer
);


ALTER TABLE datatype_groups__group_datatypes OWNER TO xtenspg;

--
-- Name: datatype_groups__group_datatypes_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE datatype_groups__group_datatypes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE datatype_groups__group_datatypes_id_seq OWNER TO xtenspg;

--
-- Name: datatype_groups__group_datatypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE datatype_groups__group_datatypes_id_seq OWNED BY datatype_groups__group_datatypes.id;


--
-- Name: eav_attribute; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_attribute (
    id integer NOT NULL,
    data_type integer,
    loop integer,
    name text,
    field_type text,
    has_unit boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_attribute OWNER TO xtenspg;

--
-- Name: eav_attribute_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_attribute_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_attribute_id_seq OWNER TO xtenspg;

--
-- Name: eav_attribute_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_attribute_id_seq OWNED BY eav_attribute.id;


--
-- Name: eav_loop; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_loop (
    id integer NOT NULL,
    name text,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE eav_loop OWNER TO xtenspg;

--
-- Name: eav_loop_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_loop_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_loop_id_seq OWNER TO xtenspg;

--
-- Name: eav_loop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_loop_id_seq OWNED BY eav_loop.id;


--
-- Name: eav_value_boolean; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_boolean (
    id integer NOT NULL,
    attribute integer,
    value boolean,
    entity_table text,
    entity_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_boolean OWNER TO xtenspg;

--
-- Name: eav_value_boolean_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_boolean_data (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_boolean_data OWNER TO xtenspg;

--
-- Name: eav_value_boolean_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_boolean_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_boolean_data_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_boolean_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_boolean_data_id_seq OWNED BY eav_value_boolean_data.id;


--
-- Name: eav_value_boolean_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_boolean_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_boolean_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_boolean_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_boolean_id_seq OWNED BY eav_value_boolean.id;


--
-- Name: eav_value_boolean_sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_boolean_sample (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_boolean_sample OWNER TO xtenspg;

--
-- Name: eav_value_boolean_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_boolean_sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_boolean_sample_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_boolean_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_boolean_sample_id_seq OWNED BY eav_value_boolean_sample.id;


--
-- Name: eav_value_boolean_subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_boolean_subject (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_boolean_subject OWNER TO xtenspg;

--
-- Name: eav_value_boolean_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_boolean_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_boolean_subject_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_boolean_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_boolean_subject_id_seq OWNED BY eav_value_boolean_subject.id;


--
-- Name: eav_value_date; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_date (
    id integer NOT NULL,
    attribute integer,
    value date,
    entity_table text,
    entity_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_date OWNER TO xtenspg;

--
-- Name: eav_value_date_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_date_data (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_date_data OWNER TO xtenspg;

--
-- Name: eav_value_date_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_date_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_date_data_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_date_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_date_data_id_seq OWNED BY eav_value_date_data.id;


--
-- Name: eav_value_date_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_date_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_date_id_seq OWNED BY eav_value_date.id;


--
-- Name: eav_value_date_sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_date_sample (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_date_sample OWNER TO xtenspg;

--
-- Name: eav_value_date_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_date_sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_date_sample_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_date_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_date_sample_id_seq OWNED BY eav_value_date_sample.id;


--
-- Name: eav_value_date_subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_date_subject (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_date_subject OWNER TO xtenspg;

--
-- Name: eav_value_date_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_date_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_date_subject_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_date_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_date_subject_id_seq OWNED BY eav_value_date_subject.id;


--
-- Name: eav_value_float; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_float (
    id integer NOT NULL,
    attribute integer,
    entity_table text,
    entity_id integer,
    value real,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_float OWNER TO xtenspg;

--
-- Name: eav_value_float_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_float_data (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value real,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_float_data OWNER TO xtenspg;

--
-- Name: eav_value_float_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_float_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_float_data_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_float_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_float_data_id_seq OWNED BY eav_value_float_data.id;


--
-- Name: eav_value_float_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_float_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_float_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_float_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_float_id_seq OWNED BY eav_value_float.id;


--
-- Name: eav_value_float_sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_float_sample (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value real,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_float_sample OWNER TO xtenspg;

--
-- Name: eav_value_float_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_float_sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_float_sample_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_float_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_float_sample_id_seq OWNED BY eav_value_float_sample.id;


--
-- Name: eav_value_float_subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_float_subject (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value real,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_float_subject OWNER TO xtenspg;

--
-- Name: eav_value_float_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_float_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_float_subject_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_float_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_float_subject_id_seq OWNED BY eav_value_float_subject.id;


--
-- Name: eav_value_integer; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_integer (
    id integer NOT NULL,
    attribute integer,
    value integer,
    unit text,
    entity_table text,
    entity_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_integer OWNER TO xtenspg;

--
-- Name: eav_value_integer_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_integer_data (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value integer,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_integer_data OWNER TO xtenspg;

--
-- Name: eav_value_integer_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_integer_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_integer_data_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_integer_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_integer_data_id_seq OWNED BY eav_value_integer_data.id;


--
-- Name: eav_value_integer_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_integer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_integer_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_integer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_integer_id_seq OWNED BY eav_value_integer.id;


--
-- Name: eav_value_integer_sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_integer_sample (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value integer,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_integer_sample OWNER TO xtenspg;

--
-- Name: eav_value_integer_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_integer_sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_integer_sample_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_integer_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_integer_sample_id_seq OWNED BY eav_value_integer_sample.id;


--
-- Name: eav_value_integer_subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_integer_subject (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value integer,
    unit text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_integer_subject OWNER TO xtenspg;

--
-- Name: eav_value_integer_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_integer_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_integer_subject_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_integer_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_integer_subject_id_seq OWNED BY eav_value_integer_subject.id;


--
-- Name: eav_value_text; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_text (
    id integer NOT NULL,
    attribute integer,
    value text,
    entity_table text,
    entity_id integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_text OWNER TO xtenspg;

--
-- Name: eav_value_text_data; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_text_data (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_text_data OWNER TO xtenspg;

--
-- Name: eav_value_text_data_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_text_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_text_data_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_text_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_text_data_id_seq OWNED BY eav_value_text_data.id;


--
-- Name: eav_value_text_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_text_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_text_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_text_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_text_id_seq OWNED BY eav_value_text.id;


--
-- Name: eav_value_text_sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_text_sample (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_text_sample OWNER TO xtenspg;

--
-- Name: eav_value_text_sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_text_sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_text_sample_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_text_sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_text_sample_id_seq OWNED BY eav_value_text_sample.id;


--
-- Name: eav_value_text_subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE eav_value_text_subject (
    id integer NOT NULL,
    entity integer,
    attribute integer,
    value text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE eav_value_text_subject OWNER TO xtenspg;

--
-- Name: eav_value_text_subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE eav_value_text_subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE eav_value_text_subject_id_seq OWNER TO xtenspg;

--
-- Name: eav_value_text_subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE eav_value_text_subject_id_seq OWNED BY eav_value_text_subject.id;


--
-- Name: group_members__operator_groups; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE group_members__operator_groups (
    id integer NOT NULL,
    group_members integer,
    operator_groups integer
);


ALTER TABLE group_members__operator_groups OWNER TO xtenspg;

--
-- Name: group_members__operator_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE group_members__operator_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE group_members__operator_groups_id_seq OWNER TO xtenspg;

--
-- Name: group_members__operator_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE group_members__operator_groups_id_seq OWNED BY group_members__operator_groups.id;


--
-- Name: operator; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE operator (
    id integer NOT NULL,
    login text,
    password text,
    last_name text,
    first_name text,
    birth_date timestamp with time zone,
    sex text,
    email text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE operator OWNER TO xtenspg;

--
-- Name: operator_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE operator_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE operator_id_seq OWNER TO xtenspg;

--
-- Name: operator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE operator_id_seq OWNED BY operator.id;


--
-- Name: personal_details; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE personal_details (
    id integer NOT NULL,
    surname text,
    given_name text,
    birth_date date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE personal_details OWNER TO xtenspg;

--
-- Name: personal_details_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE personal_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE personal_details_id_seq OWNER TO xtenspg;

--
-- Name: personal_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE personal_details_id_seq OWNED BY personal_details.id;


--
-- Name: project; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE project (
    id integer NOT NULL,
    name text,
    description text,
    "createdAt" timestamp with time zone,
    "updatedAt" timestamp with time zone
);


ALTER TABLE project OWNER TO xtenspg;

--
-- Name: project_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE project_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_id_seq OWNER TO xtenspg;

--
-- Name: project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE project_id_seq OWNED BY project.id;


--
-- Name: project_subjects__subject_projects; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE project_subjects__subject_projects (
    id integer NOT NULL,
    project_subjects integer,
    subject_projects integer
);


ALTER TABLE project_subjects__subject_projects OWNER TO xtenspg;

--
-- Name: project_subjects__subject_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE project_subjects__subject_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE project_subjects__subject_projects_id_seq OWNER TO xtenspg;

--
-- Name: project_subjects__subject_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE project_subjects__subject_projects_id_seq OWNED BY project_subjects__subject_projects.id;


--
-- Name: sample; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE sample (
    id integer NOT NULL,
    type integer,
    parent_subject integer,
    parent_sample integer,
    biobank integer,
    biobank_code text,
    metadata jsonb,
    tags jsonb,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE sample OWNER TO xtenspg;

--
-- Name: sample_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE sample_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE sample_id_seq OWNER TO xtenspg;

--
-- Name: sample_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE sample_id_seq OWNED BY sample.id;


--
-- Name: subject; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE subject (
    id integer NOT NULL,
    type integer,
    personal_info integer,
    code text,
    sex text,
    metadata jsonb,
    tags jsonb,
    notes text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE subject OWNER TO xtenspg;

--
-- Name: subject_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE subject_id_seq OWNER TO xtenspg;

--
-- Name: subject_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE subject_id_seq OWNED BY subject.id;


--
-- Name: xtens_group; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE TABLE xtens_group (
    id integer NOT NULL,
    name text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE xtens_group OWNER TO xtenspg;

--
-- Name: xtens_group_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
--

CREATE SEQUENCE xtens_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE xtens_group_id_seq OWNER TO xtenspg;

--
-- Name: xtens_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
--

ALTER SEQUENCE xtens_group_id_seq OWNED BY xtens_group.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY biobank ALTER COLUMN id SET DEFAULT nextval('biobank_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY contact_information ALTER COLUMN id SET DEFAULT nextval('contact_information_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY data ALTER COLUMN id SET DEFAULT nextval('data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY data_file ALTER COLUMN id SET DEFAULT nextval('data_file_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY data_files__datafile_data ALTER COLUMN id SET DEFAULT nextval('data_files__datafile_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY data_type ALTER COLUMN id SET DEFAULT nextval('data_type_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY datafile_samples__sample_files ALTER COLUMN id SET DEFAULT nextval('datafile_samples__sample_files_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY datatype_children__datatype_parents ALTER COLUMN id SET DEFAULT nextval('datatype_children__datatype_parents_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY datatype_groups__group_datatypes ALTER COLUMN id SET DEFAULT nextval('datatype_groups__group_datatypes_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_attribute ALTER COLUMN id SET DEFAULT nextval('eav_attribute_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_loop ALTER COLUMN id SET DEFAULT nextval('eav_loop_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_boolean ALTER COLUMN id SET DEFAULT nextval('eav_value_boolean_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_boolean_data ALTER COLUMN id SET DEFAULT nextval('eav_value_boolean_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_boolean_sample ALTER COLUMN id SET DEFAULT nextval('eav_value_boolean_sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_boolean_subject ALTER COLUMN id SET DEFAULT nextval('eav_value_boolean_subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_date ALTER COLUMN id SET DEFAULT nextval('eav_value_date_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_date_data ALTER COLUMN id SET DEFAULT nextval('eav_value_date_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_date_sample ALTER COLUMN id SET DEFAULT nextval('eav_value_date_sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_date_subject ALTER COLUMN id SET DEFAULT nextval('eav_value_date_subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_float ALTER COLUMN id SET DEFAULT nextval('eav_value_float_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_float_data ALTER COLUMN id SET DEFAULT nextval('eav_value_float_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_float_sample ALTER COLUMN id SET DEFAULT nextval('eav_value_float_sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_float_subject ALTER COLUMN id SET DEFAULT nextval('eav_value_float_subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_integer ALTER COLUMN id SET DEFAULT nextval('eav_value_integer_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_integer_data ALTER COLUMN id SET DEFAULT nextval('eav_value_integer_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_integer_sample ALTER COLUMN id SET DEFAULT nextval('eav_value_integer_sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_integer_subject ALTER COLUMN id SET DEFAULT nextval('eav_value_integer_subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_text ALTER COLUMN id SET DEFAULT nextval('eav_value_text_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_text_data ALTER COLUMN id SET DEFAULT nextval('eav_value_text_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_text_sample ALTER COLUMN id SET DEFAULT nextval('eav_value_text_sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY eav_value_text_subject ALTER COLUMN id SET DEFAULT nextval('eav_value_text_subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY group_members__operator_groups ALTER COLUMN id SET DEFAULT nextval('group_members__operator_groups_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY operator ALTER COLUMN id SET DEFAULT nextval('operator_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY personal_details ALTER COLUMN id SET DEFAULT nextval('personal_details_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY project ALTER COLUMN id SET DEFAULT nextval('project_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY project_subjects__subject_projects ALTER COLUMN id SET DEFAULT nextval('project_subjects__subject_projects_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY sample ALTER COLUMN id SET DEFAULT nextval('sample_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY subject ALTER COLUMN id SET DEFAULT nextval('subject_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
--

ALTER TABLE ONLY xtens_group ALTER COLUMN id SET DEFAULT nextval('xtens_group_id_seq'::regclass);


--
-- Data for Name: biobank; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY biobank (id, biobank_id, acronym, name, url, contact_information, juristic_person, country, description, created_at, updated_at) FROM stdin;
2	B-01	bio-A	Tumour Biobank - A	\N	2	A Hospital	IT	A test Biobank	2015-02-27 16:21:35+00	2015-02-27 16:21:35+00
3	B-02	bio-B	Tumour Biobank - B	\N	3	B Hospital	IT	A test biobank	2015-02-27 16:23:16+00	2015-02-27 16:23:16+00
4	B-03	bio-C	Tumour Biobank - C	\N	4	C Hospital	IT	\N	2015-02-27 16:24:51+00	2015-02-27 16:25:06+00
5	B-04	bio-D	Tumour Biobank - D	\N	5	D Hospital	IT	\N	2015-02-27 16:26:28+00	2015-02-27 16:26:28+00
1	B-00	bio-E	Tumour Biobank - E	\N	1	E Hospital	IT	\N	2015-02-27 15:55:17+00	2015-02-27 16:49:11+00
\.


--
-- Name: biobank_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('biobank_id_seq', 5, true);


--
-- Data for Name: contact_information; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY contact_information (id, surname, given_name, phone, email, address, zip, city, country, created_at, updated_at) FROM stdin;
2	Asurname	Aname	+39010	a@a.it	Via A 1	16100	Genoa	IT	2015-02-27 16:21:35+00	2015-02-27 16:21:35+00
3	Bname	Bname	+39010	b@b.it	Via B 1	16100	Genova	IT	2015-02-27 16:23:16+00	2015-02-27 16:23:16+00
4	Csurname	Cname	+39010	c@c.it	Via C 1	16100	Genoa	IT	2015-02-27 16:24:51+00	2015-02-27 16:25:06+00
5	Dsurname	Dname	+39010	d@d.it	Via D 1	16100	Genoa	IT	2015-02-27 16:26:28+00	2015-02-27 16:26:28+00
1	Esurname	Ename	+390103530001	e@e.it	Largo E 1	16147	Genoa	IT	2015-02-27 15:55:17+00	2015-02-27 16:49:10+00
\.


--
-- Name: contact_information_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('contact_information_id_seq', 5, true);


--
-- Data for Name: data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY data (id, type, parent_subject, parent_sample, parent_data, acquisition_date, metadata, tags, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: data_file; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY data_file (id, uri, details, created_at, updated_at) FROM stdin;
\.


--
-- Name: data_file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('data_file_id_seq', 1, false);


--
-- Data for Name: data_files__datafile_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY data_files__datafile_data (id, data_files, datafile_data) FROM stdin;
\.


--
-- Name: data_files__datafile_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('data_files__datafile_data_id_seq', 1, false);


--
-- Name: data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('data_id_seq', 1, false);


--
-- Data for Name: data_type; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY data_type (id, name, model, schema, created_at, updated_at) FROM stdin;
3	Patient	Subject	{"body": [{"name": "Patient Risk Factors", "label": "METADATA GROUP", "content": [{"name": "ethnic_group", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": true, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["white", "asian", "black", "mixed/multiple", "other", "N.A."]}, {"min": "0", "name": "body_mass index", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": false, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["kg/m^2"], "possibleValues": null}]}], "header": {"name": "Patient", "model": "Subject", "version": "1.0", "ontology": "", "fileUpload": false, "description": "A generic patient for performance testing"}}	2015-02-24 15:21:09.155+00	2015-02-24 15:22:10.392+00
5	Fluid	Sample	{"body": [{"name": "Fluid Details", "label": "METADATA GROUP", "content": [{"name": "sampling_date", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Date", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["blood plasma", "blood serum", "amniotic fluid", "cerebrospinal fluid", "saliva", "bile", "urine", "other"]}, {"name": "class", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["amniotic fluid", "bile", "blood plasma", "blood serum", "cerebrospinal fluid", "saliva", "urine", "whole blood", "other"]}, {"min": "0.0", "name": "volume", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": false, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["ml", "μl"], "possibleValues": null}]}], "header": {"name": "Fluid", "model": "Sample", "version": "1.0", "ontology": "", "fileUpload": false, "description": "A fluid sample type for performance tests"}}	2015-02-24 16:20:01.176+00	2015-02-24 16:20:01.176+00
6	DNA	Sample	{"body": [{"name": "DNA Details", "label": "METADATA GROUP", "content": [{"name": "sampling_date", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Date", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"min": "0.0", "name": "quantity", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": true, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["µg"], "possibleValues": null}, {"min": "0.0", "name": "concentration", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": false, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["ng/µl"], "possibleValues": null}]}], "header": {"name": "DNA", "model": "Sample", "version": "1.0", "ontology": "", "fileUpload": true, "description": "A generic DNA sample for performance tests"}}	2015-02-24 16:41:40.516+00	2015-02-24 16:41:40.516+00
4	Tissue	Sample	{"body": [{"name": "Tissue Details", "label": "METADATA GROUP", "content": [{"name": "sampling_date", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Date", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "tumour", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Boolean", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "topography", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "morphology", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "volume", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": false, "required": true, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["mm^3"], "possibleValues": null}, {"name": "benign", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Boolean", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}]}], "header": {"name": "Tissue", "model": "Sample", "version": "1.0", "ontology": "", "fileUpload": true, "description": "A generic tissue sample for performance testing"}}	2015-02-24 16:00:23.334+00	2015-02-27 15:45:20.442+00
7	RNA	Sample	{"body": [{"name": "RNA Details", "label": "METADATA GROUP", "content": [{"name": "sampling_date", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Date", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"min": "0.0", "name": "quantity", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": true, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["µg"], "possibleValues": null}, {"min": "0", "name": "concentration", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": false, "fieldType": "Float", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["ng/µl"], "possibleValues": null}]}], "header": {"name": "RNA", "model": "Sample", "version": "1.0", "ontology": "", "fileUpload": true, "description": "A generic RNA sample for performance testing"}}	2015-02-24 16:44:34.874+00	2015-02-24 16:44:34.874+00
9	CGH Array Report	Data	{"body": [{"name": "Prognostic Genomic Profile", "label": "METADATA GROUP", "content": [{"name": "prognostic_profile", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["SCA profile", "NCA profile", "NO RESULT profile"]}]}, {"name": "CGH Report Details", "label": "METADATA GROUP", "content": [{"name": "structural_abnormalities", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Boolean", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "numerical_abnormalities", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Boolean", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}]}], "header": {"name": "CGH Array Report", "model": "Data", "version": "", "ontology": "", "fileUpload": false, "description": "A generic CGH report for performance tests"}}	2015-02-24 17:25:03.338+00	2015-02-24 17:25:03.338+00
10	Whole Genome Sequencing	Data	{"body": [{"name": "Platform Details", "label": "METADATA GROUP", "content": [{"name": "instrument_model", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": true, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["Illumina Genome Analyzer II", "Illumina HiSeq 1000", "Illumina HiSeq 2000", "Illumina HiSeq 2500", "Illumina HiSeq 3000", "AB Solid System", "AB 5500 Genetic Analyzer", "454 GS", "454 GS FLX+", "Ion Torrent"]}, {"name": "read_length", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": false, "required": false, "fieldType": "Integer", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["bp"], "possibleValues": null}, {"name": "is_paired end", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Boolean", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}]}, {"name": "Analysis Details", "label": "METADATA GROUP", "content": [{"name": "total_reads", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Integer", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "high_quality reads", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Integer", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": null}, {"name": "reference_genome", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": false, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["hg18", "hg19", "hg38"]}]}], "header": {"name": "Whole Genome Sequencing", "model": "Data", "version": "1.0", "ontology": "", "fileUpload": true, "description": "A whole genome sequencing data type for performance testing"}}	2015-02-27 11:54:15.713+00	2015-02-27 11:54:15.713+00
8	Clinical Situation	Data	{"body": [{"name": "Clinical Info", "label": "METADATA GROUP", "content": [{"name": "current_status", "label": "METADATA FIELD", "isList": true, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["alive - complete remission", "alive - residual disease", "alive - active disease", "alive - other disease", "dead for disease", "dead for other causes"]}, {"name": "disease", "label": "METADATA FIELD", "isList": false, "hasUnit": false, "hasRange": false, "required": true, "fieldType": "Text", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": null, "possibleValues": ["carcinoma", "lymphoma", "sarcoma", "other", "N.D.", "N.A."]}, {"min": "0", "name": "diagnosis_age", "label": "METADATA FIELD", "isList": false, "hasUnit": true, "hasRange": true, "required": false, "fieldType": "Integer", "sensitive": false, "customValue": null, "ontologyUri": null, "possibleUnits": ["day", "month", "year"], "possibleValues": null}]}], "header": {"name": "Clinical Situation", "model": "Data", "version": "1.0", "ontology": "", "fileUpload": false, "description": "A generic Clinical Situation for performance tests"}}	2015-02-24 16:58:20.697+00	2015-02-27 15:47:41.189+00
\.


--
-- Name: data_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('data_type_id_seq', 10, true);


--
-- Data for Name: datafile_samples__sample_files; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY datafile_samples__sample_files (id, datafile_samples, sample_files) FROM stdin;
\.


--
-- Name: datafile_samples__sample_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('datafile_samples__sample_files_id_seq', 1, false);


--
-- Data for Name: datatype_children__datatype_parents; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY datatype_children__datatype_parents (id, datatype_parents, datatype_children) FROM stdin;
1	4	3
2	5	3
3	6	4
4	6	5
5	7	4
6	7	5
7	8	3
8	9	6
9	10	6
\.


--
-- Name: datatype_children__datatype_parents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('datatype_children__datatype_parents_id_seq', 9, true);


--
-- Data for Name: datatype_groups__group_datatypes; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY datatype_groups__group_datatypes (id, datatype_groups, "group_dataTypes") FROM stdin;
\.


--
-- Name: datatype_groups__group_datatypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('datatype_groups__group_datatypes_id_seq', 1, false);


--
-- Data for Name: eav_attribute; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_attribute (id, data_type, loop, name, field_type, has_unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_attribute_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_attribute_id_seq', 1, false);


--
-- Data for Name: eav_loop; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_loop (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: eav_loop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_loop_id_seq', 1, false);


--
-- Data for Name: eav_value_boolean; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_boolean (id, attribute, value, entity_table, entity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: eav_value_boolean_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_boolean_data (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_boolean_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_boolean_data_id_seq', 1, false);


--
-- Name: eav_value_boolean_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_boolean_id_seq', 1, false);


--
-- Data for Name: eav_value_boolean_sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_boolean_sample (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_boolean_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_boolean_sample_id_seq', 1, false);


--
-- Data for Name: eav_value_boolean_subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_boolean_subject (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_boolean_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_boolean_subject_id_seq', 1, false);


--
-- Data for Name: eav_value_date; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_date (id, attribute, value, entity_table, entity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: eav_value_date_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_date_data (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_date_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_date_data_id_seq', 1, false);


--
-- Name: eav_value_date_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_date_id_seq', 1, false);


--
-- Data for Name: eav_value_date_sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_date_sample (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_date_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_date_sample_id_seq', 1, false);


--
-- Data for Name: eav_value_date_subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_date_subject (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_date_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_date_subject_id_seq', 1, false);


--
-- Data for Name: eav_value_float; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_float (id, attribute, entity_table, entity_id, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: eav_value_float_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_float_data (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_float_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_float_data_id_seq', 1, false);


--
-- Name: eav_value_float_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_float_id_seq', 1, false);


--
-- Data for Name: eav_value_float_sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_float_sample (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_float_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_float_sample_id_seq', 1, false);


--
-- Data for Name: eav_value_float_subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_float_subject (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_float_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_float_subject_id_seq', 1, false);


--
-- Data for Name: eav_value_integer; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_integer (id, attribute, value, unit, entity_table, entity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: eav_value_integer_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_integer_data (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_integer_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_integer_data_id_seq', 1, false);


--
-- Name: eav_value_integer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_integer_id_seq', 1, false);


--
-- Data for Name: eav_value_integer_sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_integer_sample (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_integer_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_integer_sample_id_seq', 1, false);


--
-- Data for Name: eav_value_integer_subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_integer_subject (id, entity, attribute, value, unit, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_integer_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_integer_subject_id_seq', 1, false);


--
-- Data for Name: eav_value_text; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_text (id, attribute, value, entity_table, entity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: eav_value_text_data; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_text_data (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_text_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_text_data_id_seq', 1, false);


--
-- Name: eav_value_text_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_text_id_seq', 1, false);


--
-- Data for Name: eav_value_text_sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_text_sample (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_text_sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_text_sample_id_seq', 1, false);


--
-- Data for Name: eav_value_text_subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY eav_value_text_subject (id, entity, attribute, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: eav_value_text_subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('eav_value_text_subject_id_seq', 1, false);


--
-- Data for Name: group_members__operator_groups; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY group_members__operator_groups (id, group_members, operator_groups) FROM stdin;
2	1	1
3	1	2
\.


--
-- Name: group_members__operator_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('group_members__operator_groups_id_seq', 3, true);


--
-- Data for Name: operator; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY operator (id, login, password, last_name, first_name, birth_date, sex, email, created_at, updated_at) FROM stdin;
1	vale	$2a$10$qc/mzrODjlPSIluE9Fv4MONyfJziOpWwx7EtuMXQ2OEi8CTwZ/Tki	tedone	valentina	1988-04-27 00:00:00+00	F	valetedo88@gmail.com	2015-01-29 15:21:42+00	2015-01-29 15:21:42+00
2	massi	$2a$10$FfauEwuGyZIEYA.IBguUUe75rQE4jm1.H62JwtXia8ROJc3Ci7twi	Izzo	Massimiliano	2015-02-22 00:00:00+00	M	massimorgon@gmail.com	2015-02-16 11:32:20+00	2015-02-16 11:32:20+00
\.


--
-- Name: operator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('operator_id_seq', 2, true);


--
-- Data for Name: personal_details; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY personal_details (id, surname, given_name, birth_date, created_at, updated_at) FROM stdin;
\.


--
-- Name: personal_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('personal_details_id_seq', 1, false);


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY project (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('project_id_seq', 1, false);


--
-- Data for Name: project_subjects__subject_projects; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY project_subjects__subject_projects (id, project_subjects, subject_projects) FROM stdin;
\.


--
-- Name: project_subjects__subject_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('project_subjects__subject_projects_id_seq', 1, false);


--
-- Data for Name: sample; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY sample (id, type, parent_subject, parent_sample, biobank, biobank_code, metadata, created_at, updated_at, tags) FROM stdin;
\.


--
-- Name: sample_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('sample_id_seq', 1, false);


--
-- Data for Name: subject; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY subject (id, type, personal_info, code, sex, metadata, tags, notes, created_at, updated_at) FROM stdin;
\.


--
-- Name: subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('subject_id_seq', 1, false);


--
-- Data for Name: xtens_group; Type: TABLE DATA; Schema: public; Owner: xtenspg
--

COPY xtens_group (id, name, created_at, updated_at) FROM stdin;
1	admin	2015-02-24 14:30:23+00	2015-02-24 14:30:28+00
\.


--
-- Name: xtens_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xtenspg
--

SELECT pg_catalog.setval('xtens_group_id_seq', 1, true);


--
-- Name: biobank_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY biobank
    ADD CONSTRAINT biobank_pkey PRIMARY KEY (id);


--
-- Name: contact_information_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY contact_information
    ADD CONSTRAINT contact_information_pkey PRIMARY KEY (id);


--
-- Name: data_file_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY data_file
    ADD CONSTRAINT data_file_pkey PRIMARY KEY (id);


--
-- Name: data_file_uri_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY data_file
    ADD CONSTRAINT data_file_uri_key UNIQUE (uri);


--
-- Name: data_files__datafile_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY data_files__datafile_data
    ADD CONSTRAINT data_files__datafile_data_pkey PRIMARY KEY (id);


--
-- Name: data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY data
    ADD CONSTRAINT data_pkey PRIMARY KEY (id);


--
-- Name: data_type_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY data_type
    ADD CONSTRAINT data_type_pkey PRIMARY KEY (id);


--
-- Name: datafile_samples__sample_files_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY datafile_samples__sample_files
    ADD CONSTRAINT datafile_samples__sample_files_pkey PRIMARY KEY (id);


--
-- Name: datatype_children__datatype_parents_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY datatype_children__datatype_parents
    ADD CONSTRAINT datatype_children__datatype_parents_pkey PRIMARY KEY (id);


--
-- Name: datatype_groups__group_datatypes_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY datatype_groups__group_datatypes
    ADD CONSTRAINT datatype_groups__group_datatypes_pkey PRIMARY KEY (id);


--
-- Name: eav_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_attribute
    ADD CONSTRAINT eav_attribute_pkey PRIMARY KEY (id);


--
-- Name: eav_loop_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_loop
    ADD CONSTRAINT eav_loop_pkey PRIMARY KEY (id);


--
-- Name: eav_value_boolean_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_boolean_data
    ADD CONSTRAINT eav_value_boolean_data_pkey PRIMARY KEY (id);


--
-- Name: eav_value_boolean_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_boolean
    ADD CONSTRAINT eav_value_boolean_pkey PRIMARY KEY (id);


--
-- Name: eav_value_boolean_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_boolean_sample
    ADD CONSTRAINT eav_value_boolean_sample_pkey PRIMARY KEY (id);


--
-- Name: eav_value_boolean_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_boolean_subject
    ADD CONSTRAINT eav_value_boolean_subject_pkey PRIMARY KEY (id);


--
-- Name: eav_value_date_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_date_data
    ADD CONSTRAINT eav_value_date_data_pkey PRIMARY KEY (id);


--
-- Name: eav_value_date_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_date
    ADD CONSTRAINT eav_value_date_pkey PRIMARY KEY (id);


--
-- Name: eav_value_date_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_date_sample
    ADD CONSTRAINT eav_value_date_sample_pkey PRIMARY KEY (id);


--
-- Name: eav_value_date_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_date_subject
    ADD CONSTRAINT eav_value_date_subject_pkey PRIMARY KEY (id);


--
-- Name: eav_value_float_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_float_data
    ADD CONSTRAINT eav_value_float_data_pkey PRIMARY KEY (id);


--
-- Name: eav_value_float_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_float
    ADD CONSTRAINT eav_value_float_pkey PRIMARY KEY (id);


--
-- Name: eav_value_float_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_float_sample
    ADD CONSTRAINT eav_value_float_sample_pkey PRIMARY KEY (id);


--
-- Name: eav_value_float_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_float_subject
    ADD CONSTRAINT eav_value_float_subject_pkey PRIMARY KEY (id);


--
-- Name: eav_value_integer_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_integer_data
    ADD CONSTRAINT eav_value_integer_data_pkey PRIMARY KEY (id);


--
-- Name: eav_value_integer_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_integer
    ADD CONSTRAINT eav_value_integer_pkey PRIMARY KEY (id);


--
-- Name: eav_value_integer_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_integer_sample
    ADD CONSTRAINT eav_value_integer_sample_pkey PRIMARY KEY (id);


--
-- Name: eav_value_integer_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_integer_subject
    ADD CONSTRAINT eav_value_integer_subject_pkey PRIMARY KEY (id);


--
-- Name: eav_value_text_data_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_text_data
    ADD CONSTRAINT eav_value_text_data_pkey PRIMARY KEY (id);


--
-- Name: eav_value_text_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_text
    ADD CONSTRAINT eav_value_text_pkey PRIMARY KEY (id);


--
-- Name: eav_value_text_sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_text_sample
    ADD CONSTRAINT eav_value_text_sample_pkey PRIMARY KEY (id);


--
-- Name: eav_value_text_subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY eav_value_text_subject
    ADD CONSTRAINT eav_value_text_subject_pkey PRIMARY KEY (id);


--
-- Name: group_members__operator_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY group_members__operator_groups
    ADD CONSTRAINT group_members__operator_groups_pkey PRIMARY KEY (id);


--
-- Name: operator_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY operator
    ADD CONSTRAINT operator_pkey PRIMARY KEY (id);


--
-- Name: personal_details_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY personal_details
    ADD CONSTRAINT personal_details_pkey PRIMARY KEY (id);


--
-- Name: project_name_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY project
    ADD CONSTRAINT project_name_key UNIQUE (name);


--
-- Name: project_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: project_subjects__subject_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY project_subjects__subject_projects
    ADD CONSTRAINT project_subjects__subject_projects_pkey PRIMARY KEY (id);


--
-- Name: sample_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY sample
    ADD CONSTRAINT sample_pkey PRIMARY KEY (id);


--
-- Name: subject_code_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY subject
    ADD CONSTRAINT subject_code_key UNIQUE (code);


--
-- Name: subject_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id);


--
-- Name: xtens_group_name_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY xtens_group
    ADD CONSTRAINT xtens_group_name_key UNIQUE (name);


--
-- Name: xtens_group_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace: 
--

ALTER TABLE ONLY xtens_group
    ADD CONSTRAINT xtens_group_pkey PRIMARY KEY (id);


--
-- Name: typedata; Type: INDEX; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE INDEX typedata ON data USING btree (type);


--
-- Name: typesample; Type: INDEX; Schema: public; Owner: xtenspg; Tablespace: 
--

CREATE INDEX typesample ON sample USING btree (type);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: dom_componentdatatypename; Type: ACL; Schema: public; Owner: xtenspg
--

REVOKE ALL ON TYPE dom_componentdatatypename FROM PUBLIC;
REVOKE ALL ON TYPE dom_componentdatatypename FROM xtenspg;
GRANT ALL ON TYPE dom_componentdatatypename TO PUBLIC;


--
-- Name: dom_leaftype; Type: ACL; Schema: public; Owner: xtenspg
--

REVOKE ALL ON TYPE dom_leaftype FROM PUBLIC;
REVOKE ALL ON TYPE dom_leaftype FROM xtenspg;
GRANT ALL ON TYPE dom_leaftype TO PUBLIC;


--
-- PostgreSQL database dump complete
--

