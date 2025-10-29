package com.greentechinnovators.service;

import okhttp3.*;
import org.springframework.stereotype.Service;

import javax.net.ssl.*;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;

@Service
public class VertexAiService {

    private final String apiKey = "sk-971bc6d345a64397b2661db962c2889d";
    private final String apiUrl = "https://api.depsek.com/v1/predict";
    private final OkHttpClient client;

    public VertexAiService() throws NoSuchAlgorithmException, KeyManagementException {
        // 1️⃣ Trust manager that trusts everything
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[]{}; }
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                }
        };

        // 2️⃣ Initialize SSL context
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, trustAllCerts, new java.security.SecureRandom());

        // 3️⃣ Get the socket factory from the SSL context
        SSLSocketFactory sslSocketFactory = sslContext.getSocketFactory();

        // 4️⃣ Build OkHttpClient with SSL bypass
        this.client = new OkHttpClient.Builder()
                .sslSocketFactory(sslSocketFactory, (X509TrustManager) trustAllCerts[0])
                .hostnameVerifier((hostname, session) -> true)
                .build();
    }

    public String ask(String promptText) {
        String jsonPayload = "{\"input\":\"" + escapeJson(promptText) + "\"}";

        RequestBody body = RequestBody.create(
                jsonPayload,
                MediaType.get("application/json")
        );

        Request request = new Request.Builder()
                .url(apiUrl + "?api_key=" + apiKey)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                return "{\"error\": \"HTTP " + response.code() + " - " + response.message() + "\"}";
            }

            if (response.body() != null) {
                return response.body().string();
            } else {
                return "{\"error\": \"Empty response\"}";
            }
        } catch (Exception e) {
            return "{\"error\": \"Exception: " + e.getMessage() + "\"}";
        }
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
