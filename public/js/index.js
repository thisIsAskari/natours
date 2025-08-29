/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { dislayMap } from './mapbox';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
// const mapBox = document.getElementById('map');
const mapBox = false;
const loginForm = document.querySelector('.from--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// VALUES
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const photoInput = document.getElementById('photo');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('password-confirm');
const passwordCurrentInput = document.getElementById('password-current');
const submitBtn = document.querySelector('.btn--save-password');

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

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    if (nameInput) form.append('name', nameInput.value);
    if (emailInput) form.append('email', emailInput.value);
    if (photoInput) form.append('photo', photoInput.files[0]);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const passwordCurrent = passwordCurrentInput.value;
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    submitBtn.textContent = 'Updating...';

    submitBtn.disabled = true;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    passwordCurrentInput.value = '';
    passwordInput.value = '';
    passwordConfirmInput.value = '';
    submitBtn.textContent = 'Save password';
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = '#55c57a';
  });
}
