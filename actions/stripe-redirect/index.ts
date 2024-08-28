"use server"

import {auth, currentUser} from "@clerk/nextjs";
import {db} from "@/lib/db";
import {revalidatePath} from "next/cache";
import {createSafeAction} from "@/lib/create-safe-action";
import { StripeRedirect } from "./schema";
import {InputType, ReturnType} from "./types";
import {absoluteUrl} from "@/lib/utils";
import {stripe} from "@/lib/stripe";

const handler = async (data: InputType): Promise<ReturnType> => {
	const {orgId, userId} = auth();
	const user = await currentUser();

	if(!orgId || !userId || !user) {
		return {
			error: "Unauthorized",
		}
	}
	const settingsUrl = absoluteUrl(`/organization/${orgId}`);
	let url: string = "";
	try {
		const orgSubscription = await db.orgSubscription.findUnique({
			where: {
				orgId
			}
		})
		/// if already have subscription
		if(orgSubscription && orgSubscription.stripeCustomerId) {
			const stripeSession = await stripe.billingPortal.sessions.create({
				customer: orgSubscription.stripeCustomerId,
				return_url: settingsUrl
			})
			url = stripeSession.url;
		} else {
			/// if no subscription
			const stripeSession = await stripe.checkout.sessions.create({
				success_url: settingsUrl,
				cancel_url: settingsUrl,
				payment_method_types: ["card","paypal"],
				mode: "subscription",
				billing_address_collection: "auto",
				customer_email: user.emailAddresses[0].emailAddress,
				line_items: [
					{
						price_data: {
							currency:"USD",
							product_data: {
								name: "Taskify Pro",
								description: "Unlimited boards for you organization"
							},
							unit_amount: 2000,
							recurring: {
								interval:"month"
							}
						},
						quantity: 1
					}
				],
				metadata: {
					orgId
				}
			});

			url = stripeSession.url || "";
		}
	} catch (e) {
		if(e instanceof Error) {
			console.error(e.message)
		}
		return {
			error: "[STRIPE] - Something went wrong"
		}
	}
	revalidatePath(`/organization/${orgId}`);

	return {data: url};
}
export const stripeRedirect = createSafeAction(StripeRedirect, handler);
