"use client"
import React, {ElementRef, useRef, useState} from 'react';
import {ListWithCards} from "@/types";
import {ListHeader} from "./list-header";
import {CardForm} from "./CardForm";
import {cn} from "@/lib/utils";
import {CardItem} from "./card-item";
import {Draggable,Droppable} from "@hello-pangea/dnd";

interface ListItemProps {
	index: number,
	data: ListWithCards
}
export const ListItem = ({index, data}: ListItemProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const textAreaFormRef = useRef<ElementRef<"textarea">>(null);
	const disableEditing = () => {
		setIsEditing(false)
	};
	const enableEditing = (): void => {
		setIsEditing(true);
		setTimeout((): void =>{
			textAreaFormRef.current?.focus();
		})
	}
	return (
		<Draggable draggableId={data.id} index={index}>
			{(provided)=> (
				<li
					{...provided.draggableProps}
					ref={provided.innerRef}
					className="shrink-0 h-full w-[272px] select-none">
					<div
						{...provided.dragHandleProps}
						className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
						<ListHeader onAddCard={enableEditing} data={data}/>
						<Droppable droppableId={data.id} type="card">
							{(provided)=> (
								<ol
									{...provided.droppableProps}
									ref={provided.innerRef}
									className={cn("mx-1 px-1 py-0.5 flex flex-col gap-y-2", data.cards.length > 0 ? "mt-2" : "mt-0")}>
									{data.cards.map((card, index) => (
										<CardItem key={card.id} index={index} data={card}/>
									))}
									{provided.placeholder}
								</ol>
							)}
						</Droppable>

						<CardForm
							ref={textAreaFormRef}
							isEditing={isEditing}
							enableEditing={enableEditing}
							disableEditing={disableEditing}
							listId={data.id}
						/>
					</div>
				</li>
			)}

		</Draggable>
	);
};
