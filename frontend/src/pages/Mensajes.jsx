import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Mensajes = () => {
    const [responses, setResponses] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/mentorships/user/${currentUser.id}`);
            // Show requests where I am the apprentice (notifications of status changes)
            const myRequests = res.data.filter(m => m.apprentice_id === currentUser.id);
            setResponses(myRequests);
        } catch (err) {
            console.error("Error fetching responses:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg);
        if (msg.apprentice_notified === 0) {
            try {
                await axios.patch(`http://localhost:3000/api/mentorships/${msg.id}/read`);
                // Update local status to avoid re-triggering and refresh counts if needed
                setResponses(responses.map(r => r.id === msg.id ? { ...r, apprentice_notified: 1 } : r));
            } catch (err) {
                console.error("Error marking as read:", err);
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACEPTADA': return 'bg-green-100 text-green-700 border-green-200';
            case 'RECHAZADA': return 'bg-red-100 text-red-700 border-red-200';
            case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a3a5a]"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50 font-sans">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-[#1a3a5a] tracking-tight">Bandeja de Entrada</h1>
                <p className="text-gray-500 font-medium">Respuestas y actualizaciones de tus tutores</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[2.5rem] shadow-xl overflow-hidden min-h-[600px] border border-gray-100 text-left">
                
                {/* LISTA DE EMAILS (4/12) */}
                <div className="lg:col-span-4 border-r border-gray-50 overflow-y-auto max-h-[600px]">
                    <div className="p-4 bg-gray-50/50 border-b border-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-400">Recientes</div>
                    {responses.length > 0 ? (
                        responses.map((r) => (
                            <button 
                                key={r.id}
                                onClick={() => handleSelectMessage(r)}
                                className={`w-full text-left p-6 border-b border-gray-50 transition-all hover:bg-pilas-gold/5 flex flex-col gap-2 ${selectedMessage?.id === r.id ? 'bg-pilas-gold/10 border-l-4 border-l-pilas-gold' : 'bg-white'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#1a3a5a] truncate max-w-[120px]">{r.mentor_name}</span>
                                        {r.apprentice_notified === 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-400">{new Date(r.scheduled_date).toLocaleDateString()}</span>
                                </div>
                                <div className="text-sm font-semibold text-gray-700">Respuesta: {r.subject_name}</div>
                                <div className={`text-[9px] font-black px-2 py-0.5 rounded-full border self-start uppercase tracking-tighter ${getStatusStyle(r.status)}`}>
                                    {r.status}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-400 italic text-sm">No tienes mensajes.</div>
                    )}
                </div>

                {/* DETALLE DEL EMAIL (8/12) */}
                <div className="lg:col-span-8 p-8 md:p-12 flex flex-col">
                    {selectedMessage ? (
                        <div className="animate-in fade-in slide-in-from-right duration-300">
                            <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#1a3a5a] rounded-2xl flex items-center justify-center text-white text-xl font-black">
                                        {selectedMessage.mentor_name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#1a3a5a]">{selectedMessage.mentor_name}</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tutor de {selectedMessage.subject_name}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-xs font-black border uppercase tracking-widest shadow-sm ${getStatusStyle(selectedMessage.status)}`}>
                                    {selectedMessage.status}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-2xl font-black text-[#1a3a5a] leading-tight">
                                    Actualización sobre tu solicitud de tutoría para <span className="text-pilas-gold">{selectedMessage.subject_name}</span>
                                </h3>

                                <div className="bg-gray-50/80 rounded-3xl p-8 border border-gray-100/50 shadow-inner leading-relaxed text-gray-600 font-medium">
                                    <p className="mb-4">Hola <span className="font-bold text-[#1a3a5a]">{currentUser.full_name}</span>,</p>
                                    <p>
                                        Tu mentor ha revisado tu solicitud. Actualmente se encuentra en estado <span className="font-bold text-[#1a3a5a]">{selectedMessage.status}</span>.
                                    </p>
                                    {selectedMessage.status === 'ACEPTADA' && (
                                        <p className="mt-4 text-green-600 font-bold">
                                            ¡Felicidades! Tu tutoría ha sido confirmada para la fecha y hora seleccionada.
                                        </p>
                                    )}
                                    {selectedMessage.status === 'RECHAZADA' && (
                                        <p className="mt-4 text-red-600 font-bold">
                                            Lo sentimos, en esta ocasión el tutor no podrá atender tu solicitud.
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fecha de Sesión</div>
                                        <div className="text-lg font-black text-[#1a3a5a]">{new Date(selectedMessage.scheduled_date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hora de Sesión</div>
                                        <div className="text-lg font-black text-[#1a3a5a]">{new Date(selectedMessage.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                <div className="p-8 bg-pilas-gold/5 rounded-[2rem] border border-pilas-gold/20">
                                    <h4 className="text-[10px] font-black text-pilas-gold uppercase tracking-widest mb-4">Temas solicitados</h4>
                                    <p className="text-sm font-bold text-gray-600 whitespace-pre-line leading-relaxed">
                                        {selectedMessage.objectives}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                            <div className="text-8-xl mb-6">📬</div>
                            <p className="text-xl font-bold uppercase tracking-widest text-[#1a3a5a]">Selecciona un mensaje para leerlo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mensajes;
