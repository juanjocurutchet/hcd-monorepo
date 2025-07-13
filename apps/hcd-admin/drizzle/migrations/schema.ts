import { pgTable, foreignKey, unique, serial, varchar, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentType = pgEnum("document_type", ['ordenanza', 'decreto', 'resolucion', 'comunicacion'])
export const sessionType = pgEnum("session_type", ['ordinaria', 'extraordinaria', 'especial', 'preparatoria'])


export const news = pgTable("news", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	excerpt: text(),
	imageUrl: varchar("image_url", { length: 255 }),
	publishedAt: timestamp("published_at", { mode: 'string' }).defaultNow().notNull(),
	authorId: integer("author_id"),
	slug: varchar({ length: 255 }).notNull(),
	isPublished: boolean("is_published").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "news_author_id_users_id_fk"
		}),
	unique("news_slug_unique").on(table.slug),
]);

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	agendaFileUrl: varchar("agenda_file_url", { length: 255 }),
	minutesFileUrl: varchar("minutes_file_url", { length: 255 }),
	audioFileUrl: varchar("audio_file_url", { length: 255 }),
	videoUrl: varchar("video_url", { length: 255 }),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const committeeMembers = pgTable("committee_members", {
	id: serial().primaryKey().notNull(),
	committeeId: integer("committee_id").notNull(),
	councilMemberId: integer("council_member_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.committeeId],
			foreignColumns: [committees.id],
			name: "committee_members_committee_id_committees_id_fk"
		}),
	foreignKey({
			columns: [table.councilMemberId],
			foreignColumns: [councilMembers.id],
			name: "committee_members_council_member_id_council_members_id_fk"
		}),
]);

export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	number: varchar({ length: 100 }),
	type: documentType().notNull(),
	content: text(),
	fileUrl: varchar("file_url", { length: 255 }),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	authorId: integer("author_id"),
	isPublished: boolean("is_published").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "documents_author_id_users_id_fk"
		}),
]);

export const contactMessages = pgTable("contact_messages", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	organization: varchar({ length: 255 }),
	subject: text().notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).default('contact').notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const committees = pgTable("committees", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	presidentId: integer("president_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	secretaryId: integer("secretary_id"),
	isActive: boolean("is_active").default(true).notNull(),
	secretaryHcdId: integer("secretary_hcd_id"),
}, (table) => [
	foreignKey({
			columns: [table.presidentId],
			foreignColumns: [councilMembers.id],
			name: "committees_president_id_council_members_id_fk"
		}),
	foreignKey({
			columns: [table.secretaryId],
			foreignColumns: [councilMembers.id],
			name: "committees_secretary_id_council_members_id_fk"
		}),
	foreignKey({
			columns: [table.secretaryHcdId],
			foreignColumns: [staff.id],
			name: "committees_secretary_hcd_id_staff_id_fk"
		}),
]);

export const activities = pgTable("activities", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	imageUrl: varchar("image_url", { length: 255 }),
	isPublished: boolean("is_published").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	location: varchar({ length: 255 }),
	enableNotifications: boolean("enable_notifications").default(true).notNull(),
	notificationAdvance: text("notification_advance").default('24').notNull(),
	notificationEmails: text("notification_emails"),
	lastNotificationSent: timestamp("last_notification_sent", { mode: 'string' }),
});

export const councilMembers = pgTable("council_members", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	position: varchar({ length: 255 }),
	blockId: integer("block_id"),
	mandate: varchar({ length: 100 }),
	imageUrl: varchar("image_url", { length: 255 }),
	bio: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	email: varchar({ length: 255 }),
	seniorPosition: varchar("senior_position", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.blockId],
			foreignColumns: [politicalBlocks.id],
			name: "council_members_block_id_political_blocks_id_fk"
		}),
]);

export const activityParticipants = pgTable("activity_participants", {
	id: serial().primaryKey().notNull(),
	activityId: integer("activity_id").notNull(),
	councilMemberId: integer("council_member_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.activityId],
			foreignColumns: [activities.id],
			name: "activity_participants_activity_id_activities_id_fk"
		}),
	foreignKey({
			columns: [table.councilMemberId],
			foreignColumns: [councilMembers.id],
			name: "activity_participants_council_member_id_council_members_id_fk"
		}),
]);

export const politicalBlocks = pgTable("political_blocks", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	presidentId: integer("president_id"),
	color: varchar({ length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	description: text(),
});

export const commissionFiles = pgTable("commission_files", {
	id: serial().primaryKey().notNull(),
	committeeId: integer("committee_id").notNull(),
	expedienteNumber: varchar("expediente_number", { length: 100 }).notNull(),
	fechaEntrada: timestamp("fecha_entrada", { mode: 'string' }).notNull(),
	descripcion: text().notNull(),
	despacho: boolean().default(false).notNull(),
	fechaDespacho: timestamp("fecha_despacho", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	fileUrl: varchar("file_url", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.committeeId],
			foreignColumns: [committees.id],
			name: "commission_files_committee_id_committees_id_fk"
		}),
]);

export const staff = pgTable("staff", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	position: varchar({ length: 255 }).notNull(),
	blockId: integer("block_id"),
	bio: text(),
	imageUrl: varchar("image_url", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	email: varchar({ length: 255 }),
	telefono: varchar({ length: 100 }),
	facebook: varchar({ length: 255 }),
	instagram: varchar({ length: 255 }),
	twitter: varchar({ length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.blockId],
			foreignColumns: [politicalBlocks.id],
			name: "staff_block_id_political_blocks_id_fk"
		}),
]);

export const ordinanceTypes = pgTable("ordinance_types", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("ordinance_types_name_unique").on(table.name),
]);

export const documentDeroga = pgTable("document_deroga", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	targetId: integer("target_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_deroga_document_id_documents_id_fk"
		}),
	foreignKey({
			columns: [table.targetId],
			foreignColumns: [documents.id],
			name: "document_deroga_target_id_documents_id_fk"
		}),
]);

export const documentModifica = pgTable("document_modifica", {
	id: serial().primaryKey().notNull(),
	documentId: integer("document_id").notNull(),
	targetId: integer("target_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_modifica_document_id_documents_id_fk"
		}),
	foreignKey({
			columns: [table.targetId],
			foreignColumns: [documents.id],
			name: "document_modifica_target_id_documents_id_fk"
		}),
]);

export const ordinanceCategories = pgTable("ordinance_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("ordinance_categories_name_unique").on(table.name),
]);

export const ordinances = pgTable("ordinances", {
	id: serial().primaryKey().notNull(),
	approvalNumber: integer("approval_number").notNull(),
	title: text().notNull(),
	year: integer().notNull(),
	type: text().notNull(),
	category: text().notNull(),
	notes: text(),
	isActive: boolean("is_active").default(true),
	fileUrl: text("file_url"),
	slug: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	derogadaPor: integer("derogada_por"),
	isModifies: boolean("is_modifies"),
}, (table) => [
	unique("ordinances_slug_unique").on(table.slug),
]);

export const ordinanceModifica = pgTable("ordinance_modifica", {
	id: serial().primaryKey().notNull(),
	ordinanceId: integer("ordinance_id").notNull(),
	modificadoraNumero: integer("modificadora_numero").notNull(),
	observaciones: text(),
}, (table) => [
	foreignKey({
			columns: [table.ordinanceId],
			foreignColumns: [ordinances.id],
			name: "ordinance_modifica_ordinance_id_ordinances_id_fk"
		}),
]);

export const contactGroupMembers = pgTable("contact_group_members", {
	id: serial().primaryKey().notNull(),
	contactId: integer("contact_id").notNull(),
	groupId: integer("group_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contactId],
			foreignColumns: [contacts.id],
			name: "contact_group_members_contact_id_contacts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [contactGroups.id],
			name: "contact_group_members_group_id_contact_groups_id_fk"
		}).onDelete("cascade"),
]);

export const contactGroups = pgTable("contact_groups", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	organization: varchar({ length: 255 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	position: varchar({ length: 100 }),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	unique("contacts_email_unique").on(table.email),
]);

export const modificatoriasTmpBackup = pgTable("modificatorias_tmp_backup", {
	idmodif: integer(),
	idord: integer(),
	numaprob: integer(),
	nombre: text(),
	"año": integer("año"),
	observaciones: text(),
	ordenanza: integer(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('editor').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
