import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para la edición (RF#003)
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({ bio: '', current_semester: '', materias: [] });
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);

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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUMNA IZQUIERDA: Identidad e Info (3/12) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#ffcc00]"></div>
            <div className="relative inline-block mt-4">
              <img
                src={user.profile_photo_url || '/default-avatar.png'}
                className="w-36 h-36 rounded-full mx-auto border-4 border-[#ffcc00] object-cover shadow-xl"
                alt="Perfil"
              />
              <button
                onClick={() => setShowModal(true)}
                className="absolute bottom-1 right-1 bg-[#1a3a5a] text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-white"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10z" /></svg>
              </button>
            </div>
            <h2 className="mt-4 font-black text-[#1a3a5a] text-xl leading-tight uppercase tracking-tighter">{user.full_name || `${user.nombre} ${user.apellidos}`}</h2>
            <p className="text-[#1a3a5a] opacity-60 text-[11px] font-bold uppercase tracking-widest mt-1">{user.career || user.carrera}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-gray-400 font-black uppercase text-[9px] tracking-[0.2em] flex items-center">
                <span className="w-1.5 h-4 bg-[#ffcc00] rounded-full mr-2"></span> Materias Impartidas
              </h4>
              <button
                onClick={() => setShowModal(true)}
                className="text-[9px] font-black text-[#1a3a5a] hover:text-[#ffcc00] uppercase tracking-widest transition-colors flex items-center"
              >
                Editar ✏️
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.materias?.length > 0 ? user.materias.map((m, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl text-[10px] font-black border border-blue-50 bg-blue-50/50 text-[#1a3a5a] uppercase">
                  {m.name || m}
                </span>
              )) : <p className="text-gray-400 text-[10px] italic">Sin materias registradas</p>}
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: Gamificación y Logros (6/12) */}
        <div className="lg:col-span-6 space-y-6">

          {/* SECCIÓN LOGROS PROFESIONAL (RF#014) */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h4 className="text-[#1a3a5a] font-black text-2xl tracking-tighter">🏆 Mis Logros</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-1">Nivel de mentoría: Experto</p>
              </div>
              <div className="bg-[#1a3a5a] text-[#ffcc00] px-4 py-1 rounded-full text-[10px] font-black uppercase">
                {user.badges?.length || 0} Insignias
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {user.badges?.length > 0 ? user.badges.map((badge, idx) => (
                <div key={idx} className="group flex flex-col items-center p-6 rounded-3xl bg-gray-50 border border-transparent hover:border-[#ffcc00] hover:bg-white hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    {badge.icon || '🏅'}
                  </div>
                  <p className="text-[10px] font-black text-[#1a3a5a] uppercase tracking-tighter text-center">{badge.name}</p>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Completa tutorías para ganar premios</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h4 className="text-[#1a3a5a] font-black text-xl mb-4 tracking-tighter underline decoration-[#ffcc00] decoration-4 underline-offset-4">Sobre mí</h4>
            <p className="text-gray-600 leading-relaxed text-sm font-medium italic">
              "{user.bio || "Este mentor no ha compartido su biografía aún."}"
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: Estadísticas y Acción (3/12) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#1a3a5a] p-8 rounded-[2.5rem] shadow-2xl text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] opacity-50 mb-4">Puntuación</h4>
            <div className="text-5xl font-black text-[#ffcc00] mb-2 tracking-tighter">{user.score || '0.0'}</div>
            <div className="flex justify-center space-x-1 text-[#ffcc00] text-lg mb-8">
              {[1, 2, 3, 4, 5].map((s) => <span key={s}>{s <= Math.round(user.score) ? '★' : '☆'}</span>)}
            </div>
            <button className="w-full py-4 bg-[#ffcc00] text-[#1a3a5a] rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-all shadow-lg">
              Agendar Sesión
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Semestre</span>
            <span className="text-2xl font-black text-[#1a3a5a]">{user.current_semester || '1'}<span className="text-xs opacity-30">°</span></span>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 mt-6">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Próximas Tutorías</h4>
            <div className="space-y-4">
              {user.tutorias?.length > 0 ? (
                user.tutorias.map((t, idx) => (
                  <div key={idx} className="p-4 border-l-4 border-[#ffcc00] bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-[#1a3a5a]">{t.fecha}</p>
                      <p className="text-[10px] font-black text-[#ffcc00] bg-yellow-50 px-2 py-0.5 rounded-md">{t.hora}</p>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase">{t.materia}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Con: <span className="text-[#1a3a5a] font-bold">{t.estudiante}</span></p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sin sesiones</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

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