/// <reference path="../node_modules/dayjs/plugin/isBetween.d.ts" />
/// <reference path="../node_modules/dayjs/plugin/minMax.d.ts" />
/// <reference path="../node_modules/dayjs/plugin/isSameOrBefore.d.ts" />
/// <reference path="../node_modules/dayjs/plugin/isSameOrAfter.d.ts" />

declare module "dayjs/plugin/isBetween" {
  import type { PluginFunc } from "dayjs";
  const plugin: PluginFunc;
  export default plugin;
}

declare module "dayjs/plugin/minMax" {
  import type { PluginFunc } from "dayjs";
  const plugin: PluginFunc;
  export default plugin;
}

declare module "dayjs/plugin/isSameOrBefore" {
  import type { PluginFunc } from "dayjs";
  const plugin: PluginFunc;
  export default plugin;
}

declare module "dayjs/plugin/isSameOrAfter" {
  import type { PluginFunc } from "dayjs";
  const plugin: PluginFunc;
  export default plugin;
}
