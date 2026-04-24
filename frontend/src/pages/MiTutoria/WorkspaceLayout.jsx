import React, { useState } from 'react';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import ChatView from './ChatView';
import RightSidebar from './RightSidebar';
import PlaceholderView from './PlaceholderView';

/**
 * WorkspaceLayout — Contenedor principal del espacio de trabajo
 * Estructura: [LeftSidebar] | [TopBar + MainCanvas] | [RightSidebar?]
 */

const PLACEHOLDER_CONFIGS = {
    repositorio: {
        icon: '📚',
        title: 'Repositorio de Materiales',
        description: 'Aquí encontrarás PDFs, enlaces de GitHub y grabaciones de sesiones compartidas por tu tutor.',
    },
    tablon: {
        icon: '📢',
        title: 'Tablón de Anuncios',
        description: 'Tu mentor publicará notas importantes aquí. "Mañana no hay sesión", fechas de examen, y más.',
    },
    'hoja-de-ruta': {
        icon: '🗓️',
        title: 'Hoja de Ruta',
        description: 'Visualiza el cronograma completo de tus 16 semanas de mentoría con los objetivos de cada sesión.',
    },
    retos: {
        icon: '⚡',
        title: 'Retos y Gamificación',
        description: 'Completa tareas y gana puntos. Las insignias y niveles se desbloquearán aquí pronto.',
    },
};

const WorkspaceLayout = ({ mentorship, currentUser }) => {
    const [activeModule, setActiveModule] = useState('chat');
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const renderMainContent = () => {
        if (activeModule === 'chat') {
            return <ChatView mentorship={mentorship} currentUser={currentUser} />;
        }

        const config = PLACEHOLDER_CONFIGS[activeModule] || {
            icon: '🔧',
            title: 'Sección en construcción',
        };

        return <PlaceholderView icon={config.icon} title={config.title} description={config.description} />;
    };

    return (
        <div className="flex h-full overflow-hidden">
            {/* ===== SIDEBAR IZQUIERDO ===== */}
            <LeftSidebar
                activeModule={activeModule}
                onModuleChange={setActiveModule}
                mentorship={mentorship}
            />

            {/* ===== CONTENIDO PRINCIPAL ===== */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Cabecera dinámica */}
                <TopBar mentorship={mentorship} currentUser={currentUser} />

                {/* Canvas principal — animación al cambiar de módulo */}
                <div
                    key={activeModule}
                    className="flex-1 overflow-hidden relative"
                    style={{ animation: 'fadeSlideIn 0.2s ease-out' }}
                >
                    {renderMainContent()}
                </div>
            </div>

            {/* ===== SIDEBAR DERECHO (colapsable) ===== */}
            <div className="relative flex flex-shrink-0">
                <RightSidebar
                    mentorship={mentorship}
                    currentUser={currentUser}
                    isOpen={isRightSidebarOpen}
                    onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                />
            </div>

            {/* Keyframe de animación para el canvas */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default WorkspaceLayout;
