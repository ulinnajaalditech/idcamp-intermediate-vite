export const generateNavigationUnauthenticated = () => {
  return `
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/login">Masuk</a></li>
        <li><a class="block px-3 py-2 text-gray-800 hover:underline" href="#/register">Daftar</a></li>
      `;
};

export const generateNavigationAuthenticated = () => {
  return `
      <li><a class="block px-3 py-2 text-gray-800 hover:underline button-custom-neutral" href="#/stories">Tambah Ceritamu</a></li>
      <li><a id="logout-button" class="block px-3 py-2 text-gray-800 hover:underline" href="#/logout">Keluar</a></li>
      `;
};
