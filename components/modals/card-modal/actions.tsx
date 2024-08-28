"use client"

import {Skeleton} from "@/components/ui/skeleton";
import {CardWithList} from "@/types";
import {Button} from "@/components/ui/button";
import {Copy, Trash} from "lucide-react";
import {useAction} from "@/hooks/use-action";
import {copyCard} from "@/actions/copy-card";
import {toast} from "sonner";
import {deleteCard} from "@/actions/delete-card";
import {useParams} from "next/navigation";
import {useCardModal} from "@/hooks/use-card-modal";

interface CardActionsProps {
	data: CardWithList
}
export const CardActions = ({data}: CardActionsProps) => {
	const params = useParams();
	const boardId = params.boardId as string;
	const cardModal = useCardModal()
	// @ts-ignore
	const {execute: executeCopyCard, isLoading: isLoadingCopyCard} = useAction(copyCard,{
		onSuccess: (): void => {
			toast.success(`Card copied`);
			cardModal.onClose();
		},
		onError: (error) => toast.error(error),
	});

	// @ts-ignore
	const {execute: executeDeleteCard, isLoading: isLoadingDeleteCard} = useAction(deleteCard,{
		onSuccess: (): void => {
			toast.success(`Card deleted`);
			cardModal.onClose();
		},
		onError: (error) => toast.error(error),
	});
	const onCopy = () => {
		executeCopyCard({id: data.id, boardId}).then()
	}
	const onDelete = () => {
		executeDeleteCard({id: data.id, boardId}).then()
	}
	return (
		<div className="space-y-2 mt-2">
			<p className="text-xs font-semibold">Actions</p>
			<Button
				variant="gray" className="w-full justify-start"
				size="inline"
				onClick={onCopy}
				disabled={isLoadingCopyCard}
			>
					<Copy className="w-4 h-4 mr-2" />Copy
			</Button>
			<Button
				variant="destructive"
				size="sm"
				className="w-full justify-start"
				disabled={isLoadingDeleteCard}
				onClick={onDelete}
			>
					<Trash className="w-4 h-4 mr-2" />Delete
			</Button>
		</div>
	)
}

CardActions.Skeleton = function ActionsSkeleton() {
	return(
		<div className={"space-y-2 mt-2"}>
			<Skeleton className="w-20 h-4 bg-neutral-200"/>
			<Skeleton className="w-full h-8 bg-neutral-200"/>
			<Skeleton className="w-full h-8 bg-neutral-200"/>
		</div>
	)
}
