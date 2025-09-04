
document.getElementById('loginBtn').onclick = async ()=>{
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  try{
    await kfLoginEmail(email, pass);
    location.href='/profile.html';
  }catch(e){
    alert(e.message || 'Ошибка входа');
  }
};
document.getElementById('regBtn').onclick = async ()=>{
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  if (!name || !email || !pass) { alert('Заполните все поля.'); return; }
  try{
    await kfRegisterEmail(name, email, pass);
    alert('Готово! Теперь можно войти.');
  }catch(e){
    alert(e.message || 'Ошибка регистрации');
  }
};
