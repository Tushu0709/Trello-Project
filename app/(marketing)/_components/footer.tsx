import React from 'react';
import { Logo } from "@/components/logo";
import {Button} from "@/components/ui/button";

const Footer = () => {
	return (
		<footer className="fixed bottom-0 w-full p-4 border-t bg-slate-100">
			<div className="md:max-w-screen-2xl mx-auto flex items-center w-full justify-between">
				<Logo/>
				<div className="space-x-4 md:block md:w-auto items-center flex justify-between w-full">
					<Button size={"sm"} variant="ghost">
						Privacy Policy
					</Button>
					<Button size="sm" variant="ghost">
						Terms of Service
					</Button>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
