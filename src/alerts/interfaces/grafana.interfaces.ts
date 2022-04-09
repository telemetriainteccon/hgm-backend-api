export interface Labels {
  Grupo: string;
  RepeticionHoras: string;
  Ubicacion: string;
  Variable: string;
  alertname: string;
}

export interface Alert {
  status: string;
  labels: Labels;
  annotations: unknown;
  startsAt: string;
  endsAt: Date;
  generatorURL: string;
  fingerprint: string;
  silenceURL: string;
  dashboardURL: string;
  panelURL: string;
  valueString: string;
}

export interface CommonLabels {
  Grupo: string;
  RepeticionHoras: string;
  Ubicacion: string;
  Variable: string;
  alertname: string;
}

export interface GrafanaRequest {
  receiver: string;
  status: string;
  alerts: Alert[];
  groupLabels: unknown;
  commonLabels: CommonLabels;
  commonAnnotations: unknown;
  externalURL: string;
  version: string;
  groupKey: string;
  truncatedAlerts: number;
  orgId: number;
  title: string;
  state: string;
  message: string;
}

export interface MessageResult {
  sms_message: string;
  mail_message: string;
  call_message: string;
  location: string;
  isNoData: boolean;
}

export interface LoggerResult {
  location: string;
  type: string;
  target: string;
  logId: string;
  date: string;
}
