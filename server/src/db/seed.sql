-- Module 8 demo seed for SPM_Centralized_Db (runs after schema.sql on empty DB).
-- Provides users, marketplace category, jobs/bids/projects, escrow, admins, disputes, and related rows.
-- Demo users share one bcrypt hash: plain-text password `password` (development only — use POST /api/auth/login).

INSERT INTO marketplace_categories (id, name, slug, description, sort_order, is_active)
VALUES (1, 'General', 'general', 'Demo category for Module 8 seed', 0, TRUE);

INSERT INTO users (id, email, password_hash, first_name, last_name, role, account_status, created_at) VALUES
    (1,  'alex.profile@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alex',    'Profile',   'client',     'active',    '2022-03-10 09:00:00'),
    (2,  'alice@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice',   'Smith',     'client',     'active',    '2022-04-02 09:00:00'),
    (3,  'charlie@example.com',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Charlie', 'Davis',     'client',     'active',    '2022-05-18 09:00:00'),
    (4,  'frank@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Frank',   'Green',     'client',     'active',    '2022-06-22 09:00:00'),
    (5,  'grace@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Grace',   'Lee',       'client',     'active',    '2022-07-14 09:00:00'),
    (6,  'ivy@example.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ivy',     'Chen',      'client',     'active',    '2022-08-30 09:00:00'),
    (7,  'kevin@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kevin',   'Patel',     'client',     'active',    '2022-09-11 09:00:00'),
    (8,  'laura@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Laura',   'Kim',       'client',     'suspended', '2022-10-05 09:00:00'),
    (9,  'bob@example.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bob',     'Jones',     'freelancer', 'active',    '2022-03-20 09:00:00'),
    (10, 'dana@example.com',            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dana',    'White',     'freelancer', 'active',    '2022-04-15 09:00:00'),
    (11, 'eve@example.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Eve',     'Black',     'freelancer', 'active',    '2022-05-28 09:00:00'),
    (12, 'henry@example.com',           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Henry',   'Ford',      'freelancer', 'active',    '2022-06-30 09:00:00'),
    (13, 'jack@example.com',            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jack',    'Brown',     'freelancer', 'active',    '2022-07-25 09:00:00'),
    (14, 'mia@example.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mia',     'Garcia',    'freelancer', 'active',    '2022-08-12 09:00:00'),
    (15, 'noah@example.com',            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Noah',    'Wilson',    'freelancer', 'banned',    '2022-09-02 09:00:00'),
    (90, 'sarah@nexus.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah',   'Admin',     'admin',      'active',    '2022-01-15 09:00:00'),
    (91, 'mike@nexus.com',              '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mike',    'Admin',     'admin',      'active',    '2022-06-22 09:00:00'),
    (92, 'john@nexus.com',              '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John',    'Admin',     'admin',      'active',    '2023-03-10 09:00:00'),
    (93, 'priya@nexus.com',             '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Priya',   'Admin',     'admin',      'active',    '2023-07-18 09:00:00');

INSERT INTO jobs (id, client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at) VALUES
    (201, 2,  'E-commerce Website Redesign — job',     'Posted job for redesign.', 1, 2000.0000, 3000.0000, '2024-12-31', 'in_progress', '2023-09-01 10:00:00'),
    (202, 3,  'Mobile App Development — job',        'Posted job for mobile app.', 1, 4000.0000, 5500.0000, '2024-12-31', 'in_progress', '2023-09-05 10:00:00'),
    (203, 4,  'Logo & Brand Identity — job',           'Posted job for branding.', 1, 800.0000, 1200.0000, '2024-11-30', 'in_progress', '2023-09-08 10:00:00'),
    (204, 5,  'SEO Optimization Package — job',        'Posted job for SEO.', 1, 1000.0000, 1500.0000, '2024-10-15', 'completed', '2023-08-15 10:00:00'),
    (205, 6,  'Copywriting for Product Blog — job',    'Posted job for copy.', 1, 250.0000, 400.0000, '2024-11-01', 'in_progress', '2023-09-20 10:00:00'),
    (206, 1,  'Data Dashboard — job',                'Posted job for dashboard.', 1, 3000.0000, 4000.0000, '2024-12-01', 'in_progress', '2023-09-25 10:00:00'),
    (207, 7,  'UX Audit of Checkout Flow — job',       'Posted job for UX audit.', 1, 1200.0000, 1800.0000, '2024-08-01', 'completed', '2023-07-12 10:00:00'),
    (208, 2,  'WordPress Theme Migration — job',       'Posted job for WP migration.', 1, 600.0000, 900.0000, '2024-11-15', 'in_progress', '2023-10-01 10:00:00'),
    (209, 5,  'Explainer Video Animation — job',       'Posted job for video.', 1, 1500.0000, 2200.0000, '2024-11-20', 'in_progress', '2023-10-03 10:00:00'),
    (210, 6,  'Node.js REST API + Tests — job',        'Posted job for API.', 1, 1800.0000, 2500.0000, '2024-11-25', 'in_progress', '2023-10-04 10:00:00');

INSERT INTO bids (id, job_id, freelancer_id, cover_letter, proposed_rate, estimated_days, status, submitted_at) VALUES
    (301, 201, 9,  'Bid for redesign', 2500.0000, 45, 'accepted', '2023-09-01 11:00:00'),
    (302, 202, 10, 'Bid for mobile app', 4800.0000, 60, 'accepted', '2023-09-05 11:00:00'),
    (303, 203, 11, 'Bid for branding', 950.0000, 14, 'accepted', '2023-09-08 11:00:00'),
    (304, 204, 12, 'Bid for SEO', 1200.0000, 30, 'accepted', '2023-08-15 11:00:00'),
    (305, 205, 13, 'Bid for copywriting', 300.0000, 7, 'accepted', '2023-09-20 11:00:00'),
    (306, 206, 14, 'Bid for dashboard', 3200.0000, 40, 'accepted', '2023-09-25 11:00:00'),
    (307, 207, 9,  'Bid for UX audit', 1500.0000, 10, 'accepted', '2023-07-12 11:00:00'),
    (308, 208, 10, 'Bid for WP migration', 700.0000, 14, 'accepted', '2023-10-01 11:00:00'),
    (309, 209, 11, 'Bid for video', 1800.0000, 21, 'accepted', '2023-10-03 11:00:00'),
    (310, 210, 12, 'Bid for API', 2100.0000, 28, 'accepted', '2023-10-04 11:00:00');

INSERT INTO projects (id, job_id, bid_id, client_id, freelancer_id, title, description, agreed_amount, currency, start_date, deadline, status, created_at) VALUES
    (101, 201, 301, 2,  9,  'E-commerce Website Redesign',     'Demo seeded project.', 2500.0000, 'USD', '2023-09-01', '2024-06-01', 'under_review', '2023-09-01 10:00:00'),
    (102, 202, 302, 3,  10, 'Mobile App Development',          'Demo seeded project.', 4800.0000, 'USD', '2023-09-05', '2024-07-01', 'under_review', '2023-09-05 10:00:00'),
    (103, 203, 303, 4,  11, 'Logo & Brand Identity',           'Demo seeded project.', 950.0000,  'USD', '2023-09-08', '2024-05-01', 'under_review', '2023-09-08 10:00:00'),
    (104, 204, 304, 5,  12, 'SEO Optimization Package',        'Demo seeded project.', 1200.0000, 'USD', '2023-08-15', '2024-04-01', 'cancelled',    '2023-08-15 10:00:00'),
    (105, 205, 305, 6,  13, 'Copywriting for Product Blog',      'Demo seeded project.', 300.0000,  'USD', '2023-09-20', '2024-05-15', 'under_review', '2023-09-20 10:00:00'),
    (106, 206, 306, 1,  14, 'Data Dashboard (React + D3)',     'Demo seeded project.', 3200.0000, 'USD', '2023-09-25', '2024-08-01', 'in_progress',  '2023-09-25 10:00:00'),
    (107, 207, 307, 7,  9,  'UX Audit of Checkout Flow',       'Demo seeded project.', 1500.0000, 'USD', '2023-07-12', '2024-03-01', 'completed',    '2023-07-12 10:00:00'),
    (108, 208, 308, 2,  10, 'WordPress Theme Migration',       'Demo seeded project.', 700.0000,  'USD', '2023-10-01', '2024-06-15', 'under_review', '2023-10-01 10:00:00'),
    (109, 209, 309, 5,  11, 'Explainer Video Animation',       'Demo seeded project.', 1800.0000, 'USD', '2023-10-03', '2024-07-10', 'under_review', '2023-10-03 10:00:00'),
    (110, 210, 310, 6,  12, 'Node.js REST API + Tests',        'Demo seeded project.', 2100.0000, 'USD', '2023-10-04', '2024-07-20', 'under_review', '2023-10-04 10:00:00');

INSERT INTO escrow_accounts (project_id, client_user_id, freelancer_user_id, currency_code, total_amount, funded_amount, released_amount, refunded_amount, escrow_status, funded_at) VALUES
    (101, 2,  9,  'USD', 2500.0000, 2500.0000, 0.0000,       0.0000, 'active',    '2023-09-01 12:00:00'),
    (102, 3,  10, 'USD', 4800.0000, 4800.0000, 0.0000,       0.0000, 'active',    '2023-09-05 12:00:00'),
    (103, 4,  11, 'USD', 950.0000,  950.0000,  0.0000,       0.0000, 'active',    '2023-09-08 12:00:00'),
    (104, 5,  12, 'USD', 1200.0000, 1200.0000, 1200.0000,    0.0000, 'completed', '2023-08-15 12:00:00'),
    (105, 6,  13, 'USD', 300.0000,  300.0000,  0.0000,       0.0000, 'active',    '2023-09-20 12:00:00'),
    (106, 1,  14, 'USD', 3200.0000, 3200.0000, 0.0000,       0.0000, 'active',    '2023-09-25 12:00:00'),
    (107, 7,  9,  'USD', 1500.0000, 1500.0000, 1500.0000,    0.0000, 'completed', '2023-07-12 12:00:00'),
    (108, 2,  10, 'USD', 700.0000,  700.0000,  0.0000,       0.0000, 'active',    '2023-10-01 12:00:00'),
    (109, 5,  11, 'USD', 1800.0000, 1800.0000, 0.0000,       0.0000, 'active',    '2023-10-03 12:00:00'),
    (110, 6,  12, 'USD', 2100.0000, 2100.0000, 0.0000,       0.0000, 'active',    '2023-10-04 12:00:00');

INSERT INTO admin_profiles (id, user_id, role, is_active, created_at, updated_at) VALUES
    (1, 90, 'super_admin',       TRUE,  '2022-01-15 09:00:00', '2022-01-15 09:00:00'),
    (2, 91, 'dispute_moderator', TRUE,  '2022-06-22 09:00:00', '2022-06-22 09:00:00'),
    (3, 92, 'dispute_moderator', TRUE,  '2023-03-10 09:00:00', '2023-03-10 09:00:00'),
    (4, 93, 'dispute_moderator', FALSE, '2023-07-18 09:00:00', '2024-02-01 09:00:00');

INSERT INTO disputes (id, project_id, complainant_id, respondent_id, assigned_admin_id, dispute_type, description, status, mediation_deadline, mediation_escalated, created_at, updated_at, resolved_at) VALUES
    (1,  101, 2, 9,  NULL, 'non_payment',      'Freelancer missed the Oct 1st deadline and after two extensions has stopped responding. Escrow is locked; requesting a full refund of $2,500.', 'submitted', NULL, FALSE, '2023-10-12 09:15:00', '2023-10-12 09:15:00', NULL),
    (2,  102, 3, 10, NULL, 'poor_quality',     'Delivered Android build crashes on launch and the UI does not match the agreed Figma spec.', 'evidence_uploaded', NULL, FALSE, '2023-10-14 10:00:00', '2023-10-14 10:45:00', NULL),
    (3,  103, 11, 4, 2,    'scope_violation',  'Client keeps requesting changes far beyond the original scope without additional compensation.', 'under_review', NULL, FALSE, '2023-10-05 09:00:00', '2023-10-09 14:00:00', NULL),
    (4,  106, 1, 14, 1,    'misconduct',       'Freelancer used client credentials to access private repositories that were not part of the contract.', 'mediation', '2023-10-25 17:00:00', FALSE, '2023-10-10 11:30:00', '2023-10-13 10:00:00', NULL),
    (5,  108, 2, 10, 3,    'other',            'Dispute over third-party plugin licensing costs that were not discussed before the work started.', 'mediation', '2023-10-28 17:00:00', FALSE, '2023-10-11 09:00:00', '2023-10-14 09:30:00', NULL),
    (6,  109, 5, 11, 1,    'non_payment',      'Client refuses to release escrow despite delivery of final animation matching the approved storyboard.', 'admin_arbitration', NULL, TRUE, '2023-09-28 10:00:00', '2023-10-15 11:00:00', NULL),
    (7,  110, 6, 12, 2,    'poor_quality',     'API endpoints fail the agreed load-testing thresholds and lack the documented authentication layer.', 'admin_arbitration', NULL, TRUE, '2023-09-30 10:00:00', '2023-10-16 10:30:00', NULL),
    (8,  104, 5, 12, 1,    'misconduct',       'Freelancer subcontracted the work without disclosure, violating clause 4.2 of the contract.', 'resolution_completed', NULL, FALSE, '2023-09-15 09:00:00', '2023-09-28 16:00:00', '2023-09-28 16:00:00'),
    (9,  107, 7, 9,  2,    'scope_violation',  'Client asked for a second round of revisions after formally signing off on deliverables.', 'resolution_completed', NULL, FALSE, '2023-08-01 09:00:00', '2023-08-20 16:00:00', '2023-08-20 16:00:00'),
    (10, 105, 6, 13, 3,    'other',            'Partial delivery accepted by client; disagreement over remaining balance handling.', 'resolution_completed', NULL, FALSE, '2023-09-05 09:00:00', '2023-09-22 16:00:00', '2023-09-22 16:00:00'),
    (11, 108, 10, 2, 1,    'non_payment',      'Freelancer alleges non-payment; however, escrow records show funds were released on time.', 'resolution_completed', NULL, FALSE, '2023-08-28 09:00:00', '2023-09-10 16:00:00', '2023-09-10 16:00:00');

INSERT INTO dispute_evidence (id, dispute_id, uploaded_by, file_name, file_type, file_size_kb, file_path, is_visible_to_parties, uploaded_at) VALUES
    (1, 2, 3,  'crash_screenshot.png',       'png',   845,  'seed/crash_screenshot.png',       TRUE,  '2023-10-14 10:20:00'),
    (2, 2, 3,  'figma_vs_actual.jpg',        'jpg',   612,  'seed/figma_vs_actual.jpg',        TRUE,  '2023-10-14 10:22:00'),
    (3, 2, 3,  'contract_spec.pdf',          'pdf',   2200, 'seed/contract_spec.pdf',          TRUE,  '2023-10-14 10:25:00'),
    (4, 3, 11, 'original_brief.docx',        'docx',  148,  'seed/original_brief.docx',        TRUE,  '2023-10-05 09:30:00'),
    (5, 3, 11, 'change_requests_log.pdf',    'pdf',   340,  'seed/change_requests_log.pdf',    TRUE,  '2023-10-05 09:35:00'),
    (6, 4, 1,  'access_log_export.pdf',      'pdf',   1850, 'seed/access_log_export.pdf',      TRUE,  '2023-10-10 12:00:00'),
    (7, 4, 14, 'my_response.docx',           'docx',  92,   'seed/my_response.docx',           FALSE, '2023-10-11 10:00:00'),
    (8, 6, 11, 'final_delivery.zip',         'zip',   14200,'seed/final_delivery.zip',         TRUE,  '2023-09-28 11:00:00'),
    (9, 6, 11, 'approved_storyboard.pdf',    'pdf',   900,  'seed/approved_storyboard.pdf',    TRUE,  '2023-09-28 11:05:00'),
    (10, 6, 5, 'client_objections.pdf',      'pdf',   256,  'seed/client_objections.pdf',      FALSE, '2023-10-02 09:00:00'),
    (11, 7, 6, 'load_test_report.pdf',       'pdf',   1100, 'seed/load_test_report.pdf',       TRUE,  '2023-09-30 11:00:00'),
    (12, 7, 6, 'missing_auth_evidence.png',  'png',   720,  'seed/missing_auth_evidence.png',  TRUE,  '2023-09-30 11:10:00'),
    (13, 7, 12, 'defense_bundle.zip',         'zip',   5800, 'seed/defense_bundle.zip',         FALSE, '2023-10-01 14:00:00'),
    (14, 8, 5, 'contract_clause_4_2.pdf',    'pdf',   180,  'seed/contract_clause_4_2.pdf',    TRUE,  '2023-09-15 09:20:00'),
    (15, 8, 5, 'subcontract_email.jpg',      'jpg',   430,  'seed/subcontract_email.jpg',      TRUE,  '2023-09-15 09:25:00'),
    (16, 9, 9, 'signoff_email.png',          'png',   210,  'seed/signoff_email.png',          TRUE,  '2023-08-02 10:00:00'),
    (17, 9, 9, 'deliverables_list.docx',     'docx',  64,   'seed/deliverables_list.docx',     TRUE,  '2023-08-02 10:05:00'),
    (18, 10, 6, 'partial_delivery.zip',       'zip',   9400, 'seed/partial_delivery.zip',       TRUE,  '2023-09-06 09:00:00'),
    (19, 10, 13,'invoice_breakdown.pdf',      'pdf',   110,  'seed/invoice_breakdown.pdf',      TRUE,  '2023-09-08 10:30:00'),
    (20, 11, 10,'escrow_transaction.pdf',     'pdf',   75,   'seed/escrow_transaction.pdf',     TRUE,  '2023-08-29 09:00:00');

INSERT INTO dispute_mediation_records (dispute_id, author_id, statement, submitted_at) VALUES
    (4, 1,  'The repository was private. Accessing it without written consent violates clause 4.2.', '2023-10-13 11:05:00'),
    (4, 14, 'I only cloned the repo linked in the ticket. I assumed it was part of the scope.',     '2023-10-13 14:30:00'),
    (4, 1,  'That ticket was filed by a third party — it was never authorised by me.',              '2023-10-14 09:15:00'),
    (4, 14, 'Happy to remove every local copy and sign an NDA retroactively if that resolves it.',   '2023-10-14 16:00:00'),
    (5, 2,  'Plugin licensing was never mentioned in the quote. I should not have to cover $300.',   '2023-10-12 10:00:00'),
    (5, 10, 'Industry norm is that client pays third-party licences. I can split it 50/50.',         '2023-10-12 14:00:00'),
    (5, 2,  'Fine — I will cover 50% if you waive the rush fee on the remaining milestones.',        '2023-10-13 09:00:00'),
    (6, 11, 'Final delivery is attached. Every frame of the approved storyboard is accounted for.', '2023-10-02 09:30:00'),
    (6, 5,  'There are still 3 scenes with missing audio — I will release escrow after they land.', '2023-10-04 11:00:00'),
    (6, 11, 'Audio was out-of-scope per section 3 of the contract. I am escalating to admin.',      '2023-10-06 10:00:00'),
    (8, 5,  'You subcontracted the backend work without telling me. That is a clear breach.',       '2023-09-18 10:00:00'),
    (8, 12, 'The subcontractor is a senior colleague and the deliverable quality is the same.',    '2023-09-18 14:00:00'),
    (8, 5,  'Quality is not the issue — non-disclosure is. Escalating to arbitration.',             '2023-09-20 09:30:00'),
    (9, 7,  'The second revision set was necessary — the first pass missed key brand guidelines.', '2023-08-05 10:00:00'),
    (9, 9,  'I have your signed sign-off dated Aug 1st. Additional rounds are billable.',           '2023-08-05 14:00:00'),
    (10, 6, 'I received 70% of the agreed output, so I expect 70% of the invoice — not 100%.',     '2023-09-10 10:00:00'),
    (10, 13,'The missing 30% is ongoing edits the client keeps expanding. Willing to split.',      '2023-09-10 15:00:00');

INSERT INTO dispute_arbitration_decisions (id, dispute_id, admin_id, outcome, decision_notes, payment_signal_sent, decided_at) VALUES
    (1, 8,  1, 'favour_client',      'Clause 4.2 prohibits undisclosed subcontracting. Breach confirmed. Full refund of $1,200 issued.', TRUE,  '2023-09-28 15:30:00'),
    (2, 9,  2, 'favour_freelancer',  'Client signed formal sign-off on Aug 1st. Additional revisions fall outside scope. Escrow released in full to freelancer.', TRUE,  '2023-08-20 15:30:00'),
    (3, 10, 3, 'split',              '70% of deliverables accepted by client; escrow split 70/30 between freelancer and client as agreed in mediation.', TRUE,  '2023-09-22 15:30:00'),
    (4, 11, 1, 'dismissed',          'Escrow transaction logs show funds were released on 2023-08-20 as per contract. Complaint dismissed for insufficient evidence of non-payment.', FALSE, '2023-09-10 15:30:00');

INSERT INTO dispute_resolution_reports (id, dispute_id, decision_id, dispute_summary, evidence_summary, mediation_summary, admin_decision, decision_notes, delivered_to_parties, generated_at) VALUES
    (1, 8, 1,
     'Misconduct case filed by client Grace Lee against freelancer Henry Ford for undisclosed subcontracting on the SEO Optimization Package.',
     '2 evidence files reviewed: contract clause 4.2 and email chain confirming subcontract.',
     'Mediation failed: freelancer argued quality parity, client insisted on disclosure requirement.',
     'FAVOUR CLIENT (Full Refund)',
     'Refund of $1,200.00 returned to client per clause 4.2 enforcement.',
     TRUE,
     '2023-09-28 16:00:00'),
    (2, 9, 2,
     'Scope-violation case filed by client Kevin Patel against freelancer Bob Jones over additional revision rounds.',
     '2 evidence files reviewed: signed sign-off email (Aug 1) and deliverables list.',
     'Mediation reached stalemate — client insisted on revisions, freelancer cited signed sign-off.',
     'FAVOUR FREELANCER (Escrow Released)',
     'Escrow of $1,500.00 released to freelancer. Additional work must be contracted separately.',
     TRUE,
     '2023-08-20 16:00:00'),
    (3, 10, 3,
     'Partial-delivery dispute between client Ivy Chen and freelancer Jack Brown on the Copywriting project.',
     '2 evidence files reviewed: partial delivery zip and invoice breakdown.',
     'Mediation produced mutual agreement: client accepts 70% of output, freelancer accepts 70% payment.',
     'SPLIT (70 / 30)',
     'Escrow of $300.00 split: $210 released to freelancer, $90 returned to client.',
     TRUE,
     '2023-09-22 16:00:00'),
    (4, 11, 4,
     'Non-payment claim by freelancer Dana White against client Alice Smith on the WordPress Theme Migration.',
     '1 evidence file reviewed: escrow transaction PDF showing on-time release.',
     'Mediation skipped — escrow records made the dispute moot.',
     'DISMISSED',
     'Escrow was released on 2023-08-20 as per contract. No further action required.',
     FALSE,
     '2023-09-10 16:00:00');

INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by, changed_at) VALUES
    (2, 'submitted',         'evidence_uploaded',    3,  '2023-10-14 10:45:00'),
    (3, 'submitted',         'evidence_uploaded',    11, '2023-10-05 09:35:00'),
    (3, 'evidence_uploaded', 'under_review',         91, '2023-10-09 14:00:00'),
    (4, 'submitted',         'evidence_uploaded',    1,  '2023-10-10 12:00:00'),
    (4, 'evidence_uploaded', 'under_review',         90, '2023-10-11 09:00:00'),
    (4, 'under_review',      'mediation',            90, '2023-10-13 10:00:00'),
    (5, 'submitted',         'under_review',         92, '2023-10-11 14:00:00'),
    (5, 'under_review',      'mediation',            92, '2023-10-14 09:30:00'),
    (6, 'submitted',         'evidence_uploaded',    11, '2023-09-28 11:05:00'),
    (6, 'evidence_uploaded', 'under_review',         90, '2023-09-29 10:00:00'),
    (6, 'under_review',      'mediation',            90, '2023-10-02 09:00:00'),
    (6, 'mediation',         'admin_arbitration',    90, '2023-10-15 11:00:00'),
    (7, 'submitted',         'evidence_uploaded',    6,  '2023-09-30 11:10:00'),
    (7, 'evidence_uploaded', 'under_review',         91, '2023-10-02 09:00:00'),
    (7, 'under_review',      'admin_arbitration',    91, '2023-10-16 10:30:00'),
    (8, 'submitted',         'evidence_uploaded',    5,  '2023-09-15 09:25:00'),
    (8, 'evidence_uploaded', 'under_review',         90, '2023-09-16 09:00:00'),
    (8, 'under_review',      'mediation',            90, '2023-09-18 10:00:00'),
    (8, 'mediation',         'admin_arbitration',    90, '2023-09-20 09:30:00'),
    (8, 'admin_arbitration', 'resolution_completed', 90, '2023-09-28 16:00:00'),
    (9, 'submitted',         'evidence_uploaded',    9,  '2023-08-02 10:05:00'),
    (9, 'evidence_uploaded', 'under_review',         91, '2023-08-03 09:00:00'),
    (9, 'under_review',      'mediation',            91, '2023-08-05 10:00:00'),
    (9, 'mediation',         'admin_arbitration',    91, '2023-08-15 09:00:00'),
    (9, 'admin_arbitration', 'resolution_completed', 91, '2023-08-20 16:00:00'),
    (10, 'submitted',         'evidence_uploaded',   6,  '2023-09-08 10:30:00'),
    (10, 'evidence_uploaded', 'under_review',        92, '2023-09-09 09:00:00'),
    (10, 'under_review',      'mediation',           92, '2023-09-10 10:00:00'),
    (10, 'mediation',         'admin_arbitration',   92, '2023-09-20 09:00:00'),
    (10, 'admin_arbitration', 'resolution_completed',92, '2023-09-22 16:00:00'),
    (11, 'submitted',         'under_review',        90, '2023-08-29 09:30:00'),
    (11, 'under_review',      'admin_arbitration',   90, '2023-09-05 11:00:00'),
    (11, 'admin_arbitration', 'resolution_completed',90, '2023-09-10 16:00:00');

INSERT INTO dispute_admin_audit_log (admin_id, action_type, target_entity_id, target_entity_type, details, performed_at) VALUES
    (1, 'dispute_decision',    1, 'resolution_report', 'Issued FAVOUR CLIENT decision on dispute #8',    '2023-09-28 15:30:00'),
    (2, 'dispute_decision',    2, 'resolution_report', 'Issued FAVOUR FREELANCER decision on dispute #9','2023-08-20 15:30:00'),
    (3, 'dispute_decision',    3, 'resolution_report', 'Issued SPLIT decision on dispute #10',           '2023-09-22 15:30:00'),
    (1, 'dispute_decision',    4, 'resolution_report', 'Issued DISMISSED decision on dispute #11',       '2023-09-10 15:30:00'),
    (1, 'account_created',     3, 'admin_account',     'Created Admin John account',                     '2023-03-10 09:00:00'),
    (1, 'account_created',     4, 'admin_account',     'Created Admin Priya account',                    '2023-07-18 09:00:00'),
    (1, 'role_changed',        2, 'admin_account',     'Promoted Admin Mike to dispute_moderator',       '2022-06-22 09:00:00'),
    (1, 'account_deactivated', 4, 'admin_account',     'Deactivated Admin Priya account',                '2024-02-01 09:00:00'),
    (1, 'evidence_reviewed',   6, 'evidence',          'Reviewed access log export for dispute #4',      '2023-10-13 09:30:00'),
    (2, 'evidence_reviewed',  11,'evidence',           'Reviewed load test report for dispute #7',       '2023-10-02 10:00:00'),
    (1, 'status_updated',      4, 'dispute',           'Moved dispute #4 to mediation',                  '2023-10-13 10:00:00'),
    (2, 'status_updated',      3, 'dispute',           'Moved dispute #3 to under_review',               '2023-10-09 14:00:00'),
    (1, 'status_updated',      6, 'dispute',           'Escalated dispute #6 to admin arbitration',      '2023-10-15 11:00:00'),
    (2, 'status_updated',      7, 'dispute',           'Escalated dispute #7 to admin arbitration',      '2023-10-16 10:30:00'),
    (3, 'status_updated',      5, 'dispute',           'Moved dispute #5 to mediation',                  '2023-10-14 09:30:00');

SELECT setval(pg_get_serial_sequence('marketplace_categories', 'id'), (SELECT MAX(id) FROM marketplace_categories));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('jobs', 'id'), (SELECT MAX(id) FROM jobs));
SELECT setval(pg_get_serial_sequence('bids', 'id'), (SELECT MAX(id) FROM bids));
SELECT setval(pg_get_serial_sequence('projects', 'id'), (SELECT MAX(id) FROM projects));
SELECT setval(pg_get_serial_sequence('escrow_accounts', 'id'), (SELECT MAX(id) FROM escrow_accounts));
SELECT setval(pg_get_serial_sequence('admin_profiles', 'id'), (SELECT MAX(id) FROM admin_profiles));
SELECT setval(pg_get_serial_sequence('disputes', 'id'), (SELECT MAX(id) FROM disputes));
SELECT setval(pg_get_serial_sequence('dispute_evidence', 'id'), (SELECT MAX(id) FROM dispute_evidence));
SELECT setval(pg_get_serial_sequence('dispute_mediation_records', 'id'), (SELECT MAX(id) FROM dispute_mediation_records));
SELECT setval(pg_get_serial_sequence('dispute_arbitration_decisions', 'id'), (SELECT MAX(id) FROM dispute_arbitration_decisions));
SELECT setval(pg_get_serial_sequence('dispute_resolution_reports', 'id'), (SELECT MAX(id) FROM dispute_resolution_reports));
SELECT setval(pg_get_serial_sequence('dispute_status_history', 'id'), (SELECT MAX(id) FROM dispute_status_history));
SELECT setval(pg_get_serial_sequence('dispute_admin_audit_log', 'id'), (SELECT MAX(id) FROM dispute_admin_audit_log));
