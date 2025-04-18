import Toastify from "toastify-js";

import RegisterPresenter from "./register-presenter";
import * as STORI_API from "../../../data/api";

export default class RegisterPage {
  #presenter = null;
  async render() {
    return `
    <section class="container h-[90svh] flex items-center flex-col justify-center">
        <h1 class="text-4xl mb-8">Daftar</h1>
        <form id="register-form" class="flex flex-col gap-4 w-full max-w-sm ">  
            <div class="flex flex-col gap-2">
                <label for="name" >Name <span class="text-red-600">*</span></label>
                <input type="text" id="name" name="name" placeholder="Name" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="email">Email <span class="text-red-600">*</span></label>
                <input type="email" id="email" name="email" placeholder="Email" class="input-custom" required />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password">Password <span class="text-red-600">*</span></label>
                <input type="password" id="password" name="password" placeholder="Password" class="input-custom" required />
            </div>
            <div id="submit-button-container" >
                <button class="button-custom w-full" type="submit">Daftar akun</button>
            </div>
        </form>
    </section>
      `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: STORI_API,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {
          name: document.getElementById("name").value,
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };
        console.log("hi");
        await this.#presenter.getRegistered(data);
      });
  }

  registeredSuccessfully(message) {
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();
    // Redirect
    location.hash = "/login";
  }

  registeredFailed(message) {
    Toastify({
      text: message,
      duration: 3000,
    }).showToast();
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
        <button class="button-custom w-full" type="submit" disabled>
                <i class="fas fa-spinner animate-spin"></i> Daftar akun
        </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
        <button class="button-custom w-full" type="submit">Daftar akun</button>
    `;
  }
}
