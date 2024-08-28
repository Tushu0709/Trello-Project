"use server"


import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {DeleteBoard} from "@/actions/delete-board/schema";
import {redirect} from "next/navigation";
import {InputType, ReturnType} from "@/actions/delete-board/types";
import {createAuditLog} from "@/lib/create-audit-log";
import {ACTION, ENTITY_TYPE} from "@prisma/client";
import {decreaseAvailableCount} from "@/lib/org-limit";
import {checkSubscription} from "@/lib/subscription";


const handler = async (data: InputType): Promise<ReturnType> => {
	const {orgId, userId} = auth();
	const isPro = await checkSubscription();
	if(!orgId || !userId) {
		return {
			error: "Unauthorized",
		}
	}
	const {id} = data;

	try {
		const board = await db.board.delete({
			where: { id, orgId }
		})

		if(!isPro){
			await decreaseAvailableCount();
		}
		await createAuditLog({
			entityId: board.id,
			entityType: ENTITY_TYPE.BOARD,
			entityTitle: board.title,
			action: ACTION.DELETE
		});
	} catch (e) {
		if (e instanceof Error ){
			return {
				error: `${e.message}: Failed to delete`
			}
		}
		return {
			error: ` Failed to update`
		}
	}
	revalidatePath(`/organization/${orgId}`);
	redirect(`/organization/${orgId}`)
}
export const deleteBoard = createSafeAction(DeleteBoard, handler);
