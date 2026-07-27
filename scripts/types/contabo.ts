export namespace Contabo {
	export namespace Body {
		export interface CreateSecret {
			name: string;
			type: "password" | "ssh";
			value: string;
		}
	}

	export interface SecretResponse {
		createdAt: string;
		customerId: string;
		name: string;
		secretId: number;
		tenantId: string;
		type: "password" | "ssh";
		updatedAt: string | null;
		value: string;
	}
	type SecretResponseWithoutValue = Omit<SecretResponse, "value">;

	export namespace Response {
		interface LinkSelf {
			self: string;
		}
		interface Links extends LinkSelf {
			first?: string;
			last?: string;
			next?: string;
			previous?: string;
		}

		interface Pagination {
			_pagination: {
				page: number;
				size: number;
				totalElements: number;
				totalPages: number;
			};
		}

		export interface AuthToken {
			"not-before-policy": number;
			access_token: string;
			expires_in: number;
			refresh_expires_in: number;
			refresh_token: string;
			scope: string;
			session_state: string;
			token_type: string;
		}

		export interface CreateSecret extends LinkSelf, Pagination {
			data: SecretResponseWithoutValue[];
		}

		export interface GetSecret extends LinkSelf {
			data: SecretResponseWithoutValue[];
		}

		export interface ListSecrets extends Links {
			data: SecretResponseWithoutValue[];
		}
	}
}
