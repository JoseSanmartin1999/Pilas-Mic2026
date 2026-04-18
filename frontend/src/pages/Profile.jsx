import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para Pactar Tutoría
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [mentorshipData, setMentorshipData] = useState({ subject_id: '', date: '', time: '', objectives: '' });

  // Estados para la edición (RF#003)
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ bio: '', current_semester: '', materias: [] });
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);

  // Control de accesos
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = String(currentUser.id) === String(id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/profile/${id}`);
        setUser(res.data);
        // Inicializamos los datos de edición con el formato correcto
        setEditData({
          bio: res.data.bio || '',
          current_semester: res.data.current_semester || '',
          materias: res.data.materias_ids || [] // IDs para los checkboxes
        });

        // Cargamos todas las materias disponibles para el modal (RF#007)
        const subjRes = await axios.get(`http://localhost:3000/api/subjects`).catch(() => ({ data: [] }));
        setAllSubjects(subjRes.data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handlePactarTutoria = async (e) => {
    e.preventDefault();
    if (!mentorshipData.subject_id || !mentorshipData.date || !mentorshipData.time || !mentorshipData.objectives.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const scheduled_date = `${mentorshipData.date}T${mentorshipData.time}:00`;

    try {
      const payload = {
        mentor_id: user.id,
        apprentice_id: currentUser.id,
        subject_id: mentorshipData.subject_id,
        scheduled_date,
        objectives: mentorshipData.objectives
      };

      await axios.post('http://localhost:3000/api/mentorships', payload);
      alert("¡Tutoría solicitada exitosamente!");
      setShowMentorshipModal(false);
      setMentorshipData({ subject_id: '', date: '', time: '', objectives: '' });
    } catch (err) {
      console.error(err);
      alert("Hubo un error al solicitar la tutoría");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('bio', editData.bio);
    data.append('current_semester', editData.current_semester);
    data.append('materias', JSON.stringify(editData.materias));
    if (nuevaFoto) data.append('foto_perfil', nuevaFoto);

    try {
      const res = await axios.put(`http://localhost:3000/api/users/profile/${id}`, data);

      // Actualizamos el estado global con la respuesta del servidor (RF#003)
      setUser({
        ...user,
        bio: editData.bio,
        current_semester: editData.current_semester,
        profile_photo_url: res.data.fotoUrl || user.profile_photo_url,
        materias: res.data.materias || user.materias
      });

      setShowModal(false);
      alert("¡Perfil actualizado con éxito!");
    } catch (err) {
      alert("Error al actualizar el perfil");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a3a5a]"></div>
    </div>
  );

  if (!user) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 text-center p-8">
      <div>
        <div className="text-6xl mb-4">🔌</div>
        <h2 className="text-2xl font-black text-[#1a3a5a] mb-2">Error de conexión</h2>
        <p className="text-gray-500 font-medium">No se pudo cargar el perfil del usuario. Por favor verifica que el servidor esté activo.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUMNA IZQUIERDA: Identidad e Info (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm ring-1 ring-gray-900/5 text-center relative group">
            {isOwnProfile && (
              <button
                onClick={() => setShowModal(true)}
                className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-[#ffcc00] hover:text-[#1a3a5a] transition-all opacity-0 group-hover:opacity-100"
                title="Editar Perfil"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" /></svg>
              </button>
            )}
            <img
              src={user.profile_photo_url || '/default-avatar.png'}
              className="w-40 h-40 rounded-[2rem] mx-auto object-cover shadow-md mb-6 ring-4 ring-gray-50"
              alt="Perfil"
            />
            <h2 className="mt-4 font-extrabold text-[#1a3a5a] text-2xl leading-tight">
              {user.full_name || `${user.nombre} ${user.apellidos}`}
            </h2>

            <div className="mt-8 space-y-3 text-sm font-medium text-gray-600 text-left bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Semestre</span> <span className="font-bold text-[#1a3a5a] bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{user.current_semester || '1'}°</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Carrera</span> <span className="truncate max-w-[120px] text-right font-medium" title={user.career || user.carrera}>{user.career || user.carrera || '-'}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Institución</span> <span className="font-medium text-gray-800">{user.institution || 'ESPE'}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Rol</span> <span className="bg-[#1a3a5a]/10 text-[#1a3a5a] font-bold px-3 py-1 rounded-lg text-xs tracking-wide">{user.role}</span></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm ring-1 ring-gray-900/5 group">
            <h4 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest flex items-center mb-5">
              <span className="w-2 h-4 bg-gradient-to-b from-[#ffcc00] to-yellow-600 rounded-full mr-3"></span> Materias Impartidas
              {isOwnProfile && (
                <button
                  onClick={() => setShowModal(true)}
                  className="ml-auto text-gray-300 hover:text-[#ffcc00] transition-colors opacity-0 group-hover:opacity-100"
                  title="Editar Materias"
                >
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" /></svg>
                </button>
              )}
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.materias?.length > 0 ? user.materias.map((m, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 border border-gray-200 text-gray-700 hover:border-[#ffcc00] hover:bg-yellow-50/30 transition-colors uppercase">
                  {m.name || m}
                </span>
              )) : <p className="text-gray-400 text-xs italic">Sin materias registradas</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm ring-1 ring-gray-900/5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-5">
              <span className="w-2 h-4 bg-gradient-to-b from-[#4ade80] to-green-600 rounded-full mr-3"></span> Próximas Tutorías
            </h4>
            <div className="space-y-3">
              {user.tutorias?.length > 0 ? (
                user.tutorias.map((t, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-[#ffcc00] bg-gray-50 rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold text-[#1a3a5a]">{t.fecha}</p>
                      <p className="text-[10px] font-black text-gray-800 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">{t.hora}</p>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase truncate">{t.materia}</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-gray-400 text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 uppercase tracking-widest">Sin sesiones</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Puntuación, Logros y Comentarios (8/12) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">

          {/* BARRA SUPERIOR: SCORE */}
          <div className="bg-gradient-to-r from-[#1a3a5a] to-[#2a4a7a] p-8 rounded-[2rem] shadow-lg flex items-center justify-between overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <span className="text-lg font-bold text-white/80 uppercase tracking-widest relative z-10">Puntuación</span>
            <div className="flex space-x-2 text-[#ffcc00] text-4xl drop-shadow-md relative z-10">
              {[1, 2, 3, 4, 5].map((s) => <span key={s}>{s <= Math.round(user.score || 0) ? '★' : '☆'}</span>)}
            </div>
          </div>

          {/* SECCIÓN LOGROS PROFESIONALES */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm ring-1 ring-gray-900/5">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-[#1a3a5a] font-extrabold text-xl tracking-tight">Mis Logros</h4>
              <span className="text-[10px] font-bold text-[#1a3a5a] bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-widest">{user.badges?.length || 0} Insignias</span>
            </div>

            <div className="flex flex-wrap gap-5">
              {user.badges?.length > 0 ? user.badges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center p-5 rounded-3xl border border-gray-100 hover:border-[#ffcc00] hover:shadow-md transition-all duration-300 w-32 bg-gray-50/30 group">
                  <div className="w-14 h-14 mb-3 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-gray-100/50 group-hover:scale-110 transition-transform">
                    {badge.icon || '🏅'}
                  </div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-700 text-center leading-tight group-hover:text-[#1a3a5a]">{badge.name}</p>
                </div>
              )) : (
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest py-8 w-full text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">Aún no hay insignias</p>
              )}
            </div>
          </div>

          {/* COMENTARIOS / SOBRE MÍ */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm ring-1 ring-gray-900/5 flex-1 flex flex-col">
            <h4 className="text-[#1a3a5a] font-extrabold text-xl tracking-tight mb-5">Sobre Mí</h4>
            <div className="flex-1 bg-gray-50/80 rounded-3xl p-8 border border-gray-100/80 shadow-inner">
              <p className="text-gray-600 leading-relaxed text-sm font-medium">
                {user.bio ? `"${user.bio}"` : <span className="italic px-2">Este usuario no ha agregado comentarios aún.</span>}
              </p>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all flex-1 text-center shadow-sm"
            >
              Regresar
            </button>
            {!isOwnProfile && user.role === 'MENTOR' && (
              <button 
                onClick={() => setShowMentorshipModal(true)}
                className="px-8 py-4 bg-[#1a3a5a] text-[#ffcc00] rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-[#112740] transition-all flex-[2] text-center border border-transparent hover:border-[#ffcc00]/30"
              >
                Pactar Tutoría
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA PACTAR TUTORÍA */}
      {showMentorshipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3a5a]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-[#1a3a5a] tracking-tighter">Pactar Tutoría</h2>
              <button onClick={() => setShowMentorshipModal(false)} className="text-gray-400 hover:text-red-500 text-3xl font-light">&times;</button>
            </div>

            <form onSubmit={handlePactarTutoria} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Materia Deseada</label>
                <select 
                  required
                  value={mentorshipData.subject_id} 
                  onChange={(e) => setMentorshipData({ ...mentorshipData, subject_id: e.target.value })} 
                  className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a]"
                >
                  <option value="" disabled>Selecciona una materia...</option>
                  {(user.materias || []).map((m, idx) => {
                    const mId = m.id || idx;
                    const mName = m.name || m;
                    return <option key={mId} value={mId}>{mName}</option>;
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha</label>
                  <input type="date" required value={mentorshipData.date} onChange={(e) => setMentorshipData({ ...mentorshipData, date: e.target.value })} className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a]" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Hora</label>
                  <input type="time" required value={mentorshipData.time} onChange={(e) => setMentorshipData({ ...mentorshipData, time: e.target.value })} className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a]" />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Temas a Tratar (Línea por Línea)</label>
                <textarea 
                  required
                  rows="4" 
                  value={mentorshipData.objectives} 
                  onChange={(e) => setMentorshipData({ ...mentorshipData, objectives: e.target.value })} 
                  className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-medium text-gray-600 text-sm resize-none" 
                  placeholder="- Ecuaciones de Newton&#10;- Dinámica y cinemática" 
                />
              </div>

              <button type="submit" className="w-full py-5 bg-[#1a3a5a] text-[#ffcc00] rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-[#1a3a5a]/20 hover:scale-[1.02] transition-all">
                Enviar Solicitud
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN NATIVO (Tailwind) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3a5a]/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-[#1a3a5a] tracking-tighter">Ajustes de Perfil</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 text-3xl font-light">&times;</button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <img
                  src={previewFoto || user.profile_photo_url || '/default-avatar.png'}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md"
                  alt="Previa"
                />
                <div className="flex-1">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Foto de Perfil</label>
                  <input type="file" onChange={handleImageChange} className="text-[10px] file:bg-[#1a3a5a] file:text-white file:border-0 file:px-4 file:py-2 file:rounded-xl file:mr-3 file:font-bold cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Semestre</label>
                  <input type="number" value={editData.current_semester} onChange={(e) => setEditData({ ...editData, current_semester: e.target.value })} className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-bold text-[#1a3a5a]" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado Académico</label>
                  <div className="px-5 py-3 bg-gray-100 rounded-2xl font-bold text-gray-400 text-xs">ACTIVO</div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Biografía</label>
                <textarea rows="3" value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="w-full px-5 py-3 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#ffcc00] outline-none font-medium text-gray-600 text-sm resize-none" placeholder="Describe tu experiencia..." />
              </div>

              {/* SECCIÓN MATERIAS DINÁMICAS (RF#007) */}
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Materias que Impartes</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-3xl border border-gray-100">
                  {allSubjects.map(sub => (
                    <label key={sub.id} className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-transparent hover:border-[#ffcc00] cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        className="rounded text-[#1a3a5a] focus:ring-[#ffcc00] w-4 h-4"
                        checked={editData.materias.includes(sub.id)}
                        onChange={(e) => {
                          const list = e.target.checked
                            ? [...editData.materias, sub.id]
                            : editData.materias.filter(mid => mid !== sub.id);
                          setEditData({ ...editData, materias: list });
                        }}
                      />
                      <span className="text-[10px] font-bold text-[#1a3a5a] uppercase truncate">{sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-[#1a3a5a] text-[#ffcc00] rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:shadow-[#1a3a5a]/20 hover:scale-[1.02] transition-all">
                Actualizar Perfil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default Profile;