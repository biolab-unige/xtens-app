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


CREATE OR REPLACE FUNCTION address_creation() RETURNS integer AS $$
  DECLARE
      operator RECORD;
      address_information RECORD;

  BEGIN

      RAISE info 'Start creating address - operator';

    -- create address for every operator
      FOR operator IN SELECT * FROM operator ORDER BY id LOOP
          EXECUTE 'INSERT INTO address_information (office,phone,address,zip,city,country,created_at,updated_at) VALUES (' || quote_literal('Office') || ', '  || '101010101010' ||
          ', ' || quote_literal('Address') || ', ' || '00000'  || ', ' || quote_literal('City') || ', ' || quote_literal('AA') || ', ' || quote_literal('1900-01-01') || ', ' || quote_literal('1900-01-01') || ')';
          SELECT * INTO address_information FROM address_information order by id desc limit 1;
          RAISE info 'address_information id %', address_information.id;

          EXECUTE 'UPDATE operator SET address_information =' || quote_literal(address_information.id) || 'WHERE id = ' || quote_literal(operator.id);
      END LOOP;

      RAISE info 'Done creating address - operator.';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION apply_schema_changes_owner(id_owner int default 0) RETURNS integer AS $$


  BEGIN

  CREATE TABLE address_information (
    id integer NOT NULL,
    office text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    zip text NOT NULL,
    city text NOT NULL,
    country text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE address_information OWNER TO xtenspg;

CREATE SEQUENCE address_information_id_seq START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE address_information_id_seq OWNER TO xtenspg;


ALTER SEQUENCE address_information_id_seq OWNED BY address_information.id;

ALTER TABLE ONLY address_information ALTER COLUMN id SET DEFAULT nextval('address_information_id_seq'::regclass);

ALTER TABLE ONLY address_information
  ADD CONSTRAINT address_information_pkey PRIMARY KEY (id);

alter table operator add column address_information integer;

ALTER TABLE ONLY operator
  ADD CONSTRAINT address_information_fkey FOREIGN KEY (address_information) REFERENCES address_information(id) MATCH FULL ON DELETE CASCADE;


  --new column super_type one to many data_type - super_type

alter table data add column owner integer;
alter table sample add column owner integer;
alter table subject add column owner integer;

  -- vincolo nuovo campo super_type FOREIGN KEY

  ALTER TABLE ONLY data
    ADD CONSTRAINT owner_fkey FOREIGN KEY (owner) REFERENCES operator(id) MATCH FULL;
  ALTER TABLE ONLY sample
    ADD CONSTRAINT owner_fkey FOREIGN KEY (owner) REFERENCES operator(id) MATCH FULL;
  ALTER TABLE ONLY subject
    ADD CONSTRAINT owner_fkey FOREIGN KEY (owner) REFERENCES operator(id) MATCH FULL;

  update data set owner = id_owner;
  update sample set owner = id_owner;
  update subject set owner = id_owner;

  ALTER TABLE data ALTER COLUMN owner SET NOT NULL ;
  ALTER TABLE sample ALTER COLUMN owner SET NOT NULL ;
  ALTER TABLE subject ALTER COLUMN owner SET NOT NULL ;

  --Set address - operator association
  PERFORM address_creation();


  ALTER TABLE operator ALTER COLUMN address_information SET NOT NULL;


  REVOKE ALL ON TABLE address_information FROM PUBLIC;
  REVOKE ALL ON TABLE address_information FROM xtenspg;
  GRANT ALL ON TABLE address_information TO xtenspg;


  --
  -- Name: super_type_id_seq; Type: ACL; Schema: public; Owner: xtenspg
  --

  REVOKE ALL ON SEQUENCE address_information_id_seq FROM PUBLIC;
  REVOKE ALL ON SEQUENCE address_information_id_seq FROM xtenspg;
  GRANT ALL ON SEQUENCE address_information_id_seq TO xtenspg;

  RETURN 1;
  END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION main_migration_owner( id_owner int default 0) RETURNS integer AS $$

  BEGIN
    PERFORM apply_schema_changes_owner(id_owner);


    -- DROP created functions
    DROP FUNCTION apply_schema_changes_owner(int);
    RETURN 1;
  END;
$$ LANGUAGE plpgsql;


SELECT * FROM main_migration_owner(set_id_owner_here); --set the global id_owner
