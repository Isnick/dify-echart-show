package com.example.difyechart.dto;

public class ChartResponse {
    private Object echartConfig;

    public ChartResponse(Object echartConfig) {
        this.echartConfig = echartConfig;
    }

    public Object getEchartConfig() { return echartConfig; }
    public void setEchartConfig(Object echartConfig) { this.echartConfig = echartConfig; }
}
