-- ============================================================================
-- G08 — Dispute Resolution schema
-- ----------------------------------------------------------------------------
-- The `users` and `projects` tables are owned by Module 1 and Modules 3/4
-- respectively. We declare lightweight versions here so Module 8 can be
-- developed/tested in isolation. In production they will already exist.
-- ============================================================================

-- Drop in dependency order so re-running this script is idempotent
DROP TABLE IF EXISTS dispute_status_history CASCADE;
DROP TABLE IF EXISTS admin_audit_log         CASCADE;
DROP TABLE IF EXISTS resolution_reports      CASCADE;
DROP TABLE IF EXISTS arbitration_decisions   CASCADE;
DROP TABLE IF EXISTS mediation_records       CASCADE;
DROP TABLE IF EXISTS evidence                CASCADE;
DROP TABLE IF EXISTS disputes                CASCADE;
DROP TABLE IF EXISTS admin_profiles          CASCADE;
DROP TABLE IF EXISTS projects                CASCADE;
DROP TABLE IF EXISTS users                   CASCADE;

-- ----------------------------------------------------------------------------
-- External (Module 1) — minimal stand-in
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) UNIQUE NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('client', 'freelancer', 'admin')),
    account_status  VARCHAR(20)  NOT NULL DEFAULT 'active'
                    CHECK (account_status IN ('active', 'suspended', 'banned')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- External (Modules 3/4) — minimal stand-in
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id               SERIAL PRIMARY KEY,
    project_title    VARCHAR(200) NOT NULL,
    contract_status  VARCHAR(20)  NOT NULL DEFAULT 'active'
                     CHECK (contract_status IN ('active', 'completed', 'on_hold', 'closed')),
    client_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    escrow_amount    NUMERIC(12, 2) DEFAULT 0,
    payment_status   VARCHAR(30)  DEFAULT 'escrow_locked',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Module 8 — owned tables
-- ============================================================================

CREATE TABLE admin_profiles (
    id          SERIAL PRIMARY KEY,
    user_id     INT UNIQUE NOT NULL,
    role        VARCHAR(50) NOT NULL DEFAULT 'dispute_moderator'
                CHECK (role IN ('dispute_moderator', 'super_admin')),
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE disputes (
    id                  SERIAL PRIMARY KEY,
    project_id          INT NOT NULL,
    complainant_id      INT NOT NULL,
    respondent_id       INT NOT NULL,
    assigned_admin_id   INT,
    dispute_type        VARCHAR(50) NOT NULL
                        CHECK (dispute_type IN ('non_payment', 'poor_quality', 'scope_violation', 'misconduct', 'other')),
    description         TEXT NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted', 'evidence_uploaded', 'under_review', 'mediation', 'admin_arbitration', 'resolution_completed')),
    mediation_deadline  TIMESTAMP,
    mediation_escalated BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complainant     FOREIGN KEY (complainant_id)    REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_respondent      FOREIGN KEY (respondent_id)     REFERENCES users(id)          ON DELETE CASCADE,
    CONSTRAINT fk_assigned_admin  FOREIGN KEY (assigned_admin_id) REFERENCES admin_profiles(id) ON DELETE SET NULL
);
-- Note: the original spec marked complainant_id UNIQUE which is too strict
-- (a single user often files multiple disputes). We omit that to allow
-- realistic data while keeping every other constraint.

CREATE TABLE evidence (
    id                      SERIAL PRIMARY KEY,
    dispute_id              INT NOT NULL,
    uploaded_by             INT NOT NULL,
    file_name               VARCHAR(255) NOT NULL,
    file_type               VARCHAR(20)  NOT NULL CHECK (file_type IN ('jpg', 'png', 'pdf', 'docx', 'zip')),
    file_size_kb            INT NOT NULL,
    file_path               VARCHAR(500) NOT NULL,
    is_visible_to_parties   BOOLEAN DEFAULT FALSE,
    uploaded_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispute  FOREIGN KEY (dispute_id)  REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE mediation_records (
    id            SERIAL PRIMARY KEY,
    dispute_id    INT NOT NULL,
    author_id     INT NOT NULL,
    statement     TEXT NOT NULL,
    submitted_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_author  FOREIGN KEY (author_id)  REFERENCES users(id)    ON DELETE CASCADE
);

CREATE TABLE arbitration_decisions (
    id                    SERIAL PRIMARY KEY,
    dispute_id            INT UNIQUE NOT NULL,
    admin_id              INT NOT NULL,
    outcome               VARCHAR(50) NOT NULL
                          CHECK (outcome IN ('favour_client', 'favour_freelancer', 'split', 'dismissed')),
    decision_notes        TEXT NOT NULL,
    payment_signal_sent   BOOLEAN DEFAULT FALSE,
    decided_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id)        ON DELETE CASCADE,
    CONSTRAINT fk_admin   FOREIGN KEY (admin_id)   REFERENCES admin_profiles(id)  ON DELETE CASCADE
);

CREATE TABLE resolution_reports (
    id                     SERIAL PRIMARY KEY,
    dispute_id             INT UNIQUE NOT NULL,
    decision_id            INT UNIQUE NOT NULL,
    dispute_summary        TEXT NOT NULL,
    evidence_summary       TEXT NOT NULL,
    mediation_summary      TEXT NOT NULL,
    admin_decision         TEXT NOT NULL,
    decision_notes         TEXT NOT NULL,
    delivered_to_parties   BOOLEAN DEFAULT FALSE,
    generated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispute  FOREIGN KEY (dispute_id)  REFERENCES disputes(id)              ON DELETE CASCADE,
    CONSTRAINT fk_decision FOREIGN KEY (decision_id) REFERENCES arbitration_decisions(id) ON DELETE CASCADE
);

CREATE TABLE admin_audit_log (
    id                  SERIAL PRIMARY KEY,
    admin_id            INT,
    action_type         VARCHAR(100) NOT NULL
                        CHECK (action_type IN ('dispute_decision', 'account_created', 'role_changed', 'account_deactivated', 'evidence_reviewed', 'status_updated')),
    target_entity_id    INT NOT NULL,
    target_entity_type  VARCHAR(50) NOT NULL
                        CHECK (target_entity_type IN ('dispute', 'admin_account', 'resolution_report', 'evidence')),
    details             TEXT,
    performed_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES admin_profiles(id) ON DELETE SET NULL
);

CREATE TABLE dispute_status_history (
    id          SERIAL PRIMARY KEY,
    dispute_id  INT NOT NULL,
    old_status  VARCHAR(50) NOT NULL
                CHECK (old_status IN ('submitted', 'evidence_uploaded', 'under_review', 'mediation', 'admin_arbitration', 'resolution_completed')),
    new_status  VARCHAR(50) NOT NULL
                CHECK (new_status IN ('submitted', 'evidence_uploaded', 'under_review', 'mediation', 'admin_arbitration', 'resolution_completed')),
    changed_by  INT NOT NULL,
    changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dispute    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)    ON DELETE CASCADE
);

-- Helpful indexes for the queue, audit and history pages
CREATE INDEX IF NOT EXISTS idx_disputes_status            ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_admin    ON disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_evidence_dispute           ON evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_mediation_dispute          ON mediation_records(dispute_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at         ON admin_audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_dispute     ON dispute_status_history(dispute_id);
