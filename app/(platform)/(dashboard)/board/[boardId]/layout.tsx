import React from 'react';
import {auth} from "@clerk/nextjs";
import {notFound, redirect} from "next/navigation";
import {db} from "@/lib/db";
import {BoardNavbar} from "@/app/(platform)/(dashboard)/board/[boardId]/_components/board-navbar";

interface BoardIdLayoutProps {
	children:React.ReactNode,
	params: {
		boardId:string
	}
}
export async function generateMetadata({params}:{params:{boardId: string}}){
	const {orgId} = auth();
	if(!orgId){
		return {
			title: "Board"
		}
	}
	const board = await db.board.findUnique({
		where: {id: params.boardId, orgId}
	});
	return {
		title: board?.title || "Board"
	}
}
const BoardIdLayout = async ({children, params}: BoardIdLayoutProps)=> {
	const {orgId} = auth();
	if(!orgId) redirect('/select-org');
	const board = await db.board.findUnique({
		where: {id: params.boardId, orgId}
	});
	if(!board) notFound();

	return (
		<div
			className="relative h-full bg-no-repeat bg-cover bg-center"
			style={{backgroundImage:`url(${board.imageFullUrl})`}}>
			<div className="absolute inset-0 bg-black/10"/>
			<BoardNavbar data={board}/>
			<main className="relative pt-28 h-full">
				{children}
			</main>
		</div>
	);
};

export default BoardIdLayout;
