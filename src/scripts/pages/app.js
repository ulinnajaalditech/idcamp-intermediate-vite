import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateNavigationAuthenticated,
  generateNavigationUnauthenticated,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from "../components/templates";
import { getAccessToken, getLogout } from "../utils/auth";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";
import NotFoundPage from "./notfound/not-found-page";

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  #skipContent;

  constructor({ navigationDrawer, drawerButton, content, skipContent }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipContent = skipContent;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipContent, this.#content);

    if (this.#navigationDrawer) {
      this.#navigationDrawer.setAttribute("aria-hidden", "true");
    }

    if (this.#drawerButton) {
      this.#drawerButton.setAttribute("aria-expanded", "false");
      this.#drawerButton.setAttribute("aria-controls", "navigation-drawer");
    }

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton?.addEventListener("click", () => {
      this.#navigationDrawer?.classList.toggle("translate-x-full");
      this.#navigationDrawer?.classList.add("right-0");
      this.#navigationDrawer?.classList.remove("-right-[100%]");

      const isExpanded =
        !this.#navigationDrawer?.classList.contains("translate-x-full");
      this.#drawerButton?.setAttribute("aria-expanded", String(isExpanded));

      if (isExpanded) {
        this.#navigationDrawer?.setAttribute("aria-hidden", "false");
      } else {
        this.#navigationDrawer?.setAttribute("aria-hidden", "true");
        this.#drawerButton?.focus();
      }
    });

    document.addEventListener("click", (e) => {
      const closeButton = document.getElementById("close-button");
      if (closeButton && e.target === closeButton) {
        this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
        this.#navigationDrawer?.setAttribute("aria-hidden", "true");
        this.#drawerButton?.setAttribute("aria-expanded", "false");
        this.#drawerButton?.focus();
      }
    });

    document.body.addEventListener("click", (e) => {
      if (
        !this.#navigationDrawer?.contains(e.target) &&
        !this.#drawerButton?.contains(e.target)
      ) {
        this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
        this.#navigationDrawer?.setAttribute("aria-hidden", "true");
        this.#drawerButton?.setAttribute("aria-expanded", "false");
      }

      this.#navigationDrawer?.querySelectorAll("a").forEach((link) => {
        if (link.contains(e.target)) {
          this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
          this.#navigationDrawer?.setAttribute("aria-hidden", "true");
          this.#drawerButton?.setAttribute("aria-expanded", "false");
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

    const focusableElements =
      this.#navigationDrawer?.querySelectorAll("a, button") || [];

    if (focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1];

      lastElement.addEventListener("keydown", (event) => {
        if (event.key === "Tab" && !event.shiftKey) {
          this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
          this.#navigationDrawer?.setAttribute("aria-hidden", "true");
          this.#drawerButton?.setAttribute("aria-expanded", "false");
        }
      });

      const firstElement = focusableElements[0];

      firstElement.addEventListener("keydown", (event) => {
        if (event.key === "Tab" && event.shiftKey) {
          this.#navigationDrawer?.classList.add("translate-x-full", "right-0");
          this.#navigationDrawer?.setAttribute("aria-hidden", "true");
          this.#drawerButton?.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "action-push-notification"
    );

    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
  }

  async renderPage() {
    const url = getActiveRoute() || "/";
    const route = routes[url];
    const routeExist = url && routes[url];

    const page = routeExist ? route() : new NotFoundPage();

    const transition = transitionHelper({
      updateDOM: async () => {
        if (this.#content) {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        }
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: "instant" });
      this.#setupNavigationList();
      if (isServiceWorkerAvailable()) {
        this.#setupPushNotification();
      }
    });
  }
}

export default App;
