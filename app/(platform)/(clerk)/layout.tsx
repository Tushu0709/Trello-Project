import React from 'react';

const ClerkLayout = ({children}: Readonly<{ children: React.ReactNode }>) => {
	return (
		<div className="h-full flex items-center justify-center">
			{children}
		</div>
	);
};

export default ClerkLayout;
