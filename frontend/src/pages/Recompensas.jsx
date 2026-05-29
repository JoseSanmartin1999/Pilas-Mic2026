import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import config from '../config/constants.json';

const Recompensas = () => {
    const { showNotification } = useNotification();
    
    // Estados simulados pero reactivos de gamificación
    const [espeCoins, setEspeCoins] = useState(250);
    const [xp, setXp] = useState(780);
    const [level, setLevel] = useState(3);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [activeCouponCode, setActiveCouponCode] = useState('');
    const [activeCouponTitle, setActiveCouponTitle] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // Listado de insignias y cupones desde archivo de configuración centralizado
    const INSIGNIAS = config.BADGES;
    const CUPONES = config.COUPONS;

    // Lógica para canjear cupón
    const handleRedeem = (cupon) => {
        if (espeCoins < cupon.cost) {
            showNotification(`Saldo insuficiente. Necesitas ${cupon.cost} ESPE-Coins`, "error");
            return;
        }

        // Restar monedas
        setEspeCoins(prev => prev - cupon.cost);
        
        // Generar código aleatorio
        const randomCode = 'ESPE-COIN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        setActiveCouponCode(randomCode);
        setActiveCouponTitle(cupon.title);
        setShowCouponModal(true);

        showNotification(`¡Felicidades! Canjeaste "${cupon.title}" exitosamente`, "success");
    };

    // Copiar código de cupón
    const copyCouponCode = () => {
        navigator.clipboard.writeText(activeCouponCode);
        showNotification("¡Código de cupón copiado con éxito!", "success");
    };

    // Progreso del nivel (Nivel 3 va de 500 XP a 1000 XP por ejemplo)
    const xpMax = 1000;
    const progressPercent = Math.min((xp / xpMax) * 100, 100);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Superior y Panel de Estadísticas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 items-stretch">
                    
                    {/* Tarjeta de Nivel */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col justify-between border border-blue-900/20 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner backdrop-blur-sm">
                                {currentUser.profile_photo_url ? (
                                    <img
                                        src={currentUser.profile_photo_url}
                                        alt={currentUser.full_name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    "⚡"
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold truncate">
                                    {currentUser.full_name || "Estudiante de la ESPE"}
                                </h1>
                                <p className="text-blue-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                                    <span>🏅</span> Nivel {level} — Tutor Comprometido
                                </p>
                            </div>
                        </div>

                        {/* Barra de progreso de XP */}
                        <div className="relative z-10 mt-6 sm:mt-0">
                            <div className="flex justify-between text-xs font-bold text-blue-200 mb-1.5">
                                <span>Progreso de Nivel</span>
                                <span>{xp} / {xpMax} XP</span>
                            </div>
                            <div className="w-full h-4 bg-white/15 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-pilas-gold to-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de ESPE-Coins */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-gray-100/80 flex flex-col justify-between items-center text-center">
                        <div>
                            <span className="text-sm font-bold text-gray-400 block mb-1">MI SALDO</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">{espeCoins}</span>
                                <span className="text-3xl sm:text-4xl animate-bounce">🪙</span>
                            </div>
                            <span className="text-xs font-bold text-pilas-gold mt-1 block">ESPE-Coins Acumuladas</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-4 leading-relaxed max-w-[220px]">
                            Consigue más ESPE-Coins completando tutorías y recibiendo valoraciones excelentes.
                        </p>
                    </div>

                </div>

                {/* Grid Inferior: Logros & Tienda */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Sección Mis Logros (Insignias) */}
                    <div className="lg:col-span-6 bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-gray-100/80">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span>🏆</span> Mis Logros e Insignias
                            </h2>
                            <p className="text-gray-400 text-xs mt-1 font-medium">
                                Demuestra tu compromiso académico y sube de rango en la comunidad.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {INSIGNIAS.map((insignia) => (
                                <div
                                    key={insignia.id}
                                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden ${
                                        insignia.unlocked
                                            ? 'bg-gradient-to-br from-white to-amber-50/10 border-amber-200/50 shadow-sm shadow-amber-100/30'
                                            : 'bg-slate-50/50 border-gray-100 opacity-65'
                                    }`}
                                >
                                    {/* Icono de Insignia */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                                        insignia.unlocked
                                            ? 'bg-amber-100 border border-amber-200/60 shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                                            : 'bg-slate-200 text-gray-400'
                                    }`}>
                                        {insignia.unlocked ? insignia.icon : '🔒'}
                                    </div>

                                    {/* Información */}
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-extrabold text-slate-800 text-sm leading-tight">
                                                {insignia.title}
                                            </h4>
                                            {insignia.unlocked && (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-600 font-extrabold px-1.5 py-0.5 rounded-md">
                                                    Listo
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                                            {insignia.description}
                                        </p>
                                        <span className="text-[10px] font-black text-pilas-blue mt-2 block">
                                            +{insignia.xpReward} XP
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección Tienda de Beneficios */}
                    <div className="lg:col-span-6 bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-100/50 border border-gray-100/80">
                        <div className="border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span>🛍️</span> Tienda de Recompensas
                            </h2>
                            <p className="text-gray-400 text-xs mt-1 font-medium">
                                Intercambia tus ESPE-Coins por beneficios tangibles y prácticos en el campus.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {CUPONES.map((cupon) => {
                                const canAfford = espeCoins >= cupon.cost;

                                return (
                                    <div
                                        key={cupon.id}
                                        className="bg-slate-50/50 hover:bg-slate-50/80 transition-all rounded-2xl p-4 border border-gray-100/80 hover:border-gray-200 flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {/* Icono del cupón */}
                                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                                                {cupon.icon}
                                            </div>
                                            {/* Info */}
                                            <div className="min-w-0">
                                                <span className="text-[10px] bg-slate-200/60 text-slate-600 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                                    {cupon.category}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-sm truncate mt-1 leading-tight">
                                                    {cupon.title}
                                                </h4>
                                                <p className="text-[11px] text-gray-500 mt-0.5 truncate leading-relaxed">
                                                    {cupon.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Botón de Canjeo */}
                                        <button
                                            onClick={() => handleRedeem(cupon)}
                                            className={`font-black text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 shadow-sm ${
                                                canAfford
                                                    ? 'bg-pilas-gold hover:bg-amber-600 text-white shadow-amber-500/10'
                                                    : 'bg-gray-100 text-gray-400 border border-gray-200/50 cursor-not-allowed'
                                            }`}
                                        >
                                            <span>{cupon.cost}</span>
                                            <span>🪙</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

            </div>

            {/* Modal de Cupón Exitoso */}
            {showCouponModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in duration-200 border border-gray-100 flex flex-col items-center text-center">
                        
                        {/* Icono animado */}
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 text-3xl mb-6 shadow-sm border border-amber-200/50 animate-bounce">
                            🎉
                        </div>

                        {/* Título */}
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">
                            ¡Canjeo Exitoso!
                        </h3>
                        
                        <p className="text-xs text-gray-500 mt-2 max-w-[240px]">
                            Has adquirido con éxito el beneficio:
                        </p>
                        
                        <strong className="text-slate-700 text-sm block mt-1 px-4 py-1.5 bg-slate-50 rounded-xl border border-gray-100 font-extrabold max-w-full truncate">
                            {activeCouponTitle}
                        </strong>

                        {/* Campo del Código */}
                        <div className="w-full mt-6 bg-slate-950/5 p-4 rounded-2xl border border-slate-200/60 flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">CÓDIGO DE CUPÓN</span>
                            <span className="text-base font-black text-slate-800 tracking-wider mt-1">{activeCouponCode}</span>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-2 italic">
                            Presenta este código en ventanilla para hacerlo válido.
                        </p>

                        {/* Controles */}
                        <div className="w-full grid grid-cols-2 gap-3 mt-8">
                            <button
                                onClick={copyCouponCode}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl transition-all active:scale-95 border border-slate-200/60"
                            >
                                Copiar Código
                            </button>
                            <button
                                onClick={() => setShowCouponModal(false)}
                                className="bg-pilas-blue hover:bg-blue-900 text-white text-xs font-black py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-900/10"
                            >
                                Listo
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Recompensas;
