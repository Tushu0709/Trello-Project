"use server"

import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {CreateCard} from "./schema";
import { InputType, ReturnType } from "./types";
import {createAuditLog} from "@/lib/create-audit-log";
import {ACTION, ENTITY_TYPE} from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
	const {orgId, userId} = auth();

	if(!orgId || !userId) {
		return {
			error: "Unauthorized",
		}
	}

	const {title, boardId, listId} = data;
	let card;
	try {
		const list = await db.list.findUnique({
			where: {
				id: listId,
				board: {
					orgId
				}
			}
		})
		if(!list) {
			return { error: "List not found"}
		}
		const lastCard = await db.card.findFirst({
			where : {listId},
			orderBy: {order:"desc"},
			select: {order: true}
		});

		const newOrder = lastCard ? lastCard.order + 1: 1;

		card = await db.card.create({
			data: {
				title,
				listId,
				order: newOrder
			}
		})
		await createAuditLog({
			entityId: card.id,
			entityTitle: card.title,
			entityType: ENTITY_TYPE.CARD,
			action: ACTION.CREATE
		})
	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to update`
			}
		}
		return {
			error: ` Failed to create list`
		}
	}
	revalidatePath(`/board/${boardId}`)
	if(!data && !card) {
		return {
			error: "Something went wrong"
		}
	}
	return { data: card }
}
export const createCard = createSafeAction(CreateCard, handler);
