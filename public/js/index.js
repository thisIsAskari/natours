/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { dislayMap } from './mapbox';

// DOM ELEMENTS
// const mapBox = document.getElementById('map');
const mapBox = false;
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

// VALUES

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations,
  );
  console.log(locations);
  dislayMap(locations);
}

if (loginForm) {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    if (!form) {
      console.error("Form with class '.form' not found");
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await logout();
  });
}
