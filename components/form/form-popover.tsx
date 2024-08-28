"use client"
import React, {ElementRef, useRef} from 'react';
import {useAction} from "@/hooks/use-action";
import {createBoard} from "@/actions/create-board";
import {Popover, PopoverTrigger, PopoverContent, PopoverClose} from "@/components/ui/popover";
import {FormInput} from "./form-input";
import {FormSubmit} from "./form-submit";
import {Button} from "@/components/ui/button";
import {X} from "lucide-react";
import {toast} from "sonner";
import {FormPicker} from "@/components/form/form-picker";
import {useRouter} from "next/navigation";
import {useProModal} from "@/hooks/use-pro-modal";

interface FormPopoverProps {
	children: React.ReactNode;
	side?: "left" | "right" | "top" | "bottom";
	align?: "start" | "center" | "end";
	sideOffset?: number
}
export const FormPopover = ({children, side = "bottom", align, sideOffset = 0}: FormPopoverProps) => {
	const closeRef = useRef<ElementRef<"button">>(null);
	const router = useRouter();
	const proModal = useProModal();
	// @ts-ignore
	const {execute,fieldErrors} = useAction(createBoard, {
		onSuccess: (data) => {

			toast.success(`Board ${data.title} created`)
			closeRef.current?.click();
			// @ts-ignore
			router.push(`/board/${data.id}`)
		},
		onError: (error) => {
			toast.error(error)
			proModal.onOpen()
		}
	})
	const onSubmit = (formData: FormData) => {
		const title: string = formData.get('title') as string;
		const image: string = formData.get('image') as string;

		execute({title, image}).then()
	}
	return (
		<Popover>
			<PopoverTrigger asChild >
				{children}
			</PopoverTrigger>
			<PopoverContent align={align} side={side} sideOffset={sideOffset} className="w-80 pt-3">
				<div className="text-sm font-medium text-center text-neutral-600 pb-4">
					Create Board
				</div>
				<PopoverClose asChild ref={closeRef}>
					<Button className="h-auto w-auto p-2 absolute top-2 right-2 text-neutral-600" variant="ghost">
						<X className="h-4 w-4"/>
					</Button>
				</PopoverClose>
				<form className="space-y-4" action={onSubmit}>
					<div className="space-y-4">
						<FormPicker id="image" errors={fieldErrors} />
						<FormInput  id="title" label="Board title" type="text" errors={fieldErrors}/>
					</div>
					<FormSubmit className="w-full">
						Create
					</FormSubmit>
				</form>
			</PopoverContent>
		</Popover>
	);
};
