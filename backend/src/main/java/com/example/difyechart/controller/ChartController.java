package com.example.difyechart.controller;

import com.example.difyechart.dto.ChartRequest;
import com.example.difyechart.service.DifyService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/chart")
public class ChartController {
    private final DifyService difyService;

    public ChartController(DifyService difyService) {
        this.difyService = difyService;
    }

    @PostMapping(value = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generate(@RequestBody ChartRequest request) throws Exception {
        return difyService.generateChartStream(request.getPrompt());
    }
}
