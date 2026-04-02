package com.example.difyechart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class DifyService {
    private static final long SSE_TIMEOUT_MILLIS = 300000L;

    @Value("${dify.api.url}")
    private String difyUrl;

    @Value("${dify.api.key}")
    private String difyApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private void emitEvent(SseEmitter emitter, String eventName, String data) throws Exception {
        if (data == null || data.isBlank()) {
            return;
        }

        String normalizedEvent = eventName == null || eventName.isBlank() ? "message" : eventName;

        try {
            JsonNode jsonNode = objectMapper.readTree(data);

            if (jsonNode.isObject() && !jsonNode.has("event")) {
                ((ObjectNode) jsonNode).put("event", normalizedEvent);
            }

            emitter.send(SseEmitter.event()
                .name(normalizedEvent)
                .data(objectMapper.writeValueAsString(jsonNode)));
        } catch (Exception parseError) {
            Map<String, String> fallbackPayload = new HashMap<>();
            fallbackPayload.put("event", normalizedEvent);
            fallbackPayload.put("data", data);

            emitter.send(SseEmitter.event()
                .name(normalizedEvent)
                .data(objectMapper.writeValueAsString(fallbackPayload)));
        }
    }

    public SseEmitter generateChartStream(String prompt) throws Exception {
        if (difyApiKey == null || difyApiKey.isBlank()) {
            throw new IllegalStateException("DIFY_API_KEY is not configured");
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MILLIS);

        emitter.onTimeout(emitter::complete);

        new Thread(() -> {
            try {
                URL url = new URL(difyUrl + "/chat-messages");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + difyApiKey);
                conn.setDoOutput(true);

                Map<String, Object> body = new HashMap<>();
                body.put("inputs", new HashMap<>());
                body.put("query", prompt);
                body.put("response_mode", "streaming");
                body.put("user", "user-" + System.currentTimeMillis());

                conn.getOutputStream().write(objectMapper.writeValueAsBytes(body));

                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));

                String line;
                String currentEvent = null;
                StringBuilder currentData = new StringBuilder();

                while ((line = reader.readLine()) != null) {
                    if (line.isEmpty()) {
                        emitEvent(emitter, currentEvent, currentData.toString());
                        currentEvent = null;
                        currentData.setLength(0);
                        continue;
                    }

                    if (line.startsWith("event:")) {
                        currentEvent = line.substring(6).trim();
                        continue;
                    }

                    if (line.startsWith("data:")) {
                        if (!currentData.isEmpty()) {
                            currentData.append('\n');
                        }

                        currentData.append(line.substring(5).trim());
                    }
                }

                emitEvent(emitter, currentEvent, currentData.toString());

                reader.close();
                conn.disconnect();
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }
}
