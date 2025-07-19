import { useState, useEffect } from 'react';

/**
 * Hook para manejar el tema (claro/oscuro)
 */
export const useTheme = () => {
  // Obtener tema inicial del localStorage o usar 'light' por defecto
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Si no hay tema guardado, usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove('light-theme', 'dark-theme');
    
    // Agregar clase del tema actual
    root.classList.add(`${theme}-theme`);
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    
    // Aplicar atributo data-theme para CSS
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Alternar tema
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Establecer tema específico
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark'
  };
};

export default useTheme;
