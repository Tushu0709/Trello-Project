"use server"


import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import { CopyList } from "./schema";
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
		const listToCopy = await db.list.findUnique({
			where: { id, boardId, board: { orgId } },
			include: {
				cards: true
			}
		})
		if(!listToCopy) {
			return {error: "List Not Found"}
		}
		const lastList = await db.list.findFirst({
			where: {boardId},
			orderBy: {order: "desc"},
			select: {order: true }
		});
		const newOrder = lastList ? lastList.order+1: 1;
		list = await db.list.create({
			data: {
				boardId: listToCopy.boardId,
				title: `${listToCopy.title} - Copy`,
				order: newOrder,
				cards: {
					createMany: {
						data: listToCopy.cards.map((card)=> ({
							title: card.title,
							description: card.description,
							order: card.order
						}))
					}
				}
			},
			include: {
				cards: true
			}
		});
		await createAuditLog({
			entityId: list.id,
			entityType: ENTITY_TYPE.LIST,
			entityTitle: list.title,
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
	return { data: list }
}
export const copyList = createSafeAction(CopyList, handler);
