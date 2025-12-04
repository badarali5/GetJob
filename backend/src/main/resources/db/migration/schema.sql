--
-- PostgreSQL database dump
--

\restrict WzP5O6AziVhWx4XpLPPkLGc5LB0X7mwNpWA2Up6xFxwUEEwFzm3AIkvvMDG0Rqr

-- Dumped from database version 17.5
-- Dumped by pg_dump version 18.1

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_role_check" CHECK (((role)::text = ANY ((ARRAY['STUDENT'::character varying, 'EMPLOYER'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    resume_url text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT application_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying])::text[])))
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_id_seq OWNER TO postgres;

--
-- Name: application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_id_seq OWNED BY public.application.id;


--
-- Name: company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    location character varying(150),
    logo_url text,
    employer_id integer NOT NULL
);


ALTER TABLE public.company OWNER TO postgres;

--
-- Name: company_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_id_seq OWNER TO postgres;

--
-- Name: company_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_id_seq OWNED BY public.company.id;


--
-- Name: job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    type character varying(20) NOT NULL,
    description text,
    skills_required text,
    location character varying(150),
    salary_range character varying(50),
    deadline date,
    company_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT job_type_check CHECK (((type)::text = ANY ((ARRAY['INTERNSHIP'::character varying, 'ENTRY_LEVEL'::character varying, 'FULL_TIME'::character varying])::text[])))
);


ALTER TABLE public.job OWNER TO postgres;

--
-- Name: job_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_id_seq OWNER TO postgres;

--
-- Name: job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_id_seq OWNED BY public.job.id;


--
-- Name: job_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_skills (
    id integer NOT NULL,
    job_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.job_skills OWNER TO postgres;

--
-- Name: job_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_skills_id_seq OWNER TO postgres;

--
-- Name: job_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_skills_id_seq OWNED BY public.job_skills.id;


--
-- Name: saved_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_jobs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_jobs OWNER TO postgres;

--
-- Name: saved_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_jobs_id_seq OWNER TO postgres;

--
-- Name: saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_jobs_id_seq OWNED BY public.saved_jobs.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO postgres;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_skills (
    id integer NOT NULL,
    user_id integer NOT NULL,
    skill_id integer NOT NULL
);


ALTER TABLE public.user_skills OWNER TO postgres;

--
-- Name: user_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_skills_id_seq OWNER TO postgres;

--
-- Name: user_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_skills_id_seq OWNED BY public.user_skills.id;


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: application id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application ALTER COLUMN id SET DEFAULT nextval('public.application_id_seq'::regclass);


--
-- Name: company id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company ALTER COLUMN id SET DEFAULT nextval('public.company_id_seq'::regclass);


--
-- Name: job id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job ALTER COLUMN id SET DEFAULT nextval('public.job_id_seq'::regclass);


--
-- Name: job_skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills ALTER COLUMN id SET DEFAULT nextval('public.job_skills_id_seq'::regclass);


--
-- Name: saved_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs ALTER COLUMN id SET DEFAULT nextval('public.saved_jobs_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: user_skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills ALTER COLUMN id SET DEFAULT nextval('public.user_skills_id_seq'::regclass);


--
-- Name: User User_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_email_key" UNIQUE (email);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (id);


--
-- Name: application application_user_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_user_id_job_id_key UNIQUE (user_id, job_id);


--
-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: job_skills job_skills_job_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_skill_id_key UNIQUE (job_id, skill_id);


--
-- Name: job_skills job_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (id);


--
-- Name: saved_jobs saved_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: saved_jobs saved_jobs_user_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_user_id_job_id_key UNIQUE (user_id, job_id);


--
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_user_id_skill_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_skill_id_key UNIQUE (user_id, skill_id);


--
-- Name: application application_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON DELETE CASCADE;


--
-- Name: application application_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: company company_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_owner_id_fkey FOREIGN KEY (employer_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: company fk_company_employer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company
    ADD CONSTRAINT fk_company_employer FOREIGN KEY (employer_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: job fk_job_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT fk_job_company FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


--
-- Name: saved_jobs fk_savedjobs_job; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT fk_savedjobs_job FOREIGN KEY (job_id) REFERENCES public.job(id) ON DELETE CASCADE;


--
-- Name: job job_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job
    ADD CONSTRAINT job_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON DELETE CASCADE;


--
-- Name: job_skills job_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_skills
    ADD CONSTRAINT job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: saved_jobs saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job(id) ON DELETE CASCADE;


--
-- Name: saved_jobs saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_jobs
    ADD CONSTRAINT saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict WzP5O6AziVhWx4XpLPPkLGc5LB0X7mwNpWA2Up6xFxwUEEwFzm3AIkvvMDG0Rqr

