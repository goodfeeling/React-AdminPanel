import { webSocketManager } from "@/utils/webSocketManager";
// src/hooks/useSharedWebSocket.ts
import { useCallback, useEffect, useState } from "react";

export const useSharedWebSocket = (uri: string) => {
	const url = `${import.meta.env.VITE_APP_WS_BASE_URL || "ws://127.0.0.1:8080"}${uri}`;
	const [_, setConnected] = useState(false);
	const [message, setMessage] = useState<any>(null);

	useEffect(() => {
		const unsubscribe = webSocketManager.connect(url, (data) => {
			setMessage(data);
			setConnected(true);
		});

		return () => {
			unsubscribe();
			setConnected(false);
			setMessage(null);
		};
	}, [url]);

	const sendMessage = useCallback(
		(data: string | ArrayBuffer | Blob | ArrayBufferView) => {
			webSocketManager.sendMessage(url, data);
		},
		[url],
	);

	return {
		connected: webSocketManager.isConnected(url),

		message,
		sendMessage,
	};
};
