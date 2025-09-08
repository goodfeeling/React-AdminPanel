import apiClient from "../apiClient";

export enum EmailClient {
	Email = "/email",
}

const sendForgetPassword = (email: string) =>
	apiClient.post<boolean>({
		url: `${EmailClient.Email}/forget-password`,
		data: { email },
	});

export default {
	sendForgetPassword,
};
