import { randomUUID } from "node:crypto";
import ky from "ky";
import type { Contabo } from "../types/contabo";

let apiPromise: Promise<typeof ky> | null = null;

const generateContaboApi = async () => {
	const { access_token, token_type } = await ky
		.post("https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token", {
			body: new URLSearchParams({
				client_id: process.env.CONTABO_CLIENT_ID!,
				client_secret: process.env.CONTABO_CLIENT_SECRET!,
				grant_type: "password",
				password: process.env.CONTABO_PASSWORD!,
				username: process.env.CONTABO_USERNAME!,
			}),
		})
		.json<Contabo.Response.AuthToken>();

	return ky.extend({
		headers: {
			Authorization: `${token_type} ${access_token}`,
			"x-request-id": randomUUID(),
		},
		prefix: "https://api.contabo.com/v1",
	});
};

export const getContaboApi = async () => {
	if (!apiPromise) {
		try {
			apiPromise = generateContaboApi();
		} catch (e) {
			apiPromise = null;
			throw e;
		}
	}

	return apiPromise;
};
