--
-- PostgreSQL database dump
--

\restrict cdhx3NCm4ahTAlW8fNpZLjFbxY4qC0sJZVQtaKaPzMQTTPUlUSMQ4LgCKJVOpy3

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: achievement_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement_definitions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    icon character varying(10) DEFAULT '🏆'::character varying,
    rarity character varying(20) DEFAULT 'common'::character varying,
    criteria text NOT NULL,
    criteria_value integer NOT NULL,
    criteria_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT achievement_definitions_rarity_check CHECK (((rarity)::text = ANY ((ARRAY['common'::character varying, 'rare'::character varying, 'epic'::character varying, 'legendary'::character varying])::text[])))
);


--
-- Name: achievement_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.achievement_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achievement_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.achievement_definitions_id_seq OWNED BY public.achievement_definitions.id;


--
-- Name: buddy_session_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buddy_session_participants (
    session_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: buddy_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buddy_sessions (
    id integer NOT NULL,
    tribe_id integer NOT NULL,
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    duration integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    tasks_completed integer DEFAULT 0,
    notes character varying(1000),
    paused_at timestamp with time zone,
    pause_duration integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT buddy_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: buddy_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buddy_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buddy_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buddy_sessions_id_seq OWNED BY public.buddy_sessions.id;


--
-- Name: focus_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.focus_sessions (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    duration integer DEFAULT 0,
    planned_duration integer NOT NULL,
    user_id integer NOT NULL,
    task_id integer,
    tribe_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT focus_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: focus_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.focus_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: focus_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.focus_sessions_id_seq OWNED BY public.focus_sessions.id;


--
-- Name: message_mentions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_mentions (
    message_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reactions (
    id integer NOT NULL,
    message_id integer,
    user_id integer,
    user_name character varying(100),
    emoji character varying(10) NOT NULL
);


--
-- Name: message_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_reactions_id_seq OWNED BY public.message_reactions.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    tribe_id integer NOT NULL,
    sender_id integer NOT NULL,
    content character varying(2000) NOT NULL,
    reply_to_id integer,
    edited boolean DEFAULT false,
    edited_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: problem_solutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problem_solutions (
    id integer NOT NULL,
    problem_id integer,
    author_id integer,
    content character varying(1000) NOT NULL,
    votes integer DEFAULT 0,
    accepted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: problem_solutions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problem_solutions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problem_solutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problem_solutions_id_seq OWNED BY public.problem_solutions.id;


--
-- Name: problem_voters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problem_voters (
    problem_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problems (
    id integer NOT NULL,
    tribe_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(2000) NOT NULL,
    category character varying(20) DEFAULT 'other'::character varying,
    status character varying(20) DEFAULT 'open'::character varying,
    creator_id integer NOT NULL,
    votes integer DEFAULT 0,
    resolved_at timestamp with time zone,
    resolved_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT problems_category_check CHECK (((category)::text = ANY ((ARRAY['technical'::character varying, 'design'::character varying, 'process'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT problems_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'discussing'::character varying, 'resolved'::character varying])::text[])))
);


--
-- Name: problems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problems_id_seq OWNED BY public.problems.id;


--
-- Name: resource_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_tags (
    resource_id integer NOT NULL,
    tag character varying(100) NOT NULL
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    tribe_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description character varying(1000),
    type character varying(20) NOT NULL,
    url text NOT NULL,
    category character varying(50),
    size character varying(50),
    uploader_id integer NOT NULL,
    downloads integer DEFAULT 0,
    is_public boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resources_type_check CHECK (((type)::text = ANY ((ARRAY['document'::character varying, 'image'::character varying, 'link'::character varying, 'code'::character varying])::text[])))
);


--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: ritual_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ritual_attendance (
    id integer NOT NULL,
    ritual_id integer,
    user_id integer,
    date timestamp with time zone DEFAULT now()
);


--
-- Name: ritual_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ritual_attendance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ritual_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ritual_attendance_id_seq OWNED BY public.ritual_attendance.id;


--
-- Name: ritual_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ritual_participants (
    ritual_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: ritual_schedule_days; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ritual_schedule_days (
    ritual_id integer NOT NULL,
    day character varying(10) NOT NULL
);


--
-- Name: rituals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rituals (
    id integer NOT NULL,
    tribe_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    schedule_type character varying(10) NOT NULL,
    schedule_time character varying(5) NOT NULL,
    schedule_day character varying(20),
    badge character varying(10) DEFAULT '✨'::character varying,
    streak integer DEFAULT 0,
    next_occurrence timestamp with time zone,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rituals_schedule_type_check CHECK (((schedule_type)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'custom'::character varying])::text[])))
);


--
-- Name: rituals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rituals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rituals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rituals_id_seq OWNED BY public.rituals.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: solution_voters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solution_voters (
    solution_id integer NOT NULL,
    user_id integer NOT NULL
);


--
-- Name: task_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_tags (
    task_id integer NOT NULL,
    tag character varying(100) NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    priority character varying(10) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    due_date timestamp with time zone,
    user_id integer NOT NULL,
    tribe_id integer,
    completed boolean DEFAULT false,
    starred boolean DEFAULT false,
    completed_at timestamp with time zone,
    is_group_task boolean DEFAULT false,
    assigned_role character varying(20) DEFAULT 'personal'::character varying,
    tribe_role character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in-progress'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: tribe_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tribe_goals (
    id integer NOT NULL,
    tribe_id integer,
    goal text NOT NULL
);


--
-- Name: tribe_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tribe_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tribe_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tribe_goals_id_seq OWNED BY public.tribe_goals.id;


--
-- Name: tribe_join_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tribe_join_requests (
    tribe_id integer NOT NULL,
    user_id integer NOT NULL,
    requested_at timestamp with time zone DEFAULT now()
);


--
-- Name: tribe_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tribe_members (
    tribe_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(20) DEFAULT 'Member'::character varying,
    joined_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tribe_members_role_check CHECK (((role)::text = ANY ((ARRAY['Leader'::character varying, 'Member'::character varying])::text[])))
);


--
-- Name: tribe_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tribe_rules (
    id integer NOT NULL,
    tribe_id integer,
    rule text NOT NULL
);


--
-- Name: tribe_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tribe_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tribe_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tribe_rules_id_seq OWNED BY public.tribe_rules.id;


--
-- Name: tribes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tribes (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    color character varying(20) DEFAULT 'blue'::character varying,
    category character varying(50) DEFAULT 'General'::character varying,
    is_private boolean DEFAULT false,
    created_by integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tribes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tribes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tribes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tribes_id_seq OWNED BY public.tribes.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tribe_id integer,
    achievement_name character varying(255) NOT NULL,
    progress integer DEFAULT 0,
    unlocked boolean DEFAULT false,
    unlocked_at timestamp with time zone,
    current_value integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_achievements_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: user_tribes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tribes (
    user_id integer NOT NULL,
    tribe_id integer NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    avatar character varying(10),
    check_in_streak integer DEFAULT 0,
    last_check_in timestamp with time zone,
    daily_focus_goal integer DEFAULT 180,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: achievement_definitions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions ALTER COLUMN id SET DEFAULT nextval('public.achievement_definitions_id_seq'::regclass);


--
-- Name: buddy_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_sessions ALTER COLUMN id SET DEFAULT nextval('public.buddy_sessions_id_seq'::regclass);


--
-- Name: focus_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.focus_sessions ALTER COLUMN id SET DEFAULT nextval('public.focus_sessions_id_seq'::regclass);


--
-- Name: message_reactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions ALTER COLUMN id SET DEFAULT nextval('public.message_reactions_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: problem_solutions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_solutions ALTER COLUMN id SET DEFAULT nextval('public.problem_solutions_id_seq'::regclass);


--
-- Name: problems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems ALTER COLUMN id SET DEFAULT nextval('public.problems_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: ritual_attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_attendance ALTER COLUMN id SET DEFAULT nextval('public.ritual_attendance_id_seq'::regclass);


--
-- Name: rituals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rituals ALTER COLUMN id SET DEFAULT nextval('public.rituals_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: tribe_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_goals ALTER COLUMN id SET DEFAULT nextval('public.tribe_goals_id_seq'::regclass);


--
-- Name: tribe_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_rules ALTER COLUMN id SET DEFAULT nextval('public.tribe_rules_id_seq'::regclass);


--
-- Name: tribes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribes ALTER COLUMN id SET DEFAULT nextval('public.tribes_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: achievement_definitions achievement_definitions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_name_key UNIQUE (name);


--
-- Name: achievement_definitions achievement_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_pkey PRIMARY KEY (id);


--
-- Name: buddy_session_participants buddy_session_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_session_participants
    ADD CONSTRAINT buddy_session_participants_pkey PRIMARY KEY (session_id, user_id);


--
-- Name: buddy_sessions buddy_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_sessions
    ADD CONSTRAINT buddy_sessions_pkey PRIMARY KEY (id);


--
-- Name: focus_sessions focus_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.focus_sessions
    ADD CONSTRAINT focus_sessions_pkey PRIMARY KEY (id);


--
-- Name: message_mentions message_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_pkey PRIMARY KEY (message_id, user_id);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: problem_solutions problem_solutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_pkey PRIMARY KEY (id);


--
-- Name: problem_voters problem_voters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_voters
    ADD CONSTRAINT problem_voters_pkey PRIMARY KEY (problem_id, user_id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (id);


--
-- Name: resource_tags resource_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_tags
    ADD CONSTRAINT resource_tags_pkey PRIMARY KEY (resource_id, tag);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: ritual_attendance ritual_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_attendance
    ADD CONSTRAINT ritual_attendance_pkey PRIMARY KEY (id);


--
-- Name: ritual_participants ritual_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_participants
    ADD CONSTRAINT ritual_participants_pkey PRIMARY KEY (ritual_id, user_id);


--
-- Name: ritual_schedule_days ritual_schedule_days_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_schedule_days
    ADD CONSTRAINT ritual_schedule_days_pkey PRIMARY KEY (ritual_id, day);


--
-- Name: rituals rituals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: solution_voters solution_voters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_voters
    ADD CONSTRAINT solution_voters_pkey PRIMARY KEY (solution_id, user_id);


--
-- Name: task_tags task_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_pkey PRIMARY KEY (task_id, tag);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tribe_goals tribe_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_goals
    ADD CONSTRAINT tribe_goals_pkey PRIMARY KEY (id);


--
-- Name: tribe_join_requests tribe_join_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_join_requests
    ADD CONSTRAINT tribe_join_requests_pkey PRIMARY KEY (tribe_id, user_id);


--
-- Name: tribe_members tribe_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_members
    ADD CONSTRAINT tribe_members_pkey PRIMARY KEY (tribe_id, user_id);


--
-- Name: tribe_rules tribe_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_rules
    ADD CONSTRAINT tribe_rules_pkey PRIMARY KEY (id);


--
-- Name: tribes tribes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribes
    ADD CONSTRAINT tribes_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_tribes user_tribes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tribes
    ADD CONSTRAINT user_tribes_pkey PRIMARY KEY (user_id, tribe_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: buddy_session_participants buddy_session_participants_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_session_participants
    ADD CONSTRAINT buddy_session_participants_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.buddy_sessions(id) ON DELETE CASCADE;


--
-- Name: buddy_session_participants buddy_session_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_session_participants
    ADD CONSTRAINT buddy_session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: buddy_sessions buddy_sessions_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buddy_sessions
    ADD CONSTRAINT buddy_sessions_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: focus_sessions focus_sessions_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.focus_sessions
    ADD CONSTRAINT focus_sessions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: focus_sessions focus_sessions_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.focus_sessions
    ADD CONSTRAINT focus_sessions_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE SET NULL;


--
-- Name: focus_sessions focus_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.focus_sessions
    ADD CONSTRAINT focus_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_mentions message_mentions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_mentions message_mentions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: problem_solutions problem_solutions_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: problem_solutions problem_solutions_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_solutions
    ADD CONSTRAINT problem_solutions_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_voters problem_voters_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_voters
    ADD CONSTRAINT problem_voters_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: problem_voters problem_voters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_voters
    ADD CONSTRAINT problem_voters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: problems problems_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: problems problems_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: problems problems_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: resource_tags resource_tags_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_tags
    ADD CONSTRAINT resource_tags_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE CASCADE;


--
-- Name: resources resources_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: resources resources_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ritual_attendance ritual_attendance_ritual_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_attendance
    ADD CONSTRAINT ritual_attendance_ritual_id_fkey FOREIGN KEY (ritual_id) REFERENCES public.rituals(id) ON DELETE CASCADE;


--
-- Name: ritual_attendance ritual_attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_attendance
    ADD CONSTRAINT ritual_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ritual_participants ritual_participants_ritual_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_participants
    ADD CONSTRAINT ritual_participants_ritual_id_fkey FOREIGN KEY (ritual_id) REFERENCES public.rituals(id) ON DELETE CASCADE;


--
-- Name: ritual_participants ritual_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_participants
    ADD CONSTRAINT ritual_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ritual_schedule_days ritual_schedule_days_ritual_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ritual_schedule_days
    ADD CONSTRAINT ritual_schedule_days_ritual_id_fkey FOREIGN KEY (ritual_id) REFERENCES public.rituals(id) ON DELETE CASCADE;


--
-- Name: rituals rituals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rituals rituals_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rituals
    ADD CONSTRAINT rituals_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: solution_voters solution_voters_solution_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_voters
    ADD CONSTRAINT solution_voters_solution_id_fkey FOREIGN KEY (solution_id) REFERENCES public.problem_solutions(id) ON DELETE CASCADE;


--
-- Name: solution_voters solution_voters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_voters
    ADD CONSTRAINT solution_voters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_tags task_tags_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_tags
    ADD CONSTRAINT task_tags_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tribe_goals tribe_goals_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_goals
    ADD CONSTRAINT tribe_goals_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: tribe_join_requests tribe_join_requests_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_join_requests
    ADD CONSTRAINT tribe_join_requests_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: tribe_join_requests tribe_join_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_join_requests
    ADD CONSTRAINT tribe_join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tribe_members tribe_members_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_members
    ADD CONSTRAINT tribe_members_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: tribe_members tribe_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_members
    ADD CONSTRAINT tribe_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tribe_rules tribe_rules_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribe_rules
    ADD CONSTRAINT tribe_rules_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: tribes tribes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tribes
    ADD CONSTRAINT tribes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_achievements user_achievements_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE SET NULL;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_tribes user_tribes_tribe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tribes
    ADD CONSTRAINT user_tribes_tribe_id_fkey FOREIGN KEY (tribe_id) REFERENCES public.tribes(id) ON DELETE CASCADE;


--
-- Name: user_tribes user_tribes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tribes
    ADD CONSTRAINT user_tribes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict cdhx3NCm4ahTAlW8fNpZLjFbxY4qC0sJZVQtaKaPzMQTTPUlUSMQ4LgCKJVOpy3

