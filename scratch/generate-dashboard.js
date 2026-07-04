const fs = require('fs');

const dashboard = {
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "title": "STT Mock Sessions Detected",
      "type": "stat",
      "gridPos": { "h": 4, "w": 24, "x": 0, "y": 0 },
      "targets": [
        {
          "expr": "sum(stt_mock_sessions_total{environment=~\"^$environment$\"})",
          "refId": "A"
        }
      ],
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "thresholds": {
            "mode": "absolute",
            "steps": [
              { "color": "green", "value": null },
              { "color": "red", "value": 1 }
            ]
          }
        }
      }
    },
    {
      "title": "STT Session Outcomes Over Time",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
      "targets": [
        { "expr": "sum by (outcome) (rate(stt_sessions_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{outcome}}" }
      ]
    },
    {
      "title": "Segment Drop Rate (by reason)",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 4 },
      "targets": [
        { "expr": "sum by (reason) (rate(stt_segments_dropped_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{reason}}" }
      ]
    },
    {
      "title": "Fact-check Success vs Error Rate",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 12 },
      "targets": [
        { "expr": "sum by (outcome) (rate(factcheck_requests_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{outcome}}" }
      ]
    },
    {
      "title": "Fact-check Latency (p50 / p95)",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 12 },
      "targets": [
        { "expr": "histogram_quantile(0.95, sum(rate(factcheck_request_duration_seconds_bucket{environment=~\"^$environment$\"}[5m])) by (le))", "refId": "p95", "legendFormat": "p95" },
        { "expr": "histogram_quantile(0.50, sum(rate(factcheck_request_duration_seconds_bucket{environment=~\"^$environment$\"}[5m])) by (le))", "refId": "p50", "legendFormat": "p50" }
      ]
    },
    {
      "title": "Verdict Distribution Over Time",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 20 },
      "targets": [
        { "expr": "sum by (status) (rate(factcheck_verdicts_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{status}}" }
      ]
    },
    {
      "title": "Sessions Persisted vs Failed",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 20 },
      "targets": [
        { "expr": "sum by (outcome) (rate(sessions_persisted_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{outcome}}" }
      ]
    },
    {
      "title": "Active WebSocket Connections",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 24, "x": 0, "y": 28 },
      "targets": [
        { "expr": "sum(active_websocket_connections{environment=~\"^$environment$\"})", "refId": "A", "legendFormat": "Connections" }
      ]
    },
    {
      "title": "HTTP Request Rate by Route",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 36 },
      "targets": [
        { "expr": "sum by (route, status_code) (rate(http_requests_total{environment=~\"^$environment$\"}[5m]))", "refId": "A", "legendFormat": "{{route}} - {{status_code}}" }
      ]
    },
    {
      "title": "Node Process CPU Usage",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 36 },
      "targets": [
        { "expr": "rate(process_cpu_user_seconds_total{environment=~\"^$environment$\"}[5m])", "refId": "A", "legendFormat": "User CPU" }
      ]
    }
  ],
  "refresh": "5s",
  "schemaVersion": 38,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": [
      {
        "current": {
          "selected": false,
          "text": "All",
          "value": "$__all"
        },
        "hide": 0,
        "includeAll": true,
        "multi": false,
        "name": "environment",
        "options": [
          { "selected": true, "text": "All", "value": "$__all" },
          { "selected": false, "text": "production", "value": "production" },
          { "selected": false, "text": "staging", "value": "staging" }
        ],
        "query": "production,staging",
        "queryValue": "",
        "skipUrlSync": false,
        "type": "custom"
      }
    ]
  },
  "time": {
    "from": "now-1h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Verificat API Monitoring",
  "uid": "verificat-api-monitor",
  "version": 1
};

fs.writeFileSync('e:/verificat.ai/infrastructure/monitoring/dashboard.json', JSON.stringify(dashboard, null, 2));
