export default class HomePage {
  async render() {
    return `
      <section class="container flex items-center h-full w-full justify-center min-h-[90svh]">
        <h1 class="text-black">Home Page</h1>
      </section>
    `;
  }

  async afterRender() {
    // Do your job here
  }
}
