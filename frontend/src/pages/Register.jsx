import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png'; // Ruta corregida a tus assets

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', confirmPassword: '', role: 'APRENDIZ',
        institution: 'ESPE', career: 'Software', student_id: '', current_semester: 1, bio: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [image, setImage] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    // Cargar materias según el semestre (Lógica de desbloqueo basada en malla ESPE)
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/subjects?semester=${formData.current_semester}`);
                setSubjects(res.data);
            } catch (err) { console.error("Error cargando materias"); }
        };
        fetchSubjects();
    }, [formData.current_semester]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSubject = (id) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const validatePassword = (password) => {
        // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validatePassword(formData.password)) {
            alert("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const formDataPayload = new FormData();

            // Adjuntar datos de texto
            Object.keys(formData).forEach(key => {
                formDataPayload.append(key, formData[key]);
            });

            // Adjuntar materias seleccionadas como JSON string
            formDataPayload.append('selectedSubjects', JSON.stringify(selectedSubjects));

            // Adjuntar archivo (foto de perfil) si existe
            if (image) {
                formDataPayload.append('profile_photo', image);
            }

            // Enviar todo directo al backend (multipart/form-data)
            await axios.post('http://localhost:3000/api/auth/register', formDataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Registro exitoso");
        } catch (err) {
            console.error("Error en registro", err.response?.data || err.message);
            alert("Error en registro: " + (err.response?.data?.error?.message || err.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-t-8 border-pilas-blue">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <img src={logo} alt="Pilas!" className="h-16 mx-auto mb-4" />
                        <h2 className="text-3xl font-extrabold text-pilas-blue">Crea tu Perfil Académico</h2>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input name="full_name" onChange={handleInputChange} type="text" placeholder="Nombre Completo" className="input-style" required />
                            <input name="email" onChange={handleInputChange} type="email" placeholder="Correo Institucional" className="input-style" required />

                            {/* Contraseña con Visualización */}
                            <div className="relative">
                                <input
                                    name="password"
                                    onChange={handleInputChange}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Contraseña"
                                    className="input-style w-full"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>

                            <input
                                name="confirmPassword"
                                onChange={handleInputChange}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirmar Contraseña"
                                className="input-style"
                                required
                            />

                            <input name="student_id" onChange={handleInputChange} type="text" placeholder="ID Estudiante (L00...)" className="input-style" required />

                            <select name="current_semester" onChange={handleInputChange} className="input-style">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}° Semestre</option>)}
                            </select>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil (Cloudinary)</label>
                                <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-pilas-blue hover:file:bg-blue-100" />
                            </div>

                            <textarea name="bio" onChange={handleInputChange} placeholder="Cuéntanos un poco sobre ti (Bio)" className="input-style md:col-span-2 h-24"></textarea>

                            <select name="role" onChange={handleInputChange} className="input-style font-bold text-pilas-blue md:col-span-2">
                                <option value="APRENDIZ">Soy Aprendiz</option>
                                <option value="MENTOR">Soy Mentor</option>
                            </select>
                        </div>

                        {/* Panel de Desbloqueo para Mentores [cite: 162] */}
                        {formData.role === 'MENTOR' && (
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-pilas-blue mb-2 flex items-center">
                                    <span className="mr-2">🔓</span> Materias Desbloqueadas (Hasta nivel {formData.current_semester})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                                    {subjects.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleSubject(s.id)}
                                            className={`cursor-pointer p-3 rounded-lg border-2 transition ${selectedSubjects.includes(s.id) ? 'border-pilas-gold bg-white' : 'border-transparent bg-gray-200/50'}`}
                                        >
                                            <p className="text-xs font-bold text-pilas-blue">{s.code}</p>
                                            <p className="text-sm">{s.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-pilas-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transform transition-all shadow-lg">
                            Finalizar Registro
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;