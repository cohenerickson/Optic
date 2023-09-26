import { url } from "./url";
import { parse } from "acorn";
import { Node, makeTraveler } from "astravel";
import { generate } from "astring";

const scopedValues = [
  "__$optic",
  "__$scope",
  "__optic$config",
  "location",
  "window",
  "top",
  "parent",
  "opener",
  "eval",
  "self",
  "this",
  "globalThis",
  "localStorage",
  "sessionStorage"
];

export function js(js: string, meta: URL | Location, inject?: boolean): string {
  const ast = parse(js, {
    sourceType: "module",
    allowImportExportEverywhere: true,
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    ecmaVersion: "latest",
    preserveParens: false,
    allowReserved: true
  }) as Node;

  const traveler = makeTraveler({
    go(node, state) {
      if (node && this[node.type]) {
        // @ts-ignore
        this[node.type](node, state);
      }
    },
    MemberExpression(expression) {
      if (expression.object.type !== "Identifier") {
        this.go(expression.object);
      }
    },
    Property(node, state) {
      if (node.shorthand) {
        node.key = Object.assign({}, node.key);
        node.shorthand = false;
      }
      if (node.value) {
        this.go(node.value, state);
      }
    },
    VariableDeclarator(node, state) {
      if (node.init) {
        this.go(node.init, state);
      }
    },
    AssignmentExpression(node, state) {
      this.go(node.right, state);
    },
    AssignmentPattern(node, state) {
      this.go(node.right, state);
    },
    UpdateExpression() {},
    ExportSpecifier() {},
    ClassDeclaration(node, state) {
      if (node.superClass) {
        this.go(node.superClass, state);
      }
      this.go(node.body, state);
    },
    Identifier(identifier) {
      if (scopedValues.includes(identifier.name)) {
        identifier.name = `__$scope(${identifier.name})`;
      }
    },
    CallExpression(node, state) {
      this.go(node.callee, state);
      const args = node["arguments"],
        { length } = args;
      for (let i = 0; i < length; i++) {
        this.go(args[i], state);
      }
    },
    FunctionDeclaration(node, state) {
      const { params } = node;
      if (params !== null) {
        for (let i = 0, { length } = params; i < length; i++) {
          if (params[i].type !== "Identifier") this.go(params[i], state);
        }
      }
      this.go(node.body, state);
    },
    FunctionExpression(node, state) {
      const { params } = node;
      if (params !== null) {
        for (let i = 0, { length } = params; i < length; i++) {
          if (params[i].type !== "Identifier") this.go(params[i], state);
        }
      }
      this.go(node.body, state);
    },
    ArrowFunctionExpression(node, state) {
      const { params } = node;
      if (params !== null) {
        for (let i = 0, { length } = params; i < length; i++) {
          if (params[i].type !== "Identifier") this.go(params[i], state);
        }
      }
      this.go(node.body, state);
    },
    ImportDeclaration(expression) {
      if (expression.source.value) {
        expression.source.value = url(
          expression.source.value?.toString(),
          meta
        );
      }
    },
    ImportExpression(node: any) {
      node.source.value = url(node.source.value, meta);
    },
    CatchClause(node, state) {
      this.go(node.body, state);
    },
    ForInStatement(node, state) {
      this.go(node.right);
      this.go(node.body);
    },
    ForOfStatement(node, state) {
      this.go(node.right);
      this.go(node.body);
    },
    UnaryExpression(node, state) {
      this.go(node.argument);

      if (node.operator === "typeof") {
        if (node.argument.type === "Identifier") {
          if (scopedValues.includes(node.argument.name)) {
            const name = node.argument.name;

            Object.assign(node, {
              type: "Identifier",
              name: `(typeof ${name} !== "undefined" ? typeof __$scope(${name}) : typeof ${name})`
            });
          }
        }
      }
    }
  });

  traveler.go(ast);

  return generate(ast);
}
