--
-- XTENS 2 PostgreSQL database migration from 2.0 to 2.1
--
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
--
-- Name: group_projects__project_groups; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace:
--
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

SET search_path = public, pg_catalog;



CREATE OR REPLACE FUNCTION apply_schema_changes() RETURNS integer AS $$


  BEGIN
  --
  -- Name: group_projects__project_groups; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace:
  --

  CREATE TABLE group_projects__project_groups (
    id integer NOT NULL,
    project_groups integer NOT NULL,
    group_projects integer NOT NULL
  );


  ALTER TABLE group_projects__project_groups OWNER TO xtenspg;

  --
  -- Name: group_projects__project_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
  --

  CREATE SEQUENCE group_projects__project_groups_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


  ALTER TABLE group_projects__project_groups_id_seq OWNER TO xtenspg;

  --
  -- Name: group_projects__project_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xtenspg
  --

  ALTER SEQUENCE group_projects__project_groups_id_seq OWNED BY group_projects__project_groups.id;
  --
  -- Name: id; Type: DEFAULT; Schema: public; Owner: xtenspg
  --

  ALTER TABLE ONLY group_projects__project_groups ALTER COLUMN id SET DEFAULT nextval('group_projects__project_groups_id_seq'::regclass);
  --
  -- Name: group_projects__project_groups_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace:
  --

  ALTER TABLE ONLY group_projects__project_groups
  ADD CONSTRAINT group_projects__project_groups_key UNIQUE (project_groups, group_projects);


  --
  -- Name: group_projects__project_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace:
  --

  ALTER TABLE ONLY group_projects__project_groups
  ADD CONSTRAINT group_projects__project_groups_pkey PRIMARY KEY (id);

  --
  -- Name: project_subjects_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xtenspg
  --

  ALTER TABLE ONLY group_projects__project_groups
  ADD CONSTRAINT project_groups_fkey FOREIGN KEY (project_groups) REFERENCES project(id) MATCH FULL ON DELETE CASCADE;

  --
  -- Name: subject_projects_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xtenspg
  --

  ALTER TABLE ONLY group_projects__project_groups
  ADD CONSTRAINT group_projects_fkey FOREIGN KEY (group_projects) REFERENCES xtens_group(id) MATCH FULL ON DELETE CASCADE;

  --
  -- Name: group_projects__project_groups; Type: ACL; Schema: public; Owner: xtenspg
  --

  REVOKE ALL ON TABLE group_projects__project_groups FROM PUBLIC;
  REVOKE ALL ON TABLE group_projects__project_groups FROM xtenspg;
  GRANT ALL ON TABLE group_projects__project_groups TO xtenspg;


  --
  -- Name: group_projects__project_groups_id_seq; Type: ACL; Schema: public; Owner: xtenspg
  --

  REVOKE ALL ON SEQUENCE group_projects__project_groups_id_seq FROM PUBLIC;
  REVOKE ALL ON SEQUENCE group_projects__project_groups_id_seq FROM xtenspg;
  GRANT ALL ON SEQUENCE group_projects__project_groups_id_seq TO xtenspg;

  --
  -- Name: data_type; Type: ACL; Schema: public; Owner: xtenspg
  --



  ALTER TABLE data_type ADD COLUMN project integer;

  --
  -- Name: project_fkey; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace:
  --

  ALTER TABLE ONLY data_type ADD CONSTRAINT project_fkey FOREIGN KEY (project) REFERENCES project(id) MATCH FULL ON DELETE CASCADE;

  --
  -- Name: datatype_name_key; Type: CONSTRAINT; Schema: -; Owner: xtenspg; Tablespace:
  --

  ALTER TABLE ONLY data_type DROP CONSTRAINT datatype_name_key;

  --
  -- Name: datatype_name_key; Type: CONSTRAINT; Schema: public; Owner: xtenspg; Tablespace:
  --

  ALTER TABLE ONLY data_type ADD CONSTRAINT datatype_name_key UNIQUE (name,project);

  RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION dt_set_project_default(default_project int) RETURNS integer AS $$

  BEGIN

    UPDATE data_type SET project = default_project;

      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION dt_creation(default_project int) RETURNS integer AS $$
  DECLARE
      project RECORD;
      data_type RECORD;
      new_data_type RECORD;
      child RECORD;
      children RECORD;
  BEGIN

      RAISE info 'Start creating data_types - projects';

    -- create data_types for every project
      FOR data_type IN SELECT * FROM data_type ORDER BY id LOOP
      FOR project IN SELECT * FROM project WHERE id != default_project ORDER BY id LOOP

          RAISE info 'data_type name %, for project %', data_type.name, project.id;

          EXECUTE 'INSERT INTO data_type (name, model, schema, project, created_at, updated_at) VALUES (' || quote_literal(data_type.name) || ', '  || quote_literal(data_type.model) || ', ' || quote_literal(data_type.schema::jsonb) || ', ' || quote_literal(project.id) || ', ' || quote_literal(data_type.created_at) || ', ' || quote_literal(data_type.updated_at) || ')';
      END LOOP;
      END LOOP;

    -- build data_types tree for every project
      FOR new_data_type IN SELECT * FROM data_type as dt WHERE dt.project != default_project ORDER BY id LOOP

          FOR children in SELECT dt.id as parent, dt.name as name_parent, dt_2.name as name_child FROM data_type dt INNER JOIN datatype_children__datatype_parents dt_pc ON dt_pc.datatype_children = dt.id INNER JOIN data_type dt_2 ON dt_pc.datatype_parents = dt_2.id  WHERE dt.project = default_project AND dt.name = new_data_type.name ORDER BY dt_2.id LOOP

          SELECT * INTO child FROM data_type as dt WHERE dt.project = new_data_type.project AND dt.name = children.name_child;

          EXECUTE 'INSERT INTO datatype_children__datatype_parents (datatype_children, datatype_parents) VALUES (' || quote_literal(new_data_type.id) || ', '  || quote_literal(child.id) || ')';
          END LOOP;
      END LOOP;

      RAISE info 'Done creating data_types - projects.';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION set_subjects_samples_data_type(default_project int) RETURNS integer AS $$
  DECLARE
      datum RECORD;
      subj RECORD;
      dt_source_name varchar;
      data_type_dest integer;

  BEGIN

      RAISE info 'Starting set_subjects_samples_data_type()';

      FOR subj IN SELECT s.id, project_subjects, dt.name AS type  FROM subject s INNER JOIN project_subjects__subject_projects AS ps ON (s.id = ps.subject_projects) INNER JOIN data_type dt ON s.type = dt.id ORDER BY s.id LOOP

        IF subj.project_subjects <> default_project THEN
          RAISE info 'subject %, for project %', subj.id, subj.project_subjects;
        --
          SELECT id INTO data_type_dest FROM data_type WHERE name = subj.type AND project = subj.project_subjects;

          EXECUTE 'UPDATE subject SET type =' || quote_literal(data_type_dest) || ' WHERE id = ' || quote_literal(subj.id) ;

          FOR datum IN  SELECT s.id AS id , dt.name AS type, dt.model AS model FROM sample s INNER JOIN data_type dt ON s.type = dt.id WHERE s.parent_subject = subj.id
                        UNION ALL
                        SELECT d.id AS id, dt.name AS type, dt.model AS model FROM data d INNER JOIN data_type dt ON d.type = dt.id WHERE d.parent_subject = subj.id  LIMIT 100 LOOP


            SELECT id INTO data_type_dest FROM data_type WHERE name = datum.type AND project = subj.project_subjects;

            EXECUTE 'UPDATE ' || lower(datum.model) || ' SET type =' || quote_literal(data_type_dest) || ' WHERE id = ' || quote_literal(datum.id) ;

          END LOOP;

        END IF;

      END LOOP;

      RAISE info 'Done set_subjects_samples_data_type()';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION groups_projects_associations(default_project int default 0) RETURNS integer AS $$
  DECLARE
      xt_group RECORD;
      project integer;
  BEGIN

      RAISE info 'Start creating groups_projects_associations()';

      IF default_project <> 0 THEN

        FOR xt_group IN SELECT * FROM xtens_group ORDER BY id LOOP

            RAISE info 'group %, level %', xt_group.id, xt_group.privilege_level;

            IF xt_group.privilege_level = 'wheel' THEN
              FOR project IN SELECT id FROM project ORDER BY id LOOP
                  EXECUTE 'INSERT INTO group_projects__project_groups (project_groups, group_projects) VALUES (' || quote_literal(project) || ', '  || quote_literal(xt_group.id) ||  ')';
              END LOOP;

            ELSE
              EXECUTE 'INSERT INTO group_projects__project_groups (project_groups, group_projects) VALUES (' || quote_literal(default_project) || ', '  || quote_literal(xt_group.id) ||  ')';

            END IF;

        END LOOP;

      END IF;
      RAISE info 'Done groups_projects_associations().';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION wheel_groups_data_types_privileges_associations() RETURNS integer AS $$
  DECLARE
      xt_group integer;
      data_type integer;
  BEGIN

      RAISE info 'Start creating wheel_groups_data_types_privileges_associations()';

      -- IF default_project <> 0 THEN

        FOR xt_group IN SELECT id FROM xtens_group WHERE privilege_level = 'wheel' ORDER BY id LOOP
          FOR data_type IN SELECT id FROM data_type ORDER BY id LOOP

            EXECUTE 'INSERT INTO datatype_groups__group_datatypes (datatype_groups,' ||  quote_ident('group_dataTypes') || ')  VALUES (' || quote_literal(data_type) || ', ' || quote_literal(xt_group) ||  ') ON CONFLICT("datatype_groups", "group_dataTypes") DO NOTHING';

            EXECUTE 'INSERT INTO datatype_privileges (data_type, xtens_group, privilege_level) VALUES (' || quote_literal(data_type) || ', ' || quote_literal(xt_group) || ', ' || quote_literal('edit') || ') ON CONFLICT("data_type", "xtens_group") DO NOTHING';

          END LOOP;
        END LOOP;

      -- END IF;
      RAISE info 'Done wheel_groups_data_types_privileges_associations().';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION clean_data_types(default_project int default 0) RETURNS integer AS $$
  DECLARE
      data RECORD;
  BEGIN

      RAISE info 'Start creating clean_data_types()';


      FOR data IN SELECT COUNT(b) > 0 as has_data, id_type as type  FROM (SELECT sb.id as b, dt.id as id_type FROM subject sb RIGHT OUTER JOIN data_type dt ON dt.id = sb.type WHERE dt.model = 'Subject' AND dt.project <> default_project
        UNION ALL
        SELECT s.id as b, dt.id as id_type  FROM sample s RIGHT OUTER JOIN data_type dt ON dt.id = s.type WHERE dt.model = 'Sample' AND dt.project <> default_project
        UNION ALL
        SELECT d.id as b, dt.id  as id_type FROM data d RIGHT OUTER JOIN data_type dt ON dt.id = d.type WHERE dt.model = 'Data' AND dt.project <> default_project) ss GROUP BY type ORDER BY type LOOP

          IF data.has_data IS FALSE THEN

          RAISE info 'PERFORM clean_data_types() on data_type %', data;

              EXECUTE 'DELETE FROM data_type WHERE id = ' || data.type  ;

          END IF;


        END LOOP;

      RAISE info 'Done clean_data_types().';
      RETURN 1;
  END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION clean_db_schema() RETURNS integer AS $$

  BEGIN

    --
    -- Name: project_subjects__subject_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: xtenspg
    --

    DROP SEQUENCE project_subjects__subject_projects_id_seq CASCADE;

    --
    -- Name: project_subjects__subject_projects; Type: TABLE; Schema: public; Owner: xtenspg; Tablespace:
    --

    DROP TABLE project_subjects__subject_projects;

    RETURN 1;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION main_migration(default_project int default 0) RETURNS integer AS $$

  BEGIN
    PERFORM apply_schema_changes();
    PERFORM dt_set_project_default( default_project );
    ALTER TABLE data_type ALTER COLUMN project SET NOT NULL;
    PERFORM dt_creation( default_project );
    PERFORM set_subjects_samples_data_type( default_project );
    PERFORM clean_data_types( default_project );
    PERFORM groups_projects_associations( default_project );
    PERFORM wheel_groups_data_types_privileges_associations();
    PERFORM clean_db_schema();


    -- DROP created functions
    DROP FUNCTION apply_schema_changes();
    DROP FUNCTION dt_set_project_default(int);
    DROP FUNCTION dt_creation(int);
    DROP FUNCTION set_subjects_samples_data_type(int);
    DROP FUNCTION clean_data_types(int);
    DROP FUNCTION groups_projects_associations(int);
    DROP FUNCTION wheel_groups_data_types_privileges_associations();
    DROP FUNCTION clean_db_schema();
    RETURN 1;
  END;
$$ LANGUAGE plpgsql;


SELECT * FROM main_migration(id_project);-- set the id of default project
