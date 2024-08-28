"use client"

import React, {ElementRef, useRef, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {useEventListener, useOnClickOutside} from "usehooks-ts";
import {Plus, X} from "lucide-react";
import {useAction} from "@/hooks/use-action";
import {createList} from "@/actions/create-list";
import {FormInput} from "@/components/form/form-input";
import {FormSubmit} from "@/components/form/form-submit";
import {Button} from "@/components/ui/button";
import {ListWrapper} from "./list-wrapper";
import {toast} from "sonner";


export const ListForm = () => {
	const params = useParams();
	const router = useRouter();
	const [editing, setEditing] = useState(false);
	const formRef = useRef<ElementRef<"form">>(null);
	const inputRef = useRef<ElementRef<"input">>(null);
	const enableEditing = () => {
		setEditing(true);
		setTimeout(()=>{
			inputRef.current?.focus()
		})
	}
	const disableEditing = () => {
		setEditing(false);
	}
	const {execute,fieldErrors} = useAction(createList, {
		onSuccess: (data)=> {
			toast.success(`List "${data.title}" created`);
			disableEditing();
			router.refresh()
		},
		onError: (error) => {
			toast.error(error);
		}
	})
	const onKeyDown = (e: KeyboardEvent) => {
		if(e.key === "Escape") {
			disableEditing();
		}
	}
	useEventListener("keydown", onKeyDown);
	useOnClickOutside(formRef, disableEditing);

	const onSubmit = (formData: FormData) => {
		const title = formData.get('title') as string;
		const boardId = formData.get('boardId') as string;

		execute({
			title,
			boardId
		}).then()
	};
	if(editing) {
		return (
			<ListWrapper>
				<form className="w-full p-3 rounded-md bg-white space-y-4 shadow-md" ref={formRef} action={onSubmit}>
					<FormInput
						ref={inputRef}
						id="title"
						errors={fieldErrors}
						className="text-sm px-2 py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
						placeholder="Enter text title"
					/>
					<input
						hidden
						value={params.boardId}
						name="boardId"
						readOnly
					/>
					<div className="flex items-center gap-x-1">
						<FormSubmit >
							Add List
						</FormSubmit>
						<Button onClick={disableEditing} size="sm" variant="ghost">
							<X className="h-5 w-5"/>
						</Button>
					</div>
				</form>
			</ListWrapper>
		)
	}
	return (
		<div>
			<ListWrapper>
				<button
					onClick={enableEditing}
					className="w-full rounded-md bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm">
					<Plus className="h-4 w-4 mr-2"/> Add a List
				</button>

			</ListWrapper>
		</div>
	);
};


