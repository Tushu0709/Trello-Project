import {auth} from "@clerk/nextjs";
import {db} from './db';
import {MAX_FREE_BOARDS} from "@/constants/boards";

export const incrementAvailableCount = async ():Promise<any> => {
	const {orgId} = auth();
	if(!orgId) {
		throw new Error("Unauthorized");
	}
	const orgLimit= await db.orgLimit.findUnique({
		where: {
			orgId
		}
	});
	if(orgLimit) {
		await db.orgLimit.update({
			where: { orgId },
			data: { count: orgLimit.count + 1 }
		});
	} else {
		await db.orgLimit.create({
			data: {
				orgId,
				count: 1
			}
		});
	}
}

export const decreaseAvailableCount = async ():Promise<any> => {
	const {orgId} = auth();
	if(!orgId) {
		throw new Error("Unauthorized");
	}
	const orgLimit = await db.orgLimit.findUnique({
		where: {
			orgId
		}
	});
	if(orgLimit) {
		await db.orgLimit.update({
			where: { orgId },
			data: { count: orgLimit.count > 0 ? orgLimit.count - 1: 0 }
		});
	} else {
		await db.orgLimit.create({
			data: {
				orgId,
				count: 1
			}
		});
	}
}
export const hasAvailableCount = async () => {
	const {orgId} = auth();
	if(!orgId) {
		throw new Error("Unauthorized");
	}

	const orgLimit = await db.orgLimit.findUnique({
		where: {
			orgId
		}
	});
	return !orgLimit || orgLimit.count < MAX_FREE_BOARDS;
}

export const getAvailableCount = async (): Promise<number> => {
	const {orgId} = auth();
	if(!orgId) {
		return 0
	}
	const getOrgLimit = await db.orgLimit.findUnique({
		where: { orgId }
	});

	if(!getOrgLimit) {
		return 0;
	}

	return getOrgLimit.count;
}
