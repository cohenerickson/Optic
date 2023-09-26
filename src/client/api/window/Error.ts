const { dir, ...files } = __optic$config.files;

const fileMatcher = Object.values(files).join("|").replace(/\./g, "\\.");

const replaceRegex = new RegExp(`^.*(${fileMatcher}):\\d+:\\d+\\)?$\\n?`, "gm");
const metaRegex = new RegExp(
  `/(at |@)\\(?(?<FileName>[^:]+):(?<Line>\\d+):(?<Column>\\d+)\\)?(?<!(${fileMatcher}):\\d+:\\d+\\)?)$/m`,
  "m"
);

const errorTypes = [
  "Error",
  "DOMError",
  "URIError",
  "EvalError",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "AggregateError",
  "ReferenceError",
  "GPUInternalError",
  "GPUValidationError",
  "GPUOutOfMemoryError",
  "OverconstrainedError"
];

for (let type of errorTypes) {
  if (self[type as keyof Window]) {
    // @ts-ignore
    self[type] = new Proxy(self[type], {
      construct(target: ErrorConstructor, args: any[]) {
        const error = new target(...args);
        const metaMatch = error.stack?.match(metaRegex);

        if (metaMatch && metaMatch.groups) {
          // @ts-ignore - Non standard
          if (error.fileName) error.fileName = metaMatch.groups.FileName;
          // @ts-ignore - Non standard
          if (error.lineNumber) error.lineNumber = metaMatch.groups.Line;
          // @ts-ignore - Non standard
          if (error.columnNumber) error.columnNumber = metaMatch.groups.Column;
        }

        error.stack = error.stack?.replace(replaceRegex, "");

        return error;
      }
    });
  }
}
