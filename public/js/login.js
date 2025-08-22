/* eslint-disable */
const login = async (email = '', password = '') => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      alert('Logged in successfully');
      window.location.href = '/';
    }
  } catch (err) {
    console.log(err);
  }
};
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
