"use server"

import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {UpdateListOrder} from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
	const {orgId, userId} = auth();

	if(!orgId || !userId) {
		return {
			error: "Unauthorized",
		}
	}

	const { boardId, items} = data;
	let lists;

	try {
		const transaction = items.map((list)=>
			db.list.update({
				where: {
					id: list.id,
					board: {
						orgId
					}
				},
				data: {
					order: list.order
				}
			})
		);
		lists = await db.$transaction(transaction);
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
	return { data: lists };
}
export const updateListOrder = createSafeAction(UpdateListOrder, handler);
