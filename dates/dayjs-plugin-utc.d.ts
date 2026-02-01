/// <reference path="../node_modules/dayjs/plugin/utc.d.ts" />
declare module "dayjs/plugin/utc" {
  import type { PluginFunc } from "dayjs";
  const plugin: PluginFunc;
  export = plugin;
}
