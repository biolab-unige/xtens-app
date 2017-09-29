--
-- XTENS 2 PostgreSQL database updating super type
--
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;


CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET search_path = public, pg_catalog;



CREATE OR REPLACE FUNCTION apply_schema_changes_supertype() RETURNS integer AS $$


  BEGIN

  --
  -- Name: super_type; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace:
  --

  CREATE TABLE super_type (
      id integer NOT NULL,
      name text NOT NULL,
      uri text,
      schema jsonb NOT NULL,
      created_at timestamp with time zone NOT NULL,
      updated_at timestamp with time zone NOT NULL
  );


  ALTER TABLE super_type OWNER TO xtenspg;


  --
  -- Name: super_type_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
  --

  CREATE SEQUENCE super_type_id_seq
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;


  ALTER TABLE super_type_id_seq OWNER TO xtenspg;

  --
  -- Name: super_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
  --

  ALTER SEQUENCE super_type_id_seq OWNED BY super_type.id;

  ALTER TABLE ONLY super_type
      ADD CONSTRAINT super_type_pkey PRIMARY KEY (id);

  ALTER TABLE ONLY super_type ALTER COLUMN id SET DEFAULT nextval('super_type_id_seq'::regclass);


  --new column super_type one to many data_type - super_type

  ALTER TABLE data_type ADD COLUMN super_type integer;

  -- vincolo nuovo campo super_type FOREIGN KEY

  ALTER TABLE ONLY data_type
      ADD CONSTRAINT super_type_fkey FOREIGN KEY (super_type) REFERENCES super_type(id) MATCH FULL ON DELETE RESTRICT;


  -- COPIO LE INFO DA data_type A super_type tranne uri
  INSERT INTO super_type (id,name,schema,created_at,updated_at) SELECT id,name,schema,created_at,updated_at FROM data_type;

  -- setto un uri di default per impostare il vincolo NOT NULL
  UPDATE super_type SET uri = 'http://domain.com';
  ALTER TABLE super_type ALTER COLUMN uri SET NOT NULL ;

  --SETTO GLI ID DI ASSOCIAZIONE TRA data_type E super_type
  UPDATE data_type SET super_type=st.id FROM (SELECT id FROM super_type) AS st WHERE data_type.id=st.id;

  ALTER TABLE data_type ALTER COLUMN super_type SET NOT NULL;

  ALTER TABLE data_type DROP COLUMN schema;


  REVOKE ALL ON TABLE super_type FROM PUBLIC;
  REVOKE ALL ON TABLE super_type FROM xtenspg;
  GRANT ALL ON TABLE super_type TO xtenspg;


  --
  -- Name: super_type_id_seq; Type: ACL; Schema: public; Owner: xtenspg
  --

  REVOKE ALL ON SEQUENCE super_type_id_seq FROM PUBLIC;
  REVOKE ALL ON SEQUENCE super_type_id_seq FROM xtenspg;
  GRANT ALL ON SEQUENCE super_type_id_seq TO xtenspg;

  RETURN 1;
  END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION main_migration_supertype() RETURNS integer AS $$

  BEGIN
    PERFORM apply_schema_changes_supertype();


    -- DROP created functions
    DROP FUNCTION apply_schema_changes_supertype();
    RETURN 1;
  END;
$$ LANGUAGE plpgsql;


SELECT * FROM main_migration_supertype();
