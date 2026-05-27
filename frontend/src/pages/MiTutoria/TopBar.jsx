import React from 'react';

/**
 * TopBar — Cabecera dinámica del workspace
 * Muestra: materia + compañero | progress bar | botón de hito
 */
const TopBar = ({ mentorship, currentUser }) => {
    // Determinar quién es el compañero (el otro participante)
    const isMentor = currentUser?.id === mentorship?.mentor_id;
    const partnerName = isMentor ? mentorship?.apprentice_name : mentorship?.mentor_name;
    const partnerRole = isMentor ? 'Aprendiz' : 'Mentor';

    // Progreso simulado — en una versión futura vendría de la DB
    const progress = 15;

    const handleHito = () => {
        alert('🏆 ¡Hito marcado! Esta funcionalidad se conectará con el sistema de gamificación próximamente.');
    };

    return (
        <div className="flex-shrink-0 h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-6 shadow-sm z-10">
            {/* IZQUIERDA — Materia y compañero */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex flex-col">
                    <span className="text-[#1e3a8a] font-black text-sm leading-tight tracking-tight">
                        {mentorship?.subject_name || 'Tutoría'}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">
                            con
                        </span>
                        <span className="text-[10px] text-gray-600 font-bold">
                            {partnerName}
                        </span>
                        <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                            {partnerRole}
                        </span>
                    </div>
                </div>

                {/* Separador */}
                <div className="w-px h-8 bg-gray-100" />
            </div>

            {/* CENTRO — Progress Bar */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex-shrink-0 hidden md:block">
                    Progreso
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden max-w-xs">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-pilas-gold to-yellow-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-[10px] font-black text-pilas-gold flex-shrink-0">
                    {progress}%
                </span>
                <span className="text-[9px] text-gray-300 font-medium hidden lg:block flex-shrink-0">
                    Semana 1 de 16
                </span>
            </div>

            {/* DERECHA — Botón Hito */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <button
                    id="btn-marcar-hito"
                    onClick={handleHito}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1e3a8a] text-pilas-gold rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1a3270] hover:shadow-lg hover:shadow-[#1e3a8a]/20 hover:scale-[1.02] transition-all duration-200"
                >
                    <span>🏆</span>
                    <span className="hidden sm:block">Marcar Hito</span>
                </button>
                <button
                    id="btn-finalizar-sesion"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200"
                >
                    <span>⏹</span>
                    <span className="hidden sm:block">Finalizar</span>
                </button>
            </div>
        </div>
    );
};

export default TopBar;
