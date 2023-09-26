import Config from "./Config";
import scope from "~/client/scope";
import Optic from "~/shared";

declare global {
  var __optic$config: Config;
  var __$optic: Optic;

  interface Window {
    __optic$config: Config;
    __$optic: Optic;
    __$scope: typeof scope;
  }

  interface ServiceWorkerGlobalScope {
    __$optic: Optic;
    __optic$config: Config;
  }
}
