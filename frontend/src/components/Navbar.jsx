import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ isAuthenticated, userRole, onLogout }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pilas-gold">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">

                    {/* Logo Pilas! */}
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img className="h-12 w-auto" src={logo} alt="Pilas!" />
                    </Link>

                    {/* Menú Dinámico */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {isAuthenticated && userRole === 'APRENDIZ' ? (
                            <>
                                <Link to="/buscar" className="nav-link">Busca Tutor</Link>
                                <Link to="/mensajes" className="nav-link">Bandeja de Entrada</Link>
                                <Link to="/logros" className="nav-link">Logros</Link>
                                <Link to="/registro-tutor" className="text-pilas-gold font-bold hover:text-blue-900">Hazte Tutor</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/" className="nav-link">Inicio</Link>
                                <Link to="/beneficios" className="nav-link">Beneficios</Link>
                                <Link to="/registro" className="nav-link">Regístrate</Link>
                            </>
                        )}

                        {/* Icono de Usuario con Dropdown (Mockup Perfil/Cerrar Sesion) */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="p-2 rounded-full bg-gray-100 text-pilas-blue hover:bg-pilas-gold hover:text-white transition-all shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 border border-gray-100">
                                    <Link to={`/profile/${JSON.parse(localStorage.getItem('user'))?.id || ''}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-pilas-blue hover:text-white">Mi Perfil</Link>
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            if (onLogout) onLogout();
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;