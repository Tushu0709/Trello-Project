'use client'
import {useEffect} from 'react';
import {useParams} from "next/navigation";
import {useOrganizationList} from "@clerk/nextjs";
export const OrgControl = (): null => {
	const params = useParams();
	const {setActive} = useOrganizationList();
	useEffect(() => {
		if(!setActive) return;
		setActive({
			organization: params.organizationId as string,
		}).then()
	}, [setActive,params.organizationId]);
	return null;
};


