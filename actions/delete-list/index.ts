"use server"


import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import { DeleteList } from "./schema";
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
	let list;
	try {
		list = await db.list.delete({
			where: { id, boardId, board: { orgId } }
		})
		await createAuditLog({
			entityId: list.id,
			entityType: ENTITY_TYPE.LIST,
			entityTitle: list.title,
			action: ACTION.DELETE
		});
	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to delete`
			}
		}
		return {
			error: `Failed to update`
		}
	}
	revalidatePath(`/board/${boardId}`);
	return { data: list }
}
export const deleteList = createSafeAction(DeleteList, handler);
