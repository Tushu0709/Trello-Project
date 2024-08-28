"use server"

import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {CreateList} from "@/actions/create-list/schema";
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

	const {title, boardId} = data;
	let list;
	try {
		const board = await db.board.findUnique({
			where: {
				id: boardId,
				orgId
			}
		})
		if(!board) {
			return {
				error: 'Board not found'
			}
		}
		const lastList = await db.list.findFirst({
			where: {
				boardId: boardId
			},
			orderBy: {
				order: 'desc'
			},
			select: {
				order: true
			}
		});

		const newOrder = lastList ? lastList.order + 1 : 1
		list = await db.list.create({
			data: {
				title,
				boardId,
				order: newOrder
			}
		})
		await createAuditLog({
			entityId: list.id,
			entityType: ENTITY_TYPE.LIST,
			entityTitle: list.title,
			action: ACTION.CREATE
		});
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
	if(!data && !list) {
		return {
			error: "Something went wrong"
		}
	}
	return { data: list }
}
export const createList = createSafeAction(CreateList, handler);
