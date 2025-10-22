// js/app.js
import { spinner } from "./ui.js";
import { auth } from "./firebase.js";

import { LoginView, bindLogin } from "./views/login.js";
import { DashboardView, bindDashboard } from "./views/dashboard.js";
import { GrantsListView, bindGrantsList } from "./views/grants_list.js";
import { GrantDetailView, bindGrantDetail } from "./views/grant_detail.js";
import { GrantFormView, bindGrantForm } from "./views/admin_grant_form.js";
import { CsvView, bindCsv } from "./views/admin_csv.js";

const app = document.getElementById("app");

export async function navigate(hash, user = auth.currentUser){
  const [_, route, id] = (hash || "").split("/");
  spinner(true);

  if(!user && route !== "login"){
    app.innerHTML = LoginView();
    bindLogin();
    return;
  }

  switch(route){
    case "login":
      app.innerHTML = LoginView(); bindLogin(); break;
    case "dashboard":
      app.innerHTML = DashboardView(user); await bindDashboard(user); break;
    case "grants":
      if(id){ app.innerHTML = GrantDetailView(); await bindGrantDetail(id); }
      else { app.innerHTML = GrantsListView(); await bindGrantsList(); }
      break;
    case "admin":
      if(id === "new-grant"){ app.innerHTML = GrantFormView(); bindGrantForm(); }
      else if(id === "csv"){ app.innerHTML = CsvView(); bindCsv(); }
      else { location.hash = "#/dashboard"; }
      break;
    default:
      location.hash = "#/dashboard";
  }
}

window.addEventListener("hashchange", ()=>navigate(location.hash));
