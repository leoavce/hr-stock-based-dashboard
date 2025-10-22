// js/ui.js
export function toast(msg, ms=2000){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"), ms);
}

export function spinner(on=true){
  const app = document.getElementById("app");
  if(on){
    app.innerHTML = `
      <section class="w-full min-h-[40vh] flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </section>`;
  }
}
