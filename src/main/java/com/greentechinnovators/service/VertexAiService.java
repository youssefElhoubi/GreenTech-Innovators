package com.greentechinnovators.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.Socket;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.Collections;

@Service
public class VertexAiService {

    private final String apiKey = System.getenv().getOrDefault("VERTEX_API_KEY", "");
    private final String apiUrl = "https://api.deepseek.com/chat/completions";
    private final OkHttpClient client;

    // Control flag (set INSECURE_TLS=true in env for dev only)
    private final boolean insecureTls = Boolean.parseBoolean(System.getenv().getOrDefault("INSECURE_TLS", "false"));

    public VertexAiService() {
        this.client = insecureTls ? createInsecureClientWithSni() : createSecureClient();
    }

    // Public method: returns assistant content or JSON error string
    public String ask(String userMessage) {
        String jsonPayload = "{"
                + "\"model\": \"deepseek-chat\","
                + "\"messages\": ["
                + "{\"role\": \"system\", \"content\": \"You are a helpful assistant.\"},"
                + "{\"role\": \"user\", \"content\": \"" + escapeJson(userMessage) + "\"}"
                + "],"
                + "\"stream\": false"
                + "}";

        RequestBody body = RequestBody.create(jsonPayload, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                // return structured JSON error string so Postman can parse it
                return "{\"error\": \"HTTP " + response.code() + " - " + response.message() + "\"}";
            }

            String responseBody = response.body() != null ? response.body().string() : "";
            if (responseBody.isEmpty()) return "{\"error\": \"Empty response\"}";

            // Parse with Gson: extract choices[0].message.content safely
            JsonObject root = JsonParser.parseString(responseBody).getAsJsonObject();
            if (!root.has("choices")) return "{\"error\": \"No choices in response\"}";

            JsonArray choices = root.getAsJsonArray("choices");
            if (choices.size() == 0) return "{\"error\": \"Empty choices array\"}";

            JsonObject firstChoice = choices.get(0).getAsJsonObject();
            // support both message.content or message->content keys
            if (!firstChoice.has("message")) return "{\"error\": \"No message object in first choice\"}";

            JsonObject messageObj = firstChoice.getAsJsonObject("message");
            if (!messageObj.has("content")) return "{\"error\": \"No content in message\"}";

            String assistantText = messageObj.get("content").getAsString();
            return assistantText;

        } catch (Exception e) {
            // Return JSON-like error for Postman readability
            return "{\"error\": \"Exception: " + escapeJson(e.getMessage() == null ? e.toString() : e.getMessage()) + "\"}";
        }
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
