"use server"


import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import { DeleteCard } from "./schema";
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
		card = await db.card.delete({
			where: {
				id,
				list: {
					board: {orgId},
					boardId
				}
			}
		})
		await createAuditLog({
			entityId: card.id,
			entityType: ENTITY_TYPE.CARD,
			entityTitle: card.title,
			action: ACTION.DELETE
		});
	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to delete`
			}
		}
	}
	revalidatePath(`/board/${boardId}`);
	return { data: card }
}
export const deleteCard = createSafeAction(DeleteCard, handler);
