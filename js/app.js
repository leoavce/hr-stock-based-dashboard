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

// ✅ auth 준비 완료 전에는 라우팅 금지
let AUTH_READY = false;
export function setAuthReady(v){ AUTH_READY = v; }

export async function navigate(hash, user = auth.currentUser){
  if(!AUTH_READY){ return; }  // ← 여기서 막음 (권한 오류 예방)
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

// 해시 변경은 auth 준비 후에만 반영
window.addEventListener("hashchange", ()=>{ if(AUTH_READY) navigate(location.hash); });
