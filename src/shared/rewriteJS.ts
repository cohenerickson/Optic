import { parseScript } from "meriyah";
import { generate } from "esotope-hammerhead";

export default function js(content: string, url: URL): string {
  let AST: any = getAST(content);
  AST = walkAST(AST, null, (node: any, parent: any) => {
    if (node.type === "MemberExpression") {
      node.object = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "_$o"
        },
        arguments: [node.object]
      };
    } else if (
      parent &&
      ["BinaryExpression", "IfStatement", "ConditionalExpression"].includes(
        parent.type
      ) &&
      node.type === "Identifier"
    ) {
      node = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "_$o"
        },
        arguments: [node]
      };
    } else if (
      node.type === "Literal" &&
      (parent.type === "ImportDeclaration" ||
        parent.type === "ImportExpression" ||
        parent.type === "ExportNamedDeclaration" ||
        parent.type === "ExportAllDeclaration")
    ) {
      node.value = $optic.scopeURL(node.value, url);
    }

    return node;
  });
  return generate(AST);
}

function walkAST(
  AST: any,
  parent: any,
  handler: (node: any, parent: any) => any
): any {
  if (!AST || typeof AST !== "object") return AST;
  AST = handler(AST, parent);
  for (let node in AST) {
    if (Array.isArray(AST[node])) {
      for (let n in AST[node]) {
        AST[node][n] = walkAST(AST[node][n], AST[node], handler);
      }
    } else {
      AST[node] = walkAST(AST[node], AST, handler);
    }
  }
  return AST;
}

function getAST(js: string): any {
  try {
    return parseScript(js, {
      module: true
    });
  } catch (err) {
    console.error(err);
    return parseScript("");
  }
}
