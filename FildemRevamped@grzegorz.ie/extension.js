var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@girs/gnome-shell/src/index.js
var require_src = __commonJS({
  "node_modules/@girs/gnome-shell/src/index.js"(exports, module2) {
    module2.exports = {
      misc: imports.misc,
      ui: imports.ui
    };
  }
});

// gnome-src/log.ts
var log_types = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  LOG: "LOG"
};
var log_header = (type) => {
  const date = /* @__PURE__ */ new Date();
  return `[${type}: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}]`;
};
var flog = (type, ...args) => {
  const header = log_header(type), bold_style = "font-weight: bold;";
  print(`%c${header} ${bold_style}`, ...args);
};

// gnome-src/index.ts
var import_gnome_shell = __toESM(require_src());
var ExtensionUtils = import_gnome_shell.misc.extensionUtils;
var Me = ExtensionUtils.getCurrentExtension();
var _ = ExtensionUtils.gettext;
var GETTEXT_DOMAIN = "fildem-revamped";
var GlobalExtension = class _GlobalExtension {
  static _instance;
  _uuid;
  _gettext_domain = GETTEXT_DOMAIN;
  /**
   * @name constructor
   * The constructor for the extension
   * 
   * @param {string} uuid - The uuid of the extension
   */
  constructor(uuid) {
    this._uuid = uuid;
    ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    this._check_me();
  }
  /**
   * @name get_instance
   * Gets the instance of the extension
   * 
   * @returns {GlobalExtension} The instance of the extension
   */
  static get_instance() {
    if (!_GlobalExtension._instance)
      _GlobalExtension._instance = new _GlobalExtension(Me.metadata.uuid);
    return _GlobalExtension._instance;
  }
  /**
   * @name check_me
   * Checks if the extension is Me or not
   * 
   * @returns {void} Nothing
   */
  _check_me() {
    if (!Me) {
      flog("ERROR", _("Me is not defined!"));
      throw new Error(_("Me is not defined!"));
    }
  }
  /**
   * @name enable
   * This function is called when the extension is enabled
   * by gnome-shell.
   * 
   * @returns {void} Nothing
   */
  enable() {
    flog("INFO", "Enabling extension: ", Me.metadata.uuid);
  }
  /**
   * @name disable
   * This function is called when the extension is disabled
   * by gnome-shell.
   * 
   * @returns {void} Nothing
   */
  disable() {
    flog("WARN", "Disabling extension: ", Me.metadata.uuid);
  }
};
function init(meta) {
  flog("INFO", "Initializing extension: ", meta);
  return GlobalExtension.get_instance();
}
//# sourceMappingURL=extension.js.map
