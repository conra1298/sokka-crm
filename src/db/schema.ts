import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const uuidCol = (name: string) => text(name).$defaultFn(() => crypto.randomUUID());
const timestampCol = (name: string) => text(name).$defaultFn(() => new Date().toISOString());

// 1. Users Table
export const users = sqliteTable('users', {
  id: uuidCol('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('salesperson').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestampCol('created_at').notNull(),
  updatedAt: timestampCol('updated_at').notNull(),
});

// 2. Companies Table
export const companies = sqliteTable(
  'companies',
  {
    id: uuidCol('id').primaryKey(),
    name: text('name').notNull(),
    domain: text('domain'),
    industry: text('industry'),
    phone: text('phone'),
    address: text('address'),
    website: text('website'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    facebookUrl: text('facebook_url'),
    tiktokUrl: text('tiktok_url'),
    clientStatus: text('client_status').default('prospect').notNull(),
    briefNotes: text('brief_notes'),
    ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
    isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
    createdAt: timestampCol('created_at').notNull(),
    updatedAt: timestampCol('updated_at').notNull(),
  },
  (table) => [
    index('companies_domain_idx').on(table.domain),
    index('companies_owner_idx').on(table.ownerId),
  ]
);

// 3. Contacts Table
export const contacts = sqliteTable(
  'contacts',
  {
    id: uuidCol('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    normalizedEmail: text('normalized_email').notNull(),
    phone: text('phone'),
    jobTitle: text('job_title'),
    leadSource: text('lead_source'),
    companyId: text('company_id').references(() => companies.id, { onDelete: 'set null' }),
    ownerId: text('owner_id').references(() => users.id, { onDelete: 'set null' }),
    hasDuplicates: integer('has_duplicates', { mode: 'boolean' }).default(false).notNull(),
    duplicateCount: integer('duplicate_count').default(0).notNull(),
    isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
    mergedIntoId: text('merged_into_id').references((): any => contacts.id, { onDelete: 'set null' }),
    createdAt: timestampCol('created_at').notNull(),
    updatedAt: timestampCol('updated_at').notNull(),
  },
  (table) => [
    index('contacts_email_idx').on(table.email),
    index('contacts_normalized_email_idx').on(table.normalizedEmail),
    index('contacts_company_idx').on(table.companyId),
    index('contacts_owner_idx').on(table.ownerId),
    index('contacts_merged_into_idx').on(table.mergedIntoId),
  ]
);

// 4. Pipeline Stages Table
export const pipelineStages = sqliteTable(
  'pipeline_stages',
  {
    id: uuidCol('id').primaryKey(),
    name: text('name').notNull(),
    displayOrder: integer('display_order').notNull(),
    isTerminal: integer('is_terminal', { mode: 'boolean' }).default(false).notNull(),
    isWon: integer('is_won', { mode: 'boolean' }).default(false).notNull(),
    createdAt: timestampCol('created_at').notNull(),
  },
  (table) => [
    index('pipeline_stages_order_idx').on(table.displayOrder),
  ]
);

// 5. Deals Table
export const deals = sqliteTable(
  'deals',
  {
    id: uuidCol('id').primaryKey(),
    title: text('title').notNull(),
    value: real('value'),
    currency: text('currency').default('ARS').notNull(),
    leadSource: text('lead_source'),
    dealType: text('deal_type').default('project').notNull(),
    monthlyValue: real('monthly_value'),
    retainerStartDate: text('retainer_start_date'),
    retainerRenewalDate: text('retainer_renewal_date'),
    briefNotes: text('brief_notes'),
    website: text('website'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    facebookUrl: text('facebook_url'),
    tiktokUrl: text('tiktok_url'),
    stageId: text('stage_id').notNull().references(() => pipelineStages.id, { onDelete: 'restrict' }),
    companyId: text('company_id').references(() => companies.id, { onDelete: 'set null' }),
    contactId: text('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    expectedCloseDate: text('expected_close_date'),
    isArchived: integer('is_archived', { mode: 'boolean' }).default(false).notNull(),
    closedAt: text('closed_at'),
    createdAt: timestampCol('created_at').notNull(),
    updatedAt: timestampCol('updated_at').notNull(),
  },
  (table) => [
    index('deals_stage_idx').on(table.stageId),
    index('deals_owner_idx').on(table.ownerId),
    index('deals_company_idx').on(table.companyId),
    index('deals_contact_idx').on(table.contactId),
  ]
);

// 6. Activities Table
export const activities = sqliteTable(
  'activities',
  {
    id: uuidCol('id').primaryKey(),
    type: text('type').notNull(),
    content: text('content'),
    metadata: text('metadata', { mode: 'json' }),
    contactId: text('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    dealId: text('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
    companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestampCol('created_at').notNull(),
    isCorrection: integer('is_correction', { mode: 'boolean' }).default(false).notNull(),
    correctsId: text('corrects_id').references((): any => activities.id, { onDelete: 'set null' }),
    correctionReason: text('correction_reason'),
  },
  (table) => [
    index('activities_contact_created_idx').on(table.contactId, table.createdAt),
    index('activities_deal_created_idx').on(table.dealId, table.createdAt),
    index('activities_company_created_idx').on(table.companyId, table.createdAt),
  ]
);

// 7. Tasks Table
export const tasks = sqliteTable(
  'tasks',
  {
    id: uuidCol('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    dueDate: text('due_date'),
    isCompleted: integer('is_completed', { mode: 'boolean' }).default(false).notNull(),
    completedAt: text('completed_at'),
    contactId: text('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
    dealId: text('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
    companyId: text('company_id').references(() => companies.id, { onDelete: 'cascade' }),
    assignedTo: text('assigned_to').notNull().references(() => users.id, { onDelete: 'restrict' }),
    createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestampCol('created_at').notNull(),
    updatedAt: timestampCol('updated_at').notNull(),
  },
  (table) => [
    index('tasks_assigned_completed_due_idx').on(table.assignedTo, table.isCompleted, table.dueDate),
    index('tasks_deal_idx').on(table.dealId),
    index('tasks_contact_idx').on(table.contactId),
  ]
);

// 8. Audit Log Table
export const auditLog = sqliteTable(
  'audit_log',
  {
    id: uuidCol('id').primaryKey(),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    actorId: text('actor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    details: text('details', { mode: 'json' }),
    ipAddress: text('ip_address'),
    createdAt: timestampCol('created_at').notNull(),
  },
  (table) => [
    index('audit_actor_created_idx').on(table.actorId, table.createdAt),
    index('audit_action_idx').on(table.action),
  ]
);

// 9. Import Jobs Table
export const importJobs = sqliteTable(
  'import_jobs',
  {
    id: uuidCol('id').primaryKey(),
    status: text('status').default('pending').notNull(),
    fileKey: text('file_key').notNull(),
    fileName: text('file_name').notNull(),
    entityType: text('entity_type').notNull(),
    columnMapping: text('column_mapping', { mode: 'json' }),
    totalRows: integer('total_rows'),
    validRows: integer('valid_rows'),
    errorRows: integer('error_rows'),
    duplicateRows: integer('duplicate_rows'),
    errors: text('errors', { mode: 'json' }),
    duplicates: text('duplicates', { mode: 'json' }),
    createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestampCol('created_at').notNull(),
    completedAt: text('completed_at'),
    idempotencyKey: text('idempotency_key').unique(),
  },
  (table) => [
    index('import_jobs_created_by_idx').on(table.createdBy),
  ]
);

// 10. Email Ingestion Log Table
export const emailIngestionLog = sqliteTable(
  'email_ingestion_log',
  {
    id: uuidCol('id').primaryKey(),
    messageId: text('message_id').notNull().unique(),
    fromAddress: text('from_address').notNull(),
    toAddresses: text('to_addresses', { mode: 'json' }).notNull(),
    subject: text('subject'),
    bodyPreview: text('body_preview'),
    matchedContactId: text('matched_contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    activityId: text('activity_id').references(() => activities.id, { onDelete: 'set null' }),
    status: text('status').notNull(),
    rawPayloadKey: text('raw_payload_key'),
    createdAt: timestampCol('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('email_message_id_idx').on(table.messageId),
  ]
);

// 11. Tags Table
export const tags = sqliteTable('tags', {
  id: uuidCol('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').default('#5CB2D4').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestampCol('created_at').notNull(),
});

// 12. Contact Tags Junction Table
export const contactTags = sqliteTable(
  'contact_tags',
  {
    contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.contactId, table.tagId] }),
  ]
);

// 13. Company Tags Junction Table
export const companyTags = sqliteTable(
  'company_tags',
  {
    companyId: text('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.companyId, table.tagId] }),
  ]
);

// 14. Services Catalog Table
export const services = sqliteTable('services', {
  id: uuidCol('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  defaultPrice: real('default_price').default(0).notNull(),
  category: text('category').default('social_media').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestampCol('created_at').notNull(),
  updatedAt: timestampCol('updated_at').notNull(),
});

// 15. Deal Service Items Table
export const dealServiceItems = sqliteTable('deal_service_items', {
  id: uuidCol('id').primaryKey(),
  dealId: text('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  serviceId: text('service_id').references(() => services.id, { onDelete: 'set null' }),
  customName: text('custom_name').notNull(),
  unitPrice: real('unit_price').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestampCol('created_at').notNull(),
});

// RELATIONS DEFINITIONS

export const usersRelations = relations(users, ({ many }) => ({
  ownedCompanies: many(companies),
  ownedContacts: many(contacts),
  ownedDeals: many(deals),
  assignedTasks: many(tasks, { relationName: 'task_assigned_to' }),
  createdTasks: many(tasks, { relationName: 'task_created_by' }),
  activities: many(activities),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
  companyTags: many(companyTags),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
  }),
  mergedInto: one(contacts, {
    fields: [contacts.mergedIntoId],
    references: [contacts.id],
    relationName: 'merged_contact',
  }),
  deals: many(deals),
  activities: many(activities),
  tasks: many(tasks),
  contactTags: many(contactTags),
}));

export const pipelineStagesRelations = relations(pipelineStages, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  stage: one(pipelineStages, {
    fields: [deals.stageId],
    references: [pipelineStages.id],
  }),
  company: one(companies, {
    fields: [deals.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  owner: one(users, {
    fields: [deals.ownerId],
    references: [users.id],
  }),
  activities: many(activities),
  tasks: many(tasks),
  serviceItems: many(dealServiceItems),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [activities.createdBy],
    references: [users.id],
  }),
  corrects: one(activities, {
    fields: [activities.correctsId],
    references: [activities.id],
    relationName: 'activity_correction',
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: 'task_assigned_to',
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: 'task_created_by',
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  contactTags: many(contactTags),
  companyTags: many(companyTags),
}));

export const contactTagsRelations = relations(contactTags, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactTags.contactId],
    references: [contacts.id],
  }),
  tag: one(tags, {
    fields: [contactTags.tagId],
    references: [tags.id],
  }),
}));

export const companyTagsRelations = relations(companyTags, ({ one }) => ({
  company: one(companies, {
    fields: [companyTags.companyId],
    references: [companies.id],
  }),
  tag: one(tags, {
    fields: [companyTags.tagId],
    references: [tags.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  dealItems: many(dealServiceItems),
}));

export const dealServiceItemsRelations = relations(dealServiceItems, ({ one }) => ({
  deal: one(deals, {
    fields: [dealServiceItems.dealId],
    references: [deals.id],
  }),
  service: one(services, {
    fields: [dealServiceItems.serviceId],
    references: [services.id],
  }),
}));


