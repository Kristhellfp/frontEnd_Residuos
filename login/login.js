const avatars = document.querySelectorAll('.avatar-selector img');
let selectedAvatar = null;

const roleSelect = document.getElementById('userRole');
const title = document.getElementById('loginTitle');

function updateTitle(role) {
  title.textContent = role === 'profesor'
    ? '👩‍🏫 Bienvenido, Profesor/a'
    : '👦 Bienvenido, Héroe Ecológico';
}

updateTitle(roleSelect.value);
document.body.classList.add(roleSelect.value);

roleSelect.addEventListener('change', () => {
  const selectedRole = roleSelect.value;
  updateTitle(selectedRole);
  document.body.className = '';
  document.body.classList.add(selectedRole);
});

avatars.forEach((avatar) => {
  avatar.addEventListener('click', () => {
    avatars.forEach(a => a.classList.remove('selected'));
    avatar.classList.add('selected');
    selectedAvatar = avatar.getAttribute('data-avatar');
  });
});

const verificarCodigo = async (codigo) => {
  try {
    const res = await fetch(`http://localhost:5000/api/partidas/${codigo}`);
    return res.ok;
  } catch (error) {
    console.error('❌ Error al verificar código:', error);
    return false;
  }
};

document.getElementById('startBtn').addEventListener('click', async () => {
  const name = document.getElementById('username').value.trim();
  const codigoPartida = document.getElementById('codigoInput')?.value.trim();
  const role = roleSelect.value;

  if (!name || !selectedAvatar || !codigoPartida) {
    alert('Por favor, completa todos los campos: nombre, avatar y código de partida.');
    return;
  }

  if (role !== 'profesor') {
    const valido = await verificarCodigo(codigoPartida);
    if (!valido) {
      alert('⚠️ El código de partida no existe.');
      return;
    }
  }

  localStorage.setItem('heroName', name);
  localStorage.setItem('heroAvatar', selectedAvatar);
  localStorage.setItem('userRole', role);
  localStorage.setItem('codigoPartida', codigoPartida);

  if (role === 'estudiante') {
    const nuevoUsuario = {
      nombre: name,
      avatar: selectedAvatar,
      rol: role,
      aciertos: 0,
      errores: 0,
      puntos: 0,
      tiempo_segundos: 0,
      observaciones: '',
      codigo_partida: codigoPartida
    };

    console.log('📦 Enviando al backend:', nuevoUsuario);

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error('❌ Respuesta del backend:', msg);
        throw new Error(`Error HTTP: ${res.status}`);
      }

      const usuario = await res.json();
      localStorage.setItem('usuarioId', usuario.id);
      console.log('✅ Usuario registrado con ID:', usuario.id);
    } catch (error) {
      console.error('❌ Error al registrar usuario:', error);
      alert('Error al registrarse. Revisa la consola.');
      return;
    }
  }

  window.location.href = role === 'profesor' ? 'panel.html' : 'game.html';
});
