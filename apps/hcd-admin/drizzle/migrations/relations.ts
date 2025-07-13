import { relations } from "drizzle-orm/relations";
import { users, news, committees, committeeMembers, councilMembers, documents, staff, politicalBlocks, activities, activityParticipants, commissionFiles, documentDeroga, documentModifica, ordinances, ordinanceModifica, contacts, contactGroupMembers, contactGroups } from "./schema";

export const newsRelations = relations(news, ({one}) => ({
	user: one(users, {
		fields: [news.authorId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	news: many(news),
	documents: many(documents),
}));

export const committeeMembersRelations = relations(committeeMembers, ({one}) => ({
	committee: one(committees, {
		fields: [committeeMembers.committeeId],
		references: [committees.id]
	}),
	councilMember: one(councilMembers, {
		fields: [committeeMembers.councilMemberId],
		references: [councilMembers.id]
	}),
}));

export const committeesRelations = relations(committees, ({one, many}) => ({
	committeeMembers: many(committeeMembers),
	councilMember_presidentId: one(councilMembers, {
		fields: [committees.presidentId],
		references: [councilMembers.id],
		relationName: "committees_presidentId_councilMembers_id"
	}),
	councilMember_secretaryId: one(councilMembers, {
		fields: [committees.secretaryId],
		references: [councilMembers.id],
		relationName: "committees_secretaryId_councilMembers_id"
	}),
	staff: one(staff, {
		fields: [committees.secretaryHcdId],
		references: [staff.id]
	}),
	commissionFiles: many(commissionFiles),
}));

export const councilMembersRelations = relations(councilMembers, ({one, many}) => ({
	committeeMembers: many(committeeMembers),
	committees_presidentId: many(committees, {
		relationName: "committees_presidentId_councilMembers_id"
	}),
	committees_secretaryId: many(committees, {
		relationName: "committees_secretaryId_councilMembers_id"
	}),
	politicalBlock: one(politicalBlocks, {
		fields: [councilMembers.blockId],
		references: [politicalBlocks.id]
	}),
	activityParticipants: many(activityParticipants),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	user: one(users, {
		fields: [documents.authorId],
		references: [users.id]
	}),
	documentDerogas_documentId: many(documentDeroga, {
		relationName: "documentDeroga_documentId_documents_id"
	}),
	documentDerogas_targetId: many(documentDeroga, {
		relationName: "documentDeroga_targetId_documents_id"
	}),
	documentModificas_documentId: many(documentModifica, {
		relationName: "documentModifica_documentId_documents_id"
	}),
	documentModificas_targetId: many(documentModifica, {
		relationName: "documentModifica_targetId_documents_id"
	}),
}));

export const staffRelations = relations(staff, ({one, many}) => ({
	committees: many(committees),
	politicalBlock: one(politicalBlocks, {
		fields: [staff.blockId],
		references: [politicalBlocks.id]
	}),
}));

export const politicalBlocksRelations = relations(politicalBlocks, ({many}) => ({
	councilMembers: many(councilMembers),
	staff: many(staff),
}));

export const activityParticipantsRelations = relations(activityParticipants, ({one}) => ({
	activity: one(activities, {
		fields: [activityParticipants.activityId],
		references: [activities.id]
	}),
	councilMember: one(councilMembers, {
		fields: [activityParticipants.councilMemberId],
		references: [councilMembers.id]
	}),
}));

export const activitiesRelations = relations(activities, ({many}) => ({
	activityParticipants: many(activityParticipants),
}));

export const commissionFilesRelations = relations(commissionFiles, ({one}) => ({
	committee: one(committees, {
		fields: [commissionFiles.committeeId],
		references: [committees.id]
	}),
}));

export const documentDerogaRelations = relations(documentDeroga, ({one}) => ({
	document_documentId: one(documents, {
		fields: [documentDeroga.documentId],
		references: [documents.id],
		relationName: "documentDeroga_documentId_documents_id"
	}),
	document_targetId: one(documents, {
		fields: [documentDeroga.targetId],
		references: [documents.id],
		relationName: "documentDeroga_targetId_documents_id"
	}),
}));

export const documentModificaRelations = relations(documentModifica, ({one}) => ({
	document_documentId: one(documents, {
		fields: [documentModifica.documentId],
		references: [documents.id],
		relationName: "documentModifica_documentId_documents_id"
	}),
	document_targetId: one(documents, {
		fields: [documentModifica.targetId],
		references: [documents.id],
		relationName: "documentModifica_targetId_documents_id"
	}),
}));

export const ordinanceModificaRelations = relations(ordinanceModifica, ({one}) => ({
	ordinance: one(ordinances, {
		fields: [ordinanceModifica.ordinanceId],
		references: [ordinances.id]
	}),
}));

export const ordinancesRelations = relations(ordinances, ({many}) => ({
	ordinanceModificas: many(ordinanceModifica),
}));

export const contactGroupMembersRelations = relations(contactGroupMembers, ({one}) => ({
	contact: one(contacts, {
		fields: [contactGroupMembers.contactId],
		references: [contacts.id]
	}),
	contactGroup: one(contactGroups, {
		fields: [contactGroupMembers.groupId],
		references: [contactGroups.id]
	}),
}));

export const contactsRelations = relations(contacts, ({many}) => ({
	contactGroupMembers: many(contactGroupMembers),
}));

export const contactGroupsRelations = relations(contactGroups, ({many}) => ({
	contactGroupMembers: many(contactGroupMembers),
}));