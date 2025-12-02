export type CheckLogSourceConnectionDTO = {
  type: "zabbix";
  config: {
    host: string;
    username: string;
    password: string;
  };
};

export type CheckLogSourceConnectionResultDTO = {
  success: boolean;
  message?: string;
};
