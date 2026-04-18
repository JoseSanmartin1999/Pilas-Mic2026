import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Solicitudes = () => {
    const [mentorships, setMentorships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reprogrammingId, setReprogrammingId] = useState(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchMentorships();
    }, []);

    const fetchMentorships = async () => {
        try {
            // Fetching requests where current user is mentor
            const res = await axios.get(`http://localhost:3000/api/mentorships/user/${currentUser.id}`);
            // For this page, we only show ones where they are mentors AND status is PENDING
            const pendingRecieved = res.data.filter(m => m.mentor_id === currentUser.id && m.status === 'PENDIENTE');
            setMentorships(pendingRecieved);
        } catch (err) {
            console.error("Error fetching mentorships:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, scheduled_date = null) => {
        try {
            const payload = { status };
            if (scheduled_date) payload.scheduled_date = scheduled_date;
            
            await axios.put(`http://localhost:3000/api/mentorships/${id}`, payload);
            alert(`Tutoría ${status === 'ACEPTADA' ? 'aceptada' : status === 'RECHAZADA' ? 'declinada' : 'reprogramada'} con éxito`);
            setReprogrammingId(null);
            fetchMentorships();
        } catch (err) {
            alert("Error al procesar la acción");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a3a5a]"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 min-h-screen bg-gray-50 font-sans">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-black text-[#1a3a5a] tracking-tight mb-2">Solicitudes Pendientes</h1>
                <p className="text-gray-500 font-medium">Gestiona las tutorías que te han solicitado los alumnos</p>
            </header>

            <div className="space-y-8">
                {mentorships.length > 0 ? (
                    mentorships.map((m) => {
                        const date = new Date(m.scheduled_date);
                        
                        return (
                            <div key={m.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 transition-all hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#ffcc00]"></div>
                                
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <p className="text-[#1a3a5a] text-lg leading-relaxed">
                                                Hola Estimado Tutor <span className="font-black">({m.mentor_name})</span>
                                            </p>
                                            <p className="text-gray-600 text-lg leading-relaxed">
                                                Permíteme saludarte, soy <span className="font-black text-[#1a3a5a]">{m.apprentice_name}</span> y quisiera solicitarte una tutoría en la materia de <span className="text-[#ffcc00] font-black uppercase tracking-wider">{m.subject_name}</span> para tratar los siguientes temas:
                                            </p>
                                        </div>

                                        <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100 shadow-inner">
                                            <ul className="space-y-2">
                                                {m.objectives.split('\n').map((line, i) => (
                                                    <li key={i} className="flex items-start text-gray-700 font-medium">
                                                        <span className="text-[#ffcc00] mr-3 font-bold">•</span>
                                                        {line}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <p className="text-gray-600 italic">
                                            Propuesto para el: <span className="font-bold text-[#1a3a5a]">{date.toLocaleDateString()}</span> a las <span className="font-bold text-[#1a3a5a]">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full md:w-56">
                                        <button 
                                            onClick={() => handleAction(m.id, 'ACEPTADA')}
                                            className="w-full py-4 bg-[#1a3a5a] text-[#ffcc00] rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-[#1a3a5a]/20 hover:bg-[#112740] transition-all"
                                        >
                                            Aceptar
                                        </button>
                                        
                                        <button 
                                            onClick={() => setReprogrammingId(reprogrammingId === m.id ? null : m.id)}
                                            className="w-full py-4 bg-white border-2 border-[#ffcc00] text-[#1a3a5a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ffcc00] hover:text-white transition-all"
                                        >
                                            Reprogramar
                                        </button>

                                        <button 
                                            onClick={() => handleAction(m.id, 'RECHAZADA')}
                                            className="w-full py-4 bg-gray-50 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                                        >
                                            Declinar
                                        </button>
                                    </div>
                                </div>

                                {reprogrammingId === m.id && (
                                    <div className="mt-8 pt-8 border-t border-dashed border-gray-200 animate-in slide-in-from-top duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input 
                                                type="date" 
                                                className="px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a] border border-gray-100"
                                                onChange={(e) => setNewDate(e.target.value)}
                                            />
                                            <input 
                                                type="time" 
                                                className="px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a] border border-gray-100"
                                                onChange={(e) => setNewTime(e.target.value)}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (!newDate || !newTime) return alert("Selecciona fecha y hora");
                                                    handleAction(m.id, 'PENDIENTE', `${newDate}T${newTime}:00`);
                                                }}
                                                className="bg-[#ffcc00] text-white font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest hover:bg-yellow-500 transition-all shadow-md"
                                            >
                                                Confirmar Nueva Fecha
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-6">📑</div>
                        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No hay solicitudes pendientes por el momento</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Solicitudes;
