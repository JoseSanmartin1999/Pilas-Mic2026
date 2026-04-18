import React, { useState } from 'react'; // Necesario para manejar el estado de sesión
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuscarTutor from './pages/BuscarTutor';
import Profile from './pages/Profile';
import Mensajes from './pages/Mensajes';
import Solicitudes from './pages/Solicitudes';
import Footer from './components/Footer';

function App() {
  const [auth, setAuth] = useState(() => {
    // Restaurar sesión si existe en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return { isLogged: true, role: user.role };
    }
    return { isLogged: false, role: 'APRENDIZ' };
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAuth({ isLogged: false, role: 'APRENDIZ' });
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isAuthenticated={auth.isLogged} userRole={auth.role} onLogout={handleLogout} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setAuth={setAuth} />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/buscar" element={<BuscarTutor />} />
             {/* Mantenemos el parámetro :id para cargar perfiles específicos [cite: 105, 107]
                Ejemplo: /profile/1
             */}
             <Route path="/profile/:id" element={<Profile />} />
             <Route path="/mensajes" element={<Mensajes />} />
             <Route path="/solicitudes" element={<Solicitudes />} />

            {/* Ruta comodín para manejar errores 404 (Opcional) */}
            <Route path="*" element={<div className="text-center py-20">404 - Página no encontrada</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;