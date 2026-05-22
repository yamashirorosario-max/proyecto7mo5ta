--
-- PostgreSQL database dump
--

\restrict dHHuzldpA6GdgHJtDszIb9xm2OF89TFQnfiA7SN3oZVAgTH1Dc6c53XagMfkyMq

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-05-22 08:22:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 872 (class 1247 OID 24758)
-- Name: estado_asistencia_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_asistencia_enum AS ENUM (
    'presente',
    'ausente',
    'tardanza',
    'justificado'
);


ALTER TYPE public.estado_asistencia_enum OWNER TO postgres;

--
-- TOC entry 869 (class 1247 OID 24750)
-- Name: fuente_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fuente_enum AS ENUM (
    'nfc',
    'qr',
    'manual'
);


ALTER TYPE public.fuente_enum OWNER TO postgres;

--
-- TOC entry 866 (class 1247 OID 24745)
-- Name: tipo_evento_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_evento_enum AS ENUM (
    'entrada',
    'salida'
);


ALTER TYPE public.tipo_evento_enum OWNER TO postgres;

--
-- TOC entry 233 (class 1255 OID 24899)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 24805)
-- Name: alumnos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alumnos (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    dni character varying(10) NOT NULL,
    nfc_uid character varying(32),
    qr_code character varying(64),
    curso_id integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alumnos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24804)
-- Name: alumnos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.alumnos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.alumnos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 24871)
-- Name: asistencias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencias (
    id bigint NOT NULL,
    alumno_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    turno_id smallint NOT NULL,
    estado public.estado_asistencia_enum DEFAULT 'ausente'::public.estado_asistencia_enum NOT NULL,
    hora_entrada timestamp with time zone,
    hora_salida timestamp with time zone,
    justificacion text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.asistencias OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 24870)
-- Name: asistencias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.asistencias ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.asistencias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 24778)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id integer NOT NULL,
    "año" smallint NOT NULL,
    division character(1) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT "cursos_año_check" CHECK ((("año" >= 1) AND ("año" <= 7)))
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24777)
-- Name: cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cursos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cursos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 24848)
-- Name: eventos_acceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eventos_acceso (
    id bigint NOT NULL,
    alumno_id integer NOT NULL,
    ocurrido_at timestamp with time zone DEFAULT now() NOT NULL,
    tipo_evento public.tipo_evento_enum NOT NULL,
    turno_id smallint,
    fuente public.fuente_enum DEFAULT 'nfc'::public.fuente_enum NOT NULL
);


ALTER TABLE public.eventos_acceso OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24847)
-- Name: eventos_acceso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.eventos_acceso ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.eventos_acceso_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 227 (class 1259 OID 24830)
-- Name: preceptor_curso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preceptor_curso (
    preceptor_id integer NOT NULL,
    curso_id integer NOT NULL
);


ALTER TABLE public.preceptor_curso OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24792)
-- Name: preceptores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preceptores (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellido character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL
);


ALTER TABLE public.preceptores OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24791)
-- Name: preceptores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.preceptores ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.preceptores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 24768)
-- Name: turnos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turnos (
    id smallint NOT NULL,
    nombre character varying(20) NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL
);


ALTER TABLE public.turnos OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24767)
-- Name: turnos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.turnos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.turnos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 24908)
-- Name: v_asistencias_detalle; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_asistencias_detalle AS
 SELECT a.id,
    al.id AS alumno_id,
    al.apellido,
    al.nombre,
    al.dni,
    c."año" AS curso_anio,
    c.division AS curso_division,
    t.nombre AS turno,
    a.fecha,
    a.estado,
    a.hora_entrada,
    a.hora_salida,
    a.justificacion,
    a.updated_at
   FROM (((public.asistencias a
     JOIN public.alumnos al ON ((al.id = a.alumno_id)))
     JOIN public.cursos c ON ((c.id = al.curso_id)))
     JOIN public.turnos t ON ((t.id = a.turno_id)))
  ORDER BY a.fecha DESC, al.apellido, al.nombre;


ALTER VIEW public.v_asistencias_detalle OWNER TO postgres;

--
-- TOC entry 5003 (class 0 OID 24805)
-- Dependencies: 226
-- Data for Name: alumnos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alumnos (id, nombre, apellido, dni, nfc_uid, qr_code, curso_id, activo, created_at) FROM stdin;
\.


--
-- TOC entry 5008 (class 0 OID 24871)
-- Dependencies: 231
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencias (id, alumno_id, fecha, turno_id, estado, hora_entrada, hora_salida, justificacion, updated_at) FROM stdin;
\.


--
-- TOC entry 4999 (class 0 OID 24778)
-- Dependencies: 222
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursos (id, "año", division, activo) FROM stdin;
\.


--
-- TOC entry 5006 (class 0 OID 24848)
-- Dependencies: 229
-- Data for Name: eventos_acceso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eventos_acceso (id, alumno_id, ocurrido_at, tipo_evento, turno_id, fuente) FROM stdin;
\.


--
-- TOC entry 5004 (class 0 OID 24830)
-- Dependencies: 227
-- Data for Name: preceptor_curso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preceptor_curso (preceptor_id, curso_id) FROM stdin;
\.


--
-- TOC entry 5001 (class 0 OID 24792)
-- Dependencies: 224
-- Data for Name: preceptores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preceptores (id, nombre, apellido, email, password_hash) FROM stdin;
\.


--
-- TOC entry 4997 (class 0 OID 24768)
-- Dependencies: 220
-- Data for Name: turnos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turnos (id, nombre, hora_inicio, hora_fin) FROM stdin;
\.


--
-- TOC entry 5014 (class 0 OID 0)
-- Dependencies: 225
-- Name: alumnos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alumnos_id_seq', 1, false);


--
-- TOC entry 5015 (class 0 OID 0)
-- Dependencies: 230
-- Name: asistencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencias_id_seq', 1, false);


--
-- TOC entry 5016 (class 0 OID 0)
-- Dependencies: 221
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 1, false);


--
-- TOC entry 5017 (class 0 OID 0)
-- Dependencies: 228
-- Name: eventos_acceso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eventos_acceso_id_seq', 1, false);


--
-- TOC entry 5018 (class 0 OID 0)
-- Dependencies: 223
-- Name: preceptores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.preceptores_id_seq', 1, false);


--
-- TOC entry 5019 (class 0 OID 0)
-- Dependencies: 219
-- Name: turnos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.turnos_id_seq', 1, false);


--
-- TOC entry 4818 (class 2606 OID 24820)
-- Name: alumnos alumnos_dni_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumnos
    ADD CONSTRAINT alumnos_dni_key UNIQUE (dni);


--
-- TOC entry 4820 (class 2606 OID 24822)
-- Name: alumnos alumnos_nfc_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumnos
    ADD CONSTRAINT alumnos_nfc_uid_key UNIQUE (nfc_uid);


--
-- TOC entry 4822 (class 2606 OID 24818)
-- Name: alumnos alumnos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumnos
    ADD CONSTRAINT alumnos_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 24824)
-- Name: alumnos alumnos_qr_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumnos
    ADD CONSTRAINT alumnos_qr_code_key UNIQUE (qr_code);


--
-- TOC entry 4835 (class 2606 OID 24888)
-- Name: asistencias asistencias_alumno_id_fecha_turno_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_alumno_id_fecha_turno_id_key UNIQUE (alumno_id, fecha, turno_id);


--
-- TOC entry 4837 (class 2606 OID 24886)
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);


--
-- TOC entry 4810 (class 2606 OID 24790)
-- Name: cursos cursos_año_division_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT "cursos_año_division_key" UNIQUE ("año", division);


--
-- TOC entry 4812 (class 2606 OID 24788)
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 24859)
-- Name: eventos_acceso eventos_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_acceso
    ADD CONSTRAINT eventos_acceso_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 24836)
-- Name: preceptor_curso preceptor_curso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preceptor_curso
    ADD CONSTRAINT preceptor_curso_pkey PRIMARY KEY (preceptor_id, curso_id);


--
-- TOC entry 4814 (class 2606 OID 24803)
-- Name: preceptores preceptores_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preceptores
    ADD CONSTRAINT preceptores_email_key UNIQUE (email);


--
-- TOC entry 4816 (class 2606 OID 24801)
-- Name: preceptores preceptores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preceptores
    ADD CONSTRAINT preceptores_pkey PRIMARY KEY (id);


--
-- TOC entry 4808 (class 2606 OID 24776)
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 1259 OID 24905)
-- Name: idx_alumnos_curso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumnos_curso ON public.alumnos USING btree (curso_id) WHERE (activo = true);


--
-- TOC entry 4826 (class 1259 OID 24903)
-- Name: idx_alumnos_nfc_uid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumnos_nfc_uid ON public.alumnos USING btree (nfc_uid) WHERE (nfc_uid IS NOT NULL);


--
-- TOC entry 4827 (class 1259 OID 24904)
-- Name: idx_alumnos_qr_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_alumnos_qr_code ON public.alumnos USING btree (qr_code) WHERE (qr_code IS NOT NULL);


--
-- TOC entry 4838 (class 1259 OID 24901)
-- Name: idx_asistencias_alumno_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asistencias_alumno_fecha ON public.asistencias USING btree (alumno_id, fecha DESC);


--
-- TOC entry 4839 (class 1259 OID 24902)
-- Name: idx_asistencias_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asistencias_fecha ON public.asistencias USING btree (fecha DESC);


--
-- TOC entry 4832 (class 1259 OID 24906)
-- Name: idx_eventos_alumno_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eventos_alumno_at ON public.eventos_acceso USING btree (alumno_id, ocurrido_at DESC);


--
-- TOC entry 4833 (class 1259 OID 24907)
-- Name: idx_eventos_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eventos_at ON public.eventos_acceso USING btree (ocurrido_at DESC);


--
-- TOC entry 4847 (class 2620 OID 24900)
-- Name: asistencias trg_asistencias_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_asistencias_updated_at BEFORE UPDATE ON public.asistencias FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4840 (class 2606 OID 24825)
-- Name: alumnos alumnos_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alumnos
    ADD CONSTRAINT alumnos_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id);


--
-- TOC entry 4845 (class 2606 OID 24889)
-- Name: asistencias asistencias_alumno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id);


--
-- TOC entry 4846 (class 2606 OID 24894)
-- Name: asistencias asistencias_turno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_turno_id_fkey FOREIGN KEY (turno_id) REFERENCES public.turnos(id);


--
-- TOC entry 4843 (class 2606 OID 24860)
-- Name: eventos_acceso eventos_acceso_alumno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_acceso
    ADD CONSTRAINT eventos_acceso_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id);


--
-- TOC entry 4844 (class 2606 OID 24865)
-- Name: eventos_acceso eventos_acceso_turno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_acceso
    ADD CONSTRAINT eventos_acceso_turno_id_fkey FOREIGN KEY (turno_id) REFERENCES public.turnos(id);


--
-- TOC entry 4841 (class 2606 OID 24842)
-- Name: preceptor_curso preceptor_curso_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preceptor_curso
    ADD CONSTRAINT preceptor_curso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.cursos(id) ON DELETE CASCADE;


--
-- TOC entry 4842 (class 2606 OID 24837)
-- Name: preceptor_curso preceptor_curso_preceptor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preceptor_curso
    ADD CONSTRAINT preceptor_curso_preceptor_id_fkey FOREIGN KEY (preceptor_id) REFERENCES public.preceptores(id) ON DELETE CASCADE;


-- Completed on 2026-05-22 08:22:50

--
-- PostgreSQL database dump complete
--

\unrestrict dHHuzldpA6GdgHJtDszIb9xm2OF89TFQnfiA7SN3oZVAgTH1Dc6c53XagMfkyMq

