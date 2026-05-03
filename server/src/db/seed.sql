-- ============================================================================
-- Seed data — mirrors the demo cases used by the React frontend so navigating
-- between the two stays coherent.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users (Module 1 stand-ins)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, name, email, role) VALUES
    (1,  'Alex Profile',   'alex.profile@example.com', 'client'),
    (2,  'Alice Smith',    'alice@example.com',        'client'),
    (3,  'Bob Jones',      'bob@example.com',          'freelancer'),
    (4,  'Charlie Davis',  'charlie@example.com',      'client'),
    (5,  'Dana White',     'dana@example.com',         'freelancer'),
    (6,  'Eve Black',      'eve@example.com',          'freelancer'),
    (7,  'Frank Green',    'frank@example.com',        'client'),
    (8,  'Grace Lee',      'grace@example.com',        'client'),
    (9,  'Henry Ford',     'henry@example.com',        'freelancer'),
    (10, 'Ivy Chen',       'ivy@example.com',          'client'),
    (11, 'Jack Brown',     'jack@example.com',         'freelancer'),
    -- Admins are users with role='admin'
    (90, 'Admin Sarah',    'sarah@nexus.com',          'admin'),
    (91, 'Admin Mike',     'mike@nexus.com',           'admin'),
    (92, 'Admin John',     'john@nexus.com',           'admin');

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

-- ----------------------------------------------------------------------------
-- Admin profiles
-- ----------------------------------------------------------------------------
INSERT INTO admin_profiles (id, user_id, role, is_active, created_at) VALUES
    (1, 90, 'super_admin',       TRUE,  '2022-01-15 09:00:00'),
    (2, 91, 'dispute_moderator', TRUE,  '2022-06-22 09:00:00'),
    (3, 92, 'dispute_moderator', FALSE, '2023-03-10 09:00:00');

SELECT setval(pg_get_serial_sequence('admin_profiles', 'id'), (SELECT MAX(id) FROM admin_profiles));

-- ----------------------------------------------------------------------------
-- Projects (Modules 3/4 stand-ins)
-- ----------------------------------------------------------------------------
INSERT INTO projects (id, project_title, contract_status, client_id, freelancer_id, escrow_amount, payment_status) VALUES
    (101, 'E-commerce Website Redesign', 'on_hold',   2,  3,  2500.00, 'escrow_locked'),
    (102, 'Mobile App Development',      'on_hold',   4,  5,  4800.00, 'escrow_locked'),
    (103, 'Logo & Brand Identity',       'on_hold',   7,  6,   950.00, 'escrow_locked'),
    (104, 'SEO Optimization',            'closed',    8,  9,  1200.00, 'released'),
    (105, 'Copywriting for Blog',        'on_hold',   10, 11,  300.00, 'escrow_locked');

SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects));

-- ----------------------------------------------------------------------------
-- Disputes
-- ----------------------------------------------------------------------------
INSERT INTO disputes (id, project_id, complainant_id, respondent_id, assigned_admin_id, dispute_type, description, status, mediation_deadline, created_at, updated_at) VALUES
    (1, 101, 2, 3, 1,    'non_payment',
     'The freelancer was hired to redesign the e-commerce website and deliver the final files by Oct 1st. They missed the deadline and after two extensions, they stopped responding entirely. The escrow is currently locked but they are refusing to cancel the contract or deliver the work. I would like a full refund of the escrowed amount.',
     'mediation', '2023-10-20 17:00:00', '2023-10-12 09:15:00', '2023-10-15 11:00:00'),

    (2, 102, 4, 5, NULL, 'poor_quality',
     'Delivered build crashes on launch and does not match the agreed Figma specification.',
     'submitted', NULL, '2023-10-14 10:00:00', '2023-10-14 10:00:00'),

    (3, 103, 6, 7, 2,    'scope_violation',
     'Client kept requesting changes far beyond the scope of work without offering additional compensation.',
     'admin_arbitration', NULL, '2023-10-05 09:00:00', '2023-10-16 10:30:00'),

    (4, 104, 8, 9, 1,    'misconduct',
     'Resolved in favour of the client after evidence review.',
     'resolution_completed', NULL, '2023-09-20 09:00:00', '2023-09-28 16:00:00'),

    (5, 105, 10, 11, NULL, 'other',
     'Pending administrator triage.',
     'under_review', NULL, '2023-10-16 09:00:00', '2023-10-16 09:01:00');

SELECT setval(pg_get_serial_sequence('disputes', 'id'), (SELECT MAX(id) FROM disputes));

-- ----------------------------------------------------------------------------
-- Evidence (only dispute #1 has files in the seed)
-- ----------------------------------------------------------------------------
INSERT INTO evidence (dispute_id, uploaded_by, file_name, file_type, file_size_kb, file_path, is_visible_to_parties, uploaded_at) VALUES
    (1, 2, 'contract_agreement.pdf', 'pdf', 2400,  'seed/contract_agreement.pdf', TRUE,  '2023-10-12 09:20:00'),
    (1, 2, 'email_chain.png',        'png', 845,   'seed/email_chain.png',        TRUE,  '2023-10-12 09:25:00'),
    (1, 3, 'final_delivery.zip',     'zip', 14200, 'seed/final_delivery.zip',     FALSE, '2023-10-13 14:10:00');

-- ----------------------------------------------------------------------------
-- Mediation records (chat statements for dispute #1)
-- ----------------------------------------------------------------------------
INSERT INTO mediation_records (dispute_id, author_id, statement, submitted_at) VALUES
    (1, 2, 'I have provided all the original brief documents. The deadline was clearly Oct 1st.',         '2023-10-13 11:05:00'),
    (1, 3, 'I acknowledge the delay. I had a family emergency. I can deliver the project in 3 more days if granted.', '2023-10-13 14:30:00'),
    (1, 2, 'A 3-day extension is acceptable, provided the work matches the original spec exactly.',     '2023-10-14 09:15:00');

-- ----------------------------------------------------------------------------
-- Arbitration decision + resolution report (dispute #4 is fully closed)
-- ----------------------------------------------------------------------------
INSERT INTO arbitration_decisions (id, dispute_id, admin_id, outcome, decision_notes, payment_signal_sent, decided_at) VALUES
    (1, 4, 1, 'favour_client',
     'After evidence review the panel concluded the freelancer breached the agreed terms. Full refund issued.',
     TRUE, '2023-09-28 15:30:00');

SELECT setval(pg_get_serial_sequence('arbitration_decisions', 'id'), (SELECT MAX(id) FROM arbitration_decisions));

INSERT INTO resolution_reports (dispute_id, decision_id, dispute_summary, evidence_summary, mediation_summary, admin_decision, decision_notes, delivered_to_parties, generated_at) VALUES
    (4, 1,
     'Misconduct case filed by client against freelancer after repeated unresponsiveness.',
     '3 evidence files reviewed including the original contract and chat history.',
     'Mediation phase failed: respondent did not engage within deadline.',
     'FAVOUR CLIENT (Full Refund)',
     'Refund of $1,200.00 returned to client per terms of the contract.',
     TRUE,
     '2023-09-28 16:00:00');

-- ----------------------------------------------------------------------------
-- Status history
-- ----------------------------------------------------------------------------
INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by, changed_at) VALUES
    (1, 'submitted',         'evidence_uploaded',     2,  '2023-10-12 09:20:00'),
    (1, 'evidence_uploaded', 'under_review',          2,  '2023-10-12 09:30:00'),
    (1, 'under_review',      'mediation',             90, '2023-10-13 11:00:00'),
    (3, 'submitted',         'under_review',          6,  '2023-10-05 09:30:00'),
    (3, 'under_review',      'mediation',             90, '2023-10-09 14:00:00'),
    (3, 'mediation',         'admin_arbitration',     91, '2023-10-16 10:30:00'),
    (4, 'submitted',         'under_review',          8,  '2023-09-20 09:30:00'),
    (4, 'under_review',      'admin_arbitration',     90, '2023-09-25 11:00:00'),
    (4, 'admin_arbitration', 'resolution_completed',  90, '2023-09-28 16:00:00');

-- ----------------------------------------------------------------------------
-- Audit log
-- ----------------------------------------------------------------------------
INSERT INTO admin_audit_log (admin_id, action_type, target_entity_id, target_entity_type, details, performed_at) VALUES
    (1, 'status_updated',    4, 'dispute',           'Changed status to Resolved',     '2023-10-16 14:22:00'),
    (2, 'status_updated',    3, 'dispute',           'Assigned self to dispute',       '2023-10-16 10:05:00'),
    (1, 'evidence_reviewed', 1, 'dispute',           'Added internal review note',     '2023-10-15 16:40:00'),
    (1, 'dispute_decision',  4, 'resolution_report', 'Issued FAVOUR CLIENT decision',  '2023-09-28 15:30:00'),
    (1, 'account_created',   3, 'admin_account',     'Created Admin John account',     '2023-03-10 09:00:00');
