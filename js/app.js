// js/app.js
import { spinner } from "./ui.js";
import { auth } from "./firebase.js";

import { LoginView, bindLogin } from "./views/login.js";
import { DashboardView, bindDashboard } from "./views/dashboard.js";
import { GrantsListView, bindGrantsList } from "./views/grants_list.js";
import { GrantDetailView, bindGrantDetail } from "./views/grant_detail.js";
import { GrantFormView, bindGrantForm } from "./views/admin_grant_form.js";
import { CsvView, bindCsv } from "./views/admin_csv.js";
import { EmployeesListView, bindEmployeesList } from "./views/employees_list.js";
import { EmployeeFormView, bindEmployeeForm } from "./views/admin_employee_form.js";

const app = document.getElementById("app");
let AUTH_READY = false;
export function setAuthReady(v){ AUTH_READY = v; }

// 해시 → { pathSegments[], query:URLSearchParams }
function parseHash(h){
  const raw = (h || "#/").slice(1);        // "/grants/123?id=xx"
  const [pathPart, queryPart] = raw.split("?");
  const pathSegments = pathPart.split("/").filter(Boolean); // ["grants","123"]
  const query = new URLSearchParams(queryPart || "");
  return { pathSegments, query };
}

export async function navigate(hash, user = auth.currentUser){
  if(!AUTH_READY) return;
  const { pathSegments, query } = parseHash(hash);
  spinner(true);

  const route = pathSegments[0] || "dashboard";
  const id = pathSegments[1] || query.get("id") || "";

  if(!user && route !== "login"){
    app.innerHTML = LoginView(); bindLogin(); return;
  }

  switch(route){
    case "login":
      app.innerHTML = LoginView(); bindLogin(); break;

    case "dashboard":
      app.innerHTML = DashboardView(user); await bindDashboard(user); break;

    case "employees":
      // /employees (list) or /employees/new
      if(pathSegments[1] === "new"){
        app.innerHTML = EmployeeFormView(); bindEmployeeForm();
      } else {
        app.innerHTML = EmployeesListView(); await bindEmployeesList();
      }
      break;

    case "grants":
      if(id){ app.innerHTML = GrantDetailView(); await bindGrantDetail(id); }
      else { app.innerHTML = GrantsListView(); await bindGrantsList(); }
      break;

    case "admin":
      if(pathSegments[1] === "new-employee"){
        app.innerHTML = EmployeeFormView(); bindEmployeeForm();
      } else if(pathSegments[1] === "new-grant"){
        app.innerHTML = GrantFormView(); bindGrantForm();
      } else if(pathSegments[1] === "csv"){
        app.innerHTML = CsvView(); bindCsv();
      } else {
        location.hash = "#/dashboard";
      }
      break;

    default:
      location.hash = "#/dashboard";
  }
}

window.addEventListener("hashchange", ()=>{ if(AUTH_READY) navigate(location.hash); });
