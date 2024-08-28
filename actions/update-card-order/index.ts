"use server"

import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {UpdateCardOrder} from "./schema";
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

	const {items, boardId} = data;
	let updatedCards;

	try {
		const transaction = items.map((card)=>
			db.card.update({
				where: {
					id: card.id,
					list: {
						board: {
							orgId
						}
					}
				},
				data: {
					order: card.order,
					listId: card.listId
				}
			})
		)

		updatedCards = await db.$transaction(transaction);

	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to reorder`
			}
		}
		return {
			error: ` Failed to create list`
		}
	}
	revalidatePath(`/board/${boardId}`);
	return { data: updatedCards };
}
export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);
