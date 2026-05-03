-- ============================================================================
-- G08 — Dispute Resolution: DEFAULT seed data
-- ----------------------------------------------------------------------------
-- Populates every table defined in schema.sql with realistic demo data that
-- exercises every CHECK constraint value:
--   users.role              -> client, freelancer, admin
--   users.account_status    -> active, suspended, banned
--   projects.contract_status-> active, completed, on_hold, closed
--   admin_profiles.role     -> super_admin, dispute_moderator
--   disputes.dispute_type   -> non_payment, poor_quality, scope_violation,
--                              misconduct, other
--   disputes.status         -> submitted, evidence_uploaded, under_review,
--                              mediation, admin_arbitration,
--                              resolution_completed
--   evidence.file_type      -> jpg, png, pdf, docx, zip
--   arbitration_decisions.outcome -> favour_client, favour_freelancer, split,
--                                     dismissed
--   admin_audit_log.action_type   -> dispute_decision, account_created,
--                                     role_changed, account_deactivated,
--                                     evidence_reviewed, status_updated
--   admin_audit_log.target_entity_type -> dispute, admin_account,
--                                          resolution_report, evidence
--
-- Safe to re-run: wipes every table first, then repopulates and resets
-- the SERIAL sequences so the next INSERT from your app picks up cleanly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Clean slate (order doesn't matter because of CASCADE)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE
    dispute_status_history,
    admin_audit_log,
    resolution_reports,
    arbitration_decisions,
    mediation_records,
    evidence,
    disputes,
    admin_profiles,
    projects,
    users
RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. USERS  (Module 1 stand-in)
-- ============================================================================
INSERT INTO users (id, name, email, role, account_status, created_at) VALUES
    -- Clients
    (1,  'Alex Profile',    'alex.profile@example.com', 'client',     'active',    '2022-03-10 09:00:00'),
    (2,  'Alice Smith',     'alice@example.com',        'client',     'active',    '2022-04-02 09:00:00'),
    (3,  'Charlie Davis',   'charlie@example.com',      'client',     'active',    '2022-05-18 09:00:00'),
    (4,  'Frank Green',     'frank@example.com',        'client',     'active',    '2022-06-22 09:00:00'),
    (5,  'Grace Lee',       'grace@example.com',        'client',     'active',    '2022-07-14 09:00:00'),
    (6,  'Ivy Chen',        'ivy@example.com',          'client',     'active',    '2022-08-30 09:00:00'),
    (7,  'Kevin Patel',     'kevin@example.com',        'client',     'active',    '2022-09-11 09:00:00'),
    (8,  'Laura Kim',       'laura@example.com',        'client',     'suspended', '2022-10-05 09:00:00'),

    -- Freelancers
    (9,  'Bob Jones',       'bob@example.com',          'freelancer', 'active',    '2022-03-20 09:00:00'),
    (10, 'Dana White',      'dana@example.com',         'freelancer', 'active',    '2022-04-15 09:00:00'),
    (11, 'Eve Black',       'eve@example.com',          'freelancer', 'active',    '2022-05-28 09:00:00'),
    (12, 'Henry Ford',      'henry@example.com',        'freelancer', 'active',    '2022-06-30 09:00:00'),
    (13, 'Jack Brown',      'jack@example.com',         'freelancer', 'active',    '2022-07-25 09:00:00'),
    (14, 'Mia Garcia',      'mia@example.com',          'freelancer', 'active',    '2022-08-12 09:00:00'),
    (15, 'Noah Wilson',     'noah@example.com',         'freelancer', 'banned',    '2022-09-02 09:00:00'),

    -- Admin users (role='admin' at user level; details live in admin_profiles)
    (90, 'Admin Sarah',     'sarah@nexus.com',          'admin',      'active',    '2022-01-15 09:00:00'),
    (91, 'Admin Mike',      'mike@nexus.com',           'admin',      'active',    '2022-06-22 09:00:00'),
    (92, 'Admin John',      'john@nexus.com',           'admin',      'active',    '2023-03-10 09:00:00'),
    (93, 'Admin Priya',     'priya@nexus.com',          'admin',      'active',    '2023-07-18 09:00:00');

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

-- ============================================================================
-- 2. ADMIN PROFILES
-- ============================================================================
INSERT INTO admin_profiles (id, user_id, role, is_active, created_at, updated_at) VALUES
    (1, 90, 'super_admin',       TRUE,  '2022-01-15 09:00:00', '2022-01-15 09:00:00'),
    (2, 91, 'dispute_moderator', TRUE,  '2022-06-22 09:00:00', '2022-06-22 09:00:00'),
    (3, 92, 'dispute_moderator', TRUE,  '2023-03-10 09:00:00', '2023-03-10 09:00:00'),
    (4, 93, 'dispute_moderator', FALSE, '2023-07-18 09:00:00', '2024-02-01 09:00:00');

SELECT setval(pg_get_serial_sequence('admin_profiles', 'id'), (SELECT MAX(id) FROM admin_profiles));

-- ============================================================================
-- 3. PROJECTS  (Modules 3/4 stand-in)
-- ============================================================================
INSERT INTO projects (id, project_title, contract_status, client_id, freelancer_id, escrow_amount, payment_status, created_at) VALUES
    (101, 'E-commerce Website Redesign',     'on_hold',   2,  9,  2500.00, 'escrow_locked',  '2023-09-01 10:00:00'),
    (102, 'Mobile App Development',          'on_hold',   3,  10, 4800.00, 'escrow_locked',  '2023-09-05 10:00:00'),
    (103, 'Logo & Brand Identity',           'on_hold',   4,  11,  950.00, 'escrow_locked',  '2023-09-08 10:00:00'),
    (104, 'SEO Optimization Package',        'closed',    5,  12, 1200.00, 'released',       '2023-08-15 10:00:00'),
    (105, 'Copywriting for Product Blog',    'on_hold',   6,  13,  300.00, 'escrow_locked',  '2023-09-20 10:00:00'),
    (106, 'Data Dashboard (React + D3)',     'active',    1,  14, 3200.00, 'escrow_locked',  '2023-09-25 10:00:00'),
    (107, 'UX Audit of Checkout Flow',       'completed', 7,  9,  1500.00, 'released',       '2023-07-12 10:00:00'),
    (108, 'WordPress Theme Migration',       'on_hold',   2,  10,  700.00, 'escrow_locked',  '2023-10-01 10:00:00'),
    (109, 'Explainer Video Animation',       'on_hold',   5,  11, 1800.00, 'escrow_locked',  '2023-10-03 10:00:00'),
    (110, 'Node.js REST API + Tests',        'on_hold',   6,  12, 2100.00, 'escrow_locked',  '2023-10-04 10:00:00');

SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects));

-- ============================================================================
-- 4. DISPUTES  — every status + every dispute_type represented
-- ============================================================================
INSERT INTO disputes (id, project_id, complainant_id, respondent_id, assigned_admin_id, dispute_type, description, status, mediation_deadline, mediation_escalated, created_at, updated_at) VALUES
    -- 1: submitted, non_payment
    (1,  101, 2, 9,  NULL, 'non_payment',
     'Freelancer missed the Oct 1st deadline and after two extensions has stopped responding. Escrow is locked; requesting a full refund of $2,500.',
     'submitted', NULL, FALSE,
     '2023-10-12 09:15:00', '2023-10-12 09:15:00'),

    -- 2: evidence_uploaded, poor_quality
    (2,  102, 3, 10, NULL, 'poor_quality',
     'Delivered Android build crashes on launch and the UI does not match the agreed Figma spec.',
     'evidence_uploaded', NULL, FALSE,
     '2023-10-14 10:00:00', '2023-10-14 10:45:00'),

    -- 3: under_review, scope_violation
    (3,  103, 11, 4, 2,    'scope_violation',
     'Client keeps requesting changes far beyond the original scope without additional compensation.',
     'under_review', NULL, FALSE,
     '2023-10-05 09:00:00', '2023-10-09 14:00:00'),

    -- 4: mediation, misconduct
    (4,  106, 1, 14, 1,    'misconduct',
     'Freelancer used client credentials to access private repositories that were not part of the contract.',
     'mediation', '2023-10-25 17:00:00', FALSE,
     '2023-10-10 11:30:00', '2023-10-13 10:00:00'),

    -- 5: mediation, other
    (5,  108, 2, 10, 3,    'other',
     'Dispute over third-party plugin licensing costs that were not discussed before the work started.',
     'mediation', '2023-10-28 17:00:00', FALSE,
     '2023-10-11 09:00:00', '2023-10-14 09:30:00'),

    -- 6: admin_arbitration, non_payment (escalated from mediation)
    (6,  109, 5, 11, 1,    'non_payment',
     'Client refuses to release escrow despite delivery of final animation matching the approved storyboard.',
     'admin_arbitration', NULL, TRUE,
     '2023-09-28 10:00:00', '2023-10-15 11:00:00'),

    -- 7: admin_arbitration, poor_quality
    (7,  110, 6, 12, 2,    'poor_quality',
     'API endpoints fail the agreed load-testing thresholds and lack the documented authentication layer.',
     'admin_arbitration', NULL, TRUE,
     '2023-09-30 10:00:00', '2023-10-16 10:30:00'),

    -- 8: resolution_completed, misconduct (favour_client)
    (8,  104, 5, 12, 1,    'misconduct',
     'Freelancer subcontracted the work without disclosure, violating clause 4.2 of the contract.',
     'resolution_completed', NULL, FALSE,
     '2023-09-15 09:00:00', '2023-09-28 16:00:00'),

    -- 9: resolution_completed, scope_violation (favour_freelancer)
    (9,  107, 7, 9,  2,    'scope_violation',
     'Client asked for a second round of revisions after formally signing off on deliverables.',
     'resolution_completed', NULL, FALSE,
     '2023-08-01 09:00:00', '2023-08-20 16:00:00'),

    -- 10: resolution_completed, other (split outcome)
    (10, 105, 6, 13, 3,    'other',
     'Partial delivery accepted by client; disagreement over remaining balance handling.',
     'resolution_completed', NULL, FALSE,
     '2023-09-05 09:00:00', '2023-09-22 16:00:00'),

    -- 11: resolution_completed, non_payment (dismissed — insufficient evidence)
    (11, 108, 10, 2, 1,    'non_payment',
     'Freelancer alleges non-payment; however, escrow records show funds were released on time.',
     'resolution_completed', NULL, FALSE,
     '2023-08-28 09:00:00', '2023-09-10 16:00:00');

SELECT setval(pg_get_serial_sequence('disputes', 'id'), (SELECT MAX(id) FROM disputes));

-- ============================================================================
-- 5. EVIDENCE  — covers every file_type
-- ============================================================================
INSERT INTO evidence (dispute_id, uploaded_by, file_name, file_type, file_size_kb, file_path, is_visible_to_parties, uploaded_at) VALUES
    -- Dispute 2 (poor_quality)
    (2, 3,  'crash_screenshot.png',       'png',   845,  'seed/crash_screenshot.png',       TRUE,  '2023-10-14 10:20:00'),
    (2, 3,  'figma_vs_actual.jpg',        'jpg',   612,  'seed/figma_vs_actual.jpg',        TRUE,  '2023-10-14 10:22:00'),
    (2, 3,  'contract_spec.pdf',          'pdf',   2200, 'seed/contract_spec.pdf',          TRUE,  '2023-10-14 10:25:00'),

    -- Dispute 3 (scope_violation)
    (3, 11, 'original_brief.docx',        'docx',  148,  'seed/original_brief.docx',        TRUE,  '2023-10-05 09:30:00'),
    (3, 11, 'change_requests_log.pdf',    'pdf',   340,  'seed/change_requests_log.pdf',    TRUE,  '2023-10-05 09:35:00'),

    -- Dispute 4 (misconduct, mediation in progress)
    (4, 1,  'access_log_export.pdf',      'pdf',   1850, 'seed/access_log_export.pdf',      TRUE,  '2023-10-10 12:00:00'),
    (4, 14, 'my_response.docx',           'docx',  92,   'seed/my_response.docx',           FALSE, '2023-10-11 10:00:00'),

    -- Dispute 6 (admin_arbitration, non_payment)
    (6, 11, 'final_delivery.zip',         'zip',   14200,'seed/final_delivery.zip',         TRUE,  '2023-09-28 11:00:00'),
    (6, 11, 'approved_storyboard.pdf',    'pdf',   900,  'seed/approved_storyboard.pdf',    TRUE,  '2023-09-28 11:05:00'),
    (6, 5,  'client_objections.pdf',      'pdf',   256,  'seed/client_objections.pdf',      FALSE, '2023-10-02 09:00:00'),

    -- Dispute 7 (admin_arbitration, poor_quality)
    (7, 6,  'load_test_report.pdf',       'pdf',   1100, 'seed/load_test_report.pdf',       TRUE,  '2023-09-30 11:00:00'),
    (7, 6,  'missing_auth_evidence.png',  'png',   720,  'seed/missing_auth_evidence.png',  TRUE,  '2023-09-30 11:10:00'),
    (7, 12, 'defense_bundle.zip',         'zip',   5800, 'seed/defense_bundle.zip',         FALSE, '2023-10-01 14:00:00'),

    -- Dispute 8 (resolved, misconduct)
    (8, 5,  'contract_clause_4_2.pdf',    'pdf',   180,  'seed/contract_clause_4_2.pdf',    TRUE,  '2023-09-15 09:20:00'),
    (8, 5,  'subcontract_email.jpg',      'jpg',   430,  'seed/subcontract_email.jpg',      TRUE,  '2023-09-15 09:25:00'),

    -- Dispute 9 (resolved, scope_violation)
    (9, 9,  'signoff_email.png',          'png',   210,  'seed/signoff_email.png',          TRUE,  '2023-08-02 10:00:00'),
    (9, 9,  'deliverables_list.docx',     'docx',  64,   'seed/deliverables_list.docx',     TRUE,  '2023-08-02 10:05:00'),

    -- Dispute 10 (resolved, split)
    (10, 6, 'partial_delivery.zip',       'zip',   9400, 'seed/partial_delivery.zip',       TRUE,  '2023-09-06 09:00:00'),
    (10, 13,'invoice_breakdown.pdf',      'pdf',   110,  'seed/invoice_breakdown.pdf',      TRUE,  '2023-09-08 10:30:00'),

    -- Dispute 11 (resolved, dismissed)
    (11, 10,'escrow_transaction.pdf',     'pdf',   75,   'seed/escrow_transaction.pdf',     TRUE,  '2023-08-29 09:00:00');

-- ============================================================================
-- 6. MEDIATION RECORDS  — chat statements for disputes in mediation / resolved
-- ============================================================================
INSERT INTO mediation_records (dispute_id, author_id, statement, submitted_at) VALUES
    -- Dispute 4 (misconduct)
    (4, 1,  'The repository was private. Accessing it without written consent violates clause 4.2.', '2023-10-13 11:05:00'),
    (4, 14, 'I only cloned the repo linked in the ticket. I assumed it was part of the scope.',     '2023-10-13 14:30:00'),
    (4, 1,  'That ticket was filed by a third party — it was never authorised by me.',              '2023-10-14 09:15:00'),
    (4, 14, 'Happy to remove every local copy and sign an NDA retroactively if that resolves it.',   '2023-10-14 16:00:00'),

    -- Dispute 5 (other)
    (5, 2,  'Plugin licensing was never mentioned in the quote. I should not have to cover $300.',   '2023-10-12 10:00:00'),
    (5, 10, 'Industry norm is that client pays third-party licences. I can split it 50/50.',         '2023-10-12 14:00:00'),
    (5, 2,  'Fine — I will cover 50% if you waive the rush fee on the remaining milestones.',        '2023-10-13 09:00:00'),

    -- Dispute 6 (non_payment — escalated after mediation failed)
    (6, 11, 'Final delivery is attached. Every frame of the approved storyboard is accounted for.', '2023-10-02 09:30:00'),
    (6, 5,  'There are still 3 scenes with missing audio — I will release escrow after they land.', '2023-10-04 11:00:00'),
    (6, 11, 'Audio was out-of-scope per section 3 of the contract. I am escalating to admin.',      '2023-10-06 10:00:00'),

    -- Dispute 8 (resolved, misconduct) — mediation happened before decision
    (8, 5,  'You subcontracted the backend work without telling me. That is a clear breach.',       '2023-09-18 10:00:00'),
    (8, 12, 'The subcontractor is a senior colleague and the deliverable quality is the same.',    '2023-09-18 14:00:00'),
    (8, 5,  'Quality is not the issue — non-disclosure is. Escalating to arbitration.',             '2023-09-20 09:30:00'),

    -- Dispute 9 (resolved, scope_violation)
    (9, 7,  'The second revision set was necessary — the first pass missed key brand guidelines.', '2023-08-05 10:00:00'),
    (9, 9,  'I have your signed sign-off dated Aug 1st. Additional rounds are billable.',           '2023-08-05 14:00:00'),

    -- Dispute 10 (resolved, split)
    (10, 6, 'I received 70% of the agreed output, so I expect 70% of the invoice — not 100%.',     '2023-09-10 10:00:00'),
    (10, 13,'The missing 30% is ongoing edits the client keeps expanding. Willing to split.',      '2023-09-10 15:00:00');

-- ============================================================================
-- 7. ARBITRATION DECISIONS  — covers every outcome value
-- ============================================================================
INSERT INTO arbitration_decisions (id, dispute_id, admin_id, outcome, decision_notes, payment_signal_sent, decided_at) VALUES
    -- favour_client
    (1, 8,  1, 'favour_client',
     'Clause 4.2 prohibits undisclosed subcontracting. Breach confirmed. Full refund of $1,200 issued.',
     TRUE,  '2023-09-28 15:30:00'),

    -- favour_freelancer
    (2, 9,  2, 'favour_freelancer',
     'Client signed formal sign-off on Aug 1st. Additional revisions fall outside scope. Escrow released in full to freelancer.',
     TRUE,  '2023-08-20 15:30:00'),

    -- split
    (3, 10, 3, 'split',
     '70% of deliverables accepted by client; escrow split 70/30 between freelancer and client as agreed in mediation.',
     TRUE,  '2023-09-22 15:30:00'),

    -- dismissed
    (4, 11, 1, 'dismissed',
     'Escrow transaction logs show funds were released on 2023-08-20 as per contract. Complaint dismissed for insufficient evidence of non-payment.',
     FALSE, '2023-09-10 15:30:00');

SELECT setval(pg_get_serial_sequence('arbitration_decisions', 'id'), (SELECT MAX(id) FROM arbitration_decisions));

-- ============================================================================
-- 8. RESOLUTION REPORTS  — one per arbitration decision
-- ============================================================================
INSERT INTO resolution_reports (dispute_id, decision_id, dispute_summary, evidence_summary, mediation_summary, admin_decision, decision_notes, delivered_to_parties, generated_at) VALUES
    (8, 1,
     'Misconduct case filed by client Grace Lee against freelancer Henry Ford for undisclosed subcontracting on the SEO Optimization Package.',
     '2 evidence files reviewed: contract clause 4.2 and email chain confirming subcontract.',
     'Mediation failed: freelancer argued quality parity, client insisted on disclosure requirement.',
     'FAVOUR CLIENT (Full Refund)',
     'Refund of $1,200.00 returned to client per clause 4.2 enforcement.',
     TRUE,
     '2023-09-28 16:00:00'),

    (9, 2,
     'Scope-violation case filed by client Kevin Patel against freelancer Bob Jones over additional revision rounds.',
     '2 evidence files reviewed: signed sign-off email (Aug 1) and deliverables list.',
     'Mediation reached stalemate — client insisted on revisions, freelancer cited signed sign-off.',
     'FAVOUR FREELANCER (Escrow Released)',
     'Escrow of $1,500.00 released to freelancer. Additional work must be contracted separately.',
     TRUE,
     '2023-08-20 16:00:00'),

    (10, 3,
     'Partial-delivery dispute between client Ivy Chen and freelancer Jack Brown on the Copywriting project.',
     '2 evidence files reviewed: partial delivery zip and invoice breakdown.',
     'Mediation produced mutual agreement: client accepts 70% of output, freelancer accepts 70% payment.',
     'SPLIT (70 / 30)',
     'Escrow of $300.00 split: $210 released to freelancer, $90 returned to client.',
     TRUE,
     '2023-09-22 16:00:00'),

    (11, 4,
     'Non-payment claim by freelancer Dana White against client Alice Smith on the WordPress Theme Migration.',
     '1 evidence file reviewed: escrow transaction PDF showing on-time release.',
     'Mediation skipped — escrow records made the dispute moot.',
     'DISMISSED',
     'Escrow was released on 2023-08-20 as per contract. No further action required.',
     FALSE,
     '2023-09-10 16:00:00');

-- ============================================================================
-- 9. DISPUTE STATUS HISTORY  — full lifecycle transitions
-- ============================================================================
INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by, changed_at) VALUES
    -- Dispute 2: submitted -> evidence_uploaded
    (2, 'submitted',         'evidence_uploaded',    3,  '2023-10-14 10:45:00'),

    -- Dispute 3: submitted -> under_review
    (3, 'submitted',         'evidence_uploaded',    11, '2023-10-05 09:35:00'),
    (3, 'evidence_uploaded', 'under_review',         91, '2023-10-09 14:00:00'),

    -- Dispute 4: submitted -> evidence_uploaded -> under_review -> mediation
    (4, 'submitted',         'evidence_uploaded',    1,  '2023-10-10 12:00:00'),
    (4, 'evidence_uploaded', 'under_review',         90, '2023-10-11 09:00:00'),
    (4, 'under_review',      'mediation',            90, '2023-10-13 10:00:00'),

    -- Dispute 5: submitted -> mediation
    (5, 'submitted',         'under_review',         92, '2023-10-11 14:00:00'),
    (5, 'under_review',      'mediation',            92, '2023-10-14 09:30:00'),

    -- Dispute 6: full path including escalation to arbitration
    (6, 'submitted',         'evidence_uploaded',    11, '2023-09-28 11:05:00'),
    (6, 'evidence_uploaded', 'under_review',         90, '2023-09-29 10:00:00'),
    (6, 'under_review',      'mediation',            90, '2023-10-02 09:00:00'),
    (6, 'mediation',         'admin_arbitration',    90, '2023-10-15 11:00:00'),

    -- Dispute 7: submitted -> evidence_uploaded -> under_review -> admin_arbitration
    (7, 'submitted',         'evidence_uploaded',    6,  '2023-09-30 11:10:00'),
    (7, 'evidence_uploaded', 'under_review',         91, '2023-10-02 09:00:00'),
    (7, 'under_review',      'admin_arbitration',    91, '2023-10-16 10:30:00'),

    -- Dispute 8: fully resolved
    (8, 'submitted',         'evidence_uploaded',    5,  '2023-09-15 09:25:00'),
    (8, 'evidence_uploaded', 'under_review',         90, '2023-09-16 09:00:00'),
    (8, 'under_review',      'mediation',            90, '2023-09-18 10:00:00'),
    (8, 'mediation',         'admin_arbitration',    90, '2023-09-20 09:30:00'),
    (8, 'admin_arbitration', 'resolution_completed', 90, '2023-09-28 16:00:00'),

    -- Dispute 9: fully resolved
    (9, 'submitted',         'evidence_uploaded',    9,  '2023-08-02 10:05:00'),
    (9, 'evidence_uploaded', 'under_review',         91, '2023-08-03 09:00:00'),
    (9, 'under_review',      'mediation',            91, '2023-08-05 10:00:00'),
    (9, 'mediation',         'admin_arbitration',    91, '2023-08-15 09:00:00'),
    (9, 'admin_arbitration', 'resolution_completed', 91, '2023-08-20 16:00:00'),

    -- Dispute 10: fully resolved (split)
    (10, 'submitted',         'evidence_uploaded',   6,  '2023-09-08 10:30:00'),
    (10, 'evidence_uploaded', 'under_review',        92, '2023-09-09 09:00:00'),
    (10, 'under_review',      'mediation',           92, '2023-09-10 10:00:00'),
    (10, 'mediation',         'admin_arbitration',   92, '2023-09-20 09:00:00'),
    (10, 'admin_arbitration', 'resolution_completed',92, '2023-09-22 16:00:00'),

    -- Dispute 11: fully resolved (dismissed — fast path)
    (11, 'submitted',         'under_review',        90, '2023-08-29 09:30:00'),
    (11, 'under_review',      'admin_arbitration',   90, '2023-09-05 11:00:00'),
    (11, 'admin_arbitration', 'resolution_completed',90, '2023-09-10 16:00:00');

-- ============================================================================
-- 10. ADMIN AUDIT LOG  — covers every action_type and target_entity_type
-- ============================================================================
INSERT INTO admin_audit_log (admin_id, action_type, target_entity_id, target_entity_type, details, performed_at) VALUES
    -- dispute_decision (target: resolution_report)
    (1, 'dispute_decision',    1, 'resolution_report', 'Issued FAVOUR CLIENT decision on dispute #8',    '2023-09-28 15:30:00'),
    (2, 'dispute_decision',    2, 'resolution_report', 'Issued FAVOUR FREELANCER decision on dispute #9','2023-08-20 15:30:00'),
    (3, 'dispute_decision',    3, 'resolution_report', 'Issued SPLIT decision on dispute #10',           '2023-09-22 15:30:00'),
    (1, 'dispute_decision',    4, 'resolution_report', 'Issued DISMISSED decision on dispute #11',       '2023-09-10 15:30:00'),

    -- account_created (target: admin_account)
    (1, 'account_created',     3, 'admin_account',     'Created Admin John account',                     '2023-03-10 09:00:00'),
    (1, 'account_created',     4, 'admin_account',     'Created Admin Priya account',                    '2023-07-18 09:00:00'),

    -- role_changed (target: admin_account)
    (1, 'role_changed',        2, 'admin_account',     'Promoted Admin Mike to dispute_moderator',       '2022-06-22 09:00:00'),

    -- account_deactivated (target: admin_account)
    (1, 'account_deactivated', 4, 'admin_account',     'Deactivated Admin Priya account',                '2024-02-01 09:00:00'),

    -- evidence_reviewed (target: evidence)
    (1, 'evidence_reviewed',   6, 'evidence',          'Reviewed access log export for dispute #4',      '2023-10-13 09:30:00'),
    (2, 'evidence_reviewed',  11,'evidence',           'Reviewed load test report for dispute #7',       '2023-10-02 10:00:00'),

    -- status_updated (target: dispute)
    (1, 'status_updated',      4, 'dispute',           'Moved dispute #4 to mediation',                  '2023-10-13 10:00:00'),
    (2, 'status_updated',      3, 'dispute',           'Moved dispute #3 to under_review',               '2023-10-09 14:00:00'),
    (1, 'status_updated',      6, 'dispute',           'Escalated dispute #6 to admin arbitration',      '2023-10-15 11:00:00'),
    (2, 'status_updated',      7, 'dispute',           'Escalated dispute #7 to admin arbitration',      '2023-10-16 10:30:00'),
    (3, 'status_updated',      5, 'dispute',           'Moved dispute #5 to mediation',                  '2023-10-14 09:30:00');

-- ============================================================================
-- Done. Quick sanity check counts:
--   SELECT 'users', COUNT(*) FROM users
--   UNION ALL SELECT 'admin_profiles',   COUNT(*) FROM admin_profiles
--   UNION ALL SELECT 'projects',         COUNT(*) FROM projects
--   UNION ALL SELECT 'disputes',         COUNT(*) FROM disputes
--   UNION ALL SELECT 'evidence',         COUNT(*) FROM evidence
--   UNION ALL SELECT 'mediation',        COUNT(*) FROM mediation_records
--   UNION ALL SELECT 'arbitration',      COUNT(*) FROM arbitration_decisions
--   UNION ALL SELECT 'reports',          COUNT(*) FROM resolution_reports
--   UNION ALL SELECT 'status_history',   COUNT(*) FROM dispute_status_history
--   UNION ALL SELECT 'audit_log',        COUNT(*) FROM admin_audit_log;
-- ============================================================================
