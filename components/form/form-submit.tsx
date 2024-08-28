"use client"
import React from 'react';
import {useFormStatus} from "react-dom";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface FormSubmitProps {
	children: React.ReactNode;
	disabled?: boolean;
	className?: string;
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary"
}
export const FormSubmit = ({children, variant = "primary", className, disabled}:FormSubmitProps) => {
	const {pending}= useFormStatus();
	return (
		<Button className={cn(className)} disabled={pending || disabled} type="submit" variant={variant} size="sm">
			{children}
		</Button>
	);
};
