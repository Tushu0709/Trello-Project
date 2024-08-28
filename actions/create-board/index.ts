"use server"
import {InputType, ReturnType} from "./types";
import {auth} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import {CreateBoard} from "@/actions/create-board/schema";
import {createAuditLog} from "@/lib/create-audit-log";
import {ACTION, ENTITY_TYPE} from "@prisma/client";
import {incrementAvailableCount, hasAvailableCount} from "@/lib/org-limit";
import {checkSubscription} from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
	const {userId, orgId} = auth();
	if(!userId || !orgId) {
		return {
			error: "Unauthorized"
		}
	}
	const canCreate: boolean = await hasAvailableCount();
	const isPro = await checkSubscription();
	if(!canCreate && !isPro) {
		return {
			error: "You have reached your limit of free boards. Please upgrade to create more"
		}
	}
	const {title, image} = data;
	const [imageId,imageThumbUrl,imageFullUrl,imageLinkHTML, imageUserName] = image.split('|');
	if(!imageId || !imageThumbUrl || !imageFullUrl || !imageLinkHTML || !imageUserName) {
		return {
			error: "Missing Fields. Failed to create board"
		}
	}
	let board;
	try {
		board = await db.board.create({
			data: {
				title,
				orgId,
				imageId,
				imageThumbUrl,
				imageFullUrl,
				imageUserName,
				imageLinkHTML
			}});
		if(!isPro){
			await incrementAvailableCount()
		}
		await createAuditLog({
			entityId: board.id,
			entityType: ENTITY_TYPE.BOARD,
			entityTitle: board.title,
			action: ACTION.CREATE
		});
	} catch (err) {
		if(err instanceof Error) {
			return {
				error: `Failed to create: ${err.message}`
			}
		}
	}
	if(board != undefined) revalidatePath(`/board/${board.id}`);

	return {
		data: board
	}
}
export const createBoard = createSafeAction(CreateBoard, handler);
