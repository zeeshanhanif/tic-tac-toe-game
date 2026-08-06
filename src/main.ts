// Bootstrap (architecture §5 — UI Shell entry). Wires the shell into #app.
import "./style.css";
import { mountShell } from "./ui/shell.ts";
import { log } from "./infra/logger.ts";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("Root element #app not found");

mountShell(root);
log("app.boot", { skeleton: true });
