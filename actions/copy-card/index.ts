"use server"


import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import { CopyCard } from "./schema";
import {InputType, ReturnType} from "./types";
import {createAuditLog} from "@/lib/create-audit-log";
import {ACTION, ENTITY_TYPE} from "@prisma/client";


const handler = async (data: InputType): Promise<ReturnType> => {
	const {orgId, userId} = auth();

	if(!orgId || !userId) {
		return {
			error: "Unauthorized",
		}
	}
	const {id, boardId} = data;
	let card;
	try {
		const cardToCopy = await db.card.findUnique({
			where: {
				id,
				list: {
					board: {orgId},
					boardId
				}
			}
		})
		if(!cardToCopy){
			return {
				error: "Card not found"
			}
		}
		const lastCard = await db.card.findFirst({
			where: { listId: cardToCopy.listId },
			orderBy:{ order:'desc' },
			select: { order:true }
		});
		const newOrder = lastCard ? lastCard.order+1: 1;
		card = await db.card.create({
			data: {
				title: `${cardToCopy.title} - Copy`,
				description: cardToCopy.description,
				order: newOrder,
				listId: cardToCopy.listId
			}
		});
		await createAuditLog({
			entityId: card.id,
			entityType: ENTITY_TYPE.CARD,
			entityTitle: card.title,
			action: ACTION.CREATE
		});
	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to copy`
			}
		}
		return {
			error: `Failed to update`
		}
	}
	revalidatePath(`/board/${boardId}`);
	return { data: card }
}
export const copyCard = createSafeAction(CopyCard, handler);
