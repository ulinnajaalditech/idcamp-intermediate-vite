import Toastify from "toastify-js";

import LoginPresenter from "./login-presenter";
import * as STORY_API from "../../../data/api";
import * as AUTH_MODEL from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
    <section class="container h-[90svh] flex items-center flex-col justify-center">
        <h1 class="text-4xl mb-8">Masuk</h1>
        <form id="login-form" class="flex flex-col gap-4 w-full max-w-sm ">  
            <div class="flex flex-col gap-2">
                <label for="email">Email <span class="text-red-600">*</span></label>
                <input type="email" id="email" name="email" placeholder="Email" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password <span class="text-red-600">*</span></label>
                <input type="password" id="password" name="password" placeholder="Password" class="input-custom" required />
            </div>
            <div id="submit-button-container" >
                <button class="button-custom w-full" type="submit">Login</button>
            </div>
        </form>
    </section>
      `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: STORY_API,
      authModel: AUTH_MODEL,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };
        await this.#presenter?.getLogin(data);
      });
  }

  loginSuccessfully(message, data) {
    console.log({ message, data });
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();

    location.hash = "/";
  }

  loginFailed(message) {
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
            <button class="button-custom w-full" type="submit" disabled>
                <i class="fas fa-spinner animate-spin"></i> Login
            </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
            <button class="button-custom w-full" type="submit">Login</button>
    `;
  }
}
