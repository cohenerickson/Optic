import { parse } from "meriyah";
import { generate } from "astring";
import { makeTraveler } from "astravel";

const scopedValues = [
  "$optic",
  "location",
  "window",
  "top",
  "parent",
  "opener",
  "eval",
  "self",
  "this",
  "localStorage",
  "sessionStorage"
];

export default function js(content: string, meta: URL | Location): string {
  try {
    const AST = parse(content, {
      module: true,
      next: true,
      webcompat: true,
      specDeviation: true,
      raw: true
    });

    const traveler = makeTraveler({
      go(node: any, state: any) {
        if (node && this[node.type]) {
          this[node.type](node, state);
        }
      },
      MemberExpression(expression: any) {
        if (expression.object.type !== "Identifier") {
          this.go(expression.object);
        }
        if (scopedValues.includes(expression.object.name)) {
          expression.object.name = `$optic.scope(${expression.object.name})`;
        }
      },
      Property(node: any, state: any) {
        if (node.shorthand) {
          node.key = Object.assign({}, node.key);
          node.shorthand = false;
        }
        if (node.value != null) {
          this.go(node.value, state);
        }
      },
      VariableDeclarator(node: any, state: any) {
        if (node.init != null) {
          this.go(node.init, state);
        }
      },
      AssignmentExpression(node: any, state: any) {
        this.go(node.right, state);
      },
      AssignmentPattern(node: any, state: any) {
        this.go(node.right, state);
      },
      UpdateExpression() {},
      ExportSpecifier() {},
      ClassDeclaration(node: any, state: any) {
        if (node.superClass) {
          this.go(node.superClass, state);
        }
        this.go(node.body, state);
      },
      Identifier(identifier: any) {
        if (scopedValues.includes(identifier.name)) {
          identifier.name = `$optic.scope(${identifier.name})`;
        }
      },
      CallExpression(node: any, state: any) {
        this.go(node.callee, state);
        const args = node["arguments"],
          { length } = args;
        for (let i = 0; i < length; i++) {
          this.go(args[i], state);
        }
        node = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: "$optic"
          },
          arguments: [node]
        };
      },
      FunctionDeclaration(node: any, state: any) {
        const { params } = node;
        if (params != null) {
          for (let i = 0, { length } = params; i < length; i++) {
            if (params[i].type !== "Identifier") this.go(params[i], state);
          }
        }
        this.go(node.body, state);
      },
      ArrowFunctionExpression(node: any, state: any) {
        const { params } = node;
        if (params != null) {
          for (let i = 0, { length } = params; i < length; i++) {
            if (params[i].type !== "Identifier") this.go(params[i], state);
          }
        }
        this.go(node.body, state);
      },
      ImportDeclaration(expression: any) {
        expression.source.value = $optic.scopeURL(
          expression.source.value,
          meta
        );
      },
      ImportExpression(expression: any) {
        expression.source.value = $optic.scopeURL(
          expression.source.value,
          meta
        );
      }
    });

    traveler.go(AST);

    return generate(AST);
  } catch {
    // If there was an error in the rewriting, we return the original JS
    // We are assuming the browser will throw an error at this point
    return content;
  }
}
