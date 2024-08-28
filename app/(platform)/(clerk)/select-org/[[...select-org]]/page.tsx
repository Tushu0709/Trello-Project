import React from 'react';
import { OrganizationList } from '@clerk/nextjs'
const SelectOrganizationPage = () => {
	return (
		<OrganizationList
			afterSelectOrganizationUrl={'/organization/:id'}
			afterCreateOrganizationUrl={'/organization/:id'}
			hidePersonal={true} />
	);
};

export default SelectOrganizationPage;
