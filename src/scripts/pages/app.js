import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateNavigationAuthenticated,
  generateNavigationUnauthenticated,
} from "../components/templates";
import { getAccessToken, getLogout } from "../utils/auth";
import { transitionHelper } from "../utils";

class App {
  #content;
  #drawerButton;
  #navigationDrawer;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton?.addEventListener("click", () => {
      this.#navigationDrawer?.classList.toggle("translate-x-full");
      this.#navigationDrawer?.classList.add("right-0");
      this.#navigationDrawer?.classList.remove("-right-[100%]");
    });

    document.body.addEventListener("click", (e) => {
      if (
        !this.#navigationDrawer?.contains(e.target) &&
        !this.#drawerButton?.contains(e.target)
      ) {
        this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
      }

      this.#navigationDrawer?.querySelectorAll("a").forEach((link) => {
        if (link.contains(e.target)) {
          this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navigationDrawer = this.#navigationDrawer;

    // User not log in
    if (!isLogin) {
      navigationDrawer.innerHTML = generateNavigationUnauthenticated();
      return;
    }

    navigationDrawer.innerHTML = generateNavigationAuthenticated();

    const logoutButton = document.getElementById("logout-button");

    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();

        location.hash = "/login";
        Toastify({
          text: "Logout Berhasil",
          duration: 3000,
        }).showToast();
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute() || "/";
    const route = routes[url];

    // Get page instance
    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();
    });
  }
}

export default App;
