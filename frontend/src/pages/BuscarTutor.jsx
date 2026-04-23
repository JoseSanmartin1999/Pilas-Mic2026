import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BuscarTutor = () => {
    const [mentors, setMentors] = useState([]);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMentors = async () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const excludeParam = currentUser?.id ? `?exclude=${currentUser.id}` : '';
            const res = await axios.get(`http://localhost:3000/api/users/mentors${excludeParam}`);
            setMentors(res.data);
        };
        fetchMentors();
    }, []);

    // Filtrado simple por nombre o materia
    const filteredMentors = mentors.filter(m =>
        m.nombre.toLowerCase().includes(filter.toLowerCase()) ||
        m.materias.some(mat => mat.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row gap-8">

                {/* BARRA LATERAL: Filtros (Wireframe 1) */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h4 className="text-[#1a3a5a] font-black text-sm uppercase tracking-widest mb-4">Filtrar</h4>
                        <input
                            type="text"
                            placeholder="Buscar por materia..."
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-xs focus:ring-2 focus:ring-[#ffcc00] outline-none"
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </aside>

                {/* CUADRÍCULA DE TUTORES */}
                <main className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMentors.map(mentor => (
                            <div key={mentor.id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100 flex flex-col items-center hover:shadow-lg hover:border-[#ffcc00] transition-all">
                                <img
                                    src={mentor.profile_photo_url || '/default-avatar.png'}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-100 mb-4"
                                    alt="Tutor"
                                />
                                <h3 className="font-bold text-[#1a3a5a] text-center">{mentor.nombre} {mentor.apellidos}</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 mb-4">{mentor.career}</p>

                                <div className="flex flex-wrap justify-center gap-1 mb-6">
                                    {mentor.materias.slice(0, 2).map((mat, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-[#1a3a5a] rounded text-[9px] font-bold border border-blue-100">
                                            {mat}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate(`/profile/${mentor.id}`)}
                                    className="w-full py-2.5 bg-white text-[#1a3a5a] border-2 border-[#1a3a5a] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1a3a5a] hover:text-[#ffcc00] transition-all"
                                >
                                    Más Info
                                </button>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BuscarTutor;