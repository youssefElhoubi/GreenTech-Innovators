package com.greentechinnovators.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.Socket;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.*;

@Service
public class VertexAiService {

    private final String apiKey  ;
    private final String apiUrl;
    private final OkHttpClient client;
    private final ObjectMapper objectMapper;

    public VertexAiService(
            @Value("sk-971bc6d345a64397b2661db962c2889d") String apiKey,
            @Value("https://api.deepseek.com/chat/completions") String apiUrl,
            ObjectMapper objectMapper
    ) {
        this.objectMapper =objectMapper;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        // Control flag (set INSECURE_TLS=true in env for dev only)
        boolean insecureTls = Boolean.parseBoolean(System.getenv().getOrDefault("INSECURE_TLS", "false"));
        this.client = insecureTls ? createInsecureClientWithSni() : createSecureClient();
    }

    // Public method: returns assistant content or JSON error string
    public String ask(String systemMessageContent, String userMessageContent) throws JsonProcessingException {
        Map<String, Object> jsonPayload = new HashMap<>();

        jsonPayload.put("model", "deepseek-chat");
        jsonPayload.put("stream", false);

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", escapeJson(systemMessageContent));

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", escapeJson(userMessageContent));

        messages.add(systemMessage);
        messages.add(userMsg);

        jsonPayload.put("messages", messages);

        String payload = objectMapper.writeValueAsString(jsonPayload);

        RequestBody body = RequestBody.create(payload, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                Map<String,Object> error = new HashMap<>();
                error.put("error","HTTP " + response.code() + " - "  + response.message() );
                return objectMapper.writeValueAsString(error);
            }

            String responseBody = response.body() != null ? response.body().string() : "";
            if (responseBody.isEmpty()) return "{\"error\": \"Empty response\"}";

            JsonObject root = JsonParser.parseString(responseBody).getAsJsonObject();
            if (!root.has("choices")) return "{\"error\": \"No choices in response\"}";

            JsonArray choices = root.getAsJsonArray("choices");
            if (choices.size() == 0) return "{\"error\": \"Empty choices array\"}";

            JsonObject firstChoice = choices.get(0).getAsJsonObject();
            if (!firstChoice.has("message")) return "{\"error\": \"No message object in first choice\"}";

            JsonObject messageObj = firstChoice.getAsJsonObject("message");
            if (!messageObj.has("content")) return "{\"error\": \"No content in message\"}";

            return messageObj.get("content").getAsString();

        } catch (Exception e) {
            return "{\"error\": \"Exception: " + escapeJson(e.getMessage() == null ? e.toString() : e.getMessage()) + "\"}";
        }
    }

    public String ask(String userMessage) throws JsonProcessingException {
        return ask("You are a helpful assistant.", userMessage);
    }
    // ---------------- Secure OkHttpClient (recommended) ----------------
    private OkHttpClient createSecureClient() {
        return new OkHttpClient.Builder()
                .callTimeout(Duration.ofSeconds(60))
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(120))
                .build();
    }

    // ---------------- Insecure client with SNI wrapper (dev only) ----------------
    private OkHttpClient createInsecureClientWithSni() {
        try {
            final TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                        public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                        public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                    }
            };

            final SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAllCerts, new java.security.SecureRandom());
            final SSLSocketFactory defaultFactory = sslContext.getSocketFactory();

            // wrap factory to set SNI on sockets when hostname is provided
            SSLSocketFactory sniFactory = new SSLSocketFactory() {
                private final SSLSocketFactory delegate = defaultFactory;

                private Socket enableSni(Socket sock, String host) {
                    if (sock instanceof SSLSocket && host != null && !host.isEmpty()) {
                        SSLSocket sslSock = (SSLSocket) sock;
                        try {
                            SSLParameters params = sslSock.getSSLParameters();
                            params.setServerNames(Collections.singletonList(new SNIHostName(host)));
                            sslSock.setSSLParameters(params);
                        } catch (Exception ignored) {}
                    }
                    return sock;
                }

                @Override public String[] getDefaultCipherSuites() { return delegate.getDefaultCipherSuites(); }
                @Override public String[] getSupportedCipherSuites() { return delegate.getSupportedCipherSuites(); }
                @Override public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException { return enableSni(delegate.createSocket(s, host, port, autoClose), host); }
                @Override public Socket createSocket(String host, int port) throws IOException { return enableSni(delegate.createSocket(host, port), host); }
                @Override public Socket createSocket(String host, int port, java.net.InetAddress localHost, int localPort) throws IOException { return enableSni(delegate.createSocket(host, port, localHost, localPort), host); }
                @Override public Socket createSocket(java.net.InetAddress host, int port) throws IOException { return delegate.createSocket(host, port); }
                @Override public Socket createSocket(java.net.InetAddress address, int port, java.net.InetAddress localAddress, int localPort) throws IOException { return delegate.createSocket(address, port, localAddress, localPort); }
            };

            return new OkHttpClient.Builder()
                    .sslSocketFactory(sniFactory, (X509TrustManager) trustAllCerts[0])
                    .hostnameVerifier((hostname, session) -> true) // DEV ONLY
                    .callTimeout(Duration.ofSeconds(60))
                    .connectTimeout(Duration.ofSeconds(15))
                    .readTimeout(Duration.ofSeconds(120))
                    .build();

        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            return new OkHttpClient();
        }
    }

    // ---------------- Utilities ----------------
    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
